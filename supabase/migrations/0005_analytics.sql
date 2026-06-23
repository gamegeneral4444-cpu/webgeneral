create table if not exists public.analytics_daily (
  date date not null,
  path text not null check (path like '/%' and length(path) <= 300),
  page_views bigint not null default 0 check (page_views >= 0),
  updated_at timestamptz not null default now(),
  primary key (date, path)
);

alter table public.analytics_daily enable row level security;

drop policy if exists "analytics admin read" on public.analytics_daily;
create policy "analytics admin read" on public.analytics_daily
  for select using (public.get_current_user_role() in ('super_admin', 'admin', 'editor', 'viewer'));

create or replace function public.increment_page_view(
  page_path text,
  view_date date default (now() at time zone 'Asia/Bangkok')::date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if page_path is null or page_path !~ '^/[A-Za-z0-9/_-]*$' or length(page_path) > 300 then
    raise exception 'invalid analytics path';
  end if;

  insert into public.analytics_daily(date, path, page_views)
  values (view_date, page_path, 1)
  on conflict (date, path) do update
    set page_views = public.analytics_daily.page_views + 1,
        updated_at = now();
end;
$$;

revoke all on function public.increment_page_view(text, date) from public, anon, authenticated;
grant execute on function public.increment_page_view(text, date) to service_role;
