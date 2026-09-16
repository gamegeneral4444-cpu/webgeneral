create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
begin
  row_id := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_news_status_published_at on public.news(status, published_at desc);
create index if not exists idx_documents_category_created_at on public.documents(category_id, created_at desc);
create index if not exists idx_gallery_images_album_sort on public.gallery_images(album_id, sort_order);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'profiles', 'news', 'news_categories', 'documents', 'document_categories',
    'services', 'service_categories', 'gallery_albums', 'gallery_images', 'staff', 'site_settings'
  ] loop
    execute format('drop trigger if exists audit_%1$s_changes on public.%1$s', target_table);
    execute format(
      'create trigger audit_%1$s_changes after insert or update or delete on public.%1$s '
      'for each row execute function public.write_audit_log()',
      target_table
    );
  end loop;
end $$;

create or replace function public.list_audit_summaries(
  result_limit integer default 50,
  result_offset integer default 0,
  action_filter text default null,
  table_filter text default null
)
returns table (
  id uuid,
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  created_at timestamptz,
  actor_full_name text,
  actor_email text,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_current_user_role() not in ('super_admin', 'admin', 'editor', 'viewer') then
    raise exception 'forbidden';
  end if;

  return query
  select audit.id, audit.user_id, audit.action, audit.table_name, audit.record_id, audit.created_at,
         profile.full_name, profile.email, count(*) over()
  from public.audit_logs audit
  left join public.profiles profile on profile.id = audit.user_id
  where (action_filter is null or audit.action = action_filter)
    and (table_filter is null or audit.table_name = table_filter)
  order by audit.created_at desc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
end;
$$;

revoke all on function public.list_audit_summaries(integer, integer, text, text) from public, anon;
grant execute on function public.list_audit_summaries(integer, integer, text, text) to authenticated;

create or replace function public.reorder_gallery_images(target_album_id uuid, image_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_current_user_role() not in ('super_admin', 'admin', 'editor') then
    raise exception 'forbidden';
  end if;
  if coalesce(array_length(image_ids, 1), 0) <> (
    select count(*) from public.gallery_images where album_id = target_album_id
  ) or coalesce(array_length(image_ids, 1), 0) <> (
    select count(distinct id) from unnest(image_ids) as requested(id)
  ) or exists (
    select 1 from unnest(image_ids) as requested(id)
    where not exists (
      select 1 from public.gallery_images image
      where image.id = requested.id and image.album_id = target_album_id
    )
  ) then
    raise exception 'image set does not match album';
  end if;

  update public.gallery_images image
  set sort_order = (requested.position - 1)::integer
  from unnest(image_ids) with ordinality as requested(id, position)
  where image.id = requested.id and image.album_id = target_album_id;
end;
$$;

revoke all on function public.reorder_gallery_images(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_gallery_images(uuid, uuid[]) to authenticated;
