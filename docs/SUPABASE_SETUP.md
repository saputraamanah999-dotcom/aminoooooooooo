# Supabase Setup Guide — AMINO RESTO BALI

## SQL Run Order

Jalankan file SQL dalam urutan berikut:

1. `sql/schema.sql`
2. `sql/rls-policies.sql`
3. `sql/storage-policies.sql`
4. `sql/seed-menu.sql`
5. `sql/seed-extended-menu.sql`
6. `sql/realtime-location.sql`
7. `sql/production-hardening.sql`
8. `sql/admin-dashboard-views.sql`
9. `sql/operations-pro.sql` jika memakai KDS/table/inventory/staff/events.
10. `sql/hybrid-auth-migration.sql` jika butuh Firebase/third-party bridge.
11. `sql/fix-missing-tables.sql` jika upgrade dari versi lama.
12. `sql/sample-operations.sql` hanya staging/demo.

## Auth

Aktifkan Email/Password di Supabase Auth.

Redirect URL:

```text
https://domain-anda.com/auth/callback
http://localhost:8000/auth/callback
```

Frontend memakai:

```js
`${window.location.origin}/auth/callback`
```

## Storage Buckets

Buckets yang dibuat oleh `storage-policies.sql`:

- `menu-images`
- `gallery`
- `avatars`
- `restaurant-assets`

Public read aktif untuk menu/gallery/assets/avatar. Upload dibatasi user login/admin sesuai policy.

## Experience Leads

`sql/schema.sql` membuat `public.experience_leads` untuk proposal chef table, private dinner, dan catering. `sql/rls-policies.sql` mengizinkan user login membuat lead sendiri dan admin mengelola seluruh pipeline. Frontend tetap menyimpan fallback lokal jika Supabase belum aktif.

## Delivery Suite

`sql/schema.sql` membuat `delivery_drivers`, `delivery_zones`, `delivery_jobs`, `delivery_handoff_checks`, dan `delivery_proofs` untuk dispatch, zone fees, handoff checklist, dan proof-of-delivery. Data demo tersedia di `sql/sample-operations.sql`.

## Concierge Suite

`sql/schema.sql` membuat `support_tickets`, `guest_messages`, `canned_responses`, dan `recovery_actions` untuk omnichannel guest care, SLA ticketing, macro replies, dan recovery workflow. Data demo tersedia di `sql/sample-operations.sql`.

## Quality Suite

`sql/schema.sql` membuat `quality_checklists`, `allergen_matrix`, `temperature_logs`, `incident_reports`, dan `training_records` untuk HACCP-style operation, audit, dan compliance. Data demo tersedia di `sql/sample-operations.sql`.

## Finance Suite

`sql/schema.sql` membuat `vendors`, `purchase_orders`, `recipe_cost_cards`, dan `cashflow_forecasts` untuk procurement, costing, dan owner dashboard. Data demo tersedia di `sql/sample-operations.sql`.

## Growth Suite / CRM

`sql/schema.sql` juga membuat `crm_segments`, `marketing_campaigns`, `voucher_codes`, dan `broadcast_logs` untuk segmentasi, campaign, voucher, dan broadcast analytics. Jalankan `sql/sample-operations.sql` di staging untuk data demo Growth Suite.

## Notifications

`sql/schema.sql` membuat table `notifications` dengan channel `email`, `in_app`, `browser`, `whatsapp`, dan `system`; field `title`, `body`, `priority`, `action_url`, `read_at`, serta `archived_at` dipakai oleh Notification Center. Edge Function `send-order-email` juga mencatat payload order/booking/review/experience ke table ini sebelum mengirim email.

## Edge Function Secrets

Jangan simpan secret di frontend. Simpan di Supabase Functions secrets:

```bash
supabase secrets set SMTP_HOST="smtp.example.com"
supabase secrets set SMTP_PORT="587"
supabase secrets set SMTP_USER="user@example.com"
supabase secrets set SMTP_PASS="password"
supabase secrets set SMTP_FROM="AMINO RESTO BALI <user@example.com>"
```

Deploy function:

```bash
supabase functions deploy send-order-email
```

## Realtime Location

Setelah `sql/realtime-location.sql`, aktifkan realtime table:

```sql
alter publication supabase_realtime add table public.customer_locations;
```

Browser geolocation butuh HTTPS atau localhost.

## Admin Role

Setelah user dibuat, set role admin:

```sql
update public.profiles
set role = 'admin'
where email = 'aminoresto@gmail.com';
```

## Production Checklist

- Jalankan semua SQL tanpa error.
- Pastikan RLS enabled di semua table.
- Pastikan admin role sudah benar.
- Pastikan Edge Function secrets sudah tersedia.
- Pastikan email test terkirim dan tercatat di `notifications`.
- Pastikan `#/notifications` dapat mark read/archive dan browser permission sesuai setting browser.
- Pastikan `#/growth-suite` dapat membuat campaign/voucher/broadcast lokal, lalu map ke tabel Growth Suite jika integrasi Supabase dilanjutkan.
- Pastikan `#/finance-suite` dapat membuat PO/cost card lokal dan tabel Finance Suite tersedia untuk integrasi admin Supabase.
- Pastikan `#/quality-suite` dapat membuat incident/temp log lokal dan tabel Quality Suite tersedia untuk compliance Supabase.
- Pastikan `#/concierge-suite` dapat membuat ticket/recovery lokal dan tabel Concierge Suite tersedia untuk integrasi support Supabase.
- Pastikan `#/delivery-suite` dapat membuat delivery/proof lokal dan tabel Delivery Suite tersedia untuk dispatch Supabase.
- Pastikan form `#/experiences` dapat membuat baris `experience_leads` saat user login.
- Pastikan bucket upload berjalan.
- Pastikan `customer_locations` realtime aktif jika delivery tracking dipakai.
