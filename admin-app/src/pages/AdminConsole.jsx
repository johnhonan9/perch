import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminConsole({ session }) {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pages, setPages] = useState([])
  const [tab, setTab] = useState('users')
  const [toast, setToast] = useState('')

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1800) }

  async function load() {
    const { data: s } = await supabase.rpc('admin_stats')
    setStats(s)
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(u || [])
    const { data: p } = await supabase.from('pages')
      .select('id,slug,title,published,views,user_id').order('views', { ascending: false }).limit(100)
    setPages(p || [])
  }

  useEffect(() => { load() }, [])

  async function toggleBan(u) {
    await supabase.from('profiles').update({ is_banned: !u.is_banned }).eq('id', u.id)
    setUsers(users.map(x => x.id === u.id ? { ...x, is_banned: !u.is_banned } : x))
    flash(u.is_banned ? 'Unbanned' : 'Banned')
  }

  async function toggleAdmin(u) {
    await supabase.from('profiles').update({ is_admin: !u.is_admin }).eq('id', u.id)
    setUsers(users.map(x => x.id === u.id ? { ...x, is_admin: !u.is_admin } : x))
    flash('Updated role')
  }

  async function togglePublish(p) {
    await supabase.from('pages').update({ published: !p.published }).eq('id', p.id)
    setPages(pages.map(x => x.id === p.id ? { ...x, published: !p.published } : x))
    flash('Updated page')
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand"><img src="/logo.svg" alt="" /> Perch · Admin</div>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="pill">{session.user.email}</span>
          <button className="btn sm ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 20px 60px' }}>
        <h1 className="display" style={{ fontSize: 28, marginBottom: 18 }}>Console</h1>

        <div className="stat-grid">
          <Stat n={stats?.users} l="Users" />
          <Stat n={stats?.pages} l="Pages" />
          <Stat n={stats?.links} l="Links" />
          <Stat n={stats?.views} l="Total views" />
          <Stat n={stats?.clicks} l="Total clicks" />
        </div>

        <div className="row" style={{ marginBottom: 14 }}>
          <button className={'btn sm ' + (tab === 'users' ? 'primary' : '')} onClick={() => setTab('users')}>Users</button>
          <button className={'btn sm ' + (tab === 'pages' ? 'primary' : '')} onClick={() => setTab('pages')}>Pages</button>
        </div>

        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          {tab === 'users' ? (
            <table className="table">
              <thead><tr><th>Email</th><th>Name</th><th>Plan</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.full_name}</td>
                    <td><span className="pill">{u.plan}</span></td>
                    <td>{u.is_admin ? <span className="pill live">admin</span> : <span className="pill">user</span>}</td>
                    <td>{u.is_banned ? <span className="pill danger">banned</span> : <span className="pill live">active</span>}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn sm ghost" onClick={() => toggleAdmin(u)}>{u.is_admin ? 'Demote' : 'Make admin'}</button>{' '}
                      <button className="btn sm danger" onClick={() => toggleBan(u)}>{u.is_banned ? 'Unban' : 'Ban'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead><tr><th>Slug</th><th>Title</th><th>Views</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id}>
                    <td className="mono">/{p.slug}</td>
                    <td>{p.title}</td>
                    <td>{p.views}</td>
                    <td>{p.published ? <span className="pill live">live</span> : <span className="pill">hidden</span>}</td>
                    <td><button className="btn sm ghost" onClick={() => togglePublish(p)}>{p.published ? 'Hide' : 'Publish'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Stat({ n, l }) {
  return <div className="stat-card"><div className="n">{n ?? '—'}</div><div className="l">{l}</div></div>
}
