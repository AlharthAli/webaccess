import { useState } from 'react'
import { CheckCircle2, Globe, Hash, RotateCcw, History, GitCompare } from 'lucide-react'
import ViolationGroup from './ViolationGroup'
import HistoryPanel   from './HistoryPanel'
import ComparePanel   from './ComparePanel'
import { API_BASE }   from '../api'

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

  // ── History panel state ──────────────────────────────────
  const [historyOpen,    setHistoryOpen]    = useState(false)
  const [historyData,    setHistoryData]    = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError,   setHistoryError]   = useState(null)

  async function toggleHistory() {
    if (historyOpen) { setHistoryOpen(false); return }
    setHistoryOpen(true)
    if (historyData !== null) return  // already fetched
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await fetch(`${API_BASE}/scans?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setHistoryData(data)
    } catch (err) {
      setHistoryError(`Could not load history: ${err.message}`)
    } finally {
      setHistoryLoading(false)
    }
  }

  // ── Compare panel state ──────────────────────────────────
  const [compareOpen,    setCompareOpen]    = useState(false)
  const [compareData,    setCompareData]    = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError,   setCompareError]   = useState(null)

  async function toggleCompare() {
    if (compareOpen) { setCompareOpen(false); return }
    setCompareOpen(true)
    if (compareData !== null) return  // already fetched
    setCompareLoading(true)
    setCompareError(null)
    try {
      const res = await fetch(`${API_BASE}/scans/compare?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setCompareData(data)
    } catch (err) {
      setCompareError(`Could not load comparison: ${err.message}`)
    } finally {
      setCompareLoading(false)
    }
  }

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

      {/* ── History & Compare panels ── */}
      <div className="secondary-panels">
        {/* History */}
        <div className="panel">
          <button
            className={`panel-toggle ${historyOpen ? 'open' : ''}`}
            onClick={toggleHistory}
            aria-expanded={historyOpen}
          >
            <History size={15} className="panel-toggle-icon" />
            <span className="panel-toggle-label">Scan History</span>
            <span className="panel-toggle-chevron" aria-hidden="true">
              {historyOpen ? '▲' : '▼'}
            </span>
          </button>
          {historyOpen && (
            <HistoryPanel
              rows={historyData}
              loading={historyLoading}
              error={historyError}
            />
          )}
        </div>

        {/* Compare */}
        <div className="panel">
          <button
            className={`panel-toggle ${compareOpen ? 'open' : ''}`}
            onClick={toggleCompare}
            aria-expanded={compareOpen}
          >
            <GitCompare size={15} className="panel-toggle-icon" />
            <span className="panel-toggle-label">Compare to Last Scan</span>
            <span className="panel-toggle-chevron" aria-hidden="true">
              {compareOpen ? '▲' : '▼'}
            </span>
          </button>
          {compareOpen && (
            <ComparePanel
              data={compareData}
              loading={compareLoading}
              error={compareError}
            />
          )}
        </div>
      </div>

      {/* ── Bottom action ── */}
      <div className="results-actions">
        <button className="new-scan-btn" onClick={onReset}>
          <RotateCcw size={14} />
          Scan another URL
        </button>
      </div>
    </div>
  )
}
