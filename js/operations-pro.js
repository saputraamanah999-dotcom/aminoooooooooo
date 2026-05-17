/*
  AMINO RESTO BALI — operations pro layer.
  Adds more real product functionality for a serious cafe portfolio:
  - Kitchen Display System route (#/kitchen)
  - Table map and reservation board (#/table-map)
  - Loyalty wallet and promo redemption (#/loyalty)
  - Inventory and low-stock simulator (#/inventory)
  - Event/private dining planner (#/events-pro)
  - Staff shift board and SOP checklist (#/staff)
  - Guest feedback analytics (#/insights)
  All features are local-first with optional Supabase-ready data shapes.
*/

(function aminoOperationsProLayer() {
  const OPS_TABLES_KEY = "aminoOpsTables";
  const OPS_INVENTORY_KEY = "aminoOpsInventory";
  const OPS_SHIFTS_KEY = "aminoOpsShifts";
  const OPS_EVENTS_KEY = "aminoOpsEvents";
  const OPS_SOPS_KEY = "aminoOpsSops";
  const OPS_PROMO_REDEMPTIONS_KEY = "aminoOpsPromoRedemptions";

  const defaultTables = [
    {
      id: "T01",
      zone: "Garden",
      seats: 2,
      status: "available",
      current_order: null,
      x: 12,
      y: 20,
    },
    {
      id: "T02",
      zone: "Garden",
      seats: 4,
      status: "reserved",
      current_order: "BKG-1800",
      x: 34,
      y: 18,
    },
    {
      id: "T03",
      zone: "Garden",
      seats: 4,
      status: "occupied",
      current_order: "AMN-DEMO-1",
      x: 58,
      y: 22,
    },
    {
      id: "T04",
      zone: "Window",
      seats: 2,
      status: "cleaning",
      current_order: null,
      x: 78,
      y: 18,
    },
    {
      id: "T05",
      zone: "Indoor",
      seats: 6,
      status: "available",
      current_order: null,
      x: 18,
      y: 54,
    },
    {
      id: "T06",
      zone: "Indoor",
      seats: 4,
      status: "occupied",
      current_order: "AMN-DEMO-2",
      x: 42,
      y: 58,
    },
    {
      id: "T07",
      zone: "Indoor",
      seats: 2,
      status: "available",
      current_order: null,
      x: 66,
      y: 58,
    },
    {
      id: "T08",
      zone: "Private",
      seats: 8,
      status: "reserved",
      current_order: "BKG-PRIVATE",
      x: 84,
      y: 58,
    },
  ];

  const defaultInventory = [
    {
      sku: "AVO-LOCAL",
      name: "Avocado Bali",
      unit: "kg",
      stock: 8,
      par: 12,
      supplier: "Canggu Farm",
      category: "Produce",
    },
    {
      sku: "TUNA-FRESH",
      name: "Fresh Tuna",
      unit: "kg",
      stock: 5,
      par: 8,
      supplier: "Jimbaran Fishery",
      category: "Seafood",
    },
    {
      sku: "COCONUT-CREAM",
      name: "Coconut Cream",
      unit: "ltr",
      stock: 14,
      par: 10,
      supplier: "Ubud Pantry",
      category: "Dairy Alt",
    },
    {
      sku: "QUINOA",
      name: "Organic Quinoa",
      unit: "kg",
      stock: 3,
      par: 7,
      supplier: "Bali Organics",
      category: "Dry Goods",
    },
    {
      sku: "OAT-MILK",
      name: "Oat Milk",
      unit: "ltr",
      stock: 18,
      par: 14,
      supplier: "Island Dairy",
      category: "Drinks",
    },
    {
      sku: "COFFEE-KINTAMANI",
      name: "Kintamani Coffee",
      unit: "kg",
      stock: 4,
      par: 6,
      supplier: "Kintamani Roaster",
      category: "Coffee",
    },
    {
      sku: "DRAGON-FRUIT",
      name: "Dragon Fruit",
      unit: "kg",
      stock: 2,
      par: 6,
      supplier: "Tabanan Farm",
      category: "Produce",
    },
    {
      sku: "TEMPEH",
      name: "Organic Tempeh",
      unit: "pcs",
      stock: 24,
      par: 20,
      supplier: "Denpasar Tempeh",
      category: "Protein",
    },
  ];

  const defaultShifts = [
    {
      id: "S1",
      name: "Ayu",
      role: "Host",
      start: "07:00",
      end: "15:00",
      status: "checked-in",
    },
    {
      id: "S2",
      name: "Made",
      role: "Barista",
      start: "07:00",
      end: "15:00",
      status: "checked-in",
    },
    {
      id: "S3",
      name: "Raka",
      role: "Chef",
      start: "12:00",
      end: "22:30",
      status: "scheduled",
    },
    {
      id: "S4",
      name: "Dewi",
      role: "Server",
      start: "14:00",
      end: "22:30",
      status: "scheduled",
    },
    {
      id: "S5",
      name: "Komang",
      role: "Runner",
      start: "16:00",
      end: "22:30",
      status: "scheduled",
    },
  ];

  const defaultSops = [
    {
      id: "SOP-OPEN",
      label: "Opening checklist completed",
      done: false,
      owner: "Host",
    },
    {
      id: "SOP-CASH",
      label: "Cash drawer counted",
      done: false,
      owner: "Manager",
    },
    {
      id: "SOP-QRIS",
      label: "QRIS code visible and clean",
      done: true,
      owner: "Cashier",
    },
    {
      id: "SOP-STOCK",
      label: "Low-stock items reported",
      done: false,
      owner: "Chef",
    },
    {
      id: "SOP-CLOSING",
      label: "Closing sanitation checklist",
      done: false,
      owner: "All",
    },
  ];

  function opsRead(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function opsWrite(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function tables() {
    return opsRead(OPS_TABLES_KEY, defaultTables);
  }

  function inventory() {
    return opsRead(OPS_INVENTORY_KEY, defaultInventory);
  }

  function shifts() {
    return opsRead(OPS_SHIFTS_KEY, defaultShifts);
  }

  function sops() {
    return opsRead(OPS_SOPS_KEY, defaultSops);
  }

  function events() {
    return opsRead(OPS_EVENTS_KEY, []);
  }

  function redemptions() {
    return opsRead(OPS_PROMO_REDEMPTIONS_KEY, []);
  }

  function orderAgeMinutes(order) {
    if (!order?.created_at) return 0;
    return Math.max(
      0,
      Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000),
    );
  }

  function kdsStatusClass(order) {
    const age = orderAgeMinutes(order);
    if (age >= 25) return "danger";
    if (age >= 14) return "warning";
    return "fresh";
  }

  function kdsOrders() {
    const local = state.orders.length
      ? state.orders
      : [
          {
            id: "AMN-DEMO-1",
            customer_name: "Garden Table",
            order_type: "Dine In",
            status: "preparing",
            total: 246000,
            created_at: new Date(Date.now() - 18 * 60000).toISOString(),
            items: [
              {
                name: "Grilled Tuna Sambal Matah",
                qty: 1,
                price: 138000,
                notes: "medium rare",
              },
              {
                name: "Amino Green Detox",
                qty: 2,
                price: 48000,
                notes: "less ice",
              },
            ],
          },
          {
            id: "AMN-DEMO-2",
            customer_name: "Indoor Table",
            order_type: "Dine In",
            status: "confirmed",
            total: 176000,
            created_at: new Date(Date.now() - 8 * 60000).toISOString(),
            items: [
              {
                name: "Amino Avocado Toast",
                qty: 1,
                price: 78000,
                notes: "no onion",
              },
              {
                name: "Ubud Garden Pesto Pasta",
                qty: 1,
                price: 98000,
                notes: "vegan",
              },
            ],
          },
        ];
    return local.filter(
      (order) => !["completed", "cancelled"].includes(order.status),
    );
  }

  function opsMetric(label, value, hint) {
    return `<div class="ops-metric"><b>${value}</b><span>${label}</span><small>${hint}</small></div>`;
  }

  function kitchenPage() {
    const orders = kdsOrders();
    const cards = orders
      .map(
        (order) => `<article class="kds-ticket ${kdsStatusClass(order)}">
          <header><div><b>${order.id}</b><span>${order.order_type}</span></div><strong>${orderAgeMinutes(order)}m</strong></header>
          <h3>${escapeHtml(order.customer_name || "Guest")}</h3>
          <div class="kds-items">${(order.items || []).map((item) => `<div><b>${item.qty}× ${escapeHtml(item.name)}</b><small>${escapeHtml(item.notes || "No notes")}</small></div>`).join("")}</div>
          <footer><button class="mini-action" data-kds-status="${order.id}" data-status="preparing">Preparing</button><button class="mini-action" data-kds-status="${order.id}" data-status="ready">Ready</button><button class="mini-action" data-kds-status="${order.id}" data-status="completed">Done</button></footer>
        </article>`,
      )
      .join("");
    return shell(
      `<section class="ops-page"><span class="eyebrow">Kitchen Display System</span><h1>KDS Live Board</h1><p class="lead">Simulasi kitchen screen untuk order masuk, umur ticket, notes, dan update status cepat.</p><div class="ops-grid-4">${opsMetric("Active Tickets", orders.length, "confirmed/preparing/ready")}${opsMetric("Avg Age", `${orders.length ? Math.round(orders.reduce((sum, order) => sum + orderAgeMinutes(order), 0) / orders.length) : 0}m`, "ticket timing")}${opsMetric("Urgent", orders.filter((order) => kdsStatusClass(order) === "danger").length, "25m+")}${opsMetric("Ready", orders.filter((order) => order.status === "ready").length, "handoff")}</div><div class="kds-board">${cards || '<div class="card">No active kitchen tickets.</div>'}</div></section>`,
    );
  }

  function tableMapPage() {
    const tableList = tables();
    const tableNodes = tableList
      .map(
        (table) =>
          `<button class="floor-table ${table.status}" style="left:${table.x}%;top:${table.y}%" data-table-cycle="${table.id}"><b>${table.id}</b><small>${table.seats} pax</small></button>`,
      )
      .join("");
    return shell(
      `<section class="ops-page"><span class="eyebrow">Reservations</span><h1>Interactive Table Map</h1><p class="lead">Klik meja untuk cycle status: available → reserved → occupied → cleaning. Cocok untuk host desk.</p><div class="two-col"><div class="card floor-card"><div class="floor-map"><span class="floor-zone garden">Garden</span><span class="floor-zone indoor">Indoor</span><span class="floor-zone private">Private</span>${tableNodes}</div></div><div class="card"><h2>Table List</h2>${tableList.map((table) => `<div class="ux-list-row"><div><b>${table.id} • ${table.zone}</b><p>${table.seats} seats • ${table.current_order || "No order"}</p></div><span class="table-status ${table.status}">${table.status}</span></div>`).join("")}</div></div></section>`,
    );
  }

  function loyaltyPage() {
    const user = activeUser();
    const points = Number(user.loyalty_points || 0);
    const promos = state.promos || [];
    const history = redemptions();
    return shell(
      `<section class="ops-page"><span class="eyebrow">Loyalty</span><h1>Customer Wallet & Promo Engine</h1><p class="lead">Simulasi wallet untuk customer retention: points, tier, promo redemption, dan benefit display.</p><div class="loyalty-layout"><div class="loyalty-card"><span>AMINO MEMBER</span><h2>${escapeHtml(user.name || "Guest")}</h2><b>${points} pts</b><p>${points >= 500 ? "Gold" : points >= 150 ? "Green" : "Seed"} Tier</p></div><div class="card"><h2>Active Promos</h2>${promos.length ? promos.map((promo) => `<div class="ux-list-row"><div><b>${escapeHtml(promo.title)}</b><p>${escapeHtml(promo.description || "")}</p><small>${promo.code}</small></div><button class="mini-action" data-redeem-promo="${promo.id}">Redeem</button></div>`).join("") : '<p class="muted">No promos.</p>'}</div><div class="card"><h2>Redemption History</h2>${history.length ? history.map((item) => `<p>• ${item.code} — ${new Date(item.created_at).toLocaleString("id-ID")}</p>`).join("") : '<p class="muted">No redemption yet.</p>'}</div></div></section>`,
    );
  }

  function inventoryPage() {
    const items = inventory();
    const low = items.filter((item) => Number(item.stock) < Number(item.par));
    return shell(
      `<section class="ops-page"><span class="eyebrow">Inventory</span><h1>Stock & Low Inventory</h1><p class="lead">Simulasi inventory ops untuk bahan segar, par level, supplier, dan purchase alert.</p><div class="ops-grid-4">${opsMetric("SKU", items.length, "tracked")}${opsMetric("Low Stock", low.length, "needs purchase")}${opsMetric("Produce", items.filter((item) => item.category === "Produce").length, "fresh items")}${opsMetric("Suppliers", new Set(items.map((item) => item.supplier)).size, "vendors")}</div><div class="card"><form id="inventoryForm" class="admin-form-grid"><input name="name" placeholder="Item name" required><input name="sku" placeholder="SKU" required><input name="stock" type="number" placeholder="Stock" required><input name="par" type="number" placeholder="Par" required><input name="unit" placeholder="Unit"><input name="supplier" placeholder="Supplier"><button class="btn primary">Add Inventory</button></form>${table(
        ["SKU", "Name", "Stock", "Par", "Supplier", "Status"],
        items.map((item) => [
          item.sku,
          item.name,
          `${item.stock} ${item.unit}`,
          item.par,
          item.supplier,
          Number(item.stock) < Number(item.par) ? "LOW" : "OK",
        ]),
      )}</div></section>`,
    );
  }

  function eventsProPage() {
    const list = events();
    return shell(
      `<section class="ops-page"><span class="eyebrow">Private Events</span><h1>Event Planner Pro</h1><p class="lead">Planner untuk private dining, villa catering, wellness retreat, dan corporate lunch.</p><div class="two-col"><form id="eventPlannerForm" class="card"><h2>Create Event Plan</h2><input name="client" placeholder="Client" required><input name="event_date" type="date" required><input name="guests" type="number" min="6" value="12" required><select name="package"><option>Botanical Brunch</option><option>Natural Luxury Dinner</option><option>Wellness Retreat</option><option>Villa Catering</option></select><textarea name="notes" placeholder="Menu, allergies, budget, location"></textarea><button class="btn primary full">Save Event</button></form><div class="card"><h2>Event Pipeline</h2>${list.length ? list.map((event) => `<div class="ux-list-row"><div><b>${escapeHtml(event.client)}</b><p>${event.event_date} • ${event.guests} pax • ${event.package}</p></div><span class="diet-badge gold">${event.status}</span></div>`).join("") : '<p class="muted">No events yet.</p>'}</div></div></section>`,
    );
  }

  function staffPage() {
    const shiftList = shifts();
    const sopList = sops();
    return shell(
      `<section class="ops-page"><span class="eyebrow">Staff Operations</span><h1>Shift Board & SOP</h1><div class="two-col"><div class="card"><h2>Today Shifts</h2>${shiftList.map((shift) => `<div class="ux-list-row"><div><b>${escapeHtml(shift.name)} — ${shift.role}</b><p>${shift.start}–${shift.end}</p></div><button class="mini-action" data-shift-toggle="${shift.id}">${shift.status}</button></div>`).join("")}</div><div class="card"><h2>SOP Checklist</h2>${sopList.map((sop) => `<label class="sop-row"><input type="checkbox" data-sop-toggle="${sop.id}" ${sop.done ? "checked" : ""}><span><b>${sop.label}</b><small>${sop.owner}</small></span></label>`).join("")}</div></div></section>`,
    );
  }

  function insightsPage() {
    const visibleReviews = state.reviews.filter(
      (review) => review.is_visible !== false,
    );
    const avg = visibleReviews.length
      ? (
          visibleReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0,
          ) / visibleReviews.length
        ).toFixed(1)
      : "0.0";
    const badgeCounts = state.menu.reduce((acc, item) => {
      (item.badges || []).forEach(
        (badge) => (acc[badge] = (acc[badge] || 0) + 1),
      );
      return acc;
    }, {});
    const badgeBars = Object.entries(badgeCounts)
      .map(
        ([badge, count]) =>
          `<div class="insight-bar"><span>${badge}</span><i style="--w:${Math.min(100, count * 18)}%"></i><b>${count}</b></div>`,
      )
      .join("");
    return shell(
      `<section class="ops-page"><span class="eyebrow">Insights</span><h1>Guest Feedback Analytics</h1><div class="ops-grid-4">${opsMetric("Average Rating", avg, "visible reviews")}${opsMetric("Reviews", visibleReviews.length, "public")}${opsMetric("Menu Items", state.menu.length, "catalog")}${opsMetric(
        "Cart Qty",
        state.cart.reduce((sum, item) => sum + item.qty, 0),
        "current session",
      )}</div><div class="two-col"><div class="card"><h2>Diet Badge Mix</h2>${badgeBars || '<p class="muted">No badge data.</p>'}</div><div class="card"><h2>Recent Reviews</h2>${visibleReviews.slice(0, 6).map(reviewCard).join("")}</div></div></section>`,
    );
  }

  function updateOrderStatus(orderId, status) {
    const order = state.orders.find(
      (item) => String(item.id) === String(orderId),
    );
    if (!order) return;
    order.status = status;
    localStorage.setItem("aminoOrders", JSON.stringify(state.orders));
    toast(`KDS order ${orderId}: ${status}`);
    render();
  }

  function cycleTableStatus(tableId) {
    const order = ["available", "reserved", "occupied", "cleaning"];
    const list = tables();
    const item = list.find((table) => table.id === tableId);
    if (!item) return;
    const nextIndex = (order.indexOf(item.status) + 1) % order.length;
    item.status = order[nextIndex];
    opsWrite(OPS_TABLES_KEY, list);
    toast(`${tableId} menjadi ${item.status}`);
    render();
  }

  function redeemPromo(promoId) {
    const promo = (state.promos || []).find(
      (item) => String(item.id) === String(promoId),
    );
    if (!promo) return;
    const history = redemptions();
    history.unshift({
      id: `redeem-${Date.now()}`,
      code: promo.code,
      title: promo.title,
      created_at: new Date().toISOString(),
    });
    opsWrite(OPS_PROMO_REDEMPTIONS_KEY, history);
    const user = activeUser();
    user.loyalty_points = Math.max(0, Number(user.loyalty_points || 0) - 25);
    state.user = user;
    localStorage.setItem("aminoUser", JSON.stringify(user));
    toast(`Promo ${promo.code} redeemed.`);
    render();
  }

  function addInventory(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const list = inventory();
    list.unshift({
      ...form,
      stock: Number(form.stock),
      par: Number(form.par),
      category: "Custom",
    });
    opsWrite(OPS_INVENTORY_KEY, list);
    toast("Inventory item added.");
    render();
  }

  function addEventPlan(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const list = events();
    list.unshift({ ...form, id: `event-${Date.now()}`, status: "proposal" });
    opsWrite(OPS_EVENTS_KEY, list);
    toast("Event plan saved.");
    render();
  }

  function toggleShift(shiftId) {
    const list = shifts();
    const item = list.find((shift) => shift.id === shiftId);
    if (!item) return;
    item.status = item.status === "checked-in" ? "checked-out" : "checked-in";
    opsWrite(OPS_SHIFTS_KEY, list);
    toast(`${item.name}: ${item.status}`);
    render();
  }

  function toggleSop(sopId) {
    const list = sops();
    const item = list.find((sop) => sop.id === sopId);
    if (!item) return;
    item.done = !item.done;
    opsWrite(OPS_SOPS_KEY, list);
    toast(`${item.label}: ${item.done ? "done" : "todo"}`);
  }

  function handleOpsClick(event) {
    const target = event.target.closest(
      "[data-kds-status], [data-table-cycle], [data-redeem-promo], [data-shift-toggle], [data-sop-toggle]",
    );
    if (!target) return;
    if (target.dataset.kdsStatus)
      updateOrderStatus(target.dataset.kdsStatus, target.dataset.status);
    if (target.dataset.tableCycle) cycleTableStatus(target.dataset.tableCycle);
    if (target.dataset.redeemPromo) redeemPromo(target.dataset.redeemPromo);
    if (target.dataset.shiftToggle) toggleShift(target.dataset.shiftToggle);
    if (target.dataset.sopToggle) toggleSop(target.dataset.sopToggle);
  }

  function bindOpsForms() {
    $("#inventoryForm")?.addEventListener("submit", addInventory);
    $("#eventPlannerForm")?.addEventListener("submit", addEventPlan);
  }

  function addOpsNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/kitchen"]')) {
      desktopNav.insertAdjacentHTML(
        "beforeend",
        '<a href="#/kitchen">Kitchen</a>',
      );
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/kitchen"]')) {
      mobileMenu.insertAdjacentHTML(
        "beforeend",
        '<a href="#/kitchen">Kitchen</a><a href="#/table-map">Table Map</a><a href="#/loyalty">Loyalty</a><a href="#/inventory">Inventory</a><a href="#/events-pro">Events Pro</a><a href="#/staff">Staff</a><a href="#/insights">Insights</a>',
      );
    }
  }

  function patchRoutes() {
    routes["#/kitchen"] = kitchenPage;
    routes["#/table-map"] = tableMapPage;
    routes["#/loyalty"] = loyaltyPage;
    routes["#/inventory"] = inventoryPage;
    routes["#/events-pro"] = eventsProPage;
    routes["#/staff"] = staffPage;
    routes["#/insights"] = insightsPage;
    const previousBindPage = bindPage;
    bindPage = function opsBindPageWrapper() {
      previousBindPage();
      bindOpsForms();
    };
  }

  function start() {
    patchRoutes();
    addOpsNav();
    document.addEventListener("click", handleOpsClick);
    render();
  }

  setTimeout(start, 1750);
})();
