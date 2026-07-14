# JMeter Load Tests

This folder will hold the JMeter test plan and the exported results.

## Files (added as we go)

- `StudyFlow.jmx` — the test plan, with two thread groups:
  - Light load: 10 users, 30s ramp-up.
  - Moderate load: 50 users, 60s ramp-up.
  Each group exercises the API endpoints (login, list courses, create course)
  and the front-end bundle URLs, with a Constant Timer (think time) between
  requests.
- `baseline-light.csv`, `baseline-moderate.csv` — results before optimization.
- `optimized-light.csv`, `optimized-moderate.csv` — results after all four
  optimizations.

## Method

1. Record the baseline against the deployed app (warm the Render service first
   so cold-start time is not counted).
2. Apply the four optimizations (`client/` and `api/`), redeploy.
3. Re-run the identical plan and export the optimized CSVs.
4. Compare average and 95th-percentile response times, requests/second, and
   error rate; calculate percentage improvement per metric.

The three worst bottlenecks identified from the baseline are documented in the
report.
