import { CheckCircle2, Globe, Hash, RotateCcw } from 'lucide-react'
import ViolationGroup from './ViolationGroup'

export default function ResultsView({ result, onReset }) {
  const { scan_id, url, total_violations, violations } = result

  // Group violations by check_type, preserving order of first appearance
  const groups = {}
  for (const v of violations) {
    if (!groups[v.check_type]) groups[v.check_type] = []
    groups[v.check_type].push(v)
  }
  const groupEntries = Object.entries(groups)

  const scannedAt = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="results-view">
      {/* ── Report header card ── */}
      <div className="report-header">
        <div className="report-header-top">
          <div className="report-header-left">
            <span className="report-eyebrow">Accessibility Report</span>
            <span className="report-url">{url}</span>
            <span className="report-scan-id">Scan #{scan_id}</span>
          </div>

          <div className={`violation-badge ${total_violations > 0 ? 'has-violations' : 'no-violations'}`}>
            <span className="violation-badge-count">{total_violations}</span>
            <span className="violation-badge-label">
              {total_violations === 1 ? 'Violation' : 'Violations'}
            </span>
          </div>
        </div>

        <div className="report-meta">
          <div className="report-meta-item">
            <Globe className="report-meta-icon" size={13} />
            <span>5 rules checked</span>
          </div>
          <div className="report-meta-item">
            <Hash className="report-meta-icon" size={13} />
            <span>{groupEntries.length} rule{groupEntries.length !== 1 ? 's' : ''} with violations</span>
          </div>
          <div className="report-meta-item">
            <span>{scannedAt}</span>
          </div>
        </div>
      </div>

      {/* ── Violations or all-passed ── */}
      {total_violations === 0 ? (
        <div className="all-passed">
          <CheckCircle2 className="all-passed-icon" size={40} strokeWidth={1.5} />
          <p className="all-passed-title">No violations found</p>
          <p className="all-passed-desc">
            This page passed all 5 WCAG checks. Scan it again after making changes to track improvements.
          </p>
        </div>
      ) : (
        <>
          <div className="violations-section-header">
            <span className="violations-section-title">Violations by rule</span>
          </div>
          {groupEntries.map(([checkType, items]) => (
            <ViolationGroup key={checkType} checkType={checkType} violations={items} />
          ))}
        </>
      )}

      {/* ── New scan ── */}
      <div className="results-actions">
        <button className="new-scan-btn" onClick={onReset}>
          <RotateCcw size={14} />
          Scan another URL
        </button>
      </div>
    </div>
  )
}
