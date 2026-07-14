import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { createCourse, ApiError } from '../api.js'

const EMPTY = {
  code: '',
  title: '',
  instructorName: '',
  creditHours: 3,
  colour: '#4338ca',
  term: '',
}

export default function CreateCourse() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSaving(true)

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      creditHours: Number(form.creditHours),
      colour: form.colour,
    }
    if (form.instructorName.trim()) payload.instructorName = form.instructorName.trim()
    if (form.term.trim()) payload.term = form.term.trim()

    try {
      await createCourse(token, payload)
      navigate('/courses')
    } catch (err) {
      if (err instanceof ApiError && err.details.length) {
        const map = {}
        for (const d of err.details) map[d.field] = d.message
        setFieldErrors(map)
      }
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel panel--narrow">
      <div className="panel__head">
        <div>
          <p className="eyebrow">Add to workspace</p>
          <h1 className="panel__title">New course</h1>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Course code</span>
          <input
            className="field__input"
            value={form.code}
            onChange={(e) => update('code', e.target.value)}
            placeholder="e.g. CSCI 5709"
            required
          />
          {fieldErrors.code && <span className="field__error">{fieldErrors.code}</span>}
        </label>

        <label className="field">
          <span className="field__label">Title</span>
          <input
            className="field__input"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Advanced Web Services"
            required
          />
          {fieldErrors.title && <span className="field__error">{fieldErrors.title}</span>}
        </label>

        <label className="field">
          <span className="field__label">Instructor (optional)</span>
          <input
            className="field__input"
            value={form.instructorName}
            onChange={(e) => update('instructorName', e.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Credit hours</span>
            <input
              className="field__input"
              type="number"
              min="0"
              max="12"
              value={form.creditHours}
              onChange={(e) => update('creditHours', e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Term (optional)</span>
            <input
              className="field__input"
              value={form.term}
              onChange={(e) => update('term', e.target.value)}
              placeholder="e.g. Fall 2026"
            />
          </label>

          <label className="field field--colour">
            <span className="field__label">Colour</span>
            <input
              className="field__colour"
              type="color"
              value={form.colour}
              onChange={(e) => update('colour', e.target.value)}
            />
          </label>
        </div>

        {error && <p className="notice notice--error">{error}</p>}

        <div className="form__actions">
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/courses')}>
            Cancel
          </button>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create course'}
          </button>
        </div>
      </form>
    </section>
  )
}
