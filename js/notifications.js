/*
  AMINO RESTO BALI — complete notification center.
  Adds in-app notification inbox, browser notification permission, sound toggle,
  admin notification actions, service-worker notification clicks, and local
  fallback persistence for every important toast/event when Supabase is offline.
*/
(function () {
  const NOTIFICATION_KEY = "aminoNotifications";
  const PREF_KEY = "aminoNotificationPrefs";
  const DEFAULT_PREFS = {
    inApp: true,
    browser: false,
    sound: true,
    adminOnlyHighPriority: false,
  };
  const TYPE_LABELS = {
    system: "System",
    order: "Order",
    booking: "Booking",
    review: "Review",
    auth: "Auth",
    cart: "Cart",
    profile: "Profile",
    promo: "Promo",
    inventory: "Inventory",
    kds: "Kitchen",
    table: "Table",
    loyalty: "Loyalty",
    event: "Event",
    experience: "Experience",
    location: "Location",
    offline: "Offline/PWA",
  };

  let originalToast = null;
  let audioContext = null;

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function prefs() {
    return { ...DEFAULT_PREFS, ...readJson(PREF_KEY, {}) };
  }

  function savePrefs(nextPrefs) {
    writeJson(PREF_KEY, { ...prefs(), ...nextPrefs });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function notificationId() {
    return `NTF-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function activeRole() {
    try {
      return activeUser().role || "customer";
    } catch (_error) {
      return "customer";
    }
  }

  function normalizeNotification(item = {}) {
    const payload = item.payload || {};
    const title = item.title || item.subject || payload.title || TYPE_LABELS[item.type] || "AMINO Notification";
    const body = item.body || payload.body || payload.message || item.error_message || item.subject || "Update baru dari AMINO RESTO BALI.";
    return {
      id: item.id || notificationId(),
      user_id: item.user_id || null,
      channel: item.channel || "in_app",
      type: item.type || payload.type || "system",
      audience: item.audience || payload.audience || "all",
      target_email: item.target_email || payload.target_email || "",
      title,
      subject: item.subject || title,
      body,
      priority: item.priority || payload.priority || "normal",
      status: item.status || "sent",
      action_url: item.action_url || payload.action_url || "#/notifications",
      payload,
      read_at: item.read_at || null,
      archived_at: item.archived_at || null,
      error_message: item.error_message || "",
      created_at: item.created_at || nowIso(),
    };
  }

  function notificationStore() {
    const existingState = Array.isArray(state.notifications)
      ? state.notifications
      : [];
    const local = readJson(NOTIFICATION_KEY, []);
    const merged = [...existingState, ...local].map(normalizeNotification);
    const byId = new Map();
    merged.forEach((item) => byId.set(String(item.id), item));
    const list = [...byId.values()].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    state.notifications = list;
    writeJson(NOTIFICATION_KEY, list);
    return list;
  }

  function persistNotifications(list = state.notifications || []) {
    const normalized = list.map(normalizeNotification).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    state.notifications = normalized;
    writeJson(NOTIFICATION_KEY, normalized);
    updateNotificationBadge();
    return normalized;
  }

  function unreadCount() {
    return notificationStore().filter(
      (item) => !item.read_at && !item.archived_at && audienceMatches(item),
    ).length;
  }

  function audienceMatches(item) {
    if (!item.audience || item.audience === "all") return true;
    if (item.audience === "admin") return activeRole() === "admin";
    if (item.audience === "customer") return activeRole() !== "admin";
    return true;
  }

  function playNotificationSound(priority = "normal") {
    const currentPrefs = prefs();
    if (!currentPrefs.sound) return;
    try {
      audioContext = audioContext || new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = priority === "urgent" ? "square" : "sine";
      oscillator.frequency.value = priority === "urgent" ? 880 : 620;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.24);
    } catch (error) {
      console.warn(error);
    }
  }

  async function showBrowserNotification(item) {
    const currentPrefs = prefs();
    if (!currentPrefs.browser || !("Notification" in window)) return;
    if (currentPrefs.adminOnlyHighPriority && item.priority !== "urgent") return;
    if (Notification.permission !== "granted") return;
    const options = {
      body: item.body,
      tag: String(item.id),
      icon: "assets/restaurant-assets/icon.svg",
      badge: "assets/restaurant-assets/icon.svg",
      data: { url: item.action_url || "#/notifications", id: item.id },
    };
    if (navigator.serviceWorker?.ready) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(item.title, options);
      return;
    }
    const notification = new Notification(item.title, options);
    notification.onclick = () => {
      window.focus();
      if (item.action_url) location.hash = item.action_url;
      markNotificationRead(item.id, { rerender: false });
      notification.close();
    };
  }

  function emitDomEvent(item) {
    window.dispatchEvent(new CustomEvent("amino:notification", { detail: item }));
  }

  function createNotification(input = {}, options = {}) {
    const item = normalizeNotification(input);
    if (prefs().inApp || options.forceInApp) {
      const list = notificationStore();
      list.unshift(item);
      persistNotifications(list);
      if (location.hash === "#/notifications") render();
    }
    emitDomEvent(item);
    if (options.showToast && originalToast) {
      originalToast(`${item.title}: ${item.body}`);
    }
    if (options.sound !== false) playNotificationSound(item.priority);
    showBrowserNotification(item).catch((error) => console.warn(error));
    return item;
  }

  function inferTypeFromMessage(message = "") {
    if (/order|pesanan|kds|checkout/i.test(message)) return "order";
    if (/booking|table|meja/i.test(message)) return "booking";
    if (/review|rating|reply/i.test(message)) return "review";
    if (/offline|queue|cache|install|backup/i.test(message)) return "offline";
    if (/lokasi|location|maps|coordinates/i.test(message)) return "location";
    if (/promo|loyalty|poin/i.test(message)) return "promo";
    if (/login|logout|password|register|profil/i.test(message)) return "auth";
    if (/experience|proposal|chef table|catering/i.test(message)) return "experience";
    if (/cart|keranjang|item manual/i.test(message)) return "cart";
    return "system";
  }

  function wrapToast() {
    if (originalToast || typeof toast !== "function") return;
    originalToast = toast;
    window.toast = function notificationAwareToast(message, options = {}) {
      originalToast(message);
      if (options.silentLog) return;
      createNotification(
        {
          type: options.type || inferTypeFromMessage(message),
          title: options.title || TYPE_LABELS[options.type || inferTypeFromMessage(message)] || "AMINO Update",
          body: message,
          priority: options.priority || "normal",
          audience: options.audience || "all",
          action_url: options.action_url || "#/notifications",
          payload: options.payload || { source: "toast" },
        },
        { showToast: false, sound: options.sound },
      );
    };
  }

  function updateNotificationBadge() {
    const count = unreadCount();
    const badge = document.querySelector("#notificationBadge");
    if (badge) badge.textContent = String(count);
    const navBadge = document.querySelector("#notificationNavBadge");
    if (navBadge) navBadge.textContent = count ? String(count) : "";
    document.title = count ? `(${count}) AMINO RESTO BALI` : "AMINO RESTO BALI | Natural Luxury Dining";
  }

  function notificationStats() {
    const list = notificationStore().filter(audienceMatches);
    return {
      total: list.filter((item) => !item.archived_at).length,
      unread: list.filter((item) => !item.read_at && !item.archived_at).length,
      urgent: list.filter((item) => item.priority === "urgent" && !item.archived_at).length,
      failed: list.filter((item) => item.status === "failed" && !item.archived_at).length,
    };
  }

  function notificationCard(item) {
    const readClass = item.read_at ? "read" : "unread";
    const priority = item.priority === "urgent" ? "urgent" : item.priority;
    return `<article class="notification-card ${readClass} ${priority}"><div><span class="diet-badge ${item.priority === "urgent" ? "gold" : ""}">${escapeHtml(TYPE_LABELS[item.type] || item.type)}</span><span class="diet-badge">${escapeHtml(item.channel)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p><small class="muted">${new Date(item.created_at).toLocaleString("id-ID")} • ${escapeHtml(item.status)}${item.read_at ? ` • read ${new Date(item.read_at).toLocaleString("id-ID")}` : ""}</small></div><div class="notification-actions"><a class="btn ghost" href="${escapeHtml(item.action_url || "#/notifications")}">Open</a><button class="btn" data-notification-read="${escapeHtml(item.id)}">${item.read_at ? "Unread" : "Read"}</button><button class="btn ghost" data-notification-archive="${escapeHtml(item.id)}">Archive</button></div></article>`;
  }

  function notificationsPage() {
    const currentPrefs = prefs();
    const stats = notificationStats();
    const filter = sessionStorage.getItem("notificationFilter") || "all";
    const list = notificationStore()
      .filter(audienceMatches)
      .filter((item) => !item.archived_at)
      .filter((item) => filter === "all" || item.type === filter || (filter === "unread" && !item.read_at));
    const filters = ["all", "unread", ...Object.keys(TYPE_LABELS)]
      .map(
        (type) =>
          `<button class="mini-action ${filter === type ? "active" : ""}" data-notification-filter="${type}">${TYPE_LABELS[type] || type}</button>`,
      )
      .join("");
    return shell(`<section><span class="eyebrow">🔔 Notifications</span><h1>Notification Center Lengkap</h1><p class="lead">Semua toast, order, booking, review, experience lead, PWA/offline, admin action, dan browser notification tercatat di sini.</p><div class="stats notification-stats"><div class="stat"><b>${stats.total}</b><span>Total active</span></div><div class="stat"><b>${stats.unread}</b><span>Unread</span></div><div class="stat"><b>${stats.urgent}</b><span>Urgent</span></div><div class="stat"><b>${stats.failed}</b><span>Failed email</span></div></div><div class="two-col section"><div class="card"><h2>Preferences</h2><label class="checkline"><input type="checkbox" data-notification-pref="inApp" ${currentPrefs.inApp ? "checked" : ""}> In-app inbox aktif</label><label class="checkline"><input type="checkbox" data-notification-pref="browser" ${currentPrefs.browser ? "checked" : ""}> Browser notification aktif</label><label class="checkline"><input type="checkbox" data-notification-pref="sound" ${currentPrefs.sound ? "checked" : ""}> Sound alert aktif</label><label class="checkline"><input type="checkbox" data-notification-pref="adminOnlyHighPriority" ${currentPrefs.adminOnlyHighPriority ? "checked" : ""}> Browser hanya urgent</label><div class="btn-row"><button class="btn primary" data-notification-permission>Allow Browser</button><button class="btn gold" data-notification-test>Test Notification</button><button class="btn ghost" data-notification-read-all>Mark All Read</button><button class="btn ghost" data-notification-clear>Archive Read</button></div></div><div class="card"><h2>Filter</h2><div class="notification-filter-row">${filters}</div><p class="notice">Browser permission: ${"Notification" in window ? Notification.permission : "not supported"}</p><p class="muted">Data disimpan di localStorage dan siap disinkronkan ke table Supabase <code>notifications</code>.</p></div></div><section class="section"><div class="section-head"><h2>Inbox</h2><button class="btn" data-notification-refresh>Refresh</button></div><div class="notification-list">${list.length ? list.map(notificationCard).join("") : '<div class="card">Belum ada notifikasi untuk filter ini.</div>'}</div></section></section>`);
  }

  function markNotificationRead(id, options = {}) {
    const list = notificationStore();
    const item = list.find((notification) => String(notification.id) === String(id));
    if (!item) return;
    item.read_at = item.read_at ? null : nowIso();
    persistNotifications(list);
    if (options.rerender !== false) render();
  }

  function archiveNotification(id) {
    const list = notificationStore();
    const item = list.find((notification) => String(notification.id) === String(id));
    if (!item) return;
    item.archived_at = nowIso();
    item.read_at = item.read_at || nowIso();
    persistNotifications(list);
    render();
  }

  function markAllRead() {
    const list = notificationStore().map((item) => ({
      ...item,
      read_at: item.read_at || nowIso(),
    }));
    persistNotifications(list);
    toast("Semua notifikasi ditandai sudah dibaca.", {
      type: "system",
      silentLog: true,
    });
    render();
  }

  function archiveRead() {
    const list = notificationStore().map((item) => ({
      ...item,
      archived_at: item.read_at ? item.archived_at || nowIso() : item.archived_at,
    }));
    persistNotifications(list);
    toast("Notifikasi yang sudah dibaca diarsipkan.", {
      type: "system",
      silentLog: true,
    });
    render();
  }

  async function requestBrowserPermission() {
    if (!("Notification" in window)) {
      toast("Browser notification tidak didukung browser ini.", { type: "system" });
      return;
    }
    const result = await Notification.requestPermission();
    savePrefs({ browser: result === "granted" });
    toast(`Browser notification: ${result}.`, { type: "system" });
    render();
  }

  function testNotification() {
    createNotification(
      {
        type: "system",
        title: "AMINO test notification",
        body: "Notifikasi lengkap aktif: in-app, sound, badge, dan browser jika diizinkan.",
        priority: "urgent",
        action_url: "#/notifications",
        payload: { source: "manual-test" },
      },
      { showToast: true },
    );
  }

  function bindNotificationControls() {
    $$("[data-notification-pref]").forEach((input) => {
      input.onchange = () => savePrefs({ [input.dataset.notificationPref]: input.checked });
    });
    $$("[data-notification-filter]").forEach((button) => {
      button.onclick = () => {
        sessionStorage.setItem("notificationFilter", button.dataset.notificationFilter);
        render();
      };
    });
    $("[data-notification-permission]")?.addEventListener("click", requestBrowserPermission);
    $("[data-notification-test]")?.addEventListener("click", testNotification);
    $("[data-notification-read-all]")?.addEventListener("click", markAllRead);
    $("[data-notification-clear]")?.addEventListener("click", archiveRead);
    $("[data-notification-refresh]")?.addEventListener("click", () => render());
  }

  function addNotificationNav() {
    const actions = document.querySelector(".nav-actions");
    if (actions && !document.querySelector("#notificationButton")) {
      actions.insertAdjacentHTML(
        "afterbegin",
        '<a class="icon-btn" id="notificationButton" href="#/notifications" aria-label="Notifications">🔔<span id="notificationBadge" class="badge-count">0</span></a>',
      );
    }
    const desktopNav = document.querySelector(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/notifications"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/notifications">Notifications <span id="notificationNavBadge"></span></a>');
    }
    const mobileMenu = document.querySelector("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/notifications"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/notifications">Notifications</a>');
    }
  }

  function handleGlobalNotificationClick(event) {
    const target = event.target.closest(
      "[data-notification-read], [data-notification-archive], [data-notification-status]",
    );
    if (!target) return;
    if (target.dataset.notificationRead) markNotificationRead(target.dataset.notificationRead);
    if (target.dataset.notificationArchive) archiveNotification(target.dataset.notificationArchive);
    if (target.dataset.notificationStatus) {
      const list = notificationStore();
      const item = list.find((notification) => String(notification.id) === String(target.dataset.notificationStatus));
      if (item) {
        item.status = target.dataset.status || "sent";
        persistNotifications(list);
        toast(`Notification ${item.title} menjadi ${item.status}`, { type: "system" });
        render();
      }
    }
  }

  function patchRoutes() {
    routes["#/notifications"] = notificationsPage;
    const previousBindPage = bindPage;
    bindPage = function notificationBindPageWrapper() {
      previousBindPage();
      bindNotificationControls();
      updateNotificationBadge();
    };
  }

  function syncServiceWorkerClicks() {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "AMINO_NOTIFICATION_CLICK") {
        markNotificationRead(event.data.id, { rerender: false });
        if (event.data.url) location.hash = event.data.url;
      }
    });
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    notificationStore();
    wrapToast();
    patchRoutes();
    addNotificationNav();
    syncServiceWorkerClicks();
    document.addEventListener("click", handleGlobalNotificationClick);
    window.aminoNotify = createNotification;
    window.aminoMarkNotificationRead = markNotificationRead;
    updateNotificationBadge();
    if (!notificationStore().length) {
      createNotification(
        {
          type: "system",
          title: "Notification Center aktif",
          body: "Semua update AMINO akan tercatat lengkap di inbox ini.",
          priority: "normal",
          action_url: "#/notifications",
        },
        { sound: false, forceInApp: true },
      );
    }
    render();
  }

  setTimeout(start, 500);
})();
