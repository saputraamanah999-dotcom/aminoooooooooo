const SUPABASE_URL = "https://embcudmcwrlazvuenayv.supabase.co";
const SUPABASE_KEY = "sb_publishable_OabYUWwhjjcbkjHSmAfRQQ_CJsLoIf1";
const ADMIN_EMAIL = "aminoresto@gmail.com";
const WA_NUMBER = "6282341885469";
const TAX_RATE = 0.1;
const SERVICE_RATE = 0.05;
const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const shortPrice = (n) => rupiah(n);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let supabaseClient = null;
if (window.supabase)
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const fallbackCategories = [
  "Breakfast",
  "Main Menu",
  "Desserts",
  "Drinks",
  "Healthy Bowl",
];
const fallbackMenu = [
  {
    id: "m1",
    category_name: "Breakfast",
    name: "Amino Avocado Toast",
    description: "Sourdough, smashed avocado, herbs, poached egg.",
    price: 78000,
    badges: ["Best Seller", "GF"],
    rating: 4.9,
    calories: 410,
    protein: 16,
    fat: 21,
    carbs: 42,
    is_recommended: true,
  },
  {
    id: "m2",
    category_name: "Breakfast",
    name: "Dragon Fruit Smoothie Bowl",
    description: "Pitaya, banana, granola, coconut flakes.",
    price: 68000,
    badges: ["Vegan", "New"],
    rating: 4.8,
    calories: 360,
    protein: 9,
    fat: 11,
    carbs: 62,
    is_recommended: true,
  },
  {
    id: "m3",
    category_name: "Main Menu",
    name: "Grilled Tuna Sambal Matah",
    description: "Fresh tuna steak with Balinese sambal and greens.",
    price: 138000,
    badges: ["Spicy", "Best Seller"],
    rating: 4.9,
    calories: 520,
    protein: 42,
    fat: 23,
    carbs: 34,
    is_recommended: true,
  },
  {
    id: "m4",
    category_name: "Main Menu",
    name: "Ubud Garden Pesto Pasta",
    description: "Basil pesto, cashew, roasted vegetables.",
    price: 98000,
    badges: ["Vegan"],
    rating: 4.7,
    calories: 640,
    protein: 19,
    fat: 30,
    carbs: 75,
  },
  {
    id: "m5",
    category_name: "Desserts",
    name: "Coconut Panna Cotta",
    description: "Silky coconut cream, mango coulis, lime zest.",
    price: 58000,
    badges: ["New"],
    rating: 4.8,
    calories: 310,
    protein: 5,
    fat: 18,
    carbs: 33,
  },
  {
    id: "m6",
    category_name: "Drinks",
    name: "Amino Green Detox",
    description: "Kale, cucumber, apple, lemon, ginger.",
    price: 48000,
    badges: ["Vegan", "GF"],
    rating: 4.6,
    calories: 130,
    protein: 3,
    fat: 1,
    carbs: 30,
  },
  {
    id: "m7",
    category_name: "Drinks",
    name: "Golden Turmeric Latte",
    description: "Turmeric, oat milk, cinnamon, palm sugar.",
    price: 52000,
    badges: ["Vegan"],
    rating: 4.7,
    calories: 180,
    protein: 4,
    fat: 6,
    carbs: 28,
  },
  {
    id: "m8",
    category_name: "Healthy Bowl",
    name: "Tempeh Protein Bowl",
    description: "Tempeh, quinoa, edamame, peanut-lime dressing.",
    price: 92000,
    badges: ["Vegan", "GF"],
    rating: 4.9,
    calories: 590,
    protein: 32,
    fat: 24,
    carbs: 61,
  },
];
const experiencePackages = [
  {
    id: "sunrise-wellness",
    name: "Sunrise Wellness Brunch",
    tagline: "Yoga deck, cold-pressed juice flight, dan brunch tinggi protein.",
    price: 275000,
    duration: "120 menit",
    guests: "2-18 pax",
    perks: ["Welcome ginger shot", "Chef-guided nutrition notes", "Photo corner botanical"],
  },
  {
    id: "botanical-chef-table",
    name: "Botanical Chef Table",
    tagline: "7-course tasting menu dengan storytelling bahan lokal Bali.",
    price: 685000,
    duration: "150 menit",
    guests: "4-12 pax",
    perks: ["Mocktail pairing", "Live plating by chef", "Printed menu souvenir"],
  },
  {
    id: "golden-hour-private",
    name: "Golden Hour Private Dinner",
    tagline: "Rooftop/garden setup, candle styling, dan menu sharing premium.",
    price: 950000,
    duration: "180 menit",
    guests: "2-30 pax",
    perks: ["Tablescape gold-cream", "Dedicated host", "WhatsApp concierge"],
  },
  {
    id: "island-catering",
    name: "Island Catering & Events",
    tagline: "Healthy buffet, coffee bar, dessert station, dan ops checklist acara.",
    price: 125000,
    duration: "Custom",
    guests: "25-300 pax",
    perks: ["Menu tasting", "Equipment checklist", "On-site captain"],
  },
];
const superDuperTimeline = [
  ["T-7 Hari", "Lock konsep acara, pax, dietary needs, dan deposit."],
  ["T-2 Hari", "Final menu, table map, KDS prep, dan reminder WhatsApp."],
  ["Hari H", "Host greeting, live ops board, kitchen timing, dan photo moment."],
  ["Aftercare", "Feedback link, invoice, loyalty bonus, dan rebooking offer."],
];

const state = {
  route: "#/home",
  menu: [],
  categories: fallbackCategories,
  gallery: [],
  reviews: [],
  orders: [],
  bookings: [],
  experienceLeads: [],
  cart: JSON.parse(localStorage.getItem("aminoCart") || "[]"),
  user: JSON.parse(localStorage.getItem("aminoUser") || "null"),
  adminTab: "Dashboard",
};

