-- =============================================================
-- 0003_storage.sql
-- Storage Buckets + Policies
-- อ้างอิงเอกสาร 06 (§14) / 07 (§11) / 11 (§4)
-- Public Read ทุก bucket; Upload/Update เฉพาะ admin/editor; Delete เฉพาะ admin
-- =============================================================

insert into storage.buckets (id, name, public)
values
  ('news-covers', 'news-covers', true),
  ('document-files', 'document-files', true),
  ('gallery-images', 'gallery-images', true),
  ('staff-images', 'staff-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- ---------- Public read ----------
drop policy if exists "storage public read" on storage.objects;
create policy "storage public read" on storage.objects
  for select using (
    bucket_id in ('news-covers','document-files','gallery-images','staff-images','site-assets')
  );

-- ---------- Upload (insert) — admin/editor ----------
drop policy if exists "storage upload" on storage.objects;
create policy "storage upload" on storage.objects
  for insert with check (
    bucket_id in ('news-covers','document-files','gallery-images','staff-images','site-assets')
    and public.get_current_user_role() in ('super_admin','admin','editor')
  );

-- ---------- Update — admin/editor ----------
drop policy if exists "storage update" on storage.objects;
create policy "storage update" on storage.objects
  for update using (
    bucket_id in ('news-covers','document-files','gallery-images','staff-images','site-assets')
    and public.get_current_user_role() in ('super_admin','admin','editor')
  );

-- ---------- Delete — admin เท่านั้น ----------
drop policy if exists "storage delete" on storage.objects;
create policy "storage delete" on storage.objects
  for delete using (
    bucket_id in ('news-covers','document-files','gallery-images','staff-images','site-assets')
    and public.get_current_user_role() in ('super_admin','admin')
  );
