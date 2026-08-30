const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "paramount_mun.db");
const db = new Database(DB_PATH);

// Optimize performance and concurrency with WAL mode
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// ----------------------------- Schema Setup -----------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS committees (
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
  );

  CREATE TABLE IF NOT EXISTS referral_codes (
    code TEXT PRIMARY KEY,
    discount INTEGER DEFAULT 500,
    label TEXT DEFAULT 'Referral Discount',
    active INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    reference_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    school TEXT DEFAULT '',
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
    fee INTEGER DEFAULT 2000,
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
  );
`);

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
  { code: "PARAMOUNT500", discount: 500, label: "Paramount Ambassador Discount", active: 1, usage_count: 0 },
  { code: "DELEGATE2026", discount: 500, label: "Early Delegate Discount", active: 1, usage_count: 0 },
];

// Seed initial data if tables are empty
function seedDatabase() {
  const commCount = db.prepare("SELECT COUNT(*) as count FROM committees").get().count;
  if (commCount === 0) {
    console.log("[DB] Seeding committees table in SQLite...");
    const insertComm = db.prepare(`
      INSERT INTO committees (id, slug, name, full_name, agenda, tag, chair, eb, difficulty, handbook_link, order_num, portfolios)
      VALUES (@id, @slug, @name, @full_name, @agenda, @tag, @chair, @eb, @difficulty, @handbook_link, @order_num, @portfolios)
    `);

    // Check if JSON exists first
    const jsonFile = path.join(DATA_DIR, "committees.json");
    let initialList = DEFAULT_COMMITTEES;
    if (fs.existsSync(jsonFile)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
        if (Array.isArray(parsed) && parsed.length > 0) initialList = parsed;
      } catch (e) {}
    }

    const insertMany = db.transaction((list) => {
      for (const c of list) {
        insertComm.run({
          id: c.id || c.slug,
          slug: c.slug,
          name: c.name,
          full_name: c.full_name,
          agenda: c.agenda,
          tag: c.tag || "",
          chair: c.chair || "TBA",
          eb: c.eb || "TBA",
          difficulty: c.difficulty || "All levels",
          handbook_link: c.handbook_link || "",
          order_num: c.order || 0,
          portfolios: JSON.stringify(c.portfolios || []),
        });
      }
    });
    insertMany(initialList);
  }

  const refCount = db.prepare("SELECT COUNT(*) as count FROM referral_codes").get().count;
  if (refCount === 0) {
    console.log("[DB] Seeding referral_codes table in SQLite...");
    const insertCode = db.prepare(`
      INSERT INTO referral_codes (code, discount, label, active, usage_count)
      VALUES (@code, @discount, @label, @active, @usage_count)
    `);

    const jsonFile = path.join(DATA_DIR, "referral_codes.json");
    let initialCodes = DEFAULT_REFERRAL_CODES;
    if (fs.existsSync(jsonFile)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
        if (Array.isArray(parsed) && parsed.length > 0) initialCodes = parsed;
      } catch (e) {}
    }

    const insertMany = db.transaction((codes) => {
      for (const r of codes) {
        insertCode.run({
          code: r.code.toUpperCase(),
          discount: r.discount || 500,
          label: r.label || "Referral Discount",
          active: r.active ? 1 : 0,
          usage_count: r.usage_count || 0,
        });
      }
    });
    insertMany(initialCodes);
  }

  const regCount = db.prepare("SELECT COUNT(*) as count FROM registrations").get().count;
  if (regCount === 0) {
    const jsonFile = path.join(DATA_DIR, "registrations.json");
    if (fs.existsSync(jsonFile)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`[DB] Migrating ${parsed.length} existing registrations from JSON to SQLite...`);
          const insertReg = db.prepare(`
            INSERT INTO registrations (
              id, reference_id, full_name, email, phone, school, city, experience, awards,
              is_delegation, delegation_size, heard_from, preference1, preference2, preference3,
              referral_code, applied_referral, fee, fee_tier, payment_status, payment_screenshot,
              id_card, accepted_terms, admin_note, allotted_committee, allotted_portfolio, created_at, email_status
            ) VALUES (
              @id, @reference_id, @full_name, @email, @phone, @school, @city, @experience, @awards,
              @is_delegation, @delegation_size, @heard_from, @preference1, @preference2, @preference3,
              @referral_code, @applied_referral, @fee, @fee_tier, @payment_status, @payment_screenshot,
              @id_card, @accepted_terms, @admin_note, @allotted_committee, @allotted_portfolio, @created_at, @email_status
            )
          `);
          const insertMany = db.transaction((regs) => {
            for (const r of regs) {
              insertReg.run({
                id: r.id,
                reference_id: r.reference_id,
                full_name: r.full_name,
                email: r.email,
                phone: r.phone,
                school: r.school || "",
                city: r.city || "",
                experience: r.experience || "",
                awards: r.awards || "",
                is_delegation: r.is_delegation ? 1 : 0,
                delegation_size: r.delegation_size || null,
                heard_from: r.heard_from || "",
                preference1: JSON.stringify(r.preference1 || {}),
                preference2: JSON.stringify(r.preference2 || {}),
                preference3: JSON.stringify(r.preference3 || {}),
                referral_code: r.referral_code || "",
                applied_referral: r.applied_referral || null,
                fee: r.fee || 2000,
                fee_tier: r.fee_tier || "Standard",
                payment_status: r.payment_status || "pending",
                payment_screenshot: r.payment_screenshot || "",
                id_card: r.id_card || "",
                accepted_terms: r.accepted_terms ? 1 : 0,
                admin_note: r.admin_note || "",
                allotted_committee: r.allotted_committee || "",
                allotted_portfolio: r.allotted_portfolio || "",
                created_at: r.created_at || new Date().toISOString(),
                email_status: JSON.stringify(r.email_status || { organizer: false, delegate: false }),
              });
            }
          });
          insertMany(parsed);
        }
      } catch (e) {
        console.error("[DB] Failed to migrate registrations.json:", e);
      }
    }
  }
}

seedDatabase();

// ----------------------------- Data Access Helpers -----------------------------

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

const dbHelpers = {
  // Committees
  getCommittees() {
    const rows = db.prepare("SELECT * FROM committees ORDER BY order_num ASC").all();
    return rows.map(formatCommitteeRow);
  },

  getCommitteeBySlug(slug) {
    const row = db.prepare("SELECT * FROM committees WHERE slug = ?").get(slug);
    return formatCommitteeRow(row);
  },

  updateCommittee(slug, data) {
    const existing = this.getCommitteeBySlug(slug);
    if (!existing) return null;

    const chair = data.chair !== undefined ? data.chair : existing.chair;
    const eb = data.eb !== undefined ? data.eb : existing.eb;
    const difficulty = data.difficulty !== undefined ? data.difficulty : existing.difficulty;
    const agenda = data.agenda !== undefined ? data.agenda : existing.agenda;
    const handbook_link = data.handbook_link !== undefined ? data.handbook_link : existing.handbook_link;

    db.prepare(`
      UPDATE committees 
      SET chair = ?, eb = ?, difficulty = ?, agenda = ?, handbook_link = ?
      WHERE slug = ?
    `).run(chair, eb, difficulty, agenda, handbook_link, slug);

    return this.getCommitteeBySlug(slug);
  },

  updatePortfolio(slug, portfolioName, newStatus, delegate = null) {
    const committee = this.getCommitteeBySlug(slug);
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

    db.prepare("UPDATE committees SET portfolios = ? WHERE slug = ?").run(JSON.stringify(portfolios), slug);
    return this.getCommitteeBySlug(slug);
  },

  // Referral Codes
  getReferralCodes() {
    const rows = db.prepare("SELECT * FROM referral_codes ORDER BY code ASC").all();
    return rows.map((r) => ({
      code: r.code,
      discount: r.discount,
      label: r.label,
      active: !!r.active,
      usage_count: r.usage_count,
    }));
  },

  getReferralCode(code) {
    const row = db.prepare("SELECT * FROM referral_codes WHERE code = ?").get((code || "").toUpperCase());
    if (!row) return null;
    return {
      code: row.code,
      discount: row.discount,
      label: row.label,
      active: !!row.active,
      usage_count: row.usage_count,
    };
  },

  createReferralCode(data) {
    const code = (data.code || "").trim().toUpperCase();
    const discount = Number(data.discount) || 500;
    const label = data.label || "Referral Discount";
    const active = data.active !== false ? 1 : 0;

    db.prepare(`
      INSERT INTO referral_codes (code, discount, label, active, usage_count)
      VALUES (?, ?, ?, ?, 0)
    `).run(code, discount, label, active);

    return this.getReferralCode(code);
  },

  updateReferralCode(code, data) {
    const existing = this.getReferralCode(code);
    if (!existing) return null;

    const discount = data.discount !== undefined ? Number(data.discount) : existing.discount;
    const label = data.label !== undefined ? data.label : existing.label;
    const active = data.active !== undefined ? (data.active ? 1 : 0) : (existing.active ? 1 : 0);

    db.prepare(`
      UPDATE referral_codes
      SET discount = ?, label = ?, active = ?
      WHERE code = ?
    `).run(discount, label, active, code.toUpperCase());

    return this.getReferralCode(code);
  },

  deleteReferralCode(code) {
    return db.prepare("DELETE FROM referral_codes WHERE code = ?").run((code || "").toUpperCase());
  },

  incrementReferralUsage(code) {
    return db.prepare("UPDATE referral_codes SET usage_count = usage_count + 1 WHERE code = ?").run((code || "").toUpperCase());
  },

  // Registrations
  getRegistrations() {
    const rows = db.prepare("SELECT * FROM registrations ORDER BY created_at DESC").all();
    return rows.map(formatRegistrationRow);
  },

  getRegistration(idOrRef) {
    const row = db.prepare("SELECT * FROM registrations WHERE id = ? OR reference_id = ?").get(idOrRef, idOrRef);
    return formatRegistrationRow(row);
  },

  createRegistration(data) {
    const stmt = db.prepare(`
      INSERT INTO registrations (
        id, reference_id, full_name, email, phone, school, city, experience, awards,
        is_delegation, delegation_size, heard_from, preference1, preference2, preference3,
        referral_code, applied_referral, fee, fee_tier, payment_status, payment_screenshot,
        id_card, accepted_terms, admin_note, allotted_committee, allotted_portfolio, created_at, email_status
      ) VALUES (
        @id, @reference_id, @full_name, @email, @phone, @school, @city, @experience, @awards,
        @is_delegation, @delegation_size, @heard_from, @preference1, @preference2, @preference3,
        @referral_code, @applied_referral, @fee, @fee_tier, @payment_status, @payment_screenshot,
        @id_card, @accepted_terms, @admin_note, @allotted_committee, @allotted_portfolio, @created_at, @email_status
      )
    `);

    stmt.run({
      id: data.id,
      reference_id: data.reference_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      school: data.school || "",
      city: data.city || "",
      experience: data.experience || "",
      awards: data.awards || "",
      is_delegation: data.is_delegation ? 1 : 0,
      delegation_size: data.delegation_size || null,
      heard_from: data.heard_from || "",
      preference1: JSON.stringify(data.preference1 || {}),
      preference2: JSON.stringify(data.preference2 || {}),
      preference3: JSON.stringify(data.preference3 || {}),
      referral_code: data.referral_code || "",
      applied_referral: data.applied_referral || null,
      fee: data.fee || 2000,
      fee_tier: data.fee_tier || "Standard",
      payment_status: data.payment_status || "pending",
      payment_screenshot: data.payment_screenshot || "",
      id_card: data.id_card || "",
      accepted_terms: data.accepted_terms ? 1 : 0,
      admin_note: data.admin_note || "",
      allotted_committee: data.allotted_committee || "",
      allotted_portfolio: data.allotted_portfolio || "",
      created_at: data.created_at || new Date().toISOString(),
      email_status: JSON.stringify(data.email_status || { organizer: false, delegate: false }),
    });

    return this.getRegistration(data.id);
  },

  updateRegistration(idOrRef, updates) {
    const existing = this.getRegistration(idOrRef);
    if (!existing) return null;

    const merged = { ...existing, ...updates };

    db.prepare(`
      UPDATE registrations SET
        full_name = @full_name,
        email = @email,
        phone = @phone,
        school = @school,
        city = @city,
        experience = @experience,
        awards = @awards,
        is_delegation = @is_delegation,
        delegation_size = @delegation_size,
        heard_from = @heard_from,
        preference1 = @preference1,
        preference2 = @preference2,
        preference3 = @preference3,
        referral_code = @referral_code,
        applied_referral = @applied_referral,
        fee = @fee,
        fee_tier = @fee_tier,
        payment_status = @payment_status,
        payment_screenshot = @payment_screenshot,
        id_card = @id_card,
        admin_note = @admin_note,
        allotted_committee = @allotted_committee,
        allotted_portfolio = @allotted_portfolio,
        email_status = @email_status
      WHERE id = @id OR reference_id = @id
    `).run({
      id: existing.id,
      full_name: merged.full_name,
      email: merged.email,
      phone: merged.phone,
      school: merged.school || "",
      city: merged.city || "",
      experience: merged.experience || "",
      awards: merged.awards || "",
      is_delegation: merged.is_delegation ? 1 : 0,
      delegation_size: merged.delegation_size || null,
      heard_from: merged.heard_from || "",
      preference1: typeof merged.preference1 === "object" ? JSON.stringify(merged.preference1) : merged.preference1,
      preference2: typeof merged.preference2 === "object" ? JSON.stringify(merged.preference2) : merged.preference2,
      preference3: typeof merged.preference3 === "object" ? JSON.stringify(merged.preference3) : merged.preference3,
      referral_code: merged.referral_code || "",
      applied_referral: merged.applied_referral || null,
      fee: merged.fee || 2000,
      fee_tier: merged.fee_tier || "Standard",
      payment_status: merged.payment_status || "pending",
      payment_screenshot: merged.payment_screenshot || "",
      id_card: merged.id_card || "",
      admin_note: merged.admin_note || "",
      allotted_committee: merged.allotted_committee || "",
      allotted_portfolio: merged.allotted_portfolio || "",
      email_status: typeof merged.email_status === "object" ? JSON.stringify(merged.email_status) : merged.email_status,
    });

    return this.getRegistration(existing.id);
  },

  deleteRegistration(idOrRef) {
    return db.prepare("DELETE FROM registrations WHERE id = ? OR reference_id = ?").run(idOrRef, idOrRef);
  },

  getStats() {
    const regs = this.getRegistrations();
    const total = regs.length;
    const verified = regs.filter((r) => r.payment_status === "verified").length;
    const pending = regs.filter((r) => r.payment_status === "pending").length;
    const rejected = regs.filter((r) => r.payment_status === "rejected").length;
    const total_revenue = regs
      .filter((r) => r.payment_status === "verified")
      .reduce((sum, r) => sum + (r.fee || 2000), 0);

    return {
      total,
      pending,
      verified,
      rejected,
      total_registrations: total,
      verified_payments: verified,
      pending_payments: pending,
      total_revenue,
    };
  },

  generateAllotmentsCsv() {
    const regs = this.getRegistrations();
    const headers = ["Reference ID", "Name", "Email", "Phone", "School", "Committee", "Portfolio"];
    const lines = [headers.join(",")];

    regs.forEach((r) => {
      if (r.allotted_committee && r.allotted_portfolio) {
        const row = [
          r.reference_id,
          `"${(r.full_name || "").replace(/"/g, '""')}"`,
          `"${(r.email || "").replace(/"/g, '""')}"`,
          `"${(r.phone || "").replace(/"/g, '""')}"`,
          `"${(r.school || "").replace(/"/g, '""')}"`,
          `"${(r.allotted_committee || "").replace(/"/g, '""')}"`,
          `"${(r.allotted_portfolio || "").replace(/"/g, '""')}"`,
        ];
        lines.push(row.join(","));
      }
    });

    return lines.join("\n");
  },
};

module.exports = {
  db,
  dbHelpers,
};
