# Deployment Guide — AMINO RESTO BALI

## Static Hosting

Project ini bisa di-host di GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages, atau Supabase Storage static hosting.

Tidak perlu build step karena tidak memakai framework.

## GitHub Pages

1. Push repo ke GitHub.
2. Buka Settings → Pages.
3. Pilih branch dan folder root.
4. Buka URL Pages.
5. Test route hash seperti `#/home`, `#/menu`, `#/portfolio`.

## Netlify / Cloudflare Pages

Build command kosong.

Publish directory:

```text
.
```

## PWA Notes

Service worker hanya aktif di HTTPS atau localhost.

File yang diperlukan:

- `manifest.webmanifest`
- `sw.js`
- `assets/restaurant-assets/icon.svg`
- `js/pwa-offline.js`

## Environment Notes

Frontend menggunakan Supabase URL dan publishable key yang aman untuk browser. Jangan menaruh service role key di JS.

## Asset Workflow

Admin bisa menambahkan foto/logo nanti lewat:

- Folder `assets/` di GitHub.
- Supabase Storage bucket `menu-images`.
- Supabase Storage bucket `gallery`.
- Supabase Storage bucket `restaurant-assets`.

## Manual Test After Deploy

- Buka homepage.
- Tambahkan menu ke cart.
- Register/login demo.
- Checkout local order.
- Booking table.
- Open portfolio.
- Open live location.
- Open offline center.
- Install PWA jika prompt tersedia.
