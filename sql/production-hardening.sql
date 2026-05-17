-- AMINO RESTO BALI production hardening helpers.
-- Run after schema.sql, rls-policies.sql, and seed scripts.
-- This file adds indexes, timestamps, audit logs, order number generation,
-- status transition validation, loyalty accounting, search helpers, and
-- operational RPCs that are useful for a real cafe deployment.

create extension if not exists pg_trgm;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_trgm_idx on public.profiles using gin (email gin_trgm_ops);
create index if not exists categories_active_sort_idx on public.categories (is_active, sort_order);
create index if not exists menu_items_category_available_idx on public.menu_items (category_id, is_available);
create index if not exists menu_items_name_trgm_idx on public.menu_items using gin (name gin_trgm_ops);
create index if not exists menu_items_description_trgm_idx on public.menu_items using gin (description gin_trgm_ops);
create index if not exists menu_items_badge_filter_idx on public.menu_items (is_vegan, is_gluten_free, is_spicy, is_new, is_best_seller);
create index if not exists item_variants_menu_idx on public.item_variants (menu_item_id);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_type_created_idx on public.orders (order_type, created_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists orders_manual_decision_idx on public.orders_manual (admin_decision, is_verified);
create index if not exists bookings_date_status_idx on public.bookings (booking_date, status);
create index if not exists reviews_visible_created_idx on public.reviews (is_visible, created_at desc);
create index if not exists reviews_rating_idx on public.reviews (rating);
create index if not exists gallery_category_sort_idx on public.gallery (category, sort_order);
create index if not exists promos_active_dates_idx on public.promos (is_active, valid_from, valid_to);
create index if not exists notifications_status_created_idx on public.notifications (status, created_at desc);
create index if not exists loyalty_user_created_idx on public.loyalty_logs (user_id, created_at desc);
create index if not exists activity_actor_created_idx on public.activity_logs (actor_id, created_at desc);

alter table public.orders add column if not exists order_number text unique;
alter table public.bookings add column if not exists booking_number text unique;
alter table public.orders add column if not exists confirmed_at timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;
alter table public.bookings add column if not exists confirmed_at timestamptz;
alter table public.reviews add column if not exists replied_at timestamptz;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists menu_items_touch_updated_at on public.menu_items;
create trigger menu_items_touch_updated_at
before update on public.menu_items
for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
before update on public.bookings
for each row execute function public.touch_updated_at();

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
before update on public.reviews
for each row execute function public.touch_updated_at();

create or replace function public.next_human_number(prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  today text := to_char(now(), 'YYYYMMDD');
  random_suffix text := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
begin
  return prefix || '-' || today || '-' || random_suffix;
end;
$$;

create or replace function public.prepare_order_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null then
    new.order_number := public.next_human_number('AMN');
  end if;
  if new.email is null and new.user_id is not null then
    select email into new.email from public.profiles where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_prepare_defaults on public.orders;
create trigger orders_prepare_defaults
before insert on public.orders
for each row execute function public.prepare_order_defaults();

create or replace function public.prepare_booking_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.booking_number is null then
    new.booking_number := public.next_human_number('BKG');
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_prepare_defaults on public.bookings;
create trigger bookings_prepare_defaults
before insert on public.bookings
for each row execute function public.prepare_booking_defaults();

create or replace function public.log_activity(
  p_action text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata)
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.validate_order_status_transition()
returns trigger
language plpgsql
as $$
declare
  old_rank integer;
  new_rank integer;
begin
  if old.status = new.status then
    return new;
  end if;
  if new.status = 'cancelled' then
    return new;
  end if;
  old_rank := array_position(array['pending','confirmed','preparing','ready','delivered','completed'], old.status);
  new_rank := array_position(array['pending','confirmed','preparing','ready','delivered','completed'], new.status);
  if old.status = 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened';
  end if;
  if new_rank is null or old_rank is null or new_rank < old_rank then
    raise exception 'Invalid order status transition from % to %', old.status, new.status;
  end if;
  if new.status = 'confirmed' and new.confirmed_at is null then
    new.confirmed_at := now();
  end if;
  if new.status = 'completed' and new.completed_at is null then
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_validate_status on public.orders;
create trigger orders_validate_status
before update of status on public.orders
for each row execute function public.validate_order_status_transition();

create or replace function public.award_loyalty_on_completed_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  points_to_add integer;
begin
  if new.status = 'completed' and old.status <> 'completed' and new.user_id is not null then
    points_to_add := greatest(1, floor(new.total / 10000)::integer);
    update public.profiles
    set loyalty_points = loyalty_points + points_to_add
    where id = new.user_id;
    insert into public.loyalty_logs (user_id, points, reason, order_id)
    values (new.user_id, points_to_add, 'completed_order', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_award_loyalty on public.orders;
create trigger orders_award_loyalty
after update of status on public.orders
for each row execute function public.award_loyalty_on_completed_order();

create or replace function public.search_menu(
  p_query text default '',
  p_category text default null,
  p_vegan boolean default null,
  p_gluten_free boolean default null,
  p_spicy boolean default null,
  p_limit integer default 50
)
returns table (
  id uuid,
  category_name text,
  name text,
  description text,
  price numeric,
  calories integer,
  protein numeric,
  fat numeric,
  carbs numeric,
  is_vegan boolean,
  is_gluten_free boolean,
  is_spicy boolean,
  is_new boolean,
  is_best_seller boolean,
  rating numeric
)
language sql
stable
set search_path = public
as $$
  select
    mi.id,
    c.name as category_name,
    mi.name,
    mi.description,
    mi.price,
    mi.calories,
    mi.protein,
    mi.fat,
    mi.carbs,
    mi.is_vegan,
    mi.is_gluten_free,
    mi.is_spicy,
    mi.is_new,
    mi.is_best_seller,
    mi.rating
  from public.menu_items mi
  left join public.categories c on c.id = mi.category_id
  where mi.is_available = true
    and (p_category is null or c.name = p_category)
    and (p_vegan is null or mi.is_vegan = p_vegan)
    and (p_gluten_free is null or mi.is_gluten_free = p_gluten_free)
    and (p_spicy is null or mi.is_spicy = p_spicy)
    and (
      coalesce(trim(p_query), '') = ''
      or mi.name ilike '%' || p_query || '%'
      or mi.description ilike '%' || p_query || '%'
      or c.name ilike '%' || p_query || '%'
    )
  order by mi.is_best_seller desc, mi.is_recommended desc, mi.name asc
  limit greatest(1, least(p_limit, 100));
$$;

create or replace function public.order_receipt_json(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'order', to_jsonb(o),
    'items', coalesce((select jsonb_agg(to_jsonb(oi)) from public.order_items oi where oi.order_id = o.id), '[]'::jsonb),
    'manual_items', coalesce((select jsonb_agg(to_jsonb(om)) from public.orders_manual om where om.order_id = o.id), '[]'::jsonb),
    'notice', 'PRICES ARE NOT FIXED; Tax 10% + Service 5% apply'
  )
  from public.orders o
  where o.id = p_order_id
    and (o.user_id = auth.uid() or public.is_admin());
$$;

create or replace function public.verify_manual_item(
  p_manual_id uuid,
  p_decision text,
  p_notes text default null
)
returns public.orders_manual
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.orders_manual;
begin
  if not public.is_admin() then
    raise exception 'Only admin can verify manual items';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;
  update public.orders_manual
  set
    admin_decision = p_decision,
    is_verified = p_decision = 'approved',
    notes = coalesce(p_notes, notes),
    verified_by = auth.uid(),
    verified_at = now()
  where id = p_manual_id
  returning * into row_out;
  perform public.log_activity('manual_item_' || p_decision, 'orders_manual', p_manual_id, jsonb_build_object('notes', p_notes));
  return row_out;
end;
$$;

create or replace function public.set_review_reply(
  p_review_id uuid,
  p_reply text,
  p_visible boolean default true,
  p_verified boolean default true
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.reviews;
begin
  if not public.is_admin() then
    raise exception 'Only admin can reply to reviews';
  end if;
  update public.reviews
  set
    admin_reply = p_reply,
    replied_at = now(),
    is_visible = p_visible,
    verified = p_verified,
    updated_at = now()
  where id = p_review_id
  returning * into row_out;
  perform public.log_activity('review_reply', 'reviews', p_review_id, jsonb_build_object('visible', p_visible, 'verified', p_verified));
  return row_out;
end;
$$;

create or replace function public.booking_status_update(
  p_booking_id uuid,
  p_status text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  row_out public.bookings;
begin
  if not public.is_admin() then
    raise exception 'Only admin can update booking status';
  end if;
  if p_status not in ('pending', 'confirmed', 'cancelled', 'completed') then
    raise exception 'Invalid booking status';
  end if;
  update public.bookings
  set
    status = p_status,
    confirmed_at = case when p_status = 'confirmed' and confirmed_at is null then now() else confirmed_at end,
    updated_at = now()
  where id = p_booking_id
  returning * into row_out;
  perform public.log_activity('booking_' || p_status, 'bookings', p_booking_id, '{}'::jsonb);
  return row_out;
end;
$$;

create or replace function public.active_promos()
returns setof public.promos
language sql
stable
set search_path = public
as $$
  select *
  from public.promos
  where is_active = true
    and (valid_from is null or valid_from <= now())
    and (valid_to is null or valid_to >= now())
  order by valid_to nulls last, created_at desc;
$$;

create or replace function public.customer_profile_snapshot(p_user_id uuid default auth.uid())
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'profile', to_jsonb(p),
    'orders_count', (select count(*) from public.orders o where o.user_id = p.id),
    'bookings_count', (select count(*) from public.bookings b where b.user_id = p.id),
    'reviews_count', (select count(*) from public.reviews r where r.user_id = p.id),
    'loyalty_logs', coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at desc) from public.loyalty_logs l where l.user_id = p.id limit 20), '[]'::jsonb)
  )
  from public.profiles p
  where p.id = p_user_id
    and (p.id = auth.uid() or public.is_admin());
$$;
