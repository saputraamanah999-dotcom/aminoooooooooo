/*
  AMINO RESTO BALI — senior UI/UX layer.
  Purpose:
  - Adds a polished design-system route for stakeholder review.
  - Adds command palette navigation, floating quick actions, theme controls,
    accessibility controls, micro-interaction helpers, table waitlist, FAQ,
    catering inquiry, nutrition helper, and guest-facing UX polish.
  - Stays 100% vanilla JavaScript and uses only existing DOM APIs.
*/

(function aminoUxDesignerLayer() {
  const UX_STORAGE_KEY = "aminoUxPreferences";
  const UX_WAITLIST_KEY = "aminoWaitlist";
  const UX_CATERING_KEY = "aminoCateringInquiries";

  const uxDefaults = {
    theme: "botanical",
    density: "comfortable",
    motion: "full",
    contrast: "normal",
    fontScale: 1,
    menuView: "grid",
    lastVisited: "#/home",
  };

  const uxThemes = {
    botanical: {
      label: "Botanical Luxury",
      teal: "#0d7c73",
      cream: "#fff8ea",
      gold: "#c99b42",
      dark: "#093b32",
    },
    sunset: {
      label: "Bali Sunset",
      teal: "#9b4d2e",
      cream: "#fff2dc",
      gold: "#e6a64a",
      dark: "#432315",
    },
    lagoon: {
      label: "Lagoon Calm",
      teal: "#087c9c",
      cream: "#eefcff",
      gold: "#c7a15a",
      dark: "#063645",
    },
    monochrome: {
      label: "High Contrast",
      teal: "#111111",
      cream: "#ffffff",
      gold: "#555555",
      dark: "#000000",
    },
  };

  const uxFaqs = [
    {
      question: "Apakah harga sudah termasuk tax dan service?",
      answer:
        "Belum. Semua halaman menampilkan notice PRICES ARE NOT FIXED; Tax 10% + Service 5% apply.",
    },
    {
      question: "Apakah bisa pesan manual item di luar database?",
      answer:
        "Bisa. Buka Cart, isi form Pesan Manual, lalu admin dapat memverifikasi atau menolak item manual sebelum order diterima.",
    },
    {
      question: "Apakah Google login aktif?",
      answer:
        "Belum. Tombol Google login sengaja disabled sampai konfigurasi provider Supabase/Firebase selesai.",
    },
    {
      question: "Bagaimana cara booking meja?",
      answer:
        "Buka halaman Booking, isi nama, email, phone, tanggal, waktu, jumlah orang, dan catatan. Status awal adalah pending.",
    },
    {
      question: "Apakah bisa order lewat WhatsApp?",
      answer:
        "Bisa. Tombol Order via WhatsApp membuat format pesan otomatis lengkap dengan subtotal, tax, service, total, dan payment.",
    },
    {
      question: "Apakah menu cocok untuk diet tertentu?",
      answer:
        "Setiap menu mendukung badge GF, Vegan, Spicy, New, dan Best Seller. Informasi nutrisi juga ditampilkan di card dan quick view.",
    },
  ];

  const uxJourney = [
    {
      step: "Discover",
      title: "Pengunjung menemukan AMINO",
      details:
        "Hero harus langsung menjawab: restoran apa, vibe apa, menu apa, dan CTA apa yang paling cepat.",
    },
    {
      step: "Evaluate",
      title: "Pengunjung membandingkan menu",
      details:
        "Search, kategori, badge diet, rating, nutrisi, dan harga overlay mempercepat keputusan.",
    },
    {
      step: "Commit",
      title: "Pengunjung booking/order",
      details:
        "CTA Book Table, Add to Cart, Checkout, dan WhatsApp memberikan opsi sesuai konteks user.",
    },
    {
      step: "Track",
      title: "Pengunjung memantau status",
      details:
        "Timeline status membuat order terasa transparan dari pending sampai completed.",
    },
    {
      step: "Return",
      title: "Pengunjung kembali",
      details:
        "Profile, loyalty points, order history, reviews, dan promos membantu retensi.",
    },
  ];

  const uxKeyboardShortcuts = [
    { key: "Ctrl/⌘ + K", action: "Open command palette" },
    { key: "G lalu H", action: "Go Home" },
    { key: "G lalu M", action: "Go Menu" },
    { key: "G lalu C", action: "Go Cart" },
    { key: "G lalu B", action: "Go Booking" },
    { key: "Esc", action: "Close overlays" },
  ];

  const uxCommands = [
    { label: "Home", route: "#/home", hint: "Landing page" },
    { label: "Menu", route: "#/menu", hint: "Search and add food" },
    { label: "Gallery", route: "#/gallery", hint: "Masonry photo grid" },
    { label: "Reviews", route: "#/reviews", hint: "Guest feedback" },
    { label: "Cart", route: "#/cart", hint: "Checkout and manual order" },
    { label: "Orders", route: "#/orders", hint: "Track order status" },
    { label: "Profile", route: "#/profile", hint: "User account" },
    { label: "Booking", route: "#/booking", hint: "Book table" },
    { label: "Admin", route: "#/admin", hint: "Operations panel" },
    { label: "FAQ", route: "#/faq", hint: "Common questions" },
    { label: "Waitlist", route: "#/waitlist", hint: "Join queue" },
    { label: "Catering", route: "#/catering", hint: "Private event inquiry" },
    {
      label: "Design System",
      route: "#/design-system",
      hint: "UI/UX showcase",
    },
  ];

  let lastGPress = 0;

  function uxRead(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function uxWrite(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uxPrefs() {
    return { ...uxDefaults, ...uxRead(UX_STORAGE_KEY, {}) };
  }

  function uxSavePrefs(nextPrefs) {
    uxWrite(UX_STORAGE_KEY, { ...uxPrefs(), ...nextPrefs });
    uxApplyPreferences();
  }

  function uxApplyPreferences() {
    const prefs = uxPrefs();
    const theme = uxThemes[prefs.theme] || uxThemes.botanical;
    document.documentElement.style.setProperty("--teal", theme.teal);
    document.documentElement.style.setProperty("--cream", theme.cream);
    document.documentElement.style.setProperty("--gold", theme.gold);
    document.documentElement.style.setProperty("--dark-green", theme.dark);
    document.documentElement.style.setProperty("--font-scale", prefs.fontScale);
    document.body.dataset.uxTheme = prefs.theme;
    document.body.dataset.uxDensity = prefs.density;
    document.body.dataset.uxMotion = prefs.motion;
    document.body.dataset.uxContrast = prefs.contrast;
  }

  function uxStarRating(value) {
    const rounded = Math.round(Number(value || 0));
    return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
  }

  function uxRouteCard(command) {
    return `<button class="ux-command" data-command-route="${command.route}"><span>${command.label}</span><small>${command.hint}</small></button>`;
  }

  function uxMetricCard(label, value, caption) {
    return `<div class="ux-metric"><b>${value}</b><span>${label}</span><small>${caption}</small></div>`;
  }

  function uxSectionTitle(kicker, title, copy) {
    return `<div class="section-head ux-section-head"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2>${copy ? `<p class="lead">${copy}</p>` : ""}</div></div>`;
  }

  function designSystemPage() {
    const prefs = uxPrefs();
    const bestItems = state.menu
      .slice(0, 6)
      .map(
        (item) =>
          `<div class="ux-showcase-card"><div class="food-img"><span class="overlay-price">${shortPrice(item.price)}</span></div><h3>${escapeHtml(item.name)}</h3><p class="muted">${escapeHtml(item.description || "")}</p><div class="badges">${itemBadges(item)}</div><p class="rating">${uxStarRating(item.rating || 5)} ${item.rating || 4.8}</p></div>`,
      )
      .join("");

    const themeButtons = Object.entries(uxThemes)
      .map(
        ([key, theme]) =>
          `<button class="ux-swatch ${prefs.theme === key ? "active" : ""}" data-theme-choice="${key}" style="--swatch-teal:${theme.teal};--swatch-cream:${theme.cream};--swatch-gold:${theme.gold};--swatch-dark:${theme.dark}"><span></span><b>${theme.label}</b></button>`,
      )
      .join("");

    return shell(`<section class="ux-page">
      <span class="eyebrow">UI/UX Designer Mode</span>
      <h1>AMINO Visual Design System</h1>
      <p class="lead">Halaman ini dibuat untuk memperlihatkan sejauh mana UI/UX bisa dikembangkan: theme, components, motion, accessibility, cards, admin states, empty states, dan journey mapping.</p>
      <div class="ux-dashboard-grid">
        ${uxMetricCard("Total Menu", state.menu.length, "Demo + Supabase items")}
        ${uxMetricCard("Categories", state.categories.length, "Breakfast, Main, Drinks, Kids")}
        ${uxMetricCard("Rating", aminoAverageRating ? aminoAverageRating() : "4.8", "Public review average")}
        ${uxMetricCard(
          "Cart Items",
          state.cart.reduce((sum, item) => sum + item.qty, 0),
          "Realtime badge source",
        )}
      </div>
      <section class="section card ux-panel">
        ${uxSectionTitle("Theme Lab", "Natural luxury palettes", "Pilih mood visual tanpa framework; CSS variables langsung berubah.")}
        <div class="ux-swatch-grid">${themeButtons}</div>
      </section>
      <section class="section card ux-panel">
        ${uxSectionTitle("Components", "Food cards and action patterns", "Card menggunakan placeholder CSS gradient, badge diet, rating, price overlay, dan CTA.")}
        <div class="grid cards">${bestItems}</div>
      </section>
      <section class="section two-col">
        <div class="card ux-panel">
          ${uxSectionTitle("Journey", "Guest experience map", "Alur dari discover sampai return.")}
          <div class="ux-journey">${uxJourney.map((item) => `<div><b>${item.step}</b><h3>${item.title}</h3><p>${item.details}</p></div>`).join("")}</div>
        </div>
        <div class="card ux-panel">
          ${uxSectionTitle("Accessibility", "Controls", "Kontrol ini memberi simulasi kebutuhan user berbeda.")}
          ${uxAccessibilityControls()}
        </div>
      </section>
      <section class="section card ux-panel">
        ${uxSectionTitle("Keyboard", "Power user shortcuts", "Memudahkan admin dan customer yang sering berpindah halaman.")}
        <div class="ux-shortcuts">${uxKeyboardShortcuts.map((shortcut) => `<div><kbd>${shortcut.key}</kbd><span>${shortcut.action}</span></div>`).join("")}</div>
      </section>
    </section>`);
  }

  function faqPage() {
    return shell(
      `<section class="ux-page"><span class="eyebrow">Help Center</span><h1>FAQ AMINO RESTO BALI</h1><p class="lead">Jawaban cepat untuk customer yang ingin menu, booking, order, payment, dan dietary info.</p><div class="ux-accordion">${uxFaqs.map((faq, index) => `<details ${index === 0 ? "open" : ""}><summary>${faq.question}</summary><p>${faq.answer}</p></details>`).join("")}</div><div class="section card"><h2>Masih butuh bantuan?</h2><p>Gunakan WhatsApp untuk response tercepat.</p><button class="btn gold" data-wa>Order / Chat via WhatsApp</button></div></section>`,
    );
  }

  function waitlistPage() {
    const waitlist = uxRead(UX_WAITLIST_KEY, []);
    return shell(
      `<section class="ux-page"><span class="eyebrow">Queue</span><h1>Join Waitlist</h1><p class="lead">Untuk jam ramai, customer bisa masuk waiting list. Admin dapat memindahkan status dari waiting ke seated.</p><div class="two-col"><form id="uxWaitlistForm" class="card"><h2>Tambah Waitlist</h2><input name="name" placeholder="Nama" required><input name="phone" placeholder="Phone" required><input name="guests" type="number" min="1" value="2" required><select name="preference"><option>Indoor botanical corner</option><option>Outdoor garden</option><option>Quiet table</option><option>Fast table</option></select><textarea name="notes" placeholder="Catatan"></textarea><button class="btn primary full">Join Waitlist</button></form><div class="card"><h2>Queue Today</h2>${waitlist.length ? waitlist.map((item) => `<div class="ux-list-row"><div><b>${escapeHtml(item.name)}</b><p>${item.guests} pax • ${escapeHtml(item.preference)}</p><small>${escapeHtml(item.phone)}</small></div><button class="mini-action" data-waitlist-seat="${item.id}">${item.status}</button></div>`).join("") : '<p class="muted">Belum ada waitlist.</p>'}</div></div></section>`,
    );
  }

  function cateringPage() {
    const inquiries = uxRead(UX_CATERING_KEY, []);
    return shell(
      `<section class="ux-page"><span class="eyebrow">Events</span><h1>Catering & Private Dining</h1><p class="lead">Form inquiry untuk corporate lunch, wellness retreat, birthday dinner, dan private villa dining.</p><div class="two-col"><form id="uxCateringForm" class="card"><h2>Event Inquiry</h2><input name="name" placeholder="Nama" required><input name="email" type="email" placeholder="Email" required><input name="phone" placeholder="Phone" required><input name="event_date" type="date" required><input name="guests" type="number" min="6" value="12" required><select name="event_type"><option>Private Dining</option><option>Corporate Lunch</option><option>Wellness Retreat</option><option>Birthday Dinner</option><option>Villa Catering</option></select><textarea name="notes" placeholder="Dietary needs, venue, budget, vibe"></textarea><button class="btn primary full">Send Inquiry</button></form><div class="card"><h2>Inquiry Drafts</h2>${inquiries.length ? inquiries.map((item) => `<div class="ux-list-row"><div><b>${escapeHtml(item.event_type)}</b><p>${escapeHtml(item.name)} • ${item.guests} pax • ${item.event_date}</p><small>${escapeHtml(item.email)}</small></div><span class="diet-badge gold">${item.status}</span></div>`).join("") : '<p class="muted">Belum ada inquiry.</p>'}</div></div></section>`,
    );
  }

  function uxAccessibilityControls() {
    const prefs = uxPrefs();
    return `<div class="ux-controls">
      <label>Density<select id="uxDensity"><option ${prefs.density === "comfortable" ? "selected" : ""}>comfortable</option><option ${prefs.density === "compact" ? "selected" : ""}>compact</option><option ${prefs.density === "spacious" ? "selected" : ""}>spacious</option></select></label>
      <label>Motion<select id="uxMotion"><option ${prefs.motion === "full" ? "selected" : ""}>full</option><option ${prefs.motion === "reduced" ? "selected" : ""}>reduced</option></select></label>
      <label>Contrast<select id="uxContrast"><option ${prefs.contrast === "normal" ? "selected" : ""}>normal</option><option ${prefs.contrast === "high" ? "selected" : ""}>high</option></select></label>
      <label>Font Scale<input id="uxFontScale" type="range" min="0.9" max="1.2" step="0.05" value="${prefs.fontScale}"></label>
    </div>`;
  }

  function uxCreateCommandPalette() {
    if ($("#uxCommandPalette")) return;
    const palette = document.createElement("div");
    palette.id = "uxCommandPalette";
    palette.className = "ux-command-palette";
    palette.innerHTML = `<div class="ux-command-box"><div class="drawer-head"><h2>Command Palette</h2><button class="icon-btn" data-close-command>✕</button></div><input id="uxCommandSearch" placeholder="Type route, e.g. menu, booking, admin"><div id="uxCommandResults">${uxCommands.map(uxRouteCard).join("")}</div></div>`;
    document.body.appendChild(palette);
  }

  function uxOpenCommandPalette() {
    uxCreateCommandPalette();
    $("#uxCommandPalette").classList.add("open");
    setTimeout(() => $("#uxCommandSearch")?.focus(), 50);
  }

  function uxCloseCommandPalette() {
    $("#uxCommandPalette")?.classList.remove("open");
  }

  function uxFilterCommands() {
    const query = ($("#uxCommandSearch")?.value || "").toLowerCase();
    const list = uxCommands.filter(
      (command) =>
        command.label.toLowerCase().includes(query) ||
        command.hint.toLowerCase().includes(query) ||
        command.route.toLowerCase().includes(query),
    );
    $("#uxCommandResults").innerHTML = list.map(uxRouteCard).join("");
  }

  function uxCreateFloatingActions() {
    if ($("#uxFloatingActions")) return;
    const node = document.createElement("aside");
    node.id = "uxFloatingActions";
    node.className = "ux-floating-actions";
    node.innerHTML = `<button title="Command Palette" data-ux-command>⌘K</button><a title="Menu" href="#/menu">🍽</a><a title="Booking" href="#/booking">📅</a><button title="Theme" data-ux-cycle-theme>🎨</button><button title="Top" data-ux-top>↑</button>`;
    document.body.appendChild(node);
  }

  function uxCycleTheme() {
    const keys = Object.keys(uxThemes);
    const prefs = uxPrefs();
    const current = keys.indexOf(prefs.theme);
    const next = keys[(current + 1) % keys.length];
    uxSavePrefs({ theme: next });
    toast(`Theme: ${uxThemes[next].label}`);
  }

  function uxBindDesignForms() {
    $("#uxDensity")?.addEventListener("change", (event) =>
      uxSavePrefs({ density: event.target.value }),
    );
    $("#uxMotion")?.addEventListener("change", (event) =>
      uxSavePrefs({ motion: event.target.value }),
    );
    $("#uxContrast")?.addEventListener("change", (event) =>
      uxSavePrefs({ contrast: event.target.value }),
    );
    $("#uxFontScale")?.addEventListener("input", (event) =>
      uxSavePrefs({ fontScale: Number(event.target.value) }),
    );
    $("#uxWaitlistForm")?.addEventListener("submit", uxSaveWaitlist);
    $("#uxCateringForm")?.addEventListener("submit", uxSaveCatering);
  }

  function uxSaveWaitlist(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const waitlist = uxRead(UX_WAITLIST_KEY, []);
    waitlist.unshift({
      ...data,
      id: `wait-${Date.now()}`,
      guests: Number(data.guests || 1),
      status: "waiting",
      created_at: new Date().toISOString(),
    });
    uxWrite(UX_WAITLIST_KEY, waitlist);
    toast("Waitlist ditambahkan.");
    render();
  }

  function uxSaveCatering(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const inquiries = uxRead(UX_CATERING_KEY, []);
    inquiries.unshift({
      ...data,
      id: `catering-${Date.now()}`,
      guests: Number(data.guests || 0),
      status: "new inquiry",
      created_at: new Date().toISOString(),
    });
    uxWrite(UX_CATERING_KEY, inquiries);
    toast("Catering inquiry tersimpan.");
    render();
  }

  function uxHandleClick(event) {
    const target = event.target.closest(
      "[data-command-route], [data-close-command], [data-ux-command], [data-ux-cycle-theme], [data-ux-top], [data-theme-choice], [data-waitlist-seat]",
    );
    if (!target) return;
    if (target.dataset.commandRoute) {
      location.hash = target.dataset.commandRoute;
      uxCloseCommandPalette();
    }
    if (target.dataset.closeCommand !== undefined) uxCloseCommandPalette();
    if (target.dataset.uxCommand !== undefined) uxOpenCommandPalette();
    if (target.dataset.uxCycleTheme !== undefined) uxCycleTheme();
    if (target.dataset.uxTop !== undefined)
      window.scrollTo({ top: 0, behavior: "smooth" });
    if (target.dataset.themeChoice) {
      uxSavePrefs({ theme: target.dataset.themeChoice });
      toast(`Theme: ${uxThemes[target.dataset.themeChoice].label}`);
      if (location.hash === "#/design-system") render();
    }
    if (target.dataset.waitlistSeat) {
      const waitlist = uxRead(UX_WAITLIST_KEY, []);
      const item = waitlist.find(
        (entry) => entry.id === target.dataset.waitlistSeat,
      );
      if (item) {
        item.status = item.status === "waiting" ? "seated" : "waiting";
        uxWrite(UX_WAITLIST_KEY, waitlist);
        toast(`Waitlist ${item.name}: ${item.status}`);
        render();
      }
    }
  }

  function uxHandleKeyboard(event) {
    const key = event.key.toLowerCase();
    const isMacCommand = event.metaKey && key === "k";
    const isCtrlCommand = event.ctrlKey && key === "k";
    if (isMacCommand || isCtrlCommand) {
      event.preventDefault();
      uxOpenCommandPalette();
      return;
    }
    if (key === "escape") {
      uxCloseCommandPalette();
      return;
    }
    if (key === "g") {
      lastGPress = Date.now();
      return;
    }
    if (Date.now() - lastGPress < 900) {
      const quickRoutes = {
        h: "#/home",
        m: "#/menu",
        c: "#/cart",
        b: "#/booking",
        a: "#/admin",
      };
      if (quickRoutes[key]) {
        location.hash = quickRoutes[key];
        lastGPress = 0;
      }
    }
  }

  function uxPatchRoutes() {
    routes["#/design-system"] = designSystemPage;
    routes["#/faq"] = faqPage;
    routes["#/waitlist"] = waitlistPage;
    routes["#/catering"] = cateringPage;
    const previousBindPage = bindPage;
    bindPage = function uxBindPageWrapper() {
      previousBindPage();
      uxBindDesignForms();
      uxSavePrefs({ lastVisited: location.hash || "#/home" });
    };
  }

  function uxEnhanceNavigation() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/design-system"]')) {
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/faq">FAQ</a><a href="#/design-system">Design</a>',
      );
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/design-system"]')) {
      mobileMenu.insertAdjacentHTML(
        "beforeend",
        '<a href="#/faq">FAQ</a><a href="#/waitlist">Waitlist</a><a href="#/catering">Catering</a><a href="#/design-system">Design</a>',
      );
    }
  }

  function uxStart() {
    uxApplyPreferences();
    uxPatchRoutes();
    uxEnhanceNavigation();
    uxCreateFloatingActions();
    uxCreateCommandPalette();
    document.addEventListener("click", uxHandleClick);
    document.addEventListener("keydown", uxHandleKeyboard);
    document.addEventListener("input", (event) => {
      if (event.target?.id === "uxCommandSearch") uxFilterCommands();
    });
    render();
  }

  setTimeout(uxStart, 650);
})();
