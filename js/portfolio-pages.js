/*
  AMINO RESTO BALI — portfolio-grade 8 page website presentation.
  This layer is intentionally detailed for web designer job applications:
  1. Cover + moodboard
  2. Login & register customer
  3. Homepage desktop
  4. Homepage mobile
  5. Menu & product detail
  6. Cart, checkout & booking
  7. Contact, location, gallery & reviews
  8. Admin dashboard

  Everything is vanilla JavaScript. The pages use the existing live app state,
  cart, Supabase hooks, fallback menu, gallery, reviews, and localStorage.
*/

(function aminoPortfolioPages() {
  const PORTFOLIO_STORAGE_KEY = "aminoPortfolioState";
  const PORTFOLIO_BOOKING_KEY = "aminoPortfolioBookings";
  const PORTFOLIO_MESSAGES_KEY = "aminoPortfolioMessages";

  const portfolioPages = [
    {
      number: "01",
      title: "Cover + Moodboard",
      route: "#/cover-moodboard",
      summary:
        "Brand story, palette, typography, atmosphere, and premium café mood.",
    },
    {
      number: "02",
      title: "Login & Register Customer",
      route: "#/auth-customer",
      summary: "Customer authentication, benefits, loyalty, and onboarding UX.",
    },
    {
      number: "03",
      title: "Homepage Desktop",
      route: "#/home-desktop",
      summary:
        "Large hero, premium food card, operating hours, featured menus.",
    },
    {
      number: "04",
      title: "Homepage Mobile",
      route: "#/home-mobile",
      summary: "Mobile-first landing screen, bottom navigation, quick CTAs.",
    },
    {
      number: "05",
      title: "Menu & Detail Produk",
      route: "#/menu-product",
      summary:
        "Searchable catalog, dietary badges, variants, product detail panel.",
    },
    {
      number: "06",
      title: "Cart, Checkout & Booking",
      route: "#/cart-booking",
      summary: "Cart summary, manual order, taxes, booking slot simulator.",
    },
    {
      number: "07",
      title: "Contact, Location, Gallery & Reviews",
      route: "#/contact-gallery-reviews",
      summary:
        "Contact cards, maps, masonry gallery, social proof, review form.",
    },
    {
      number: "08",
      title: "Admin Dashboard",
      route: "#/admin-dashboard-pro",
      summary:
        "Revenue, orders, bookings, customers, menu ops, and realtime location.",
    },
  ];

  const moodboardColors = [
    {
      name: "Cream Linen",
      value: "#fff8ea",
      usage: "Background, cards, warmth",
    },
    {
      name: "Dark Green",
      value: "#093b32",
      usage: "Headers, nav, premium contrast",
    },
    { name: "Teal Leaf", value: "#0d7c73", usage: "CTA, status, freshness" },
    { name: "Warm Brown", value: "#8b5e34", usage: "Wood, coffee, interior" },
    {
      name: "Soft Gold",
      value: "#c99b42",
      usage: "Price, badge, luxury accent",
    },
    {
      name: "Coconut White",
      value: "#ffffff",
      usage: "Surface, clean whitespace",
    },
  ];

  const typeScale = [
    {
      token: "Display",
      size: "72/78",
      usage: "Hero title and portfolio cover",
    },
    { token: "H1", size: "48/56", usage: "Page title" },
    { token: "H2", size: "34/42", usage: "Section heading" },
    { token: "Body", size: "16/28", usage: "Readable content" },
    { token: "Label", size: "12/16", usage: "Badges, metadata, form labels" },
  ];

  const serviceBlueprint = [
    {
      phase: "Browse",
      customer: "Search menu, view badges, compare prices",
      system:
        "Fetch menu_items and categories, fallback data if Supabase not ready",
      admin: "Keep menu availability accurate",
    },
    {
      phase: "Decide",
      customer: "Open product detail, see nutrition, add notes",
      system: "Calculate price, tax, service, variants",
      admin: "Monitor popular items and stock",
    },
    {
      phase: "Order",
      customer: "Checkout or WhatsApp order, share geolocation for delivery",
      system: "Create orders and order_items, invoke email function",
      admin: "Confirm, prepare, print receipt, verify manual item",
    },
    {
      phase: "Return",
      customer: "Track status, leave review, earn loyalty",
      system: "Update order status, store reviews, loyalty_logs",
      admin: "Reply reviews and manage promos",
    },
  ];

  const bookingSlots = [
    "07:30",
    "08:00",
    "09:30",
    "11:00",
    "13:00",
    "15:30",
    "18:00",
    "19:30",
    "21:00",
  ];

  let selectedPortfolioProductId = null;

  function readPortfolio(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function writePortfolio(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function portfolioState() {
    return readPortfolio(PORTFOLIO_STORAGE_KEY, {
      selectedSlot: "18:00",
      selectedGuests: 2,
      preferredTable: "Garden Window",
      designMode: "premium",
    });
  }

  function savePortfolioState(next) {
    writePortfolio(PORTFOLIO_STORAGE_KEY, { ...portfolioState(), ...next });
  }

  function featuredItems(limit = 4) {
    const pool = state.menu.filter(
      (item) =>
        item.is_recommended ||
        item.is_best_seller ||
        itemBadges(item).includes("Best"),
    );
    return (pool.length ? pool : state.menu).slice(0, limit);
  }

  function portfolioShell(activeRoute, content) {
    const nav = portfolioPages
      .map(
        (page) =>
          `<a class="portfolio-tab ${activeRoute === page.route ? "active" : ""}" href="${page.route}"><b>${page.number}</b><span>${page.title}</span></a>`,
      )
      .join("");
    return shell(`<section class="portfolio-layout">
      <aside class="portfolio-sidebar card">
        <span class="eyebrow">8 Page Mockup</span>
        <h2>AMINO Case Study</h2>
        <p class="muted">Premium café website, responsive UI, real flows, admin tools, and Supabase-ready backend.</p>
        <nav>${nav}</nav>
      </aside>
      <div class="portfolio-content">${content}</div>
    </section>`);
  }

  function portfolioIndexPage() {
    const cards = portfolioPages
      .map(
        (page) =>
          `<a class="portfolio-index-card card" href="${page.route}"><b>${page.number}</b><h3>${page.title}</h3><p>${page.summary}</p><span>Open page →</span></a>`,
      )
      .join("");
    return shell(`<section class="portfolio-cover-intro">
      <div class="portfolio-hero card">
        <span class="eyebrow">Portfolio Website</span>
        <h1>AMINO RESTO BALI — 8 Page Premium Café Website</h1>
        <p class="lead">Mockup lengkap untuk lamar kerja web designer: cover, auth, desktop, mobile, menu detail, checkout booking, contact gallery reviews, dan admin dashboard.</p>
        <div class="btn-row"><a class="btn primary" href="#/cover-moodboard">Start Presentation</a><a class="btn gold" href="#/home">Open Live Site</a></div>
      </div>
      <div class="portfolio-index-grid">${cards}</div>
    </section>`);
  }

  function coverMoodboardPage() {
    const colorCards = moodboardColors
      .map(
        (color) =>
          `<div class="mood-color"><span style="background:${color.value}"></span><b>${color.name}</b><small>${color.value}</small><p>${color.usage}</p></div>`,
      )
      .join("");
    const typography = typeScale
      .map(
        (type) =>
          `<div class="type-row"><b>${type.token}</b><span>${type.size}</span><p>${type.usage}</p></div>`,
      )
      .join("");
    const blueprint = serviceBlueprint
      .map(
        (item) =>
          `<div class="blueprint-row"><b>${item.phase}</b><p><strong>Customer:</strong> ${item.customer}</p><p><strong>System:</strong> ${item.system}</p><p><strong>Admin:</strong> ${item.admin}</p></div>`,
      )
      .join("");
    return portfolioShell(
      "#/cover-moodboard",
      `<section class="portfolio-page cover-page">
        <div class="portfolio-cover-grid">
          <div class="cover-copy card">
            <span class="eyebrow">Cover + Moodboard</span>
            <h1>Natural Luxury Dining for Healthy Bali Lifestyle</h1>
            <p class="lead">Arah visual dibuat premium café: cream linen background, dark green contrast, warm brown wood tone, soft gold accents, rounded cards, large food photography area, and elegant admin dashboard.</p>
            <div class="cover-meta"><span>Brand: AMINO RESTO BALI</span><span>Style: Botanical Luxury</span><span>Stack: Vanilla HTML/CSS/JS + Supabase</span></div>
          </div>
          <div class="cover-visual card"><div class="cover-plate-art"><span></span><i></i><b>AMINO</b></div></div>
        </div>
        <section class="section card"><h2>Color Moodboard</h2><div class="mood-grid">${colorCards}</div></section>
        <section class="section two-col"><div class="card"><h2>Typography Scale</h2>${typography}</div><div class="card"><h2>Experience Keywords</h2><div class="keyword-cloud"><span>Natural</span><span>Luxury</span><span>Healthy</span><span>Tasty</span><span>Fast</span><span>Warm</span><span>Premium</span><span>Trustworthy</span></div></div></section>
        <section class="section card"><h2>Service Blueprint</h2><div class="blueprint-grid">${blueprint}</div></section>
      </section>`,
    );
  }

  function authCustomerPage() {
    return portfolioShell(
      "#/auth-customer",
      `<section class="portfolio-page auth-showcase">
        <span class="eyebrow">Login & Register Customer</span>
        <h1>Customer Account Flow</h1>
        <p class="lead">Auth dibuat tidak hanya form, tapi onboarding customer: loyalty points, order history, booking history, dietary preference, dan Google login placeholder yang jujur disabled.</p>
        <div class="auth-mock-grid">
          <form class="card auth-panel" id="portfolioLoginForm">
            <h2>Welcome back</h2>
            <p class="muted">Login untuk checkout, tracking order, loyalty, dan review verified.</p>
            <label>Email<input name="email" type="email" value="guest@amino.test" required></label>
            <label>Password<input name="password" type="password" value="aminodemo" required></label>
            <button class="btn primary full">Login Demo</button>
            <button type="button" class="btn ghost full" disabled>Google login belum aktif</button>
          </form>
          <form class="card auth-panel" id="portfolioRegisterForm">
            <h2>Create account</h2>
            <label>Nama<input name="name" value="Amino Guest" required></label>
            <label>Telepon<input name="phone" value="+628123456789" required></label>
            <label>Email<input name="email" type="email" value="newguest@amino.test" required></label>
            <label>Password<input name="password" type="password" value="aminodemo" required></label>
            <label class="checkline"><input type="checkbox" checked required> Saya setuju dengan kebijakan AMINO</label>
            <button class="btn gold full">Register Demo</button>
          </form>
          <div class="card auth-benefits"><h2>Customer Benefits</h2><ul><li>Checkout lebih cepat dengan profil tersimpan.</li><li>Booking meja dengan status pending/confirmed.</li><li>Order tracking realtime.</li><li>Review verified dan loyalty points.</li><li>Alamat delivery bisa pakai geolokasi.</li></ul><a class="btn primary full" href="#/profile">Open Profile</a></div>
        </div>
      </section>`,
    );
  }

  function homepageDesktopPage() {
    const items = featuredItems(3)
      .map(
        (item) =>
          `<article class="desktop-feature-card"><div class="food-img"><span class="overlay-price">${shortPrice(item.price)}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || "")}</p><div class="badges">${itemBadges(item)}</div></article>`,
      )
      .join("");
    return portfolioShell(
      "#/home-desktop",
      `<section class="portfolio-page desktop-home-page">
        <div class="desktop-browser-frame">
          <div class="browser-bar"><span></span><span></span><span></span><b>aminoresto.bali/home</b></div>
          <div class="desktop-home-hero">
            <div><span class="eyebrow">Natural Luxury Dining</span><h1>Healthy & Tasty Food for Bali Days</h1><p>Homepage desktop menggunakan whitespace lega, foto makanan besar, CTA jelas, operating hours, dan menu populer yang langsung bisa masuk cart.</p><div class="btn-row"><a class="btn primary" href="#/menu">View Menu</a><a class="btn gold" href="#/booking">Book Table</a><button class="btn ghost" data-wa>WhatsApp</button></div></div>
            <div class="desktop-food-visual"><div class="price-pill">Chef Special • ${shortPrice(138000)}</div><div class="plate"></div></div>
          </div>
          <div class="desktop-feature-grid">${items}</div>
        </div>
        <section class="section card"><h2>Desktop UX Checklist</h2><div class="check-grid"><span>✓ Sticky glass navbar</span><span>✓ Large premium hero</span><span>✓ Food image emphasis</span><span>✓ Fast booking CTA</span><span>✓ Menu preview cards</span><span>✓ Trust/review section</span></div></section>
      </section>`,
    );
  }

  function homepageMobilePage() {
    const item = featuredItems(1)[0] || state.menu[0];
    return portfolioShell(
      "#/home-mobile",
      `<section class="portfolio-page mobile-home-page">
        <span class="eyebrow">Homepage Mobile</span>
        <h1>Mobile-first customer flow</h1>
        <div class="phone-mockup">
          <div class="phone-speaker"></div>
          <div class="phone-screen">
            <div class="phone-top"><b>AMINO</b><span>🛒 ${state.cart.reduce((sum, cartItem) => sum + cartItem.qty, 0)}</span></div>
            <div class="phone-hero"><span>Natural Luxury</span><h2>Healthy brunch, dinner & delivery</h2><button class="btn primary full">Order Now</button></div>
            <div class="phone-card"><div class="food-img"><span class="overlay-price">${shortPrice(item?.price || 78000)}</span></div><h3>${escapeHtml(item?.name || "Amino Avocado Toast")}</h3><p>${escapeHtml(item?.description || "Fresh healthy food")}</p><button class="btn gold full" data-add="${item?.id || "m1"}">Add to Cart</button></div>
            <div class="phone-bottom"><span>⌂</span><span>🍽</span><span>🛒</span><span>📦</span><span>👤</span></div>
          </div>
        </div>
        <section class="section card"><h2>Mobile UX Detail</h2><p>CTA dibuat thumb-friendly, card besar, bottom nav stabil, dan informasi harga/badge terlihat sebelum user scroll terlalu jauh.</p></section>
      </section>`,
    );
  }

  function menuProductPage() {
    const selected =
      state.menu.find(
        (item) => String(item.id) === String(selectedPortfolioProductId),
      ) || state.menu[0];
    const catalog = state.menu
      .slice(0, 12)
      .map(
        (item) =>
          `<button class="portfolio-menu-row ${selected && String(item.id) === String(selected.id) ? "active" : ""}" data-portfolio-product="${item.id}"><span>${escapeHtml(item.name)}</span><b>${shortPrice(item.price)}</b></button>`,
      )
      .join("");
    return portfolioShell(
      "#/menu-product",
      `<section class="portfolio-page menu-product-page">
        <span class="eyebrow">Menu & Detail Produk</span>
        <h1>Searchable Product Experience</h1>
        <div class="menu-product-grid">
          <div class="card"><h2>Menu Catalog</h2><input id="portfolioMenuSearch" placeholder="Cari menu cepat"><div class="portfolio-menu-list">${catalog}</div></div>
          <div class="card product-detail-panel">
            <div class="food-img product-detail-visual"><span class="overlay-price">${shortPrice(selected?.price || 0)}</span></div>
            <h2>${escapeHtml(selected?.name || "Menu")}</h2>
            <p class="muted">${escapeHtml(selected?.description || "")}</p>
            <div class="badges">${selected ? itemBadges(selected) : ""}</div>
            <div class="nutrition-grid"><div><b>${selected?.calories || 0}</b><small>kcal</small></div><div><b>${selected?.protein || 0}g</b><small>protein</small></div><div><b>${selected?.fat || 0}g</b><small>fat</small></div><div><b>${selected?.carbs || 0}g</b><small>carbs</small></div></div>
            <label>Variant<select id="portfolioVariant"><option value="0">Regular</option><option value="15000">Large + Rp 15.000</option><option value="25000">Premium protein + Rp 25.000</option></select></label>
            <label>Notes<textarea id="portfolioProductNotes" placeholder="Less spicy, no onion, extra sauce"></textarea></label>
            <div class="btn-row"><button class="btn primary" data-portfolio-add-detail="${selected?.id || ""}">Add Detail to Cart</button><button class="btn ghost" data-quick="${selected?.id || ""}">Quick View</button></div>
          </div>
        </div>
      </section>`,
    );
  }

  function cartBookingPage() {
    const totals = cartTotals();
    const bookingDrafts = readPortfolio(PORTFOLIO_BOOKING_KEY, []);
    const slots = bookingSlots
      .map(
        (slot) =>
          `<button class="slot-pill" data-slot-choice="${slot}">${slot}</button>`,
      )
      .join("");
    return portfolioShell(
      "#/cart-booking",
      `<section class="portfolio-page cart-booking-page">
        <span class="eyebrow">Cart, Checkout & Booking</span>
        <h1>Transaction Flow</h1>
        <div class="transaction-grid">
          <div class="card"><h2>Cart Summary</h2><div id="portfolioCartPreview">${state.cart.length ? state.cart.map((item, index) => `<div class="ux-list-row"><div><b>${escapeHtml(item.name)}</b><p>${item.qty} × ${rupiah(item.price)}</p></div><button class="mini-action" data-remove="${index}">Remove</button></div>`).join("") : '<p class="muted">Cart kosong. Tambahkan menu dulu.</p>'}</div><div class="totals">${totalsHtml(totals)}</div><a class="btn primary full" href="#/cart">Open Real Checkout</a></div>
          <form class="card" id="portfolioBookingForm"><h2>Booking Simulator</h2><input name="name" value="Amino Guest" required><input name="phone" value="+628123456789" required><input name="date" type="date" required><div class="slot-grid">${slots}</div><input name="slot" id="portfolioSelectedSlot" value="18:00" readonly><input name="guests" type="number" min="1" value="2"><textarea name="notes" placeholder="Table preference, dietary notes"></textarea><button class="btn gold full">Save Booking Draft</button></form>
          <div class="card"><h2>Booking Drafts</h2>${bookingDrafts.length ? bookingDrafts.map((booking) => `<div class="ux-list-row"><div><b>${escapeHtml(booking.name)}</b><p>${booking.date} • ${booking.slot} • ${booking.guests} pax</p></div><span class="diet-badge">${booking.status}</span></div>`).join("") : '<p class="muted">Belum ada booking draft.</p>'}</div>
        </div>
      </section>`,
    );
  }

  function contactGalleryReviewsPage() {
    const messages = readPortfolio(PORTFOLIO_MESSAGES_KEY, []);
    const gallery = state.gallery
      .slice(0, 10)
      .map(
        (item, index) =>
          `<div class="gallery-tile portfolio-gallery-tile" style="--h:${item.height || 220}px" data-lightbox="${index}"><span>${escapeHtml(item.caption || "AMINO Moment")}</span></div>`,
      )
      .join("");
    return portfolioShell(
      "#/contact-gallery-reviews",
      `<section class="portfolio-page contact-page">
        <span class="eyebrow">Contact, Location, Gallery & Reviews</span>
        <h1>Trust & Visit Flow</h1>
        <div class="contact-grid">
          <div class="card"><h2>Contact</h2><p>Jl. Pantai Berawa, Canggu, Bali</p><p>+62 823-4188-5469</p><p>aminoresto@gmail.com</p><div class="btn-row"><a class="btn primary" href="#/live-location">Live Location</a><button class="btn gold" data-wa>WhatsApp</button></div></div>
          <form class="card" id="portfolioMessageForm"><h2>Message Form</h2><input name="name" placeholder="Nama" required><input name="email" type="email" placeholder="Email" required><textarea name="message" placeholder="Pesan" required></textarea><button class="btn primary full">Send Message Demo</button></form>
          <div class="card"><h2>Message Drafts</h2>${messages.length ? messages.map((message) => `<p>• ${escapeHtml(message.name)} — ${escapeHtml(message.message)}</p>`).join("") : '<p class="muted">Belum ada message.</p>'}</div>
        </div>
        <section class="section card"><h2>Gallery Masonry</h2><div class="masonry">${gallery}</div></section>
        <section class="section"><h2>Reviews</h2><div class="grid cards">${state.reviews.slice(0, 4).map(reviewCard).join("")}</div></section>
      </section>`,
    );
  }

  function adminDashboardProPage() {
    const revenue = state.orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    const pendingBookings = state.bookings.filter(
      (booking) => booking.status === "pending",
    ).length;
    const bars = [65, 44, 78, 52, 91, 38, 74]
      .map(
        (height, index) =>
          `<span style="--bar:${height}%"><b>${["M", "T", "W", "T", "F", "S", "S"][index]}</b></span>`,
      )
      .join("");
    return portfolioShell(
      "#/admin-dashboard-pro",
      `<section class="portfolio-page admin-pro-page">
        <span class="eyebrow">Admin Dashboard</span>
        <h1>Operational Control Center</h1>
        <div class="admin-pro-grid">
          <div class="ux-metric"><b>${rupiah(revenue)}</b><span>Revenue</span><small>Local + Supabase ready</small></div>
          <div class="ux-metric"><b>${state.orders.length}</b><span>Orders</span><small>Today simulation</small></div>
          <div class="ux-metric"><b>${pendingBookings}</b><span>Pending Booking</span><small>Needs action</small></div>
          <div class="ux-metric"><b>${state.menu.length}</b><span>Menu Items</span><small>Available catalog</small></div>
        </div>
        <div class="admin-pro-layout">
          <div class="card"><h2>Revenue Chart</h2><div class="bar-chart">${bars}</div></div>
          <div class="card"><h2>Order Queue</h2>${
            state.orders.length
              ? state.orders
                  .slice(0, 5)
                  .map(
                    (order) =>
                      `<div class="ux-list-row"><div><b>${order.id}</b><p>${order.status} • ${rupiah(order.total)}</p></div><button class="mini-action">View</button></div>`,
                  )
                  .join("")
              : '<p class="muted">Belum ada order.</p>'
          }</div>
          <div class="card"><h2>Menu Ops</h2>${state.menu
            .slice(0, 6)
            .map(
              (item) =>
                `<div class="ux-list-row"><div><b>${escapeHtml(item.name)}</b><p>${rupiah(item.price)}</p></div><span class="diet-badge">${item.is_available === false ? "Off" : "On"}</span></div>`,
            )
            .join("")}</div>
          <div class="card"><h2>Realtime Location</h2><p>Admin bisa membuka route Live Location untuk melihat posisi terakhir customer delivery.</p><a class="btn primary full" href="#/live-location">Open Location Center</a></div>
        </div>
      </section>`,
    );
  }

  function bindPortfolioForms() {
    $("#portfolioLoginForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      state.user = {
        name: "Amino Guest",
        email: form.get("email"),
        phone: "+628123456789",
        role: form.get("email") === ADMIN_EMAIL ? "admin" : "customer",
        loyalty_points: 120,
      };
      localStorage.setItem("aminoUser", JSON.stringify(state.user));
      toast("Portfolio login demo berhasil.");
      render();
    });

    $("#portfolioRegisterForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      state.user = {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        role: "customer",
        loyalty_points: 25,
      };
      localStorage.setItem("aminoUser", JSON.stringify(state.user));
      toast("Portfolio register demo berhasil.");
      render();
    });

    $("#portfolioBookingForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(event.target));
      const list = readPortfolio(PORTFOLIO_BOOKING_KEY, []);
      list.unshift({
        ...form,
        id: `portfolio-booking-${Date.now()}`,
        status: "pending",
      });
      writePortfolio(PORTFOLIO_BOOKING_KEY, list);
      toast("Booking draft tersimpan.");
      render();
    });

    $("#portfolioMessageForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(event.target));
      const list = readPortfolio(PORTFOLIO_MESSAGES_KEY, []);
      list.unshift({
        ...form,
        id: `message-${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      writePortfolio(PORTFOLIO_MESSAGES_KEY, list);
      toast("Message demo tersimpan.");
      render();
    });

    $("#portfolioMenuSearch")?.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      $$(".portfolio-menu-row").forEach((row) => {
        row.hidden = !row.textContent.toLowerCase().includes(query);
      });
    });
  }

  function handlePortfolioClick(event) {
    const productButton = event.target.closest("[data-portfolio-product]");
    if (productButton) {
      selectedPortfolioProductId = productButton.dataset.portfolioProduct;
      render();
    }

    const addDetail = event.target.closest("[data-portfolio-add-detail]");
    if (addDetail) {
      const item = state.menu.find(
        (menuItem) =>
          String(menuItem.id) === String(addDetail.dataset.portfolioAddDetail),
      );
      if (!item) return;
      const variantPrice = Number($("#portfolioVariant")?.value || 0);
      const notes = $("#portfolioProductNotes")?.value || "";
      state.cart.push({
        id: `${item.id}-portfolio-${Date.now()}`,
        name: `${item.name}${variantPrice ? " Premium" : ""}`,
        price: Number(item.price) + variantPrice,
        qty: 1,
        notes,
        manual: false,
      });
      saveCart();
      toast("Product detail masuk cart.");
    }

    const slot = event.target.closest("[data-slot-choice]");
    if (slot) {
      $("#portfolioSelectedSlot").value = slot.dataset.slotChoice;
      savePortfolioState({ selectedSlot: slot.dataset.slotChoice });
      $$(".slot-pill").forEach((pill) => pill.classList.remove("active"));
      slot.classList.add("active");
    }
  }

  function addPortfolioNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/portfolio"]')) {
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/portfolio">Portfolio</a>',
      );
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/portfolio"]')) {
      mobileMenu.insertAdjacentHTML(
        "beforeend",
        '<a href="#/portfolio">8 Page Portfolio</a>',
      );
    }
  }

  function patchRoutes() {
    routes["#/portfolio"] = portfolioIndexPage;
    routes["#/cover-moodboard"] = coverMoodboardPage;
    routes["#/auth-customer"] = authCustomerPage;
    routes["#/home-desktop"] = homepageDesktopPage;
    routes["#/home-mobile"] = homepageMobilePage;
    routes["#/menu-product"] = menuProductPage;
    routes["#/cart-booking"] = cartBookingPage;
    routes["#/contact-gallery-reviews"] = contactGalleryReviewsPage;
    routes["#/admin-dashboard-pro"] = adminDashboardProPage;

    const previousBindPage = bindPage;
    bindPage = function portfolioBindPageWrapper() {
      previousBindPage();
      bindPortfolioForms();
    };
  }

  function startPortfolioPages() {
    addPortfolioNav();
    patchRoutes();
    document.addEventListener("click", handlePortfolioClick);
    render();
  }

  setTimeout(startPortfolioPages, 1250);
})();
