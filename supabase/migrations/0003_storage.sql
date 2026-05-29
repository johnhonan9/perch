-- =====================================================================
-- Perch — storage bucket for avatars (run after migrations)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar owner write" on storage.objects;
create policy "avatar owner write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() = owner);

drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar owner update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid() = owner);
