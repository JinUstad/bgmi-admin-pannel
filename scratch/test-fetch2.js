require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  console.log('--- Registrations ---');
  let res = await supabase.from('registrations').select('*');
  console.log(res.data);
  console.log('--- Matches ---');
  res = await supabase.from('matches').select('*');
  console.log(res.data);
  console.log('--- Team Matches ---');
  res = await supabase.from('team_matches').select('*');
  console.log(res.data);
}
run();
