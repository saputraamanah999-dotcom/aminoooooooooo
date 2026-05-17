/*
  AMINO RESTO BALI — Quality, Safety & Compliance Suite.
  Adds HACCP-style checklists, allergen matrix, temperature logs, incident
  reporting, audit scoring, and staff training records for operational depth.
*/
(function aminoQualitySuite() {
  const QUALITY_KEY = "aminoQualityState";

  const defaultQuality = {
    checklists: [
      { id: "QC-OPEN", area: "Opening", task: "Sanitasi prep table, handwash station, dan pest check", owner: "Supervisor", status: "done", due: "07:00" },
      { id: "QC-COLD", area: "Cold Storage", task: "Chiller 0-5°C, freezer -18°C, label FIFO lengkap", owner: "Kitchen", status: "warning", due: "09:00" },
      { id: "QC-SERVICE", area: "Service", task: "Allergen briefing, QR menu, dan complaint recovery card siap", owner: "FOH", status: "todo", due: "16:00" },
      { id: "QC-CLOSE", area: "Closing", task: "Deep clean, waste log, cash close, dan incident review", owner: "Manager", status: "todo", due: "22:45" },
    ],
    allergens: [
      { item: "Dragon Fruit Smoothie Bowl", gluten: false, dairy: false, egg: false, nuts: true, seafood: false, vegan: true, note: "Contains granola almond." },
      { item: "Grilled Tuna Sambal Matah", gluten: false, dairy: false, egg: false, nuts: false, seafood: true, vegan: false, note: "Seafood handling area." },
      { item: "Golden Turmeric Latte", gluten: false, dairy: false, egg: false, nuts: false, seafood: false, vegan: true, note: "Oat milk default." },
      { item: "Botanical Chef Table", gluten: true, dairy: true, egg: true, nuts: true, seafood: true, vegan: false, note: "Confirm guest dietary 24h before." },
    ],
    temperatures: [
      { id: "TMP-1", station: "Chiller A", target: "0-5°C", reading: 3.2, status: "pass", checked_at: "07:15" },
      { id: "TMP-2", station: "Freezer", target: "≤ -18°C", reading: -19.4, status: "pass", checked_at: "07:16" },
      { id: "TMP-3", station: "Hot Holding", target: "≥ 60°C", reading: 58.8, status: "warning", checked_at: "12:20" },
    ],
    incidents: [
      { id: "INC-001", type: "Guest Recovery", severity: "low", detail: "Late dessert plating, resolved with complimentary tea.", status: "closed", created_at: "2026-05-16T14:20:00.000Z" },
      { id: "INC-002", type: "Equipment", severity: "medium", detail: "Hot holding dipped below target, batch rechecked and reheated.", status: "open", created_at: "2026-05-17T04:20:00.000Z" },
    ],
    trainings: [
      { id: "TR-001", name: "Allergen Handling", staff: "All FOH", completion: 92, expires: "2026-08-01" },
      { id: "TR-002", name: "Fire & Evacuation", staff: "All Staff", completion: 84, expires: "2026-09-15" },
      { id: "TR-003", name: "Coffee Machine Safety", staff: "Bar", completion: 78, expires: "2026-07-20" },
    ],
  };

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(QUALITY_KEY) || JSON.stringify(defaultQuality));
    } catch (error) {
      console.warn(error);
      return defaultQuality;
    }
  }

  function saveState(next) {
    localStorage.setItem(QUALITY_KEY, JSON.stringify(next));
  }

  function qualityState() {
    const state = readState();
    saveState(state);
    return state;
  }

  function qualityScore(data = qualityState()) {
    const checklistDone = data.checklists.filter((item) => item.status === "done").length / Math.max(data.checklists.length, 1);
    const tempPass = data.temperatures.filter((item) => item.status === "pass").length / Math.max(data.temperatures.length, 1);
    const closedIncidents = data.incidents.filter((item) => item.status === "closed").length / Math.max(data.incidents.length, 1);
    const trainingAvg = data.trainings.reduce((sum, item) => sum + Number(item.completion || 0), 0) / Math.max(data.trainings.length, 1) / 100;
    return Math.round(((checklistDone + tempPass + closedIncidents + trainingAvg) / 4) * 100);
  }

  function badge(status) {
    const gold = /done|pass|closed|low/i.test(status || "");
    return `<span class="diet-badge ${gold ? "gold" : ""}">${escapeHtml(status || "todo")}</span>`;
  }

  function checklistRows(data) {
    return data.checklists.map((item) => [
      item.area,
      item.task,
      item.owner,
      item.due,
      item.status,
      `<button class="mini-action" data-quality-check="${item.id}" data-status="done">Done</button> <button class="mini-action" data-quality-check="${item.id}" data-status="warning">Warning</button> <button class="mini-action" data-quality-check="${item.id}" data-status="todo">Todo</button>`,
    ]);
  }

  function allergenRows(data) {
    return data.allergens.map((item) => [
      item.item,
      item.gluten ? "⚠️" : "—",
      item.dairy ? "⚠️" : "—",
      item.egg ? "⚠️" : "—",
      item.nuts ? "⚠️" : "—",
      item.seafood ? "⚠️" : "—",
      item.vegan ? "yes" : "no",
      item.note,
    ]);
  }

  function tempCards(data) {
    return data.temperatures
      .map(
        (item) =>
          `<article class="card quality-card"><div>${badge(item.status)}<h3>${escapeHtml(item.station)}</h3><p>Target ${escapeHtml(item.target)}</p><b>${item.reading}°C</b><p class="muted">Checked ${escapeHtml(item.checked_at)}</p></div><div class="btn-row"><button class="btn ghost" data-temp-status="${item.id}" data-status="pass">Pass</button><button class="btn ghost" data-temp-status="${item.id}" data-status="warning">Warning</button></div></article>`,
      )
      .join("");
  }

  function incidentRows(data) {
    return data.incidents.map((item) => [
      item.type,
      item.severity,
      item.detail,
      item.status,
      new Date(item.created_at).toLocaleString("id-ID"),
      `<button class="mini-action" data-incident-status="${item.id}" data-status="open">Open</button> <button class="mini-action" data-incident-status="${item.id}" data-status="closed">Close</button>`,
    ]);
  }

  function trainingCards(data) {
    return data.trainings
      .map(
        (item) =>
          `<article class="card training-card"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.staff)}</p><div class="quality-progress"><i style="--w:${item.completion}%"></i></div><p><b>${item.completion}%</b> complete</p><p class="muted">Expires ${escapeHtml(item.expires)}</p></article>`,
      )
      .join("");
  }

  function qualitySuitePage() {
    const data = qualityState();
    const score = qualityScore(data);
    const openIncidents = data.incidents.filter((item) => item.status !== "closed").length;
    const warnings = [...data.checklists, ...data.temperatures].filter((item) => item.status === "warning").length;
    return shell(`<section><span class="eyebrow">🛡️ Quality Suite</span><h1>Safety, allergen, HACCP, incident, dan training center.</h1><p class="lead">Tambahan operasional super lengkap untuk memastikan AMINO siap audit: checklist harian, matrix allergen, temperature log, incident CAPA, dan training compliance.</p><div class="stats quality-stats"><div class="stat"><b>${score}%</b><span>Audit score</span></div><div class="stat"><b>${warnings}</b><span>Warnings</span></div><div class="stat"><b>${openIncidents}</b><span>Open incidents</span></div><div class="stat"><b>${data.allergens.length}</b><span>Allergen cards</span></div></div></section>
    <section class="section two-col"><form class="card" id="qualityIncidentForm"><span class="eyebrow">Incident / CAPA</span><h2>Report incident</h2><select name="type"><option>Guest Recovery</option><option>Food Safety</option><option>Equipment</option><option>Staff Safety</option><option>Delivery</option></select><select name="severity"><option>low</option><option>medium</option><option>high</option><option>critical</option></select><textarea name="detail" placeholder="Detail kejadian, tindakan korektif, PIC" required></textarea><button class="btn primary full">Create Incident</button></form><form class="card" id="temperatureForm"><span class="eyebrow">Temperature</span><h2>Add temperature log</h2><input name="station" placeholder="Station" required><input name="target" placeholder="Target e.g. 0-5°C" required><input name="reading" type="number" step="0.1" placeholder="Reading" required><select name="status"><option>pass</option><option>warning</option></select><button class="btn gold full">Save Temperature</button></form></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Daily HACCP</span><h2>Checklist board</h2></div><button class="btn" data-quality-export>Export Quality JSON</button></div>${table(["Area", "Task", "Owner", "Due", "Status", "Action"], checklistRows(data))}</section>
    <section class="section"><div class="section-head"><h2>Temperature Board</h2><p class="muted">Cold/hot holding logs with pass/warning status.</p></div><div class="grid quality-grid">${tempCards(data)}</div></section>
    <section class="section"><div class="section-head"><h2>Allergen Matrix</h2><p class="muted">Bisa dipakai FOH saat menerima request dietary.</p></div>${table(["Menu", "Gluten", "Dairy", "Egg", "Nuts", "Seafood", "Vegan", "Note"], allergenRows(data))}</section>
    <section class="section two-col"><div class="card"><span class="eyebrow">Incidents</span><h2>CAPA Log</h2>${table(["Type", "Severity", "Detail", "Status", "Created", "Action"], incidentRows(data))}</div><div class="card"><span class="eyebrow">Training</span><h2>Staff certifications</h2><div class="grid">${trainingCards(data)}</div></div></section>`);
  }

  function updateChecklist(id, status) {
    const data = qualityState();
    const item = data.checklists.find((entry) => entry.id === id);
    if (!item) return;
    item.status = status;
    saveState(data);
    window.aminoNotify?.({
      type: "system",
      title: "Quality checklist updated",
      body: `${item.area}: ${item.status}`,
      priority: status === "warning" ? "high" : "normal",
      audience: "admin",
      action_url: "#/quality-suite",
      payload: item,
    });
    toast(`Checklist ${item.area} menjadi ${status}.`);
    render();
  }

  function updateTemperature(id, status) {
    const data = qualityState();
    const item = data.temperatures.find((entry) => entry.id === id);
    if (!item) return;
    item.status = status;
    saveState(data);
    window.aminoNotify?.({
      type: "system",
      title: "Temperature log updated",
      body: `${item.station}: ${item.reading}°C ${status}`,
      priority: status === "warning" ? "urgent" : "normal",
      audience: "admin",
      action_url: "#/quality-suite",
      payload: item,
    });
    toast(`Temperature ${item.station} menjadi ${status}.`);
    render();
  }

  function updateIncident(id, status) {
    const data = qualityState();
    const item = data.incidents.find((entry) => entry.id === id);
    if (!item) return;
    item.status = status;
    saveState(data);
    toast(`Incident ${item.id} menjadi ${status}.`);
    render();
  }

  function addIncident(event) {
    event.preventDefault();
    const data = qualityState();
    const form = Object.fromEntries(new FormData(event.target));
    const incident = {
      id: `INC-${Date.now()}`,
      type: form.type,
      severity: form.severity,
      detail: form.detail,
      status: "open",
      created_at: new Date().toISOString(),
    };
    data.incidents.unshift(incident);
    saveState(data);
    window.aminoNotify?.({
      type: "system",
      title: "Incident baru",
      body: `${incident.type} • ${incident.severity}: ${incident.detail}`,
      priority: /high|critical/.test(incident.severity) ? "urgent" : "high",
      audience: "admin",
      action_url: "#/quality-suite",
      payload: incident,
    });
    toast("Incident dibuat dan masuk CAPA log.");
    event.target.reset();
    render();
  }

  function addTemperature(event) {
    event.preventDefault();
    const data = qualityState();
    const form = Object.fromEntries(new FormData(event.target));
    data.temperatures.unshift({
      id: `TMP-${Date.now()}`,
      station: form.station,
      target: form.target,
      reading: Number(form.reading || 0),
      status: form.status,
      checked_at: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    });
    saveState(data);
    toast("Temperature log ditambahkan.");
    event.target.reset();
    render();
  }

  function exportQuality() {
    const blob = new Blob([JSON.stringify(qualityState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amino-quality-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Quality JSON diexport.");
  }

  function handleQualityClick(event) {
    const target = event.target.closest("[data-quality-check], [data-temp-status], [data-incident-status]");
    if (!target) return;
    if (target.dataset.qualityCheck) updateChecklist(target.dataset.qualityCheck, target.dataset.status);
    if (target.dataset.tempStatus) updateTemperature(target.dataset.tempStatus, target.dataset.status);
    if (target.dataset.incidentStatus) updateIncident(target.dataset.incidentStatus, target.dataset.status);
  }

  function bindQualityForms() {
    $("#qualityIncidentForm")?.addEventListener("submit", addIncident);
    $("#temperatureForm")?.addEventListener("submit", addTemperature);
    $("[data-quality-export]")?.addEventListener("click", exportQuality);
  }

  function addQualityNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/quality-suite"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/quality-suite">Quality</a>');
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/quality-suite"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/quality-suite">Quality Suite</a>');
    }
  }

  function patchRoutes() {
    routes["#/quality-suite"] = qualitySuitePage;
    const previousBindPage = bindPage;
    bindPage = function qualityBindPageWrapper() {
      previousBindPage();
      bindQualityForms();
    };
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    qualityState();
    patchRoutes();
    addQualityNav();
    document.addEventListener("click", handleQualityClick);
    window.aminoQualityState = qualityState;
    render();
  }

  setTimeout(start, 1250);
})();
