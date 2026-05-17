/*
  AMINO RESTO BALI — Delivery & Dispatch Suite.
  Adds driver dispatch, delivery zones, SLA timers, route planning, fee rules,
  package handoff checklist, and proof-of-delivery logs for fuller ops coverage.
*/
(function aminoDeliverySuite() {
  const DELIVERY_KEY = "aminoDeliveryState";

  const defaultDelivery = {
    drivers: [
      { id: "DRV-001", name: "Made", phone: "+628123001", vehicle: "Scooter", status: "available", rating: 4.9, active_orders: 1 },
      { id: "DRV-002", name: "Komang", phone: "+628123002", vehicle: "Scooter", status: "on_route", rating: 4.8, active_orders: 2 },
      { id: "DRV-003", name: "Ayu", phone: "+628123003", vehicle: "Car", status: "available", rating: 4.7, active_orders: 0 },
    ],
    zones: [
      { id: "ZONE-CANGGU", name: "Canggu / Berawa", radius_km: 5, base_fee: 18000, eta_min: 20, min_order: 60000, active: true },
      { id: "ZONE-SEMINYAK", name: "Seminyak", radius_km: 10, base_fee: 32000, eta_min: 38, min_order: 120000, active: true },
      { id: "ZONE-UBUD", name: "Ubud Catering", radius_km: 35, base_fee: 185000, eta_min: 90, min_order: 2500000, active: false },
    ],
    deliveries: [
      { id: "DLV-1001", order_id: "AMN-DEMO-1", customer: "Maya", phone: "+628111111", zone: "Canggu / Berawa", address: "Jl. Pantai Berawa No. 8", driver_id: "DRV-001", status: "picked_up", eta_min: 14, fee: 18000, created_at: "2026-05-17T03:05:00.000Z" },
      { id: "DLV-1002", order_id: "AMN-DEMO-2", customer: "Daniel", phone: "+628222222", zone: "Seminyak", address: "Petitenget Villa 22", driver_id: "DRV-002", status: "assigned", eta_min: 32, fee: 32000, created_at: "2026-05-17T03:15:00.000Z" },
      { id: "DLV-1003", order_id: "EXP-DEMO-1", customer: "Villa Golden Hour", phone: "+628333333", zone: "Ubud Catering", address: "Ubud private villa", driver_id: "DRV-003", status: "scheduled", eta_min: 90, fee: 185000, created_at: "2026-05-17T03:40:00.000Z" },
    ],
    handoffChecklist: [
      { id: "HND-SEAL", label: "Tamper seal terpasang", done: true },
      { id: "HND-CUTLERY", label: "Cutlery / napkin sesuai order", done: true },
      { id: "HND-ALLERGEN", label: "Allergen sticker & notes ditempel", done: false },
      { id: "HND-PHOTO", label: "Foto paket sebelum keluar", done: false },
    ],
    proofs: [
      { id: "POD-001", delivery_id: "DLV-1001", type: "photo", note: "Package sealed, handed to driver Made.", created_at: "2026-05-17T03:18:00.000Z" },
    ],
  };

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(DELIVERY_KEY) || JSON.stringify(defaultDelivery));
    } catch (error) {
      console.warn(error);
      return defaultDelivery;
    }
  }

  function saveState(next) {
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(next));
  }

  function deliveryState() {
    const value = readState();
    saveState(value);
    return value;
  }

  function deliveryMetrics(data = deliveryState()) {
    const active = data.deliveries.filter((item) => !["delivered", "cancelled"].includes(item.status));
    const lateRisk = active.filter((item) => Number(item.eta_min || 0) > 35).length;
    const availableDrivers = data.drivers.filter((driver) => driver.status === "available").length;
    const deliveryRevenue = data.deliveries.reduce((sum, item) => sum + Number(item.fee || 0), 0);
    return { active: active.length, lateRisk, availableDrivers, deliveryRevenue };
  }

  function statusBadge(status) {
    return `<span class="diet-badge ${/delivered|available|picked_up/i.test(status) ? "gold" : ""}">${escapeHtml(status)}</span>`;
  }

  function driverOptions(selected = "") {
    return deliveryState().drivers
      .map((driver) => `<option value="${driver.id}" ${driver.id === selected ? "selected" : ""}>${escapeHtml(driver.name)} • ${escapeHtml(driver.status)}</option>`)
      .join("");
  }

  function zoneOptions(selected = "") {
    return deliveryState().zones
      .map((zone) => `<option value="${zone.name}" ${zone.name === selected ? "selected" : ""}>${escapeHtml(zone.name)} • ${rupiah(zone.base_fee)}</option>`)
      .join("");
  }

  function deliveryRows(data) {
    return data.deliveries.map((delivery) => [
      delivery.id,
      delivery.order_id,
      delivery.customer,
      delivery.zone,
      driverName(delivery.driver_id, data),
      `${delivery.eta_min} min`,
      rupiah(delivery.fee),
      delivery.status,
      `<button class="mini-action" data-delivery-status="${delivery.id}" data-status="assigned">Assign</button> <button class="mini-action" data-delivery-status="${delivery.id}" data-status="picked_up">Picked</button> <button class="mini-action" data-delivery-status="${delivery.id}" data-status="on_route">Route</button> <button class="mini-action" data-delivery-status="${delivery.id}" data-status="delivered">Delivered</button>`,
    ]);
  }

  function driverName(driverId, data = deliveryState()) {
    return data.drivers.find((driver) => driver.id === driverId)?.name || "Unassigned";
  }

  function driverCards(data) {
    return data.drivers
      .map(
        (driver) =>
          `<article class="card delivery-card"><div>${statusBadge(driver.status)}<h3>${escapeHtml(driver.name)}</h3><p>${escapeHtml(driver.vehicle)} • ${escapeHtml(driver.phone)}</p><p class="rating">★ ${driver.rating}</p><p class="muted">Active orders: ${driver.active_orders}</p></div><button class="btn ghost" data-driver-toggle="${driver.id}">${driver.status === "available" ? "Set Offline" : "Set Available"}</button></article>`,
      )
      .join("");
  }

  function zoneCards(data) {
    return data.zones
      .map(
        (zone) =>
          `<article class="card delivery-card zone-card"><div>${statusBadge(zone.active ? "active" : "paused")}<h3>${escapeHtml(zone.name)}</h3><p>${zone.radius_km} km • ETA ${zone.eta_min} min</p><p><b>${rupiah(zone.base_fee)}</b> base fee</p><p class="muted">Min order ${rupiah(zone.min_order)}</p></div><button class="btn ghost" data-zone-toggle="${zone.id}">${zone.active ? "Pause" : "Activate"}</button></article>`,
      )
      .join("");
  }

  function checklistRows(data) {
    return data.handoffChecklist.map((item) => [
      item.label,
      item.done ? "done" : "todo",
      `<button class="mini-action" data-handoff-toggle="${item.id}">${item.done ? "Undo" : "Done"}</button>`,
    ]);
  }

  function proofRows(data) {
    return data.proofs.map((proof) => [
      proof.delivery_id,
      proof.type,
      proof.note,
      new Date(proof.created_at).toLocaleString("id-ID"),
    ]);
  }

  function deliverySuitePage() {
    const data = deliveryState();
    const metrics = deliveryMetrics(data);
    return shell(`<section><span class="eyebrow">🛵 Delivery Suite</span><h1>Dispatch, driver, zone, SLA, handoff, dan proof-of-delivery.</h1><p class="lead">Tambahan lengkap untuk delivery ops: assign driver, monitor ETA, aktif/nonaktif zona, handoff checklist, dan proof log untuk customer service.</p><div class="stats delivery-stats"><div class="stat"><b>${metrics.active}</b><span>Active deliveries</span></div><div class="stat"><b>${metrics.lateRisk}</b><span>Late-risk jobs</span></div><div class="stat"><b>${metrics.availableDrivers}</b><span>Available drivers</span></div><div class="stat"><b>${rupiah(metrics.deliveryRevenue)}</b><span>Delivery fees</span></div></div></section>
    <section class="section two-col"><form class="card" id="deliveryForm"><span class="eyebrow">Dispatch</span><h2>Create delivery job</h2><input name="order_id" placeholder="Order / event ID" required><input name="customer" placeholder="Customer" required><input name="phone" placeholder="Phone"><select name="zone">${zoneOptions()}</select><textarea name="address" placeholder="Alamat lengkap" required></textarea><select name="driver_id"><option value="">Unassigned</option>${driverOptions()}</select><input name="eta_min" type="number" value="25" placeholder="ETA minutes"><button class="btn primary full">Create Delivery</button></form><form class="card" id="proofForm"><span class="eyebrow">Proof</span><h2>Add proof of delivery</h2><select name="delivery_id">${data.deliveries.map((item) => `<option>${item.id}</option>`).join("")}</select><select name="type"><option>photo</option><option>signature</option><option>chat-confirmation</option><option>call-log</option></select><textarea name="note" placeholder="Proof note" required></textarea><button class="btn gold full">Save Proof</button></form></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Dispatch Board</span><h2>Delivery jobs</h2></div><button class="btn" data-delivery-export>Export Delivery JSON</button></div>${table(["Delivery", "Order", "Customer", "Zone", "Driver", "ETA", "Fee", "Status", "Action"], deliveryRows(data))}</section>
    <section class="section two-col"><div class="card"><span class="eyebrow">Handoff</span><h2>Package checklist</h2>${table(["Checklist", "Status", "Action"], checklistRows(data))}</div><div class="card"><span class="eyebrow">Proof Log</span><h2>Delivery proof</h2>${table(["Delivery", "Type", "Note", "Created"], proofRows(data))}</div></section>
    <section class="section"><div class="section-head"><h2>Drivers</h2><p class="muted">Driver availability and workload.</p></div><div class="grid delivery-grid">${driverCards(data)}</div></section>
    <section class="section"><div class="section-head"><h2>Zones & Fees</h2><p class="muted">Control delivery area, fee, ETA and minimum order.</p></div><div class="grid delivery-grid">${zoneCards(data)}</div></section>`);
  }

  function zoneByName(name, data = deliveryState()) {
    return data.zones.find((zone) => zone.name === name) || data.zones[0];
  }

  function createDelivery(event) {
    event.preventDefault();
    const data = deliveryState();
    const form = Object.fromEntries(new FormData(event.target));
    const zone = zoneByName(form.zone, data);
    const delivery = {
      id: `DLV-${Date.now()}`,
      order_id: form.order_id,
      customer: form.customer,
      phone: form.phone,
      zone: form.zone,
      address: form.address,
      driver_id: form.driver_id,
      status: form.driver_id ? "assigned" : "scheduled",
      eta_min: Number(form.eta_min || zone.eta_min),
      fee: Number(zone.base_fee || 0),
      created_at: new Date().toISOString(),
    };
    data.deliveries.unshift(delivery);
    if (delivery.driver_id) {
      const driver = data.drivers.find((item) => item.id === delivery.driver_id);
      if (driver) {
        driver.active_orders = Number(driver.active_orders || 0) + 1;
        driver.status = "on_route";
      }
    }
    saveState(data);
    window.aminoNotify?.({
      type: "location",
      title: "Delivery job baru",
      body: `${delivery.customer} • ${delivery.zone} • ETA ${delivery.eta_min} min`,
      priority: delivery.eta_min > 35 ? "high" : "normal",
      audience: "admin",
      action_url: "#/delivery-suite",
      payload: delivery,
    });
    toast("Delivery job dibuat.");
    event.target.reset();
    render();
  }

  function addProof(event) {
    event.preventDefault();
    const data = deliveryState();
    const form = Object.fromEntries(new FormData(event.target));
    data.proofs.unshift({
      id: `POD-${Date.now()}`,
      delivery_id: form.delivery_id,
      type: form.type,
      note: form.note,
      created_at: new Date().toISOString(),
    });
    saveState(data);
    toast("Proof of delivery disimpan.");
    event.target.reset();
    render();
  }

  function updateDeliveryStatus(id, status) {
    const data = deliveryState();
    const delivery = data.deliveries.find((item) => item.id === id);
    if (!delivery) return;
    delivery.status = status;
    if (status === "delivered") delivery.delivered_at = new Date().toISOString();
    saveState(data);
    window.aminoNotify?.({
      type: "location",
      title: `Delivery ${status}`,
      body: `${delivery.id} untuk ${delivery.customer} menjadi ${status}.`,
      priority: status === "delivered" ? "normal" : "high",
      audience: "admin",
      action_url: "#/delivery-suite",
      payload: delivery,
    });
    toast(`Delivery ${id} menjadi ${status}.`);
    render();
  }

  function toggleDriver(id) {
    const data = deliveryState();
    const driver = data.drivers.find((item) => item.id === id);
    if (!driver) return;
    driver.status = driver.status === "available" ? "offline" : "available";
    saveState(data);
    toast(`${driver.name}: ${driver.status}.`);
    render();
  }

  function toggleZone(id) {
    const data = deliveryState();
    const zone = data.zones.find((item) => item.id === id);
    if (!zone) return;
    zone.active = !zone.active;
    saveState(data);
    toast(`${zone.name}: ${zone.active ? "active" : "paused"}.`);
    render();
  }

  function toggleHandoff(id) {
    const data = deliveryState();
    const item = data.handoffChecklist.find((entry) => entry.id === id);
    if (!item) return;
    item.done = !item.done;
    saveState(data);
    toast(`${item.label}: ${item.done ? "done" : "todo"}.`);
    render();
  }

  function exportDelivery() {
    const blob = new Blob([JSON.stringify(deliveryState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amino-delivery-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Delivery JSON diexport.");
  }

  function handleDeliveryClick(event) {
    const target = event.target.closest("[data-delivery-status], [data-driver-toggle], [data-zone-toggle], [data-handoff-toggle]");
    if (!target) return;
    if (target.dataset.deliveryStatus) updateDeliveryStatus(target.dataset.deliveryStatus, target.dataset.status);
    if (target.dataset.driverToggle) toggleDriver(target.dataset.driverToggle);
    if (target.dataset.zoneToggle) toggleZone(target.dataset.zoneToggle);
    if (target.dataset.handoffToggle) toggleHandoff(target.dataset.handoffToggle);
  }

  function bindDeliveryForms() {
    $("#deliveryForm")?.addEventListener("submit", createDelivery);
    $("#proofForm")?.addEventListener("submit", addProof);
    $("[data-delivery-export]")?.addEventListener("click", exportDelivery);
  }

  function addDeliveryNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/delivery-suite"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/delivery-suite">Delivery</a>');
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/delivery-suite"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/delivery-suite">Delivery Suite</a>');
    }
  }

  function patchRoutes() {
    routes["#/delivery-suite"] = deliverySuitePage;
    const previousBindPage = bindPage;
    bindPage = function deliveryBindPageWrapper() {
      previousBindPage();
      bindDeliveryForms();
    };
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    deliveryState();
    patchRoutes();
    addDeliveryNav();
    document.addEventListener("click", handleDeliveryClick);
    window.aminoDeliveryState = deliveryState;
    render();
  }

  setTimeout(start, 1550);
})();
