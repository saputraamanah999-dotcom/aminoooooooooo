/*
  AMINO RESTO BALI — extended vanilla enhancements.
  This file intentionally keeps features readable and separate from the SPA core.
  It adds richer demo data, stronger admin workflows, print helpers, profile save,
  order timeline tracking, booking management, settings preview, and local CRUD.
*/

const AMINO_EXTENDED_MENU = [
  {
    id: "mx-001",
    category_name: "Breakfast",
    name: "Bali Sunrise Omelette",
    description:
      "Free-range eggs, spinach, goat cheese, tomato relish, garden herbs.",
    price: 72000,
    badges: ["New", "GF"],
    rating: 4.8,
    calories: 390,
    protein: 24,
    fat: 25,
    carbs: 18,
    is_recommended: true,
  },
  {
    id: "mx-002",
    category_name: "Breakfast",
    name: "Canggu Granola Parfait",
    description:
      "House granola, coconut yoghurt, banana, honey, berries, cacao nibs.",
    price: 64000,
    badges: ["Vegan"],
    rating: 4.7,
    calories: 430,
    protein: 11,
    fat: 17,
    carbs: 61,
  },
  {
    id: "mx-003",
    category_name: "Breakfast",
    name: "Protein Pancake Stack",
    description:
      "Oat pancakes, whey or pea protein, peanut butter, grilled banana.",
    price: 84000,
    badges: ["Best Seller"],
    rating: 4.9,
    calories: 610,
    protein: 34,
    fat: 21,
    carbs: 72,
    is_recommended: true,
  },
  {
    id: "mx-004",
    category_name: "Main Menu",
    name: "Amino Chicken Satay Bowl",
    description:
      "Charcoal chicken satay, red rice, cucumber, lawar salad, peanut sauce.",
    price: 104000,
    badges: ["Best Seller"],
    rating: 4.9,
    calories: 720,
    protein: 43,
    fat: 31,
    carbs: 68,
    is_recommended: true,
  },
  {
    id: "mx-005",
    category_name: "Main Menu",
    name: "Seared Mahi Mahi Coconut Curry",
    description:
      "Line-caught mahi mahi, turmeric coconut curry, greens, jasmine rice.",
    price: 148000,
    badges: ["GF", "Spicy"],
    rating: 4.8,
    calories: 680,
    protein: 46,
    fat: 29,
    carbs: 55,
  },
  {
    id: "mx-006",
    category_name: "Main Menu",
    name: "Jackfruit Rendang Tacos",
    description:
      "Slow-cooked jackfruit rendang, pickled shallot, avocado, corn tortilla.",
    price: 93000,
    badges: ["Vegan", "Spicy", "New"],
    rating: 4.6,
    calories: 540,
    protein: 13,
    fat: 24,
    carbs: 67,
  },
  {
    id: "mx-007",
    category_name: "Main Menu",
    name: "Wagyu Truffle Nasi Goreng",
    description:
      "Premium beef, truffle aroma, organic egg, cucumber pickle, prawn cracker.",
    price: 168000,
    badges: ["Best Seller", "New"],
    rating: 4.9,
    calories: 790,
    protein: 39,
    fat: 36,
    carbs: 76,
  },
  {
    id: "mx-008",
    category_name: "Healthy Bowl",
    name: "Ocean Poke Bowl",
    description:
      "Tuna, avocado, wakame, edamame, brown rice, sesame yuzu dressing.",
    price: 118000,
    badges: ["GF"],
    rating: 4.8,
    calories: 610,
    protein: 37,
    fat: 24,
    carbs: 60,
    is_recommended: true,
  },
  {
    id: "mx-009",
    category_name: "Healthy Bowl",
    name: "Green Goddess Quinoa Bowl",
    description:
      "Quinoa, roasted pumpkin, kale, avocado, sprouts, basil tahini dressing.",
    price: 96000,
    badges: ["Vegan", "GF"],
    rating: 4.7,
    calories: 570,
    protein: 18,
    fat: 29,
    carbs: 64,
  },
  {
    id: "mx-010",
    category_name: "Healthy Bowl",
    name: "Amino Athlete Bowl",
    description:
      "Grilled chicken, sweet potato, broccoli, edamame, egg, miso dressing.",
    price: 112000,
    badges: ["Best Seller", "GF"],
    rating: 4.8,
    calories: 690,
    protein: 51,
    fat: 22,
    carbs: 64,
  },
  {
    id: "mx-011",
    category_name: "Desserts",
    name: "Dark Chocolate Avocado Mousse",
    description:
      "Avocado cacao mousse, sea salt, coconut whip, toasted almond.",
    price: 62000,
    badges: ["Vegan", "GF"],
    rating: 4.7,
    calories: 340,
    protein: 7,
    fat: 23,
    carbs: 31,
  },
  {
    id: "mx-012",
    category_name: "Desserts",
    name: "Mango Sticky Black Rice",
    description:
      "Black rice, coconut cream, mango, sesame brittle, pandan syrup.",
    price: 59000,
    badges: ["Vegan"],
    rating: 4.8,
    calories: 410,
    protein: 6,
    fat: 12,
    carbs: 71,
  },
  {
    id: "mx-013",
    category_name: "Desserts",
    name: "Lemongrass Cheesecake Jar",
    description:
      "Cream cheese, lemongrass, biscuit crumble, passion fruit glaze.",
    price: 66000,
    badges: ["New"],
    rating: 4.6,
    calories: 460,
    protein: 8,
    fat: 27,
    carbs: 47,
  },
  {
    id: "mx-014",
    category_name: "Drinks",
    name: "Cold Brew Coconut Cloud",
    description:
      "Slow cold brew coffee, coconut foam, palm sugar, cinnamon dust.",
    price: 56000,
    badges: ["New"],
    rating: 4.8,
    calories: 190,
    protein: 2,
    fat: 8,
    carbs: 28,
  },
  {
    id: "mx-015",
    category_name: "Drinks",
    name: "Hibiscus Ginger Sparkle",
    description:
      "Hibiscus tea, ginger, lime, sparkling water, mint, no refined sugar.",
    price: 46000,
    badges: ["Vegan", "GF"],
    rating: 4.6,
    calories: 90,
    protein: 0,
    fat: 0,
    carbs: 22,
  },
  {
    id: "mx-016",
    category_name: "Drinks",
    name: "Matcha Moringa Frappe",
    description:
      "Ceremonial matcha, moringa, oat milk, vanilla, ice-blended creaminess.",
    price: 62000,
    badges: ["Vegan"],
    rating: 4.7,
    calories: 240,
    protein: 5,
    fat: 9,
    carbs: 35,
  },
  {
    id: "mx-017",
    category_name: "Coffee & Tea",
    name: "Single Origin V60 Bali Kintamani",
    description:
      "Manual brew with citrus aroma, brown sugar notes, clean finish.",
    price: 52000,
    badges: ["New"],
    rating: 4.9,
    calories: 5,
    protein: 0,
    fat: 0,
    carbs: 1,
  },
  {
    id: "mx-018",
    category_name: "Coffee & Tea",
    name: "Jasmine Kombucha Tea",
    description:
      "Lightly fermented jasmine green tea, probiotic sparkle, floral finish.",
    price: 54000,
    badges: ["Vegan", "GF"],
    rating: 4.5,
    calories: 70,
    protein: 0,
    fat: 0,
    carbs: 16,
  },
  {
    id: "mx-019",
    category_name: "Kids",
    name: "Mini Chicken Rice Plate",
    description:
      "Grilled chicken, steamed rice, carrot sticks, cucumber, mild sauce.",
    price: 58000,
    badges: ["GF"],
    rating: 4.7,
    calories: 420,
    protein: 28,
    fat: 12,
    carbs: 48,
  },
  {
    id: "mx-020",
    category_name: "Kids",
    name: "Banana Cocoa Smoothie",
    description: "Banana, cocoa, oat milk, dates, chia, no refined sugar.",
    price: 44000,
    badges: ["Vegan"],
    rating: 4.8,
    calories: 260,
    protein: 6,
    fat: 7,
    carbs: 46,
  },
];

