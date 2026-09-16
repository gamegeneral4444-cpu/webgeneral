begin;

do $$
begin
  if to_regclass('public.analytics_daily') is null then raise exception 'analytics_daily is missing'; end if;
  if to_regprocedure('public.increment_page_view(text,date)') is null then raise exception 'increment_page_view() is missing'; end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analytics_daily' and policyname = 'analytics admin read') then
    raise exception 'analytics admin read policy is missing';
  end if;
end $$;

rollback;
