# QA Checklist — AMINO RESTO BALI

Gunakan checklist ini sebelum deploy/staging demo.

## Frontend Smoke Test

- [ ] Buka `#/home`, hero tampil dan CTA berfungsi.
- [ ] Buka `#/menu`, search menu bekerja.
- [ ] Klik `Quick View`, modal detail muncul.
- [ ] Klik `Add to Cart`, badge cart bertambah.
- [ ] Buka drawer cart, qty bisa tambah/kurang/hapus.
- [ ] Buka `#/cart`, manual order bisa ditambah.
- [ ] Checkout tanpa login diarahkan ke login.
- [ ] Login demo berhasil menyimpan profile localStorage.
- [ ] Checkout setelah login membuat order pending.
- [ ] WhatsApp order membuka `wa.me` dengan teks encoded.
- [ ] Booking form menyimpan booking pending.
- [ ] Booking form dapat memilih optional experience package.
- [ ] `#/experiences` menampilkan paket premium, ops timeline, dan live pipeline.
- [ ] Form proposal experience menyimpan lead lokal/Supabase fallback.
- [ ] Admin tab Experience Leads menampilkan lead proposal.
- [ ] `#/notifications` menampilkan inbox, unread badge, filter, test notification, read/archive action.
- [ ] Browser notification permission button tidak error dan test notification masuk log.
- [ ] Admin Notifications Log menampilkan status/read/archive action.
- [ ] `#/growth-suite` menampilkan CRM metrics, campaign cards, voucher wallet, dan automation playbooks.
- [ ] Growth broadcast form membuat log dan notifikasi baru.
- [ ] Voucher generator membuat voucher dan tombol Broadcast Voucher mengirim notifikasi.
- [ ] `#/finance-suite` menampilkan P&L metrics, recipe costing board, PO board, cashflow, dan vendor cards.
- [ ] Finance PO form membuat PO dan status action mengirim notifikasi admin.
- [ ] Finance Recipe Costing form menambah cost card dan margin signal.
- [ ] `#/quality-suite` menampilkan audit score, HACCP checklist, allergen matrix, temperature board, incident log, dan training cards.
- [ ] Quality incident form dan temperature form menyimpan data serta notifikasi admin.
- [ ] Quality checklist/temp/incident action mengubah status tanpa reload.
- [ ] `#/concierge-suite` menampilkan active tickets, SLA breach, message timeline, recovery log, dan canned replies.
- [ ] Concierge ticket/recovery form menyimpan data dan membuat notifikasi admin.
- [ ] Concierge status action dan copy macro berjalan tanpa reload.
- [ ] `#/delivery-suite` menampilkan dispatch board, driver cards, zone cards, handoff checklist, dan proof log.
- [ ] Delivery/proof form menyimpan data dan status action mengirim notifikasi admin.
- [ ] Driver/zone/handoff toggle berjalan tanpa reload.
- [ ] Review form menambah review visible.
- [ ] Gallery lightbox terbuka.
- [ ] Profile save menyimpan data user.

## Portfolio 8 Halaman

- [ ] `#/portfolio` menampilkan 8 kartu halaman.
- [ ] `#/cover-moodboard` menampilkan palette, typography, blueprint.
- [ ] `#/auth-customer` login/register demo bekerja.
- [ ] `#/home-desktop` desktop browser mockup tampil.
- [ ] `#/home-mobile` phone mockup tampil dan add cart bekerja.
- [ ] `#/menu-product` search, select product, variant, notes, add to cart bekerja.
- [ ] `#/cart-booking` booking draft tersimpan.
- [ ] `#/contact-gallery-reviews` message draft tersimpan.
- [ ] `#/admin-dashboard-pro` metric dan chart tampil.

## Admin Test

- [ ] Login dengan `aminoresto@gmail.com` untuk role admin demo.
- [ ] Dashboard metric tampil.
- [ ] Menu Manager tambah menu demo.
- [ ] Duplicate menu bekerja.
- [ ] Disable/enable menu bekerja.
- [ ] Orders status update bekerja.
- [ ] Print receipt membuka popup.
- [ ] Booking confirm/cancel/complete bekerja.
- [ ] Customer role toggle bekerja.
- [ ] Gallery add/delete bekerja.
- [ ] Review visible/verify/reply bekerja.
- [ ] Promo add/toggle bekerja.
- [ ] Settings save localStorage bekerja.

## Location & 3D

- [ ] `#/live-location` meminta permission lokasi.
- [ ] Start Live Location menampilkan latitude/longitude.
- [ ] Open Maps membuka Google Maps direction.
- [ ] Copy coordinates menyalin koordinat.
- [ ] Clear history menghapus history lokasi.
- [ ] `#/3d-showroom` menampilkan scene CSS 3D.
- [ ] Day/Night mode bekerja.
- [ ] Spin toggle bekerja.

## Operations Pro

- [ ] `#/kitchen` menampilkan KDS tickets.
- [ ] Status KDS bisa diubah menjadi preparing/ready/done.
- [ ] `#/table-map` menampilkan floor map dan table cycle status.
- [ ] `#/loyalty` menampilkan wallet dan promo redemption.
- [ ] `#/inventory` menambah inventory item dan low stock status.
- [ ] `#/events-pro` menyimpan event plan.
- [ ] `#/staff` toggle shift dan SOP checklist.
- [ ] `#/insights` menampilkan analytics rating/badge.

## PWA / Offline

- [ ] `manifest.webmanifest` dapat diakses.
- [ ] Service worker cache mencakup `js/notifications.js`, `js/growth-suite.js`, `js/finance-suite.js`, `js/quality-suite.js`, `js/concierge-suite.js`, `js/delivery-suite.js`, dan `js/launch-suite.js`; notification click membuka route terkait.
- [ ] `sw.js` dapat diakses.
- [ ] `#/offline-center` menampilkan network status.
- [ ] Export JSON membuat backup.
- [ ] Import JSON restore data.
- [ ] Sample queue bertambah.
- [ ] Flush queue simulasi berhasil saat Supabase belum aktif.
- [ ] Clear cache tidak error.

## Responsive

- [ ] Desktop 1440px rapi.
- [ ] Tablet 768px rapi.
- [ ] Mobile 390px rapi.
- [ ] Bottom nav mobile tidak menutup CTA penting.
- [ ] Modal dan drawer tidak overflow.

## Security Check

- [ ] Tidak ada `service_role` key di frontend.
- [ ] Tidak ada SMTP password di frontend.
- [ ] RLS policies sudah dijalankan di Supabase.
- [ ] Storage policies sudah dijalankan.
- [ ] Edge Function secrets disimpan di Supabase dashboard.

## Launch Completeness

- [ ] Buka `#/launch-center` dan pastikan readiness percentage berubah saat checklist di-toggle.
- [ ] Tambahkan launch note dan pastikan note muncul di daftar terbaru.
- [ ] Klik Export Handover JSON dan pastikan file berisi `launch`, `contacts`, dan `readiness`.
- [ ] Buka `#/contact`, kirim pesan customer, lalu pastikan pesan masuk ke Recent Demo Messages dan notification center.
- [ ] Pastikan `aminoLaunchState` dan `aminoContactMessages` ikut tercakup saat export/import backup dari `#/offline-center`.
