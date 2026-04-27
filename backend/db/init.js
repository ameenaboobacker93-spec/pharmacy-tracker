const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Database schema initialised successfully.');
  } catch (err) {
    // 42P01 = undefined_table, but schema.sql uses IF NOT EXISTS so errors
    // here are unexpected — log and continue rather than crashing the server.
    console.error('Error initialising database schema:', err.message);
  }
}

module.exports = initDb;
