const db = require('better-sqlite3')('data/paramount_mun.db');
const results = db.prepare("SELECT * FROM registrations WHERE allotted_portfolio LIKE '%India%' OR full_name LIKE '%HITARTHA%' COLLATE NOCASE").all();
console.log(results);
