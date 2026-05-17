-- AMINO RESTO BALI operations pro tables.
-- Optional module for KDS, table map, inventory, staff SOP, and events.

create table if not exists public.restaurant_tables (
  id text primary key,
  zone text not null,
  seats integer not null check (seats > 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'occupied', 'cleaning')),
  current_order uuid references public.orders(id) on delete set null,
  map_x numeric(5,2) default 0,
  map_y numeric(5,2) default 0,
  updated_at timestamptz default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  unit text not null default 'pcs',
  stock numeric(12,2) not null default 0,
  par numeric(12,2) not null default 0,
  supplier text,
  category text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_name text not null,
  role text not null,
  shift_date date not null default current_date,
  starts_at time not null,
  ends_at time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'checked-in', 'checked-out', 'absent')),
  created_at timestamptz default now()
);

create table if not exists public.sop_checklists (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  owner_role text,
  checklist_date date not null default current_date,
  is_done boolean not null default false,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.private_events (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text,
  phone text,
  event_date date not null,
  guests integer not null check (guests > 0),
  package_name text not null,
  notes text,
  status text not null default 'proposal' check (status in ('proposal', 'confirmed', 'deposit-paid', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists restaurant_tables_status_idx on public.restaurant_tables(status, zone);
create index if not exists inventory_items_stock_idx on public.inventory_items(stock, par);
create index if not exists staff_shifts_date_idx on public.staff_shifts(shift_date, status);
create index if not exists sop_checklists_date_idx on public.sop_checklists(checklist_date, is_done);
create index if not exists private_events_date_idx on public.private_events(event_date, status);

alter table public.restaurant_tables enable row level security;
alter table public.inventory_items enable row level security;
alter table public.staff_shifts enable row level security;
alter table public.sop_checklists enable row level security;
alter table public.private_events enable row level security;

create policy "admin restaurant tables" on public.restaurant_tables for all using (public.is_admin()) with check (public.is_admin());
create policy "admin inventory" on public.inventory_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin staff shifts" on public.staff_shifts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin sop" on public.sop_checklists for all using (public.is_admin()) with check (public.is_admin());
create policy "admin private events" on public.private_events for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.low_stock_items()
returns setof public.inventory_items
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.inventory_items
  where stock < par
    and public.is_admin()
  order by (par - stock) desc;
$$;

create or replace function public.ops_daily_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'available_tables', (select count(*) from public.restaurant_tables where status = 'available'),
    'occupied_tables', (select count(*) from public.restaurant_tables where status = 'occupied'),
    'low_stock', (select count(*) from public.inventory_items where stock < par),
    'staff_checked_in', (select count(*) from public.staff_shifts where shift_date = current_date and status = 'checked-in'),
    'sop_done', (select count(*) from public.sop_checklists where checklist_date = current_date and is_done = true),
    'events_next_30_days', (select count(*) from public.private_events where event_date between current_date and current_date + 30)
  )
  where public.is_admin();
$$;
