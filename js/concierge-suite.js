/*
  AMINO RESTO BALI — Concierge & Guest Care Suite.
  Adds omnichannel inbox, support tickets, SLA tracking, canned replies,
  recovery actions, and guest message history for a fuller restaurant platform.
*/
(function aminoConciergeSuite() {
  const CONCIERGE_KEY = "aminoConciergeState";

  const defaultConcierge = {
    tickets: [
      { id: "TCK-001", guest: "Maya", channel: "WhatsApp", topic: "Booking change", priority: "normal", status: "open", sla_minutes: 45, message: "Can we move tonight booking from 19:00 to 20:00?", created_at: "2026-05-17T01:20:00.000Z" },
      { id: "TCK-002", guest: "Daniel", channel: "Instagram", topic: "Allergen question", priority: "high", status: "pending", sla_minutes: 20, message: "Is the smoothie bowl safe for dairy allergy?", created_at: "2026-05-17T02:05:00.000Z" },
      { id: "TCK-003", guest: "Putri", channel: "Email", topic: "Invoice request", priority: "low", status: "closed", sla_minutes: 180, message: "Please send invoice for yesterday team lunch.", created_at: "2026-05-16T09:10:00.000Z" },
    ],
    macros: [
      { id: "MAC-BOOK", title: "Booking confirmation", body: "Terima kasih. Booking Anda sudah kami catat. Kami akan mengirim reminder H-1 via WhatsApp." },
      { id: "MAC-ALLERGEN", title: "Allergen check", body: "Kami akan konfirmasi ke chef dan memakai equipment terpisah bila memungkinkan. Mohon sebutkan alergi spesifik Anda." },
      { id: "MAC-RECOVERY", title: "Service recovery", body: "Mohon maaf atas ketidaknyamanan Anda. Manager kami akan follow up dan menyiapkan recovery voucher." },
      { id: "MAC-INVOICE", title: "Invoice follow-up", body: "Invoice akan kami kirim ke email Anda maksimal 1x24 jam setelah data lengkap diterima." },
    ],
    recoveryActions: [
      { id: "REC-001", ticket_id: "TCK-001", action: "Complimentary detox shot", value: 35000, owner: "FOH Lead", status: "ready" },
      { id: "REC-002", ticket_id: "TCK-002", action: "Chef allergy callback", value: 0, owner: "Chef", status: "in_progress" },
    ],
    messages: [
      { id: "MSG-001", ticket_id: "TCK-001", from: "guest", body: "Can we move tonight booking from 19:00 to 20:00?", created_at: "2026-05-17T01:20:00.000Z" },
      { id: "MSG-002", ticket_id: "TCK-001", from: "staff", body: "Yes, table moved to 20:00. See you tonight!", created_at: "2026-05-17T01:29:00.000Z" },
      { id: "MSG-003", ticket_id: "TCK-002", from: "guest", body: "Is the smoothie bowl safe for dairy allergy?", created_at: "2026-05-17T02:05:00.000Z" },
    ],
  };

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(CONCIERGE_KEY) || JSON.stringify(defaultConcierge));
    } catch (error) {
      console.warn(error);
      return defaultConcierge;
    }
  }

  function saveState(next) {
    localStorage.setItem(CONCIERGE_KEY, JSON.stringify(next));
  }

  function conciergeState() {
    const state = readState();
    saveState(state);
    return state;
  }

  function ticketAgeMinutes(ticket) {
    return Math.max(0, Math.round((Date.now() - new Date(ticket.created_at).getTime()) / 60000));
  }

  function slaSignal(ticket) {
    if (ticket.status === "closed") return "closed";
    return ticketAgeMinutes(ticket) > Number(ticket.sla_minutes || 60) ? "breach" : "ok";
  }

  function conciergeMetrics(data = conciergeState()) {
    const active = data.tickets.filter((ticket) => ticket.status !== "closed");
    const breach = active.filter((ticket) => slaSignal(ticket) === "breach").length;
    const high = active.filter((ticket) => ticket.priority === "high" || ticket.priority === "urgent").length;
    const recoveryValue = data.recoveryActions.reduce((sum, action) => sum + Number(action.value || 0), 0);
    return { active: active.length, breach, high, recoveryValue };
  }

  function ticketRows(data) {
    return data.tickets.map((ticket) => [
      ticket.id,
      ticket.guest,
      ticket.channel,
      ticket.topic,
      ticket.priority,
      ticket.status,
      `${ticketAgeMinutes(ticket)}m / SLA ${ticket.sla_minutes}m`,
      slaSignal(ticket),
      `<button class="mini-action" data-ticket-status="${ticket.id}" data-status="open">Open</button> <button class="mini-action" data-ticket-status="${ticket.id}" data-status="pending">Pending</button> <button class="mini-action" data-ticket-status="${ticket.id}" data-status="closed">Close</button>`,
    ]);
  }

  function macroCards(data) {
    return data.macros
      .map(
        (macro) =>
          `<article class="card concierge-card"><h3>${escapeHtml(macro.title)}</h3><p>${escapeHtml(macro.body)}</p><button class="btn ghost" data-copy-macro="${macro.id}">Copy Reply</button></article>`,
      )
      .join("");
  }

  function recoveryRows(data) {
    return data.recoveryActions.map((action) => [
      action.ticket_id,
      action.action,
      rupiah(action.value),
      action.owner,
      action.status,
      `<button class="mini-action" data-recovery-status="${action.id}" data-status="ready">Ready</button> <button class="mini-action" data-recovery-status="${action.id}" data-status="sent">Sent</button> <button class="mini-action" data-recovery-status="${action.id}" data-status="used">Used</button>`,
    ]);
  }

  function messageTimeline(data) {
    return data.messages
      .slice(0, 10)
      .map(
        (message) =>
          `<div class="concierge-message ${message.from}"><b>${escapeHtml(message.ticket_id)} • ${escapeHtml(message.from)}</b><span>${escapeHtml(message.body)}</span><small>${new Date(message.created_at).toLocaleString("id-ID")}</small></div>`,
      )
      .join("");
  }

  function conciergeSuitePage() {
    const data = conciergeState();
    const metrics = conciergeMetrics(data);
    return shell(`<section><span class="eyebrow">💬 Concierge Suite</span><h1>Omnichannel guest care, SLA, recovery, dan canned replies.</h1><p class="lead">Tambahan lengkap untuk service excellence: WhatsApp/IG/email inbox, support ticket, SLA breach, macro reply, recovery voucher, dan riwayat percakapan.</p><div class="stats concierge-stats"><div class="stat"><b>${metrics.active}</b><span>Active tickets</span></div><div class="stat"><b>${metrics.breach}</b><span>SLA breach</span></div><div class="stat"><b>${metrics.high}</b><span>High priority</span></div><div class="stat"><b>${rupiah(metrics.recoveryValue)}</b><span>Recovery value</span></div></div></section>
    <section class="section two-col"><form class="card" id="ticketForm"><span class="eyebrow">New Ticket</span><h2>Create guest ticket</h2><input name="guest" placeholder="Guest name" required><select name="channel"><option>WhatsApp</option><option>Instagram</option><option>Email</option><option>Phone</option><option>Dine-in</option></select><input name="topic" placeholder="Topic" required><select name="priority"><option>normal</option><option>high</option><option>urgent</option><option>low</option></select><input name="sla_minutes" type="number" value="45" placeholder="SLA minutes"><textarea name="message" placeholder="Guest message" required></textarea><button class="btn primary full">Create Ticket</button></form><form class="card" id="recoveryForm"><span class="eyebrow">Recovery</span><h2>Create recovery action</h2><select name="ticket_id">${data.tickets.map((ticket) => `<option>${ticket.id}</option>`).join("")}</select><input name="action" placeholder="Action e.g. complimentary dessert" required><input name="value" type="number" placeholder="Value"><input name="owner" placeholder="Owner" required><button class="btn gold full">Add Recovery</button></form></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Inbox</span><h2>Ticket SLA board</h2></div><button class="btn" data-concierge-export>Export Concierge JSON</button></div>${table(["Ticket", "Guest", "Channel", "Topic", "Priority", "Status", "Age", "SLA", "Action"], ticketRows(data))}</section>
    <section class="section two-col"><div class="card"><span class="eyebrow">Messages</span><h2>Conversation timeline</h2><div class="concierge-timeline">${messageTimeline(data)}</div></div><div class="card"><span class="eyebrow">Recovery</span><h2>Service recovery log</h2>${table(["Ticket", "Action", "Value", "Owner", "Status", "Action"], recoveryRows(data))}</div></section>
    <section class="section"><div class="section-head"><h2>Canned Replies</h2><p class="muted">Macro balasan cepat untuk FOH, admin, dan WhatsApp concierge.</p></div><div class="grid concierge-grid">${macroCards(data)}</div></section>`);
  }

  function createTicket(event) {
    event.preventDefault();
    const data = conciergeState();
    const form = Object.fromEntries(new FormData(event.target));
    const ticket = {
      id: `TCK-${Date.now()}`,
      guest: form.guest,
      channel: form.channel,
      topic: form.topic,
      priority: form.priority,
      status: "open",
      sla_minutes: Number(form.sla_minutes || 45),
      message: form.message,
      created_at: new Date().toISOString(),
    };
    data.tickets.unshift(ticket);
    data.messages.unshift({
      id: `MSG-${Date.now()}`,
      ticket_id: ticket.id,
      from: "guest",
      body: ticket.message,
      created_at: ticket.created_at,
    });
    saveState(data);
    window.aminoNotify?.({
      type: "system",
      title: "Guest ticket baru",
      body: `${ticket.guest} • ${ticket.topic} via ${ticket.channel}`,
      priority: ticket.priority === "urgent" ? "urgent" : "high",
      audience: "admin",
      action_url: "#/concierge-suite",
      payload: ticket,
    });
    toast("Ticket concierge dibuat.");
    event.target.reset();
    render();
  }

  function addRecovery(event) {
    event.preventDefault();
    const data = conciergeState();
    const form = Object.fromEntries(new FormData(event.target));
    data.recoveryActions.unshift({
      id: `REC-${Date.now()}`,
      ticket_id: form.ticket_id,
      action: form.action,
      value: Number(form.value || 0),
      owner: form.owner,
      status: "ready",
    });
    saveState(data);
    window.aminoNotify?.({
      type: "promo",
      title: "Recovery action ready",
      body: `${form.ticket_id}: ${form.action}`,
      priority: "normal",
      audience: "admin",
      action_url: "#/concierge-suite",
      payload: form,
    });
    toast("Recovery action ditambahkan.");
    event.target.reset();
    render();
  }

  function updateTicketStatus(id, status) {
    const data = conciergeState();
    const ticket = data.tickets.find((item) => item.id === id);
    if (!ticket) return;
    ticket.status = status;
    saveState(data);
    toast(`Ticket ${id} menjadi ${status}.`);
    render();
  }

  function updateRecoveryStatus(id, status) {
    const data = conciergeState();
    const recovery = data.recoveryActions.find((item) => item.id === id);
    if (!recovery) return;
    recovery.status = status;
    saveState(data);
    toast(`Recovery ${id} menjadi ${status}.`);
    render();
  }

  async function copyMacro(id) {
    const macro = conciergeState().macros.find((item) => item.id === id);
    if (!macro) return;
    try {
      await navigator.clipboard.writeText(macro.body);
      toast("Macro reply disalin.");
    } catch (error) {
      console.warn(error);
      toast(macro.body);
    }
  }

  function exportConcierge() {
    const blob = new Blob([JSON.stringify(conciergeState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `amino-concierge-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Concierge JSON diexport.");
  }

  function handleConciergeClick(event) {
    const target = event.target.closest("[data-ticket-status], [data-recovery-status], [data-copy-macro]");
    if (!target) return;
    if (target.dataset.ticketStatus) updateTicketStatus(target.dataset.ticketStatus, target.dataset.status);
    if (target.dataset.recoveryStatus) updateRecoveryStatus(target.dataset.recoveryStatus, target.dataset.status);
    if (target.dataset.copyMacro) copyMacro(target.dataset.copyMacro);
  }

  function bindConciergeForms() {
    $("#ticketForm")?.addEventListener("submit", createTicket);
    $("#recoveryForm")?.addEventListener("submit", addRecovery);
    $("[data-concierge-export]")?.addEventListener("click", exportConcierge);
  }

  function addConciergeNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/concierge-suite"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/concierge-suite">Concierge</a>');
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/concierge-suite"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/concierge-suite">Concierge Suite</a>');
    }
  }

  function patchRoutes() {
    routes["#/concierge-suite"] = conciergeSuitePage;
    const previousBindPage = bindPage;
    bindPage = function conciergeBindPageWrapper() {
      previousBindPage();
      bindConciergeForms();
    };
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    conciergeState();
    patchRoutes();
    addConciergeNav();
    document.addEventListener("click", handleConciergeClick);
    window.aminoConciergeState = conciergeState;
    render();
  }

  setTimeout(start, 1400);
})();
