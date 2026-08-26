# 🏀 SHOOT & SUFFER — Antigravity IDE Build Specification

## Coffee Break Basketball League

Build a complete, production-ready but lightweight internal web application called:

**🏀 SHOOT & SUFFER**  
**Coffee Break Basketball League**

This is a fun internal office basketball scoring and push-up punishment tracker.

The application will be used **ONLY inside the office LAN network**. It must be fast, mobile-first, funny, visually attractive, and extremely easy to use during a coffee break basketball game.

---

# 1. Core Concept

Office employees play casual basketball shooting games during coffee break.

Typical game:

- 3–7 players
- Each player gets exactly 3 shots
- Each shot is either HIT or MISS
- Total score = number of HIT shots
- Player(s) with the lowest score are the loser(s)
- Loser(s) receive a push-up punishment

Punishment options:

- 5 push-ups
- 10 push-ups
- 15 push-ups

The system must automatically calculate:

- Winner
- Loser
- Ranking
- Push-ups for each loser
- Total push-ups accumulated by each player
- Daily statistics
- Weekly statistics
- Monthly statistics
- All-time statistics

The application should feel like a fun mini arcade basketball scoreboard, not a boring business dashboard.

---

# 2. Tech Stack

Use:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Prisma ORM
- SQLite
- Lucide React icons
- Framer Motion for animations

Do **NOT** use Supabase.

Do **NOT** require an external database.

Do **NOT** require authentication for v1.

Do **NOT** require internet access at runtime.

The application must run completely inside the office LAN.

Use environment variables where appropriate.

---

# 3. Project Initialization

If the project is empty, initialize the complete Next.js project.

Use a clean modern structure.

Recommended structure:

```text
app/
  page.tsx
  game/
    page.tsx
    new/
      page.tsx
  leaderboard/
    page.tsx
  history/
    page.tsx
  players/
    page.tsx
  settings/
    page.tsx
  api/
    players/
    games/
    leaderboard/

components/
  layout/
  dashboard/
  game/
  leaderboard/
  players/
  ui/

lib/
  db.ts
  calculations.ts
  utils.ts

prisma/
  schema.prisma
  seed.ts

public/
  sounds/

types/
```

---

# 4. Database

Use SQLite with Prisma.

Create these models.

## PLAYER

Fields:

- id
- name
- nickname
- avatar
- active
- createdAt
- updatedAt

## GAME

Fields:

- id
- playedAt
- punishmentAmount
- createdAt

## GAME_PLAYER

Fields:

- id
- gameId
- playerId
- shot1
- shot2
- shot3
- totalScore
- rank
- isWinner
- isLoser
- pushupAmount
- createdAt

Use proper Prisma relations.

Use cascading delete where appropriate.

---

# 5. Player Management

Create a Players page.

Features:

- Add player
- Edit player
- Activate/deactivate player
- Delete player
- Display nickname
- Optional emoji/avatar

Example players:

- Gede
- Yuni
- Edy
- Kim
- Nadia
- Cinta
- Dwik

Do not hardcode these as permanent players.

Create a seed file with sample players, but make the UI fully dynamic.

Example player card:

```text
🏀 Gede

Games: 24
Wins: 12
Losses: 8
Push-ups: 65
```

---

# 6. Dashboard

Create a beautiful mobile-first dashboard.

Header:

```text
🏀 SHOOT & SUFFER

Coffee Break Basketball League
```

Add a small funny tagline:

> Shoot. Score. Survive.

Main dashboard sections:

1. Today's Champion
2. Current/Latest Game
3. Today's Leaderboard
4. Push-up King
5. Recent Games
6. Quick Start Game button

Example hero:

```text
🏆 TODAY'S CHAMPION

        GEDE

      18 POINTS
```

Use animated trophy/confetti.

---

# 7. New Game Flow

Create a **NEW GAME** button.

## Step 1 — Select Players

Allow 3–7 players.

Use large player selection cards.

Example:

```text
☑ Gede
☑ Yuni
☑ Edy
☑ Kim

4 Players
```

## Step 2 — Select Punishment

Options:

