const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixStorageRLS() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', '');
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Fixing RLS policies for storage.objects...');
    
    // First, make sure the 'images' bucket exists just in case
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('images', 'images', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);

    // Add permissive policies for storage.objects for the 'images' bucket
    await pool.query(`
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      DROP POLICY IF EXISTS "Enable all access for images" ON storage.objects;
      
      CREATE POLICY "Enable all access for images" 
      ON storage.objects FOR ALL 
      USING (bucket_id = 'images' OR bucket_id = 'public-assets')
      WITH CHECK (bucket_id = 'images' OR bucket_id = 'public-assets');
    `);

    console.log('Successfully enabled public access for images bucket.');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await pool.end();
  }
}

fixStorageRLS();
