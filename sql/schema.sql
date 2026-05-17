-- AMINO RESTO BALI Supabase schema. Run in Supabase SQL editor after enabling pgcrypto.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','admin')),
  loyalty_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  calories integer default 0,
  protein numeric(8,2) default 0,
  fat numeric(8,2) default 0,
  carbs numeric(8,2) default 0,
  is_available boolean default true,
  is_recommended boolean default false,
  is_best_seller boolean default false,
  is_new boolean default false,
  is_vegan boolean default false,
  is_gluten_free boolean default false,
  is_spicy boolean default false,
  rating numeric(2,1) default 4.8,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.item_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text,
  email text,
  order_type text not null check (order_type in ('Dine In','Takeaway','Delivery','Online')),
  address text,
  lat numeric(10,7),
  lng numeric(10,7),
  payment_method text not null check (payment_method in ('Cash','QRIS','DANA','GoPay','Kartu')),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','delivered','completed','cancelled')),
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  variant_id uuid references public.item_variants(id) on delete set null,
  item_name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) generated always as (qty * unit_price) stored,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.orders_manual (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  item_name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(12,2) not null,
  notes text,
  is_verified boolean default false,
  admin_decision text check (admin_decision in ('pending','approved','rejected')) default 'pending',
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  booking_date date not null,
  booking_time time not null,
  guests integer not null check (guests > 0),
  experience_package text,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  is_visible boolean default true,
  verified boolean default false,
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.restaurant_settings (
  id integer primary key default 1 check (id = 1),
  restaurant_name text default 'AMINO RESTO BALI',
  tagline text default 'Natural Luxury Dining',
  address text,
  phone text default '+62 823-4188-5469',
  whatsapp_link text default 'https://wa.me/6282341885469',
  gojek_url text,
  grabfood_url text,
  maps_embed text,
  breakfast_hours text default '07.30–15.00',
  lunch_dinner_hours text default '13.00–22.30',
  tax_rate numeric(5,4) default 0.10,
  service_fee_rate numeric(5,4) default 0.05,
  announcement_text text default 'PRICES ARE NOT FIXED; Tax 10% + Service 5% apply',
  is_open boolean default true,
  primary_color text default '#0d7c73',
  logo_url text,
  hero_image_url text,
  qris_image_url text,
  updated_at timestamptz default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  source_type text default 'url' check (source_type in ('upload','url')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  code text unique,
  discount_type text check (discount_type in ('percent','amount')),
  discount_value numeric(12,2) default 0,
  valid_from timestamptz,
  valid_to timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);


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






create table if not exists public.delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle text,
  status text not null default 'available' check (status in ('available','on_route','offline')),
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
  status text not null default 'scheduled' check (status in ('scheduled','assigned','picked_up','on_route','delivered','cancelled')),
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

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  channel text not null,
  topic text not null,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','pending','closed')),
  sla_minutes integer default 45,
  message text not null,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender text not null check (sender in ('guest','staff','system')),
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
  status text not null default 'ready' check (status in ('ready','in_progress','sent','used','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quality_checklists (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null,
  owner text,
  status text not null default 'todo' check (status in ('todo','warning','done')),
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
  status text not null default 'pass' check (status in ('pass','warning')),
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz default now()
);

create table if not exists public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  detail text not null,
  status text not null default 'open' check (status in ('open','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.training_records (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  staff_group text not null,
  completion integer not null default 0 check (completion between 0 and 100),
  expires date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  lead_days integer default 1,
  rating numeric(2,1) default 4.5,
  payment_terms text,
  status text not null default 'active' check (status in ('active','preferred','paused','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null,
  po_number text unique not null,
  category text,
  amount numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','ordered','received','paid','cancelled')),
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
  channel text not null default 'in_app' check (channel in ('email','in_app','browser','whatsapp','system')),
  message text not null,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'draft' check (status in ('draft','scheduled','sent','paused','archived')),
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
  discount_type text not null check (discount_type in ('amount','percent')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  usage_limit integer default 0,
  used_count integer default 0,
  valid_to date,
  status text not null default 'active' check (status in ('active','paused','expired','archived')),
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
  status text not null default 'sent' check (status in ('queued','sent','failed')),
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  channel text not null default 'email' check (channel in ('email','in_app','browser','whatsapp','system')),
  type text not null,
  audience text not null default 'all' check (audience in ('all','admin','customer')),
  target_email text,
  title text,
  subject text,
  body text,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'pending' check (status in ('pending','sent','failed','read','archived')),
  action_url text,
  payload jsonb default '{}'::jsonb,
  read_at timestamptz,
  archived_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.loyalty_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  topic text not null default 'General',
  message text not null,
  status text not null default 'new' check (status in ('new','triaged','replied','closed','spam')),
  assigned_to uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.launch_readiness_items (
  id uuid primary key default gen_random_uuid(),
  item_key text unique not null,
  item_group text not null,
  title text not null,
  description text,
  is_done boolean not null default false,
  owner text,
  due_date date,
  evidence_url text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.launch_notes (
  id uuid primary key default gen_random_uuid(),
  owner text,
  body text not null,
  severity text not null default 'note' check (severity in ('note','decision','risk','blocker')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
