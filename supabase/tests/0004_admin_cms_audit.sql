begin;

do $$
begin
  if to_regprocedure('public.write_audit_log()') is null then
    raise exception 'write_audit_log() is missing';
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_news_changes' and not tgisinternal) then
    raise exception 'audit_news_changes trigger is missing';
  end if;
  if to_regclass('public.idx_audit_logs_created_at') is null then
    raise exception 'idx_audit_logs_created_at is missing';
  end if;
  if to_regprocedure('public.list_audit_summaries(integer,integer,text,text)') is null then
    raise exception 'list_audit_summaries() is missing';
  end if;
  if to_regprocedure('public.reorder_gallery_images(uuid,uuid[])') is null then
    raise exception 'reorder_gallery_images() is missing';
  end if;
end $$;

rollback;
