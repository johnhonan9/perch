import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [links, setLinks] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    (async () => {
      const { data: pg } = await supabase.from('pages')
        .select('*').eq('slug', slug).eq('published', true).single()
      if (!pg) { setStatus('notfound'); return }
      setPage(pg)
      const { data: lk } = await supabase.from('links')
        .select('*').eq('page_id', pg.id).eq('active', true).order('position')
      setLinks(lk || [])
      setStatus('ok')
      supabase.rpc('register_view', { p_slug: slug })
    })()
  }, [slug])

  async function go(link) {
    supabase.rpc('register_click', { p_link_id: link.id, p_referer: document.referrer || null })
    window.open(link.url, '_blank', 'noopener')
  }

  if (status === 'loading')
    return <div className="auth-wrap"><span className="muted">Loading…</span></div>
  if (status === 'notfound')
    return (
      <div className="auth-wrap">
        <div className="card" style={{ textAlign: 'center', maxWidth: 360 }}>
          <img src="/logo.svg" width="48" alt="" />
          <h2 className="display" style={{ marginTop: 10 }}>Nothing here yet</h2>
          <p className="muted">This perch doesn’t exist or is hidden.</p>
          <a className="btn primary" style={{ marginTop: 14 }} href="/">Make your own →</a>
        </div>
      </div>
    )

  return (
    <div className={'theme-' + page.theme} style={{ minHeight: '100%' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 22px 40px', textAlign: 'center' }}>
        <img src={page.avatar_url || '/logo.svg'} alt=""
          style={{ width: 92, height: 92, borderRadius: '50%', objectFit: 'cover',
                   border: '3px solid rgba(255,255,255,.35)', background: '#222' }} />
        <h1 style={{ marginTop: 14, fontSize: 24, fontWeight: 800 }}>{page.title}</h1>
        {page.bio && <p style={{ opacity: .85, marginTop: 6 }}>{page.bio}</p>}

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {links.map(l => (
            <button key={l.id} onClick={() => go(l)}
              style={{ padding: 16, borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer',
                       border: '1px solid rgba(255,255,255,.18)', color: 'inherit',
                       background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)',
                       transition: 'transform .12s ease' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              {l.label}
            </button>
          ))}
          {links.length === 0 && <p style={{ opacity: .7 }}>No links yet.</p>}
        </div>

        <a href="/" style={{ display: 'inline-block', marginTop: 40, fontSize: 13, opacity: .65 }}>
          🐦 made with Perch — make yours free
        </a>
      </div>
    </div>
  )
}
