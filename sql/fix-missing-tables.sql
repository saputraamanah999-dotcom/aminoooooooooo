-- Compatibility repair script: safe to run after schema.sql to add columns/tables that older installs may miss.
alter table public.orders add column if not exists lat numeric(10,7);
alter table public.orders add column if not exists lng numeric(10,7);
alter table public.orders_manual add column if not exists is_verified boolean default false;
alter table public.reviews add column if not exists admin_reply text;
alter table public.restaurant_settings add column if not exists qris_image_url text;
alter table public.bookings add column if not exists experience_package text;

alter table public.notifications add column if not exists audience text default 'all';
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists priority text default 'normal';
alter table public.notifications add column if not exists action_url text;
alter table public.notifications add column if not exists read_at timestamptz;
alter table public.notifications add column if not exists archived_at timestamptz;

create table if not exists public.experience_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  package_id text not null,
  package_name text not null,
  event_date date,
  guests integer check (guests is null or guests > 0),
  notes text,
  status text not null default 'proposal' check (status in ('proposal','contacted','quoted','won','lost')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table if not exists public.crm_segments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  rule text not null,
  estimated_size integer not null default 0,
  tone text default 'friendly',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid references public.crm_segments(id) on delete set null,
  title text not null,
  type text not null default 'promo',
  channel text not null default 'in_app',
  message text not null,
  priority text not null default 'normal',
  status text not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.voucher_codes (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid references public.crm_segments(id) on delete set null,
  code text unique not null,
  title text not null,
  discount_type text not null,
  discount_value numeric(12,2) not null default 0,
  usage_limit integer default 0,
  used_count integer default 0,
  valid_to date,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.broadcast_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  voucher_id uuid references public.voucher_codes(id) on delete set null,
  segment_id uuid references public.crm_segments(id) on delete set null,
  title text not null,
  channel text not null,
  sent_count integer not null default 0,
  status text not null default 'sent',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);


create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  lead_days integer default 1,
  rating numeric(2,1) default 4.5,
  payment_terms text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null,
  po_number text unique not null,
  category text,
  amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  due_date date,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recipe_cost_cards (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references public.menu_items(id) on delete set null,
  menu_name text not null,
  price numeric(12,2) not null default 0,
  food_cost numeric(12,2) not null default 0,
  labor_cost numeric(12,2) not null default 0,
  packaging_cost numeric(12,2) not null default 0,
  target_margin numeric(5,4) not null default 0.60,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.cashflow_forecasts (
  id uuid primary key default gen_random_uuid(),
  period_label text not null,
  inflow numeric(12,2) not null default 0,
  outflow numeric(12,2) not null default 0,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);


create table if not exists public.quality_checklists (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null,
  owner text,
  status text not null default 'todo',
  due_time time,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.allergen_matrix (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  gluten boolean default false,
  dairy boolean default false,
  egg boolean default false,
  nuts boolean default false,
  seafood boolean default false,
  vegan boolean default false,
  note text,
  updated_at timestamptz default now()
);

create table if not exists public.temperature_logs (
  id uuid primary key default gen_random_uuid(),
  station text not null,
  target text not null,
  reading numeric(8,2) not null,
  status text not null default 'pass',
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz default now()
);

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'low',
  detail text not null,
  status text not null default 'open',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.training_records (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  staff_group text not null,
  completion integer not null default 0,
  expires date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  channel text not null,
  topic text not null,
  priority text not null default 'normal',
  status text not null default 'open',
  sla_minutes integer default 45,
  message text not null,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender text not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.canned_responses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recovery_actions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete set null,
  action text not null,
  value numeric(12,2) not null default 0,
  owner text,
  status text not null default 'ready',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create table if not exists public.delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle text,
  status text not null default 'available',
  rating numeric(2,1) default 4.5,
  active_orders integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  radius_km numeric(8,2) not null default 5,
  base_fee numeric(12,2) not null default 0,
  eta_min integer not null default 20,
  min_order numeric(12,2) not null default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  driver_id uuid references public.delivery_drivers(id) on delete set null,
  zone_id uuid references public.delivery_zones(id) on delete set null,
  external_ref text,
  customer_name text not null,
  phone text,
  address text not null,
  status text not null default 'scheduled',
  eta_min integer default 25,
  fee numeric(12,2) default 0,
  created_at timestamptz default now(),
  delivered_at timestamptz
);

create table if not exists public.delivery_handoff_checks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  done boolean default false,
  sort_order integer default 0,
  updated_at timestamptz default now()
);

create table if not exists public.delivery_proofs (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references public.delivery_jobs(id) on delete cascade,
  type text not null,
  note text,
  file_url text,
  created_at timestamptz default now()
);
