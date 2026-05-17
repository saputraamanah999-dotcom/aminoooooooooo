-- AMINO RESTO BALI sample operational data for staging only.
-- Do not run in production unless you want demo orders/bookings/reviews.

insert into public.bookings (
  name,
  email,
  phone,
  booking_date,
  booking_time,
  guests,
  notes,
  status
)
values
  (
    'Maya Demo',
    'maya.demo@example.com',
    '+628111111111',
    current_date + 1,
    '18:30',
    4,
    'Outdoor garden table, birthday dessert note.',
    'pending'
  ),
  (
    'Daniel Demo',
    'daniel.demo@example.com',
    '+628222222222',
    current_date + 2,
    '09:00',
    2,
    'Breakfast meeting, quiet corner.',
    'confirmed'
  ),
  (
    'Putri Demo',
    'putri.demo@example.com',
    '+628333333333',
    current_date + 3,
    '20:00',
    6,
    'Vegan-friendly tasting table.',
    'pending'
  );

insert into public.gallery (image_url, caption, category, source_type, sort_order)
values
  ('/assets/gallery/botanical-corner.svg', 'Botanical dining corner', 'interior', 'url', 10),
  ('/assets/gallery/chef-plating.svg', 'Chef plating detail', 'food', 'url', 20),
  ('/assets/gallery/cold-brew.svg', 'Cold brew ritual', 'drink', 'url', 30),
  ('/assets/gallery/garden-dinner.svg', 'Garden dinner ambience', 'interior', 'url', 40),
  ('/assets/gallery/smoothie-bowl.svg', 'Smoothie bowl color palette', 'food', 'url', 50)
on conflict do nothing;

insert into public.reviews (
  name,
  rating,
  body,
  is_visible,
  verified,
  admin_reply
)
values
  (
    'Nadia Demo',
    5,
    'Booking cepat, meja sudah siap, dan lighting dinner-nya sangat cantik.',
    true,
    true,
    'Terima kasih sudah datang ke AMINO, Nadia.'
  ),
  (
    'Daniel Demo',
    5,
    'Menu sehat tapi tetap kaya rasa. Staff bantu rekomendasi GF dengan jelas.',
    true,
    true,
    null
  ),
  (
    'Putri Demo',
    4,
    'Poke bowl segar, jus detox enak. Akan balik untuk breakfast.',
    true,
    false,
    null
  );

insert into public.notifications (
  channel,
  type,
  audience,
  target_email,
  title,
  subject,
  body,
  priority,
  status,
  action_url,
  payload
)
values
  (
    'email',
    'order',
    'admin',
    'aminoresto@gmail.com',
    'New AMINO Order Demo',
    'New AMINO Order Demo',
    'Order demo masuk dan perlu dikonfirmasi admin.',
    'high',
    'sent',
    '#/admin',
    '{"demo": true, "source": "sample-operations.sql"}'::jsonb
  ),
  (
    'in_app',
    'booking',
    'all',
    'aminoresto@gmail.com',
    'New AMINO Booking Demo',
    'New AMINO Booking Demo',
    'Booking demo menunggu konfirmasi.',
    'normal',
    'pending',
    '#/booking',
    '{"demo": true, "source": "sample-operations.sql"}'::jsonb
  ),
  (
    'browser',
    'experience',
    'admin',
    'aminoresto@gmail.com',
    'Experience Lead Demo',
    'Experience Lead Demo',
    'Lead private dining baru butuh follow-up proposal.',
    'urgent',
    'sent',
    '#/notifications',
    '{"demo": true, "source": "sample-operations.sql"}'::jsonb
  );

insert into public.experience_leads (
  name,
  phone,
  package_id,
  package_name,
  event_date,
  guests,
  notes,
  status
)
values
  (
    'Canggu Wellness Studio',
    '+628111000111',
    'sunrise-wellness',
    'Sunrise Wellness Brunch',
    current_date + 10,
    18,
    'Request juice flight, yoga deck, and protein-forward menu.',
    'contacted'
  ),
  (
    'Villa Golden Hour',
    '+628222000222',
    'golden-hour-private',
    'Golden Hour Private Dinner',
    current_date + 14,
    12,
    'Romantic table styling, mocktail pairing, and candle setup.',
    'quoted'
  );

