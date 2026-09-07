import { useState } from 'react'
import { EyeOff, Hash, Tag, Link2, FileText, ChevronDown } from 'lucide-react'

const CHECK_META = {
  missing_title:     { label: 'missing_title',     icon: FileText, tip: 'Missing page title'           },
  missing_alt_text:  { label: 'missing_alt_text',  icon: EyeOff,   tip: 'Images without alt text'      },
  heading_hierarchy: { label: 'heading_hierarchy',  icon: Hash,     tip: 'Skipped heading levels'       },
  unlabeled_input:   { label: 'unlabeled_input',   icon: Tag,      tip: 'Inputs without labels'        },
  vague_link_text:   { label: 'vague_link_text',   icon: Link2,    tip: 'Non-descriptive link text'    },
}

// Fallback for any unknown check_type
const fallbackMeta = { label: null, icon: FileText, tip: '' }

export default function ViolationGroup({ checkType, violations }) {
  const [open, setOpen] = useState(true)
  const meta = CHECK_META[checkType] || { ...fallbackMeta, label: checkType }
  const Icon = meta.icon

  return (
    <div className="violation-group">
      <button
        className={`group-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <Icon className="group-icon" size={17} />
        <span className="group-name">{meta.label || checkType}</span>
        <span className="group-count">{violations.length}</span>
        <ChevronDown className={`group-chevron ${open ? 'open' : ''}`} size={15} />
      </button>

      {open && (
        <ul className="violation-list" role="list">
          {violations.map((v, i) => (
            <li key={i} className="violation-item">
              <div className="violation-item-inner">
                <span className="violation-bullet" aria-hidden="true">&#9632;</span>
                <span>{v.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
