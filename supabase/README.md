# Perch — Supabase

Database, auth, storage and RLS for Perch.

## Apply migrations

**Option A — Dashboard (easiest, no install):**
Open your project → **SQL Editor** → paste each file in order and run:
1. `migrations/0001_init.sql`
2. `migrations/0002_rls.sql`
3. `migrations/0003_storage.sql`

**Option B — Supabase CLI:**
```bash
npm i -g supabase
supabase link --project-ref <your-ref>
supabase db push
```

## Make yourself an admin
After signing up once through the user app, run in SQL Editor:
```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

## Tables
- `profiles` — 1:1 with auth users, holds `is_admin`, `plan`, `is_banned`
- `pages` — one published link-in-bio page per slug
- `links` — buttons on a page
- `click_events` — lightweight analytics

A profile **and** a starter page are auto-created on signup via trigger.
