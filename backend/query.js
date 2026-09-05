const db = require('better-sqlite3')('data/paramount_mun.db');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
console.log(db.prepare("SELECT id, full_name, email FROM registrations").all());