function saveCart() {
  localStorage.setItem("aminoCart", JSON.stringify(state.cart));
  renderCartBadge();
  renderDrawer();
}
function toast(msg) {
  const wrap = $("#toast");
  const el = document.createElement("div");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function escapeHtml(str = "") {
  return String(str).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
function cartTotals() {
  const subtotal = state.cart.reduce(
    (s, i) => s + Number(i.price) * Number(i.qty),
    0,
  );
  const tax = subtotal * TAX_RATE;
  const service = subtotal * SERVICE_RATE;
  return { subtotal, tax, service, total: subtotal + tax + service };
}
function itemBadges(item) {
  const badges = Array.isArray(item.badges)
    ? item.badges
    : String(item.badges || "")
        .split(",")
        .filter(Boolean);
  return badges
    .map(
      (b) =>
        `<span class="diet-badge ${/best|new/i.test(b) ? "gold" : ""}">${escapeHtml(b)}</span>`,
    )
    .join("");
}
function imgBlock(item) {
  return `<div class="food-img" role="img" aria-label="Placeholder foto ${escapeHtml(item.name)}"><span class="overlay-price">${shortPrice(item.price)}</span></div>`;
}
function activeUser() {
  return (
    state.user || {
      name: "Guest",
      email: "",
      phone: "",
      role: "customer",
      loyalty_points: 0,
    }
  );
}

async function bootData() {
  state.menu = fallbackMenu;
  state.gallery = Array.from({ length: 9 }, (_, i) => ({
    id: `g${i}`,
    caption: [
      "Elegant plating",
      "Healthy brunch",
      "Natural ambience",
      "Dessert moment",
      "Garden table",
      "Fresh juice",
      "Dinner mood",
      "Coffee ritual",
      "Chef special",
    ][i],
    height: 190 + (i % 4) * 42,
  }));
  state.reviews = [
    {
      id: "r1",
      name: "Maya",
      rating: 5,
      body: "Plating cantik, bahan segar, dan ambience tenang. Perfect untuk brunch Bali.",
      is_visible: true,
      verified: true,
      admin_reply: "Terima kasih Maya!",
    },
    {
      id: "r2",
      name: "Ardi",
      rating: 5,
      body: "Tuna sambal matah wajib coba. Pesanan cepat dan staff ramah.",
      is_visible: true,
      verified: true,
    },
    {
      id: "r3",
      name: "Sophia",
      rating: 4,
      body: "Healthy bowl lezat, harga jelas dengan pajak dan service.",
      is_visible: true,
      verified: false,
    },
  ];
  state.orders = JSON.parse(localStorage.getItem("aminoOrders") || "[]");
  state.bookings = JSON.parse(localStorage.getItem("aminoBookings") || "[]");
  state.experienceLeads = JSON.parse(localStorage.getItem("aminoExperienceLeads") || "[]");
  if (!supabaseClient) return;
  try {
    const [
      { data: cats },
      { data: menu },
      { data: reviews },
      { data: gallery },
    ] = await Promise.all([
      supabaseClient
        .from("categories")
        .select("name")
        .eq("is_active", true)
        .order("sort_order"),
      supabaseClient
        .from("menu_items")
        .select("*, categories(name)")
        .eq("is_available", true)
        .order("name"),
      supabaseClient
        .from("reviews")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    if (cats?.length) state.categories = cats.map((c) => c.name);
    if (menu?.length)
      state.menu = menu.map((m) => ({
        ...m,
        category_name: m.categories?.name || m.category_name || "Main Menu",
        badges: [
          m.is_gluten_free ? "GF" : "",
          m.is_vegan ? "Vegan" : "",
          m.is_spicy ? "Spicy" : "",
          m.is_new ? "New" : "",
          m.is_best_seller ? "Best Seller" : "",
        ].filter(Boolean),
        rating: m.rating || 4.8,
      }));
    if (reviews?.length) state.reviews = reviews;
    if (gallery?.length) state.gallery = gallery;
  } catch (err) {
    console.warn(err);
    toast("Mode demo aktif: Supabase belum siap / RLS belum dipasang.");
  }
}

function shell(content) {
  return `<div class="page">${content}</div>${footer()}`;
}
function footer() {
  return `<footer class="page section"><div class="card two-col"><div><h2>AMINO RESTO BALI</h2><p class="muted">Natural Luxury Dining • Healthy & Tasty Food</p><p class="notice">PRICES ARE NOT FIXED; Tax 10% + Service 5% apply.</p></div><div class="grid"><a href="#/menu">Menu</a><a href="#/gallery">Gallery</a><a href="#/reviews">Reviews</a><a href="#/experiences">Experiences</a><a href="#/booking">Booking</a><a href="#/profile">Kontak & Profile</a><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noreferrer">WhatsApp</a></div></div></footer>`;
}
function home() {
  const popular = state.menu
    .filter((i) => i.is_recommended || itemBadges(i).includes("Best"))
    .slice(0, 4);
  return shell(`<section class="hero"><div><span class="eyebrow">🌿 Natural Luxury Dining</span><h1>Healthy & Tasty Food in <span class="gradient-text">Bali</span></h1><p class="lead">AMINO RESTO BALI menghadirkan bahan segar, plating elegan, dan suasana natural-luxury untuk breakfast, lunch, dinner, booking table, dan order online.</p><div class="hero-actions"><a class="btn primary" href="#/menu">View Menu</a><a class="btn gold" href="#/booking">Book Table</a><button class="btn" data-wa>Order via WhatsApp</button></div><div class="three-col section"><div class="stat"><b>07.30</b><span>Breakfast open</span></div><div class="stat"><b>4.9★</b><span>Guest rating</span></div><div class="stat"><b>15%</b><span>Tax + service</span></div></div></div><div class="hero-card"><div class="price-pill">Chef Special • ${shortPrice(138000)}</div><div class="plate"></div><div class="floating-note"><b>Concept 01: Botanical Luxury</b><br><span class="muted">Glass UI, teal, cream, gold, dan foto placeholder makanan berlapis harga.</span></div></div></section>
  <section class="section card"><span class="eyebrow">Concept 02</span><h2>Island Fine-Casual Mood</h2><p class="lead">Alternatif hero lebih hangat: cream, gold, rounded cards, badge diet, dan CTA cepat untuk turis serta pelanggan lokal.</p></section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">Popular</span><h2>Menu Favorit</h2></div><a class="btn ghost" href="#/menu">See all</a></div><div class="grid cards">${popular.map(menuCard).join("")}</div></section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">Why Choose Us</span><h2>Fresh, elegant, fast</h2></div></div><div class="grid cards">${["Bahan lokal segar setiap hari", "Plating elegan untuk dine-in premium", "Ambience natural-luxury nyaman", "Layanan cepat untuk takeaway & online"].map((x, i) => `<div class="card"><h3>${["🥬", "🍽", "🌴", "⚡"][i]} ${x}</h3><p class="muted">Dirancang untuk pengalaman makan yang sehat, cantik, dan efisien.</p></div>`).join("")}</div></section>
  <section class="section two-col"><div class="card"><h2>Jam Buka</h2><p><b>Breakfast:</b> 07.30–15.00</p><p><b>Lunch & Dinner:</b> 13.00–22.30</p><p><b>Delivery:</b> Gojek • GrabFood</p><div class="btn-row"><a class="btn" href="#/menu">Gojek</a><a class="btn" href="#/menu">GrabFood</a></div></div><div class="card"><h2>Kontak & Lokasi</h2><p>Jl. Pantai Berawa, Canggu, Bali</p><p>☎ +62 823-4188-5469</p><iframe title="Google Maps placeholder" src="https://maps.google.com/maps?q=Bali&t=&z=11&ie=UTF8&iwloc=&output=embed" width="100%" height="220" style="border:0;border-radius:22px"></iframe></div></section>
  <section class="section super-strip"><div><span class="eyebrow">Super Duper</span><h2>Experiences, catering, dan private dining siap dijual</h2><p class="lead">Paket chef table, wellness brunch, private dinner, dan catering lengkap dengan timeline ops sehingga demo terasa seperti produk restoran beneran.</p></div><a class="btn gold" href="#/experiences">Explore Experiences</a></section>
  <section class="section"><div class="section-head"><h2>Review Singkat</h2><a href="#/reviews" class="btn ghost">All reviews</a></div><div class="grid cards">${state.reviews.slice(0, 3).map(reviewCard).join("")}</div></section>`);
}
function menuCard(item) {
  return `<article class="card"><button class="plain" data-quick="${item.id}" aria-label="Quick view ${escapeHtml(item.name)}">${imgBlock(item)}</button><h3>${escapeHtml(item.name)}</h3><p class="muted">${escapeHtml(item.description || "")}</p><div class="badges">${itemBadges(item)}</div><p class="rating">★ ${item.rating || 4.8}</p><p><b>${shortPrice(item.price)}</b></p><small class="muted">${item.calories || 0} kcal • P ${item.protein || 0}g • F ${item.fat || 0}g • C ${item.carbs || 0}g</small><div class="btn-row"><button class="btn primary" data-add="${item.id}">Add to Cart</button><button class="btn ghost" data-quick="${item.id}">Quick View</button></div></article>`;
}
function menuPage() {
  return shell(
    `<section><span class="eyebrow">Complete Menu</span><h1>Daftar Menu</h1><p class="notice">PRICES ARE NOT FIXED; Tax 10% + Service 5% apply.</p><div class="menu-tools"><input id="searchInput" placeholder="Cari menu, contoh: tuna 13k, vegan, dessert" value="${escapeHtml(sessionStorage.getItem("search") || "")}"><select id="catFilter"><option value="all">Semua kategori</option>${state.categories.map((c) => `<option>${c}</option>`).join("")}</select></div><div id="menuResults"></div></section>`,
  );
}
function renderMenuResults() {
  const q = ($("#searchInput")?.value || "").toLowerCase();
  sessionStorage.setItem("search", q);
  const cat = $("#catFilter")?.value || "all";
  const nums = q.match(/\d+/g)?.map(Number) || [];
  const list = state.menu.filter((i) => {
    const hay =
      `${i.name} ${i.description} ${i.category_name} ${(i.badges || []).join(" ")} ${Math.round(i.price / 1000)}k`.toLowerCase();
    const matchText =
      !q ||
      q
        .split(/\s+/)
        .filter(Boolean)
        .every(
          (t) =>
            hay.includes(t) ||
            (/\d+/.test(t) &&
              nums.some((n) => Math.abs(i.price / 1000 - n) <= 5)),
        );
    return (cat === "all" || i.category_name === cat) && matchText;
  });
  const byCat = state.categories
    .map((c) => [c, list.filter((i) => i.category_name === c)])
    .filter(([, items]) => items.length);
  $("#menuResults").innerHTML =
    byCat
      .map(
        ([c, items]) =>
          `<h2 class="category-title">${c}</h2><div class="grid cards">${items.map(menuCard).join("")}</div>`,
      )
      .join("") || '<div class="card">Menu tidak ditemukan.</div>';
}
function reviewCard(r) {
  return `<div class="card"><p class="rating">${"★".repeat(r.rating || 5)}${"☆".repeat(5 - (r.rating || 5))}</p><p>“${escapeHtml(r.body || r.comment || "")}”</p><b>${escapeHtml(r.name || r.customer_name || "Guest")}</b> ${r.verified ? '<span class="diet-badge">Verified</span>' : ""}${r.admin_reply ? `<p class="notice">Admin: ${escapeHtml(r.admin_reply)}</p>` : ""}</div>`;
}
function galleryPage() {
  return shell(
    `<section><span class="eyebrow">Gallery</span><h1>Foto AMINO</h1><div class="masonry">${state.gallery.map((g, i) => `<div class="gallery-tile" style="--h:${g.height || 220}px" data-lightbox="${i}"><span>${escapeHtml(g.caption || "AMINO moment")}</span></div>`).join("")}</div></section>`,
  );
}
function experienceCard(pkg) {
  return `<article class="card experience-card"><div><span class="diet-badge gold">${escapeHtml(pkg.guests)}</span><span class="diet-badge">${escapeHtml(pkg.duration)}</span><h3>${escapeHtml(pkg.name)}</h3><p class="muted">${escapeHtml(pkg.tagline)}</p></div><div class="experience-price"><b>${rupiah(pkg.price)}</b><span>/ pax mulai dari</span></div><ul>${pkg.perks.map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}</ul><div class="btn-row"><button class="btn primary" data-package="${pkg.id}">Pilih Paket</button><a class="btn ghost" href="#/booking">Book Table</a></div></article>`;
}
function experiencesPage() {
  const selected = experiencePackages.find(
    (pkg) => pkg.id === sessionStorage.getItem("selectedExperience"),
  );
  const leadRows = state.experienceLeads
    .slice(0, 4)
    .map(
      (lead) =>
        `<div class="mini-row"><b>${escapeHtml(lead.name)}</b><span>${escapeHtml(lead.package_name)} • ${escapeHtml(lead.date || "Flexible")}</span></div>`,
    )
    .join("");
  return shell(`<section class="experience-hero"><div><span class="eyebrow">✨ Super Duper Experiences</span><h1>Private dining, catering, loyalty, dan event ops dalam satu demo.</h1><p class="lead">Halaman ini melengkapi AMINO dengan paket revenue tinggi: chef table, wellness brunch, private dinner, catering, lead capture, timeline produksi, dan concierge WhatsApp.</p><div class="hero-actions"><button class="btn primary" data-scroll-experience>Request Proposal</button><button class="btn gold" data-wa>Chat Concierge</button></div></div><div class="experience-dashboard card"><span class="eyebrow">Live Pipeline</span><div class="pipeline-metric"><b>${state.experienceLeads.length}</b><span>experience leads</span></div><div class="pipeline-metric"><b>${experiencePackages.length}</b><span>premium packages</span></div><div class="pipeline-metric"><b>35%</b><span>target upsell</span></div>${leadRows || '<p class="muted">Lead baru akan muncul di sini setelah form dikirim.</p>'}</div></section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">Packages</span><h2>Paket siap jual</h2></div><p class="muted">Harga mulai per pax, bisa disesuaikan dengan request tamu.</p></div><div class="grid experience-grid">${experiencePackages.map(experienceCard).join("")}</div></section>
  <section class="section two-col"><div class="card"><span class="eyebrow">Ops Timeline</span><h2>Run of Show</h2><div class="timeline super-timeline">${superDuperTimeline.map(([label, body], i) => `<div class="timeline-step done"><b>${i + 1}. ${escapeHtml(label)}</b><span>${escapeHtml(body)}</span></div>`).join("")}</div></div><form id="experienceLeadForm" class="card"><span class="eyebrow">Proposal</span><h2>Minta penawaran</h2><input name="name" placeholder="Nama / brand" required><input name="phone" placeholder="WhatsApp" required><select name="package_id">${experiencePackages.map((pkg) => `<option value="${pkg.id}" ${selected?.id === pkg.id ? "selected" : ""}>${pkg.name}</option>`).join("")}</select><div class="two-col compact"><input name="date" type="date"><input name="guests" type="number" min="1" placeholder="Jumlah pax"></div><textarea name="notes" placeholder="Venue, dietary, budget, dekorasi, atau request khusus"></textarea><button class="btn primary full">Simpan Lead & Siapkan Proposal</button></form></section>`);
}

function reviewsPage() {
  return shell(
    `<section><span class="eyebrow">Reviews</span><h1>Ulasan & Rating</h1><div class="two-col"><div class="grid">${state.reviews
      .filter((r) => r.is_visible !== false)
      .map(reviewCard)
      .join(
        "",
      )}</div><form class="card" id="reviewForm"><h2>Tulis Review</h2><input name="name" placeholder="Nama"><select name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><textarea name="body" placeholder="Ceritakan pengalaman Anda"></textarea><button class="btn primary full">Kirim Review</button></form></div></section>`,
  );
}
function cartPage() {
  const t = cartTotals();
  return shell(
    `<section><span class="eyebrow">Checkout</span><h1>Keranjang & Checkout</h1><div class="two-col"><div><div id="cartItems" class="cart-list card"></div><form id="manualForm" class="card section"><h2>Pesan Manual</h2><input name="name" placeholder="Nama menu manual" required><input name="price" type="number" placeholder="Harga per porsi" required><input name="qty" type="number" min="1" value="1" required><textarea name="notes" placeholder="Catatan"></textarea><button class="btn gold full">Tambah manual (perlu verifikasi admin)</button></form></div><form id="checkoutForm" class="card"><h2>Detail Pesanan</h2>${!state.user ? '<p class="notice">Anda harus login/register sebelum Place Order. Demo masih bisa membuat draft lokal.</p>' : ""}<input name="name" placeholder="Nama pelanggan" value="${escapeHtml(activeUser().name)}"><input name="phone" placeholder="Nomor telepon" value="${escapeHtml(activeUser().phone || "")}"><select name="order_type"><option>Dine In</option><option>Takeaway</option><option>Delivery</option><option>Online</option></select><textarea name="address" placeholder="Alamat / nomor meja"></textarea><button type="button" class="btn ghost" id="geoBtn">Gunakan Lokasi Saya</button><select name="payment"><option>Cash</option><option>QRIS</option><option>DANA</option><option>GoPay</option><option>Kartu</option></select><div class="totals">${totalsHtml(t)}</div><button class="btn primary full">Place Order</button><button type="button" class="btn gold full" data-wa>Order via WhatsApp</button></form></div></section>`,
  );
}
function totalsHtml(t) {
  return `<div class="line"><span>Subtotal</span><b>${rupiah(t.subtotal)}</b></div><div class="line"><span>Tax 10%</span><b>${rupiah(t.tax)}</b></div><div class="line"><span>Service 5%</span><b>${rupiah(t.service)}</b></div><div class="line total"><span>Total</span><b>${rupiah(t.total)}</b></div><small class="muted">PRICES ARE NOT FIXED</small>`;
}
function renderCartList(target) {
  const root = $(target);
  if (!root) return;
  root.innerHTML = state.cart.length
    ? state.cart
        .map(
          (i, idx) =>
            `<div class="cart-row"><div class="thumb"></div><div><b>${escapeHtml(i.name)}</b><p class="muted">${rupiah(i.price)} ${i.manual ? "• Manual belum diverifikasi" : ""}</p><input data-note="${idx}" placeholder="Catatan item" value="${escapeHtml(i.notes || "")}"></div><div><div class="qty"><button data-dec="${idx}">−</button><b>${i.qty}</b><button data-inc="${idx}">+</button></div><button class="btn ghost" data-remove="${idx}">Hapus</button></div></div>`,
        )
        .join("")
    : '<p class="muted">Keranjang kosong.</p>';
}
function ordersPage() {
  return shell(
    `<section><span class="eyebrow">Tracking</span><h1>Status Pesanan</h1><div class="grid">${state.orders.length ? state.orders.map((o) => `<div class="card"><h3>${o.id}</h3><p>Status: <b>${o.status}</b></p><p>Total: ${rupiah(o.total)}</p><p class="muted">${new Date(o.created_at).toLocaleString("id-ID")}</p></div>`).join("") : '<div class="card">Belum ada pesanan.</div>'}</div></section>`,
  );
}
function profilePage() {
  const u = activeUser();
  return shell(
    `<section><span class="eyebrow">Profile</span><h1>Profil User</h1><div class="two-col"><form class="card" id="profileForm"><div class="avatar" style="width:86px;height:86px;font-size:32px">${escapeHtml((u.name || "U")[0])}</div><input name="name" value="${escapeHtml(u.name)}" placeholder="Nama"><input name="email" value="${escapeHtml(u.email)}" placeholder="Email"><input name="phone" value="${escapeHtml(u.phone || "")}" placeholder="Telepon"><p>Role: <b>${escapeHtml(u.role || "customer")}</b></p><p>Poin loyalti: <b>${u.loyalty_points || 0}</b></p><input type="file" accept="image/*"><input type="password" placeholder="Password baru"><button class="btn primary full">Simpan Profil</button><button type="button" class="btn ghost full" id="logoutBtn">Logout</button></form><div class="card"><h2>Riwayat</h2><p>Pesanan: ${state.orders.length}</p><p>Booking: ${state.bookings.length}</p><p>Review: ${state.reviews.filter((r) => r.name === u.name).length}</p></div></div></section>`,
  );
}
function bookingPage() {
  return shell(
    `<section><span class="eyebrow">Booking</span><h1>Book Table</h1><form id="bookingForm" class="card two-col"><div><input name="name" placeholder="Nama" required><input name="email" type="email" placeholder="Email" required><input name="phone" placeholder="Phone" required></div><div><input name="date" type="date" required><input name="time" type="time" required><input name="guests" type="number" min="1" value="2" required></div><select name="experience_package" style="grid-column:1/-1"><option value="">Regular booking / tanpa paket</option>${experiencePackages.map((pkg) => `<option value="${pkg.id}">${pkg.name}</option>`).join("")}</select><textarea name="notes" placeholder="Catatan" style="grid-column:1/-1"></textarea><button class="btn primary full" style="grid-column:1/-1">Kirim Booking</button></form></section>`,
  );
}
function loginPage(register = false) {
  return shell(
    `<section><span class="eyebrow">Auth</span><h1>${register ? "Register" : "Login"}</h1><form id="authForm" class="card" style="max-width:520px"><input name="name" placeholder="Nama" ${register ? "required" : 'style="display:none"'}><input name="phone" placeholder="Telepon" ${register ? "required" : 'style="display:none"'}><input name="email" type="email" placeholder="Email" required><div class="field"><input id="pass" name="password" type="password" placeholder="Password" required><button type="button" class="btn ghost" id="togglePass">Show/Hide Password</button></div>${register ? '<input name="confirm" type="password" placeholder="Konfirmasi password" required><label><input type="checkbox" name="agree" required> Saya setuju dengan kebijakan AMINO</label>' : ""}<button class="btn primary full">${register ? "Create Account" : "Login"}</button><button type="button" class="btn ghost full" id="googleBtn" disabled>Google login belum aktif</button><a href="#/reset-password" id="forgotLink">Forgot password / reset password</a><p>${register ? 'Sudah punya akun? <a href="#/login">Login</a>' : 'Belum punya akun? <a href="#/register">Register</a>'}</p></form></section>`,
  );
}

function resetPasswordPage() {
  return shell(
    `<section><span class="eyebrow">Password</span><h1>Forgot / Reset Password</h1><div class="two-col"><form id="forgotForm" class="card"><h2>Kirim Link Reset</h2><p class="muted">Masukkan email akun Supabase Auth Anda. Link reset akan diarahkan ke ${window.location.origin}/auth/callback.</p><input name="email" type="email" placeholder="Email" required><button class="btn primary full">Send Reset Link</button></form><form id="resetForm" class="card"><h2>Set Password Baru</h2><p class="muted">Gunakan form ini setelah membuka link recovery dari email.</p><input name="password" type="password" placeholder="Password baru" required><input name="confirm" type="password" placeholder="Konfirmasi password" required><button class="btn gold full">Update Password</button></form></div></section>`,
  );
}
function authCallbackPage() {
  return shell(
    `<section class="card"><span class="eyebrow">Auth Callback</span><h1>Memproses Login / Reset</h1><p class="muted">Jika Anda datang dari email Supabase, sesi akan dibaca otomatis oleh Supabase JS. Setelah itu Anda bisa membuka Profile atau Reset Password.</p><div class="btn-row"><a class="btn primary" href="#/profile">Go to Profile</a><a class="btn gold" href="#/reset-password">Set New Password</a></div></section>`,
  );
}

function adminPage() {
  const isAdmin =
    activeUser().role === "admin" || activeUser().email === ADMIN_EMAIL;
  if (!isAdmin)
    return shell(
      `<section class="card"><h1>Admin Restricted</h1><p class="notice">Panel admin hanya untuk role = admin di table profiles. Login demo dengan email ${ADMIN_EMAIL} untuk melihat panel.</p><a class="btn primary" href="#/login">Login</a></section>`,
    );
  const tabs = [
    "Dashboard",
    "Menu Manager",
    "Orders",
    "Bookings",
    "Customers",
    "Gallery",
    "Reviews",
    "Promos",
    "Experience Leads",
    "Settings",
    "Notifications Log",
  ];
  return shell(
    `<section><span class="eyebrow">Admin</span><h1>Control Center</h1><div class="admin-shell"><aside class="admin-side">${tabs.map((t) => `<button class="${state.adminTab === t ? "active" : ""}" data-admin-tab="${t}">${t}</button>`).join("")}</aside><div id="adminContent">${adminContent()}</div></div></section>`,
  );
}
function adminContent() {
  const stats = `<div class="stats"><div class="stat"><b>${rupiah(3200000)}</b><span>Revenue today</span></div><div class="stat"><b>${state.orders.length}</b><span>Orders today</span></div><div class="stat"><b>3</b><span>Pending</span></div><div class="stat"><b>4.9</b><span>Average rating</span></div><div class="stat"><b>128</b><span>Customers</span></div><div class="stat"><b>${state.experienceLeads.length}</b><span>Experience leads</span></div><div class="stat"><b>●</b><span>Realtime online</span></div></div>`;
  if (state.adminTab === "Dashboard") return stats;
  if (state.adminTab === "Menu Manager")
    return `${stats}<div class="card section"><h2>Menu Manager</h2><p>Tambah/edit/hapus/duplicate, upload menu-images, toggle available/recommended/best/new, variants multi harga, dan nutrisi.</p>${table(
      ["Item", "Price", "Flags"],
      state.menu
        .slice(0, 8)
        .map((i) => [i.name, rupiah(i.price), (i.badges || []).join(", ")]),
    )}</div>`;
  if (state.adminTab === "Orders")
    return `<div class="card"><h2>Orders</h2><p>Update status pending → confirmed → preparing → ready → delivered → completed/cancelled, print struk, verifikasi item manual.</p>${table(
      ["Order", "Status", "Total"],
      state.orders.map((o) => [o.id, o.status, rupiah(o.total)]),
    )}</div>`;
  if (state.adminTab === "Experience Leads")
    return `<div class="card"><h2>Experience Leads</h2><p>Pipeline proposal untuk chef table, private dinner, dan catering.</p>${table(
      ["Lead", "Package", "Date", "Guests", "Status"],
      state.experienceLeads.map((lead) => [
        lead.name,
        lead.package_name,
        lead.date || "Flexible",
        String(lead.guests || "-"),
        lead.status,
      ]),
    )}</div>`;
  return `<div class="card"><h2>${state.adminTab}</h2><p>CRUD lengkap, filter, upload/delete, reply/toggle/verify, promo dates, settings restoran, dan notifications log disiapkan untuk integrasi Supabase.</p></div>`;
}
function tableCell(value) {
  const text = String(value ?? "");
  const isTrustedActionHtml =
    text.includes("mini-action") ||
    text.includes("data-status") ||
    text.includes("data-print") ||
    text.includes("data-package");
  return isTrustedActionHtml ? text : escapeHtml(text);
}
function table(head, rows) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td>${tableCell(c)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${head.length || 1}">No data</td></tr>`}</tbody></table></div>`;
}

const routes = {
  "#/home": home,
  "#/menu": menuPage,
  "#/gallery": galleryPage,
  "#/reviews": reviewsPage,
  "#/experiences": experiencesPage,
  "#/cart": cartPage,
  "#/orders": ordersPage,
  "#/profile": profilePage,
  "#/booking": bookingPage,
  "#/login": () => loginPage(false),
  "#/register": () => loginPage(true),
  "#/reset-password": resetPasswordPage,
  "#/auth/callback": authCallbackPage,
  "#/admin": adminPage,
};
function render() {
  state.route = location.hash || "#/home";
  if (!routes[state.route]) state.route = "#/home";
  $("#app").innerHTML = routes[state.route]();
  $("#app").focus();
  bindPage();
  renderCartBadge();
  if (state.route === "#/menu") renderMenuResults();
  if (state.route === "#/cart") renderCartList("#cartItems");
  $("#avatarInitial").textContent = (activeUser().name || "U")[0].toUpperCase();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function bindPage() {
  $$(".btn, .icon-btn").forEach((b) => b.addEventListener("click", ripple));
  $$("[data-add]").forEach((b) => (b.onclick = () => addToCart(b.dataset.add)));
  $$("[data-quick]").forEach(
    (b) => (b.onclick = () => quickView(b.dataset.quick)),
  );
  $$("[data-wa]").forEach((b) => (b.onclick = orderWhatsApp));
  $("#searchInput")?.addEventListener("input", renderMenuResults);
  $("#catFilter")?.addEventListener("change", renderMenuResults);
  $("#manualForm")?.addEventListener("submit", addManual);
  $("#checkoutForm")?.addEventListener("submit", placeOrder);
  $("#geoBtn")?.addEventListener("click", geo);
  $("#bookingForm")?.addEventListener("submit", saveBooking);
  $("#reviewForm")?.addEventListener("submit", saveReview);
  $("#experienceLeadForm")?.addEventListener("submit", saveExperienceLead);
  $$("[data-package]").forEach((b) => (b.onclick = () => chooseExperience(b.dataset.package)));
  $$("[data-scroll-experience]").forEach(
    (b) =>
      (b.onclick = () =>
        $("#experienceLeadForm")?.scrollIntoView({ behavior: "smooth" })),
  );
  $("#authForm")?.addEventListener("submit", authSubmit);
  $("#forgotForm")?.addEventListener("submit", forgotPassword);
  $("#resetForm")?.addEventListener("submit", resetPassword);
  $("#togglePass")?.addEventListener("click", () => {
    const p = $("#pass");
    p.type = p.type === "password" ? "text" : "password";
  });
  $("#logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("aminoUser");
    state.user = null;
    toast("Logout berhasil");
    render();
  });
  $$("[data-admin-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        state.adminTab = b.dataset.adminTab;
        render();
      }),
  );
  $$("[data-lightbox]").forEach(
    (g) =>
      (g.onclick = () =>
        openModal(
          `<h2>${escapeHtml(state.gallery[g.dataset.lightbox].caption || "Gallery")}</h2><div class="gallery-tile" style="--h:430px"></div><button class="btn primary full" onclick="closeModal()">Close</button>`,
        )),
  );
}
function ripple(e) {
  const s = document.createElement("span");
  s.className = "ripple";
  const r = e.currentTarget.getBoundingClientRect();
  s.style.left = `${e.clientX - r.left}px`;
  s.style.top = `${e.clientY - r.top}px`;
  e.currentTarget.appendChild(s);
  setTimeout(() => s.remove(), 550);
}
function addToCart(id) {
  const item = state.menu.find((i) => String(i.id) === String(id));
  if (!item) return;
  const found = state.cart.find(
    (i) => String(i.id) === String(id) && !i.manual,
  );
  if (found) found.qty++;
  else
    state.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      notes: "",
      manual: false,
    });
  saveCart();
  toast(`${item.name} ditambahkan.`);
}
function addManual(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.cart.push({
    id: `manual-${Date.now()}`,
    name: f.get("name"),
    price: Number(f.get("price")),
    qty: Number(f.get("qty")),
    notes: f.get("notes"),
    manual: true,
    verified: false,
  });
  e.target.reset();
  saveCart();
  render();
  toast("Item manual ditambahkan; verifikasi default false.");
}
function updateCart(e) {
  const t = e.target;
  if (t.dataset.inc) {
    state.cart[t.dataset.inc].qty++;
  }
  if (t.dataset.dec) {
    state.cart[t.dataset.dec].qty = Math.max(
      1,
      state.cart[t.dataset.dec].qty - 1,
    );
  }
  if (t.dataset.remove) {
    state.cart.splice(t.dataset.remove, 1);
  }
  if (t.dataset.note) {
    state.cart[t.dataset.note].notes = t.value;
  }
  saveCart();
  if (state.route === "#/cart") renderCartList("#cartItems");
}
document.addEventListener("input", (event) => {
  if (event.target?.dataset?.note) updateCart(event);
});
function quickView(id) {
  const i = state.menu.find((x) => String(x.id) === String(id));
  if (!i) return;
  openModal(
    `${imgBlock(i)}<h2>${escapeHtml(i.name)}</h2><p>${escapeHtml(i.description || "")}</p><div class="badges">${itemBadges(i)}</div><p class="rating">★ ${i.rating || 4.8}</p><p><b>${shortPrice(i.price)}</b></p><p class="muted">Nutrition: ${i.calories || 0} kcal • protein ${i.protein || 0}g • fat ${i.fat || 0}g • carbs ${i.carbs || 0}g</p><button class="btn primary full" onclick="addToCart('${i.id}'); closeModal();">Tambah ke Keranjang</button>`,
  );
}
function openModal(html) {
  $("#modal").innerHTML =
    `<button class="icon-btn" style="float:right" onclick="closeModal()">✕</button>${html}`;
  $("#modal").classList.add("open");
  $("#overlay").classList.add("open");
}
function closeModal() {
  $("#modal").classList.remove("open");
  $("#overlay").classList.remove("open");
}
function renderCartBadge() {
  $("#cartBadge").textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}
