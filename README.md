# 🏀 SHOOT & SUFFER — Coffee Break Basketball League

> **Shoot. Score. Survive.**  
> Internal office basketball scoring and push-up punishment tracker built for coffee breaks.

---

## 📖 Overview

**Shoot & Suffer** is a lightweight, mobile-first, arcade-style scoring and fitness tracker web application designed exclusively for office LAN networks. During casual coffee break shooting games, players shoot 3 shots each. Winners are crowned as champions, while the lowest scorers are taxed with push-up punishments.

### ✨ Key Features
- 🏀 **Arcade Scoring Console**: High-contrast, mobile-friendly interface with instant HIT (SWISH) vs MISS (BRICK) buttons and tactile sound synthesis.
- 🏆 **Dynamic Championship Leaderboard**: Tracks wins, win rate, and total points across Today, This Week, This Month, and All Time.
- 💀 **Push-up King Tracking**: Tracks total push-up taxes incurred, pending, and completed by each player.
- 👥 **Roster Management**: Add, edit, activate/deactivate players with custom emoji avatars and nicknames.
- 🎯 **Player Profiles & Achievements**: Dynamic badges including *Sniper (70%+ accuracy)*, *Hot Hand (3x win streak)*, *Unbeatable (5x win streak)*, *Push-up King (100+ push-ups)*, *Clutch Shooter (3/3)*, and *Regular Victim*.
- 📜 **Match Ledger**: Complete history of every game with shot dots and quick push-up completion toggles.
- 🔊 **Offline Web Audio Synthesizer**: Retro sound effects (swish, backboard brick, victory fanfare, buzzer) running 100% offline without external audio files.
- 🐳 **MySQL Container & LAN Server**: Dedicated MySQL 8.0 container stack with persistent volume and multi-device access over office Wi-Fi / LAN.

---

## 🌐 LAN Server Access (Local Network & Mobile Access)

This computer acts as the **Host Server** for your office. Anyone connected to the office Wi-Fi / LAN can open the application on their phone or PC without installing anything.

### Local IP Addresses for this Server:
- **Ethernet (LAN)**: `http://192.168.11.46:3000`
- **Wi-Fi**: `http://192.168.100.2:3000`
- **This Computer (Localhost)**: `http://localhost:3000`

### Firewall Configuration (Allow Inbound Traffic)
Right-click and select **"Run as Administrator"** on:
```text
setup-firewall.bat
```
*(This automatically adds rules to allow Port 3000 and Port 3306 on Windows Defender Firewall)*

---

## 🐳 MySQL Database Container Setup

### 1. Start MySQL Container with Docker Compose
To run the dedicated MySQL 8.0 container:
```bash
# Start MySQL container in background
docker compose up -d db
```
or simply double-click **`start-docker-mysql.bat`**.

### 2. Database Connection Credentials
- **Host**: `localhost` (or `db` inside Docker network)
- **Port**: `3306`
- **Database**: `shoot_suffer`
- **User**: `shoot_user`
- **Password**: `shoot_password`
- **Root Password**: `shoot_root_password`
- **Data Volume**: `mysql_data` (persisted on disk)

### 3. Initialize & Seed MySQL Database
```bash
# Push schema tables to MySQL
npm run db:push

# Seed with default players (Gede, Yuni, Edy, Kim, Nadia, Cinta, Dwik) & demo games
npm run db:seed
```

---

## 🚀 Running the Full Stack

### Option A: Complete Docker Stack (App + MySQL)
Run everything inside Docker containers:
```bash
docker compose up -d --build
```

### Option B: Local Node Server + MySQL Container
1. Start the MySQL container: `docker compose up -d db`
2. Start the Next.js server bound to all LAN interfaces (`0.0.0.0`):
   ```bash
   npm run start
   ```
   *(or double-click **`start-server.bat`**)*

---

## 💾 Database Backup & Restore (MySQL)

### Backup MySQL Database
```bash
docker exec -t shoot-suffer-mysql mysqldump -u shoot_user -pshoot_password shoot_suffer > backup_shoot_suffer.sql
```

### Restore MySQL Database
```bash
docker exec -i shoot-suffer-mysql mysql -u shoot_user -pshoot_password shoot_suffer < backup_shoot_suffer.sql
```
