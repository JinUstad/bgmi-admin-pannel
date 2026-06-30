const { Client } = require('pg');

const client = new Client({
  connectionString: "postgres://postgres.tbrvqcivcjowtneftstx:6yJ1minAJBDqupww@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    
    // Create the registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        full_name TEXT NOT NULL,
        bgmi_id TEXT NOT NULL,
        team_name TEXT,
        mobile_number TEXT NOT NULL,
        email TEXT,
        tournament_type TEXT,
        time_slot TEXT,
        message TEXT,
        cashfree_order_id TEXT,
        payment_status TEXT DEFAULT 'pending',
        upi_id TEXT
      );
    `);
    console.log('Created registrations table successfully');

    // Also force PostgREST to reload its schema cache
    await client.query(`NOTIFY pgrst, 'reload schema'`);
    console.log('Notified PostgREST to reload schema');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
