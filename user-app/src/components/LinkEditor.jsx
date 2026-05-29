import { useState } from 'react'

export default function LinkEditor({ link, first, last, onChange, onDelete, onMove }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="link-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="row" style={{ alignItems: 'center' }}>
        <div className="grow">
          <div className="lbl">{link.label || 'Untitled'}</div>
          <div className="url">{link.url}</div>
        </div>
        <span className="pill">{link.clicks} clicks</span>
        <button className="btn sm ghost" onClick={() => onMove(link.id, -1)} disabled={first}>↑</button>
        <button className="btn sm ghost" onClick={() => onMove(link.id, 1)} disabled={last}>↓</button>
        <button className="btn sm" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Edit'}</button>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div className="field">
            <label>Label</label>
            <input className="input" value={link.label}
              onChange={e => onChange(link.id, { label: e.target.value })} />
          </div>
          <div className="field">
            <label>URL</label>
            <input className="input" value={link.url}
              onChange={e => onChange(link.id, { url: e.target.value })} placeholder="https://" />
          </div>
          <div className="spread">
            <label className="muted" style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={link.active}
                onChange={e => onChange(link.id, { active: e.target.checked })} />
              Visible
            </label>
            <button className="btn sm danger" onClick={() => onDelete(link.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
