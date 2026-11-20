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
# Bash / Linux / Mac / Git Bash:
git push bagas master:main && git push bagas master && git push origin master:main && git push origin master

# PowerShell (Windows):
git push bagas master:main; git push bagas master; git push origin master:main; git push origin master
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
5. **Node.js Version**: **22.x** (sesuai `package.json`).
6. **Production Branch**: Setel ke **`main`**.

---

## 🔐 4. DAFTAR ENVIRONMENT VARIABLES (VERCEL DASHBOARD)

Di menu **Project Settings ➔ Environment Variables**, pastikan variabel berikut terpasang untuk environment **Production**, **Preview**, dan **Development**:

```env
# --- SUPABASE CONFIGURATION (Wajib untuk database, jadwal & auth) ---
NEXT_PUBLIC_SUPABASE_URL=https://youqixjjsdhgmkzdjjck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SuiQ5-bcUKMUiqQWZpBT-Q_iYYLydQD

# --- APP URL CONFIGURATION ---
NEXT_PUBLIC_APP_URL=https://railhub-indonesia.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890
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

### Kasus E: "Jadwal tidak dapat dimuat: TypeError: Failed to fetch"
- **Penyebab**: Koneksi browser HP langsung ke domain luar Supabase (`*.supabase.co`) terputus, timeout pada jaringan seluler 4G/3G, atau diblokir adblocker/DNS lokal.
- **Solusi**: RAILHUB kini dilengkapi server API fallback di `/api/schedules/search` dan tombol *Coba Muat Ulang*. Jika terjadi kendala jaringan, aplikasi otomatis mencoba ulang melalui server Next.js Vercel tanpa memblokir pengguna.

### Kasus F: "Pembatalan gagal: Could not find function cancel_own_paid_booking in schema cache" & "column bookings.ticket_fare_amount does not exist"
- **Penyebab**: Migrasi database Supabase belum diterapkan pada project Supabase aktif.
- **Solusi**: Jalankan skrip `supabase/COMPLETE_PRODUCTION_PATCH.sql` langsung di Supabase SQL Editor atau jalankan `npx supabase db push` (lihat Bagian 8 di bawah).

---

## 📋 7. INSTRUKSI PROMPT UNTUK AGENT LAIN

Jika kamu ingin memerintahkan agent AI lain untuk melakukan deployment RAILHUB, kamu bisa copy-paste instruksi berikut:

> *"Tolong lakukan build verification dengan `npm run build`. Jika sukses tanpa error, lakukan commit dengan pesan yang jelas, lalu push perubahan ke production Vercel dengan perintah `git push bagas master:main && git push bagas master && git push origin master:main && git push origin master`. Pastikan Vercel Production menerima commit terbaru pada branch main."*

---

## 8. MIGRASI DATABASE WAJIB (SUPABASE PRODUCTION)

Deploy kode ke Vercel **wajib dibarengi dengan menerapkan skrip patch database** ke Supabase agar fitur reschedule, pembatalan tiket, hak akses staff gate/kondektur, dan tarif tiket berjalan normal.

Project ID Supabase: **`youqixjjsdhgmkzdjjck`**

### CARA 1: Langsung di Supabase Web Dashboard (Paling Cepat & Direkomendasikan)
1. Buka [Supabase Dashboard - SQL Editor](https://supabase.com/dashboard/project/youqixjjsdhgmkzdjjck/sql/new).
2. Buka file [`supabase/COMPLETE_PRODUCTION_PATCH.sql`](file:///c:/Projects/RAILHUB-1/supabase/COMPLETE_PRODUCTION_PATCH.sql) di editor proyek ini.
3. Salin (*copy*) seluruh isinya, lalu tempel (*paste*) ke query editor Supabase.
4. Klik tombol **Run** (atau `Ctrl+Enter`).
5. Selesai! Seluruh fungsi pembatalan, reschedule, kolom tarif, serta perizinan otomatis terpasang secara idempotent.

### CARA 2: Melalui Supabase CLI di Terminal
```bash
npx supabase login
npx supabase link --project-ref youqixjjsdhgmkzdjjck
npx supabase db push
```

### Verifikasi Setelah Patch Dijalankan:
1. Klik **Reschedule** pada tiket di menu pemesanan penumpang: drawer tanggal dan kursi pengganti terbuka mulus tanpa error kolom `ticket_fare_amount`.
2. Klik **Batalkan tiket**: modal konfirmasi pembatalan muncul dan dana simulasi terhitung tanpa error `schema cache`.
3. Pencarian jadwal kereta di HP tidak menampilkan `TypeError: Failed to fetch` karena telah ditangani oleh fallback server `/api/schedules/search`.
4. Login `gate.gambir@railhub.id` masuk ke `/dashboard/staff` dan scanner validasi bekerja sesuai stasiun penugasan.

---

## 9. RESET SELURUH TIKET & BOOKING (OPSIONAL / BERSIH TOTAL)

Jika Anda ingin mengosongkan seluruh tiket yang pernah dibeli akun manapun dan mengembalikan status kursi ke awal (*clean slate*):

1. Buka [Supabase Dashboard - SQL Editor](https://supabase.com/dashboard/project/youqixjjsdhgmkzdjjck/sql/new).
2. Salin isi file [`supabase/RESET_ALL_BOOKINGS.sql`](file:///c:/Projects/RAILHUB-1/supabase/RESET_ALL_BOOKINGS.sql).
3. Tempel ke editor dan klik **Run**.
4. Seluruh tabel `tickets`, `booking_seats`, `food_orders`, `payments`, dan `bookings` langsung dikosongkan seketika.

---

## 🎓 10. PANDUAN PENGUJIAN DOSEN / EVALUATOR (5 SKENARIO TESTING LENGKAP)

Untuk mempermudah dosen penguji atau evaluator menguji seluruh alur bisnis sistem RAILHUB dari hulu ke hilir tanpa hambatan, ikuti 5 skenario berurutan berikut:

### 🟢 Skenario 1: Penumpang (Booking, Pembayaran, Tiket QR, Reschedule & Batal)
1. Masuk ke halaman login (`/auth/login`), klik tombol pintas **"Penumpang Demo"** (atau email `penumpang@railhub.id`, password `password123`).
2. Di Beranda, cari kereta (misal: Rute Jakarta Gambir ke Surabaya Gubeng), pilih jadwal kereta **Argo Bromo Anggrek**.
3. Pilih gerbong dan kursi penumpang secara interaktif pada seat map.
4. Lanjutkan ke pembayaran (simulasi QRIS / Virtual Account), klik **Bayar Sekarang**.
5. Buka menu **Tiket Saya** (`/dashboard/orders`), verifikasi tiket berstatus **Lunas** dengan **QR Code Digital** boarding pass.
6. Uji fitur **Reschedule** (ganti jadwal) dan **Batalkan Tiket** untuk menguji sistem refund otomatis.

### 🚆 Skenario 2: Petugas Kereta / Kondektur (Validasi Manifest & Update Status KA)
1. Di halaman login, klik salah satu akun kereta cepat, misalnya **"Petugas KA Argo Bromo"** (`j02@gmail.com` / `petugas123`).
2. Di Dashboard Petugas (`/dashboard/staff`), amati gauge boarding, komposisi kelas gerbong, dan status layanan terpadu.
3. Buka tab **Validasi Tiket**:
   - Masukkan kode tiket penumpang dari Skenario 1 (atau klik kamera QR).
   - Status tiket berubah menjadi hijau **"TIKET VALID · BOARDING BERHASIL"**.
4. Buka tab **Manifest Penumpang**: cek data penumpang, klik tombol **"Ekspor Manifest (CSV)"** atau **"Cetak"**.
5. Buka tab **Status KA**: ubah status perjalanan dari `scheduled` ➔ `boarding` ➔ `departed`.

### 🚪 Skenario 3: Petugas Gate Stasiun (Check-in Boarding Gate)
1. Di halaman login, buka katalog petugas dan pilih **"J21 Gate Gambir"** (`j21@gmail.com` / `petugas123`).
2. Petugas gate otomatis disetel pada lokasi tugas **Stasiun Gambir (GMR)**.
3. Masukkan kode tiket penumpang pada scanner manual gate.
4. Sistem gate melakukan verifikasi asal stasiun, tanggal keberangkatan, dan identitas penumpang dengan feedback visual instan.
5. Unduh riwayat validasi melalui tombol **"Ekspor Riwayat Validasi (CSV)"**.

### 👑 Skenario 4: Administrator (Pusat Kendali, Visual Chart & Ekspor Data Global)
1. Di halaman login, klik tombol pintas **"Administrator"** (`admin@railhub.id` / `admin123`).
2. Di Dashboard Admin (`/dashboard/admin`), telaah:
   - **Ringkasan KPI** (Total Penumpang, Pendapatan, Okupansi Rata-rata, On-Time Performance).
   - **Visualisasi Chart**: Gauge okupansi, horizontal bar kereta terpopuler, dan segmented bar arus kas.
3. Coba fitur **Ekspor Data**:
   - Di tab **Jadwal**: klik **"Ekspor Jadwal (CSV)"**.
   - Di modal **Manifest**: klik **"Unduh CSV"** atau **"Cetak Manifest"**.
   - Di tab **Petugas**: klik **"Ekspor 25 Petugas (CSV)"**.
   - Di tab **Pemesanan** & **Pengguna**: klik **"Ekspor CSV"**.
4. Uji manajemen jadwal (tambah rute, edit jam, ubah status) dan plot penugasan petugas armada.

### 🛎️ Skenario 5: Layanan Terpadu di Kereta (Kuliner, Bantuan & Lost/Found)
1. Login sebagai penumpang, buka menu layanan gerbong dan pesan kuliner (Onboard Dining) atau ajukan laporan bantuan kursi roda.
2. Kembali login sebagai Petugas KA terkait (`j02@gmail.com`), buka tab **Layanan Terpadu**.
3. Konfirmasi pesanan makanan, update progres penyajian, dan ekspor data melalui **"Ekspor Rekap Pesanan (CSV)"**.
4. Tindak lanjuti laporan bantuan khusus dan klaim barang tertinggal (Lost & Found).

---

## 👥 11. TABEL KREDENSIAL LENGKAP (25 PETUGAS J01–J25, ADMIN, PENUMPANG)

Semua akun di bawah ini telah terdaftar aktif di database Supabase Production dan dapat digunakan langsung baik melalui pengetikan form manual maupun klik instan tombol Login Cepat.

### Akun Utama:
| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@railhub.id` | `admin123` | Akses penuh seluruh modul master data, analitik & armada |
| **Penumpang Demo** | `penumpang@railhub.id` | `password123` | Akun penumpang umum untuk booking, seat map & e-ticket |

