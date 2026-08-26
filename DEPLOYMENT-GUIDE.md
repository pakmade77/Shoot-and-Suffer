# 🚀 Panduan Migrasi & Deployment: GitHub + Supabase + Vercel

Panduan lengkap untuk mempublikasikan game **🏀 Shoot & Suffer** ke internet secara **100% GRATIS** menggunakan **GitHub**, **Supabase (PostgreSQL)**, dan **Vercel Hosting**.

Setelah deploy, game ini bisa dibuka langsung oleh siapa saja dari HP / Laptop di mana saja melalui link publik (contoh: `https://shoot-and-suffer.vercel.app`).

---

## 📑 Daftar Isi
1. [Langkah 1: Setup Database Supabase](#-langkah-1-setup-database-supabase-gratis)
2. [Langkah 2: Push Kode ke GitHub](#-langkah-2-push-kode-ke-github)
3. [Langkah 3: Deploy ke Vercel](#-langkah-3-deploy-ke-vercel)
4. [Langkah 4: Inisialisasi Database (Push Schema & Pemain)](#-langkah-4-inisialisasi-database-supabase)

---

## 🐘 Langkah 1: Setup Database Supabase (Gratis)

1. Buka dan login ke **[https://supabase.com](https://supabase.com)** (bisa login menggunakan akun GitHub).
2. Klik tombol **"New Project"**.
3. Isi form pembuatan project:
   - **Name**: `shoot-and-suffer`
   - **Database Password**: *(Buat password yang kuat dan simpan, misalnya: `ShootSuffer2026!`)*
   - **Region**: Pilih yang terdekat (misal: `Singapore` atau `Southeast Asia`).
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga database siap.
5. Setelah project aktif, ambil **Connection String**:
   - Klik menu **Project Settings** (ikon gerigi ⚙️ di kiri bawah) -> **Database**.
   - Scroll ke bagian **Connection parameters / Connection string**.
   - Pilih tab **URI**.
   - Di dropdown mode, pilih **Transaction (Port 6543)** -> Salin string ini sebagai `DATABASE_URL`.
     *(Contoh: `postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`)*
   - Pilih tab **Session (Port 5432)** -> Salin string ini sebagai `DIRECT_URL`.
     *(Contoh: `postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`)*
   > **Catatan:** Jangan lupa ganti teks `[PASSWORD]` dengan password database yang kamu buat di langkah 3.

---

## 🐙 Langkah 2: Push Kode ke GitHub

1. Buka **[https://github.com/new](https://github.com/new)** dan buat repository baru:
   - **Repository name**: `shoot-and-suffer`
   - **Visibility**: `Public` atau `Private` (keduanya didukung gratis oleh Vercel).
   - Biarkan opsi *Initialize this repository with a README* tidak dicentang.
   - Klik **"Create repository"**.
2. Buka Terminal / PowerShell di folder project (`c:\Users\Happy Trails Asia\Desktop\FUN PROJECT\ShootGame`), lalu jalankan perintah berikut:

```bash
git init
git add .
git commit -m "feat: complete shoot and suffer app with sudden death and postgresql support"
git branch -M main
git remote add origin https://github.com/USERNAME_KAMU/shoot-and-suffer.git
git push -u origin main
```
*(Ganti `USERNAME_KAMU` dengan username GitHub kamu).*

---

## ▲ Langkah 3: Deploy ke Vercel

1. Buka dan login ke **[https://vercel.com](https://vercel.com)** (login dengan akun GitHub kamu).
2. Klik tombol **"Add New..." -> "Project"**.
3. Pilih repository **`shoot-and-suffer`** dari daftar GitHub kamu lalu klik **"Import"**.
4. Di halaman konfigurasi project:
   - **Framework Preset**: Biarkan `Next.js`.
   - Buka dropdown **Environment Variables** dan tambahkan 2 variabel berikut:
     - **Name**: `DATABASE_URL`  
       **Value**: *(Tempel connection string Supabase port 6543 dari Langkah 1)*
     - **Name**: `DIRECT_URL`  
       **Value**: *(Tempel connection string Supabase port 5432 dari Langkah 1)*
5. Klik tombol **"Deploy"**!
6. Vercel akan otomatis meng-install dependensi, me-generate Prisma client, dan mem-build aplikasi. Dalam 1-2 menit aplikasi kamu akan LIVE dengan domain resmi Vercel (misal: `https://shoot-and-suffer.vercel.app`).

---

## 🏀 Langkah 4: Inisialisasi Database Supabase

Setelah website Vercel kamu aktif, kita perlu membuat tabel database dan memasukkan 9 pemain awal ke Supabase.

Kamu punya 2 cara:

### **Cara A (Paling Cepat - Lewat Web):**
1. Buka link web Vercel kamu, masuk ke halaman Settings:  
   👉 `https://DOMAIN-VERCEL-KAMU.vercel.app/settings`
2. Di bagian **Data & Reset**, klik **"Reset Demo Data"** -> **"Yes, Reset Data"**.
3. Sistem akan otomatis menjalankan script inisialisasi dan membuat 9 pemain dengan foto profilnya langsung di Supabase!

### **Cara B (Lewat Terminal Lokal):**
1. Di file `.env` lokal, ganti `DATABASE_URL` dan `DIRECT_URL` dengan string Supabase kamu.
2. Jalankan di PowerShell:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

---

## ✨ Fitur yang Sudah Siap di Cloud:
- 🏀 **Sudden Death Overtime**: Babak penentuan otomatis jika skor imbang 0-0.
- 👥 **9 Profil Pemain Lengkap**: Azhar, Dewa, JC, Mul, Naufal, Prabu, Surya, Yasa, Zainul dengan foto profil masing-masing.
- 📱 **Mobile & Desktop Responsive**: Bisa dibuka dari Android, iOS, Windows, Mac kapan saja.
- 🔊 **Offline Web Audio**: Sound effect swish & brick berjalan mulus di browser.
