const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'visco_bd',
  password: 'crucita',
  port: 5432,
});

module.exports = pool;