### 25 Akun Petugas Resmi (Password Default: `petugas123`):
| Kode | Nama Petugas | Email | Tipe Petugas | Penugasan Armada / Stasiun |
| :--- | :--- | :--- | :--- | :--- |
| **J01** | Budi Santoso | `j01@gmail.com` | Kondektur (Train Staff) | KA 1 Argo Bromo Anggrek (SBI - GMR) |
| **J02** | Siti Rahmawati | `j02@gmail.com` | Kondektur (Train Staff) | KA 2 Argo Bromo Anggrek (GMR - SBI) |
| **J03** | Agus Setiawan | `j03@gmail.com` | Kondektur (Train Staff) | KA 3 Argo Bromo Anggrek (Malam) |
| **J04** | Dewi Lestari | `j04@gmail.com` | Kondektur (Train Staff) | KA 4 Argo Bromo Anggrek (Malam) |
| **J05** | Eko Prasetyo | `j05@gmail.com` | Kondektur (Train Staff) | KA 43 Argo Parahyangan (BD - GMR) |
| **J06** | Rina Wulandari | `j06@gmail.com` | Kondektur (Train Staff) | KA 44 Argo Parahyangan (GMR - BD) |
| **J07** | Ahmad Fauzi | `j07@gmail.com` | Kondektur (Train Staff) | KA 5 Argo Wilis (SGU - BD) |
| **J08** | Nur Hidayah | `j08@gmail.com` | Kondektur (Train Staff) | KA 6 Argo Wilis (BD - SGU) |
| **J09** | Hendra Kurniawan | `j09@gmail.com` | Kondektur (Train Staff) | KA 9 Argo Dwipangga (SLO - GMR) |
| **J10** | Sri Wahyuni | `j10@gmail.com` | Kondektur (Train Staff) | KA 10 Argo Dwipangga (GMR - SLO) |
| **J11** | Bambang Supriyadi | `j11@gmail.com` | Kondektur (Train Staff) | KA 7 Argo Lawu (SLO - GMR) |
| **J12** | Tri Handayani | `j12@gmail.com` | Kondektur (Train Staff) | KA 8 Argo Lawu (GMR - SLO) |
| **J13** | Dedi Cahyono | `j13@gmail.com` | Kondektur (Train Staff) | KA 67 Taluwo / Gajayana (ML - GMR) |
| **J14** | Maya Anggraini | `j14@gmail.com` | Kondektur (Train Staff) | KA 68 Gajayana (GMR - ML) |
| **J15** | Joko Widodo | `j15@gmail.com` | Kondektur (Train Staff) | KA 75 Bima (SGU - GMR) |
| **J16** | Yuni Astuti | `j16@gmail.com` | Kondektur (Train Staff) | KA 76 Bima (GMR - SGU) |
| **J17** | Rizky Pratama | `j17@gmail.com` | Kondektur (Train Staff) | KA 81 Sembrani (SBI - GMR) |
| **J18** | Indah Permata | `j18@gmail.com` | Kondektur (Train Staff) | KA 82 Sembrani (GMR - SBI) |
| **J19** | Fajar Nugroho | `j19@gmail.com` | Kondektur (Train Staff) | KA 69 Taksaka (YK - GMR) |
| **J20** | Ratna Sari | `j20@gmail.com` | Kondektur (Train Staff) | KA 70 Turangga (SGU - BD) |
| **J21** | Ari Wibowo | `j21@gmail.com` | Petugas Pintu (Gate) | Gate Stasiun Gambir (GMR) |
| **J22** | Dian Kusuma | `j22@gmail.com` | Petugas Pintu (Gate) | Gate Stasiun Pasar Senen (PSE) |
| **J23** | Bayu Saputra | `j23@gmail.com` | Petugas Pintu (Gate) | Gate Stasiun Bandung (BD) |
| **J24** | Anisa Putri | `j24@gmail.com` | Petugas Pintu (Gate) | Gate Stasiun Yogyakarta (YK) |
| **J25** | Doni Hermawan | `j25@gmail.com` | Petugas Pintu (Gate) | Gate Stasiun Surabaya Pasarturi (SBI) |

