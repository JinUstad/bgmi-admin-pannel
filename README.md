# XYLO Esports Platform 🎮 - Master Documentation

Welcome to the **XYLO Esports** ecosystem repository. This platform is a next-generation competitive gaming ecosystem engineered to host, manage, and broadcast elite esports tournaments. The project is separated into two primary codebases that communicate via a unified Supabase PostgreSQL backend:
1. **Public-Facing Web App (`bgmi-web`)**: The premium, glassmorphism-themed portal for gamers to discover tournaments, register, and track their stats.
2. **Secure Admin Command Center (`bgmi-admin-pannel`)**: The master control dashboard for platform operators to govern every single aspect of the platform.

---

## 🌟 Our Motto & Vision
**"Bridging the Gap Between Casual Play and Professional Esports."**

Our motto is simple: Every gamer deserves a stage to showcase their tactical brilliance and reflexes. We aim to build a foundation where undiscovered talent can rise, earn recognition, and transition into professional gaming careers through highly competitive, accessible, and high-stakes leagues. We believe in **Fair Play, Instant Payouts, and Absolute Transparency.**

---

## ⚙️ How The System Works: The Dynamic Game Engine

The most powerful feature of XYLO Esports is its **Dynamic Game-Based Theming Engine**. Instead of hardcoding the platform to a single game (like BGMI), the system is built on a dynamic architecture that can pivot to any game instantly.

### How it works technically:
1. **The Database:** In Supabase, we have a `games` table containing rows for each game (e.g., Free Fire, Tekken Tag, BGMI). Each row holds game-specific metadata: `hero_image_url`, `hero_heading`, `about_heading`, `about_description`, `about_character_image_url`, etc.
2. **The Active Toggle:** There is a secondary table called `active_game_config` that stores a single row pointing to the ID of the currently "Active" game.
3. **The Admin Switch:** When an admin goes to the **Games** tab in the admin panel and toggles a game to "Active", a script updates the `active_game_config` table.
4. **The Frontend Sync:** The public web app uses a global React Context API (`ThemeProvider`). It constantly listens/fetches the `active_game_config`. When it detects a change, it pulls all the metadata for the new active game and globally re-renders the UI.
5. **The Result:** Within milliseconds, the entire public platform transforms. If the admin switches from *Free Fire* to *Tekken Tag*, the Home page hero cinematic changes to fighting visuals, the "About Us" lore changes from survival to fighting tournaments, and the tournament brackets switch to the new game's format.

---

## 💻 Complete Module Breakdown (Admin Panel)

The Command Center (`bgmi-admin-pannel`) is the nervous system of the platform. Here is every detail of what it does:

### 1. Dashboard Overview (`/dashboard`)
- **Real-time Analytics:** Displays crucial KPIs including total registered users, total revenue generated, active tournament count, and pending payouts.
- **Recent Activity:** A feed showing the latest user signups and recent tournament registrations.

### 2. Games Manager (`/dashboard/games`)
- **Add/Edit Games:** Admins can add an unlimited number of games to the platform. 
- **Asset Uploads:** Upload 4K cinematic assets for the Hero Banner, About Page, and specific character cutouts.
- **Lore & Content Writing:** Text areas to write compelling `hero_subheading`, `about_description`, and `tournaments_description` specific to that game.
- **The Global Toggle:** A visual switch that dictates which game is currently controlling the public frontend.

### 3. Tournament Brackets Manager (`/dashboard/brackets`)
- **Visual Bracket Builder:** A fully interactive UI to design the progression hierarchy of a tournament.
- **Round Management:** Add or delete custom rounds (e.g., "Quarter Finals", "Semi Finals", "Grand Finals").
- **Match-up Assignment:** Add multiple matches per round. Input "Team 1" vs "Team 2".
- **Winner Declaration:** A dropdown for every match allows the admin to declare the winner. This selection instantly feeds into the public website so players can see who advanced.

### 4. User Management (`/dashboard/users`)
- **Player Database:** A complete directory of every user who has signed up.
- **Account Controls:** Admins can view player stats, suspend accounts for violating fair play policies (like using emulators or hacks), and manually verify player details.

### 5. Payments & Revenue (`/dashboard/payments`)
- **Transaction Ledger:** A master list of all incoming entry fees and outgoing prize pool payments.
- **Verification Workflow:** Admins review submitted UPI/Bank transaction IDs from users and manually mark them as "Verified" or "Rejected".
- **Payouts:** Track which winners have received their prize money to ensure our "Instant Payouts within 24 hours" promise is kept.

### 6. Upcoming Matches (`/dashboard/upcoming-tournament`)
- **Tournament Scheduler:** Create new daily scrims or mega tournaments.
- **Match Variables:** Define the map (e.g., Erangel, Miramar), Match Mode (Solo, Duo, Squad, TDM), Prize Pool breakdown (1st, 2nd, 3rd place), and Entry Fee.
- **Time Slots:** Define exactly when the rooms open and close.
- **Room Details:** A secure portal to input the Custom Room ID and Password, which is distributed to verified players 15 minutes before match time.

### 7. Live Streaming (`/dashboard/live-stream`)
- **Broadcast Integration:** Admins can paste a YouTube or Twitch embed URL. This link instantly goes live on the public website's "Past & Live Streams" section, allowing audiences to watch the tournaments directly on our platform.

