const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // wait, admin uses anon key? Yes, the dashboard uses anon key but relies on active session if there is one. 

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  // Get a game id
  const { data: games } = await supabase.from('games').select('id').limit(1);
  if (!games || games.length === 0) {
    console.log("No games found.");
    return;
  }
  const gameId = games[0].id;
  console.log("Updating game:", gameId);

  // Try to update it
  const { data, error } = await supabase
    .from('games')
    .update({ show_tournament_categories: false })
    .eq('id', gameId)
    .select("*, game_categories!games_category_id_fkey(*)");
    // not using .single() so we can see if it returns []

  console.log("Result:", data, error);
}

testUpdate();
