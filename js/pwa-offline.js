/*
  AMINO RESTO BALI — PWA, offline queue, data backup, and install/share layer.
  This layer makes the static SPA more production-like without adding frameworks:
  - Registers a service worker and web app manifest.
  - Shows online/offline/install/cache status.
  - Queues actions locally when a network/backend call is unavailable.
  - Exports/imports demo data so portfolio reviewers can test flows safely.
  - Adds native Web Share support where available.
*/

(function aminoPwaOfflineLayer() {
  const QUEUE_KEY = "aminoOfflineQueue";
  const BACKUP_VERSION = "2026-05-17";
  const PWA_STATE_KEY = "aminoPwaState";
  let deferredInstallPrompt = null;

  const backupKeys = [
    "aminoCart",
    "aminoOrders",
    "aminoBookings",
    "aminoUser",
    "aminoPromos",
    "aminoCustomers",
    "aminoNotifications",
    "aminoGrowthCampaigns",
    "aminoGrowthVouchers",
    "aminoGrowthBroadcasts",
    "aminoGrowthSegments",
    "aminoFinanceState",
    "aminoQualityState",
    "aminoConciergeState",
    "aminoDeliveryState",
    "aminoLaunchState",
    "aminoContactMessages",
    "aminoSettings",
    "aminoLiveLocation",
    "aminoLocationHistory",
    "aminoPortfolioState",
    "aminoPortfolioBookings",
    "aminoPortfolioMessages",
    "aminoWaitlist",
    "aminoCateringInquiries",
    "aminoUxPreferences",
  ];

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function queue() {
    return read(QUEUE_KEY, []);
  }

  function saveQueue(items) {
    write(QUEUE_KEY, items);
  }

  function enqueueAction(type, payload) {
    const items = queue();
    items.unshift({
      id: `queue-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      payload,
      status: "queued",
      created_at: new Date().toISOString(),
      attempts: 0,
    });
    saveQueue(items);
    toast(`Disimpan offline queue: ${type}`);
    if (location.hash === "#/offline-center") render();
  }

  function networkLabel() {
    return navigator.onLine ? "Online" : "Offline";
  }

  function pwaState() {
    return read(PWA_STATE_KEY, {
      serviceWorker: "checking",
      cacheUpdatedAt: null,
      lastSyncAt: null,
      installAvailable: false,
    });
  }

  function setPwaState(next) {
    write(PWA_STATE_KEY, { ...pwaState(), ...next });
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      setPwaState({ serviceWorker: "unsupported" });
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      setPwaState({
        serviceWorker: "registered",
        cacheUpdatedAt: new Date().toISOString(),
      });
      registration.addEventListener("updatefound", () => {
        setPwaState({ serviceWorker: "update-found" });
        if (location.hash === "#/offline-center") render();
      });
    } catch (error) {
      console.warn("Service worker registration failed", error);
      setPwaState({ serviceWorker: "failed" });
    }
  }

  async function clearAppCache() {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "AMINO_CLEAR_CACHE",
      });
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    setPwaState({ cacheUpdatedAt: null, serviceWorker: "cache-cleared" });
    toast("Cache PWA dibersihkan.");
    render();
  }

  async function installPwa() {
    if (!deferredInstallPrompt) {
      toast(
        "Install prompt belum tersedia. Gunakan menu browser Add to Home Screen.",
      );
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    setPwaState({ installAvailable: false });
    render();
  }

  async function shareSite() {
    const shareData = {
      title: "AMINO RESTO BALI",
      text: "Natural Luxury Dining — healthy and tasty food in Bali.",
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard?.writeText(shareData.url);
    toast("Link disalin karena Web Share tidak tersedia.");
  }

  function buildBackup() {
    const data = {};
    backupKeys.forEach((key) => {
      data[key] = read(key, null);
    });
    return {
      app: "AMINO RESTO BALI",
      version: BACKUP_VERSION,
      exported_at: new Date().toISOString(),
      data,
    };
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amino-resto-backup-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Backup demo data dibuat.");
  }

  function importBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        Object.entries(parsed.data || {}).forEach(([key, value]) => {
          if (backupKeys.includes(key) && value !== null) write(key, value);
        });
        toast("Backup berhasil di-import. Reloading state...");
        setTimeout(() => window.location.reload(), 700);
      } catch (error) {
        console.warn(error);
        toast("File backup tidak valid.");
      }
    };
    reader.readAsText(file);
  }

  async function flushOfflineQueue() {
    const items = queue();
    if (!items.length) {
      toast("Offline queue kosong.");
      return;
    }
    if (!navigator.onLine) {
      toast("Masih offline. Queue belum dikirim.");
      return;
    }

    const updated = [];
    for (const item of items) {
      const next = { ...item, attempts: Number(item.attempts || 0) + 1 };
      try {
        if (supabaseClient && item.type === "booking") {
          await supabaseClient.from("bookings").insert(item.payload);
        }
        if (supabaseClient && item.type === "review") {
          await supabaseClient.from("reviews").insert(item.payload);
        }
        next.status = supabaseClient ? "sent" : "simulated";
        next.sent_at = new Date().toISOString();
      } catch (error) {
        console.warn(error);
        next.status = "failed";
        next.error = error.message;
        updated.push(next);
      }
    }
    saveQueue(updated);
    setPwaState({ lastSyncAt: new Date().toISOString() });
    toast(
      supabaseClient
        ? "Queue diproses."
        : "Queue disimulasikan; Supabase belum aktif.",
    );
    render();
  }

  function queueTable() {
    const items = queue();
    if (!items.length) return '<p class="muted">Tidak ada offline queue.</p>';
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Type</th><th>Status</th><th>Attempts</th><th>Created</th><th>Payload</th></tr></thead><tbody>${items
      .map(
        (item) =>
          `<tr><td>${item.type}</td><td>${item.status}</td><td>${item.attempts || 0}</td><td>${new Date(item.created_at).toLocaleString("id-ID")}</td><td><code>${escapeHtml(JSON.stringify(item.payload).slice(0, 90))}</code></td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  }

  function backupSummary() {
    return backupKeys
      .map((key) => {
        const value = read(key, null);
        const count = Array.isArray(value)
          ? value.length
          : value && typeof value === "object"
            ? Object.keys(value).length
            : value
              ? 1
              : 0;
        return `<div class="backup-chip"><b>${count}</b><span>${key}</span></div>`;
      })
      .join("");
  }

  function offlineCenterPage() {
    const stateInfo = pwaState();
    return shell(`<section class="offline-page">
      <span class="eyebrow">PWA • Offline • Backup</span>
      <h1>Offline & App Center</h1>
      <p class="lead">Halaman ini membuat project terasa production-ready: install app, offline cache, queue, sync simulation, export/import data demo, dan share website.</p>
      <div class="offline-status-grid">
        <div class="ux-metric"><b>${networkLabel()}</b><span>Network</span><small>${navigator.onLine ? "Ready for sync" : "Local demo mode"}</small></div>
        <div class="ux-metric"><b>${stateInfo.serviceWorker}</b><span>Service Worker</span><small>${stateInfo.cacheUpdatedAt ? new Date(stateInfo.cacheUpdatedAt).toLocaleString("id-ID") : "Not cached yet"}</small></div>
        <div class="ux-metric"><b>${queue().length}</b><span>Queued Actions</span><small>${stateInfo.lastSyncAt ? `Last sync ${new Date(stateInfo.lastSyncAt).toLocaleTimeString("id-ID")}` : "No sync yet"}</small></div>
        <div class="ux-metric"><b>${backupKeys.length}</b><span>Backup Keys</span><small>LocalStorage export</small></div>
      </div>
      <section class="section two-col">
        <div class="card"><h2>App Actions</h2><div class="btn-row"><button class="btn primary" data-pwa-install>Install App</button><button class="btn gold" data-pwa-share>Share</button><button class="btn ghost" data-pwa-clear-cache>Clear Cache</button><button class="btn ghost" data-pwa-flush>Flush Queue</button></div><p class="notice">Install prompt hanya muncul jika browser memenuhi syarat PWA.</p></div>
        <div class="card"><h2>Backup / Restore</h2><div class="btn-row"><button class="btn primary" data-pwa-export>Export JSON</button><label class="btn ghost">Import JSON<input type="file" id="pwaImportFile" accept="application/json" hidden></label></div><div class="backup-grid">${backupSummary()}</div></div>
      </section>
      <section class="section card"><h2>Offline Queue</h2>${queueTable()}<div class="btn-row"><button class="btn gold" data-pwa-sample-queue>Tambah Sample Queue</button><button class="btn ghost" data-pwa-clear-queue>Clear Queue</button></div></section>
    </section>`);
  }

  function addPwaNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/offline-center"]')) {
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/offline-center">PWA</a>',
      );
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/offline-center"]')) {
      mobileMenu.insertAdjacentHTML(
        "beforeend",
        '<a href="#/offline-center">Offline/PWA</a>',
      );
    }
  }

  function bindPwaControls() {
    $$("[data-pwa-install]").forEach((button) => (button.onclick = installPwa));
    $$("[data-pwa-share]").forEach((button) => (button.onclick = shareSite));
    $$("[data-pwa-clear-cache]").forEach(
      (button) => (button.onclick = clearAppCache),
    );
    $$("[data-pwa-flush]").forEach(
      (button) => (button.onclick = flushOfflineQueue),
    );
    $$("[data-pwa-export]").forEach(
      (button) => (button.onclick = downloadBackup),
    );
    $$("[data-pwa-clear-queue]").forEach(
      (button) =>
        (button.onclick = () => {
          saveQueue([]);
          toast("Queue dihapus.");
          render();
        }),
    );
    $$("[data-pwa-sample-queue]").forEach(
      (button) =>
        (button.onclick = () =>
          enqueueAction("booking", {
            name: "Offline Guest",
            email: "offline@example.com",
            phone: "+628000000",
            booking_date: new Date().toISOString().slice(0, 10),
            booking_time: "18:00",
            guests: 2,
            notes: "Sample offline queue",
            status: "pending",
          })),
    );
    $("#pwaImportFile")?.addEventListener("change", (event) =>
      importBackupFile(event.target.files?.[0]),
    );
  }

  function patchRoutes() {
    routes["#/offline-center"] = offlineCenterPage;
    const previousBindPage = bindPage;
    bindPage = function pwaBindPageWrapper() {
      previousBindPage();
      bindPwaControls();
    };
  }

  function listenForInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      setPwaState({ installAvailable: true });
      if (location.hash === "#/offline-center") render();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      setPwaState({
        installAvailable: false,
        installedAt: new Date().toISOString(),
      });
      toast("AMINO app installed.");
    });
  }

  function listenNetwork() {
    window.addEventListener("online", () => {
      toast("Online kembali. Queue bisa disinkronkan.");
      if (location.hash === "#/offline-center") render();
    });
    window.addEventListener("offline", () => {
      toast("Offline mode aktif. Data tetap tersimpan lokal.");
      if (location.hash === "#/offline-center") render();
    });
  }

  function start() {
    registerServiceWorker();
    listenForInstallPrompt();
    listenNetwork();
    addPwaNav();
    patchRoutes();
    render();
  }

  setTimeout(start, 1500);
  window.aminoQueueOfflineAction = enqueueAction;
})();
