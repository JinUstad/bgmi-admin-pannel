const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('settings')
    .select('registration_fee, tournament_categories_bg_url')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('ERROR:', JSON.stringify(error, null, 2));
    console.error('Details:', error.message, error.details, error.hint, error.code);
  } else {
    console.log('SUCCESS:', data);
  }
}

test();
