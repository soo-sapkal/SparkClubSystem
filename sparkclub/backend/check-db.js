const initSqlJs = require('sql.js');
const fs = require('fs');

async function main() {
  await initSqlJs();
  const SQL = require('sql.js').default;
  const sqljs = await initSqlJs();
  const db = new sqljs.Database(fs.readFileSync('db/sparkclub.db'));
  const r = db.exec("SELECT id, email, role, password_hash FROM users WHERE email='admin@sparkclub.edu'");
  console.log('Result:', JSON.stringify(r, null, 2));
  if (r[0] && r[0].values[0]) {
    const hash = r[0].values[0][3];
    console.log('Stored hash:', hash);
    const bcrypt = require('bcryptjs');
    const v = bcrypt.compareSync('password123', hash);
    console.log('Verify:', v);
  } else {
    console.log('No user found');
    const all = db.exec("SELECT id, email, role FROM users");
    console.log('All users:', JSON.stringify(all, null, 2));
  }
}

main();