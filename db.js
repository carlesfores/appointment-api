var { Pool } = require('pg');

var pool = new Pool(
  process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : undefined
);

pool.on('error', function(error) {
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