const AMINO_EXTENDED_REVIEWS = [
  {
    id: "rx-001",
    name: "Nadia",
    rating: 5,
    body: "Booking cepat, meja sudah siap, dan lighting dinner-nya sangat cantik.",
    is_visible: true,
    verified: true,
    admin_reply: "Terima kasih sudah datang ke AMINO, Nadia.",
  },
  {
    id: "rx-002",
    name: "Daniel",
    rating: 5,
    body: "Menu sehat tapi tetap kaya rasa. Staff bantu rekomendasi GF dengan jelas.",
    is_visible: true,
    verified: true,
  },
  {
    id: "rx-003",
    name: "Putri",
    rating: 4,
    body: "Poke bowl segar, jus detox enak. Akan balik untuk breakfast.",
    is_visible: true,
    verified: false,
  },
];

const AMINO_DEFAULT_SETTINGS = {
  restaurant_name: "AMINO RESTO BALI",
  tagline: "Natural Luxury Dining • Healthy & Tasty Food",
  address: "Jl. Pantai Berawa, Canggu, Bali",
  phone: "+62 823-4188-5469",
  whatsapp: `https://wa.me/${WA_NUMBER}`,
  gojek_url: "https://www.gojek.com/gofood/",
  grabfood_url: "https://food.grab.com/",
  maps_embed:
    "https://maps.google.com/maps?q=Bali&t=&z=11&ie=UTF8&iwloc=&output=embed",
  tax_rate: 10,
  service_rate: 5,
  open_status: "Open",
  announcement: "PRICES ARE NOT FIXED; Tax 10% + Service 5% apply",
};

