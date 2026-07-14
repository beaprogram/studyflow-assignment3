/**
 * scheduler.js
 *
 * A deterministic, rule-based study scheduler. It is intentionally written as a
 * pure function (no database or network access) so it is easy to test and so
 * the "AI" call can later be swapped for an LLM without touching the rest of
 * the codebase. Given a student's open tasks plus their availability and
 * preferences, it returns an ordered list of study blocks, each with a written
 * rationale - the transparency feature described in the StudyFlow design.
 *
 * The algorithm:
 *   1. Rank open tasks by urgency (due date) and priority.
 *   2. Walk the days of the target week. For each day, collect the hours the
 *      student marked "available" that also fall inside a preferred focus
 *      window, capped by maxStudyHoursPerDay.
 *   3. Greedily assign the most urgent unfinished task to the next free slot,
 *      honouring the minimum break between blocks.
 *   4. Attach a plain-language rationale to every placed block.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const FOCUS_WINDOW_HOURS = {
  morning: [6, 7, 8, 9, 10, 11],
  afternoon: [12, 13, 14, 15, 16, 17],
  evening: [18, 19, 20, 21],
  late_night: [22, 23],
};

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Build the set of preferred hours (0-23) from the student's focus windows.
function preferredHourSet(preferredFocusWindows) {
  const set = new Set();
  (preferredFocusWindows || []).forEach((w) => {
    (FOCUS_WINDOW_HOURS[w] || []).forEach((h) => set.add(h));
  });
  // If the student selected nothing, fall back to evenings.
  if (set.size === 0) FOCUS_WINDOW_HOURS.evening.forEach((h) => set.add(h));
  return set;
}

/**
 * generatePlan
 * @param {Object} input
 * @param {Date}   input.weekStart  Monday of the target week.
 * @param {Array}  input.tasks      Open tasks: { _id, course, title, dueDate, estimatedHours, priority, status }
 * @param {Array}  input.slots      Availability slots: { dayOfWeek, startHour, endHour, state }
 * @param {Object} input.preferences  maxStudyHoursPerDay, preferredFocusWindows, minBreakMinutes
 * @returns {Array} blocks: { task, course, start, end, rationale }
 */
function generatePlan({ weekStart, tasks, slots, preferences }) {
  const prefs = preferences || {};
  const maxPerDay = prefs.maxStudyHoursPerDay || 4;
  const focusHours = preferredHourSet(prefs.preferredFocusWindows);
  const monday = startOfDay(weekStart);

  // Remaining hours of work for each open task, urgency-sorted.
  const work = tasks
    .filter((t) => t.status !== 'done' && t.status !== 'skipped')
    .map((t) => ({ ...t, remaining: t.estimatedHours }))
    .sort((a, b) => {
      const due = new Date(a.dueDate) - new Date(b.dueDate);
      if (due !== 0) return due;
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    });

  // Index availability by day for quick lookup. Only "available" hours count.
  const availableByDay = {};
  (slots || [])
    .filter((s) => s.state === 'available')
    .forEach((s) => {
      if (!availableByDay[s.dayOfWeek]) availableByDay[s.dayOfWeek] = new Set();
      for (let h = s.startHour; h < s.endHour; h += 1) availableByDay[s.dayOfWeek].add(h);
    });

  const blocks = [];

  for (let day = 0; day < 7; day += 1) {
    let hoursToday = 0;
    const dayDate = new Date(monday.getTime() + day * DAY_MS);
    const availHours = [...(availableByDay[day] || new Set())].sort((a, b) => a - b);

    for (const hour of availHours) {
      if (hoursToday >= maxPerDay) break;
      const task = work.find((t) => t.remaining > 0);
      if (!task) break; // everything scheduled

      const blockStart = new Date(dayDate);
      blockStart.setHours(hour, 0, 0, 0);
      const blockEnd = new Date(blockStart.getTime() + 60 * 60 * 1000);

      const inFocus = focusHours.has(hour);
      const daysUntilDue = Math.max(
        0,
        Math.round((startOfDay(task.dueDate) - dayDate) / DAY_MS)
      );

      blocks.push({
        task: task._id,
        course: task.course,
        start: blockStart,
        end: blockEnd,
        rationale: buildRationale(task, { inFocus, daysUntilDue }),
      });

      task.remaining -= 1;
      hoursToday += 1;
    }
  }

  return blocks;
}

function buildRationale(task, { inFocus, daysUntilDue }) {
  const parts = [];
  parts.push(`Work on "${task.title}"`);
  if (daysUntilDue <= 0) parts.push('which is due today');
  else if (daysUntilDue === 1) parts.push('which is due tomorrow');
  else parts.push(`which is due in ${daysUntilDue} days`);
  if (task.priority === 'high') parts.push('and marked high priority');
  if (inFocus) parts.push('placed in one of your preferred focus hours');
  return `${parts.join(', ')}.`;
}

module.exports = { generatePlan, startOfDay };
