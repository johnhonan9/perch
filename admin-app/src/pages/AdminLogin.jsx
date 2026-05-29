import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    setBusy(false)
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand"><img src="/logo.svg" alt="" /> Perch · Admin</div>
      </div>
      <div className="auth-wrap">
        <div className="card auth-card">
          <h1 className="display">Admin sign in</h1>
          <p className="muted" style={{ marginBottom: 18 }}>Restricted area.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn primary" style={{ width: '100%' }} disabled={busy}>
              {busy ? 'Working…' : 'Sign in'}
            </button>
          </form>
          {msg && <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>{msg}</p>}
        </div>
      </div>
    </div>
  )
}
