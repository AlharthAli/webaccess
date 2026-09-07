import { Clock } from 'lucide-react'

// Each row from GET /scans is a tuple: [id, url, scanned_at]
function formatDate(raw) {
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function HistoryPanel({ rows, loading, error }) {
  if (loading) {
    return (
      <div className="panel-body panel-loading">
        <span className="panel-spinner" />
        <span>Loading history…</span>
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

  if (!rows || rows.length === 0) {
    return (
      <div className="panel-body panel-empty">
        No scan history found for this URL.
      </div>
    )
  }

  return (
    <ul className="history-list" role="list">
      {rows.map((row, i) => {
        const [id, , scannedAt] = row
        const isLatest = i === 0
        return (
          <li key={id} className="history-item">
            <Clock className="history-item-icon" size={13} />
            <span className="history-item-id">
              Scan #{id}
              {isLatest && <span className="history-latest-badge">latest</span>}
            </span>
            <span className="history-item-date">{formatDate(scannedAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}
