const fs = require('fs');
const env = fs.readFileSync('d:/myWork/bgmi/bgmi-admin-pannel/.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  return acc;
}, {});
process.env = { ...process.env, ...env };
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const bgmiKeep = '2d82d162-53c4-45f1-85c3-df36b531b942'; // Battlegrounds Mobile India
  const bgmiDel1 = '8b771a85-d232-4d82-b8df-0a94559d9cb0';
  const bgmiDel2 = '8a559adc-fc7b-4682-a858-7ce6593038db';

  // For Tekken 8, let's just delete all 3 and I'll re-seed it so we're sure it's perfect, or I can just delete two. 
  // Let's delete the first two: b777dc24 and c3cf61e9
  const tekkenDel1 = 'b777dc24-3ac7-4cd4-80a8-d19d260e31db';
  const tekkenDel2 = 'c3cf61e9-9730-4d64-a678-02a7f8b2466d';

  const toDelete = [bgmiDel1, bgmiDel2, tekkenDel1, tekkenDel2];
  console.log('Deleting duplicate games...');
  await supabase.from('games').delete().in('id', toDelete);

  console.log('Updating active_game_config to the new BGMI game...');
  await supabase.from('active_game_config').upsert({ id: 1, active_game_id: bgmiKeep });

  const { data: games } = await supabase.from('games').select('id, name, slug').order('name');
  console.log('FINAL GAMES:', games);
}
run();
