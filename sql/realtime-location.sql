-- AMINO RESTO BALI realtime geolocation support.
-- Run after schema.sql and rls-policies.sql.
-- Enable Supabase Realtime for public.customer_locations in the Dashboard
-- or with: alter publication supabase_realtime add table public.customer_locations;

create table if not exists public.customer_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  accuracy numeric(10,2),
  heading numeric(10,2),
  speed numeric(10,2),
  source text not null default 'browser_geolocation',
  is_sharing boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists customer_locations_user_idx on public.customer_locations (user_id);
create index if not exists customer_locations_order_idx on public.customer_locations (order_id);
create index if not exists customer_locations_last_seen_idx on public.customer_locations (last_seen_at desc);
create index if not exists customer_locations_lat_lng_idx on public.customer_locations (lat, lng);

alter table public.customer_locations enable row level security;

drop policy if exists "locations owner admin read" on public.customer_locations;
create policy "locations owner admin read"
on public.customer_locations
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "locations owner upsert" on public.customer_locations;
create policy "locations owner upsert"
on public.customer_locations
for insert
with check (user_id = auth.uid());

drop policy if exists "locations owner update" on public.customer_locations;
create policy "locations owner update"
on public.customer_locations
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "locations owner delete" on public.customer_locations;
create policy "locations owner delete"
on public.customer_locations
for delete
using (user_id = auth.uid() or public.is_admin());

create or replace function public.customer_locations_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.last_seen_at is null then
    new.last_seen_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists customer_locations_touch on public.customer_locations;
create trigger customer_locations_touch
before update on public.customer_locations
for each row execute function public.customer_locations_touch_updated_at();

create or replace function public.stop_location_sharing()
returns void
language sql
security definer
set search_path = public
as $$
  update public.customer_locations
  set is_sharing = false,
      updated_at = now()
  where user_id = auth.uid();
$$;

create or replace function public.latest_customer_locations()
returns table (
  user_id uuid,
  full_name text,
  email text,
  order_id uuid,
  lat numeric,
  lng numeric,
  accuracy numeric,
  heading numeric,
  speed numeric,
  is_sharing boolean,
  last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cl.user_id,
    p.full_name,
    p.email,
    cl.order_id,
    cl.lat,
    cl.lng,
    cl.accuracy,
    cl.heading,
    cl.speed,
    cl.is_sharing,
    cl.last_seen_at
  from public.customer_locations cl
  left join public.profiles p on p.id = cl.user_id
  where public.is_admin()
  order by cl.last_seen_at desc;
$$;
