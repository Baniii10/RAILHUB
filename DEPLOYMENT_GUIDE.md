# 🚀 PANDUAN DEPLOYMENT RAILHUB (GITHUB & VERCEL PRODUCTION)

Panduan ini disusun secara sistematis agar dapat dieksekusi oleh developer maupun AI coding agent lain secara otomatis tanpa kebingungan.

---

## 📌 1. INFORMASI ARSITEKTUR REPOSITORI & BRANCH

Sistem repositori RAILHUB terhubung ke 2 remote Git dengan konfigurasi branch khusus untuk Vercel:

| Target | Remote Name | URL Repositori | Keterangan |
| :--- | :--- | :--- | :--- |
| **Bagas (Primary/Deploy)** | `bagas` | `https://github.com/Bagaspermana0/railhub.git` | Terkoneksi langsung ke Vercel Auto-Deploy |
| **Bani (Origin/Backup)** | `origin` | `https://github.com/Baniii10/RAILHUB.git` | Repositori tim / backup utama |

### ⚠️ ATURAN EMAS BRANCH VERCEL:
- **Vercel Production** di-setting mendengarkan branch **`main`** (bukan `master`).
- Branch lokal default yang sedang aktif dikerjakan adalah **`master`**.
- Oleh karena itu, agar perubahan lokal masuk ke **Production**, kamu **WAJIB** push branch `master` lokal ke branch `main` remote!

```
[Local: master] ─── push ───> [bagas: main] ───> 🟢 VERCEL PRODUCTION
[Local: master] ─── push ───> [bagas: master] ───> 🟡 Vercel Preview
[Local: master] ─── push ───> [origin: master & main] ───> Sync Tim
```

---

## ⚡ 2. CHEAT SHEET PUSH CEPAT (ONE-LINER)

Jika kamu atau AI Agent selesai melakukan perubahan kode, cukup jalankan perintah berikut:

### Langkah 1: Verifikasi Build Lokal
Pastikan tidak ada error sintaks, import rusak, atau error SSR:
```bash
npm run build
```

### Langkah 2: Commit Perubahan
```bash
git add .
git commit -m "feat/fix: deskripsi perubahan kamu"
```

### Langkah 3: Push ke Production & Seluruh Remote Sekaligus
Jalankan satu baris ini untuk deploy ke production dan sinkronkan semua remote:
```bash
git push bagas master:main && git push bagas master && git push origin master:main && git push origin master
```

> **Penjelasan Perintah:**
> - `git push bagas master:main` : **Ini yang paling penting!** Mengirim commit dari branch lokal `master` ke branch `main` di repo Bagas, yang akan **otomatis memicu build Vercel Production**.
> - `git push bagas master` : Memperbarui branch master repo Bagas (Preview deployment).
> - `git push origin master:main` & `git push origin master` : Menyinkronkan repo Bani.

---

## 🛠️ 3. KONFIGURASI DI VERCEL DASHBOARD (PENGATURAN AWAL)

Jika melakukan import project baru di Vercel:

1. **Import Git Repository**: Pilih `Bagaspermana0/railhub`.
2. **Framework Preset**: Pilih `Next.js` (didukung Turbopack).
3. **Root Directory**: `./` (default root).
4. **Build & Output Settings**:
   - Build Command: `npm run build` (atau kosongkan untuk default `next build`).
   - Output Directory: `.next` (default).
   - Install Command: `npm install`.
5. **Node.js Version**: **20.x** (atau minimum 18.x).
6. **Production Branch**: Setel ke **`main`**.

---

## 🔐 4. DAFTAR ENVIRONMENT VARIABLES (VERCEL DASHBOARD)

Di menu **Project Settings ➔ Environment Variables**, pastikan variabel berikut terpasang untuk environment **Production**, **Preview**, dan **Development**:

```env
# --- SUPABASE CONFIGURATION (Wajib untuk database, jadwal & auth) ---
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SUPABASE-SERVICE-ROLE-KEY]

# --- APP URL CONFIGURATION ---
NEXT_PUBLIC_APP_URL=https://railhub-indonesia.vercel.app

# --- MIDTRANS PAYMENT GATEWAY (Jika payment aktif) ---
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=[YOUR-MIDTRANS-CLIENT-KEY]
MIDTRANS_SERVER_KEY=[YOUR-MIDTRANS-SERVER-KEY]
MIDTRANS_IS_PRODUCTION=false
```

---

## 💻 5. DEPLOY MENGGUNAKAN VERCEL CLI (ALTERNATIF TERMINAL)

Jika tidak ingin push git dan ingin langsung menembak build ke Vercel dari terminal:

### 1. Install & Login Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Hubungkan Proyek
```bash
vercel link
```
Pilih scope akun `bagaspermana0` dan proyek `railhub`.

### 3. Deploy Langsung ke Production
```bash
vercel --prod
```
Flag `--prod` akan mem-build aplikasi dan langsung mengarahkan domain utama ke deployment tersebut tanpa harus melalui push git.

---

## 🚨 6. PANDUAN TROUBLESHOOTING UMUM (UNTUK AI AGENT)

### Kasus A: "Production Tidak Berubah / Tetap Versi Lama"
- **Penyebab**: Kamu hanya melakukan `git push bagas master`. Karena Vercel memantau branch `main` untuk production, commit di `master` hanya masuk ke tab *Preview*.
- **Solusi**:
  ```bash
  git push bagas master:main --force
  ```

### Kasus B: "Vercel Build Error: ReferenceError / Module Not Found"
- **Penyebab**: Ada komponen atau icon (misalnya dari `lucide-react`) yang dipanggil di JSX tapi lupa di-import di bagian atas file.
- **Pencegahan**: Selalu jalankan `npm run build` sebelum push! Jika `npm run build` di lokal exit code 0, 99.9% build di Vercel pasti berhasil.

### Kasus C: "Git Rejected (Non-Fast-Forward)"
- **Penyebab**: Ada commit remote yang belum di-pull di lokal.
- **Solusi**:
  ```bash
  git fetch --all
  git pull bagas master --rebase
  git push bagas master:main
  ```

### Kasus D: "Uncaught ReferenceError di Mobile"
- **Penyebab**: Variabel browser window/storage dipanggil saat Server-Side Rendering (SSR).
- **Solusi**: Bungkus pemanggilan dengan `typeof window !== 'undefined'` atau letakkan di dalam hook `useEffect`.

---

## 📋 7. INSTRUKSI PROMPT UNTUK AGENT LAIN

Jika kamu ingin memerintahkan agent AI lain untuk melakukan deployment RAILHUB, kamu bisa copy-paste instruksi berikut:

> *"Tolong lakukan build verification dengan `npm run build`. Jika sukses tanpa error, lakukan commit dengan pesan yang jelas, lalu push perubahan ke production Vercel dengan perintah `git push bagas master:main && git push bagas master && git push origin master:main && git push origin master`. Pastikan Vercel Production menerima commit terbaru pada branch main."*
