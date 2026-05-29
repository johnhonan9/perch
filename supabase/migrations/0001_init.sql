-- =====================================================================
-- Perch — initial schema
-- Link-in-bio / micro-landing page builder
-- =====================================================================

-- ---------- PROFILES (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  is_admin    boolean not null default false,
  is_banned   boolean not null default false,
  plan        text not null default 'free',  -- free | pro
  created_at  timestamptz not null default now()
);

-- ---------- PAGES (a published "perch") ----------
create table if not exists public.pages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text not null unique,
  title       text not null default 'My Perch',
  bio         text default '',
  avatar_url  text,
  theme       text not null default 'sunset', -- sunset | midnight | mint | mono
  published   boolean not null default true,
  views       bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists pages_user_idx on public.pages(user_id);

-- ---------- LINKS (buttons on a page) ----------
create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages(id) on delete cascade,
  label       text not null,
  url         text not null,
  icon        text default 'link',
  position    int  not null default 0,
  clicks      bigint not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists links_page_idx on public.links(page_id);

-- ---------- CLICK EVENTS (lightweight analytics) ----------
create table if not exists public.click_events (
  id         bigint generated always as identity primary key,
  link_id    uuid references public.links(id) on delete cascade,
  page_id    uuid references public.pages(id) on delete cascade,
  referer    text,
  created_at timestamptz not null default now()
);
create index if not exists click_page_idx on public.click_events(page_id);

-- =====================================================================
-- updated_at trigger
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists pages_touch on public.pages;
create trigger pages_touch before update on public.pages
for each row execute function public.touch_updated_at();

-- =====================================================================
-- New-user hook: create a profile + a starter page automatically
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_slug text;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          new.raw_user_meta_data->>'avatar_url');

  new_slug := split_part(new.email,'@',1) || '-' || substr(new.id::text,1,4);
  insert into public.pages (user_id, slug, title)
  values (new.id, new_slug, 'My Perch');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================================
-- RPC: increment a click atomically + log event (called from public page)
-- =====================================================================
create or replace function public.register_click(p_link_id uuid, p_referer text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_page uuid;
begin
  update public.links set clicks = clicks + 1 where id = p_link_id returning page_id into v_page;
  insert into public.click_events (link_id, page_id, referer) values (p_link_id, v_page, p_referer);
end; $$;

create or replace function public.register_view(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.pages set views = views + 1 where slug = p_slug;
end; $$;

-- =====================================================================
-- Admin stats RPC (used by admin app)
-- =====================================================================
create or replace function public.admin_stats()
returns json language plpgsql security definer set search_path = public as $$
declare result json;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'not authorized';
  end if;
  select json_build_object(
    'users',  (select count(*) from public.profiles),
    'pages',  (select count(*) from public.pages),
    'links',  (select count(*) from public.links),
    'views',  (select coalesce(sum(views),0) from public.pages),
    'clicks', (select coalesce(sum(clicks),0) from public.links)
  ) into result;
  return result;
end; $$;
