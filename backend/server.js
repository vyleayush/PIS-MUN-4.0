const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { dbHelpers } = require("./db");

// Simple .env parser for Node backend
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    lines.forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
}
loadEnv();

const PORT = process.env.PORT || 8000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "paramountinternationalmun.26@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mun0910@";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_12345";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || "paramountinternationalmun.26@gmail.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BASE_FEE = 2000;

// ----------------------------- Email Templates -----------------------------

function wrapEmail(inner) {
  return `
    <div style="background:#070A0F;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#0E1426;border:1px solid #1E2A44;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #1E2A44;">
          <div style="font-size:11px;letter-spacing:3px;color:#C7A35A;text-transform:uppercase;">Paramount International MUN</div>
          <div style="font-size:12px;color:#9A98A0;margin-top:4px;">9–10 October 2026 · Paramount International School</div>
        </td></tr>
        <tr><td style="padding:28px;color:#F2F0EA;font-size:14px;line-height:1.7;">${inner}</td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #1E2A44;color:#6E7280;font-size:11px;">
          This is an automated message from Paramount International MUN.
        </td></tr>
      </table>
    </div>`;
}

function organizerEmailHtml(reg) {
  const p1 = reg.preference1 || {};
  const p2 = reg.preference2 || {};
  const p3 = reg.preference3 || {};
  const rows = [
    ["Reference ID", reg.reference_id],
    ["Name", reg.full_name],
    ["Email", reg.email],
    ["Phone", reg.phone],
    ["School / College", reg.school],
    ["City", reg.city || ""],
    ["Experience", reg.experience || ""],
    ["Awards / Notable MUNs", reg.awards || "—"],
    ["Delegation", reg.is_delegation ? `Yes (${reg.delegation_size || "?"})` : "No"],
    ["Heard from", reg.heard_from || "—"],
    ["Preference 1", `${p1.committee || "—"} — ${p1.portfolio || "Any"}`],
    ["Preference 2", `${p2.committee || "—"} — ${p2.portfolio || "Any"}`],
    ["Preference 3", `${p3.committee || "—"} — ${p3.portfolio || "Any"}`],
    ["Referral code", reg.referral_code || "—"],
    ["ID card uploaded", reg.id_card ? "Yes" : "No"],
    ["Fee tier", `₹${reg.fee} (${reg.fee_tier})`],
    ["Payment status", reg.payment_status],
  ];
  const tr = rows
    .map(
      ([k, v]) =>
        `<tr><td style='padding:6px 0;color:#9A98A0;width:42%;vertical-align:top;'>${k}</td>` +
        `<td style='padding:6px 0;color:#F2F0EA;'>${v}</td></tr>`
    )
    .join("");
  const adminLink = `${FRONTEND_URL}/admin`;
  const inner = `
    <h2 style='margin:0 0 14px;color:#F2F0EA;font-size:18px;'>New Registration</h2>
    <table width='100%' style='font-size:13px;'>${tr}</table>
    <div style='margin-top:20px;padding:14px 16px;background:#1A1710;border:1px solid #3A2F18;border-radius:10px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Allot this delegate</div>
      <p style='color:#C9C6BC;margin:6px 0 10px;font-size:13px;'>Open the live matrix to verify payment/ID and allot a portfolio.</p>
      <a href='${adminLink}' style='display:inline-block;background:#C7A35A;color:#070A0F;text-decoration:none;font-weight:600;font-size:13px;padding:9px 16px;border-radius:8px;'>Open Live Matrix →</a>
    </div>`;
  return wrapEmail(inner);
}

function delegateEmailHtml(reg) {
  const firstName = (reg.full_name || "").split(" ")[0];
  const inner = `
    <h2 style='margin:0 0 8px;color:#F2F0EA;font-size:20px;'>You're on the list.</h2>
    <p style='color:#C9C6BC;margin:0 0 18px;'>Thanks for registering for Paramount International MUN, ${firstName}. Your submission has been received and is now with our organizing committee.</p>
    <div style='background:#121A2F;border:1px solid #1E2A44;border-radius:12px;padding:16px 18px;margin:0 0 18px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Your Reference ID</div>
      <div style='font-size:22px;color:#F2F0EA;letter-spacing:1px;margin-top:4px;font-family:monospace;'>${reg.reference_id}</div>
    </div>
    <p style='color:#C9C6BC;margin:0 0 6px;'><strong style='color:#F2F0EA;'>Delegate fee:</strong> ₹${reg.fee}</p>
    <p style='color:#C9C6BC;margin:0 0 18px;'>Your fee includes the full delegate kit — pad file, ID card, pen, notepad, and meals across both conference days.</p>
    <div style='background:#1A1710;border:1px solid #3A2F18;border-radius:12px;padding:14px 16px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Please note</div>
      <p style='color:#C9C6BC;margin:6px 0 0;'>All registrations are <strong style='color:#F2F0EA;'>non-refundable</strong>.</p>
    </div>
    <p style='color:#9A98A0;margin:18px 0 0;font-size:12px;'>See you on 9–10 October 2026 at Paramount International School.</p>`;
  return wrapEmail(inner);
}

