require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const crypto = require('crypto');

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error("Missing POSTGRES_URL in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Helper for SEO and Content
const gamesData = [
  {
    name: "BGMI",
    slug: "bgmi",
    category_slug: "battle-royale",
    game_primary_color: "#F2A900",
    game_secondary_color: "#2E4A32",
    game_accent_color: "#FF6B00",
    
    tagline: "India's Ultimate Battle Royale",
    short_description: "Drop into intense 100-player battles, survive the zone, and claim the Chicken Dinner in Battlegrounds Mobile India.",
    long_description: "Battlegrounds Mobile India (BGMI) offers the most thrilling multiplayer battle royale experience on mobile. Team up with your squad, strategize your drop, loot weapons, and outlast 99 other players in iconic maps like Erangel and Miramar. Will you be the last one standing?",
    
    hero_heading: "Dominate the Battlegrounds",
    hero_subheading: "Compete in daily BGMI scrims and mega tournaments for massive prize pools.",
    hero_paragraph: "Assemble your squad and prove your tactical superiority in India's most competitive BGMI tournaments. From fast-paced TDM clashes to full-scale squad survivals, XYLO Esports is your battleground.",
    hero_primary_cta: "Register for Next Scrim",
    hero_secondary_cta: "View Leaderboard",

    why_choose_us_heading: "Why Compete in BGMI on XYLO?",
    why_choose_us_description: "We provide the most professional and rewarding competitive experience for BGMI players.",
    why_choose_us_features: JSON.stringify([
      { title: "Daily Custom Rooms", description: "Regular T3, T2, and T1 scrims to practice and prove your skills." },
      { title: "Strict Anti-Cheat", description: "Zero tolerance for hackers. Pure skill-based matchmaking." },
      { title: "Instant Payouts", description: "Win a chicken dinner, get your prize money instantly via UPI." }
    ]),

    about_heading: "About BGMI Esports",
    about_subheading: "The Pinnacle of Mobile Gaming",
    about_paragraph: "BGMI isn't just a game; it's an emotion for millions of players. At XYLO Esports, we elevate that emotion into a professional competitive platform where talent is recognized and rewarded.",
    about_cta: "Join Our Discord",

    tournaments_category_heading: "BGMI Tournament Formats",
    tournaments_category_description: "Choose your battlefield. Whether you're a lone wolf or a coordinated squad, we have a tournament for you.",
    tournament_formats: JSON.stringify([
      { name: "Solo", description: "1v99. Pure survival. No teammates to rely on." },
      { name: "Duo", description: "Grab your best partner and take on the lobby." },
      { name: "Squad", description: "4-player tactical warfare. Communication is key." },
      { name: "TDM", description: "4v4 fast-paced action to test your pure gun skill." }
    ]),

    how_it_works_heading: "How to Join BGMI Tournaments",
    how_it_works_description: "Getting into the action is simple. Follow these steps to start your journey.",
    how_it_works_steps: JSON.stringify([
      { title: "Register", description: "Select your preferred slot and pay the entry fee." },
      { title: "Get Room ID", description: "Receive the Room ID & Password via WhatsApp 15 mins before start." },
      { title: "Play", description: "Drop in, execute your strategy, and survive." },
      { title: "Claim Prize", description: "Submit your screenshot if you win to get instant payout." }
    ]),

    cta_heading: "Ready for the Chicken Dinner?",
    cta_description: "Don't just play for fun. Play for glory and rewards.",
    cta_button_text: "Register Now",

    registration_heading: "Register for BGMI Tournament",
    registration_description: "Secure your slot now before it fills up. Spots are limited!",
    registration_instructions: "Fill in your in-game name (IGN) and character ID exactly as they appear in-game. Ensure your WhatsApp number is correct to receive the Room ID.",
    registration_requirements: JSON.stringify([
      "Level 30+ account required",
      "No emulators allowed",
      "Must have a valid UPI ID for prize claims"
    ]),
    registration_confirmation: "Your registration is confirmed. Prepare for battle!",

    tournament_page_heading: "BGMI Tournaments & Scrims",
    tournament_page_description: "View all upcoming matches, slots, and prize pools.",
    upcoming_battles_heading: "Upcoming BGMI Battles",
    daily_battle_heading: "Daily Scrims",
    faq_heading: "BGMI FAQ",
    faq_description: "Common questions about our BGMI tournaments.",

    blog_page_heading: "BGMI Strategies & News",
    blog_page_description: "Stay updated with the latest meta, weapon guides, and tournament recaps.",
    blog_introductory_text: "Master the game with insights from top players.",

    seo_meta_title: "BGMI Tournaments | XYLO Esports",
    seo_meta_description: "Join the biggest daily BGMI tournaments and scrims in India. Win cash prizes and show off your skills.",
    seo_og_title: "Play BGMI on XYLO Esports",
    seo_og_description: "Register for BGMI custom rooms, T1/T2/T3 scrims, and win massive prize pools.",

    game_faqs: JSON.stringify([
      { q: "Can I use an iPad?", a: "iPads are allowed in specific tournaments but must be declared." },
      { q: "What if someone hacks?", a: "Report them immediately with video proof. We will ban them and re-evaluate the match." }
    ])
  },
  {
    name: "Free Fire MAX",
    slug: "free-fire",
    category_slug: "battle-royale",
    game_primary_color: "#FFA500",
    game_secondary_color: "#8B0000",
    game_accent_color: "#FF4500",
    
    tagline: "Premium Battle Royale Experience",
    short_description: "Experience Free Fire with ultra HD graphics, breathtaking effects, and smoother gameplay.",
    long_description: "Free Fire MAX is designed exclusively to deliver premium gameplay in a Battle Royale. Enjoy a variety of exciting game modes with all Free Fire players via exclusive Firelink technology.",
    
    hero_heading: "Booyah Awaits",
    hero_subheading: "Join daily Clash Squads and BR tournaments to win epic prizes.",
    hero_paragraph: "Unleash your character abilities and dominate the Bermuda map. Fast-paced, action-packed 10-minute survival matches.",
    hero_primary_cta: "Get Your Slot",
    hero_secondary_cta: "View Matches",

    why_choose_us_heading: "Why Free Fire on XYLO?",
    why_choose_us_description: "We host the most intense fast-paced tournaments.",
    why_choose_us_features: JSON.stringify([
      { title: "Clash Squads", description: "Intense 4v4 custom rooms." },
      { title: "Verified Players", description: "No guest accounts, fair matchmaking." },
      { title: "Fast Payouts", description: "Win the Booyah, get paid the same day." }
    ]),

    about_heading: "About Free Fire MAX Esports",
    about_subheading: "Fast, Furious, Tactical",
    about_paragraph: "With unique character skills and pet abilities, Free Fire MAX brings a strategic depth to Battle Royale unlike any other.",
    about_cta: "Learn More",

    tournaments_category_heading: "Free Fire Formats",
    tournaments_category_description: "From classic BR to intense Clash Squads.",
    tournament_formats: JSON.stringify([
      { name: "Battle Royale", description: "50 players. 10 minutes. 1 winner." },
      { name: "Clash Squad", description: "4v4 round-based tactical battles." }
    ]),

    how_it_works_heading: "How to Join Free Fire Tournaments",
    how_it_works_description: "Ready to drop in? Follow these simple steps.",
    how_it_works_steps: JSON.stringify([
      { title: "Sign Up", description: "Register with your UID." },
      { title: "Get Password", description: "Custom room details sent before the match." },
      { title: "Get Booyah", description: "Win the match." }
    ]),

    cta_heading: "Ready for Booyah?",
    cta_description: "Join the fastest growing Free Fire community.",
    cta_button_text: "Register Now",

    registration_heading: "Register for Free Fire",
    registration_description: "Enter your details to secure your spot.",
    registration_instructions: "Provide your exact in-game UID.",
    registration_requirements: JSON.stringify([
      "Level 20+ Account",
      "No modified APKs"
    ]),
    registration_confirmation: "Registration successful. Booyah!",

    tournament_page_heading: "Free Fire Tournaments",
    tournament_page_description: "Upcoming BR and CS matches.",
    upcoming_battles_heading: "Upcoming Matches",
    daily_battle_heading: "Daily Customs",
    faq_heading: "Free Fire FAQ",
    faq_description: "Everything you need to know.",

    blog_page_heading: "Free Fire Tips",
    blog_page_description: "Character combinations and weapon stats.",
    blog_introductory_text: "Master the Gloo Wall.",

    seo_meta_title: "Free Fire Tournaments | XYLO Esports",
    seo_meta_description: "Play Free Fire MAX Clash Squad and BR tournaments.",
    seo_og_title: "Free Fire Esports on XYLO",
    seo_og_description: "Win cash prizes playing Free Fire.",

    game_faqs: JSON.stringify([
      { q: "Are character skills enabled?", a: "Yes, unless specifically stated as a 'No Skills' custom room." }
    ])
  },
  {
    name: "PUBG Mobile",
    slug: "pubg",
    category_slug: "battle-royale",
    game_primary_color: "#F5C71A",
    game_secondary_color: "#1F2326",
    game_accent_color: "#FF0000",
    
    tagline: "The Original Battle Royale",
    short_description: "The global phenomenon that started it all. Drop in, gear up, and outlast the competition.",
    long_description: "PUBG Mobile delivers the most authentic battle royale experience on your phone. Participate in massive 100-player global tournaments.",
    
    hero_heading: "Conquer the Global Battleground",
    hero_subheading: "Compete against the best international squads.",
    hero_paragraph: "The classic experience. Intense firefights, strategic rotations, and pure survival.",
    hero_primary_cta: "Enter Global Scrims",
    hero_secondary_cta: "View Standings",

    why_choose_us_heading: "Why PUBG on XYLO?",
    why_choose_us_description: "Global standards, premium tournaments.",
    why_choose_us_features: JSON.stringify([
      { title: "Global Lobbies", description: "Play against international teams." },
      { title: "High Tickrate Servers", description: "Smooth gameplay for competitive matches." }
    ]),

    about_heading: "About PUBG Mobile",
    about_subheading: "The Standard of Mobile BR",
    about_paragraph: "PUBG Mobile set the bar for mobile gaming. We honor that legacy with top-tier tournaments.",
    about_cta: "Join the Global Community",

    tournaments_category_heading: "PUBG Formats",
    tournaments_category_description: "Classic formats for the classic game.",
    tournament_formats: JSON.stringify([
      { name: "Squad", description: "The standard competitive format." }
    ]),

    how_it_works_heading: "How to Join PUBG Tournaments",
    how_it_works_description: "Enter the global arena.",
    how_it_works_steps: JSON.stringify([
      { title: "Register", description: "Book your slot." },
      { title: "Room Details", description: "Get global room ID." }
    ]),

    cta_heading: "Drop into Erangel",
    cta_description: "The plane is departing.",
    cta_button_text: "Register Now",

    registration_heading: "PUBG Registration",
    registration_description: "Global ID required.",
    registration_instructions: "Ensure your PUBG Global ID is correct.",
    registration_requirements: JSON.stringify([
      "Global Version only"
    ]),
    registration_confirmation: "Confirmed.",

    tournament_page_heading: "PUBG Tournaments",
    tournament_page_description: "Global Scrims.",
    upcoming_battles_heading: "Upcoming Scrims",
    daily_battle_heading: "Daily Customs",
    faq_heading: "PUBG FAQ",
    faq_description: "Common questions.",

    blog_page_heading: "PUBG Global News",
    blog_page_description: "PMGC updates and meta shifts.",
    blog_introductory_text: "Stay informed.",

    seo_meta_title: "PUBG Mobile Global Tournaments",
    seo_meta_description: "Play PUBG Mobile global scrims.",
    seo_og_title: "PUBG Mobile on XYLO",
    seo_og_description: "Win global tournaments.",

    game_faqs: JSON.stringify([
      { q: "Is this for BGMI?", a: "No, this is for the global PUBG Mobile version." }
    ])
  },
  {
    name: "Tekken 8",
    slug: "tekken-8",
    category_slug: "fighting",
    game_primary_color: "#D81B60",
    game_secondary_color: "#1A1A24",
    game_accent_color: "#FF3366",
    
    tagline: "Fist Meets Fate",
    short_description: "The next generation of the King of Iron Fist Tournament featuring the new Heat System.",
    long_description: "Tekken 8 pushes the boundaries of fighting games with next-gen graphics and the aggressive new Heat System. Master your character and crush your opponents.",
    
    hero_heading: "Get Ready for the Next Battle",
    hero_subheading: "Compete in intense 1v1 Tekken 8 tournaments.",
    hero_paragraph: "Showcase your combos, utilize the Heat System, and claim the title of King of Iron Fist.",
    hero_primary_cta: "Enter the Arena",
    hero_secondary_cta: "View Brackets",

    why_choose_us_heading: "Why Tekken 8 on XYLO?",
    why_choose_us_description: "We host the most competitive fighting game brackets.",
    why_choose_us_features: JSON.stringify([
      { title: "Double Elimination", description: "Fair bracket formats." },
      { title: "Wired Connections Only", description: "Lag-free competitive matches." }
    ]),

    about_heading: "About Tekken 8",
    about_subheading: "Aggressive Next-Gen Fighting",
    about_paragraph: "The Mishima saga continues. Prove your worth in the ultimate fighting arena.",
    about_cta: "Learn the Matchups",

    tournaments_category_heading: "Tekken 8 Formats",
    tournaments_category_description: "1v1 pure skill.",
    tournament_formats: JSON.stringify([
      { name: "1v1", description: "Standard tournament rules. FT2/FT3." }
    ]),

    how_it_works_heading: "How to Join Tekken 8 Tournaments",
    how_it_works_description: "Prepare to fight.",
    how_it_works_steps: JSON.stringify([
      { title: "Register", description: "Sign up and link your Steam/PSN/Xbox ID." },
      { title: "Check-in", description: "Check in on Discord 30 mins prior." },
      { title: "Fight", description: "Find your opponent in the bracket." }
    ]),

    cta_heading: "Ready to Fight?",
    cta_description: "The King of Iron Fist Tournament awaits.",
    cta_button_text: "Register Now",

    registration_heading: "Tekken 8 Registration",
    registration_description: "Secure your spot in the bracket.",
    registration_instructions: "Provide your precise gaming ID.",
    registration_requirements: JSON.stringify([
      "Wired connection required",
      "Crossplay enabled"
    ]),
    registration_confirmation: "You are in the bracket.",

    tournament_page_heading: "Tekken 8 Brackets",
    tournament_page_description: "Follow the tournament flow.",
    upcoming_battles_heading: "Upcoming Tournaments",
    daily_battle_heading: "Weekly Locals",
    faq_heading: "Tekken 8 FAQ",
    faq_description: "Tournament rules.",

    blog_page_heading: "Tekken 8 Tech & Frame Data",
    blog_page_description: "Learn the punishes.",
    blog_introductory_text: "Get better at Tekken 8.",

    seo_meta_title: "Tekken 8 Tournaments | XYLO",
    seo_meta_description: "Compete in online Tekken 8 tournaments.",
    seo_og_title: "Tekken 8 on XYLO",
    seo_og_description: "Join the Iron Fist Tournament.",

    game_faqs: JSON.stringify([
      { q: "Is Wi-Fi allowed?", a: "No, a wired ethernet connection is strictly required for fighting games." }
    ])
  },
  {
    name: "Tekken 7",
    slug: "tekken-7",
    category_slug: "fighting",
    game_primary_color: "#B22222",
    game_secondary_color: "#000000",
    game_accent_color: "#FF0000",
    
    tagline: "The Best Fights Are Personal",
    short_description: "The legendary fighting game that defined a generation of competitive play.",
    long_description: "Tekken 7 remains a staple in the fighting game community. With its massive roster and refined mechanics, the competition is fiercer than ever.",
    
    hero_heading: "Legacy of Iron Fist",
    hero_subheading: "Classic Tekken 7 Tournaments.",
    hero_paragraph: "Relive the glory days or continue your reign in our Tekken 7 legacy tournaments.",
    hero_primary_cta: "Join Bracket",
    hero_secondary_cta: "View Past Winners",

    why_choose_us_heading: "Why Tekken 7?",
    why_choose_us_description: "Because legends never die.",
    why_choose_us_features: JSON.stringify([
      { title: "Legacy Support", description: "We still host massive T7 brackets." }
    ]),

    about_heading: "About Tekken 7",
    about_subheading: "A Modern Classic",
    about_paragraph: "The game that brought Tekken back to the forefront of esports.",
    about_cta: "Join Community",

    tournaments_category_heading: "Tekken 7 Formats",
    tournaments_category_description: "Standard 1v1.",
    tournament_formats: JSON.stringify([
      { name: "1v1", description: "Best of 3." }
    ]),

    how_it_works_heading: "Joining T7",
    how_it_works_description: "Simple bracket format.",
    how_it_works_steps: JSON.stringify([
      { title: "Register", description: "Sign up." }
    ]),

    cta_heading: "Fight!",
    cta_description: "Prove you still have it.",
    cta_button_text: "Register Now",

    registration_heading: "T7 Registration",
    registration_description: "Join the legacy bracket.",
    registration_instructions: "Steam ID required.",
    registration_requirements: JSON.stringify(["Steam only"]),
    registration_confirmation: "Confirmed.",

    tournament_page_heading: "T7 Brackets",
    tournament_page_description: "Legacy tournaments.",
    upcoming_battles_heading: "Upcoming",
    daily_battle_heading: "Weekly",
    faq_heading: "T7 FAQ",
    faq_description: "Rules.",

    blog_page_heading: "T7 Archives",
    blog_page_description: "Classic match analysis.",
    blog_introductory_text: "Remember the greats.",

    seo_meta_title: "Tekken 7 Tournaments",
    seo_meta_description: "Play Tekken 7.",
    seo_og_title: "Tekken 7",
    seo_og_description: "T7 Brackets.",

    game_faqs: JSON.stringify([
      { q: "Is this PC only?", a: "Yes, currently our T7 brackets are Steam only." }
    ])
  },
  {
    name: "Tekken 5",
    slug: "tekken-5",
    category_slug: "fighting",
    game_primary_color: "#4682B4",
    game_secondary_color: "#0B192C",
    game_accent_color: "#87CEEB",
    
    tagline: "A Retro Masterpiece",
    short_description: "The classic PS2 era fighting game.",
    long_description: "Return to the roots of modern Tekken with our retro Tekken 5 tournaments, played via emulation with rollback netcode.",
    
    hero_heading: "Retro Throwback",
    hero_subheading: "Tekken 5 Online Tournaments.",
    hero_paragraph: "Experience the speed and raw damage of Tekken 5 in our specialized retro brackets.",
    hero_primary_cta: "Join Retro Bracket",
    hero_secondary_cta: "Learn How to Play Online",

    why_choose_us_heading: "Why Tekken 5?",
    why_choose_us_description: "Nostalgia meets competition.",
    why_choose_us_features: JSON.stringify([
      { title: "Rollback Netcode", description: "Smooth online play via Fightcade/PCSX2." }
    ]),

    about_heading: "About Tekken 5",
    about_subheading: "The Golden Era",
    about_paragraph: "T5 revived the franchise.",
    about_cta: "Join Retro Discord",

    tournaments_category_heading: "T5 Formats",
    tournaments_category_description: "Retro 1v1.",
    tournament_formats: JSON.stringify([
      { name: "1v1", description: "Best of 3." }
    ]),

    how_it_works_heading: "How to Play",
    how_it_works_description: "Requires emulator setup.",
    how_it_works_steps: JSON.stringify([
      { title: "Setup", description: "Configure your emulator." }
    ]),

    cta_heading: "Return to the King of Iron Fist",
    cta_description: "Retro glory.",
    cta_button_text: "Register Now",

    registration_heading: "T5 Registration",
    registration_description: "Join the retro bracket.",
    registration_instructions: "Emulator ID required.",
    registration_requirements: JSON.stringify(["Emulator setup required"]),
    registration_confirmation: "Confirmed.",

    tournament_page_heading: "T5 Brackets",
    tournament_page_description: "Retro tournaments.",
    upcoming_battles_heading: "Upcoming",
    daily_battle_heading: "Weekly",
    faq_heading: "T5 FAQ",
    faq_description: "Rules.",

    blog_page_heading: "T5 Archives",
    blog_page_description: "Retro analysis.",
    blog_introductory_text: "Remember the greats.",

    seo_meta_title: "Tekken 5 Tournaments",
    seo_meta_description: "Play Tekken 5 online.",
    seo_og_title: "Tekken 5",
    seo_og_description: "T5 Brackets.",

    game_faqs: JSON.stringify([
      { q: "How do I play T5 online?", a: "We provide a guide for setting up PCSX2 with rollback netcode in our Discord." }
    ])
  },
  {
    name: "Tekken Tag Tournament",
    slug: "tekken-tag",
    category_slug: "fighting",
    game_primary_color: "#228B22",
    game_secondary_color: "#003300",
    game_accent_color: "#32CD32",
    
    tagline: "Tag Team Action",
    short_description: "The classic 2v2 bowling-alley favorite.",
    long_description: "The original Tekken Tag Tournament. Crazy juggles, insane damage, and pure arcade nostalgia.",
    
    hero_heading: "Tag In",
    hero_subheading: "TTT1 Online Tournaments.",
    hero_paragraph: "Master two characters and conquer the classic tag bracket.",
    hero_primary_cta: "Join Bracket",
    hero_secondary_cta: "View Info",

    why_choose_us_heading: "Why TTT1?",
    why_choose_us_description: "Arcade classic.",
    why_choose_us_features: JSON.stringify([
      { title: "MAME", description: "Played on arcade emulator." }
    ]),

    about_heading: "About TTT1",
    about_subheading: "Arcade Legend",
    about_paragraph: "The game that consumed countless quarters.",
    about_cta: "Join Discord",

    tournaments_category_heading: "TTT1 Formats",
    tournaments_category_description: "2v2 Tag.",
    tournament_formats: JSON.stringify([
      { name: "Tag Team", description: "2 characters each." }
    ]),

    how_it_works_heading: "How to Play",
    how_it_works_description: "MAME setup.",
    how_it_works_steps: JSON.stringify([
      { title: "Setup", description: "Configure MAME." }
    ]),

    cta_heading: "Ready?",
    cta_description: "Tag in.",
    cta_button_text: "Register Now",

    registration_heading: "TTT1 Registration",
    registration_description: "Join the retro bracket.",
    registration_instructions: "Emulator ID required.",
    registration_requirements: JSON.stringify(["MAME required"]),
    registration_confirmation: "Confirmed.",

    tournament_page_heading: "TTT1 Brackets",
    tournament_page_description: "Retro tournaments.",
    upcoming_battles_heading: "Upcoming",
    daily_battle_heading: "Weekly",
    faq_heading: "TTT1 FAQ",
    faq_description: "Rules.",

    blog_page_heading: "TTT1 Archives",
    blog_page_description: "Retro analysis.",
    blog_introductory_text: "Remember the greats.",

    seo_meta_title: "Tekken Tag Tournaments",
    seo_meta_description: "Play TTT1 online.",
    seo_og_title: "Tekken Tag",
    seo_og_description: "TTT1 Brackets.",

    game_faqs: JSON.stringify([
      { q: "Which version?", a: "Arcade version via emulator." }
    ])
  }
];

// Categories
const categoriesData = [
  {
    name: "Battle Royale",
    slug: "battle-royale",
    emoji: "🪂",
    primary_color: "#F2A900",
    secondary_color: "#2E4A32",
    accent_color: "#FF6B00",
    color_background: "#0A0A0A",
    color_text: "#FFFFFF",
    color_muted: "#888888",
    color_surface: "#111111",
    color_card: "#1C1C1C",
    color_border: "#333333",
    color_glow: "#FF0000",
    gradient_start: "#FF0000",
    gradient_end: "#000000",
    overall_feel: "tactical"
  },
  {
    name: "Fighting",
    slug: "fighting",
    emoji: "🥊",
    primary_color: "#D81B60",
    secondary_color: "#1A1A24",
    accent_color: "#FF3366",
    color_background: "#050510",
    color_text: "#FFFFFF",
    color_muted: "#888888",
    color_surface: "#11111A",
    color_card: "#181825",
    color_border: "#2A2A40",
    color_glow: "#FF3366",
    gradient_start: "#FF3366",
    gradient_end: "#050510",
    overall_feel: "aggressive"
  }
];

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    // 1. Insert/Update Categories
    const catMap = {};
    for (const cat of categoriesData) {
      const { rows } = await client.query(`SELECT id FROM game_categories WHERE slug = $1`, [cat.slug]);
      let catId;
      if (rows.length > 0) {
        catId = rows[0].id;
        await client.query(`
          UPDATE game_categories SET
            name = $1, emoji = $2, primary_color = $3, secondary_color = $4, accent_color = $5,
            color_background = $6, color_text = $7, color_muted = $8, color_surface = $9, color_card = $10,
            color_border = $11, color_glow = $12, gradient_start = $13, gradient_end = $14, overall_feel = $15
          WHERE id = $16
        `, [
          cat.name, cat.emoji, cat.primary_color, cat.secondary_color, cat.accent_color,
          cat.color_background, cat.color_text, cat.color_muted, cat.color_surface, cat.color_card,
          cat.color_border, cat.color_glow, cat.gradient_start, cat.gradient_end, cat.overall_feel,
          catId
        ]);
        console.log(`Updated category: ${cat.name}`);
      } else {
        catId = crypto.randomUUID();
        await client.query(`
          INSERT INTO game_categories (
            id, name, slug, emoji, primary_color, secondary_color, accent_color,
            color_background, color_text, color_muted, color_surface, color_card,
            color_border, color_glow, gradient_start, gradient_end, overall_feel, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
        `, [
          catId, cat.name, cat.slug, cat.emoji, cat.primary_color, cat.secondary_color, cat.accent_color,
          cat.color_background, cat.color_text, cat.color_muted, cat.color_surface, cat.color_card,
          cat.color_border, cat.color_glow, cat.gradient_start, cat.gradient_end, cat.overall_feel
        ]);
        console.log(`Inserted category: ${cat.name}`);
      }
      catMap[cat.slug] = catId;
    }

    // 2. Insert/Update Games
    let bgmiId = null;
    for (const game of gamesData) {
      const { rows } = await client.query(`SELECT id FROM games WHERE slug = $1`, [game.slug]);
      const categoryId = catMap[game.category_slug];
      
      const updateFields = [
        "name", "theme_identifier", "category_id", "series_id", "game_primary_color", "game_secondary_color", "game_accent_color",
        "tagline", "short_description", "long_description",
        "hero_heading", "hero_subheading", "hero_paragraph", "hero_primary_cta", "hero_secondary_cta",
        "why_choose_us_heading", "why_choose_us_description", "why_choose_us_features",
        "about_heading", "about_subheading", "about_paragraph", "about_cta",
        "tournaments_category_heading", "tournaments_category_description", "tournament_formats",
        "how_it_works_heading", "how_it_works_description", "how_it_works_steps",
        "cta_heading", "cta_description", "cta_button_text",
        "registration_heading", "registration_description", "registration_instructions", "registration_requirements", "registration_confirmation",
        "tournament_page_heading", "tournament_page_description", "upcoming_battles_heading", "daily_battle_heading", "faq_heading", "faq_description",
        "blog_page_heading", "blog_page_description", "blog_introductory_text",
        "seo_meta_title", "seo_meta_description", "seo_og_title", "seo_og_description",
        "game_faqs"
      ];
      
      const values = [
        game.name, game.slug, categoryId, categoryId, game.game_primary_color, game.game_secondary_color, game.game_accent_color,
        game.tagline, game.short_description, game.long_description,
        game.hero_heading, game.hero_subheading, game.hero_paragraph, game.hero_primary_cta, game.hero_secondary_cta,
        game.why_choose_us_heading, game.why_choose_us_description, game.why_choose_us_features,
        game.about_heading, game.about_subheading, game.about_paragraph, game.about_cta,
        game.tournaments_category_heading, game.tournaments_category_description, game.tournament_formats,
        game.how_it_works_heading, game.how_it_works_description, game.how_it_works_steps,
        game.cta_heading, game.cta_description, game.cta_button_text,
        game.registration_heading, game.registration_description, game.registration_instructions, game.registration_requirements, game.registration_confirmation,
        game.tournament_page_heading, game.tournament_page_description, game.upcoming_battles_heading, game.daily_battle_heading, game.faq_heading, game.faq_description,
        game.blog_page_heading, game.blog_page_description, game.blog_introductory_text,
        game.seo_meta_title, game.seo_meta_description, game.seo_og_title, game.seo_og_description,
        game.game_faqs
      ];

      let gameId;
      if (rows.length > 0) {
        gameId = rows[0].id;
        
        const setClauses = updateFields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        
        await client.query(`
          UPDATE games SET ${setClauses} WHERE id = $${values.length + 1}
        `, [...values, gameId]);
        
        console.log(`Updated game: ${game.name}`);
      } else {
        gameId = crypto.randomUUID();
        
        const insertFields = ["id", "slug", "is_active", ...updateFields];
        const placeholders = insertFields.map((_, i) => `$${i + 1}`).join(', ');
        
        await client.query(`
          INSERT INTO games (${insertFields.join(', ')})
          VALUES (${placeholders})
        `, [gameId, game.slug, false, ...values]);
        
        console.log(`Inserted game: ${game.name}`);
      }

      if (game.slug === 'bgmi') {
        bgmiId = gameId;
      }
    }

    // Ensure BGMI is the active game
    if (bgmiId) {
      const { rows: configRows } = await client.query(`SELECT id FROM active_game_config WHERE id = 1`);
      if (configRows.length > 0) {
        await client.query(`UPDATE active_game_config SET active_game_id = $1 WHERE id = 1`, [bgmiId]);
      } else {
        await client.query(`INSERT INTO active_game_config (id, active_game_id) VALUES (1, $1)`, [bgmiId]);
      }
      await client.query(`UPDATE games SET is_active = false`);
      await client.query(`UPDATE games SET is_active = true WHERE id = $1`, [bgmiId]);
      console.log("Set BGMI as the active game.");
    }

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.end();
  }
}

run();
