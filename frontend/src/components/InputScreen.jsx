import { useState } from 'react'
import { EyeOff, Hash, Tag, Link2, FileText } from 'lucide-react'

const RULES = [
  { code: 'missing_title',     label: 'Page has no <title> tag or it is empty',                icon: FileText },
  { code: 'missing_alt_text',  label: 'Images missing alt text (excludes aria-hidden)',         icon: EyeOff   },
  { code: 'heading_hierarchy', label: 'Heading levels skip a level (e.g. h1 → h3)',             icon: Hash     },
  { code: 'unlabeled_input',   label: 'Form inputs with no <label> or aria-label',              icon: Tag      },
  { code: 'vague_link_text',   label: 'Links with non-descriptive text ("click here", "more")', icon: Link2    },
]

export default function InputScreen({ onScan, loading }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please enter a URL.')
      return
    }
    // Basic URL guard – prepend https:// if no protocol given
    let finalUrl = trimmed
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }
    setError('')
    onScan(finalUrl)
  }

  return (
    <div className="input-screen">
      <p className="input-screen-eyebrow">WCAG Accessibility Audit</p>
      <h1 className="input-screen-title">Inspect any webpage&rsquo;s accessibility</h1>
      <p className="input-screen-desc">
        Enter a URL to run 5 WCAG-aligned checks and get a structured violation report — built for screen reader clarity.
      </p>

      <form className="scan-form" onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            className="url-input"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={loading}
            aria-label="Website URL to scan"
          />
          <button className="scan-btn" type="submit" disabled={loading}>
            {loading ? 'Scanning…' : 'Scan'}
          </button>
        </div>
        {error && <p className="input-error" role="alert">{error}</p>}
        <p className="scan-form-hint">Scanning usually takes 3 – 8 seconds. No account required.</p>
      </form>

      <div className="rule-legend">
        <div className="rule-legend-header">Checks performed</div>
        <ul className="rule-legend-list">
          {RULES.map(r => {
            const Icon = r.icon
            return (
              <li key={r.code} className="rule-legend-item">
                <Icon className="rule-legend-icon" size={14} />
                <span className="rule-legend-code">{r.code}</span>
                <span>{r.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
