import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')
  const [token, setToken] = useState('')

  async function call(endpoint) {
    setResult('loading...')
    try {
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult(`error: ${data?.error || res.status}`)
        return
      }
      setResult(JSON.stringify(data, null, 2))
      if (data.token) setToken(data.token)
    } catch (e) {
      setResult('error: ' + e.message)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h1>Auth demo</h1>

      <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => call('signup')}>Sign up</button>
          <button onClick={() => call('login')}>Log in</button>
        </div>

        <div>
          <div><strong>API base:</strong> {API_BASE}</div>
          <div><strong>Token:</strong> <code style={{ wordBreak: 'break-all' }}>{token || '(none)'}</code></div>
        </div>

        <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
{result || 'No result yet.'}
        </pre>
      </div>
    </div>
  )
}