function aminoRead(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function aminoWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function aminoHydrateDemoData() {
  const categorySet = new Set(state.categories);
  ["Coffee & Tea", "Kids"].forEach((category) => categorySet.add(category));
  state.categories = [...categorySet];

  const existingMenuIds = new Set(state.menu.map((item) => String(item.id)));
  AMINO_EXTENDED_MENU.forEach((item) => {
    if (!existingMenuIds.has(String(item.id))) state.menu.push(item);
  });

  const existingReviewIds = new Set(
    state.reviews.map((review) => String(review.id)),
  );
  AMINO_EXTENDED_REVIEWS.forEach((review) => {
    if (!existingReviewIds.has(String(review.id))) state.reviews.push(review);
  });

  state.gallery =
    state.gallery.length >= 15
      ? state.gallery
      : Array.from({ length: 18 }, (_, index) => ({
          id: `gx-${index + 1}`,
          caption: [
            "Botanical dining corner",
            "Chef plating detail",
            "Breakfast natural light",
            "Smoothie bowl color palette",
            "Garden dinner ambience",
            "Coffee ritual",
            "Dessert close-up",
            "Healthy bowl texture",
            "Outdoor table mood",
          ][index % 9],
          category: ["interior", "food", "drink", "people"][index % 4],
          source_type: "url",
          height: 190 + (index % 5) * 42,
        }));

  state.promos = aminoRead("aminoPromos", [
    {
      id: "PROMO-BRUNCH",
      title: "Botanical Brunch Set",
      description: "Free detox shot for breakfast orders above Rp 150.000.",
      code: "AMINOBRUNCH",
      valid_from: "2026-05-01",
      valid_to: "2026-06-30",
      is_active: true,
    },
    {
      id: "PROMO-DINNER",
      title: "Natural Luxury Dinner",
      description: "Complimentary dessert for table booking 4+ guests.",
      code: "AMINODINNER",
      valid_from: "2026-05-01",
      valid_to: "2026-07-15",
      is_active: true,
    },
  ]);

  state.customers = aminoRead("aminoCustomers", [
    {
      id: "C-001",
      name: "Maya",
      email: "maya@example.com",
      phone: "+628111111",
      total_order: 8,
      role: "customer",
      loyalty_points: 240,
    },
    {
      id: "C-002",
      name: "Ardi",
      email: "ardi@example.com",
      phone: "+628222222",
      total_order: 5,
      role: "customer",
      loyalty_points: 160,
    },
    {
      id: "C-ADMIN",
      name: "Amino Admin",
      email: ADMIN_EMAIL,
      phone: "+6282341885469",
      total_order: 0,
      role: "admin",
      loyalty_points: 0,
    },
  ]);

  state.notifications = aminoRead("aminoNotifications", [
    {
      id: "N-001",
      type: "order",
      target_email: ADMIN_EMAIL,
      status: "sent",
      subject: "New AMINO Order",
      created_at: new Date().toISOString(),
    },
    {
      id: "N-002",
      type: "booking",
      target_email: ADMIN_EMAIL,
      status: "pending",
      subject: "New AMINO Booking",
      created_at: new Date().toISOString(),
    },
  ]);

  state.experienceLeads = aminoRead(
    "aminoExperienceLeads",
    state.experienceLeads || [],
  );
  state.settings = aminoRead("aminoSettings", AMINO_DEFAULT_SETTINGS);
}

function aminoAverageRating() {
  if (!state.reviews.length) return "0.0";
  const total = state.reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );
  return (total / state.reviews.length).toFixed(1);
}

function aminoRevenueToday() {
  return state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
}