function allotmentEmailHtml(reg) {
  const firstName = (reg.full_name || "").split(" ")[0];
  const inner = `
    <h2 style='margin:0 0 14px;color:#F2F0EA;font-size:20px;'>Hey ${firstName}!</h2>
    <p style='color:#C9C6BC;margin:0 0 18px;'>It’s happening! You’re officially part of the chaos, diplomacy, and absolute cinema that is Paramount iSchool MUN 2026, and we couldn’t be more pumped to have you on board.</p>
    <p style='color:#C9C6BC;margin:0 0 18px;'>And finally, the most awaited part—your allotment. Because, let’s be honest, this is what you scrolled down for:</p>
    <div style='background:#121A2F;border:1px solid #1E2A44;border-radius:12px;padding:16px 18px;margin:0 0 18px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;'>Committee</div>
      <div style='font-size:16px;color:#F2F0EA;letter-spacing:1px;margin-top:4px;'>${reg.allotted_committee}</div>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;margin-top:12px;'>Portfolio</div>
      <div style='font-size:16px;color:#F2F0EA;letter-spacing:1px;margin-top:4px;'>${reg.allotted_portfolio}</div>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;margin-top:12px;'>Delegate ID</div>
      <div style='font-size:16px;color:#F2F0EA;letter-spacing:1px;margin-top:4px;font-family:monospace;'>${reg.reference_id}</div>
    </div>
    <p style='color:#C9C6BC;margin:0 0 14px;font-style:italic;'>(Yes, it’s giving major "main character" energy.)</p>
    <p style='color:#C9C6BC;margin:0 0 14px;'>We went through all your preferences, past experience, and what was available—and just like that, this combination felt like the perfect match.</p>
    <p style='color:#C9C6BC;margin:0 0 14px;'>Now here’s the tip: your country or portfolio is your whole personality for the conference. So make sure you know everything about it—their stance, their vibe, their diplomatic drama, every bit of it. This is your time to slay in committee, and we know you will.</p>
    <p style='color:#C9C6BC;margin:0 0 14px;'>Got questions, doubts, or just wanna rant about how excited you are? Slide into our inbox at <a href="mailto:${ORGANIZER_EMAIL}" style="color:#C7A35A;text-decoration:none;">${ORGANIZER_EMAIL}</a>—we got you.</p>
    <p style='color:#C9C6BC;margin:0 0 18px;'>We’re genuinely looking forward to hosting you this 9th and 10th October, 2026. More than just a competition, it’s going to be an experience you’ll remember. Welcome to the Paramount iSchool MUN family. We seriously can’t wait to see you show up, speak up, and absolutely own that committee room.</p>
    <p style='color:#9A98A0;margin:18px 0 0;font-size:12px;'>Stay Iconic,<br><br>Team Delegate Affairs<br>Paramount iSchool MUN</p>`;
  return wrapEmail(inner);
}

function sendGmailEmail(to, subject, html, bcc = null) {
  return new Promise((resolve) => {
    const user = process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.log(`[EMAIL NOTICE] GMAIL_APP_PASSWORD is not set. Skipped sending email to ${to}`);
      return resolve({ ok: false, error: "no_credentials" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const mailOptions = {
      from: `"Paramount MUN" <${user}>`,
      to,
      subject,
      html,
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`[EMAIL ERROR] Sending to ${to}: ${error.message}`);
        resolve({ ok: false, error: error.message });
      } else {
        console.log(`[EMAIL SUCCESS] Email delivered to ${to}`);
        resolve({ ok: true });
      }
    });
  });
}

