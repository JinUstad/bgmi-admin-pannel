require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function setBGMIActive() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: bgmiGames, error: fetchError } = await supabase
    .from('games')
    .select('id, category_id')
    .eq('slug', 'bgmi')
    .not('category_id', 'is', null);

  if (fetchError || !bgmiGames || bgmiGames.length === 0) {
    console.error("Error fetching BGMI:", fetchError);
    return;
  }

  const bgmiGame = bgmiGames[0]; // pick the one that has a category_id

  const { error: activeError } = await supabase.rpc('activate_game_atomic', { new_game_id: bgmiGame.id });

  if (activeError) {
    console.error("Error setting BGMI as active:", activeError);
  } else {
    console.log("Successfully set BGMI as the active game!");
  }
}

setBGMIActive().catch(console.error);