function aminoStatusTimeline(status) {
  const steps = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "delivered",
    "completed",
  ];
  const currentIndex = Math.max(0, steps.indexOf(status));
  return `<div class="timeline">${steps
    .map(
      (step, index) =>
        `<span class="timeline-step ${index <= currentIndex ? "done" : ""}">${step}</span>`,
    )
    .join("")}</div>`;
}

function aminoOrderActions(orderId) {
  return `<div class="btn-row compact"><button class="btn ghost" data-order-status="${orderId}" data-status="confirmed">Confirm</button><button class="btn ghost" data-order-status="${orderId}" data-status="preparing">Preparing</button><button class="btn ghost" data-order-status="${orderId}" data-status="ready">Ready</button><button class="btn ghost" data-order-status="${orderId}" data-status="completed">Complete</button><button class="btn ghost" data-print-order="${orderId}">Print</button></div>`;
}

function enhancedOrdersPage() {
  return shell(
    `<section><span class="eyebrow">Tracking</span><h1>Status Pesanan</h1><p class="lead">Pantau pesanan dari pending sampai completed. Demo menyimpan status di localStorage; produksi menggunakan table orders Supabase.</p><div class="grid">${state.orders.length ? state.orders.map((order) => `<div class="card"><div class="section-head"><div><h3>${order.id}</h3><p>Status: <b>${order.status}</b></p></div><b>${rupiah(order.total)}</b></div>${aminoStatusTimeline(order.status)}<p class="muted">${new Date(order.created_at).toLocaleString("id-ID")}</p>${(order.items || []).map((item) => `<p>• ${escapeHtml(item.name)} x ${item.qty} — ${rupiah(item.price * item.qty)}</p>`).join("")}</div>`).join("") : '<div class="card">Belum ada pesanan.</div>'}</div></section>`,
  );
}

function enhancedProfilePage() {
  const u = activeUser();
  return shell(
    `<section><span class="eyebrow">Profile</span><h1>Profil User</h1><div class="two-col"><form class="card" id="profileForm"><div class="avatar" style="width:86px;height:86px;font-size:32px">${escapeHtml((u.name || "U")[0])}</div><label>Nama<input name="name" value="${escapeHtml(u.name)}" placeholder="Nama"></label><label>Email<input name="email" value="${escapeHtml(u.email)}" placeholder="Email"></label><label>Telepon<input name="phone" value="${escapeHtml(u.phone || "")}" placeholder="Telepon"></label><label>Avatar URL / upload manual<input name="avatar_url" value="${escapeHtml(u.avatar_url || "")}" placeholder="https://..."></label><label>Password baru<input name="password" type="password" placeholder="Password baru"></label><p>Role: <b>${escapeHtml(u.role || "customer")}</b></p><p>Poin loyalti: <b>${u.loyalty_points || 0}</b></p><button class="btn primary full">Simpan Profil</button><button type="button" class="btn ghost full" id="logoutBtn">Logout</button></form><div class="card"><h2>Riwayat</h2><p>Pesanan: ${state.orders.length}</p><p>Booking: ${state.bookings.length}</p><p>Review: ${state.reviews.filter((r) => r.name === u.name).length}</p><h3>Loyalty</h3><p class="notice">Setiap completed order menambah poin loyalty. Data demo disimpan lokal; Supabase memakai table loyalty_logs.</p></div></div></section>`,
  );
}

