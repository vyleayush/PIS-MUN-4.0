const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check if Turso Cloud credentials are provided via environment variables
const TURSO_URL = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const isCloudDb = !!(TURSO_URL && TURSO_AUTH_TOKEN);

let dbClient;
let dbType;

if (isCloudDb) {
  console.log(`[DB] Connecting to Turso Cloud Database: ${TURSO_URL}`);
  dbClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
  dbType = "Turso Cloud (libSQL)";
} else {
  const DB_PATH = path.join(DATA_DIR, "paramount_mun.db");
  console.log(`[DB] Opening local SQLite file at: ${DB_PATH}`);
  dbClient = createClient({
    url: `file:${DB_PATH}`,
  });
  dbType = "Local SQLite (file)";
}

// ----------------------------- Seed Data -----------------------------
const UNGA_ROSTER = [
  "Islamic Republic of Afghanistan", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Croatia", "Czech Republic", "Denmark", "Egypt", "Finland", "France", "Germany", "Greece", "Grenada", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Israel", "Italy", "Japan", "Kazakhstan", "Lebanon", "Libya", "Luxembourg", "Mexico", "Morocco", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Palestine", "Poland", "Qatar", "Republic Of Korea", "Russia", "Rwanda", "Saudi Arabia", "South Africa", "Spain", "Sudan", "Sweden", "Syria", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Burkina Faso", "Vietnam"
];
const UN_ROSTER = [...UNGA_ROSTER];
const AIPPM_ROSTER = [
  { name: "Arvind Kejriwal", party: "Aam Aadmi Party" }, { name: "Raghav Chadha", party: "Aam Aadmi Party" }, { name: "Sanjay Singh", party: "Aam Aadmi Party" }, { name: "Bhagwant Mann", party: "Aam Aadmi Party" }, { name: "Asaddudin Owaisi", party: "AIMIM" }, { name: "Sayed Imtiyaz Jaleel", party: "AIMIM" }, { name: "N. Rangaswamy", party: "All India N.R. Congress" }, { name: "Mamata Banerjee", party: "All India Trinamool Congress" }, { name: "Mimi Chakraborty", party: "All India Trinamool Congress" }, { name: "Mahua Moitra", party: "All India Trinamool Congress" }, { name: "Abhishek Banerjee", party: "All India Trinamool Congress" }, { name: "Chandra Prakash Choudhary", party: "All Jharkhand Students Union" }, { name: "Anupriya Patel", party: "Apna Dal" }, { name: "Kumari Mayawati", party: "Bahujan Samaj Party" }, { name: "Satish Mishra", party: "Bahujan Samaj Party" }, { name: "Afzal Ansari", party: "Bahujan Samaj Party" }, { name: "Kunwar Danish Ali", party: "Bahujan Samaj Party" }, { name: "K P Reddy", party: "Bharat Rashtra Samithi" }, { name: "N Biren Singh", party: "Bhartiya Janta Party" }, { name: "Narendra Modi", party: "Bharatiya Janta Party" }, { name: "Rajanath Singh", party: "Bharatiya Janta Party" }, { name: "Nirmala Sitharaman", party: "Bharatiya Janta Party" }, { name: "Smriti Irani", party: "Bharatiya Janta Party" }, { name: "Maneka Gandhi", party: "Bharatiya Janta Party" }, { name: "Amit Shah", party: "Bharatiya Janta Party" }, { name: "Jyotiraditya Scindia", party: "Bharatiya Janta Party" }, { name: "Nitin Gadkari", party: "Bharatiya Janta Party" }, { name: "Ravi Shankar Prasad", party: "Bharatiya Janta Party" }, { name: "Dr Harsh Vardhan", party: "Bharatiya Janta Party" }, { name: "Subramanyam Jaishankar", party: "Bharatiya Janta Party" }, { name: "Vasundhara Raje", party: "Bharatiya Janta Party" }, { name: "Captain Amarinder Singh", party: "Bharatiya Janta Party" }, { name: "Kiren Rijiju", party: "Bharatiya Janta Party" }, { name: "Arjun Ram Meghwal", party: "Bharatiya Janta Party" }, { name: "Himanta Biswa Sharma", party: "Bharatiya Janta Party" }, { name: "Pramod Sawant", party: "Bharatiya Janta Party" }, { name: "Bhupendrabhai Patel", party: "Bharatiya Janta Party" }, { name: "Basavaraj Bommai", party: "Bharatiya Janta Party" }, { name: "Shivraj Singh Chouhan", party: "Bharatiya Janta Party" }, { name: "Manik Saha", party: "Bharatiya Janta Party" }, { name: "Pushkar Singh Dhami", party: "Bharatiya Janta Party" }, { name: "Dharmendra Pradhan", party: "Bharatiya Janta Party" }, { name: "Ashvini Vaishnaw", party: "Bharatiya Janta Party" }, { name: "Mukhtar Abbas Naqvi", party: "Bharatiya Janta Party" }, { name: "Hardeep Singh Puri", party: "Bharatiya Janta Party" }, { name: "Bhartruhari Mahtab", party: "Biju Janata Dal" }, { name: "Naveen Patnaik", party: "Biju Janata Dal" }, { name: "Pinaki Mishra", party: "Biju Janata Dal" }, { name: "Sitaram Yechury", party: "Communist Party of India (Marxist)" }, { name: "Brinda Karat", party: "Communist Party of India (Marxist)" }, { name: "Pinarayi Vijayan", party: "Communist Party of India (Marxist)" }, { name: "Dayanidhi Maran", party: "Dravida Munnetra Kazhagam" }, { name: "M. K. Stalin", party: "Dravida Munnetra Kazhagam" }, { name: "Naba Kumar Sarania", party: "Independent" }, { name: "Sonia Gandhi", party: "INDIAN NATIONAL CONGRESS" }, { name: "Rahul Gandhi", party: "INDIAN NATIONAL CONGRESS" }, { name: "Ambika Soni", party: "INDIAN NATIONAL CONGRESS" }, { name: "Dr Shashi Tharoor", party: "INDIAN NATIONAL CONGRESS" }, { name: "Sachin Pilot", party: "INDIAN NATIONAL CONGRESS" }, { name: "Meira Kumar", party: "INDIAN NATIONAL CONGRESS" }, { name: "Salman Khurshid", party: "INDIAN NATIONAL CONGRESS" }, { name: "Dr Manmohan Singh", party: "INDIAN NATIONAL CONGRESS" }, { name: "Gaurav Gogoi", party: "INDIAN NATIONAL CONGRESS" }, { name: "Bhupesh Baghel", party: "INDIAN NATIONAL CONGRESS" }, { name: "Sukhvinder Singh Sukhu", party: "INDIAN NATIONAL CONGRESS" }, { name: "Ashok Gehlot", party: "INDIAN NATIONAL CONGRESS" }, { name: "Adhir Ranjan Chowdhury", party: "INDIAN NATIONAL CONGRESS" }, { name: "Karti P Chidambaram", party: "INDIAN NATIONAL CONGRESS" }, { name: "Manish Tewari", party: "INDIAN NATIONAL CONGRESS" }, { name: "Dr. Farooq Abdullah", party: "Jammu and Kashmir National Conference" }, { name: "Kaushalendra Kumar", party: "Janata Dal (United)" }, { name: "Nitish Kumar", party: "Janata Dal (United)" }, { name: "Hemant Soren", party: "Jharkhand Mukti Morcha" }, { name: "Chirag Paswan", party: "Lok Janshakti Party ( Ram Vilas)" }, { name: "Raj Thackeray", party: "Maharashtra Navnirman Sena" }, { name: "Zoramthanga", party: "Mizo National Front" }, { name: "Agatha Sangma", party: "National People's Party" }, { name: "Conrad Sangma", party: "National People's Party" }, { name: "Sharad Pawar", party: "Nationalist Congress Party" }, { name: "Ajit Pawar", party: "Nationalist Congress Party" }, { name: "Praful Patel", party: "Nationalist Congress Party" }, { name: "Neiphiu Rio", party: "Nationalist Democratic Progressive Party" }, { name: "Tejashwi Yadav", party: "Rashtriya Janata Dal" }, { name: "Misa Bharti", party: "Rashtriya Janata Dal" }, { name: "Lalu Yadav", party: "Rashtriya Janata Dal" }, { name: "Manoj Jha", party: "Rashtriya Janata Dal" }, { name: "Mehboob Ali Kaiser", party: "Rashtriya Lok Janshakti Party" }, { name: "Hanuman Beniwal", party: "Rashtriya Loktantrik Party" }, { name: "N K Premachandran", party: "Revolutionary Socialist Party" }, { name: "Akhilesh Yadav", party: "Samajwadi Party" }, { name: "Shivpal Singh Yadav", party: "Samajwadi Party" }, { name: "Dimple Yadav", party: "Samajwadi Party" }, { name: "Ram Gopal Yadav", party: "Samajwadi Party" }, { name: "Harsimrat Kaur Badal", party: "Shiromani Akali Dal" }, { name: "Sukhbir Singh Badal", party: "Shiromani Akali Dal" }, { name: "Sanjay Raut", party: "Shiv Sena (UBT)" }, { name: "Uddhav Thackeray", party: "Shiv Sena (UBT)" }, { name: "Vinayak Raut", party: "Shiv Sena" }, { name: "Eknath Shinde", party: "Shiv Sena" }, { name: "Prem Singh Tamang", party: "Sikkim Krantikari Morcha" }, { name: "Indra Hang Subba", party: "Sikkim Krantikari Morcha" }, { name: "Yogendra Yadav", party: "Swaraj India" }, { name: "Derek O'Brien", party: "Trinamool Congress" }, { name: "Y. S. Jagan Mohan Reddy", party: "Yuvajana Shramika Rythu Congress Party" }, { name: "Ghulam Nabi Azad", party: "Democratic Progressive Azad Party" }
];

