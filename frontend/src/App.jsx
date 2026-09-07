import { useState, useEffect, useRef } from 'react'
import { ClipboardCheck } from 'lucide-react'
import './App.css'

import InputScreen   from './components/InputScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultsView   from './components/ResultsView'

const API_BASE = 'http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com'

export default function App() {
  const [view, setView]       = useState('input')   // 'input' | 'loading' | 'results'
  const [scanUrl, setScanUrl] = useState('')
  const [result, setResult]   = useState(null)
  const [elapsed, setElapsed] = useState(0)         // ms since scan started
  const timerRef              = useRef(null)

  // Tick the elapsed counter while loading
  useEffect(() => {
    if (view === 'loading') {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 100)
      }, 100)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [view])

  async function handleScan(url) {
    setScanUrl(url)
    setView('loading')

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error ${res.status}: ${text}`)
      }

      const data = await res.json()
      setResult(data)
      setView('results')
    } catch (err) {
      console.error('Scan failed:', err)
      alert(`Scan failed: ${err.message}\n\nThe URL may be unreachable, or the API may be temporarily down.`)
      setView('input')
    }
  }

  function handleReset() {
    setResult(null)
    setScanUrl('')
    setView('input')
  }

  return (
    <div className="app">
      {/* Global header */}
      <header className="header" role="banner">
        <div className="header-wordmark">
          <ClipboardCheck className="header-icon" size={20} />
          <span className="header-title">WebAccess</span>
        </div>
        <span className="header-sub">WCAG Accessibility Scanner</span>
      </header>

      {/* Main content */}
      <main className="main" role="main">
        {view === 'input' && (
          <InputScreen onScan={handleScan} loading={false} />
        )}
        {view === 'loading' && (
          <LoadingScreen url={scanUrl} elapsed={elapsed} />
        )}
        {view === 'results' && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