function enhancedAdminContent() {
  const settings = state.settings || AMINO_DEFAULT_SETTINGS;
  const dashboard = `<div class="stats"><div class="stat"><b>${rupiah(aminoRevenueToday())}</b><span>Revenue today</span></div><div class="stat"><b>${state.orders.length}</b><span>Orders today</span></div><div class="stat"><b>${state.bookings.filter((booking) => booking.status === "pending").length}</b><span>Pending bookings</span></div><div class="stat"><b>${aminoAverageRating()}</b><span>Average rating</span></div><div class="stat"><b>${state.customers.length}</b><span>Customers</span></div><div class="stat"><b>${(state.experienceLeads || []).length}</b><span>Experience leads</span></div><div class="stat"><b>●</b><span>Realtime ready</span></div></div>`;

  if (state.adminTab === "Dashboard") {
    return `${dashboard}<div class="two-col section"><div class="card"><h2>Live Operations</h2><p>Open status: <b>${settings.open_status}</b></p><p>${settings.announcement}</p><p>Tax ${settings.tax_rate}% • Service ${settings.service_rate}%</p></div><div class="card"><h2>Today Checklist</h2><ul><li>Verify manual orders</li><li>Confirm bookings</li><li>Reply new reviews</li><li>Check Gojek & GrabFood links</li><li>Follow up experience proposals</li></ul></div></div>`;
  }

  if (state.adminTab === "Menu Manager") {
    return `${dashboard}<div class="card section"><h2>Menu Manager</h2><form id="adminMenuForm" class="admin-form-grid"><input name="name" placeholder="Nama menu" required><select name="category_name">${state.categories.map((category) => `<option>${category}</option>`).join("")}</select><input name="price" type="number" placeholder="Harga" required><input name="badges" placeholder="Badges: Vegan,GF,New"><input name="calories" type="number" placeholder="Kalori"><input name="protein" type="number" placeholder="Protein"><input name="fat" type="number" placeholder="Lemak"><input name="carbs" type="number" placeholder="Karbo"><textarea name="description" placeholder="Deskripsi"></textarea><button class="btn primary">Tambah Menu Demo</button></form>${table(
      ["Item", "Category", "Price", "Flags", "Action"],
      state.menu.map((item) => [
        item.name,
        item.category_name,
        rupiah(item.price),
        (item.badges || []).join(", "),
        `<button class="mini-action" data-duplicate-menu="${item.id}">Duplicate</button> <button class="mini-action" data-toggle-menu="${item.id}">${item.is_available === false ? "Enable" : "Disable"}</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Orders") {
    return `<div class="card"><h2>Orders</h2><p>Filter status, update status, print struk, lihat lokasi customer, kirim email update, dan verifikasi item manual.</p>${state.orders.length ? state.orders.map((order) => `<div class="admin-order-card"><div><h3>${order.id}</h3><p>${order.customer_name || "Guest"} • ${order.order_type} • ${rupiah(order.total)}</p>${aminoStatusTimeline(order.status)}</div>${aminoOrderActions(order.id)}</div>`).join("") : "<p>No orders yet.</p>"}</div>`;
  }

  if (state.adminTab === "Bookings") {
    return `<div class="card"><h2>Bookings</h2><p>Confirm/cancel/complete dan print booking list.</p>${table(
      ["Name", "Date", "Time", "Guests", "Status", "Action"],
      state.bookings.map((booking) => [
        booking.name,
        booking.booking_date || booking.date,
        booking.booking_time || booking.time,
        booking.guests,
        booking.status,
        `<button class="mini-action" data-booking-status="${booking.id}" data-status="confirmed">Confirm</button> <button class="mini-action" data-booking-status="${booking.id}" data-status="cancelled">Cancel</button> <button class="mini-action" data-booking-status="${booking.id}" data-status="completed">Complete</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Customers") {
    return `<div class="card"><h2>Customers</h2>${table(
      ["Name", "Email", "Phone", "Orders", "Role", "Points", "Action"],
      state.customers.map((customer) => [
        customer.name,
        customer.email,
        customer.phone,
        customer.total_order,
        customer.role,
        customer.loyalty_points,
        `<button class="mini-action" data-role-toggle="${customer.id}">Toggle Role</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Gallery") {
    return `<div class="card"><h2>Gallery</h2><form id="adminGalleryForm" class="admin-form-grid"><input name="image_url" placeholder="URL gambar / path storage" required><input name="caption" placeholder="Caption"><select name="category"><option>food</option><option>drink</option><option>interior</option><option>people</option></select><button class="btn primary">Tambah Gallery</button></form><div class="masonry section">${state.gallery.map((item) => `<div class="gallery-tile" style="--h:${item.height || 220}px"><span>${escapeHtml(item.caption || "AMINO")}</span><button class="mini-action floating-delete" data-delete-gallery="${item.id}">Delete</button></div>`).join("")}</div></div>`;
  }

  if (state.adminTab === "Reviews") {
    return `<div class="card"><h2>Reviews</h2>${table(
      ["Name", "Rating", "Review", "Visible", "Verified", "Action"],
      state.reviews.map((review, index) => [
        review.name,
        review.rating,
        review.body,
        review.is_visible !== false ? "yes" : "no",
        review.verified ? "yes" : "no",
        `<button class="mini-action" data-review-visible="${index}">Visible</button> <button class="mini-action" data-review-verify="${index}">Verify</button> <button class="mini-action" data-review-reply="${index}">Reply</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Promos") {
    return `<div class="card"><h2>Promos</h2><form id="adminPromoForm" class="admin-form-grid"><input name="title" placeholder="Judul promo" required><input name="code" placeholder="Kode promo" required><input name="valid_from" type="date"><input name="valid_to" type="date"><textarea name="description" placeholder="Deskripsi promo"></textarea><button class="btn primary">Tambah Promo</button></form>${table(
      ["Title", "Code", "Valid", "Active", "Action"],
      state.promos.map((promo) => [
        promo.title,
        promo.code,
        `${promo.valid_from || "-"} → ${promo.valid_to || "-"}`,
        promo.is_active ? "yes" : "no",
        `<button class="mini-action" data-promo-toggle="${promo.id}">Toggle</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Experience Leads") {
    return `<div class="card"><h2>Experience Leads</h2><p>Pipeline proposal untuk chef table, wellness brunch, private dinner, catering, dan event AMINO.</p>${table(
      ["Lead", "Phone", "Package", "Date", "Guests", "Status", "Action"],
      (state.experienceLeads || []).map((lead) => [
        lead.name,
        lead.phone,
        lead.package_name,
        lead.date || lead.event_date || "Flexible",
        lead.guests || "-",
        lead.status || "proposal",
        `<button class="mini-action" data-experience-status="${lead.id}" data-status="contacted">Contacted</button> <button class="mini-action" data-experience-status="${lead.id}" data-status="quoted">Quoted</button> <button class="mini-action" data-experience-status="${lead.id}" data-status="won">Won</button> <button class="mini-action" data-experience-status="${lead.id}" data-status="lost">Lost</button>`,
      ]),
    )}</div>`;
  }

  if (state.adminTab === "Settings") {
    return `<div class="card"><h2>Settings</h2><form id="adminSettingsForm" class="settings-grid"><label>Nama restoran<input name="restaurant_name" value="${escapeHtml(settings.restaurant_name)}"></label><label>Tagline<input name="tagline" value="${escapeHtml(settings.tagline)}"></label><label>Alamat<input name="address" value="${escapeHtml(settings.address)}"></label><label>Phone<input name="phone" value="${escapeHtml(settings.phone)}"></label><label>WhatsApp<input name="whatsapp" value="${escapeHtml(settings.whatsapp)}"></label><label>Gojek URL<input name="gojek_url" value="${escapeHtml(settings.gojek_url)}"></label><label>GrabFood URL<input name="grabfood_url" value="${escapeHtml(settings.grabfood_url)}"></label><label>Maps Embed<textarea name="maps_embed">${escapeHtml(settings.maps_embed)}</textarea></label><label>Tax %<input name="tax_rate" type="number" value="${settings.tax_rate}"></label><label>Service %<input name="service_rate" type="number" value="${settings.service_rate}"></label><label>Open status<select name="open_status"><option ${settings.open_status === "Open" ? "selected" : ""}>Open</option><option ${settings.open_status === "Closed" ? "selected" : ""}>Closed</option></select></label><label>Announcement<textarea name="announcement">${escapeHtml(settings.announcement)}</textarea></label><button class="btn primary full">Save Settings</button></form></div>`;
  }

  if (state.adminTab === "Notifications Log") {
    const notificationRows = (state.notifications || []).map((item) => [
      item.type,
      item.channel || "in_app",
      item.target_email || item.audience || "all",
      item.title || item.subject,
      item.priority || "normal",
      item.status,
      item.read_at ? "yes" : "no",
      new Date(item.created_at).toLocaleString("id-ID"),
      `<button class="mini-action" data-notification-read="${item.id}">${item.read_at ? "Unread" : "Read"}</button> <button class="mini-action" data-notification-status="${item.id}" data-status="sent">Sent</button> <button class="mini-action" data-notification-status="${item.id}" data-status="failed">Failed</button> <button class="mini-action" data-notification-archive="${item.id}">Archive</button>`,
    ]);
    return `<div class="card"><h2>Notifications Log</h2><p>Log lengkap in-app/browser/email dengan status, read receipt, priority, dan action URL.</p><div class="btn-row"><a class="btn primary" href="#/notifications">Open Notification Center</a></div>${table(
      ["Type", "Channel", "Target", "Title", "Priority", "Status", "Read", "Created", "Action"],
      notificationRows,
    )}</div>`;
  }

  return `<div class="card"><h2>${state.adminTab}</h2><p>Module siap dikembangkan.</p></div>`;
}

