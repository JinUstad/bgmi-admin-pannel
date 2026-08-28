require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Bypass self-signed cert errors for Supabase local/remote instances when using connection string
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Testing RLS...");

  // Test Read
  const { data: readData, error: readError } = await supabase.from('active_game_config').select('*');
  console.log("Read config:", readError ? readError.message : "Success (got data: " + (readData && readData.length > 0) + ")");

  // Test Write
  const { data: writeData, error: writeError } = await supabase
    .from('active_game_config')
    .update({ updated_at: new Date() })
    .eq('id', 1)
    .select();
  
  if (writeError) {
    console.log("Write config (failed as expected):", writeError.message);
  } else if (writeData && writeData.length === 0) {
    console.log("Write config (failed as expected): RLS blocked the update (returned empty data)");
  } else {
    console.log("Write config (FAILED RLS AUDIT! Update went through):", writeData);
  }

}

testRLS().catch(console.error);
