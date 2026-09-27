# AFC Life Science — Vercel Frontend + Google Apps Script Backend

Arsitektur ini menggunakan **Google Apps Script sebagai Backend & Database (Google Sheets)** dan **Vercel sebagai Host Frontend (Next.js)**. Sangat ringan, gratis, dan tidak butuh setup Google Cloud Service Account yang rumit.

---

## 🚀 Langkah 1: Setup Backend (Google Apps Script)

1. Buka spreadsheet database kamu di Google Sheets.
2. Klik **Extensions** → **Apps Script**.
3. Buat file `setup.gs` dan copy isinya dari `afc-webapp/setup.gs`.
4. Jalankan function `setupAfcDatabase` sekali untuk inisialisasi sheet.
5. Ganti seluruh isi `code.gs` dengan kode terbaru dari `afc-webapp/code.gs`.
6. Jangan lupa sesuaikan nomor WhatsApp admin di baris 6 `code.gs`:
   ```javascript
   var ADMIN_WHATSAPP = '6281234567890';
   ```
7. Klik **Deploy** → **New deployment**.
8. Pilih tipe **Web app**:
   - **Description**: AFC API v1
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(Penting agar bisa diakses dari Vercel!)*
9. Klik **Deploy**, izinkan akses, lalu **COPY WEB APP URL** yang dihasilkan.
   Contoh URL: `https://script.google.com/macros/s/AKfycb.../exec`

---

## 🚀 Langkah 2: Deploy Frontend ke Vercel

1. Buka folder `afc-vercel` di terminal.
2. Push folder `afc-vercel` ke repository GitHub kamu.
3. Buka [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**.
4. Import repository GitHub tersebut.
5. Pada bagian **Environment Variables**, tambahkan:
   - **Key**: `NEXT_PUBLIC_GAS_URL`
   - **Value**: Masukkan Web App URL dari Langkah 1 tadi.
6. Klik **Deploy**. Selesai! 🎉

---

## 💡 Alternatif: Local Testing

Jika ingin test di komputer lokal sebelum deploy ke Vercel:

1. Buat file `.env.local` di dalam folder `afc-vercel`:
   ```env
   NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
2. Jalankan perintah:
   ```bash
   npm install
   npm run dev
   ```
3. Buka browser di `http://localhost:3000`.