### 8. Global Settings (`/dashboard/settings`)
- **Platform Configuration:** Edit contact emails, support phone numbers, Discord invite links, and WhatsApp community links.
- **SEO & Policies:** Update the Terms of Service, Privacy Policy, and basic SEO meta descriptions for the platform.

---

## 🌐 Complete Module Breakdown (Public Web App)

The Player Portal (`bgmi-web`) is what the community sees. It is heavily animated using Framer Motion, GSAP, and Lottie to create a premium, immersive experience.

### 1. The Home Page (`/`)
- **Cinematic Hero Section:** Greets the user with a massive 4K background, animated laser sights, screen-shake impact effects, and the dynamic title of the active game.
- **Live Stats Bar:** Shows current active players, prizes awarded, and daily scrim count.
- **Upcoming Tournament Banner:** Highlights the next major event with a countdown and direct call-to-action to register.
- **Live & Past Broadcasts:** A theater-mode section to watch live streams of tournaments directly on the page.
- **Game Expo & Categories:** Showcases the diversity of games supported (Fighting, Battle Royale) to tease future tournaments.
- **Interactive Timeline:** A scroll-driven animation detailing the history and milestones of XYLO Esports.

### 2. About Us (`/about`)
- **Mission & Vision:** Details our motto and dedication to fair play.
- **Dynamic Lore:** The entire page content, including the floating 3D character image on the right, changes based on the active game.
- **Features Grid:** Explains our core tenets: Massive Prize Pools, Fair Play Guaranteed (Anti-cheat), Instant Payouts, and a Vibrant Community.

### 3. Tournaments Hub (`/tournaments`)
- **Animated Prize Showcase:** A 3D tilt-effect card detailing the Grand Prize and Entry Fee for the current active tournament.
- **Time Table Schedule:** A clean grid showing exactly when matches happen and on what maps.
- **Registered Teams Roster:** A live feed of verified squads. As soon as an admin verifies a payment, the squad's name appears here publicly.
- **The Interactive Bracket:** Rendered directly below the teams, this visualizes the tournament hierarchy from the admin panel, allowing players to trace the exact path to the finals.
- **Match Listings & Filters:** Filter tournaments by All, Solo, Duo, or Squad. Displays cards with deep details and entry conditions.
- **FAQ:** An accordion-style section answering common questions (e.g., "What if the match disconnects?").

### 4. Registration Flow (`/registration`)
- **Player Onboarding:** A seamless, multi-step form to register for a tournament.
- **Team Details:** Inputs for In-Game Name (IGN), Character ID, and Teammate details (for Duo/Squad).
- **Payment Gateway:** Displays the platform's UPI QR Code or Bank Details. The user uploads their transaction screenshot and Reference ID.
- **Status Tracking:** The registration goes into a "Pending" state until the admin reviews it. Once verified, the player receives their Room ID in their dashboard.

### 5. Authentication & User Dashboard
- **Secure Auth:** Handled via Supabase Auth (Email/Password & OAuth).
- **Player Profile:** Users can update their avatars and default in-game IDs.
- **My Tournaments:** A historical ledger of tournaments they've played, their placements, and prize money won.

---

## 🏗️ Technical Architecture & Stack

We didn't cut any corners on the tech stack. The platform is built for speed, SEO, and visual supremacy.

- **Framework:** Both apps run on **Next.js (App Router)** for Server-Side Rendering (SEO optimization) and lightning-fast client transitions.
- **Language:** Strictly **TypeScript** for type safety across complex data structures like the Bracket JSON.
- **Database & Auth:** **Supabase (PostgreSQL)**. We utilize Row Level Security (RLS) to ensure players can only see their own private data (like Room Passwords) while tournament structures remain public.
- **Styling:** **Tailwind CSS** combined with CSS Variables to enforce a strict glassmorphism aesthetic. We use nested blur filters, translucent borders, and neon drop-shadows to achieve the premium gaming look.
- **Animations:** 
  - **Framer Motion:** Handles layout transitions, modal pop-ups, hover physics, and the global background loops.
  - **GSAP & ScrollTrigger:** Drives complex scroll-linked animations, ensuring elements slide in organically as the user navigates down a page.
  - **Lottie:** Utilized for lightweight, complex vector animations (like the floating particles in the Tournaments page).

---

## 🔮 Future Roadmap (Where Are We Going?)

This architecture was designed to be future-proof. Here is what is on the horizon:

1. **Fully Automated Bracket Seeding:** Currently, admins manually input "Team 1" vs "Team 2". In the future, the system will look at the `registrations` table, randomly shuffle verified teams, and auto-generate the Round 1 bracket programmatically.
2. **Direct Game API Integrations:** We plan to integrate directly with publisher APIs (Riot Games, Krafton). When a custom room finishes, the API will tell our server the match results, which will instantly auto-advance the bracket and calculate leaderboards without admin intervention.
3. **Automated Wallet Payouts:** Integrating automated payout gateways so when an admin hits "Declare Winner", the prize pool is instantly routed to the winner's linked UPI ID. 
4. **Esports Social Network:** Expanding the user dashboard into a full social profile where players can look for squads, post highlights, and chat directly within the platform.
