/*
  AMINO RESTO BALI — live location, realtime presence, and CSS 3D layer.
  - Uses browser geolocation with watchPosition.
  - Shows realtime coordinates, accuracy, route link, and mini map without API keys.
  - Stores last known location locally and optionally syncs to Supabase.
  - Adds a CSS-only 3D restaurant/plate showroom for premium visual impact.
  - Vanilla JavaScript only.
*/

(function aminoLocationAnd3DLayer() {
  const LOCATION_STORAGE_KEY = "aminoLiveLocation";
  const LOCATION_HISTORY_KEY = "aminoLocationHistory";
  const LOCATION_CONSENT_KEY = "aminoLocationConsent";
  const RESTAURANT_COORDS = {
    lat: -8.650979,
    lng: 115.138639,
    label: "AMINO RESTO BALI — Canggu, Bali",
  };

  let watchId = null;
  let realtimeChannel = null;
  let lastLocation = readJson(LOCATION_STORAGE_KEY, null);

  const locationTips = [
    "Aktifkan lokasi hanya saat ingin delivery, tracking, atau share ETA.",
    "Data lokasi demo disimpan di browser; Supabase sync aktif jika table tersedia.",
    "Gunakan tombol Open Maps untuk navigasi langsung ke restoran.",
    "Admin dapat melihat posisi terakhir customer untuk order delivery setelah user memberi izin.",
  ];

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toRad(value) {
    return (Number(value) * Math.PI) / 180;
  }

  function distanceKm(a, b) {
    if (!a || !b) return null;
    const earth = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function estimateEta(distance) {
    if (!distance && distance !== 0) return "-";
    const motorbikeMinutes = Math.max(6, Math.round((distance / 22) * 60));
    return `${motorbikeMinutes} menit by bike`;
  }

  function formatCoord(value) {
    return Number(value || 0).toFixed(6);
  }

  function osmMapUrl(location) {
    const lat = location?.lat || RESTAURANT_COORDS.lat;
    const lng = location?.lng || RESTAURANT_COORDS.lng;
    const delta = 0.012;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  }

  function googleMapsDirections(location) {
    const destination = `${RESTAURANT_COORDS.lat},${RESTAURANT_COORDS.lng}`;
    if (!location)
      return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${destination}&travelmode=driving`;
  }

  function buildLocationSummary(location) {
    const distance = distanceKm(location, RESTAURANT_COORDS);
    return {
      distance,
      eta: estimateEta(distance),
      distanceLabel: distance === null ? "-" : `${distance.toFixed(2)} km`,
      mapsUrl: googleMapsDirections(location),
      updatedLabel: location?.timestamp
        ? new Date(location.timestamp).toLocaleString("id-ID")
        : "Belum aktif",
    };
  }

  function locationHeroCard(location) {
    const summary = buildLocationSummary(location);
    return `<div class="location-hero-card card">
      <div>
        <span class="eyebrow">Realtime Location</span>
        <h2>${location ? "Lokasi aktif" : "Lokasi belum dibagikan"}</h2>
        <p class="muted">${location ? `Lat ${formatCoord(location.lat)}, Lng ${formatCoord(location.lng)}` : "Klik Start Live Location untuk membagikan lokasi browser Anda."}</p>
      </div>
      <div class="location-radar" aria-hidden="true"><span></span><span></span><span></span><b>📍</b></div>
      <div class="location-metrics">
        <div><b>${summary.distanceLabel}</b><small>Jarak ke AMINO</small></div>
        <div><b>${summary.eta}</b><small>Estimasi sampai</small></div>
        <div><b>${location?.accuracy ? `${Math.round(location.accuracy)}m` : "-"}</b><small>Akurasi GPS</small></div>
      </div>
      <div class="btn-row"><button class="btn primary" data-location-start>Start Live Location</button><button class="btn ghost" data-location-stop>Stop</button><a class="btn gold" target="_blank" rel="noreferrer" href="${summary.mapsUrl}">Open Maps</a></div>
    </div>`;
  }

  function locationHistoryTable() {
    const history = readJson(LOCATION_HISTORY_KEY, []);
    if (!history.length)
      return '<p class="muted">Belum ada history lokasi.</p>';
    return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Lat</th><th>Lng</th><th>Accuracy</th><th>Distance</th></tr></thead><tbody>${history
      .slice(0, 12)
      .map((item) => {
        const summary = buildLocationSummary(item);
        return `<tr><td>${new Date(item.timestamp).toLocaleTimeString("id-ID")}</td><td>${formatCoord(item.lat)}</td><td>${formatCoord(item.lng)}</td><td>${Math.round(item.accuracy || 0)}m</td><td>${summary.distanceLabel}</td></tr>`;
      })
      .join("")}</tbody></table></div>`;
  }

  function liveLocationPage() {
    const location = lastLocation || readJson(LOCATION_STORAGE_KEY, null);
    const summary = buildLocationSummary(location);
    return shell(`<section class="location-page">
      <span class="eyebrow">Delivery • Tracking • Realtime</span>
      <h1>Live Location Center</h1>
      <p class="lead">Customer bisa membagikan lokasi realtime untuk delivery, admin bisa melihat koordinat terakhir, dan user bisa membuka navigasi ke AMINO RESTO BALI.</p>
      <div class="two-col">
        ${locationHeroCard(location)}
        <div class="card map-card">
          <div class="section-head"><div><h2>Map Preview</h2><p class="muted">OpenStreetMap embed tanpa API key.</p></div></div>
          <iframe title="AMINO live location map" src="${osmMapUrl(location)}" loading="lazy"></iframe>
          <p class="notice">Terakhir update: ${summary.updatedLabel}. Browser akan meminta izin lokasi.</p>
        </div>
      </div>
      <section class="section two-col">
        <div class="card"><h2>Location History</h2>${locationHistoryTable()}</div>
        <div class="card"><h2>Tips Privasi</h2>${locationTips.map((tip) => `<p>• ${tip}</p>`).join("")}<button class="btn ghost full" data-location-clear>Clear History</button></div>
      </section>
      <section class="section card"><h2>Delivery Address Helper</h2><p>Jika lokasi aktif, tombol ini mengisi alamat checkout dengan koordinat realtime.</p><div class="btn-row"><a class="btn primary" href="#/cart">Go Checkout</a><button class="btn gold" data-location-copy>Copy Coordinates</button></div></section>
    </section>`);
  }

  function css3dPage() {
    return shell(`<section class="showroom-page">
      <span class="eyebrow">3D Visual Experience</span>
      <h1>AMINO 3D Natural Luxury Showroom</h1>
      <p class="lead">CSS-only 3D scene untuk memberi kesan premium sebelum foto/logo asli ditambahkan lewat GitHub. Tidak ada binary asset, tidak ada framework.</p>
      <div class="showroom-layout">
        <div class="scene-card card">
          <div class="scene-controls"><button class="mini-action" data-scene-mode="day">Day</button><button class="mini-action" data-scene-mode="night">Night</button><button class="mini-action" data-scene-spin>Spin</button></div>
          <div id="amino3dScene" class="amino-3d-scene" data-mode="day">
            <div class="scene-floor"></div>
            <div class="scene-wall back"></div>
            <div class="scene-wall left"></div>
            <div class="scene-wall right"></div>
            <div class="scene-table"><span></span></div>
            <div class="scene-plate"><span class="plate-ring"></span><span class="plate-food food-a"></span><span class="plate-food food-b"></span><span class="plate-food food-c"></span></div>
            <div class="scene-glass"></div>
            <div class="scene-plant plant-left"><i></i><i></i><i></i></div>
            <div class="scene-plant plant-right"><i></i><i></i><i></i></div>
            <div class="scene-logo-3d">AMINO</div>
            <div class="scene-light"></div>
          </div>
        </div>
        <div class="card"><h2>3D UI Notes</h2><p>Scene memakai transform-style preserve-3d, radial/conic gradients, pseudo depth, glassmorphism, dan CSS animation.</p><p>Foto/logo asli bisa ditambahkan nanti di folder assets dan Supabase Storage tanpa mengubah struktur UI.</p><div class="ux-dashboard-grid compact"><div class="ux-metric"><b>0</b><span>Binary assets</span><small>CSS only</small></div><div class="ux-metric"><b>3D</b><span>Depth</span><small>Transforms</small></div></div><a class="btn primary full" href="#/design-system">Open Design System</a></div>
      </div>
    </section>`);
  }

  function adminLocationPanel() {
    const location = lastLocation || readJson(LOCATION_STORAGE_KEY, null);
    const summary = buildLocationSummary(location);
    return `<div class="card section"><h2>Live Customer Location</h2><p class="muted">Panel ini membaca lokasi terakhir dari browser demo. Produksi dapat memakai table customer_locations dan Supabase Realtime.</p><div class="location-metrics"><div><b>${location ? formatCoord(location.lat) : "-"}</b><small>Latitude</small></div><div><b>${location ? formatCoord(location.lng) : "-"}</b><small>Longitude</small></div><div><b>${summary.distanceLabel}</b><small>Distance</small></div><div><b>${summary.eta}</b><small>ETA</small></div></div><iframe title="Admin location map" src="${osmMapUrl(location)}" loading="lazy" class="admin-location-map"></iframe></div>`;
  }

  function capturePosition(position) {
    const next = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: new Date(position.timestamp || Date.now()).toISOString(),
      user_email: activeUser().email || null,
    };
    lastLocation = next;
    writeJson(LOCATION_STORAGE_KEY, next);
    localStorage.setItem(LOCATION_CONSENT_KEY, "granted");
    const history = readJson(LOCATION_HISTORY_KEY, []);
    history.unshift(next);
    writeJson(LOCATION_HISTORY_KEY, history.slice(0, 50));
    syncLocationToSupabase(next);
    patchCheckoutAddress(next);
    if (location.hash === "#/live-location" || location.hash === "#/admin")
      render();
  }

  function startLocationWatch() {
    if (!navigator.geolocation) {
      toast("Geolocation tidak tersedia di browser ini.");
      return;
    }
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      capturePosition,
      handleLocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 6000,
        timeout: 15000,
      },
    );
    toast("Live location aktif. Browser akan meminta izin lokasi.");
  }

  function stopLocationWatch() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    toast("Live location dihentikan.");
  }

  function handleLocationError(error) {
    const messages = {
      1: "Izin lokasi ditolak. Aktifkan permission browser untuk live tracking.",
      2: "Posisi tidak tersedia. Coba lagi di area dengan sinyal GPS lebih baik.",
      3: "Request lokasi timeout. Coba ulangi.",
    };
    toast(messages[error.code] || "Gagal membaca lokasi.");
  }

  async function syncLocationToSupabase(location) {
    if (!supabaseClient || !state.user) return;
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) return;
      await supabaseClient.from("customer_locations").upsert(
        {
          user_id: user.id,
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          source: "browser_geolocation",
          last_seen_at: location.timestamp,
        },
        { onConflict: "user_id" },
      );
    } catch (error) {
      console.warn("Supabase location sync skipped", error);
    }
  }

  function subscribeRealtimeLocation() {
    if (!supabaseClient || realtimeChannel) return;
    try {
      realtimeChannel = supabaseClient
        .channel("customer-location-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "customer_locations" },
          (payload) => {
            if (payload.new?.lat && payload.new?.lng) {
              lastLocation = {
                lat: payload.new.lat,
                lng: payload.new.lng,
                accuracy: payload.new.accuracy,
                heading: payload.new.heading,
                speed: payload.new.speed,
                timestamp: payload.new.last_seen_at || new Date().toISOString(),
                user_email: payload.new.user_email || null,
              };
              writeJson(LOCATION_STORAGE_KEY, lastLocation);
              if (
                location.hash === "#/live-location" ||
                location.hash === "#/admin"
              )
                render();
            }
          },
        )
        .subscribe();
    } catch (error) {
      console.warn("Realtime location subscribe skipped", error);
    }
  }

  function patchCheckoutAddress(location) {
    const addressInput = $('[name="address"]');
    if (addressInput && !addressInput.value) {
      addressInput.value = `Lat ${formatCoord(location.lat)}, Lng ${formatCoord(location.lng)}`;
    }
  }

  function copyCoordinates() {
    const location = lastLocation || readJson(LOCATION_STORAGE_KEY, null);
    if (!location) return toast("Belum ada lokasi untuk disalin.");
    const text = `Lat ${formatCoord(location.lat)}, Lng ${formatCoord(location.lng)}`;
    navigator.clipboard?.writeText(text);
    toast("Koordinat disalin.");
  }

  function clearLocationHistory() {
    localStorage.removeItem(LOCATION_HISTORY_KEY);
    toast("History lokasi dihapus.");
    if (location.hash === "#/live-location") render();
  }

  function setSceneMode(mode) {
    const scene = $("#amino3dScene");
    if (scene) scene.dataset.mode = mode;
  }

  function spinScene() {
    const scene = $("#amino3dScene");
    if (!scene) return;
    scene.classList.toggle("is-spinning");
  }

  function patchAdminLocation() {
    const previousAdminContent =
      window.enhancedAdminContent || window.adminContent;
    if (!previousAdminContent || previousAdminContent.__locationPatched) return;
    const patched = function patchedAdminContent() {
      const base = previousAdminContent();
      if (state.adminTab === "Dashboard" || state.adminTab === "Orders") {
        return `${base}${adminLocationPanel()}`;
      }
      return base;
    };
    patched.__locationPatched = true;
    if (window.enhancedAdminContent) window.enhancedAdminContent = patched;
    else window.adminContent = patched;
  }

  function patchRoutes() {
    routes["#/live-location"] = liveLocationPage;
    routes["#/3d-showroom"] = css3dPage;
    const previousBindPage = bindPage;
    bindPage = function locationBindPageWrapper() {
      previousBindPage();
      bindLocationControls();
    };
  }

  function bindLocationControls() {
    $$("[data-location-start]").forEach(
      (button) => (button.onclick = startLocationWatch),
    );
    $$("[data-location-stop]").forEach(
      (button) => (button.onclick = stopLocationWatch),
    );
    $$("[data-location-copy]").forEach(
      (button) => (button.onclick = copyCoordinates),
    );
    $$("[data-location-clear]").forEach(
      (button) => (button.onclick = clearLocationHistory),
    );
    $$("[data-scene-mode]").forEach(
      (button) =>
        (button.onclick = () => setSceneMode(button.dataset.sceneMode)),
    );
    $$("[data-scene-spin]").forEach((button) => (button.onclick = spinScene));
  }

  function enhanceNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/live-location"]')) {
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/live-location">Location</a><a href="#/3d-showroom">3D</a>',
      );
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/live-location"]')) {
      mobileMenu.insertAdjacentHTML(
        "beforeend",
        '<a href="#/live-location">Live Location</a><a href="#/3d-showroom">3D Showroom</a>',
      );
    }
    const bottomNav = $(".bottom-nav");
    if (bottomNav && !bottomNav.querySelector('[href="#/live-location"]')) {
      bottomNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/live-location">📍<span>Location</span></a>',
      );
    }
  }

  function addAnimatedBackground() {
    if ($("#aminoAnimatedBg")) return;
    const bg = document.createElement("div");
    bg.id = "aminoAnimatedBg";
    bg.className = "amino-animated-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML =
      "<span></span><span></span><span></span><span></span><span></span>";
    document.body.prepend(bg);
  }

  function start() {
    addAnimatedBackground();
    patchRoutes();
    patchAdminLocation();
    enhanceNav();
    subscribeRealtimeLocation();
    if (localStorage.getItem(LOCATION_CONSENT_KEY) === "granted") {
      // Do not auto-start GPS after reload; just show saved state for privacy.
      lastLocation = readJson(LOCATION_STORAGE_KEY, null);
    }
    render();
  }

  setTimeout(start, 950);
})();
