export default function Preview({ page, links }) {
  const visible = links.filter(l => l.active !== false)
  return (
    <div className={'screen theme-' + page.theme}>
      <img className="pavatar" src={page.avatar_url || '/logo.svg'} alt="" />
      <div className="ptitle">{page.title}</div>
      {page.bio && <div className="pbio">{page.bio}</div>}
      {visible.map(l => (
        <span className="plink" key={l.id}>{l.label || 'Link'}</span>
      ))}
      {visible.length === 0 && <div className="pbio">Your links show up here ✨</div>}
      <div style={{ marginTop: 24, fontSize: 11, opacity: .6 }}>made with Perch 🐦</div>
    </div>
  )
}
