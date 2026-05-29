import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminConsole from './pages/AdminConsole.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setProfile(null); setLoading(false); return }
    setLoading(true)
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [session])

  if (loading) return <div className="auth-wrap"><span className="muted">Loading…</span></div>
  if (!session) return <AdminLogin />
  if (!profile?.is_admin)
    return (
      <div className="auth-wrap">
        <div className="card" style={{ textAlign: 'center', maxWidth: 360 }}>
          <h2 className="display">Not an admin</h2>
          <p className="muted">This account doesn’t have admin access.</p>
          <button className="btn" style={{ marginTop: 14 }} onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    )
  return <AdminConsole session={session} />
}
