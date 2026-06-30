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
    
    // Create the admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Created admins table');

    // Insert the two admins
    const admins = [
      { email: 'abdulahad@gmail.com', password: 'ahad1234' },
      { email: 'gulm@gmail.com', password: 'gul1234' }
    ];

    for (const admin of admins) {
      await client.query(`
        INSERT INTO public.admins (email, password, role)
        VALUES ($1, $2, 'admin')
        ON CONFLICT (email) DO UPDATE SET password = $2;
      `, [admin.email, admin.password]);
      console.log(`Inserted/Updated admin: ${admin.email}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