insert into public.crm_segments (slug, name, rule, estimated_size, tone)
values
  ('all-guests', 'All Guests', 'All customers, walk-ins, waitlist, and online checkout profiles.', 428, 'friendly'),
  ('vip-diners', 'VIP Diners', 'Guests with 5+ orders, private dinner leads, or loyalty > 200 points.', 64, 'exclusive'),
  ('healthy-vegan', 'Healthy / Vegan', 'Guests who ordered vegan, GF, detox juice, or wellness brunch.', 118, 'wellness')
on conflict (slug) do update set
  name = excluded.name,
  rule = excluded.rule,
  estimated_size = excluded.estimated_size,
  tone = excluded.tone;

insert into public.marketing_campaigns (segment_id, title, type, channel, message, priority, status)
select
  id,
  'Chef Table Launch',
  'experience',
  'in_app',
  'Limited Botanical Chef Table seats this weekend. Reply to reserve your tasting menu.',
  'urgent',
  'draft'
from public.crm_segments
where slug = 'vip-diners'
on conflict do nothing;

insert into public.voucher_codes (segment_id, code, title, discount_type, discount_value, usage_limit, used_count, valid_to, status)
select
  id,
  'BOTANICALVIP',
  'VIP Chef Table Upgrade',
  'percent',
  12,
  40,
  6,
  current_date + 45,
  'active'
from public.crm_segments
where slug = 'vip-diners'
on conflict (code) do nothing;

insert into public.broadcast_logs (title, channel, sent_count, status, payload)
values
  (
    'Growth Suite Demo Broadcast',
    'in_app',
    428,
    'sent',
    '{"demo": true, "module": "growth-suite"}'::jsonb
  );

insert into public.vendors (name, category, lead_days, rating, payment_terms, status)
values
  ('Bali Organic Farm', 'Produce', 1, 4.9, 'COD', 'preferred'),
  ('Jimbaran Fresh Catch', 'Seafood', 1, 4.8, '7 days', 'preferred'),
  ('Canggu Coffee Roasters', 'Beverage', 2, 4.7, '14 days', 'active')
on conflict do nothing;

insert into public.purchase_orders (po_number, category, amount, status, due_date, payload)
values
  ('PO-DEMO-001', 'Produce', 1850000, 'received', current_date + 1, '{"demo": true}'::jsonb),
  ('PO-DEMO-002', 'Seafood', 2750000, 'ordered', current_date + 2, '{"demo": true}'::jsonb)
on conflict (po_number) do nothing;

insert into public.recipe_cost_cards (menu_name, price, food_cost, labor_cost, packaging_cost, target_margin)
values
  ('Grilled Tuna Sambal Matah', 138000, 45200, 18000, 4500, 0.62),
  ('Botanical Chef Table', 685000, 218000, 76000, 0, 0.64);

insert into public.cashflow_forecasts (period_label, inflow, outflow, payload)
values
  ('W1', 38500000, 24100000, '{"demo": true}'::jsonb),
  ('W2', 42600000, 26800000, '{"demo": true}'::jsonb),
  ('W3', 44800000, 27900000, '{"demo": true}'::jsonb),
  ('W4', 51200000, 31800000, '{"demo": true}'::jsonb);

insert into public.quality_checklists (area, task, owner, status, due_time)
values
  ('Opening', 'Sanitasi prep table, handwash station, dan pest check', 'Supervisor', 'done', '07:00'),
  ('Cold Storage', 'Chiller 0-5°C, freezer -18°C, label FIFO lengkap', 'Kitchen', 'warning', '09:00'),
  ('Service', 'Allergen briefing, QR menu, dan complaint recovery card siap', 'FOH', 'todo', '16:00');

insert into public.allergen_matrix (item_name, gluten, dairy, egg, nuts, seafood, vegan, note)
values
  ('Dragon Fruit Smoothie Bowl', false, false, false, true, false, true, 'Contains granola almond.'),
  ('Grilled Tuna Sambal Matah', false, false, false, false, true, false, 'Seafood handling area.'),
  ('Botanical Chef Table', true, true, true, true, true, false, 'Confirm guest dietary 24h before.');

insert into public.temperature_logs (station, target, reading, status)
values
  ('Chiller A', '0-5°C', 3.2, 'pass'),
  ('Freezer', '≤ -18°C', -19.4, 'pass'),
  ('Hot Holding', '≥ 60°C', 58.8, 'warning');

insert into public.incident_reports (type, severity, detail, status)
values
  ('Guest Recovery', 'low', 'Late dessert plating, resolved with complimentary tea.', 'closed'),
  ('Equipment', 'medium', 'Hot holding dipped below target, batch rechecked and reheated.', 'open');

