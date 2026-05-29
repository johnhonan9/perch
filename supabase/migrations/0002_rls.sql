-- =====================================================================
-- Perch — Row Level Security policies
-- =====================================================================
alter table public.profiles     enable row level security;
alter table public.pages        enable row level security;
alter table public.links        enable row level security;
alter table public.click_events enable row level security;

-- ---------- helper: is current user an admin ----------
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

-- ---------- PROFILES ----------
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- ---------- PAGES ----------
-- public can read PUBLISHED pages (for the live link-in-bio page)
drop policy if exists "pages public read" on public.pages;
create policy "pages public read" on public.pages
  for select using (published = true or auth.uid() = user_id or public.is_admin());

drop policy if exists "pages owner insert" on public.pages;
create policy "pages owner insert" on public.pages
  for insert with check (auth.uid() = user_id);

drop policy if exists "pages owner update" on public.pages;
create policy "pages owner update" on public.pages
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "pages owner delete" on public.pages;
create policy "pages owner delete" on public.pages
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---------- LINKS ----------
drop policy if exists "links public read" on public.links;
create policy "links public read" on public.links
  for select using (
    active = true
    or exists (select 1 from public.pages p where p.id = links.page_id and p.user_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "links owner write" on public.links;
create policy "links owner write" on public.links
  for all using (
    exists (select 1 from public.pages p where p.id = links.page_id and p.user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.pages p where p.id = links.page_id and p.user_id = auth.uid())
    or public.is_admin()
  );

-- ---------- CLICK EVENTS ----------
-- only admins read raw events; inserts happen via SECURITY DEFINER rpc
drop policy if exists "events admin read" on public.click_events;
create policy "events admin read" on public.click_events
  for select using (public.is_admin());
