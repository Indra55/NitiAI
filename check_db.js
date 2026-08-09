require('dotenv').config({path: './server/.env'});
const pool = require('./server/config/dbConfig');

async function check() {
  const res = await pool.query("SELECT * FROM resume_info ORDER BY updated_at DESC LIMIT 1");
  console.log(res.rows[0]);
  pool.end();
}
check();