```text
5 PUSH-UPS
10 PUSH-UPS
15 PUSH-UPS
```

Use large visual cards.

Default:

**10 PUSH-UPS**

## Step 3 — Start Game

Start the game after valid player selection.

---

# 8. Game Screen

The game screen must be extremely simple because users will operate it while playing basketball.

Show:

```text
ROUND / GAME

GEDE

SHOT 1

[ 🏀 HIT ] [ 🧱 MISS ]

SHOT 2

[ 🏀 HIT ] [ 🧱 MISS ]

SHOT 3

[ 🏀 HIT ] [ 🧱 MISS ]

Current score:

2 / 3

[ NEXT PLAYER ]
```

Do not allow advancing until all 3 shots are recorded.

Prevent accidental duplicate clicks.

Once a shot is selected, visually lock that shot.

Use animations.

HIT:

> 🏀 SWISH!

MISS:

> 🧱 BRICK!

Use subtle sound effects if possible, but make sound optional and provide a mute button.

---

# 9. Result Screen

After all players finish:

Calculate rankings automatically.

Example:

```text
🏆 GAME RESULT

🥇 GEDE — 3
🥈 YUNI — 2
🥉 EDY — 1
💀 KIM — 0
```

If multiple players have the same lowest score:

They all become losers.

Example:

```text
💀 LOSERS

EDY
KIM

Both receive the selected punishment.
```

Do not randomly select a loser unless the application has an optional future tie-break feature.

---

# 10. Winner Experience

When winner is determined:

Show a fun celebration.

Example:

```text
🎉 GAME OVER!

🏆

GEDE

COFFEE BREAK CHAMPION!
```

Use:

- Confetti
- Trophy animation
- Floating basketballs
- Framer Motion
- Short celebration sound

Do not make it annoying.

Allow:

```text
[ VIEW LEADERBOARD ]
```

---

# 11. Loser Experience

Immediately after winner screen, show:

```text
💀 OH NO...

TODAY'S VICTIM

KIM

💪

10 PUSH-UPS
```

Add funny but friendly copy:

> Your contribution to office fitness has been recorded.

If multiple losers:

```text
💀 THE PUSH-UP CREW

KIM
EDY

💪 10 PUSH-UPS EACH
```

Add button:

```text
[ 💪 I'VE DONE MY PUSH-UPS ]
```

When clicked, mark punishment as completed.

Do not prevent the game from being completed if the button isn't clicked.

The button is just a fun tracking mechanism.

---

# 12. Push-up Tracking

Every punishment must be stored.

Track:

- total push-ups
- completed push-ups
- pending push-ups

Player statistics:

- Total games
- Wins
- Losses
- Total points
- Average score
- Best score
- Win rate
- Loss rate
- Total push-ups
- Completed push-ups
- Pending push-ups

---

# 13. Leaderboard

Create a dedicated Leaderboard page.

Tabs:

- TODAY
- THIS WEEK
- THIS MONTH
- ALL TIME

Create two major leaderboards.

## A. Championship

Rank by:

1. Wins
2. Total score
3. Win rate

Example:

```text
🏆 CHAMPIONSHIP

🥇 Gede
12 Wins
86 Points

🥈 Yuni
9 Wins
79 Points

🥉 Edy
7 Wins
71 Points
```

## B. Push-up King

Rank by:

**Total push-ups**

Example:

```text
💀 PUSH-UP KING

🥇 Kim
145 Push-ups

🥈 Edy
110 Push-ups

🥉 Yuni
75 Push-ups
```

Add funny subtitle:

> The most decorated athlete in the office... unfortunately.

---

# 14. Statistics

Create player detail pages.

Display:

- Name
- Nickname
- Games
- Wins
- Losses
- Win Rate
- Total Points
- Average Score
- Best Score
- Total Push-ups
- Completed Push-ups
- Pending Push-ups
- Average Push-ups per Game

Include simple charts if useful.

Use CSS/SVG or lightweight charting.

Do not make the dashboard too complicated.

---

# 15. History

Create game history page.

Display cards containing:

- Date
- Players
- Winner
- Loser(s)
- Scores
- Punishment