insert into public.training_records (name, staff_group, completion, expires)
values
  ('Allergen Handling', 'All FOH', 92, current_date + 90),
  ('Fire & Evacuation', 'All Staff', 84, current_date + 120),
  ('Coffee Machine Safety', 'Bar', 78, current_date + 75);

insert into public.support_tickets (guest_name, channel, topic, priority, status, sla_minutes, message)
values
  ('Maya', 'WhatsApp', 'Booking change', 'normal', 'open', 45, 'Can we move tonight booking from 19:00 to 20:00?'),
  ('Daniel', 'Instagram', 'Allergen question', 'high', 'pending', 20, 'Is the smoothie bowl safe for dairy allergy?');

insert into public.canned_responses (title, body)
values
  ('Booking confirmation', 'Terima kasih. Booking Anda sudah kami catat. Kami akan mengirim reminder H-1 via WhatsApp.'),
  ('Allergen check', 'Kami akan konfirmasi ke chef dan memakai equipment terpisah bila memungkinkan. Mohon sebutkan alergi spesifik Anda.'),
  ('Service recovery', 'Mohon maaf atas ketidaknyamanan Anda. Manager kami akan follow up dan menyiapkan recovery voucher.');

insert into public.recovery_actions (action, value, owner, status)
values
  ('Complimentary detox shot', 35000, 'FOH Lead', 'ready'),
  ('Chef allergy callback', 0, 'Chef', 'in_progress');

insert into public.delivery_drivers (name, phone, vehicle, status, rating, active_orders)
values
  ('Made', '+628123001', 'Scooter', 'available', 4.9, 1),
  ('Komang', '+628123002', 'Scooter', 'on_route', 4.8, 2),
  ('Ayu', '+628123003', 'Car', 'available', 4.7, 0);

insert into public.delivery_zones (name, radius_km, base_fee, eta_min, min_order, active)
values
  ('Canggu / Berawa', 5, 18000, 20, 60000, true),
  ('Seminyak', 10, 32000, 38, 120000, true),
  ('Ubud Catering', 35, 185000, 90, 2500000, false)
on conflict (name) do nothing;

insert into public.delivery_handoff_checks (label, done, sort_order)
values
  ('Tamper seal terpasang', true, 10),
  ('Cutlery / napkin sesuai order', true, 20),
  ('Allergen sticker & notes ditempel', false, 30),
  ('Foto paket sebelum keluar', false, 40);

insert into public.contact_messages (name, email, phone, topic, message, status, metadata)
values
  ('Sinta', 'sinta@example.com', '+628111111', 'Catering / private event', 'Butuh proposal wellness brunch 45 pax untuk brand retreat.', 'new', '{"source":"demo-seed"}'::jsonb),
  ('Marco', 'marco@example.com', '+628222222', 'Allergy / dietary request', 'Apakah bisa chef table tanpa gluten dan seafood?', 'triaged', '{"source":"demo-seed"}'::jsonb);

insert into public.launch_readiness_items (item_key, item_group, title, description, is_done, owner)
values
  ('brand', 'Brand', 'Logo, warna, copy, dan identitas restoran approved', 'Final review brand sebelum publish domain utama.', true, 'Brand'),
  ('supabase', 'Backend', 'Supabase schema, RLS, seeds, dan edge function deployed', 'Jalankan SQL dan test anon/admin policy.', false, 'Tech'),
  ('payments', 'Commerce', 'Payment gateway dan refund SOP siap', 'Hubungkan Midtrans/Xendit atau aktifkan bank transfer manual.', false, 'Finance'),
  ('qa', 'QA', 'Mobile, desktop, PWA, dan SQL smoke test selesai', 'Gunakan docs/QA_CHECKLIST.md sebagai bukti handover.', false, 'QA')
on conflict (item_key) do update set
  item_group = excluded.item_group,
  title = excluded.title,
  description = excluded.description,
  is_done = excluded.is_done,
  owner = excluded.owner,
  updated_at = now();

insert into public.launch_notes (owner, body, severity)
values
  ('AMINO Manager', 'Soft launch bisa dimulai setelah payment gateway, legal copy, dan Supabase production project selesai.', 'decision'),
  ('Operations', 'Training kasir, kitchen, runner, dan customer care perlu dijadwalkan sebelum opening weekend.', 'risk');