const DEFAULT_COMMITTEES = [
  {
    id: "unga",
    slug: "unga",
    name: "UNGA",
    full_name: "United Nations General Assembly",
    agenda: "Code of War: Reimagining Global Frameworks for Artificial Intelligence in Modern Combat, Including Cyber Warfare, Surveillance Systems, and the Prevention of Misuse by State and Non- State Actors.",
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
    agenda: "Deliberation on Electoral Reforms with Special Emphasis on Criminalization of Politics and Transparency.",
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
    agenda: "Combating the rise of lifestyle diseases among youth and working class (obesity, hypertension, etc).",
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
    agenda: "Promoting Gender Equality in the Digital Age with Special Emphasis on Bridging the Digital Gender Divide & role of Pink tax.",
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
    agenda: "Ensuring Human Rights while Expanding National Digital Identity Systems.",
    tag: "Rights & digital identity",
    chair: "TBA",
    eb: "TBA",
    difficulty: "Intermediate",
    handbook_link: "",
    order: 5,
    portfolios: UN_ROSTER.map((name) => ({ name, status: "available", delegate: null })),
  },
];

const PERMANENT_REFERRAL_CODES = [
  { code: "PARAMOUNT200", discount: 200, label: "Paramount Ambassador Discount", active: 1, protected: 1 },
];