Example:

```text
20 Aug 2026

🏆 Gede

Gede 3
Yuni 2
Edy 1
Kim 0

💀 Kim — 10 push-ups
```

Clicking a game opens detailed result.

---

# 16. Fun Achievements

Implement automatic achievements.

Examples:

### 🎯 SNIPER

Best shooting percentage.

### 🔥 HOT HAND

3 consecutive wins.

### 👑 UNBEATABLE

5 consecutive wins.

### 💀 PUSH-UP KING

100+ total push-ups.

### 😂 REGULAR VICTIM

3 consecutive losses.

### 🏆 OFFICE LEGEND

50 games played.

### 🧱 BRICK MASTER

Highest miss count.

Achievements should be calculated dynamically.

Show achievements on player profiles.

---

# 17. Design System

The design must feel:

- Fun
- Modern
- Sporty
- Friendly
- Slightly playful
- Professional enough for an office

Do not create a generic admin dashboard.

Use:

- Dark navy / charcoal background
- Bright basketball orange accent
- White cards
- Rounded corners
- Large typography
- Large touch-friendly buttons
- Subtle gradients
- Basketball visual elements
- Trophy icons
- Fire icons
- Dumbbell icons
- Skull/loser icons

Use responsive design.

Mobile first.

Desktop should also look excellent.

---

# 18. Mobile UI

The game interface is primarily used on phones.

Minimum touch target:

**44px+**

Buttons should be large.

Avoid tiny text.

Use bottom navigation on mobile:

```text
🏠 Home
🏀 Game
🏆 Ranking
👥 Players
```

Desktop can use sidebar navigation.

---

# 19. Fun Microcopy

Use funny but friendly language.

Winner:

> 🔥 Absolute bucket machine!

Loser:

> 💀 Time to pay the fitness tax.

Miss:

> 🧱 BRICK!

Hit:

> 🏀 SWISH!

Game start:

> May the best shooter survive.

Push-up:

> Your fitness contribution has been recorded.

Leaderboard:

> Who rules the court?

Push-up leaderboard:

> Who has suffered the most?

Do not use insulting, offensive, or humiliating language.

---

# 20. Settings

Create Settings page.

Allow:

- Default punishment
- Sound on/off
- Animation on/off
- Reset demo data

Add confirmation before destructive operations.

---

# 21. Data Validation

Rules:

- Minimum players: 3
- Maximum players: 7
- Each player must have exactly 3 shots

Each shot:

```text
true = HIT
false = MISS
```

Total score:

```text
shot1 + shot2 + shot3
```

Lowest score = loser.

Highest score = winner.

If multiple players share highest score:

They can all be marked winners.

If multiple players share lowest score:

They can all be marked losers.

If there is only one player with highest score and one or multiple losers, use the standard result.

Never allow malformed game records.

---

# 22. API / Server Logic

Use server-side database operations.

Create clean API routes or server actions.

Do not expose database credentials.

Keep SQLite access server-side.

Implement:

- Create player
- Update player
- Delete player
- Create game
- Save game result
- Get game history
- Get leaderboard
- Get player statistics
- Mark punishment completed

---

# 23. SQLite / Prisma

Create:

`.env`

```env
DATABASE_URL="file:./dev.db"
```

Configure Prisma correctly for SQLite.

Add migration.

Add seed script.

Make sure:

```bash
npm run dev
```

works.

Also make sure:

```bash
npm run build
```

works without errors.

---

# 24. Docker

Create a production Dockerfile.

Create:

```text
docker-compose.yml
```

Application should listen on:

```text
0.0.0.0
```

Use configurable `PORT`.

Default:

```text
3000
```

Example LAN access:

```text
http://192.168.0.5:3000
```

Do not expose any external/public service.

The app should work completely offline once dependencies are installed.

Persist SQLite database using a Docker volume.

Example:

```yaml
./data:/app/data
```

Ensure the database survives container restart.

If necessary, configure the Prisma SQLite database path so it is stored inside the persistent `/app/data` directory.

---

# 25. Security

This is an internal LAN application.

Do not implement authentication in v1.

However:

- Validate all inputs
- Prevent SQL injection through Prisma
- Do not expose server secrets
- Do not use public cloud services
- Do not include analytics/tracking
- Do not call external APIs

---

# 26. Error Handling

Implement friendly error states.

Example:

> Oops! Something went wrong 🏀

Provide retry buttons.

Never show raw database errors to users.

Log technical errors server-side.

---

# 27. Empty States

If there are no games:

```text
No games yet.

Be the first Coffee Break Champion!

[ START FIRST GAME ]
```

If there are no players:

```text
Add at least 3 players to start.
```

---

# 28. Performance

Keep application lightweight.

Avoid unnecessary dependencies.

Use server components where appropriate.

Use client components only where interaction is required.

Do not over-engineer.

---

# 29. Accessibility

Use:

- Semantic HTML
- Accessible buttons
- Proper contrast
- Keyboard support
- ARIA labels where appropriate

Do not rely only on color to communicate HIT/MISS.

---

# 30. README

Create a complete project README.

Include:

- Project overview
- Features
- Tech stack
- Installation
- Development
- Database setup
- Seed database
- Production build
- Docker deployment
- LAN access
- Backup database
- Restore database

Include examples:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Docker:

```bash
docker compose up -d --build
```

---

# 31. Development Workflow

Do **not** stop after creating the initial structure.

You must actually implement the complete application.

Work through the project in this order:

1. Initialize project
2. Install dependencies
3. Create Prisma schema
4. Create database migration
5. Create seed data
6. Build reusable components
7. Build player management
8. Build new game flow
9. Build game scoring
10. Build result screen
11. Build punishment tracking
12. Build leaderboard
13. Build statistics
14. Build history
15. Build achievements
16. Build settings
17. Add animations
18. Add responsive mobile UI
19. Add Docker
20. Add README
21. Run lint
22. Run type checking
23. Run production build
24. Fix ALL errors

---

# 32. Important Antigravity Behavior

You are operating as an autonomous coding agent.

Do not just describe what should be done.

Actually create and modify the files.

Do not ask me for confirmation for normal implementation decisions.

Make reasonable technical decisions yourself.

After implementation, inspect the entire project.

Fix:

- TypeScript errors
- ESLint errors
- Prisma errors
- Build errors
- Broken imports
- Responsive UI issues
- Runtime errors

Do not leave TODO placeholders.

Do not leave fake buttons.

Every visible button must work.

---

# 33. Final Quality Check

Before declaring the project complete, test this scenario.

Create players:

- Gede
- Yuni
- Edy
- Kim

Start game.

Punishment:

**10 push-ups**

Scores:

### Gede

- HIT
- HIT
- HIT

### Yuni

- HIT
- HIT
- MISS

### Edy

- HIT
- MISS
- MISS

### Kim

- MISS
- MISS
- MISS

Expected result:

```text
🥇 Gede — 3
🥈 Yuni — 2
🥉 Edy — 1
💀 Kim — 0
```

Kim receives:

```text
10 push-ups
```

Then create another game where Kim loses again.

Verify:

```text
Kim total push-ups = 20
```

Verify:

- Leaderboard updates
- Daily statistics
- Weekly statistics
- Monthly statistics
- All-time statistics
- Player statistics
- Game history
- Punishment status

---

# 34. Visual Polish

Before finishing, review the UI visually.

Make sure it does **NOT** look like a default Next.js starter template.

The home page should immediately communicate:

🏀 Basketball  
😂 Fun  
🏆 Competition  
💪 Push-ups

Use polished:

- Spacing
- Typography
- Cards
- Animations
- Icons
- Responsive layouts

Make the application something that office staff will actually enjoy opening during coffee break.

---

# 35. Final Output

When everything is complete, provide a concise final report containing:

1. What was built
2. Main features
3. How to run locally
4. How to run with Docker
5. LAN URL format
6. Database location
7. Any important notes

Most importantly:

**BUILD THE ACTUAL APPLICATION.**

Do not only provide instructions.

Do not stop at scaffolding.

Do not provide pseudo-code.

Implement everything end-to-end and verify that it builds successfully.