function renderDrawer() {
  renderCartList("#drawerCartItems");
  $("#drawerTotals").innerHTML = totalsHtml(cartTotals());
}
function toggleDrawer(open) {
  $("#cartDrawer").classList.toggle("open", open);
  $("#overlay").classList.toggle("open", open);
  renderDrawer();
}
async function placeOrder(e) {
  e.preventDefault();
  if (!state.user) {
    toast(
      "Silakan login/register sebelum checkout. WhatsApp order tetap bisa untuk guest.",
    );
    location.hash = "#/login";
    return;
  }
  if (!state.cart.length) return toast("Keranjang masih kosong.");
  const f = new FormData(e.target);
  const t = cartTotals();
  const order = {
    id: `AMN-${Date.now()}`,
    user_email: activeUser().email,
    customer_name: f.get("name"),
    phone: f.get("phone"),
    order_type: f.get("order_type"),
    address: f.get("address"),
    payment: f.get("payment"),
    status: "pending",
    total: t.total,
    created_at: new Date().toISOString(),
    items: [...state.cart],
  };
  try {
    if (supabaseClient && state.user) {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      const { data, error } = await supabaseClient
        .from("orders")
        .insert({
          user_id: user?.id,
          customer_name: order.customer_name,
          phone: order.phone,
          email: activeUser().email,
          order_type: order.order_type,
          address: order.address,
          payment_method: order.payment,
          subtotal: t.subtotal,
          tax: t.tax,
          service_fee: t.service,
          total: t.total,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      const regular = state.cart
        .filter((i) => !i.manual)
        .map((i) => ({
          order_id: data.id,
          menu_item_id: i.id,
          item_name: i.name,
          qty: i.qty,
          unit_price: i.price,
          notes: i.notes,
        }));
      const manual = state.cart
        .filter((i) => i.manual)
        .map((i) => ({
          order_id: data.id,
          user_id: user?.id,
          item_name: i.name,
          qty: i.qty,
          unit_price: i.price,
          notes: i.notes,
          is_verified: false,
          admin_decision: "pending",
        }));
      if (regular.length)
        await supabaseClient.from("order_items").insert(regular);
      if (manual.length)
        await supabaseClient.from("orders_manual").insert(manual);
      await supabaseClient.functions.invoke("send-order-email", {
        body: { type: "order", order_id: data.id },
      });
    }
  } catch (err) {
    console.warn(err);
    toast("Order disimpan lokal; Supabase/Edge Function belum aktif.");
  }
  state.orders.unshift(order);
  localStorage.setItem("aminoOrders", JSON.stringify(state.orders));
  state.cart = [];
  saveCart();
  window.aminoNotify?.({
    type: "order",
    title: "Order dibuat",
    body: `${order.id} menunggu konfirmasi admin. Total ${rupiah(order.total)}.`,
    priority: "high",
    audience: "all",
    action_url: "#/orders",
    payload: { order_id: order.id, status: order.status },
  });
  toast("Order dibuat dengan status pending.");
  location.hash = "#/orders";
}
function orderWhatsApp() {
  const f = $("#checkoutForm")
    ? new FormData($("#checkoutForm"))
    : new FormData();
  const t = cartTotals();
  const text = `Halo Amino Resto, saya mau pesan:\nNama: ${f.get("name") || activeUser().name}\nPhone: ${f.get("phone") || activeUser().phone || "-"}\nOrder type: ${f.get("order_type") || "online"}\nAlamat: ${f.get("address") || "-"}\nItems:\n${state.cart.map((i) => `  - ${i.name} x ${i.qty} = ${rupiah(i.price * i.qty)} ${i.notes ? `(${i.notes})` : ""}`).join("\n") || "  - Belum ada item"}\nSubtotal: ${rupiah(t.subtotal)} \nTax 10%: ${rupiah(t.tax)}\nService 5%: ${rupiah(t.service)}\nTotal: ${rupiah(t.total)}\nPayment: ${f.get("payment") || "Cash"}\nPRICES ARE NOT FIXED`;
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,
    "_blank",
  );
}
function geo() {
  if (!navigator.geolocation) return toast("Geolocation tidak tersedia.");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      $('[name="address"]').value =
        `Lat ${pos.coords.latitude}, Lng ${pos.coords.longitude}`;
      toast("Lokasi ditambahkan.");
    },
    () => toast("Izin lokasi ditolak."),
  );
}
async function saveBooking(e) {
  e.preventDefault();
  const raw = Object.fromEntries(new FormData(e.target));
  const booking = {
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    booking_date: raw.date,
    booking_time: raw.time,
    guests: Number(raw.guests),
    experience_package: raw.experience_package || "",
    notes: raw.notes,
    status: "pending",
    id: `BKG-${Date.now()}`,
  };
  state.bookings.unshift(booking);
  localStorage.setItem("aminoBookings", JSON.stringify(state.bookings));
  try {
    if (supabaseClient) {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabaseClient
          .from("bookings")
          .insert({
            user_id: user.id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            guests: booking.guests,
            experience_package: booking.experience_package,
            notes: booking.notes,
            status: booking.status,
          })
          .select("id")
          .single();
        if (error) throw error;
        await supabaseClient.functions.invoke("send-order-email", {
          body: { type: "booking", booking_id: data?.id || booking.id },
        });
      }
    }
  } catch (err) {
    console.warn(err);
  }
  window.aminoNotify?.({
    type: "booking",
    title: "Booking dikirim",
    body: `${booking.name} • ${booking.booking_date} ${booking.booking_time} • ${booking.guests} pax`,
    priority: booking.experience_package ? "high" : "normal",
    audience: "all",
    action_url: "#/booking",
    payload: { booking_id: booking.id, experience_package: booking.experience_package },
  });
  toast("Booking dikirim dengan status pending.");
  e.target.reset();
}
function saveReview(e) {
  e.preventDefault();
  const r = Object.fromEntries(new FormData(e.target));
  r.rating = Number(r.rating);
  r.is_visible = true;
  r.verified = false;
  state.reviews.unshift(r);
  window.aminoNotify?.({
    type: "review",
    title: "Review baru",
    body: `${r.name || "Guest"} memberi rating ${r.rating}/5.`,
    priority: "normal",
    audience: "admin",
    action_url: "#/admin",
    payload: { rating: r.rating, body: r.body },
  });
  toast("Review dikirim, admin dapat verify/reply/toggle visible.");
  render();
}

