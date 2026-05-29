import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import LinkEditor from '../components/LinkEditor.jsx'
import Preview from '../components/Preview.jsx'

const THEMES = ['sunset', 'midnight', 'mint', 'mono']

export default function Dashboard({ session }) {
  const user = session.user
  const [page, setPage] = useState(null)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1800) }

  const load = useCallback(async () => {
    setLoading(true)
    const { data: pg } = await supabase.from('pages').select('*').eq('user_id', user.id).single()
    setPage(pg)
    if (pg) {
      const { data: lk } = await supabase.from('links').select('*').eq('page_id', pg.id).order('position')
      setLinks(lk || [])
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  async function savePage(patch) {
    const next = { ...page, ...patch }
    setPage(next)
    await supabase.from('pages').update(patch).eq('id', page.id)
  }

  async function saveProfileMeta() {
    await savePage({ title: page.title, bio: page.bio })
    flash('Saved')
  }

  async function addLink() {
    const { data, error } = await supabase.from('links').insert({
      page_id: page.id, label: 'New link', url: 'https://', position: links.length
    }).select().single()
    if (!error) setLinks([...links, data])
  }

  async function updateLink(id, patch) {
    setLinks(links.map(l => l.id === id ? { ...l, ...patch } : l))
    await supabase.from('links').update(patch).eq('id', id)
  }

  async function deleteLink(id) {
    setLinks(links.filter(l => l.id !== id))
    await supabase.from('links').delete().eq('id', id)
  }

  async function move(id, dir) {
    const i = links.findIndex(l => l.id === id)
    const j = i + dir
    if (j < 0 || j >= links.length) return
    const reordered = [...links]
    ;[reordered[i], reordered[j]] = [reordered[j], reordered[i]]
    setLinks(reordered)
    await Promise.all(reordered.map((l, idx) =>
      supabase.from('links').update({ position: idx }).eq('id', l.id)))
  }

  if (loading) return <div className="auth-wrap"><span className="muted">Loading your perch…</span></div>
  if (!page) return <div className="auth-wrap"><span className="muted">No page found.</span></div>

  const liveUrl = `${window.location.origin}/p/${page.slug}`

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand"><img src="/logo.svg" alt="" /> Perch</div>
        <div className="row" style={{ alignItems: 'center' }}>
          <span className="pill">{user.email}</span>
          <button className="btn sm ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 20px 60px' }}>
        <div className="spread" style={{ marginBottom: 18 }}>
          <div>
            <h1 className="display" style={{ fontSize: 28 }}>Your Perch</h1>
            <a className="muted mono" href={liveUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{liveUrl} ↗</a>
          </div>
          <div className="row">
            <button className="btn sm" onClick={() => { navigator.clipboard.writeText(liveUrl); flash('Link copied') }}>Copy link</button>
            <span className={'pill ' + (page.published ? 'live' : '')}>{page.published ? '● Live' : 'Hidden'}</span>
          </div>
        </div>

        <div className="grid-2">
          <div>
            {/* stats */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="stat">
                <div><div className="num">{page.views}</div><div className="muted">Views</div></div>
                <div><div className="num">{links.reduce((s, l) => s + Number(l.clicks), 0)}</div><div className="muted">Clicks</div></div>
                <div><div className="num">{links.length}</div><div className="muted">Links</div></div>
              </div>
            </div>

            {/* profile */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14 }}>Profile</h3>
              <div className="field">
                <label>Title</label>
                <input className="input" value={page.title}
                  onChange={e => setPage({ ...page, title: e.target.value })} onBlur={saveProfileMeta} />
              </div>
              <div className="field">
                <label>Bio</label>
                <textarea className="input" value={page.bio || ''}
                  onChange={e => setPage({ ...page, bio: e.target.value })} onBlur={saveProfileMeta} />
              </div>
              <div className="field">
                <label>Theme</label>
                <div className="row">
                  {THEMES.map(t => (
                    <button key={t}
                      className={'btn sm ' + (page.theme === t ? 'primary' : '')}
                      onClick={() => { savePage({ theme: t }); flash('Theme updated') }}
                      style={{ textTransform: 'capitalize' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="spread" style={{ marginTop: 6 }}>
                <span className="muted" style={{ fontSize: 13 }}>Page visibility</span>
                <button className="btn sm" onClick={() => { savePage({ published: !page.published }); flash(page.published ? 'Hidden' : 'Published') }}>
                  {page.published ? 'Make hidden' : 'Publish'}
                </button>
              </div>
            </div>

            {/* links */}
            <div className="card">
              <div className="spread" style={{ marginBottom: 14 }}>
                <h3>Links</h3>
                <button className="btn sm primary" onClick={addLink}>+ Add link</button>
              </div>
              {links.length === 0 && <div className="empty">No links yet. Add your first one ↑</div>}
              {links.map((l, i) => (
                <LinkEditor key={l.id} link={l} first={i === 0} last={i === links.length - 1}
                  onChange={updateLink} onDelete={deleteLink} onMove={move} />
              ))}
            </div>
          </div>

          {/* live preview */}
          <div className="phone">
            <Preview page={page} links={links} />
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
