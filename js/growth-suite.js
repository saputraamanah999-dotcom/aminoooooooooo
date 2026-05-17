/*
  AMINO RESTO BALI — Growth Suite.
  Adds CRM segmentation, notification broadcasts, campaign planning, voucher
  generation, automation playbooks, and local analytics without a framework.
*/
(function aminoGrowthSuite() {
  const CAMPAIGN_KEY = "aminoGrowthCampaigns";
  const VOUCHER_KEY = "aminoGrowthVouchers";
  const BROADCAST_KEY = "aminoGrowthBroadcasts";
  const SEGMENT_KEY = "aminoGrowthSegments";

  const defaultSegments = [
    {
      id: "all-guests",
      name: "All Guests",
      size: 428,
      rule: "All customers, walk-ins, waitlist, and online checkout profiles.",
      tone: "friendly",
    },
    {
      id: "vip-diners",
      name: "VIP Diners",
      size: 64,
      rule: "Guests with 5+ orders, private dinner leads, or loyalty > 200 points.",
      tone: "exclusive",
    },
    {
      id: "healthy-vegan",
      name: "Healthy / Vegan",
      size: 118,
      rule: "Guests who ordered vegan, GF, detox juice, or wellness brunch.",
      tone: "wellness",
    },
    {
      id: "booking-followup",
      name: "Booking Follow-up",
      size: 36,
      rule: "Pending bookings and guests with completed reservations this week.",
      tone: "concierge",
    },
    {
      id: "sleeping-foodies",
      name: "Sleeping Foodies",
      size: 97,
      rule: "No order or booking activity in the last 45 days.",
      tone: "winback",
    },
  ];

  const campaignTemplates = [
    {
      id: "chef-table-launch",
      title: "Chef Table Launch",
      type: "experience",
      channel: "in_app",
      segment: "vip-diners",
      message:
        "Limited Botanical Chef Table seats this weekend. Reply to reserve your tasting menu.",
      priority: "urgent",
    },
    {
      id: "breakfast-reminder",
      title: "Sunrise Breakfast Reminder",
      type: "promo",
      channel: "browser",
      segment: "all-guests",
      message:
        "Start your Bali morning with smoothie bowls, avocado toast, and detox juice at AMINO.",
      priority: "normal",
    },
    {
      id: "review-request",
      title: "Review Request",
      type: "review",
      channel: "email",
      segment: "booking-followup",
      message:
        "Thank you for dining with AMINO. Share a review and unlock loyalty points.",
      priority: "normal",
    },
    {
      id: "vegan-special",
      title: "Vegan Special Drop",
      type: "promo",
      channel: "whatsapp",
      segment: "healthy-vegan",
      message:
        "New plant-based specials are live: jackfruit rendang tacos and green goddess bowls.",
      priority: "high",
    },
  ];

  const automationPlaybooks = [
    ["Abandoned Cart", "After 20 minutes", "Send WhatsApp/in-app reminder with cart summary and checkout link."],
    ["Booking Reminder", "H-24 hours", "Send map, dress code, parking, and table confirmation details."],
    ["Post-Dining Review", "2 hours after completed order", "Ask for review, then route low ratings to admin recovery."],
    ["Birthday / Anniversary", "7 days before date", "Offer private dessert plating and golden-hour dinner package."],
    ["Winback", "45 days inactive", "Send limited voucher and new menu highlight."],
  ];

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      console.warn(error);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function segments() {
    const stored = read(SEGMENT_KEY, defaultSegments);
    write(SEGMENT_KEY, stored);
    return stored;
  }

  function campaigns() {
    return read(CAMPAIGN_KEY, campaignTemplates.map((item) => ({
      ...item,
      status: "draft",
      scheduled_at: "",
      created_at: new Date().toISOString(),
    })));
  }

  function vouchers() {
    return read(VOUCHER_KEY, [
      {
        id: "voucher-welcome",
        code: "AMINOWELCOME",
        title: "Welcome Detox Shot",
        discount_type: "amount",
        discount_value: 35000,
        segment: "all-guests",
        valid_to: "2026-06-30",
        usage_limit: 120,
        used: 14,
        status: "active",
      },
      {
        id: "voucher-vip",
        code: "BOTANICALVIP",
        title: "VIP Chef Table Upgrade",
        discount_type: "percent",
        discount_value: 12,
        segment: "vip-diners",
        valid_to: "2026-07-31",
        usage_limit: 40,
        used: 6,
        status: "active",
      },
    ]);
  }

  function broadcasts() {
    return read(BROADCAST_KEY, []);
  }

  function saveCampaigns(next) {
    write(CAMPAIGN_KEY, next);
  }

  function saveVouchers(next) {
    write(VOUCHER_KEY, next);
  }

  function saveBroadcasts(next) {
    write(BROADCAST_KEY, next);
  }

  function segmentOptions(selected = "all-guests") {
    return segments()
      .map(
        (segment) =>
          `<option value="${segment.id}" ${segment.id === selected ? "selected" : ""}>${escapeHtml(segment.name)} (${segment.size})</option>`,
      )
      .join("");
  }

  function growthMetrics() {
    const currentCampaigns = campaigns();
    const currentVouchers = vouchers();
    const currentBroadcasts = broadcasts();
    const contacts = segments().reduce((sum, segment) => sum + Number(segment.size || 0), 0);
    const activeCampaigns = currentCampaigns.filter((item) => item.status !== "archived").length;
    const activeVouchers = currentVouchers.filter((item) => item.status === "active").length;
    const sent = currentBroadcasts.reduce((sum, item) => sum + Number(item.sent_count || 0), 0);
    return { contacts, activeCampaigns, activeVouchers, sent };
  }

  function campaignCard(campaign) {
    const segment = segments().find((item) => item.id === campaign.segment);
    return `<article class="card growth-card"><div><span class="diet-badge gold">${escapeHtml(campaign.channel)}</span><span class="diet-badge">${escapeHtml(campaign.status || "draft")}</span><h3>${escapeHtml(campaign.title)}</h3><p>${escapeHtml(campaign.message)}</p><p class="muted">Segment: ${escapeHtml(segment?.name || campaign.segment)} • Priority: ${escapeHtml(campaign.priority)}</p></div><div class="btn-row"><button class="btn primary" data-growth-send="${campaign.id}">Send Now</button><button class="btn ghost" data-growth-duplicate="${campaign.id}">Duplicate</button><button class="btn ghost" data-growth-archive="${campaign.id}">Archive</button></div></article>`;
  }

  function voucherCard(voucher) {
    const value = voucher.discount_type === "percent" ? `${voucher.discount_value}%` : rupiah(voucher.discount_value);
    const usage = `${voucher.used || 0}/${voucher.usage_limit || "∞"}`;
    return `<article class="card growth-card voucher-card"><div><span class="diet-badge ${voucher.status === "active" ? "gold" : ""}">${escapeHtml(voucher.status)}</span><h3>${escapeHtml(voucher.code)}</h3><p>${escapeHtml(voucher.title)}</p><p><b>${value}</b> • usage ${usage}</p><p class="muted">Segment ${escapeHtml(voucher.segment)} • valid sampai ${escapeHtml(voucher.valid_to || "flexible")}</p></div><div class="btn-row"><button class="btn primary" data-growth-send-voucher="${voucher.id}">Broadcast Voucher</button><button class="btn ghost" data-growth-toggle-voucher="${voucher.id}">${voucher.status === "active" ? "Pause" : "Activate"}</button></div></article>`;
  }

  function broadcastRows() {
    const rows = broadcasts().slice(0, 12).map((item) => [
      item.title,
      item.channel,
      item.segment_name,
      String(item.sent_count),
      item.status,
      new Date(item.created_at).toLocaleString("id-ID"),
    ]);
    return table(["Title", "Channel", "Segment", "Sent", "Status", "Created"], rows);
  }

  function growthSuitePage() {
    const metrics = growthMetrics();
    return shell(`<section><span class="eyebrow">🚀 100000 Juta Growth Suite</span><h1>CRM, broadcast, voucher, dan automation lengkap buat AMINO.</h1><p class="lead">Tambahan super lengkap: segmentasi customer, campaign planner, notification broadcast, voucher generator, playbook automation, dan analytics lokal siap Supabase.</p><div class="stats growth-stats"><div class="stat"><b>${metrics.contacts}</b><span>Segment contacts</span></div><div class="stat"><b>${metrics.activeCampaigns}</b><span>Campaigns</span></div><div class="stat"><b>${metrics.activeVouchers}</b><span>Active vouchers</span></div><div class="stat"><b>${metrics.sent}</b><span>Broadcast sent</span></div></div></section>
    <section class="section two-col"><form class="card" id="growthBroadcastForm"><span class="eyebrow">Broadcast</span><h2>Kirim notifikasi massal</h2><input name="title" placeholder="Judul broadcast" required><select name="type"><option value="promo">Promo</option><option value="experience">Experience</option><option value="booking">Booking</option><option value="review">Review</option><option value="system">System</option></select><select name="channel"><option value="in_app">In-app</option><option value="browser">Browser</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option></select><select name="segment">${segmentOptions()}</select><select name="priority"><option>normal</option><option>high</option><option>urgent</option><option>low</option></select><textarea name="message" placeholder="Isi pesan lengkap" required></textarea><button class="btn primary full">Send Broadcast</button></form><form class="card" id="growthVoucherForm"><span class="eyebrow">Voucher</span><h2>Generate voucher</h2><input name="title" placeholder="Nama voucher" required><input name="code" placeholder="Kode voucher" value="AMINO${Math.floor(Math.random() * 9000 + 1000)}" required><select name="discount_type"><option value="amount">Amount</option><option value="percent">Percent</option></select><input name="discount_value" type="number" placeholder="Nilai diskon" required><select name="segment">${segmentOptions("vip-diners")}</select><input name="valid_to" type="date"><input name="usage_limit" type="number" placeholder="Usage limit"><button class="btn gold full">Create Voucher</button></form></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Campaign Planner</span><h2>Campaign siap kirim</h2></div><form id="growthCampaignForm" class="inline-growth-form"><input name="title" placeholder="Campaign baru" required><select name="segment">${segmentOptions()}</select><button class="btn primary">Add</button></form></div><div class="grid growth-grid">${campaigns().filter((item) => item.status !== "archived").map(campaignCard).join("")}</div></section>
    <section class="section"><div class="section-head"><h2>Voucher Wallet</h2><p class="muted">Voucher bisa dibroadcast jadi notifikasi dan dipakai untuk campaign.</p></div><div class="grid growth-grid">${vouchers().map(voucherCard).join("")}</div></section>
    <section class="section two-col"><div class="card"><span class="eyebrow">Automation Playbooks</span><h2>Rules siap produksi</h2><div class="timeline super-timeline">${automationPlaybooks.map(([name, trigger, action], index) => `<div class="timeline-step done"><b>${index + 1}. ${name}</b><span>${trigger}</span><small>${action}</small></div>`).join("")}</div></div><div class="card"><span class="eyebrow">Broadcast Log</span><h2>Riwayat kirim</h2>${broadcastRows()}</div></section>`);
  }

  function createBroadcast({ title, type, channel, segment, priority, message, source = "manual" }) {
    const currentSegment = segments().find((item) => item.id === segment) || segments()[0];
    const record = {
      id: `BCAST-${Date.now()}`,
      title,
      type,
      channel,
      segment,
      segment_name: currentSegment.name,
      priority,
      message,
      source,
      sent_count: currentSegment.size,
      status: "sent",
      created_at: new Date().toISOString(),
    };
    const next = [record, ...broadcasts()];
    saveBroadcasts(next);
    window.aminoNotify?.({
      type,
      channel,
      title,
      body: `${message} (${currentSegment.name}, ${currentSegment.size} recipients)`,
      priority,
      audience: segment === "vip-diners" ? "admin" : "all",
      action_url: "#/growth-suite",
      payload: record,
    });
    toast(`Broadcast terkirim ke ${currentSegment.name}: ${currentSegment.size} recipients.`);
    return record;
  }

  function addCampaign(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const next = [
      {
        id: `campaign-${Date.now()}`,
        title: form.title,
        type: "promo",
        channel: "in_app",
        segment: form.segment,
        message: `Campaign baru ${form.title} siap diedit dan dikirim.`,
        priority: "normal",
        status: "draft",
        scheduled_at: "",
        created_at: new Date().toISOString(),
      },
      ...campaigns(),
    ];
    saveCampaigns(next);
    toast("Campaign baru dibuat.");
    render();
  }

  function sendCampaign(id) {
    const next = campaigns();
    const campaign = next.find((item) => item.id === id);
    if (!campaign) return;
    campaign.status = "sent";
    campaign.sent_at = new Date().toISOString();
    saveCampaigns(next);
    createBroadcast({ ...campaign, source: "campaign" });
    render();
  }

  function duplicateCampaign(id) {
    const item = campaigns().find((campaign) => campaign.id === id);
    if (!item) return;
    saveCampaigns([
      {
        ...item,
        id: `campaign-${Date.now()}`,
        title: `${item.title} Copy`,
        status: "draft",
        created_at: new Date().toISOString(),
      },
      ...campaigns(),
    ]);
    toast("Campaign diduplicate.");
    render();
  }

  function archiveCampaign(id) {
    const next = campaigns().map((item) =>
      item.id === id ? { ...item, status: "archived" } : item,
    );
    saveCampaigns(next);
    toast("Campaign diarsipkan.");
    render();
  }

  function addVoucher(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const next = [
      {
        id: `voucher-${Date.now()}`,
        code: form.code.toUpperCase(),
        title: form.title,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value || 0),
        segment: form.segment,
        valid_to: form.valid_to,
        usage_limit: Number(form.usage_limit || 0),
        used: 0,
        status: "active",
      },
      ...vouchers(),
    ];
    saveVouchers(next);
    toast("Voucher dibuat dan siap broadcast.");
    event.target.reset();
    render();
  }

  function sendVoucher(id) {
    const voucher = vouchers().find((item) => item.id === id);
    if (!voucher) return;
    createBroadcast({
      title: `Voucher ${voucher.code}`,
      type: "promo",
      channel: "in_app",
      segment: voucher.segment,
      priority: "high",
      message: `${voucher.title}: gunakan kode ${voucher.code} sebelum ${voucher.valid_to || "habis"}.`,
      source: "voucher",
    });
    render();
  }

  function toggleVoucher(id) {
    const next = vouchers().map((item) =>
      item.id === id
        ? { ...item, status: item.status === "active" ? "paused" : "active" }
        : item,
    );
    saveVouchers(next);
    toast("Status voucher diperbarui.");
    render();
  }

  function submitBroadcast(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    createBroadcast(form);
    event.target.reset();
    render();
  }

  function handleGrowthClick(event) {
    const target = event.target.closest(
      "[data-growth-send], [data-growth-duplicate], [data-growth-archive], [data-growth-send-voucher], [data-growth-toggle-voucher]",
    );
    if (!target) return;
    if (target.dataset.growthSend) sendCampaign(target.dataset.growthSend);
    if (target.dataset.growthDuplicate) duplicateCampaign(target.dataset.growthDuplicate);
    if (target.dataset.growthArchive) archiveCampaign(target.dataset.growthArchive);
    if (target.dataset.growthSendVoucher) sendVoucher(target.dataset.growthSendVoucher);
    if (target.dataset.growthToggleVoucher) toggleVoucher(target.dataset.growthToggleVoucher);
  }

  function bindGrowthForms() {
    $("#growthBroadcastForm")?.addEventListener("submit", submitBroadcast);
    $("#growthCampaignForm")?.addEventListener("submit", addCampaign);
    $("#growthVoucherForm")?.addEventListener("submit", addVoucher);
  }

  function addGrowthNav() {
    const desktopNav = $(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[href="#/growth-suite"]')) {
      desktopNav.insertAdjacentHTML("beforeend", '<a href="#/growth-suite">Growth</a>');
    }
    const mobileMenu = $("#mobileMenu");
    if (mobileMenu && !mobileMenu.querySelector('[href="#/growth-suite"]')) {
      mobileMenu.insertAdjacentHTML("beforeend", '<a href="#/growth-suite">Growth Suite</a>');
    }
  }

  function patchRoutes() {
    routes["#/growth-suite"] = growthSuitePage;
    const previousBindPage = bindPage;
    bindPage = function growthBindPageWrapper() {
      previousBindPage();
      bindGrowthForms();
    };
  }

  function start() {
    if (typeof routes === "undefined" || typeof bindPage !== "function") {
      setTimeout(start, 250);
      return;
    }
    segments();
    campaigns();
    vouchers();
    patchRoutes();
    addGrowthNav();
    document.addEventListener("click", handleGrowthClick);
    window.aminoGrowthBroadcast = createBroadcast;
    render();
  }

  setTimeout(start, 900);
})();