function chooseExperience(id) {
  const pkg = experiencePackages.find((item) => item.id === id);
  if (!pkg) return;
  sessionStorage.setItem("selectedExperience", id);
  toast(`${pkg.name} dipilih. Lengkapi form proposal.`);
  location.hash = "#/experiences";
  setTimeout(() => $("#experienceLeadForm")?.scrollIntoView({ behavior: "smooth" }), 60);
}
async function saveExperienceLead(e) {
  e.preventDefault();
  const raw = Object.fromEntries(new FormData(e.target));
  const pkg = experiencePackages.find((item) => item.id === raw.package_id);
  const lead = {
    id: `EXP-${Date.now()}`,
    name: raw.name,
    phone: raw.phone,
    package_id: raw.package_id,
    package_name: pkg?.name || "Custom Experience",
    date: raw.date,
    guests: Number(raw.guests || 0),
    notes: raw.notes,
    status: "proposal",
    created_at: new Date().toISOString(),
  };
  try {
    if (supabaseClient) {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabaseClient
          .from("experience_leads")
          .insert({
            user_id: user.id,
            name: lead.name,
            phone: lead.phone,
            package_id: lead.package_id,
            package_name: lead.package_name,
            event_date: lead.date || null,
            guests: lead.guests || null,
            notes: lead.notes,
            status: lead.status,
          })
          .select("id")
          .single();
        if (error) throw error;
        await supabaseClient.functions.invoke("send-order-email", {
          body: {
            type: "experience",
            experience_lead_id: data?.id,
            title: "New AMINO Experience Lead",
            body: `${lead.name} memilih ${lead.package_name}`,
            priority: "urgent",
            action_url: "#/notifications",
          },
        });
      }
    }
  } catch (err) {
    console.warn(err);
    toast("Lead disimpan lokal; Supabase experience_leads belum aktif.");
  }
  state.experienceLeads.unshift(lead);
  localStorage.setItem("aminoExperienceLeads", JSON.stringify(state.experienceLeads));
  window.aminoNotify?.({
    type: "experience",
    title: "Experience lead baru",
    body: `${lead.name} memilih ${lead.package_name} untuk ${lead.guests || "?"} pax.`,
    priority: "urgent",
    audience: "admin",
    action_url: "#/notifications",
    payload: lead,
  });
  toast("Lead experience tersimpan. Tim AMINO siap follow-up proposal.");
  e.target.reset();
  render();
}

