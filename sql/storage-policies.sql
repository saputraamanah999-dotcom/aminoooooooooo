-- Supabase Storage buckets and policies.
insert into storage.buckets (id, name, public) values
  ('menu-images','menu-images',true),
  ('gallery','gallery',true),
  ('avatars','avatars',true),
  ('restaurant-assets','restaurant-assets',true)
on conflict (id) do update set public = excluded.public;

create policy "public read menu images" on storage.objects for select using (bucket_id in ('menu-images','gallery','restaurant-assets','avatars'));
create policy "admin upload menu gallery assets" on storage.objects for insert with check (bucket_id in ('menu-images','gallery','restaurant-assets') and public.is_admin());
create policy "admin update menu gallery assets" on storage.objects for update using (bucket_id in ('menu-images','gallery','restaurant-assets') and public.is_admin()) with check (bucket_id in ('menu-images','gallery','restaurant-assets') and public.is_admin());
create policy "admin delete menu gallery assets" on storage.objects for delete using (bucket_id in ('menu-images','gallery','restaurant-assets') and public.is_admin());
create policy "users upload own avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update own avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete own avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