function makeRefId() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let part = "";
  for (let i = 0; i < 6; i++) {
    part += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PMUN-${part}`;
}

function committeePublic(c) {
  const portfolios = c.portfolios || [];
  const open_count = portfolios.filter((p) => p.status === "available").length;
  return {
    id: c.id || c.slug,
    slug: c.slug,
    name: c.name,
    full_name: c.full_name,
    agenda: c.agenda,
    tag: c.tag || "",
    chair: c.chair || "TBA",
    eb: c.eb || "TBA",
    difficulty: c.difficulty || "Beginner Friendly",
    handbook_link: c.handbook_link || "",
    order: c.order || 0,
    open_count,
    total_count: portfolios.length,
    portfolios: portfolios.map((p) => ({
      name: p.name,
      party: p.party || null,
      status: p.status || "available",
    })),
  };
}

// ----------------------------- HTTP Server -----------------------------

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  const sendJson = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const getBody = (callback) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 30 * 1024 * 1024) {
        // 30MB limit for base64 uploads
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ detail: "Payload too large" }));
        req.connection.destroy();
      }
    });
    req.on("end", () => {
      try {
        const contentType = req.headers["content-type"] || "";
        if (contentType.includes("application/json")) {
          const json = body ? JSON.parse(body) : {};
          callback(json);
        } else if (contentType.includes("multipart/form-data")) {
          // Parse multipart screenshot upload if sent as form-data
          let screenshot = "";
          const match = body.match(/filename=".*?"\r\nContent-Type: .*?\r\n\r\n([\s\S]*?)------/);
          if (match && match[1]) {
            screenshot = "data:image/png;base64," + Buffer.from(match[1], "binary").toString("base64");
          }
          callback({ payment_screenshot: screenshot, file: screenshot });
        } else {
          try {
            const json = body ? JSON.parse(body) : {};
            callback(json);
          } catch (e) {
            callback({});
          }
        }
      } catch (err) {
        sendJson(400, { detail: "Invalid request payload format" });
      }
    });
  };

  // --- API Routes ---

  // Health check
  if ((pathname === "/api" || pathname === "/api/" || pathname === "/api/health") && req.method === "GET") {
    return sendJson(200, {
      message: "Paramount International MUN API (Node.js & SQLite)",
      status: "healthy",
      database: "SQLite (paramount_mun.db)",
    });
  }

  // GET /api/committees
  if (pathname === "/api/committees" && req.method === "GET") {
    const list = dbHelpers.getCommittees();
    return sendJson(200, list.map(committeePublic));
  }

  // GET /api/committees/:slug
  if (pathname.startsWith("/api/committees/") && req.method === "GET") {
    const slug = pathname.replace("/api/committees/", "").trim();
    const found = dbHelpers.getCommitteeBySlug(slug);
    if (found) {
      return sendJson(200, committeePublic(found));
    }
    return sendJson(404, { detail: "Committee not found" });
  }

  // POST /api/referral/validate
  if (pathname === "/api/referral/validate" && req.method === "POST") {
    return getBody((payload) => {
      const code = (payload.code || "").trim().toUpperCase();
      if (!code) return sendJson(200, { valid: false });
      const rec = dbHelpers.getReferralCode(code);
      if (rec && rec.active) {
        return sendJson(200, { valid: true, label: rec.label, discount: rec.discount });
      }
      return sendJson(200, { valid: false });
    });
  }

  // POST /api/registrations
  if (pathname === "/api/registrations" && req.method === "POST") {
    return getBody((payload) => {
      if (!payload.accepted_terms) {
        return sendJson(400, { detail: "You must accept the terms to register." });
      }
      if (!payload.full_name || !payload.email || !payload.phone) {
        return sendJson(400, { detail: "Please provide full name, email, and phone." });
      }

      let fee = BASE_FEE;
      let tier = "Standard";
      let applied_code = null;

      const code = (payload.referral_code || "").trim().toUpperCase();
      if (code) {
        const rec = dbHelpers.getReferralCode(code);
        if (rec && rec.active) {
          fee = BASE_FEE - (rec.discount || 500);
          tier = "Paramount (referral)";
          applied_code = rec.code;
          dbHelpers.incrementReferralUsage(rec.code);
        }
      }

      const reference_id = makeRefId();
      const newRegistration = {
        id: crypto.randomUUID(),
        reference_id,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        school: payload.school || "",
        city: payload.city || "",
        experience: payload.experience || "",
        awards: payload.awards || "",
        is_delegation: payload.is_delegation ? 1 : 0,
        delegation_size: payload.delegation_size || null,
        heard_from: payload.heard_from || "",
        preference1: payload.preference1 || { committee: "", portfolio: "" },
        preference2: payload.preference2 || { committee: "", portfolio: "" },
        preference3: payload.preference3 || { committee: "", portfolio: "" },
        referral_code: payload.referral_code || "",
        applied_referral: applied_code,
        fee,
        fee_tier: tier,
        payment_status: "pending",
        payment_screenshot: payload.payment_screenshot || "",
        id_card: payload.id_card || "",
        accepted_terms: 1,
        admin_note: "",
        allotted_committee: "",
        allotted_portfolio: "",
        created_at: new Date().toISOString(),
        email_status: { organizer: false, delegate: false },
      };

      const saved = dbHelpers.createRegistration(newRegistration);
      console.log(`[Registration] Created in SQLite: ${reference_id} for ${payload.full_name} (${payload.email})`);

      // Fire confirmation emails asynchronously
      const orgHtml = organizerEmailHtml(newRegistration);
      const delHtml = delegateEmailHtml(newRegistration);

      Promise.all([
        sendGmailEmail(ORGANIZER_EMAIL, `New MUN Registration — ${reference_id} (${payload.full_name})`, orgHtml),
        sendGmailEmail(payload.email, `Registration received — Paramount International MUN (${reference_id})`, delHtml),
      ]).then(([orgRes, delRes]) => {
        dbHelpers.updateRegistration(saved.id, {
          email_status: { organizer: orgRes.ok, delegate: delRes.ok },
        });
      });

      return sendJson(200, {
        ok: true,
        reference_id,
        email_status: newRegistration.email_status,
      });
    });
  }

  // POST /api/registrations/:ref/screenshot
  if (pathname.startsWith("/api/registrations/") && pathname.endsWith("/screenshot") && req.method === "POST") {
    const parts = pathname.split("/");
    const ref = parts[3];
    return getBody((payload) => {
      const reg = dbHelpers.getRegistration(ref);
      if (!reg) {
        return sendJson(404, { detail: "Registration not found" });
      }
      const screenshot = payload.payment_screenshot || payload.file;
      if (screenshot) {
        const updated = dbHelpers.updateRegistration(reg.id, { payment_screenshot: screenshot });
        return sendJson(200, { ok: true, registration: updated });
      }
      return sendJson(200, { ok: true, registration: reg });
    });
  }

  // POST /api/admin/login
  if (pathname === "/api/admin/login" && req.method === "POST") {
    return getBody((payload) => {
      if (
        (payload.email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        payload.password === ADMIN_PASSWORD
      ) {
        const token = "admin_token_" + Date.now();
        return sendJson(200, { token, email: ADMIN_EMAIL });
      }
      return sendJson(401, { detail: "Invalid admin credentials" });
    });
  }

  // GET /api/admin/stats
  if (pathname === "/api/admin/stats" && req.method === "GET") {
    return sendJson(200, dbHelpers.getStats());
  }

  // GET /api/admin/registrations
  if (pathname === "/api/admin/registrations" && req.method === "GET") {
    return sendJson(200, dbHelpers.getRegistrations());
  }

  // PATCH /api/admin/registrations/:id
  if (pathname.startsWith("/api/admin/registrations/") && !pathname.endsWith("/allot") && req.method === "PATCH") {
    const id = pathname.replace("/api/admin/registrations/", "").trim();
    return getBody((payload) => {
      const updated = dbHelpers.updateRegistration(id, payload);
      if (!updated) return sendJson(404, { detail: "Registration not found" });
      return sendJson(200, { ok: true, registration: updated, ...updated });
    });
  }

  // DELETE /api/admin/registrations/:id
  if (pathname.startsWith("/api/admin/registrations/") && req.method === "DELETE") {
    const id = pathname.replace("/api/admin/registrations/", "").trim();
    const result = dbHelpers.deleteRegistration(id);
    if (result.changes === 0) return sendJson(404, { detail: "Registration not found" });
    return sendJson(200, { ok: true });
  }

  // POST /api/admin/registrations/:id/allot
  if (pathname.startsWith("/api/admin/registrations/") && pathname.endsWith("/allot") && req.method === "POST") {
    const parts = pathname.split("/");
    const id = parts[4];

    return getBody((payload) => {
      const reg = dbHelpers.getRegistration(id);
      if (!reg) return sendJson(404, { detail: "Registration not found" });

      const { committeeSlug, portfolioName } = payload;
      if (!committeeSlug || !portfolioName) {
        return sendJson(400, { detail: "committeeSlug and portfolioName are required" });
      }

      // Update registration with allotment & mark verified
      const updatedReg = dbHelpers.updateRegistration(reg.id, {
        allotted_committee: committeeSlug,
        allotted_portfolio: portfolioName,
        payment_status: "verified",
      });

      // Update portfolio status in committee
      dbHelpers.updatePortfolio(committeeSlug, portfolioName, "allotted", reg.full_name);

      // Send allotment email asynchronously
      const subject = "It’s giving diplomacy. Your Paramount iSchool MUN allotment is here! 🏛️✨";
      const html = allotmentEmailHtml(updatedReg);
      sendGmailEmail(updatedReg.email, subject, html, ORGANIZER_EMAIL).then((res) => {
        if (!res.ok) console.error("[EMAIL ERROR] Allotment email failed:", res.error);
      });

      return sendJson(200, { ok: true, registration: updatedReg });
    });
  }

  // GET /api/admin/allotments.csv
  if (pathname === "/api/admin/allotments.csv" && req.method === "GET") {
    const csvData = dbHelpers.generateAllotmentsCsv();
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="allotments.csv"',
    });
    res.end(csvData);
    return;
  }

  // GET /api/admin/committees
  if (pathname === "/api/admin/committees" && req.method === "GET") {
    return sendJson(200, dbHelpers.getCommittees());
  }

  // PATCH /api/admin/committees/:slug/portfolios
  if (pathname.startsWith("/api/admin/committees/") && pathname.endsWith("/portfolios") && req.method === "PATCH") {
    const parts = pathname.split("/");
    const slug = parts[4];
    return getBody((payload) => {
      const updated = dbHelpers.updatePortfolio(slug, payload.name, payload.status);
      if (!updated) return sendJson(404, { detail: "Committee not found" });
      return sendJson(200, updated);
    });
  }

  // PATCH /api/admin/committees/:slug
  if (pathname.startsWith("/api/admin/committees/") && req.method === "PATCH") {
    const slug = pathname.replace("/api/admin/committees/", "").trim();
    return getBody((payload) => {
      const updated = dbHelpers.updateCommittee(slug, payload);
      if (!updated) return sendJson(404, { detail: "Committee not found" });
      return sendJson(200, updated);
    });
  }

  // GET /api/admin/referral-codes
  if (pathname === "/api/admin/referral-codes" && req.method === "GET") {
    return sendJson(200, dbHelpers.getReferralCodes());
  }

  // POST /api/admin/referral-codes
  if (pathname === "/api/admin/referral-codes" && req.method === "POST") {
    return getBody((payload) => {
      const code = (payload.code || "").trim().toUpperCase();
      if (!code) return sendJson(400, { detail: "Code is required" });
      try {
        const created = dbHelpers.createReferralCode(payload);
        return sendJson(200, created);
      } catch (err) {
        if (err.message && err.message.includes("UNIQUE constraint failed")) {
          return sendJson(400, { detail: "Code already exists" });
        }
        return sendJson(500, { detail: "Failed to create code" });
      }
    });
  }

  // PATCH /api/admin/referral-codes/:code
  if (pathname.startsWith("/api/admin/referral-codes/") && req.method === "PATCH") {
    const code = pathname.replace("/api/admin/referral-codes/", "").trim().toUpperCase();
    return getBody((payload) => {
      const updated = dbHelpers.updateReferralCode(code, payload);
      if (!updated) return sendJson(404, { detail: "Referral code not found" });
      return sendJson(200, updated);
    });
  }

  // DELETE /api/admin/referral-codes/:code
  if (pathname.startsWith("/api/admin/referral-codes/") && req.method === "DELETE") {
    const code = pathname.replace("/api/admin/referral-codes/", "").trim().toUpperCase();
    const result = dbHelpers.deleteReferralCode(code);
    if (result.changes === 0) return sendJson(404, { detail: "Referral code not found" });
    return sendJson(200, { ok: true });
  }

  // Fallback: If not an API route, serve static files from React build directory
  if (!pathname.startsWith("/api")) {
    const buildPath = path.join(__dirname, "../frontend/build");
    if (fs.existsSync(buildPath)) {
      let reqPath = pathname === "/" ? "/index.html" : pathname;
      let filePath = path.join(buildPath, reqPath);

      // Safe path traversal check
      if (!filePath.startsWith(buildPath)) {
        return sendJson(403, { detail: "Access forbidden" });
      }

      // If file doesn't exist (e.g. /admin, /register, /handbook client-side routes), serve index.html
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(buildPath, "index.html");
      }

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".pdf": "application/pdf",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
          ".eot": "application/vnd.ms-fontobject",
          ".map": "application/json",
          ".txt": "text/plain",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        try {
          const content = fs.readFileSync(filePath);
          res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
          });
          res.end(content);
          return;
        } catch (readErr) {
          return sendJson(500, { detail: "Failed to read static file" });
        }
      }
    }
  }

  // Fallback 404 for unmatched API routes
  return sendJson(404, { detail: `Route ${req.method} ${pathname} not found` });
});

server.listen(PORT, () => {
  console.log(`[Paramount MUN Fullstack] Server running on http://localhost:${PORT}`);
  console.log(`[Paramount MUN Fullstack] Embedded SQLite Database initialized at backend/data/paramount_mun.db`);
});
