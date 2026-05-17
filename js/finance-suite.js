/*
  AMINO RESTO BALI — Finance & Procurement Suite.
  Adds executive P&L, recipe costing, purchase orders, vendor scorecards,
  cashflow planning, and break-even simulation for a more complete resto demo.
*/
(function aminoFinanceSuite() {
  const FINANCE_KEY = "aminoFinanceState";

  const defaultFinance = {
    vendors: [
      { id: "VEN-001", name: "Bali Organic Farm", category: "Produce", lead_days: 1, rating: 4.9, payment_terms: "COD", status: "preferred" },
      { id: "VEN-002", name: "Jimbaran Fresh Catch", category: "Seafood", lead_days: 1, rating: 4.8, payment_terms: "7 days", status: "preferred" },
      { id: "VEN-003", name: "Canggu Coffee Roasters", category: "Beverage", lead_days: 2, rating: 4.7, payment_terms: "14 days", status: "active" },
      { id: "VEN-004", name: "Island Linen & Decor", category: "Events", lead_days: 3, rating: 4.6, payment_terms: "50% deposit", status: "active" },
    ],
    purchaseOrders: [
      { id: "PO-2401", vendor: "Bali Organic Farm", amount: 1850000, status: "received", due_date: "2026-05-18", category: "Produce" },
      { id: "PO-2402", vendor: "Jimbaran Fresh Catch", amount: 2750000, status: "ordered", due_date: "2026-05-19", category: "Seafood" },
      { id: "PO-2403", vendor: "Canggu Coffee Roasters", amount: 1200000, status: "draft", due_date: "2026-05-21", category: "Beverage" },
    ],
    recipes: [
      { id: "RCP-001", menu: "Grilled Tuna Sambal Matah", price: 138000, food_cost: 45200, labor_cost: 18000, packaging_cost: 4500, target_margin: 0.62 },
      { id: "RCP-002", menu: "Dragon Fruit Smoothie Bowl", price: 68000, food_cost: 22100, labor_cost: 9500, packaging_cost: 3200, target_margin: 0.58 },
      { id: "RCP-003", menu: "Botanical Chef Table", price: 685000, food_cost: 218000, labor_cost: 76000, packaging_cost: 0, target_margin: 0.64 },
      { id: "RCP-004", menu: "Golden Hour Private Dinner", price: 950000, food_cost: 302000, labor_cost: 118000, packaging_cost: 0, target_margin: 0.61 },
    ],
    cashflow: [
      { week: "W1", inflow: 38500000, outflow: 24100000 },
      { week: "W2", inflow: 42600000, outflow: 26800000 },
      { week: "W3", inflow: 44800000, outflow: 27900000 },
      { week: "W4", inflow: 51200000, outflow: 31800000 },
    ],
    fixedCosts: {
      rent: 42000000,
      payroll: 78000000,
      utilities: 14500000,
      marketing: 18000000,
      software: 6500000,
    },
    assumptions: {
      average_check: 185000,
      daily_covers: 126,
      contribution_margin: 0.64,
    },
  };

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(FINANCE_KEY) || JSON.stringify(defaultFinance));
    } catch (error) {
      console.warn(error);
      return defaultFinance;
    }
  }

  function saveState(state) {
    localStorage.setItem(FINANCE_KEY, JSON.stringify(state));
  }

  function financeState() {
    const value = readState();
    saveState(value);
    return value;
  }

  function percent(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
  }

  function recipeMargin(recipe) {
    const cost = Number(recipe.food_cost || 0) + Number(recipe.labor_cost || 0) + Number(recipe.packaging_cost || 0);
    const margin = Number(recipe.price || 0) ? (Number(recipe.price) - cost) / Number(recipe.price) : 0;
    return { cost, margin };
  }

  function financeSummary(data = financeState()) {
    const monthlyRevenue = data.cashflow.reduce((sum, row) => sum + Number(row.inflow || 0), 0);
    const monthlyOutflow = data.cashflow.reduce((sum, row) => sum + Number(row.outflow || 0), 0);
    const fixedCost = Object.values(data.fixedCosts).reduce((sum, value) => sum + Number(value || 0), 0);
    const poOpen = data.purchaseOrders.filter((po) => po.status !== "received").reduce((sum, po) => sum + Number(po.amount || 0), 0);
    const contributionPerCover = Number(data.assumptions.average_check) * Number(data.assumptions.contribution_margin);
    const breakEvenCovers = contributionPerCover ? Math.ceil(fixedCost / contributionPerCover) : 0;
    return { monthlyRevenue, monthlyOutflow, fixedCost, poOpen, breakEvenCovers };
  }

  function recipeRows(data) {
    return data.recipes.map((recipe) => {
      const calc = recipeMargin(recipe);
      return [
        recipe.menu,
        rupiah(recipe.price),
        rupiah(calc.cost),
        percent(calc.margin),
        percent(recipe.target_margin),
        calc.margin >= recipe.target_margin ? "✅ on target" : "⚠️ review price",
      ];
    });
  }

  function poRows(data) {
    return data.purchaseOrders.map((po) => [
      po.id,
      po.vendor,
      po.category,
      rupiah(po.amount),
      po.due_date,
      po.status,
      `<button class="mini-action" data-finance-po="${po.id}" data-status="ordered">Order</button> <button class="mini-action" data-finance-po="${po.id}" data-status="received">Receive</button> <button class="mini-action" data-finance-po="${po.id}" data-status="paid">Paid</button>`,
    ]);
  }

  function vendorCards(data) {
    return data.vendors
      .map(
        (vendor) =>
          `<article class="card finance-card"><span class="diet-badge ${vendor.status === "preferred" ? "gold" : ""}">${escapeHtml(vendor.status)}</span><h3>${escapeHtml(vendor.name)}</h3><p>${escapeHtml(vendor.category)} • lead ${vendor.lead_days} hari</p><p class="rating">★ ${vendor.rating}</p><p class="muted">Terms: ${escapeHtml(vendor.payment_terms)}</p></article>`,
      )
      .join("");
  }

  function cashflowBars(data) {
    const max = Math.max(...data.cashflow.map((row) => Math.max(row.inflow, row.outflow)), 1);
    return data.cashflow
      .map(
        (row) =>
          `<div class="cashflow-row"><b>${escapeHtml(row.week)}</b><span>In ${rupiah(row.inflow)}</span><i style="--w:${Math.round((row.inflow / max) * 100)}%"></i><span>Out ${rupiah(row.outflow)}</span><i class="out" style="--w:${Math.round((row.outflow / max) * 100)}%"></i></div>`,
      )
      .join("");
  }

  function financeSuitePage() {
    const data = financeState();
    const summary = financeSummary(data);
    return shell(`<section><span class="eyebrow">💼 Finance Suite</span><h1>Executive P&L, costing, procurement, dan cashflow AMINO.</h1><p class="lead">Tambahan lengkap untuk owner/operator: margin resep, PO vendor, break-even covers, forecast cashflow, dan procurement scorecard.</p><div class="stats finance-stats"><div class="stat"><b>${rupiah(summary.monthlyRevenue)}</b><span>4-week inflow</span></div><div class="stat"><b>${rupiah(summary.monthlyOutflow)}</b><span>4-week outflow</span></div><div class="stat"><b>${rupiah(summary.poOpen)}</b><span>Open PO</span></div><div class="stat"><b>${summary.breakEvenCovers}</b><span>Monthly BE covers</span></div></div></section>
    <section class="section two-col"><form class="card" id="financePoForm"><span class="eyebrow">Procurement</span><h2>Create Purchase Order</h2><input name="vendor" placeholder="Vendor" required><select name="category"><option>Produce</option><option>Seafood</option><option>Beverage</option><option>Events</option><option>Packaging</option></select><input name="amount" type="number" placeholder="Amount" required><input name="due_date" type="date" required><button class="btn primary full">Create PO</button></form><form class="card" id="financeRecipeForm"><span class="eyebrow">Recipe Costing</span><h2>Add Cost Card</h2><input name="menu" placeholder="Menu / package" required><input name="price" type="number" placeholder="Selling price" required><input name="food_cost" type="number" placeholder="Food cost" required><input name="labor_cost" type="number" placeholder="Labor cost"><input name="packaging_cost" type="number" placeholder="Packaging / decor cost"><input name="target_margin" type="number" step="0.01" value="0.60" placeholder="Target margin"><button class="btn gold full">Add Cost Card</button></form></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Cost Control</span><h2>Recipe margin board</h2></div><p class="muted">Harga, total cost, actual margin, target margin.</p></div>${table(["Menu", "Price", "Total Cost", "Margin", "Target", "Signal"], recipeRows(data))}</section>
    <section class="section two-col"><div class="card"><span class="eyebrow">Purchase Orders</span><h2>PO Board</h2>${table(["PO", "Vendor", "Category", "Amount", "Due", "Status", "Action"], poRows(data))}</div><div class="card"><span class="eyebrow">Cashflow</span><h2>4-week forecast</h2><div class="cashflow-board">${cashflowBars(data)}</div></div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Vendors</span><h2>Vendor scorecards</h2></div><button class="btn" data-finance-export>Export Finance JSON</button></div><div class="grid finance-grid">${vendorCards(data)}</div></section>`);
  }

  function addPo(event) {
    event.preventDefault();
    const data = financeState();
    const form = Object.fromEntries(new FormData(event.target));
    data.purchaseOrders.unshift({
      id: `PO-${Date.now()}`,
      vendor: form.vendor,
      category: form.category,
      amount: Number(form.amount || 0),
      due_date: form.due_date,
      status: "draft",
    });
    saveState(data);
    window.aminoNotify?.({
      type: "inventory",
      title: "Purchase Order dibuat",
      body: `${form.vendor} • ${rupiah(form.amount)} • due ${form.due_date}`,
      priority: "normal",
      audience: "admin",
      action_url: "#/finance-suite",
      payload: { source: "finance-suite", vendor: form.vendor },
    });
    toast("Purchase order dibuat.");
    event.target.reset();
    render();
  }

  function addRecipe(event) {
    event.preventDefault();
    const data = financeState();
    const form = Object.fromEntries(new FormData(event.target));
    data.recipes.unshift({
      id: `RCP-${Date.now()}`,
      menu: form.menu,
      price: Number(form.price || 0),
      food_cost: Number(form.food_cost || 0),
      labor_cost: Number(form.labor_cost || 0),
      packaging_cost: Number(form.packaging_cost || 0),
      target_margin: Number(form.target_margin || 0.6),
    });
    saveState(data);
    toast("Recipe cost card ditambahkan.");
    event.target.reset();
    render();
  }

  function updatePoStatus(id, status) {
    const data = financeState();
    const po = data.purchaseOrders.find((item) => item.id === id);
    if (!po) return;
    po.status = status;
    saveState(data);
    window.aminoNotify?.({
      type: "inventory",
      title: `PO ${status}`,
      body: `${po.id} • ${po.vendor} menjadi ${status}.`,
      priority: status === "received" ? "high" : "normal",
      audience: "admin",
      action_url: "#/finance-suite",
      payload: po,
    });
    toast(`PO ${po.id} menjadi ${status}.`);
    render();
  }

  function exportFinance() {
    const blob = new Blob([JSON.stringify(financeState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amino-finance-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Finance JSON diexport.");
  }

  function bindFinanceForms() {
    $("#financePoForm")?.addEventListener("submit", addPo);
    $("#financeRecipeForm")?.addEventListener("submit", addRecipe);
    $("[data-finance-export]")?.addEventListener("click", exportFinance);
  }

  function handleFinanceClick(event) {
    const target = event.target.closest("[data-finance-po]");
    if (!target) return;
    updatePoStatus(target.dataset.financePo, target.dataset.status);
  }

  function addFinanceNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/finance-suite"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/finance-suite">Finance</a>');
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/finance-suite"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/finance-suite">Finance Suite</a>');
    }
  }

  function patchRoutes() {
    routes["#/finance-suite"] = financeSuitePage;
    const previousBindPage = bindPage;
    bindPage = function financeBindPageWrapper() {
      previousBindPage();
      bindFinanceForms();
    };
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    financeState();
    patchRoutes();
    addFinanceNav();
    document.addEventListener("click", handleFinanceClick);
    window.aminoFinanceState = financeState;
    render();
  }

  setTimeout(start, 1100);
})();
