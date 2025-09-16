import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('checking...')
  const [base, setBase] = useState(import.meta.env.VITE_API_BASE || 'http://localhost:5000')

  useEffect(() => {
    // Log the API base so you can confirm the env is loaded
    console.log('VITE_API_BASE =', import.meta.env.VITE_API_BASE)

    const url = `${base}/api/health`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        console.log('health =', data)
        setStatus(JSON.stringify(data))
      })
      .catch(err => {
        console.error('health error =', err)
        setStatus('error: ' + err.message)
      })
  }, [base])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h1>SpendSense Client</h1>

      <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <div style={{ marginBottom: 6 }}>
          <strong>API Base:</strong> {base}
        </div>
        <div>
          <strong>Health:</strong> {status}
        </div>
      </div>

      <p style={{ marginTop: 16 }}>Migrating from Next.js to Vite + React Router.</p>

      {/* Optional: quick control to switch base if you change the server port */}
      <div style={{ marginTop: 12 }}>
        <label>
          API base override:{' '}
          <input
            style={{ width: 320 }}
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="http://localhost:5000"
          />
        </label>
      </div>
    </div>
  )
}