function enhancedAdminPage() {
  const isAdmin =
    activeUser().role === "admin" || activeUser().email === ADMIN_EMAIL;
  if (!isAdmin) {
    return shell(
      `<section class="card"><h1>Admin Restricted</h1><p class="notice">Panel admin hanya untuk role = admin di table profiles. Login demo dengan email ${ADMIN_EMAIL} untuk melihat panel.</p><a class="btn primary" href="#/login">Login</a></section>`,
    );
  }
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
    `<section><span class="eyebrow">Admin</span><h1>Control Center</h1><div class="admin-shell"><aside class="admin-side">${tabs.map((tab) => `<button class="${state.adminTab === tab ? "active" : ""}" data-admin-tab="${tab}">${tab}</button>`).join("")}</aside><div id="adminContent">${enhancedAdminContent()}</div></div></section>`,
  );
}

function aminoSaveProfile(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  state.user = {
    ...activeUser(),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    avatar_url: form.get("avatar_url"),
  };
  localStorage.setItem("aminoUser", JSON.stringify(state.user));
  toast("Profil tersimpan.");
  render();
}

function aminoAddAdminMenu(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  const item = {
    id: `admin-menu-${Date.now()}`,
    category_name: form.category_name,
    name: form.name,
    description: form.description,
    price: Number(form.price || 0),
    badges: String(form.badges || "")
      .split(",")
      .map((badge) => badge.trim())
      .filter(Boolean),
    calories: Number(form.calories || 0),
    protein: Number(form.protein || 0),
    fat: Number(form.fat || 0),
    carbs: Number(form.carbs || 0),
    rating: 4.8,
    is_available: true,
    is_new: true,
  };
  state.menu.unshift(item);
  toast("Menu demo ditambahkan.");
  render();
}

