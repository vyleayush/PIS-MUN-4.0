const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


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
const DATA_DIR = path.join(__dirname, "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const COMMITTEES_FILE = path.join(DATA_DIR, "committees.json");
const REFERRAL_CODES_FILE = path.join(DATA_DIR, "referral_codes.json");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "paramountinternationalmun.26@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mun0910@";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key_12345";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || "paramountinternationalmun.26@gmail.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BASE_FEE = 2000;

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
    <p style='color:#C9C6BC;margin:0 0 14px;'>Got questions, doubts, or just wanna rant about how excited you are? Slide into our inbox at <a href="mailto:email@paramountmun.com" style="color:#C7A35A;text-decoration:none;">email@paramountmun.com</a>—we got you.</p>
    <p style='color:#C9C6BC;margin:0 0 18px;'>We’re genuinely looking forward to hosting you this 9th and 10th October, 2026. More than just a competition, it’s going to be an experience you’ll remember. Welcome to the Paramount iSchool MUN family. We seriously can’t wait to see you show up, speak up, and absolutely own that committee room.</p>
    <p style='color:#9A98A0;margin:18px 0 0;font-size:12px;'>Stay Iconic,<br><br>Team Delegate Affairs<br>Paramount iSchool MUN</p>`;
  return wrapEmail(inner);
}

function sendGmailEmail(to, subject, html, bcc = null) {
  return new Promise((resolve) => {
    const user = process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.log(`[EMAIL NOTICE] GMAIL_APP_PASSWORD is not set in backend/.env. Real email to ${to} was skipped.`);
      return resolve({ ok: false, error: "no_credentials" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"Paramount MUN" <${user}>`,
      to: to,
      subject: subject,
      html: html,
    };
    
    if (bcc) {
      mailOptions.bcc = bcc;
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`[EMAIL ERROR] Network error sending to ${to}: ${error.message}`);
        resolve({ ok: false, error: error.message });
      } else {
        console.log(`[EMAIL SUCCESS] Real email delivered to ${to} via Gmail!`);
        resolve({ ok: true });
      }
    });
  });
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------------------- Seed Data -----------------------------
const UNGA_ROSTER = ["Islamic Republic of Afghanistan", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Croatia", "Czech Republic", "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "Grenada", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Israel", "Italy", "Japan", "Kazakhstan", "Lebanon", "Libya", "Luxembourg", "Mexico", "Morocco", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Palestine", "Poland", "Qatar", "Republic Of Korea", "Russia", "Rwanda", "Saudi Arabia", "South Africa", "Spain", "Sudan", "Sweden", "Syria", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Burkina Faso", "Vietnam"];
const UN_ROSTER = [...UNGA_ROSTER];
const AIPPM_ROSTER = [{"name": "Arvind Kejriwal", "party": "Aam Aadmi Party"}, {"name": "Raghav Chadha", "party": "Aam Aadmi Party"}, {"name": "Sanjay Singh", "party": "Aam Aadmi Party"}, {"name": "Bhagwant Mann", "party": "Aam Aadmi Party"}, {"name": "Asaddudin Owaisi", "party": "AIMIM"}, {"name": "Sayed Imtiyaz Jaleel", "party": "AIMIM"}, {"name": "N. Rangaswamy", "party": "All India N.R. Congress"}, {"name": "Mamata Banerjee", "party": "All India Trinamool Congress"}, {"name": "Mimi Chakraborty", "party": "All India Trinamool Congress"}, {"name": "Mahua Moitra", "party": "All India Trinamool Congress"}, {"name": "Abhishek Banerjee", "party": "All India Trinamool Congress"}, {"name": "Chandra Prakash Choudhary", "party": "All Jharkhand Students Union"}, {"name": "Anupriya Patel", "party": "Apna Dal"}, {"name": "Kumari Mayawati", "party": "Bahujan Samaj Party"}, {"name": "Satish Mishra", "party": "Bahujan Samaj Party"}, {"name": "Afzal Ansari", "party": "Bahujan Samaj Party"}, {"name": "Kunwar Danish Ali", "party": "Bahujan Samaj Party"}, {"name": "K P Reddy", "party": "Bharat Rashtra Samithi"}, {"name": "N Biren Singh", "party": "Bhartiya Janta Party"}, {"name": "Narendra Modi", "party": "Bharatiya Janta Party"}, {"name": "Rajanath Singh", "party": "Bharatiya Janta Party"}, {"name": "Nirmala Sitharaman", "party": "Bharatiya Janta Party"}, {"name": "Smriti Irani", "party": "Bharatiya Janta Party"}, {"name": "Maneka Gandhi", "party": "Bharatiya Janta Party"}, {"name": "Amit Shah", "party": "Bharatiya Janta Party"}, {"name": "Jyotiraditya Scindia", "party": "Bharatiya Janta Party"}, {"name": "Nitin Gadkari", "party": "Bharatiya Janta Party"}, {"name": "Ravi Shankar Prasad", "party": "Bharatiya Janta Party"}, {"name": "Dr Harsh Vardhan", "party": "Bharatiya Janta Party"}, {"name": "Subramanyam Jaishankar", "party": "Bharatiya Janta Party"}, {"name": "Vasundhara Raje", "party": "Bharatiya Janta Party"}, {"name": "Captain Amarinder Singh", "party": "Bharatiya Janta Party"}, {"name": "Kiren Rijiju", "party": "Bharatiya Janta Party"}, {"name": "Arjun Ram Meghwal", "party": "Bharatiya Janta Party"}, {"name": "Himanta Biswa Sharma", "party": "Bharatiya Janta Party"}, {"name": "Pramod Sawant", "party": "Bharatiya Janta Party"}, {"name": "Bhupendrabhai Patel", "party": "Bharatiya Janta Party"}, {"name": "Basavaraj Bommai", "party": "Bharatiya Janta Party"}, {"name": "Shivraj Singh Chouhan", "party": "Bharatiya Janta Party"}, {"name": "Manik Saha", "party": "Bharatiya Janta Party"}, {"name": "Pushkar Singh Dhami", "party": "Bharatiya Janta Party"}, {"name": "Dharmendra Pradhan", "party": "Bharatiya Janta Party"}, {"name": "Ashvini Vaishnaw", "party": "Bharatiya Janta Party"}, {"name": "Mukhtar Abbas Naqvi", "party": "Bharatiya Janta Party"}, {"name": "Hardeep Singh Puri", "party": "Bharatiya Janta Party"}, {"name": "Bhartruhari Mahtab", "party": "Biju Janata Dal"}, {"name": "Naveen Patnaik", "party": "Biju Janata Dal"}, {"name": "Pinaki Mishra", "party": "Biju Janata Dal"}, {"name": "Sitaram Yechury", "party": "Communist Party of India (Marxist)"}, {"name": "Brinda Karat", "party": "Communist Party of India (Marxist)"}, {"name": "Pinarayi Vijayan", "party": "Communist Party of India (Marxist)"}, {"name": "Dayanidhi Maran", "party": "Dravida Munnetra Kazhagam"}, {"name": "M. K. Stalin", "party": "Dravida Munnetra Kazhagam"}, {"name": "Naba Kumar Sarania", "party": "Independent"}, {"name": "Sonia Gandhi", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Rahul Gandhi", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Ambika Soni", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Dr Shashi Tharoor", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Sachin Pilot", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Meira Kumar", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Salman Khurshid", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Dr Manmohan Singh", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Gaurav Gogoi", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Bhupesh Baghel", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Sukhvinder Singh Sukhu", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Ashok Gehlot", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Adhir Ranjan Chowdhury", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Karti P Chidambaram", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Manish Tewari", "party": "INDIAN NATIONAL CONGRESS"}, {"name": "Dr. Farooq Abdullah", "party": "Jammu and Kashmir National Conference"}, {"name": "Kaushalendra Kumar", "party": "Janata Dal (United)"}, {"name": "Nitish Kumar", "party": "Janata Dal (United)"}, {"name": "Hemant Soren", "party": "Jharkhand Mukti Morcha"}, {"name": "Chirag Paswan", "party": "Lok Janshakti Party ( Ram Vilas)"}, {"name": "Raj Thackeray", "party": "Maharashtra Navnirman Sena"}, {"name": "Zoramthanga", "party": "Mizo National Front"}, {"name": "Agatha Sangma", "party": "National People's Party"}, {"name": "Conrad Sangma", "party": "National People's Party"}, {"name": "Sharad Pawar", "party": "Nationalist Congress Party"}, {"name": "Ajit Pawar", "party": "Nationalist Congress Party"}, {"name": "Praful Patel", "party": "Nationalist Congress Party"}, {"name": "Neiphiu Rio", "party": "Nationalist Democratic Progressive Party"}, {"name": "Tejashwi Yadav", "party": "Rashtriya Janata Dal"}, {"name": "Misa Bharti", "party": "Rashtriya Janata Dal"}, {"name": "Lalu Yadav", "party": "Rashtriya Janata Dal"}, {"name": "Manoj Jha", "party": "Rashtriya Janata Dal"}, {"name": "Mehboob Ali Kaiser", "party": "Rashtriya Lok Janshakti Party"}, {"name": "Hanuman Beniwal", "party": "Rashtriya Loktantrik Party"}, {"name": "N K Premachandran", "party": "Revolutionary Socialist Party"}, {"name": "Akhilesh Yadav", "party": "Samajwadi Party"}, {"name": "Shivpal Singh Yadav", "party": "Samajwadi Party"}, {"name": "Dimple Yadav", "party": "Samajwadi Party"}, {"name": "Ram Gopal Yadav", "party": "Samajwadi Party"}, {"name": "Harsimrat Kaur Badal", "party": "Shiromani Akali Dal"}, {"name": "Sukhbir Singh Badal", "party": "Shiromani Akali Dal"}, {"name": "Sanjay Raut", "party": "Shiv Sena (UBT)"}, {"name": "Uddhav Thackeray", "party": "Shiv Sena (UBT)"}, {"name": "Vinayak Raut", "party": "Shiv Sena"}, {"name": "Eknath Shinde", "party": "Shiv Sena"}, {"name": "Prem Singh Tamang", "party": "Sikkim Krantikari Morcha"}, {"name": "Indra Hang Subba", "party": "Sikkim Krantikari Morcha"}, {"name": "Yogendra Yadav", "party": "Swaraj India"}, {"name": "Derek O'Brien", "party": "Trinamool Congress"}, {"name": "Y. S. Jagan Mohan Reddy", "party": "Yuvajana Shramika Rythu Congress Party"}, {"name": "Ghulam Nabi Azad", "party": "Democratic Progressive Azad Party"}];

const DEFAULT_COMMITTEES = [
  {
    id: "unga",
    slug: "unga",
    name: "UNGA",
    full_name: "United Nations General Assembly",
    agenda: "Addressing global security architecture, state sovereignty, and conflict de-escalation protocols in Eastern Europe and the Middle East.",
    tag: "Flagship committee · General Assembly",
    chair: "TBA",
    eb: "TBA",
    difficulty: "All experience levels",
    handbook_link: "",
    order: 1,
    portfolios: UNGA_ROSTER.map((name) => ({ name, status: "available", delegate: null })),
  },
  {
    id: "aippm",
    slug: "aippm",
    name: "AIPPM",
    full_name: "All India Political Parties Meet",
    agenda: "Reviewing the implementation and socio-economic ramifications of the Uniform Civil Code with special focus on federal autonomy.",
    tag: "Indian crisis committee",
    chair: "TBA",
    eb: "TBA",
    difficulty: "Intermediate to Advanced",
    handbook_link: "",
    order: 2,
    portfolios: AIPPM_ROSTER.map((item) => ({ name: item.name, party: item.party, status: "available", delegate: null })),
  },
  {
    id: "who",
    slug: "who",
    name: "WHO",
    full_name: "World Health Organization",
    agenda: "Combating the rise of lifestyle diseases among youth and working class (obesity, hypertension, and occupational health).",
    tag: "Specialized agency",
    chair: "TBA",
    eb: "TBA",
    difficulty: "Beginner Friendly",
    handbook_link: "",
    order: 3,
    portfolios: UN_ROSTER.map((name) => ({ name, status: "available", delegate: null })),
  },
  {
    id: "uncsw",
    slug: "uncsw",
    name: "UNCSW",
    full_name: "UN Commission on the Status of Women",
    agenda: "Promoting Gender Equality in the Digital Age with Special Emphasis on Bridging the Digital Gender Divide & role of Pink Tax.",
    tag: "Specialized · Gender & tech",
    chair: "TBA",
    eb: "TBA",
    difficulty: "All levels",
    handbook_link: "",
    order: 4,
    portfolios: UN_ROSTER.map((name) => ({ name, status: "available", delegate: null })),
  },
  {
    id: "unhrc",
    slug: "unhrc",
    name: "UNHRC",
    full_name: "UN Human Rights Council",
    agenda: "Ensuring Human Rights while Expanding National Digital Identity Systems and biometric surveillance frameworks.",
    tag: "Rights & digital identity",
    chair: "TBA",
    eb: "TBA",
    difficulty: "Intermediate",
    handbook_link: "",
    order: 5,
    portfolios: UN_ROSTER.map((name) => ({ name, status: "available", delegate: null })),
  },
];

const DEFAULT_REFERRAL_CODES = [
  { code: "PARAMOUNT500", discount: 500, label: "Paramount Ambassador Discount", active: true, usage_count: 0 },
  { code: "DELEGATE2026", discount: 500, label: "Early Delegate Discount", active: true, usage_count: 0 },
];

function loadJson(file, defaultVal) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (err) {
    console.error("Error reading JSON from " + file, err);
  }
  saveJson(file, defaultVal);
  return defaultVal;
}

function saveJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON to " + file, err);
  }
}

// Initialize database stores
let registrations = loadJson(REGISTRATIONS_FILE, []);
let committees = loadJson(COMMITTEES_FILE, DEFAULT_COMMITTEES);
let referralCodes = loadJson(REFERRAL_CODES_FILE, DEFAULT_REFERRAL_CODES);

function makeRefId() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let part = "";
  for (let i = 0; i < 6; i++) {
    part += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PMUN-${part}`;
}

function updateAllotmentsCsv() {
  const file = path.join(DATA_DIR, "allotments.csv");
  const headers = ["Reference ID", "Name", "Email", "Phone", "School", "Committee", "Portfolio"];
  const lines = [headers.join(",")];
  
  registrations.forEach(r => {
    if (r.allotted_committee && r.allotted_portfolio) {
      const row = [
        r.reference_id,
        `"${(r.full_name || "").replace(/"/g, '""')}"`,
        `"${(r.email || "").replace(/"/g, '""')}"`,
        `"${(r.phone || "").replace(/"/g, '""')}"`,
        `"${(r.school || "").replace(/"/g, '""')}"`,
        `"${(r.allotted_committee || "").replace(/"/g, '""')}"`,
        `"${(r.allotted_portfolio || "").replace(/"/g, '""')}"`
      ];
      lines.push(row.join(","));
    }
  });
  
  try {
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    console.log(`[Auto-Allotment] Updated allotments.csv`);
  } catch (err) {
    console.error("Error writing CSV: ", err);
  }
}

