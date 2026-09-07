import { useState } from 'react'
import { EyeOff, Hash, Tag, Link2, FileText, AlertCircle } from 'lucide-react'

const RULES = [
  { code: 'missing_title',     label: 'Page has no <title> tag or it is empty',                icon: FileText },
  { code: 'missing_alt_text',  label: 'Images missing alt text (excludes aria-hidden)',         icon: EyeOff   },
  { code: 'heading_hierarchy', label: 'Heading levels skip a level (e.g. h1 → h3)',             icon: Hash     },
  { code: 'unlabeled_input',   label: 'Form inputs with no <label> or aria-label',              icon: Tag      },
  { code: 'vague_link_text',   label: 'Links with non-descriptive text ("click here", "more")', icon: Link2    },
]

export default function InputScreen({ onScan, loading, serverError }) {
  const [url, setUrl]         = useState('')
  const [localError, setLocalError] = useState('')

  // Clear the local error whenever the user types
  function handleChange(e) {
    setUrl(e.target.value)
    if (localError) setLocalError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) {
      setLocalError('Please enter a URL.')
      return
    }
    let finalUrl = trimmed
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }
    setLocalError('')
    onScan(finalUrl)
  }

  const visibleError = localError || serverError

  return (
    <div className="input-screen">
      <p className="input-screen-eyebrow">WCAG Accessibility Audit</p>
      <h1 className="input-screen-title">Inspect any webpage&rsquo;s accessibility</h1>
      <p className="input-screen-desc">
        Enter a URL to run 5 WCAG-aligned checks and get a structured violation report.
      </p>

      <form className="scan-form" onSubmit={handleSubmit} noValidate>
        <div className={`input-row ${visibleError ? 'has-error' : ''}`}>
          <input
            className="url-input"
            type="url"
            inputMode="url"
            value={url}
            onChange={handleChange}
            placeholder="https://example.com"
            autoFocus
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={loading}
            aria-label="Website URL to scan"
            aria-describedby={visibleError ? 'scan-error' : undefined}
            aria-invalid={!!visibleError}
          />
          <button className="scan-btn" type="submit" disabled={loading}>
            {loading ? 'Scanning…' : 'Scan'}
          </button>
        </div>

        {visibleError && (
          <p className="input-error" id="scan-error" role="alert">
            <AlertCircle size={14} className="input-error-icon" />
            {visibleError}
          </p>
        )}

        <p className="scan-form-hint">Scanning usually takes 3–8 seconds. No account required.</p>
      </form>

      {/* Why this matters */}
      <div className="why-note">
        <p>
          Screen reader users navigate entirely by keyboard — jumping between headings, links, and
          form controls to build a mental map of a page. A skipped heading level breaks that map.
          An unlabeled button is invisible to them. These five checks catch the gaps that make the
          most difference.
        </p>
      </div>

      <div className="rule-legend">
        <div className="rule-legend-header">Checks performed</div>
        <ul className="rule-legend-list">
          {RULES.map(r => {
            const Icon = r.icon
            return (
              <li key={r.code} className="rule-legend-item">
                <Icon className="rule-legend-icon" size={14} aria-hidden="true" />
                <span className="rule-legend-code">{r.code}</span>
                <span className="rule-legend-label">{r.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
