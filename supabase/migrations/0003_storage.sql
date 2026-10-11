-- 0003_storage.sql
insert into storage.buckets (id, name, public) values ('avatars','avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('covers','covers', true) on conflict (id) do nothing;

create policy "Avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cover public read" on storage.objects for select using (bucket_id = 'covers');
create policy "Users can upload own cover" on storage.objects for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own cover" on storage.objects for update using (bucket_id = 'covers' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own cover" on storage.objects for delete using (bucket_id = 'covers' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