function aminoAddGallery(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  state.gallery.unshift({
    id: `gallery-${Date.now()}`,
    image_url: form.image_url,
    caption: form.caption,
    category: form.category,
    source_type: "url",
    height: 240,
  });
  toast("Gallery ditambahkan.");
  render();
}

function aminoAddPromo(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target));
  state.promos.unshift({
    id: `promo-${Date.now()}`,
    title: form.title,
    code: form.code,
    description: form.description,
    valid_from: form.valid_from,
    valid_to: form.valid_to,
    is_active: true,
  });
  aminoWrite("aminoPromos", state.promos);
  toast("Promo ditambahkan.");
  render();
}

function aminoSaveSettings(event) {
  event.preventDefault();
  state.settings = Object.fromEntries(new FormData(event.target));
  state.settings.tax_rate = Number(state.settings.tax_rate || 10);
  state.settings.service_rate = Number(state.settings.service_rate || 5);
  aminoWrite("aminoSettings", state.settings);
  toast("Settings tersimpan lokal dan siap dipindahkan ke Supabase.");
  render();
}

function aminoPrintOrder(orderId) {
  const order = state.orders.find(
    (item) => String(item.id) === String(orderId),
  );
  if (!order) return toast("Order tidak ditemukan.");
  const popup = window.open("", "_blank", "width=420,height=720");
  if (!popup) return toast("Popup print diblokir browser.");
  popup.document.write(
    `<html><head><title>Receipt ${order.id}</title><style>body{font-family:monospace;padding:20px}.line{display:flex;justify-content:space-between;border-bottom:1px dashed #ccc;padding:6px 0}</style></head><body><h1>AMINO RESTO BALI</h1><p>${order.id}</p><p>${order.customer_name || "Guest"}</p>${(order.items || []).map((item) => `<div class="line"><span>${item.name} x ${item.qty}</span><b>${rupiah(item.price * item.qty)}</b></div>`).join("")}<h2>Total ${rupiah(order.total)}</h2><p>PRICES ARE NOT FIXED</p><p>Tax 10% + Service 5% apply</p><script>window.print();<\/script></body></html>`,
  );
  popup.document.close();
}