// ----------------------------- Schema & Seed Initialization -----------------------------
let isInitialized = false;
let initPromise = null;

async function initDatabase() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Schema setup
    await dbClient.batch([
      `CREATE TABLE IF NOT EXISTS committees (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        agenda TEXT NOT NULL,
        tag TEXT DEFAULT '',
        chair TEXT DEFAULT 'TBA',
        eb TEXT DEFAULT 'TBA',
        difficulty TEXT DEFAULT 'Beginner Friendly',
        handbook_link TEXT DEFAULT '',
        order_num INTEGER DEFAULT 0,
        portfolios TEXT NOT NULL -- JSON array
      );`,
      `CREATE TABLE IF NOT EXISTS referral_codes (
        code TEXT PRIMARY KEY,
        discount INTEGER DEFAULT 500,
        label TEXT DEFAULT 'Referral Discount',
        active INTEGER DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        protected INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        reference_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        school TEXT DEFAULT '',
        student_class TEXT DEFAULT '',
        city TEXT DEFAULT '',
        experience TEXT DEFAULT '',
        awards TEXT DEFAULT '',
        is_delegation INTEGER DEFAULT 0,
        delegation_size INTEGER,
        heard_from TEXT DEFAULT '',
        preference1 TEXT DEFAULT '{}', -- JSON
        preference2 TEXT DEFAULT '{}', -- JSON
        preference3 TEXT DEFAULT '{}', -- JSON
        referral_code TEXT DEFAULT '',
        applied_referral TEXT,
        fee INTEGER DEFAULT 1700,
        fee_tier TEXT DEFAULT 'Standard',
        payment_status TEXT DEFAULT 'pending',
        payment_screenshot TEXT DEFAULT '',
        id_card TEXT DEFAULT '',
        accepted_terms INTEGER DEFAULT 1,
        admin_note TEXT DEFAULT '',
        allotted_committee TEXT DEFAULT '',
        allotted_portfolio TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        email_status TEXT DEFAULT '{"organizer":false,"delegate":false}' -- JSON
      );`,
      `CREATE TABLE IF NOT EXISTS db_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(payment_status);`,
    ]);

    // Migrations
    try {
      await dbClient.execute(`ALTER TABLE referral_codes ADD COLUMN protected INTEGER DEFAULT 0;`);
    } catch (e) {
      // Column exists
    }
    try {
      await dbClient.execute(`ALTER TABLE registrations ADD COLUMN student_class TEXT DEFAULT '';`);
    } catch (e) {
      // Column exists
    }

    // 2. Check if already seeded
    const alreadySeededRes = await dbClient.execute({
      sql: "SELECT value FROM db_metadata WHERE key = 'seeded_at'",
      args: [],
    });
    const alreadySeeded = alreadySeededRes.rows[0];

    if (!alreadySeeded) {
      console.log(`[DB SEED] Fresh database detected (${dbType}). Running initial seed.`);
      const countRes = await dbClient.execute("SELECT COUNT(*) as count FROM committees");
      const commCount = Number(countRes.rows[0]?.count || 0);

      if (commCount === 0) {
        const jsonFile = path.join(DATA_DIR, "committees.json");
        let initialList = DEFAULT_COMMITTEES;
        if (fs.existsSync(jsonFile)) {
          try {
            const parsed = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialList = parsed;
              console.log(`[DB SEED] Using committees.json as seed source (${parsed.length} committees)`);
            }
          } catch (e) {
            console.error("[DB SEED] committees.json parse error, using defaults:", e.message);
          }
        }

        const stmts = initialList.map((c) => ({
          sql: `INSERT INTO committees (id, slug, name, full_name, agenda, tag, chair, eb, difficulty, handbook_link, order_num, portfolios)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            c.id || c.slug,
            c.slug,
            c.name,
            c.full_name,
            c.agenda,
            c.tag || "",
            c.chair || "TBA",
            c.eb || "TBA",
            c.difficulty || "All levels",
            c.handbook_link || "",
            c.order || c.order_num || 0,
            typeof c.portfolios === "string" ? c.portfolios : JSON.stringify(c.portfolios || []),
          ],
        }));

        await dbClient.batch(stmts);
        console.log(`[DB SEED] Committees seeded (${initialList.length} committees)`);
      }

      await dbClient.execute({
        sql: "INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('seeded_at', ?)",
        args: [new Date().toISOString()],
      });
      console.log(`[DB SEED] Seed sentinel written.`);
    } else {
      console.log(`[DB] Database already seeded at ${alreadySeeded.value}. Skipping seed.`);
    }

    // Always ensure permanent referral codes exist without overwriting
    for (const pc of PERMANENT_REFERRAL_CODES) {
      await dbClient.execute({
        sql: `INSERT OR IGNORE INTO referral_codes (code, discount, label, active, usage_count, protected)
              VALUES (?, ?, ?, ?, 0, ?)`,
        args: [pc.code, pc.discount, pc.label, pc.active, pc.protected],
      });
    }

    await dbClient.execute({
      sql: "UPDATE referral_codes SET protected = 1 WHERE code = 'PARAMOUNT200'",
      args: [],
    });

    isInitialized = true;
    console.log(`[DB] Database initialized successfully. Mode: ${dbType}`);
  })();

  return initPromise;
}

// ----------------------------- Formatters -----------------------------
function formatCommitteeRow(row) {
  if (!row) return null;
  const portfolios = JSON.parse(row.portfolios || "[]");
  const open_count = portfolios.filter((p) => p.status === "available").length;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    full_name: row.full_name,
    agenda: row.agenda,
    tag: row.tag || "",
    chair: row.chair || "TBA",
    eb: row.eb || "TBA",
    difficulty: row.difficulty || "All levels",
    handbook_link: row.handbook_link || "",
    order: row.order_num,
    open_count,
    total_count: portfolios.length,
    portfolios,
  };
}

function formatRegistrationRow(row) {
  if (!row) return null;
  return {
    ...row,
    is_delegation: !!row.is_delegation,
    accepted_terms: !!row.accepted_terms,
    preference1: JSON.parse(row.preference1 || "{}"),
    preference2: JSON.parse(row.preference2 || "{}"),
    preference3: JSON.parse(row.preference3 || "{}"),
    email_status: JSON.parse(row.email_status || '{"organizer":false,"delegate":false}'),
  };
}

// ----------------------------- Async DB Helpers -----------------------------
const dbHelpers = {
  getDbInfo() {
    return {
      type: dbType,
      isCloud: isCloudDb,
      url: isCloudDb ? TURSO_URL.replace(/:[^:@]+@/, ":***@") : "local file",
    };
  },

  async ensureReady() {
    await initDatabase();
  },

  // Committees
  async getCommittees() {
    await initDatabase();
    const res = await dbClient.execute("SELECT * FROM committees ORDER BY order_num ASC");
    return res.rows.map(formatCommitteeRow);
  },

  async getCommitteeBySlug(slug) {
    await initDatabase();
    const res = await dbClient.execute({
      sql: "SELECT * FROM committees WHERE slug = ?",
      args: [slug],
    });
    return formatCommitteeRow(res.rows[0]);
  },

  async updateCommittee(slug, data) {
    await initDatabase();
    const existing = await this.getCommitteeBySlug(slug);
    if (!existing) return null;

    const chair = data.chair !== undefined ? data.chair : existing.chair;
    const eb = data.eb !== undefined ? data.eb : existing.eb;
    const difficulty = data.difficulty !== undefined ? data.difficulty : existing.difficulty;
    const agenda = data.agenda !== undefined ? data.agenda : existing.agenda;
    const handbook_link = data.handbook_link !== undefined ? data.handbook_link : existing.handbook_link;

    console.log(`[DB WRITE] updateCommittee slug=${slug} chair="${chair}" eb="${eb}" difficulty="${difficulty}" at ${new Date().toISOString()}`);

    await dbClient.execute({
      sql: `UPDATE committees 
            SET chair = ?, eb = ?, difficulty = ?, agenda = ?, handbook_link = ?
            WHERE slug = ?`,
      args: [chair, eb, difficulty, agenda, handbook_link, slug],
    });

    return await this.getCommitteeBySlug(slug);
  },

  async updatePortfolio(slug, portfolioName, newStatus, delegate = null) {
    await initDatabase();
    const committee = await this.getCommitteeBySlug(slug);
    if (!committee) return null;

    let portfolios = committee.portfolios;
    let found = portfolios.find((p) => p.name === portfolioName);
    if (!found) {
      found = { name: portfolioName, party: "", status: newStatus, delegate: delegate || null };
      portfolios.push(found);
    } else {
      found.status = newStatus;
      if (delegate !== undefined) found.delegate = delegate;
    }

    console.log(`[DB WRITE] updatePortfolio slug=${slug} portfolio="${portfolioName}" status="${newStatus}" delegate="${delegate}" at ${new Date().toISOString()}`);

    await dbClient.execute({
      sql: "UPDATE committees SET portfolios = ? WHERE slug = ?",
      args: [JSON.stringify(portfolios), slug],
    });

    return await this.getCommitteeBySlug(slug);
  },

  // Referral Codes
  async getReferralCodes() {
    await initDatabase();
    const res = await dbClient.execute("SELECT * FROM referral_codes ORDER BY code ASC");
    return res.rows.map((r) => ({
      code: r.code,
      discount: r.discount,
      label: r.label,
      active: !!r.active,
      usage_count: r.usage_count,
      protected: !!r.protected,
    }));
  },

  async getReferralCode(code) {
    await initDatabase();
    const res = await dbClient.execute({
      sql: "SELECT * FROM referral_codes WHERE code = ?",
      args: [(code || "").toUpperCase()],
    });
    const row = res.rows[0];
    if (!row) return null;
    return {
      code: row.code,
      discount: row.discount,
      label: row.label,
      active: !!row.active,
      usage_count: row.usage_count,
      protected: !!row.protected,
    };
  },

  async createReferralCode(data) {
    await initDatabase();
    const code = (data.code || "").trim().toUpperCase();
    const discount = Number(data.discount) || 500;
    const label = data.label || "Referral Discount";
    const active = data.active !== false ? 1 : 0;

    console.log(`[DB WRITE] createReferralCode code="${code}" discount=${discount} at ${new Date().toISOString()}`);

    await dbClient.execute({
      sql: `INSERT INTO referral_codes (code, discount, label, active, usage_count, protected)
            VALUES (?, ?, ?, ?, 0, 0)`,
      args: [code, discount, label, active],
    });

    return await this.getReferralCode(code);
  },

  async updateReferralCode(code, data) {
    await initDatabase();
    const existing = await this.getReferralCode(code);
    if (!existing) return null;

    const discount = data.discount !== undefined ? Number(data.discount) : existing.discount;
    const label = data.label !== undefined ? data.label : existing.label;
    const active = data.active !== undefined ? (data.active ? 1 : 0) : (existing.active ? 1 : 0);

    console.log(`[DB WRITE] updateReferralCode code="${code}" discount=${discount} active=${active} at ${new Date().toISOString()}`);

    await dbClient.execute({
      sql: `UPDATE referral_codes
            SET discount = ?, label = ?, active = ?
            WHERE code = ?`,
      args: [discount, label, active, code.toUpperCase()],
    });

    return await this.getReferralCode(code);
  },

  async deleteReferralCode(code) {
    await initDatabase();
    const upper = (code || "").toUpperCase();
    const existing = await this.getReferralCode(upper);
    if (existing && existing.protected) {
      console.warn(`[DB WRITE] BLOCKED deleteReferralCode for protected code "${upper}"`);
      return { rowsAffected: 0, blocked: true };
    }

    console.log(`[DB WRITE] deleteReferralCode code="${upper}" at ${new Date().toISOString()}`);
    const res = await dbClient.execute({
      sql: "DELETE FROM referral_codes WHERE code = ? AND protected = 0",
      args: [upper],
    });
    return { changes: res.rowsAffected };
  },

  async incrementReferralUsage(code) {
    await initDatabase();
    return await dbClient.execute({
      sql: "UPDATE referral_codes SET usage_count = usage_count + 1 WHERE code = ?",
      args: [(code || "").toUpperCase()],
    });
  },

  // Registrations
  async getRegistrations(options = {}) {
    await initDatabase();
    if (options.includeImages === false) {
      const res = await dbClient.execute(`
        SELECT 
          id, reference_id, full_name, email, phone, school, student_class, city, experience, awards,
          is_delegation, delegation_size, heard_from, preference1, preference2, preference3,
          referral_code, applied_referral, fee, fee_tier, payment_status,
          accepted_terms, admin_note, allotted_committee, allotted_portfolio, created_at, email_status,
          CASE WHEN payment_screenshot IS NOT NULL AND length(payment_screenshot) > 0 THEN 1 ELSE 0 END as has_payment_screenshot,
          CASE WHEN id_card IS NOT NULL AND length(id_card) > 0 THEN 1 ELSE 0 END as has_id_card
        FROM registrations 
        ORDER BY created_at DESC
      `);
      return res.rows.map((row) => {
        const formatted = formatRegistrationRow(row);
        formatted.payment_screenshot = "";
        formatted.id_card = "";
        formatted.has_payment_screenshot = !!row.has_payment_screenshot;
        formatted.has_id_card = !!row.has_id_card;
        return formatted;
      });
    }
    const res = await dbClient.execute("SELECT * FROM registrations ORDER BY created_at DESC");
    return res.rows.map(formatRegistrationRow);
  },

  async getRegistration(idOrRef) {
    await initDatabase();
    const res = await dbClient.execute({
      sql: "SELECT * FROM registrations WHERE id = ? OR reference_id = ?",
      args: [idOrRef, idOrRef],
    });
    return formatRegistrationRow(res.rows[0]);
  },

  async createRegistration(data) {
    await initDatabase();
    console.log(`[DB WRITE] createRegistration id="${data.id}" reference_id="${data.reference_id}" name="${data.full_name}" email="${data.email}" at ${new Date().toISOString()}`);

    await dbClient.execute({
      sql: `INSERT INTO registrations (
        id, reference_id, full_name, email, phone, school, student_class, city, experience, awards,
        is_delegation, delegation_size, heard_from, preference1, preference2, preference3,
        referral_code, applied_referral, fee, fee_tier, payment_status, payment_screenshot,
        id_card, accepted_terms, admin_note, allotted_committee, allotted_portfolio, created_at, email_status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )`,
      args: [
        data.id,
        data.reference_id,
        data.full_name,
        data.email,
        data.phone,
        data.school || "",
        data.student_class || "",
        data.city || "",
        data.experience || "",
        data.awards || "",
        data.is_delegation ? 1 : 0,
        data.delegation_size || null,
        data.heard_from || "",
        JSON.stringify(data.preference1 || {}),
        JSON.stringify(data.preference2 || {}),
        JSON.stringify(data.preference3 || {}),
        data.referral_code || "",
        data.applied_referral || null,
        data.fee || 1700,
        data.fee_tier || "Standard",
        data.payment_status || "pending",
        data.payment_screenshot || "",
        data.id_card || "",
        data.accepted_terms ? 1 : 0,
        data.admin_note || "",
        data.allotted_committee || "",
        data.allotted_portfolio || "",
        data.created_at || new Date().toISOString(),
        JSON.stringify(data.email_status || { organizer: false, delegate: false }),
      ],
    });

    return await this.getRegistration(data.id);
  },

  async updateRegistration(idOrRef, updates) {
    await initDatabase();
    const existing = await this.getRegistration(idOrRef);
    if (!existing) return null;

    console.log(`[DB WRITE] updateRegistration id="${existing.id}" ref="${existing.reference_id}" fields=${JSON.stringify(Object.keys(updates))} at ${new Date().toISOString()}`);

    const merged = { ...existing, ...updates };

    await dbClient.execute({
      sql: `UPDATE registrations SET
        full_name = ?,
        email = ?,
        phone = ?,
        school = ?,
        student_class = ?,
        city = ?,
        experience = ?,
        awards = ?,
        is_delegation = ?,
        delegation_size = ?,
        heard_from = ?,
        preference1 = ?,
        preference2 = ?,
        preference3 = ?,
        referral_code = ?,
        applied_referral = ?,
        fee = ?,
        fee_tier = ?,
        payment_status = ?,
        payment_screenshot = ?,
        id_card = ?,
        admin_note = ?,
        allotted_committee = ?,
        allotted_portfolio = ?,
        email_status = ?
      WHERE id = ? OR reference_id = ?`,
      args: [
        merged.full_name,
        merged.email,
        merged.phone,
        merged.school || "",
        merged.student_class || "",
        merged.city || "",
        merged.experience || "",
        merged.awards || "",
        merged.is_delegation ? 1 : 0,
        merged.delegation_size || null,
        merged.heard_from || "",
        typeof merged.preference1 === "object" ? JSON.stringify(merged.preference1) : merged.preference1,
        typeof merged.preference2 === "object" ? JSON.stringify(merged.preference2) : merged.preference2,
        typeof merged.preference3 === "object" ? JSON.stringify(merged.preference3) : merged.preference3,
        merged.referral_code || "",
        merged.applied_referral || null,
        merged.fee || 1700,
        merged.fee_tier || "Standard",
        merged.payment_status || "pending",
        merged.payment_screenshot || "",
        merged.id_card || "",
        merged.admin_note || "",
        merged.allotted_committee || "",
        merged.allotted_portfolio || "",
        typeof merged.email_status === "object" ? JSON.stringify(merged.email_status) : merged.email_status,
        existing.id,
        existing.id,
      ],
    });

    return await this.getRegistration(existing.id);
  },

  async deleteRegistration(idOrRef) {
    await initDatabase();
    const existing = await this.getRegistration(idOrRef);
    if (existing) {
      console.log(`[DB WRITE] deleteRegistration id="${existing.id}" ref="${existing.reference_id}" name="${existing.full_name}" at ${new Date().toISOString()}`);
    }
    const res = await dbClient.execute({
      sql: "DELETE FROM registrations WHERE id = ? OR reference_id = ?",
      args: [idOrRef, idOrRef],
    });
    return { changes: res.rowsAffected };
  },

  async getStats() {
    await initDatabase();
    const res = await dbClient.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN payment_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN payment_status = 'verified' THEN COALESCE(fee, 1700) ELSE 0 END) as total_revenue
      FROM registrations
    `);
    const row = res.rows[0] || {};
    const total = Number(row.total || 0);
    const verified = Number(row.verified || 0);
    const pending = Number(row.pending || 0);
    const rejected = Number(row.rejected || 0);
    const total_revenue = Number(row.total_revenue || 0);

    return {
      total,
      pending,
      verified,
      rejected,
      total_registrations: total,
      verified_payments: verified,
      pending_payments: pending,
      total_revenue,
      database: this.getDbInfo(),
    };
  },

  async generateAllotmentsCsv() {
    const regs = await this.getRegistrations();
    const headers = ["Reference ID", "Student Name", "Phone", "Email", "School", "Class", "Committee", "Country / Political Leader (Portfolio)"];
    const lines = [headers.join(",")];

    regs.forEach((r) => {
      if (r.allotted_committee && r.allotted_portfolio) {
        const row = [
          r.reference_id,
          `"${(r.full_name || "").replace(/"/g, '""')}"`,
          `"${(r.phone || "").replace(/"/g, '""')}"`,
          `"${(r.email || "").replace(/"/g, '""')}"`,
          `"${(r.school || "").replace(/"/g, '""')}"`,
          `"${(r.student_class || "").replace(/"/g, '""')}"`,
          `"${(r.allotted_committee || "").replace(/"/g, '""')}"`,
          `"${(r.allotted_portfolio || "").replace(/"/g, '""')}"`,
        ];
        lines.push(row.join(","));
      }
    });

    return lines.join("\n");
  },

  async generateRegistrationsCsv() {
    const regs = await this.getRegistrations();
    const headers = [
      "Registration ID",
      "Student Name",
      "Phone Number",
      "Email",
      "School / Institution",
      "Class",
      "City",
      "Allotted Committee",
      "Allotted Portfolio (Country / Leader)",
      "Pref 1 Committee",
      "Pref 1 Portfolio",
      "Pref 2 Committee",
      "Pref 2 Portfolio",
      "Pref 3 Committee",
      "Pref 3 Portfolio",
      "Payment Status",
      "Fee (INR)",
      "Referral Code",
      "Experience",
      "Delegation Size",
      "Registered At",
      "Admin Note"
    ];
    const lines = [headers.join(",")];

    regs.forEach((r) => {
      const p1 = r.preference1 || {};
      const p2 = r.preference2 || {};
      const p3 = r.preference3 || {};
      const row = [
        r.reference_id || "",
        `"${(r.full_name || "").replace(/"/g, '""')}"`,
        `"${(r.phone || "").replace(/"/g, '""')}"`,
        `"${(r.email || "").replace(/"/g, '""')}"`,
        `"${(r.school || "").replace(/"/g, '""')}"`,
        `"${(r.student_class || "").replace(/"/g, '""')}"`,
        `"${(r.city || "").replace(/"/g, '""')}"`,
        `"${(r.allotted_committee || "").replace(/"/g, '""')}"`,
        `"${(r.allotted_portfolio || "").replace(/"/g, '""')}"`,
        `"${(p1.committee || "").replace(/"/g, '""')}"`,
        `"${(p1.portfolio || "").replace(/"/g, '""')}"`,
        `"${(p2.committee || "").replace(/"/g, '""')}"`,
        `"${(p2.portfolio || "").replace(/"/g, '""')}"`,
        `"${(p3.committee || "").replace(/"/g, '""')}"`,
        `"${(p3.portfolio || "").replace(/"/g, '""')}"`,
        `"${(r.payment_status || "pending").replace(/"/g, '""')}"`,
        r.fee || 1700,
        `"${(r.applied_referral || r.referral_code || "").replace(/"/g, '""')}"`,
        `"${(r.experience || "").replace(/"/g, '""')}"`,
        r.is_delegation ? (r.delegation_size || "Delegation") : "Individual",
        `"${(r.created_at || "").replace(/"/g, '""')}"`,
        `"${(r.admin_note || "").replace(/"/g, '""')}"`
      ];
      lines.push(row.join(","));
    });

    return lines.join("\n");
  },

  // ----------------------------- Backup & Restore -----------------------------
  async exportBackupData() {
    await initDatabase();
    const commRes = await dbClient.execute("SELECT * FROM committees ORDER BY order_num ASC");
    const refRes = await dbClient.execute("SELECT * FROM referral_codes ORDER BY code ASC");
    const regRes = await dbClient.execute("SELECT * FROM registrations ORDER BY created_at DESC");

    return {
      version: "1.0",
      exported_at: new Date().toISOString(),
      database_type: dbType,
      committees: commRes.rows.map((row) => ({
        ...row,
        portfolios: JSON.parse(row.portfolios || "[]"),
      })),
      referral_codes: refRes.rows.map((r) => ({
        code: r.code,
        discount: r.discount,
        label: r.label,
        active: Number(r.active),
        usage_count: Number(r.usage_count || 0),
        protected: Number(r.protected || 0),
      })),
      registrations: regRes.rows.map((r) => ({
        ...r,
        preference1: JSON.parse(r.preference1 || "{}"),
        preference2: JSON.parse(r.preference2 || "{}"),
        preference3: JSON.parse(r.preference3 || "{}"),
        email_status: JSON.parse(r.email_status || "{}"),
      })),
    };
  },

  async restoreBackupData(backup) {
    await initDatabase();
    if (!backup || typeof backup !== "object") {
      throw new Error("Invalid backup payload format");
    }

    const stmts = [];

    // 1. Restore committees
    if (Array.isArray(backup.committees) && backup.committees.length > 0) {
      for (const c of backup.committees) {
        stmts.push({
          sql: `INSERT INTO committees (id, slug, name, full_name, agenda, tag, chair, eb, difficulty, handbook_link, order_num, portfolios)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(slug) DO UPDATE SET
                  name=excluded.name,
                  full_name=excluded.full_name,
                  agenda=excluded.agenda,
                  tag=excluded.tag,
                  chair=excluded.chair,
                  eb=excluded.eb,
                  difficulty=excluded.difficulty,
                  handbook_link=excluded.handbook_link,
                  order_num=excluded.order_num,
                  portfolios=excluded.portfolios`,
          args: [
            c.id || c.slug,
            c.slug,
            c.name,
            c.full_name,
            c.agenda,
            c.tag || "",
            c.chair || "TBA",
            c.eb || "TBA",
            c.difficulty || "All levels",
            c.handbook_link || "",
            c.order_num || c.order || 0,
            typeof c.portfolios === "string" ? c.portfolios : JSON.stringify(c.portfolios || []),
          ],
        });
      }
    }

    // 2. Restore referral codes
    if (Array.isArray(backup.referral_codes) && backup.referral_codes.length > 0) {
      for (const rc of backup.referral_codes) {
        stmts.push({
          sql: `INSERT INTO referral_codes (code, discount, label, active, usage_count, protected)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(code) DO UPDATE SET
                  discount=excluded.discount,
                  label=excluded.label,
                  active=excluded.active,
                  usage_count=excluded.usage_count,
                  protected=excluded.protected`,
          args: [
            rc.code.toUpperCase(),
            Number(rc.discount) || 500,
            rc.label || "Referral Discount",
            rc.active ? 1 : 0,
            Number(rc.usage_count) || 0,
            rc.protected ? 1 : 0,
          ],
        });
      }
    }

    // 3. Restore registrations
    if (Array.isArray(backup.registrations) && backup.registrations.length > 0) {
      for (const r of backup.registrations) {
        stmts.push({
          sql: `INSERT INTO registrations (
            id, reference_id, full_name, email, phone, school, student_class, city, experience, awards,
            is_delegation, delegation_size, heard_from, preference1, preference2, preference3,
            referral_code, applied_referral, fee, fee_tier, payment_status, payment_screenshot,
            id_card, accepted_terms, admin_note, allotted_committee, allotted_portfolio, created_at, email_status
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(reference_id) DO UPDATE SET
            full_name=excluded.full_name,
            email=excluded.email,
            phone=excluded.phone,
            school=excluded.school,
            student_class=excluded.student_class,
            city=excluded.city,
            experience=excluded.experience,
            awards=excluded.awards,
            is_delegation=excluded.is_delegation,
            delegation_size=excluded.delegation_size,
            heard_from=excluded.heard_from,
            preference1=excluded.preference1,
            preference2=excluded.preference2,
            preference3=excluded.preference3,
            referral_code=excluded.referral_code,
            applied_referral=excluded.applied_referral,
            fee=excluded.fee,
            fee_tier=excluded.fee_tier,
            payment_status=excluded.payment_status,
            payment_screenshot=excluded.payment_screenshot,
            id_card=excluded.id_card,
            admin_note=excluded.admin_note,
            allotted_committee=excluded.allotted_committee,
            allotted_portfolio=excluded.allotted_portfolio,
            email_status=excluded.email_status`,
          args: [
            r.id,
            r.reference_id,
            r.full_name,
            r.email,
            r.phone,
            r.school || "",
            r.student_class || "",
            r.city || "",
            r.experience || "",
            r.awards || "",
            r.is_delegation ? 1 : 0,
            r.delegation_size || null,
            r.heard_from || "",
            typeof r.preference1 === "object" ? JSON.stringify(r.preference1) : r.preference1,
            typeof r.preference2 === "object" ? JSON.stringify(r.preference2) : r.preference2,
            typeof r.preference3 === "object" ? JSON.stringify(r.preference3) : r.preference3,
            r.referral_code || "",
            r.applied_referral || null,
            r.fee || 1700,
            r.fee_tier || "Standard",
            r.payment_status || "pending",
            r.payment_screenshot || "",
            r.id_card || "",
            r.accepted_terms ? 1 : 0,
            r.admin_note || "",
            r.allotted_committee || "",
            r.allotted_portfolio || "",
            r.created_at || new Date().toISOString(),
            typeof r.email_status === "object" ? JSON.stringify(r.email_status) : r.email_status,
          ],
        });
      }
    }

    if (stmts.length > 0) {
      await dbClient.batch(stmts);
    }

    return {
      ok: true,
      restored_committees: backup.committees ? backup.committees.length : 0,
      restored_referral_codes: backup.referral_codes ? backup.referral_codes.length : 0,
      restored_registrations: backup.registrations ? backup.registrations.length : 0,
    };
  },
};

// Initialize DB in background on module load
initDatabase().catch((err) => {
  console.error("[CRITICAL] Failed to initialize database:", err);
});

module.exports = {
  db: dbClient,
  dbHelpers,
  initDatabase,
};
