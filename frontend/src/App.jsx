import { useState, useEffect, useRef } from 'react'
import { ClipboardCheck } from 'lucide-react'
import './App.css'

import InputScreen   from './components/InputScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultsView   from './components/ResultsView'
import { API_BASE }  from './api'

const SCAN_TIMEOUT_MS = 20_000

function humanError(err) {
  if (err.name === 'AbortError') {
    return 'The scan timed out after 20 seconds. The URL may be unreachable, blocking automated requests, or too slow to respond.'
  }
  if (!navigator.onLine) {
    return 'No internet connection detected. Check your network and try again.'
  }
  if (err.message.startsWith('API error 5')) {
    return 'The scanner ran into a problem processing that URL. It may be blocking automated requests, or returning an unusual response.'
  }
  if (err.message.startsWith('API error 4')) {
    return 'The scanner couldn\'t fetch that URL. Double-check the address and try again.'
  }
  return 'Something went wrong. Check that the URL is reachable in a browser, then try again.'
}

export default function App() {
  const [view, setView]         = useState('input')   // 'input' | 'loading' | 'results'
  const [scanUrl, setScanUrl]   = useState('')
  const [result, setResult]     = useState(null)
  const [scanError, setScanError] = useState(null)    // shown back on input screen
  const [elapsed, setElapsed]   = useState(0)
  const timerRef                = useRef(null)

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
    setScanError(null)
    setView('loading')

    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS)

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
        signal:  controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`API error ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
      setView('results')
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Scan failed:', err)
      setScanError(humanError(err))
      setView('input')
    }
  }

  function handleReset() {
    setResult(null)
    setScanUrl('')
    setScanError(null)
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
          <InputScreen onScan={handleScan} loading={false} serverError={scanError} />
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