function aminoHandleEnhancedClick(event) {
  const target = event.target;
  if (target.dataset.orderStatus) {
    const order = state.orders.find(
      (item) => String(item.id) === String(target.dataset.orderStatus),
    );
    if (order) {
      order.status = target.dataset.status;
      localStorage.setItem("aminoOrders", JSON.stringify(state.orders));
      toast(`Order ${order.id} menjadi ${order.status}`);
      render();
    }
  }
  if (target.dataset.printOrder) aminoPrintOrder(target.dataset.printOrder);
  if (target.dataset.bookingStatus) {
    const booking = state.bookings.find(
      (item) => String(item.id) === String(target.dataset.bookingStatus),
    );
    if (booking) {
      booking.status = target.dataset.status;
      localStorage.setItem("aminoBookings", JSON.stringify(state.bookings));
      toast(`Booking ${booking.name} menjadi ${booking.status}`);
      render();
    }
  }
  if (target.dataset.roleToggle) {
    const customer = state.customers.find(
      (item) => String(item.id) === String(target.dataset.roleToggle),
    );
    if (customer) {
      customer.role = customer.role === "admin" ? "customer" : "admin";
      aminoWrite("aminoCustomers", state.customers);
      toast(`Role ${customer.email} menjadi ${customer.role}`);
      render();
    }
  }
  if (target.dataset.duplicateMenu) {
    const item = state.menu.find(
      (menuItem) =>
        String(menuItem.id) === String(target.dataset.duplicateMenu),
    );
    if (item) {
      state.menu.unshift({
        ...item,
        id: `duplicate-${Date.now()}`,
        name: `${item.name} Copy`,
        is_new: true,
      });
      toast("Menu diduplicate.");
      render();
    }
  }
  if (target.dataset.toggleMenu) {
    const item = state.menu.find(
      (menuItem) => String(menuItem.id) === String(target.dataset.toggleMenu),
    );
    if (item) {
      item.is_available = item.is_available === false;
      toast(`${item.name} ${item.is_available ? "available" : "disabled"}.`);
      render();
    }
  }
  if (target.dataset.deleteGallery) {
    state.gallery = state.gallery.filter(
      (item) => String(item.id) !== String(target.dataset.deleteGallery),
    );
    toast("Gallery dihapus.");
    render();
  }
  if (target.dataset.reviewVisible) {
    const review = state.reviews[Number(target.dataset.reviewVisible)];
    review.is_visible = review.is_visible === false;
    toast("Visibility review diubah.");
    render();
  }
  if (target.dataset.reviewVerify) {
    const review = state.reviews[Number(target.dataset.reviewVerify)];
    review.verified = !review.verified;
    toast("Verified review diubah.");
    render();
  }
  if (target.dataset.reviewReply) {
    const review = state.reviews[Number(target.dataset.reviewReply)];
    const reply = prompt(
      "Balasan admin:",
      review.admin_reply || "Terima kasih sudah berkunjung ke AMINO.",
    );
    if (reply !== null) {
      review.admin_reply = reply;
      toast("Reply admin disimpan.");
      render();
    }
  }
  if (target.dataset.experienceStatus) {
    const lead = (state.experienceLeads || []).find(
      (item) => String(item.id) === String(target.dataset.experienceStatus),
    );
    if (lead) {
      lead.status = target.dataset.status;
      aminoWrite("aminoExperienceLeads", state.experienceLeads);
      toast(`Experience lead ${lead.name} menjadi ${lead.status}`);
      render();
    }
  }
  if (target.dataset.promoToggle) {
    const promo = state.promos.find(
      (item) => String(item.id) === String(target.dataset.promoToggle),
    );
    if (promo) {
      promo.is_active = !promo.is_active;
      aminoWrite("aminoPromos", state.promos);
      toast("Promo active status diubah.");
      render();
    }
  }
}

function aminoBindEnhancedForms() {
  $("#profileForm")?.addEventListener("submit", aminoSaveProfile);
  $("#adminMenuForm")?.addEventListener("submit", aminoAddAdminMenu);
  $("#adminGalleryForm")?.addEventListener("submit", aminoAddGallery);
  $("#adminPromoForm")?.addEventListener("submit", aminoAddPromo);
  $("#adminSettingsForm")?.addEventListener("submit", aminoSaveSettings);
}

function aminoPatchCoreRoutes() {
  routes["#/orders"] = enhancedOrdersPage;
  routes["#/profile"] = enhancedProfilePage;
  routes["#/admin"] = enhancedAdminPage;
  const originalBindPage = bindPage;
  bindPage = function patchedBindPage() {
    originalBindPage();
    aminoBindEnhancedForms();
  };
}

function aminoStartEnhancements() {
  aminoHydrateDemoData();
  aminoPatchCoreRoutes();
  document.addEventListener("click", aminoHandleEnhancedClick);
  if (!location.hash) location.hash = "#/home";
  render();
  toast(
    "AMINO extended demo aktif: menu, admin CRUD, tracking, promos, settings.",
  );
}

setTimeout(aminoStartEnhancements, 350);