async function forgotPassword(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    if (supabaseClient) {
      await supabaseClient.auth.resetPasswordForEmail(f.get("email"), {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
    }
    toast("Link reset password dikirim jika email terdaftar.");
  } catch (err) {
    console.warn(err);
    toast("Mode demo: reset password membutuhkan Supabase Auth aktif.");
  }
}
async function resetPassword(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  if (f.get("password") !== f.get("confirm")) {
    return toast("Konfirmasi password tidak cocok.");
  }
  try {
    if (supabaseClient) {
      await supabaseClient.auth.updateUser({ password: f.get("password") });
    }
    toast("Password berhasil diperbarui.");
    location.hash = "#/login";
  } catch (err) {
    console.warn(err);
    toast("Mode demo: update password membutuhkan sesi recovery Supabase.");
  }
}

async function authSubmit(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const isRegister = state.route === "#/register";
  if (isRegister && f.get("password") !== f.get("confirm"))
    return toast("Konfirmasi password tidak cocok.");
  try {
    if (supabaseClient) {
      if (isRegister)
        await supabaseClient.auth.signUp({
          email: f.get("email"),
          password: f.get("password"),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { name: f.get("name"), phone: f.get("phone") },
          },
        });
      else
        await supabaseClient.auth.signInWithPassword({
          email: f.get("email"),
          password: f.get("password"),
        });
    }
  } catch (err) {
    console.warn(err);
  }
  state.user = {
    name: f.get("name") || f.get("email").split("@")[0],
    email: f.get("email"),
    phone: f.get("phone") || "",
    role: f.get("email") === ADMIN_EMAIL ? "admin" : "customer",
    loyalty_points: 25,
  };
  localStorage.setItem("aminoUser", JSON.stringify(state.user));
  toast(isRegister ? "Register berhasil." : "Login berhasil.");
  location.hash = "#/profile";
}

if (window.location.pathname === "/auth/callback" && !window.location.hash) {
  window.location.hash = "#/auth/callback";
}

document.addEventListener("click", updateCart);
$("#openCartBtn").onclick = () => toggleDrawer(true);
$("#closeCartBtn").onclick = () => toggleDrawer(false);
$("#overlay").onclick = () => {
  toggleDrawer(false);
  closeModal();
};
$("#menuToggle").onclick = () => $("#mobileMenu").classList.toggle("open");
window.addEventListener("hashchange", render);
bootData().then(render);
