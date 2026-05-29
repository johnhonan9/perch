# 🚀 Perch — Deployment Guide (free, end to end)

Follow these steps in order. By the end you'll have **three live URLs**:
the homepage, the user app, and the admin console — all on free tiers.

> **Time:** ~30 minutes. **Cost:** $0.

---

## What you'll deploy

| Project | Folder | Host | What it is |
|---|---|---|---|
| Database/Auth | `supabase/` | Supabase | Postgres, auth, storage |
| Homepage | `homepage/` | Vercel | Marketing landing page |
| User app | `user-app/` | Vercel | The product + public `/p/:slug` pages |
| Admin app | `admin-app/` | Vercel | Admin console |

---

## Step 0 — Accounts (all free)
1. **GitHub** → https://github.com (you'll push the code here)
2. **Supabase** → https://supabase.com (sign in with GitHub)
3. **Vercel** → https://vercel.com (sign in with GitHub)

---

## Step 1 — Push to GitHub
From the project root:
```bash
cd perch
git init
git add .
git commit -m "Perch: initial commit"
```
Create an **empty** repo on GitHub called `perch`, then:
```bash
git remote add origin https://github.com/<you>/perch.git
git branch -M main
git push -u origin main
```

> The repo holds all four projects (a monorepo). Vercel lets you deploy each
> subfolder as its own project using the **Root Directory** setting.

---

## Step 2 — Supabase (database first; everything depends on it)
1. Supabase → **New project**. Pick a name + a strong DB password + a region near you.
2. Wait ~2 min for it to provision.
3. Go to **SQL Editor → New query**. Run each file from `supabase/migrations/`
   **in order**, one at a time:
   - `0001_init.sql`
   - `0002_rls.sql`
   - `0003_storage.sql`
4. Go to **Project Settings → Data API** (or **API**) and copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon public key** → this is your `VITE_SUPABASE_ANON_KEY`

   Keep these two values handy — both apps need them.

5. **Auth settings (important):** **Authentication → Sign In / Providers → Email.**
   For fastest testing, turn **"Confirm email" OFF** so you can sign in immediately.
   (Turn it back on for production and configure an email sender.)

---

## Step 3 — Deploy the User app (do this before the homepage)
1. Vercel → **Add New → Project → Import** your `perch` repo.
2. **Root Directory:** click *Edit* → select **`user-app`**.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output `dist` (auto).
4. **Environment Variables** — add both:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. **Deploy.** You'll get a URL like `https://perch-user-app.vercel.app`.
   - This is where users sign up and edit pages.
   - Public pages are at `…/p/<slug>`.

> The included `vercel.json` rewrites all routes to `/` so React Router handles
> `/p/:slug` correctly. No extra config needed.

---

## Step 4 — Deploy the Admin app
1. Vercel → **Add New → Project → Import** the **same** `perch` repo again.
2. **Root Directory:** **`admin-app`**.
3. Add the same two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. **Deploy** → e.g. `https://perch-admin-app.vercel.app`.

### Make yourself an admin
1. First, go to your **user app** URL and **sign up** with your email.
2. Back in Supabase → **SQL Editor**, run:
   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```
3. Now sign in at the **admin app** URL — you'll see the console.

---

## Step 5 — Deploy the Homepage
1. Vercel → **Add New → Project → Import** the same repo.
2. **Root Directory:** **`homepage`**.
3. Framework preset: **Other**. No build step (it's static; `vercel.json` serves `public/`).
4. **Deploy** → e.g. `https://perch-homepage.vercel.app`.

### Point the homepage CTAs at the user app
The homepage buttons need to know your user app URL. Two options:

**Option A (quickest):** edit `homepage/public/index.html`, find this line near the bottom:
```js
var APP = (window.PERCH_APP_URL) || "https://app.perch.example";
```
Replace the fallback URL with your real user-app URL, commit & push:
```bash
git commit -am "point homepage at app" && git push
```
Vercel redeploys automatically.

**Option B:** add a tiny inline script before the existing one to set
`window.PERCH_APP_URL = "https://your-user-app.vercel.app";`

---

## Step 6 — (Optional) Custom domains — still free
Vercel gives free `*.vercel.app` URLs. If you own a domain, add it under each
Vercel project → **Settings → Domains**. A clean setup:
- `perch.com` → homepage
- `app.perch.com` → user app
- `admin.perch.com` → admin app

After adding `app.perch.com`, update the homepage CTA URL (Step 5) to match.

---

## Step 7 — Test the full loop
1. Open the **homepage** → click *Get started* → lands on the user app.
2. **Sign up**, you're dropped into the dashboard with a starter page already created.
3. Edit title/bio, pick a theme, add a couple of links.
4. Click **Copy link** and open it in a new tab → your live `/p/:slug` page.
5. Tap a link → check the dashboard, the **click count** went up.
6. Open the **admin app** (as your admin account) → see total users/pages/clicks,
   and try Ban / Make-admin / Hide-page.

🎉 You're live.

---

## Free-tier notes
- **Supabase free:** 500 MB database, 1 GB file storage, 50k monthly active users,
  unlimited API requests. Pauses after ~1 week of zero activity — just open the
  dashboard to wake it. Plenty for launch and early growth.
- **Vercel Hobby:** free for personal/non-commercial use, generous bandwidth,
  automatic HTTPS, global CDN, auto-deploy on every `git push`.
- **GitHub:** free private/public repos.

## Updating later
Any push to `main` redeploys all three Vercel projects automatically. For DB
changes, add a new numbered file in `supabase/migrations/` and run it in the
SQL Editor.

## Troubleshooting
- **Blank app / "Missing VITE_…":** env vars not set on that Vercel project, or you
  forgot to redeploy after adding them. Re-deploy from the Vercel dashboard.
- **"Not an admin" on admin app:** you didn't run the `update … is_admin = true`
  SQL, or used a different email than you signed up with.
- **Public page 404 / "Nothing here yet":** the page is set to hidden, or the slug
  is wrong. Check **Page visibility** in the dashboard.
- **Can't sign in right after signup:** email confirmation is on — either confirm
  via the email, or turn it off in Supabase Auth settings for testing.
