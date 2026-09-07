import { Check } from 'lucide-react'

const STEPS = [
  'Fetching page from URL',
  'Parsing HTML structure',
  'Checking missing_title',
  'Checking missing_alt_text',
  'Checking heading_hierarchy',
  'Checking unlabeled_input',
  'Checking vague_link_text',
  'Saving results to database',
]

// Each step takes roughly the same slice of a nominal 6-second scan
const STEP_DURATION_MS = 750

export default function LoadingScreen({ url, elapsed }) {
  // Determine which step we're on based on elapsed time
  const activeIndex = Math.min(
    Math.floor(elapsed / STEP_DURATION_MS),
    STEPS.length - 1
  )

  return (
    <div className="loading-screen">
      <div className="loading-header">
        <p className="loading-label">Scanning</p>
        <p className="loading-url">{url}</p>
      </div>

      <div className="loading-steps">
        {STEPS.map((step, i) => {
          const status = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
          return (
            <div key={step} className={`loading-step ${status}`}>
              <span className="step-indicator">
                {status === 'done'   && <Check className="step-check" size={15} strokeWidth={2.5} />}
                {status === 'active' && <span className="step-spinner" />}
                {status === 'pending'&& <span className="step-dot" />}
              </span>
              <span className="step-text">{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
