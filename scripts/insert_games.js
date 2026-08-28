require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function insertGames() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching categories...");
  const { data: categories, error: catError } = await supabase.from('game_categories').select('id, name, slug');
  
  if (catError) {
    console.error("Error fetching categories:", catError);
    return;
  }

  const battleRoyale = categories.find(c => c.slug === 'battle-royale');
  const fighting = categories.find(c => c.slug === 'fighting');

  if (!battleRoyale || !fighting) {
    console.error("Required categories not found!");
    return;
  }

  const gamesData = [
    {
      name: 'BGMI',
      category_id: battleRoyale.id,
      theme_identifier: 'bgmi',
      slug: 'bgmi',
      description: 'The ultimate battle royale experience tailored for India. Drop in, gear up, and fight to be the last one standing.',
      hero_heading: 'BATTLEGROUNDS MOBILE INDIA',
      hero_subheading: 'India Ka Battlegrounds. Experience the thrill of competitive esports.',
      hero_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      bg_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      game_primary_color: '#FF9900',
      game_secondary_color: '#E65C00',
      is_active: true,
      about_heading: 'Welcome to BGMI Esports',
      about_description: 'XYLO Esports brings you the most structured and rewarding BGMI tournaments in the country. From open qualifiers to massive prize pools, build your legacy here.',
      about_bg_image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
      tournaments_heading: 'BGMI Tournaments',
      tournaments_description: 'Register for upcoming squads, duos, and solo matches.',
      short_description: '100 players, 1 winner.',
      tagline: 'Winner Winner Chicken Dinner!',
      display_order: 1
    },
    {
      name: 'Free Fire MAX',
      category_id: battleRoyale.id,
      theme_identifier: 'free-fire',
      slug: 'free-fire-max',
      description: 'Experience premium Battle Royale gameplay. Fast-paced, intense, and highly competitive 10-minute matches.',
      hero_heading: 'FREE FIRE MAX',
      hero_subheading: 'Survival is just the beginning. Enter the MAX arena.',
      hero_image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2038&auto=format&fit=crop',
      bg_image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2038&auto=format&fit=crop',
      game_primary_color: '#FF6B00',
      game_secondary_color: '#FF4500',
      is_active: false,
      about_heading: 'The Free Fire MAX Arena',
      about_description: 'Dive into daily and weekly FF MAX scrims. Showcase your character skills and raw aiming ability to dominate the leaderboards.',
      about_bg_image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      tournaments_heading: 'Free Fire MAX Tournaments',
      tournaments_description: 'Join the daily cash cups and weekly majors.',
      short_description: 'Fast-paced Battle Royale.',
      tagline: 'Booyah!',
      display_order: 2
    },
    {
      name: 'Tekken 8',
      category_id: fighting.id,
      theme_identifier: 'tekken',
      slug: 'tekken-8',
      description: 'Fist meets fate. The legendary fighting game franchise returns with next-gen graphics and aggressive new mechanics.',
      hero_heading: 'TEKKEN 8',
      hero_subheading: 'The King of Iron Fist Tournament is back.',
      hero_image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      bg_image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      game_primary_color: '#C8102E',
      game_secondary_color: '#8A0B20',
      is_active: false,
      about_heading: 'Competitive Tekken 8',
      about_description: 'Step into the arena with XYLO Esports Tekken 8 competitive circuit. Experience the new Heat System in high-stakes 1v1 battles.',
      about_bg_image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2038&auto=format&fit=crop',
      tournaments_heading: 'Iron Fist Tournaments',
      tournaments_description: 'Prove your worth in our 1v1 bracket-style majors.',
      short_description: 'Aggressive 1v1 fighting.',
      tagline: 'Fist meets fate.',
      display_order: 1
    }
  ];

  console.log("Inserting games...");
  for (const game of gamesData) {
    const { data, error } = await supabase.from('games').insert([game]).select();
    if (error) {
      console.error(`Error inserting ${game.name}:`, error.message);
    } else {
      console.log(`Inserted game: ${game.name} (ID: ${data[0].id})`);
    }
  }

  console.log("Done adding games.");
}

insertGames().catch(console.error);
