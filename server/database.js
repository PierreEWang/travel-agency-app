const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL // stocké dans .env
});

module.exports = pool;