function committeePublic(doc) {
  const portfolios = doc.portfolios || [];
  const open_count = portfolios.filter((p) => p.status === "available").length;
  return {
    id: doc.id || doc.slug,
    slug: doc.slug,
    name: doc.name,
    full_name: doc.full_name,
    agenda: doc.agenda,
    tag: doc.tag || "",
    chair: doc.chair || "TBA",
    eb: doc.eb || "TBA",
    difficulty: doc.difficulty || "TBA",
    handbook_link: doc.handbook_link || "",
    order: doc.order || 0,
    open_count: open_count,
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
      if (body.length > 30 * 1024 * 1024) { // 30MB limit for base64 images
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ detail: "Payload too large" }));
        req.connection.destroy();
      }
    });
    req.on("end", () => {
      try {
        const json = body ? JSON.parse(body) : {};
        callback(json);
      } catch (err) {
        sendJson(400, { detail: "Invalid JSON format" });
      }
    });
  };

  // --- API Routes ---

  // Health check / Root
  if ((pathname === "/" || pathname === "/api" || pathname === "/api/") && req.method === "GET") {
    return sendJson(200, { message: "Paramount International MUN API (Node Backend)", status: "healthy" });
  }

  // GET /api/committees
  if (pathname === "/api/committees" && req.method === "GET") {
    const sorted = [...committees].sort((a, b) => (a.order || 0) - (b.order || 0));
    return sendJson(200, sorted.map(committeePublic));
  }

  // GET /api/committees/:slug
  if (pathname.startsWith("/api/committees/") && req.method === "GET") {
    const slug = pathname.replace("/api/committees/", "").trim();
    const found = committees.find((c) => c.slug === slug);
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
      const rec = referralCodes.find((r) => r.code.toUpperCase() === code && r.active);
      if (rec) {
        return sendJson(200, { valid: true, label: rec.label || "Referral Discount Applied", discount: rec.discount || 500 });
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
        const rec = referralCodes.find((r) => r.code.toUpperCase() === code && r.active);
        if (rec) {
          fee = BASE_FEE - (rec.discount || 500);
          tier = "Paramount (referral)";
          applied_code = rec.code;
          rec.usage_count = (rec.usage_count || 0) + 1;
          saveJson(REFERRAL_CODES_FILE, referralCodes);
        }
      }

      const reference_id = makeRefId();
      const newRegistration = {
        id: crypto.randomUUID(),
        reference_id: reference_id,
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        school: payload.school || "",
        city: payload.city || "",
        experience: payload.experience || "",
        awards: payload.awards || "",
        is_delegation: !!payload.is_delegation,
        delegation_size: payload.delegation_size || null,
        heard_from: payload.heard_from || "",
        preference1: payload.preference1 || { committee: "", portfolio: "" },
        preference2: payload.preference2 || { committee: "", portfolio: "" },
        preference3: payload.preference3 || { committee: "", portfolio: "" },
        referral_code: payload.referral_code || "",
        applied_referral: applied_code,
        fee: fee,
        fee_tier: tier,
        payment_status: "pending",
        payment_screenshot: payload.payment_screenshot || "",
        id_card: payload.id_card || "",
        accepted_terms: true,
        admin_note: "",
        allotted_committee: "",
        allotted_portfolio: "",
        created_at: new Date().toISOString(),
        email_status: { organizer: false, delegate: false },
      };

      registrations.unshift(newRegistration);
      saveJson(REGISTRATIONS_FILE, registrations);

      console.log(`[Registration] Recorded registration: ${reference_id} for ${payload.full_name} (${payload.email})`);

      // Fire real emails asynchronously
      const orgHtml = organizerEmailHtml(newRegistration);
      const delHtml = delegateEmailHtml(newRegistration);

      Promise.all([
        sendGmailEmail(ORGANIZER_EMAIL, `New MUN Registration — ${reference_id} (${payload.full_name})`, orgHtml),
        sendGmailEmail(payload.email, `Registration received — Paramount International MUN (${reference_id})`, delHtml),
      ]).then(([orgRes, delRes]) => {
        newRegistration.email_status = { organizer: orgRes.ok, delegate: delRes.ok };
        saveJson(REGISTRATIONS_FILE, registrations);
      });

      return sendJson(200, {
        ok: true,
        reference_id: reference_id,
        email_status: newRegistration.email_status,
      });
    });
  }

  // POST /api/registrations/:ref/screenshot
  if (pathname.startsWith("/api/registrations/") && pathname.endsWith("/screenshot") && req.method === "POST") {
    const parts = pathname.split("/");
    const ref = parts[3];
    return getBody((payload) => {
      const reg = registrations.find((r) => r.reference_id === ref);
      if (!reg) {
        return sendJson(404, { detail: "Registration not found" });
      }
      if (payload.payment_screenshot || payload.file) {
        reg.payment_screenshot = payload.payment_screenshot || payload.file;
        saveJson(REGISTRATIONS_FILE, registrations);
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
    const total = registrations.length;
    const verified = registrations.filter((r) => r.payment_status === "verified").length;
    const pending = registrations.filter((r) => r.payment_status === "pending").length;
    const total_revenue = registrations
      .filter((r) => r.payment_status === "verified")
      .reduce((sum, r) => sum + (r.fee || 2000), 0);

    return sendJson(200, {
      total_registrations: total,
      verified_payments: verified,
      pending_payments: pending,
      total_revenue: total_revenue,
    });
  }

  // GET /api/admin/registrations
  if (pathname === "/api/admin/registrations" && req.method === "GET") {
    return sendJson(200, registrations);
  }

  // PATCH /api/admin/registrations/:id
  if (pathname.startsWith("/api/admin/registrations/") && req.method === "PATCH") {
    const id = pathname.replace("/api/admin/registrations/", "").trim();
    return getBody((payload) => {
      const reg = registrations.find((r) => r.id === id || r.reference_id === id);
      if (!reg) return sendJson(404, { detail: "Registration not found" });
      Object.assign(reg, payload);
      saveJson(REGISTRATIONS_FILE, registrations);
      return sendJson(200, { ok: true, registration: reg });
    });
  }

  // DELETE /api/admin/registrations/:id
  if (pathname.startsWith("/api/admin/registrations/") && req.method === "DELETE") {
    const id = pathname.replace("/api/admin/registrations/", "").trim();
    const index = registrations.findIndex((r) => r.id === id || r.reference_id === id);
    if (index === -1) return sendJson(404, { detail: "Registration not found" });
    registrations.splice(index, 1);
    saveJson(REGISTRATIONS_FILE, registrations);
    return sendJson(200, { ok: true });
  }

  // POST /api/admin/registrations/:id/allot
  if (pathname.startsWith("/api/admin/registrations/") && pathname.endsWith("/allot") && req.method === "POST") {
    const parts = pathname.split("/");
    const id = parts[4]; // /api/admin/registrations/:id/allot -> ["", "api", "admin", "registrations", "id", "allot"]
    
    return getBody((payload) => {
      const reg = registrations.find((r) => r.id === id || r.reference_id === id);
      if (!reg) return sendJson(404, { detail: "Registration not found" });
      
      const { committeeSlug, portfolioName } = payload;
      if (!committeeSlug || !portfolioName) {
        return sendJson(400, { detail: "committeeSlug and portfolioName are required" });
      }

      // Mark the registration as allotted
      reg.allotted_committee = committeeSlug;
      reg.allotted_portfolio = portfolioName;
      reg.payment_status = "verified"; // auto-verify payment on allotment
      saveJson(REGISTRATIONS_FILE, registrations);

      // Mark the portfolio in the committee
      const committee = committees.find(c => c.slug === committeeSlug);
      if (committee && committee.portfolios) {
        let portfolio = committee.portfolios.find(p => p.name === portfolioName);
        if (!portfolio) {
          // If the admin typed a custom portfolio, add it dynamically
          portfolio = { name: portfolioName, party: "", status: "allotted", delegate: reg.full_name };
          committee.portfolios.push(portfolio);
        } else {
          portfolio.status = "allotted";
          portfolio.delegate = reg.full_name;
        }
        saveJson(COMMITTEES_FILE, committees);
      }

      updateAllotmentsCsv();

      // Send the allotment email asynchronously
      const subject = "It’s giving diplomacy. Your Paramount iSchool MUN allotment is here! 🏛️✨";
      const html = allotmentEmailHtml(reg);
      sendGmailEmail(reg.email, subject, html, ORGANIZER_EMAIL).then(res => {
        if (!res.ok) console.error("[EMAIL ERROR] Failed to send allotment email:", res.error);
      });

      return sendJson(200, { ok: true, registration: reg });
    });
  }

  // GET /api/admin/allotments.csv
  if (pathname === "/api/admin/allotments.csv" && req.method === "GET") {
    const file = path.join(DATA_DIR, "allotments.csv");
    if (!fs.existsSync(file)) {
      updateAllotmentsCsv(); // Ensure it exists
    }
    
    try {
      const csv = fs.readFileSync(file, "utf8");
      res.writeHead(200, { 
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="allotments.csv"'
      });
      res.end(csv);
    } catch (err) {
      return sendJson(500, { detail: "Could not read CSV file" });
    }
    return;
  }

  // GET /api/admin/committees
  if (pathname === "/api/admin/committees" && req.method === "GET") {
    return sendJson(200, committees);
  }

  // GET /api/admin/referral-codes
  if (pathname === "/api/admin/referral-codes" && req.method === "GET") {
    return sendJson(200, referralCodes);
  }

  // POST /api/admin/referral-codes
  if (pathname === "/api/admin/referral-codes" && req.method === "POST") {
    return getBody((payload) => {
      const code = (payload.code || "").trim().toUpperCase();
      if (!code) return sendJson(400, { detail: "Code is required" });
      const newCode = {
        code,
        discount: Number(payload.discount) || 500,
        label: payload.label || "Referral Discount",
        active: payload.active !== false,
        usage_count: 0,
      };
      referralCodes.push(newCode);
      saveJson(REFERRAL_CODES_FILE, referralCodes);
      return sendJson(200, { ok: true, referral_code: newCode });
    });
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
          ".txt": "text/plain"
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        try {
          const content = fs.readFileSync(filePath);
          res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
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
  console.log(`[Paramount MUN Fullstack] Data directory: ${DATA_DIR}`);
});
