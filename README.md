# AMINO RESTO BALI — Vanilla SPA + Supabase Ready Backend

AMINO RESTO BALI adalah project website café/resto premium dengan gaya **Natural Luxury Dining**. Project ini dibuat tanpa framework: hanya HTML, CSS, dan JavaScript vanilla, tetapi tetap memiliki fitur modern seperti SPA hash routing, cart, booking, admin dashboard, live location, 3D showroom, PWA/offline mode, portfolio mockup 8 halaman, dan SQL Supabase lengkap.

## Fitur Utama

- Homepage premium café dengan hero, CTA, menu populer, review, opening hours, contact, dan map.
- Menu lengkap dengan kategori, search, filter, price overlay, nutrition, badge diet, quick view, dan add to cart.
- Cart drawer, checkout, manual order item, tax 10%, service 5%, payment method, geolocation address helper, dan WhatsApp order generator.
- Booking table dengan status pending, optional experience package, dan admin workflow.
- Reviews, gallery, profile, login/register, reset password route, and customer history.
- Super Duper Experiences page untuk chef table, wellness brunch, private dinner, catering/event leads, ops timeline, dan proposal capture local/Supabase.
- Admin dashboard untuk menu manager, orders, bookings, customers, gallery, reviews, promos, settings, notifications, location panel, dan print receipt demo.
- Live location center memakai browser geolocation, local history, OpenStreetMap embed, Google Maps directions, dan optional Supabase Realtime.
- CSS-only 3D showroom untuk tampilan portfolio premium tanpa binary images.
- 8 page web designer portfolio mockup: Cover + Moodboard, Auth, Desktop, Mobile, Product, Cart/Booking, Contact/Gallery/Reviews, Admin.
- Notification Center lengkap untuk in-app inbox, browser notification permission, sound alert, unread badge, admin notification log, status/read/archive actions, dan Supabase notifications payload.
- Growth Suite “100000 Juta” untuk CRM segmentation, broadcast notifications, campaign planner, voucher generator, automation playbooks, dan broadcast analytics.
- Finance Suite untuk executive P&L, recipe costing, purchase order, vendor scorecard, cashflow forecast, dan break-even simulation.
- Quality Suite untuk HACCP checklist, allergen matrix, temperature log, incident/CAPA, audit score, dan staff training compliance.
- Concierge Suite untuk omnichannel guest care, SLA ticketing, canned replies, recovery actions, dan conversation timeline.
- Delivery Suite untuk dispatch driver, delivery zone/fee, SLA ETA, handoff checklist, dan proof-of-delivery log.
- Launch Center untuk readiness checklist, integration map, risk register, go-live runbook, contact intake, dan handover export supaya demo lebih lengkap untuk produksi.
- PWA/offline center dengan service worker, manifest, install prompt, cache control, offline queue, export/import local data, dan share helper.
- Operations Pro untuk KDS, table map, loyalty wallet, inventory, private events, staff SOP, dan insights.
- Supabase SQL: schema, RLS, storage policies, seeds, extended menu, realtime location, dashboard views, production hardening, experience lead table, operations pro tables, sample operations.

## Struktur Folder

```text
.
├── index.html
├── manifest.webmanifest
├── sw.js
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── enhancements.js
│   ├── notifications.js
│   ├── growth-suite.js
│   ├── finance-suite.js
│   ├── quality-suite.js
│   ├── concierge-suite.js
│   ├── delivery-suite.js
│   ├── launch-suite.js
│   ├── location-3d.js
│   ├── portfolio-pages.js
│   ├── pwa-offline.js
│   └── ux-designer.js
├── sql/
│   ├── schema.sql
│   ├── rls-policies.sql
│   ├── storage-policies.sql
│   ├── seed-menu.sql
│   ├── seed-extended-menu.sql
│   ├── realtime-location.sql
│   ├── production-hardening.sql
│   ├── operations-pro.sql
│   ├── admin-dashboard-views.sql
│   ├── sample-operations.sql
│   ├── hybrid-auth-migration.sql
│   └── fix-missing-tables.sql
├── supabase/functions/send-order-email/index.js
├── assets/
└── docs/
```

## Cara Menjalankan Lokal

```bash
python3 -m http.server 8000
```

Buka:

```text
http://127.0.0.1:8000/index.html#/home
```

Route portfolio:

```text
http://127.0.0.1:8000/index.html#/portfolio
```

Route PWA/offline:

```text
http://127.0.0.1:8000/index.html#/offline-center
```

## Route Penting

- `#/home` — homepage live site.
- `#/menu` — menu catalog.
- `#/cart` — cart and checkout.
- `#/booking` — booking form.
- `#/experiences` — premium experiences, catering/event proposal capture, and run-of-show timeline.
- `#/notifications` — in-app/browser notification center, preferences, unread/read/archive controls.
- `#/growth-suite` — CRM segments, campaign broadcast, voucher generator, and automation playbooks.
- `#/finance-suite` — P&L, recipe costing, procurement, vendor, and cashflow controls.
- `#/quality-suite` — HACCP checklist, allergen matrix, incident/CAPA, and training compliance.
- `#/concierge-suite` — guest-care tickets, SLA, canned replies, and recovery actions.
- `#/delivery-suite` — delivery dispatch, drivers, zones, handoff, and POD logs.
- `#/contact` — public contact, catering, support, and partnership intake.
- `#/launch-center` — production completeness checklist, integration map, risk register, and handover export.
- `#/admin` — admin shell.
- `#/live-location` — geolocation and delivery tracking.
- `#/3d-showroom` — CSS 3D showroom.
- `#/design-system` — design system.
- `#/portfolio` — 8 page portfolio index.
- `#/offline-center` — PWA/offline/backup.
- `#/kitchen` — Kitchen Display System.
- `#/table-map` — interactive table map.
- `#/loyalty` — customer wallet and promos.
- `#/inventory` — stock and low inventory.
- `#/events-pro` — private event planner.
- `#/staff` — shift board and SOP.
- `#/insights` — review/menu analytics.

## Supabase Setup Singkat

1. Buka Supabase SQL Editor.
2. Jalankan `sql/schema.sql`.
3. Jalankan `sql/rls-policies.sql`.
4. Jalankan `sql/storage-policies.sql`.
5. Jalankan `sql/seed-menu.sql`.
6. Jalankan `sql/seed-extended-menu.sql`.
7. Jalankan `sql/realtime-location.sql`.
8. Jalankan `sql/production-hardening.sql`.
9. Jalankan `sql/admin-dashboard-views.sql`.
10. Jalankan `sql/operations-pro.sql` jika modul KDS/table/inventory/staff dipakai.
11. Jalankan `sql/sample-operations.sql` hanya untuk staging/demo, termasuk contoh contact message dan launch readiness.

## Catatan Penting

- Tidak ada `service_role`, SMTP password, atau token rahasia di frontend.
- Edge Function memakai secrets runtime Supabase untuk SMTP.
- Geolocation browser membutuhkan HTTPS atau localhost.
- Foto/logo asli bisa ditambahkan nanti ke folder `assets/` atau Supabase Storage.
- `#/launch-center` wajib dicek sebelum handover karena merangkum blocker payment, legal, analytics, QA, dan Supabase production readiness.
- Semua placeholder visual saat ini memakai SVG/CSS gradient agar repo tetap ringan.
