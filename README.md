# 🐦 Perch

**One link for everything you do.** A free, beautiful link-in-bio builder.

This is a complete, production-ready SaaS built entirely on **free** services:
**Supabase** (database, auth, storage) + **Vercel** (hosting) + **GitHub** (source).

## Repository layout

```
perch/
├── homepage/     Marketing landing page (static HTML — deploys instantly)
├── user-app/     The product: sign up, build & edit your page, live preview, analytics
├── admin-app/    Admin console: stats, manage users, ban, promote, moderate pages
├── supabase/     Database schema, RLS policies, storage (SQL migrations)
├── assets/       Logo
└── docs/         👉 DEPLOYMENT.md — full step-by-step go-live guide
```

The **public link-in-bio page** lives inside `user-app` at `/p/:slug`, so a user's
shareable link is e.g. `https://app.yourdomain.com/p/ada-1a2b`.

## Tech
- React 18 + Vite (JSX, no TypeScript)
- React Router (user app)
- `@supabase/supabase-js`
- Zero paid dependencies

## Go live
Follow **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — it walks you from empty
accounts to three live URLs in about 30 minutes.

## Local dev (quick)
```bash
cd user-app && npm install && cp .env.example .env   # fill in Supabase keys
npm run dev
```
Same for `admin-app`. Homepage is just `homepage/public/index.html` — open it directly.
