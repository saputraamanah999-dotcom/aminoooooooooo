// Supabase Edge Function: send-order-email
// Secrets required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
// Do not expose service role or SMTP secrets in frontend code.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const ADMIN_EMAIL = "aminoresto@gmail.com";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Number(Deno.env.get("SMTP_PORT") || 587);
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const smtpFrom = Deno.env.get("SMTP_FROM") || smtpUser;
  const supabase = createClient(supabaseUrl, serviceKey);
  let logId = null;
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);
    if (userError || !userData?.user) throw new Error("Unauthorized");
    const payload = await req.json();
    const type = payload.type || "order";
    const subject =
      payload.subject ||
      (type === "booking"
        ? "New AMINO Booking"
        : type === "review"
          ? "New AMINO Review"
          : type === "experience"
            ? "New AMINO Experience Lead"
            : "New AMINO Order");
    const title = payload.title || subject;
    const body = payload.body || `New ${type} notification from AMINO RESTO BALI.`;
    const { data: log } = await supabase
      .from("notifications")
      .insert({
        user_id: userData.user.id,
        type,
        channel: "email",
        audience: payload.audience || "admin",
        target_email: ADMIN_EMAIL,
        title,
        subject,
        body,
        priority: payload.priority || "high",
        action_url: payload.action_url || null,
        status: "pending",
        payload,
      })
      .select()
      .single();
    logId = log?.id;

    let detail = payload;
    if (payload.order_id) {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*), orders_manual(*)")
        .eq("id", payload.order_id)
        .single();
      detail = data || payload;
    }
    if (payload.booking_id) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", payload.booking_id)
        .single();
      detail = data || payload;
    }
    if (payload.review_id) {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", payload.review_id)
        .single();
      detail = data || payload;
    }
    if (payload.experience_lead_id) {
      const { data } = await supabase
        .from("experience_leads")
        .select("*")
        .eq("id", payload.experience_lead_id)
        .single();
      detail = data || payload;
    }

    const html = `<h2>${subject}</h2><p>AMINO RESTO BALI notification.</p><pre>${escapeHtml(JSON.stringify(detail, null, 2))}</pre>`;
    const smtp = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: smtpPort === 465,
        auth: { username: smtpUser, password: smtpPass },
      },
    });
    await smtp.send({ from: smtpFrom, to: ADMIN_EMAIL, subject, html });
    if (detail?.email)
      await smtp.send({
        from: smtpFrom,
        to: detail.email,
        subject: `AMINO confirmation: ${subject}`,
        html: `<p>Thank you from AMINO RESTO BALI.</p>${html}`,
      });
    await smtp.close();
    if (logId)
      await supabase
        .from("notifications")
        .update({ status: "sent" })
        .eq("id", logId);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (error) {
    if (logId)
      await supabase
        .from("notifications")
        .update({ status: "failed", error_message: error.message })
        .eq("id", logId);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 400,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
