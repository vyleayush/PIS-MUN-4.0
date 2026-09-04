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

// Safety guards to keep backend process resilient and prevent unexpected termination
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception:", err.message || err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL] Unhandled Promise Rejection:", reason);
});

const PORT = process.env.PORT || 8000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "paramountinternationalmun.26@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mun0910@";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_12345";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || "paramountinternationalmun.26@gmail.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BASE_FEE = 1700;

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

function formatFullName(name) {
  if (!name) return "Delegate";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getCommitteeDetails(slugOrName) {
  if (!slugOrName) return { name: "To Be Announced", fullName: "" };
  const clean = slugOrName.toLowerCase().trim();
  const c = dbHelpers.getCommitteeBySlug ? dbHelpers.getCommitteeBySlug(clean) : null;
  if (c) {
    return { name: c.name || slugOrName.toUpperCase(), fullName: c.full_name || "" };
  }
  const map = {
    unga: { name: "UNGA", fullName: "United Nations General Assembly" },
    aippm: { name: "AIPPM", fullName: "All India Political Parties Meet" },
    who: { name: "WHO", fullName: "World Health Organization" },
    uncsw: { name: "UNCSW", fullName: "UN Commission on the Status of Women" },
    unhrc: { name: "UNHRC", fullName: "United Nations Human Rights Council" },
  };
  if (map[clean]) return map[clean];
  return { name: slugOrName.toUpperCase(), fullName: "" };
}

function delegateEmailHtml(reg) {
  const formattedName = formatFullName(reg.full_name);
  const inner = `
    <h2 style='margin:0 0 8px;color:#F2F0EA;font-size:22px;font-family:"Georgia","Times New Roman",serif;'>Registration Received</h2>
    <p style='color:#C9C6BC;margin:0 0 18px;font-size:14px;line-height:1.7;'>Dear <strong style='color:#FFFFFF;'>${formattedName}</strong>,</p>
    <p style='color:#C9C6BC;margin:0 0 18px;font-size:14px;line-height:1.7;'>Thank you for registering for <strong>Paramount International Model United Nations 2026</strong>. Your submission has been received and is currently under review by our Secretariat.</p>
    <div style='background:linear-gradient(145deg,#0B101E,#131A2E);border:1.5px solid #C7A35A;border-radius:12px;padding:18px 20px;margin:0 0 18px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-weight:700;'>Your Delegate Reference ID</div>
      <div style='font-size:22px;color:#E7C978;letter-spacing:2px;margin-top:4px;font-family:"Courier New",monospace;font-weight:700;'>${reg.reference_id}</div>
    </div>
    <p style='color:#C9C6BC;margin:0 0 6px;font-size:14px;'><strong style='color:#F2F0EA;'>Delegate fee:</strong> ₹${reg.fee || BASE_FEE}</p>
    <p style='color:#C9C6BC;margin:0 0 18px;font-size:13.5px;line-height:1.6;'>Your fee includes the complete delegate kit — credentials, conference folder, notepad, pen, and gourmet meals across both conference days.</p>
    <div style='background:#1A1710;border:1px solid #3A2F18;border-radius:12px;padding:14px 16px;'>
      <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-weight:700;'>Next Steps</div>
      <p style='color:#C9C6BC;margin:6px 0 0;font-size:13px;line-height:1.6;'>Once payment is verified, your registration will be officially approved and your committee allotment will be communicated via email.</p>
    </div>
    <p style='color:#9A98A0;margin:18px 0 0;font-size:12.5px;'>Conference Dates: <strong>9–10 October 2026</strong> · Paramount International School.</p>`;
  return wrapEmail(inner);
}

function verificationApprovedEmailHtml(reg) {
  const formattedName = formatFullName(reg.full_name);
  const p1 = reg.preference1 || {};

  const inner = `
    <div style='margin-bottom:20px;'>
      <div style='font-size:11px;letter-spacing:2.5px;color:#2FBF71;text-transform:uppercase;font-weight:700;margin-bottom:6px;'>Official Verification Confirmed</div>
      <h2 style='margin:0 0 10px;color:#FFFFFF;font-size:24px;font-family:"Georgia","Times New Roman",serif;font-weight:700;'>Dear ${formattedName},</h2>
      <p style='color:#C9C6BC;margin:0 0 16px;font-size:14px;line-height:1.7;'>
        We are pleased to inform you that your delegate registration and payment for <strong>Paramount International Model United Nations 2026</strong> have been <span style='color:#2FBF71;font-weight:700;'>officially approved and verified</span>!
      </p>
    </div>

    <!-- Confirmation Card -->
    <div style='background:linear-gradient(145deg,#0B101E,#131A2E);border:1.5px solid #2FBF71;border-radius:14px;padding:22px 24px;margin:0 0 24px;box-shadow:0 10px 30px rgba(0,0,0,0.5);'>
      <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
        <tr>
          <td style='padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Delegate Name</div>
            <div style='font-size:19px;color:#FFFFFF;font-family:"Georgia","Times New Roman",serif;font-weight:700;margin-top:4px;'>
              ${formattedName}
            </div>
          </td>
        </tr>
        <tr>
          <td style='padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Payment &amp; Registration Status</div>
            <div style='font-size:16px;color:#2FBF71;font-weight:700;margin-top:4px;'>
              ✓ Verified &amp; Approved (₹${reg.fee || BASE_FEE})
            </div>
          </td>
        </tr>
        <tr>
          <td style='padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.08);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Primary Committee Preference</div>
            <div style='font-size:16px;color:#FBE7B6;font-family:"Georgia",serif;font-weight:600;margin-top:4px;'>
              ${p1.committee ? p1.committee.toUpperCase() : "Under Review"}${p1.portfolio ? ` — ${p1.portfolio}` : ""}
            </div>
          </td>
        </tr>
        <tr>
          <td style='padding-top:12px;'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Official Delegate ID</div>
            <div style='font-size:17px;color:#E7C978;font-family:"Courier New",monospace;font-weight:700;margin-top:4px;letter-spacing:2px;'>
              ${reg.reference_id}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style='color:#C9C6BC;margin:0 0 14px;font-size:13.5px;line-height:1.7;'>
      Our Executive Board is currently finalizing portfolio allotments. You will receive your official committee and country assignment in your allotment email shortly.
    </p>

    <p style='color:#9A98A0;margin:20px 0 0;font-size:12.5px;line-height:1.6;'>
      Warm regards,<br>
      <strong style='color:#F2F0EA;'>Secretariat &amp; Executive Board</strong><br>
      Paramount International Model United Nations
    </p>`;
  return wrapEmail(inner);
}

function allotmentEmailHtml(reg) {
  const formattedName = formatFullName(reg.full_name);
  const comm = getCommitteeDetails(reg.allotted_committee);
  const portfolioName = reg.allotted_portfolio || "Allotted upon check-in";

  const inner = `
    <div style='margin-bottom:20px;'>
      <div style='font-size:11px;letter-spacing:2.5px;color:#E7C978;text-transform:uppercase;font-weight:700;margin-bottom:6px;'>Official Delegation Allotment</div>
      <h2 style='margin:0 0 10px;color:#FFFFFF;font-size:24px;font-family:"Georgia","Times New Roman",serif;font-weight:700;'>Dear ${formattedName},</h2>
      <p style='color:#C9C6BC;margin:0 0 16px;font-size:14px;line-height:1.7;'>
        Your registration for <strong>Paramount International Model United Nations 2026</strong> has been officially approved! We are proud to confirm your committee and portfolio allotment below:
      </p>
    </div>

    <!-- Official Allotment Card with Premium Typography -->
    <div style='background:linear-gradient(145deg,#0B101E 0%,#131A2E 100%);border:1.5px solid #C7A35A;border-radius:14px;padding:24px 26px;margin:0 0 24px;box-shadow:0 12px 32px rgba(0,0,0,0.55);'>
      <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
        <tr>
          <td style='padding-bottom:14px;border-bottom:1px solid rgba(199,163,90,0.25);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Delegate Name</div>
            <div style='font-size:20px;color:#FFFFFF;font-family:"Georgia","Times New Roman",serif;font-weight:700;margin-top:4px;'>
              ${formattedName}
            </div>
          </td>
        </tr>
        <tr>
          <td style='padding:14px 0;border-bottom:1px solid rgba(199,163,90,0.25);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Assigned Committee</div>
            <div style='font-size:25px;color:#FBE7B6;font-family:"Georgia","Times New Roman",serif;font-weight:700;margin-top:5px;letter-spacing:1px;'>
              ${comm.name}
            </div>
            ${comm.fullName ? `<div style='font-size:13px;color:#D8D5CC;font-family:"Georgia",serif;font-style:italic;margin-top:3px;'>${comm.fullName}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style='padding:14px 0;border-bottom:1px solid rgba(199,163,90,0.25);'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Allotted Country / Portfolio</div>
            <div style='font-size:22px;color:#FFFFFF;font-family:"Georgia","Times New Roman",serif;font-weight:700;margin-top:5px;'>
              ${portfolioName}
            </div>
          </td>
        </tr>
        <tr>
          <td style='padding-top:14px;'>
            <div style='font-size:11px;letter-spacing:2px;color:#C7A35A;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:700;'>Official Delegate ID</div>
            <div style='font-size:17px;color:#E7C978;font-family:"Courier New",monospace;font-weight:700;margin-top:4px;letter-spacing:2px;'>
              ${reg.reference_id}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style='background:#0D1424;border-left:3px solid #C7A35A;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;'>
      <div style='font-size:11px;letter-spacing:1.5px;color:#C7A35A;text-transform:uppercase;font-weight:700;'>Preparation Note</div>
      <p style='color:#C9C6BC;margin:4px 0 0;font-size:13px;line-height:1.6;'>
        Please research your allotted committee agenda and country policy thoroughly. Official background guides and rules of procedure will be available on the conference portal.
      </p>
    </div>

    <p style='color:#C9C6BC;margin:0 0 14px;font-size:13.5px;line-height:1.7;'>
      If you have questions regarding your allotment or preparation, feel free to reach out to our Organizing Committee at <a href="mailto:${ORGANIZER_EMAIL}" style="color:#C7A35A;text-decoration:none;font-weight:600;">${ORGANIZER_EMAIL}</a>.
    </p>

    <p style='color:#C9C6BC;margin:0 0 18px;font-size:13.5px;line-height:1.7;'>
      We look forward to hosting you on <strong>9th &amp; 10th October 2026</strong> at Paramount International School.
    </p>

    <p style='color:#9A98A0;margin:20px 0 0;font-size:12.5px;line-height:1.6;'>
      Warm regards,<br>
      <strong style='color:#F2F0EA;'>Secretariat &amp; Executive Board</strong><br>
      Paramount International Model United Nations
    </p>`;
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return sendJson(200, dbHelpers.getStats());
  }

  // GET /api/admin/registrations
  if (pathname === "/api/admin/registrations" && req.method === "GET") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return sendJson(200, dbHelpers.getRegistrations());
  }

  // PATCH /api/admin/registrations/:id
  if (pathname.startsWith("/api/admin/registrations/") && !pathname.endsWith("/allot") && req.method === "PATCH") {
    const id = pathname.replace("/api/admin/registrations/", "").trim();
    return getBody((payload) => {
      const updated = dbHelpers.updateRegistration(id, payload);
      if (!updated) return sendJson(404, { detail: "Registration not found" });

      // Automatically send email to delegate when registration is approved/verified
      if (payload.payment_status === "verified") {
        if (updated.allotted_committee && updated.allotted_portfolio) {
          const subject = "Your Paramount International MUN Allotment is Here! 🏛️✨";
          const html = allotmentEmailHtml(updated);
          sendGmailEmail(updated.email, subject, html, ORGANIZER_EMAIL).then((res) => {
            if (!res.ok) console.error("[EMAIL ERROR] Allotment email failed:", res.error);
          });
        } else {
          const subject = `Registration Approved & Verified — Paramount International MUN (${updated.reference_id}) ✅`;
          const html = verificationApprovedEmailHtml(updated);
          sendGmailEmail(updated.email, subject, html, ORGANIZER_EMAIL).then((res) => {
            if (!res.ok) console.error("[EMAIL ERROR] Verification approved email failed:", res.error);
          });
        }
      }

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

      // Send allotment email asynchronously with upgraded formatting
      const subject = "Your Paramount International MUN Allotment is Here! 🏛️✨";
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
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="allotments.csv"',
    });
    res.end(csvData);
    return;
  }

  // GET /api/admin/registrations.csv
  if (pathname === "/api/admin/registrations.csv" && req.method === "GET") {
    const csvData = dbHelpers.generateRegistrationsCsv();
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registrations.csv"',
    });
    res.end(csvData);
    return;
  }

  // GET /api/admin/committees
  if (pathname === "/api/admin/committees" && req.method === "GET") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
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
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
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

  // Fallback: If not an API route, serve static files from React build directory (if available)
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
    } else if (pathname === "/" && req.method === "GET") {
      // Friendly message for standalone backend deployment
      return sendJson(200, {
        message: "Paramount International MUN Backend API is running",
        status: "healthy",
        database: "SQLite (paramount_mun.db)",
        endpoints: "/api/committees, /api/registrations, /api/admin/*",
      });
    }
  }

  // Fallback 404 for unmatched API routes
  return sendJson(404, { detail: `Route ${req.method} ${pathname} not found` });
});

server.listen(PORT, () => {
  console.log(`[Paramount MUN Fullstack] Server running on http://localhost:${PORT}`);
  console.log(`[Paramount MUN Fullstack] Embedded SQLite Database initialized at backend/data/paramount_mun.db`);
});
