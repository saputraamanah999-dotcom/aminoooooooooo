-- Admin dashboard helpers for AMINO RESTO BALI.
-- These views keep frontend/admin reporting simple while RLS still protects base tables.

create or replace view public.admin_order_daily_summary as
select
  date_trunc('day', created_at) as day,
  count(*) as total_orders,
  count(*) filter (where status = 'pending') as pending_orders,
  count(*) filter (where status = 'completed') as completed_orders,
  coalesce(sum(total), 0) as revenue,
  coalesce(sum(tax), 0) as tax_collected,
  coalesce(sum(service_fee), 0) as service_collected
from public.orders
group by 1;

create or replace view public.admin_booking_daily_summary as
select
  booking_date as day,
  count(*) as total_bookings,
  count(*) filter (where status = 'pending') as pending_bookings,
  count(*) filter (where status = 'confirmed') as confirmed_bookings,
  count(*) filter (where status = 'cancelled') as cancelled_bookings,
  coalesce(sum(guests), 0) as total_guests
from public.bookings
group by 1;

create or replace view public.public_menu_catalog as
select
  mi.id,
  c.name as category_name,
  mi.name,
  mi.slug,
  mi.description,
  mi.price,
  mi.image_url,
  mi.calories,
  mi.protein,
  mi.fat,
  mi.carbs,
  mi.is_recommended,
  mi.is_best_seller,
  mi.is_new,
  mi.is_vegan,
  mi.is_gluten_free,
  mi.is_spicy,
  mi.rating
from public.menu_items mi
left join public.categories c on c.id = mi.category_id
where mi.is_available = true
  and coalesce(c.is_active, true) = true;

drop function if exists public.admin_dashboard_snapshot();

create or replace function public.admin_dashboard_snapshot()
returns table (
  revenue_today numeric,
  orders_today bigint,
  pending_orders bigint,
  pending_bookings bigint,
  pending_experience_leads bigint,
  average_rating numeric,
  total_customers bigint,
  new_reviews bigint,
  realtime_label text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((select sum(total) from public.orders where created_at::date = current_date), 0) as revenue_today,
    coalesce((select count(*) from public.orders where created_at::date = current_date), 0) as orders_today,
    coalesce((select count(*) from public.orders where status = 'pending'), 0) as pending_orders,
    coalesce((select count(*) from public.bookings where status = 'pending'), 0) as pending_bookings,
    coalesce((select count(*) from public.experience_leads where status in ('proposal','contacted','quoted')), 0) as pending_experience_leads,
    coalesce((select round(avg(rating)::numeric, 2) from public.reviews where is_visible = true), 0) as average_rating,
    coalesce((select count(*) from public.profiles where role = 'customer'), 0) as total_customers,
    coalesce((select count(*) from public.reviews where created_at > now() - interval '7 days'), 0) as new_reviews,
    'realtime-ready'::text as realtime_label
  where public.is_admin();
$$;
