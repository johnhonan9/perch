import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setMsg('Account created. You can sign in now (check email if confirmation is on).')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand"><img src="/logo.svg" alt="" /> Perch</div>
      </div>
      <div className="auth-wrap">
        <div className="card auth-card">
          <h1 className="display">{mode === 'signin' ? 'Welcome back' : 'Make your Perch'}</h1>
          <p className="muted" style={{ marginBottom: 18 }}>
            One link for everything you do.
          </p>
          <form onSubmit={submit}>
            {mode === 'signup' && (
              <div className="field">
                <label>Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ada Lovelace" />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" required minLength={6} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn primary" style={{ width: '100%' }} disabled={busy}>
              {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          {msg && <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>{msg}</p>}
          <p className="muted" style={{ marginTop: 16, fontSize: 14 }}>
            {mode === 'signin' ? "No account yet? " : 'Already have one? '}
            <a style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}
               onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg('') }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