> **Catatan Pintas Email Petugas Populer:**
> Tombol cepat juga mendukung email alias `petugas.argobromo@railhub.id`, `petugas.parahyangan@railhub.id`, `petugas.taksaka@railhub.id`, `petugas.argowilis@railhub.id`, `petugas.turangga@railhub.id`, dan `gate.gambir@railhub.id` yang otomatis dipetakan ke kredensial di atas.

---

## 📊 12. FITUR EKSPOR DATA & VISUALISASI CHART

Seluruh dashboard telah dilengkapi sistem pelaporan dan visualisasi data mandiri (*zero-dependency*):

### 1. Visualisasi Chart:
- **Donut Progress Gauge**: Menampilkan persentase keterisian kursi dan progres boarding secara dinamis berbasis SVG vektor tajam.
- **Horizontal Bar Chart**: Membandingkan volume okupansi antar kereta api terpopuler dan perincian kelas gerbong (Eksekutif K1, Luxury Sleeper, Bisnis, Ekonomi).
- **Segmented Status Bar**: Visualisasi proporsi arus kas (Tiket Terbayar, Refund/Batal, Pending) dan status penanganan keluhan penumpang.
- Seluruh visualisasi responsif dan ramah sentuhan di layar ponsel cerdas, iPad/tablet, hingga monitor desktop resolusi tinggi.

### 2. Kemampuan Ekspor Data:
- **Admin**:
  - Ekspor Seluruh Jadwal Kereta (`.csv`)
  - Ekspor & Cetak Manifest Penumpang Per Jadwal (`.csv` & `.pdf` Print)
  - Ekspor Katalog 25 Kredensial Petugas (`.csv`)
  - Ekspor Rekap Seluruh Pemesanan (`.csv`)
  - Ekspor Database Pengguna (`.csv`)
- **Petugas**:
  - Ekspor Manifest Penumpang KA yang Ditugaskan (`.csv`)
  - Cetak Lembar Manifest Fisik Perjalanan (`.pdf` Print)
  - Ekspor Log / Riwayat Validasi Tiket Scanner (`.csv`)
  - Ekspor Rekap Pesanan Kuliner Onboard Dining (`.csv`)


