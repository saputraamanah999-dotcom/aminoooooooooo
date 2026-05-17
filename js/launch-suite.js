/*
  AMINO RESTO BALI — Launch Completeness Suite.
  Adds missing production handoff surfaces: public contact intake, go-live checklist,
  environment runbook, integrations map, risk register, and handover export.
*/

(function aminoLaunchCompletenessSuite() {
  const LAUNCH_KEY = "aminoLaunchState";
  const CONTACT_KEY = "aminoContactMessages";

  const defaultChecklist = [
    { id: "brand", group: "Brand", title: "Logo, colors, copy, and restaurant identity approved", done: true },
    { id: "menu", group: "Menu", title: "Menu items, variants, allergens, nutrition, and photos reviewed", done: true },
    { id: "orders", group: "Ordering", title: "Cart, checkout, WhatsApp fallback, tax, service, and receipts tested", done: true },
    { id: "booking", group: "Booking", title: "Table booking, experience lead, and admin follow-up flow tested", done: true },
    { id: "supabase", group: "Backend", title: "Supabase schema, RLS, seeds, storage policies, and edge function deployed", done: false },
    { id: "auth", group: "Backend", title: "Auth redirect URLs, password recovery, admin claims, and SMTP verified", done: false },
    { id: "pwa", group: "PWA", title: "Manifest, service worker, offline queue, backup, and install prompt validated", done: true },
    { id: "ops", group: "Operations", title: "KDS, inventory, table map, quality, delivery, and concierge ownership assigned", done: false },
    { id: "payments", group: "Commerce", title: "Payment gateway, bank transfer instructions, refund SOP, and reconciliation ready", done: false },
    { id: "analytics", group: "Growth", title: "UTM plan, campaign segments, voucher codes, and launch reporting prepared", done: false },
    { id: "legal", group: "Compliance", title: "Privacy, cookie, terms, allergy disclaimer, and data retention copy reviewed", done: false },
    { id: "qa", group: "QA", title: "Mobile, desktop, Lighthouse, SQL dry-run, and browser smoke checklist completed", done: false },
  ];

  const defaultRisks = [
    { id: "risk-payments", level: "High", owner: "Finance", issue: "Payment gateway belum dipasang", mitigation: "Aktifkan Midtrans/Xendit atau tampilkan bank transfer manual sebelum launch." },
    { id: "risk-assets", level: "Medium", owner: "Brand", issue: "Foto asli restoran belum tersedia", mitigation: "Gunakan placeholder CSS untuk demo, lalu upload foto ke Supabase Storage saat produksi." },
    { id: "risk-staff", level: "Medium", owner: "Operations", issue: "Belum ada training SOP admin", mitigation: "Jalankan checklist QA bersama kasir, kitchen, runner, dan manager selama soft opening." },
  ];

  const integrationRows = [
    ["Supabase Auth", "Login/register/reset password", "Frontend ready; configure Site URL + redirect URLs"],
    ["Supabase Database", "Orders, bookings, menu, reviews, operations suites", "Run schema, RLS, seeds, hardening SQL"],
    ["Supabase Storage", "Menu/gallery/review media", "Bucket policies included; add real assets"],
    ["Edge Function", "Order/booking email notification", "Set SMTP_* secrets and deploy send-order-email"],
    ["WhatsApp", "Fast customer ordering fallback", "Update restaurant phone number in configuration"],
    ["Maps", "Directions and live location", "OpenStreetMap embed ready; Google Maps link fallback"],
    ["Payment Gateway", "Online payment and settlement", "Integration slot documented; not enabled in static demo"],
    ["Analytics", "Launch dashboard and campaign attribution", "Use activity logs + UTM naming plan"],
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

  function launchState() {
    return read(LAUNCH_KEY, {
      checklist: defaultChecklist,
      risks: defaultRisks,
      notes: [
        { id: "note-1", body: "Soft launch target: 7 hari setelah Supabase production project aktif.", created_at: new Date().toISOString() },
      ],
      owner: "AMINO Manager",
      environment: "staging",
      updated_at: new Date().toISOString(),
    });
  }

  function saveLaunchState(next) {
    write(LAUNCH_KEY, { ...launchState(), ...next, updated_at: new Date().toISOString() });
  }

  function contactMessages() {
    return read(CONTACT_KEY, []);
  }

  function readinessMetrics() {
    const checklist = launchState().checklist;
    const done = checklist.filter((item) => item.done).length;
    const percent = Math.round((done / checklist.length) * 100);
    const blockers = checklist.filter((item) => !item.done).length;
    return { done, total: checklist.length, percent, blockers };
  }

  function launchCenterPage() {
    const data = launchState();
    const metrics = readinessMetrics();
    const groups = [...new Set(data.checklist.map((item) => item.group))];
    const groupCards = groups
      .map((group) => {
        const items = data.checklist.filter((item) => item.group === group);
        return `<article class="card launch-card"><h3>${escapeHtml(group)}</h3>${items
          .map(
            (item) =>
              `<label class="launch-check ${item.done ? "done" : ""}"><input type="checkbox" data-launch-check="${escapeHtml(item.id)}" ${item.done ? "checked" : ""}> <span>${escapeHtml(item.title)}</span></label>`,
          )
          .join("")}</article>`;
      })
      .join("");

    return shell(`<section><span class="eyebrow">✅ Launch Center</span><h1>Completeness dashboard untuk membuat demo siap handover.</h1><p class="lead">Halaman ini menutup gap “kurang lengkap”: checklist produksi, integrasi, risiko, runbook, dan export handover dalam satu tempat.</p><div class="stats launch-stats"><div class="stat"><b>${metrics.percent}%</b><span>Readiness</span></div><div class="stat"><b>${metrics.done}/${metrics.total}</b><span>Checklist complete</span></div><div class="stat"><b>${metrics.blockers}</b><span>Open blockers</span></div><div class="stat"><b>${escapeHtml(data.environment)}</b><span>Environment</span></div></div></section>
      <section class="grid launch-grid">${groupCards}</section>
      <section class="two-col section"><div class="card"><h2>Integration Map</h2>${table(["System", "Purpose", "Status / Next Step"], integrationRows)}</div><div class="card"><h2>Go-live Runbook</h2><ol class="runbook"><li>Clone repo, set restaurant copy, logo, phone, and map details.</li><li>Run SQL in order from README, then verify RLS with anon and admin users.</li><li>Deploy edge function and set runtime secrets, never put secrets in frontend.</li><li>Run QA checklist on mobile, tablet, desktop, online, and offline.</li><li>Train cashier, kitchen, runner, manager, and customer care with admin routes.</li><li>Export backup from Offline Center before and after soft launch.</li></ol><div class="btn-row"><button class="btn primary" data-launch-export>Export Handover JSON</button><a class="btn ghost" href="#/offline-center">Open Offline Center</a></div></div></section>
      <section class="two-col section"><div class="card"><h2>Risk Register</h2>${data.risks
        .map((risk) => `<div class="risk-row"><b>${escapeHtml(risk.level)}</b><div><strong>${escapeHtml(risk.issue)}</strong><span>${escapeHtml(risk.owner)} • ${escapeHtml(risk.mitigation)}</span></div></div>`)
        .join("")}</div><form id="launchNoteForm" class="card"><h2>Launch Note</h2><input name="owner" placeholder="Owner" value="${escapeHtml(data.owner)}"><textarea name="body" placeholder="Tambahkan keputusan, blocker, atau handover note" required></textarea><button class="btn gold full">Save Launch Note</button><div class="note-list">${data.notes
          .slice(0, 4)
          .map((note) => `<p><b>${new Date(note.created_at).toLocaleDateString("id-ID")}</b> ${escapeHtml(note.body)}</p>`)
          .join("")}</div></form></section>`);
  }

  function contactPage() {
    const messages = contactMessages();
    return shell(`<section><span class="eyebrow">Contact</span><h1>Kontak, catering, partnership, dan support AMINO.</h1><p class="lead">Customer bisa kirim pertanyaan lengkap tanpa harus masuk ke admin. Pesan tersimpan lokal untuk demo dan siap dipetakan ke Supabase contact_messages.</p></section>
      <section class="two-col section"><form id="contactForm" class="card"><h2>Kirim Pesan</h2><input name="name" placeholder="Nama" required><input name="email" type="email" placeholder="Email"><input name="phone" placeholder="WhatsApp"><select name="topic"><option>Reservation help</option><option>Catering / private event</option><option>Allergy / dietary request</option><option>Partnership</option><option>Website support</option></select><textarea name="message" placeholder="Tulis kebutuhan Anda" required></textarea><button class="btn primary full">Send Message</button></form><div class="card"><h2>Fast Channels</h2><div class="contact-stack"><a class="contact-pill" href="tel:+6282341885469">☎ +62 823-4188-5469</a><button class="contact-pill" data-wa>💬 WhatsApp Order / Chat</button><a class="contact-pill" href="#/live-location">📍 Directions & Live Location</a><a class="contact-pill" href="#/faq">❓ FAQ</a><a class="contact-pill" href="#/launch-center">✅ Launch Center</a></div><h3>Jam Operasional</h3><p>Setiap hari 07:30–22:30 WITA. Last order dine-in 22:00.</p></div></section>
      <section class="section card"><h2>Recent Demo Messages</h2>${table(["Name", "Topic", "Message", "Status"], messages.slice(0, 8).map((m) => [m.name, m.topic, m.message, m.status]))}</section>`);
  }

  function bindLaunchSuite() {
    $$('[data-launch-check]').forEach((input) => {
      input.onchange = () => {
        const data = launchState();
        data.checklist = data.checklist.map((item) => (item.id === input.dataset.launchCheck ? { ...item, done: input.checked } : item));
        saveLaunchState(data);
        toast("Launch checklist diperbarui.");
        render();
      };
    });
    $("#launchNoteForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(event.target));
      const data = launchState();
      saveLaunchState({
        owner: form.owner || data.owner,
        notes: [{ id: `note-${Date.now()}`, body: form.body, created_at: new Date().toISOString() }, ...data.notes],
      });
      toast("Launch note disimpan.");
      render();
    });
    $('[data-launch-export]')?.addEventListener("click", () => {
      const payload = {
        exported_at: new Date().toISOString(),
        launch: launchState(),
        contacts: contactMessages(),
        readiness: readinessMetrics(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amino-launch-handover-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Handover JSON diexport.");
    });
    $("#contactForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = Object.fromEntries(new FormData(event.target));
      const message = { id: `MSG-${Date.now()}`, ...form, status: "new", created_at: new Date().toISOString() };
      write(CONTACT_KEY, [message, ...contactMessages()]);
      if (typeof supabaseClient !== "undefined" && supabaseClient) {
        supabaseClient
          .from("contact_messages")
          .insert({
            name: message.name,
            email: message.email || null,
            phone: message.phone || null,
            topic: message.topic,
            message: message.message,
            status: message.status,
            metadata: { local_id: message.id },
          })
          .then(({ error }) => {
            if (error) console.warn("Contact Supabase insert failed", error);
          });
      }
      window.aminoNotify?.({
        type: "contact",
        title: "Pesan kontak baru",
        body: `${message.name} • ${message.topic}`,
        priority: message.topic?.includes("Catering") ? "high" : "normal",
        audience: "admin",
        action_url: "#/contact",
        payload: { contact_id: message.id },
      });
      toast("Pesan tersimpan. Tim AMINO akan follow up.");
      event.target.reset();
      render();
    });
  }

  function registerLaunchSuite() {
    routes["#/launch-center"] = launchCenterPage;
    routes["#/contact"] = contactPage;
    const originalBind = bindPage;
    window.bindPage = function bindPageWithLaunchSuite() {
      originalBind();
      bindLaunchSuite();
    };
  }

  if (typeof routes === "undefined" || typeof bindPage !== "function") {
    console.warn("AMINO Launch Suite skipped: base app not ready.");
    return;
  }

  registerLaunchSuite();
  render();
})();
