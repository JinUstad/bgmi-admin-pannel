const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgres://postgres.tbrvqcivcjowtneftstx:6yJ1minAJBDqupww@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  ssl: { rejectUnauthorized: false }
});
c.connect()
  .then(() => c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions'"))
  .then(res => console.log(res.rows.map(r => r.column_name)))
  .finally(() => c.end());
