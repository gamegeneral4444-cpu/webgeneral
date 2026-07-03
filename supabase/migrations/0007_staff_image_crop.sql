alter table public.staff
  add column if not exists image_position_x int not null default 50,
  add column if not exists image_position_y int not null default 50,
  add column if not exists image_zoom numeric(4, 2) not null default 1;

do $$
begin
  alter table public.staff
    add constraint staff_image_position_x_range check (image_position_x between 0 and 100);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.staff
    add constraint staff_image_position_y_range check (image_position_y between 0 and 100);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.staff
    add constraint staff_image_zoom_range check (image_zoom between 1 and 2);
exception
  when duplicate_object then null;
end $$;
