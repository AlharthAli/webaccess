import { TrendingUp, CheckCircle2, Minus } from 'lucide-react'

const CHECK_LABELS = {
  missing_title:     'missing_title',
  missing_alt_text:  'missing_alt_text',
  heading_hierarchy: 'heading_hierarchy',
  unlabeled_input:   'unlabeled_input',
  vague_link_text:   'vague_link_text',
}

export default function ComparePanel({ data, loading, error }) {
  if (loading) {
    return (
      <div className="panel-body panel-loading">
        <span className="panel-spinner" />
        <span>Comparing scans…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel-body panel-error">
        {error}
      </div>
    )
  }

  if (!data) return null

  // API returns {message} when fewer than 2 scans exist
  if (data.message) {
    return (
      <div className="panel-body panel-notice">
        <Minus size={15} className="panel-notice-icon" />
        {data.message}
      </div>
    )
  }

  const { latest_scan_id, previous_scan_id, newly_introduced, fixed } = data
  const noChanges = newly_introduced.length === 0 && fixed.length === 0

  return (
    <div className="compare-body">
      <div className="compare-meta">
        Comparing <span className="compare-scan-ref">Scan #{previous_scan_id}</span>
        {' '}→{' '}
        <span className="compare-scan-ref">Scan #{latest_scan_id}</span>
      </div>

      {noChanges ? (
        <div className="compare-no-changes">
          <CheckCircle2 size={15} className="compare-no-changes-icon" />
          No changes since last scan — same violations in both runs.
        </div>
      ) : (
        <div className="compare-sections">
          {/* Newly introduced */}
          <div className="compare-section compare-section--red">
            <div className="compare-section-header">
              <TrendingUp size={13} className="compare-section-icon" />
              <span className="compare-section-title">Newly Introduced</span>
              <span className="compare-section-count">{newly_introduced.length}</span>
            </div>
            {newly_introduced.length === 0 ? (
              <p className="compare-section-none">None</p>
            ) : (
              <ul className="compare-type-list">
                {newly_introduced.map(ct => (
                  <li key={ct} className="compare-type-item compare-type-item--red">
                    <span className="compare-type-bullet" aria-hidden="true">▸</span>
                    <span className="compare-type-code">{CHECK_LABELS[ct] || ct}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fixed */}
          <div className="compare-section compare-section--green">
            <div className="compare-section-header">
              <CheckCircle2 size={13} className="compare-section-icon" />
              <span className="compare-section-title">Fixed Since Last Scan</span>
              <span className="compare-section-count">{fixed.length}</span>
            </div>
            {fixed.length === 0 ? (
              <p className="compare-section-none">None</p>
            ) : (
              <ul className="compare-type-list">
                {fixed.map(ct => (
                  <li key={ct} className="compare-type-item compare-type-item--green">
                    <span className="compare-type-bullet" aria-hidden="true">▸</span>
                    <span className="compare-type-code">{CHECK_LABELS[ct] || ct}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
