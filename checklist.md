# Smart RT - Roadmap Pengembangan

## 1. Fondasi & Stabilitas

- [ ] Buat `README.md` dengan:
  - cara install (`npm install`)
  - cara menjalankan (`npm start`, `npm run dev`)
  - daftar environment variable
- [ ] Buat `.env.example` atau dokumentasi konfigurasi:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `ADMIN_KEY`
  - `MQTT_URL`, `MQTT_USER`, `MQTT_PASS`
  - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_BUZZER_CHAT_ID`
- [ ] Periksa struktur folder dan file utama:
  - `server.js`
  - `routes/`
  - `models/`
  - `middleware/`
  - `services/`
  - `public/`
- [ ] Tambahkan script NPM yang jelas di `package.json`
  - `start`
  - `dev`
  - `test`

## 2. Backend & API

- [ ] Pastikan koneksi MongoDB stabil di `config/db.js`
- [ ] Buat validasi input lengkap di `routes/auth.js`
  - `username`, `password`, `nama`, `no_rumah`, `no_hp`
  - formatkan `no_hp` menjadi `+62...`
- [ ] Pastikan JWT authentikasi bekerja di `middleware/auth.js`
- [ ] Pastikan middleware admin aman di `middleware/admin.js`
- [ ] Tambahkan penanganan error konsisten di semua route
- [ ] Pastikan `routes/panic.js`:
  - memeriksa user valid
  - memeriksa status `pending` / `suspended`
  - menyimpan panic ke database
  - publish MQTT
  - kirim Telegram

## 3. User Flow & UI

- [ ] Selesaikan flow register + login di `public/app.js`
- [ ] Pastikan status user ditampilkan:
  - `pending`
  - `approved`
  - `suspended`
- [ ] Simpan token JWT di `localStorage`
- [ ] Implementasikan logout bersih
- [ ] Pastikan tombol PANIC hanya aktif untuk user yang diizinkan
- [ ] Tambahkan validasi frontend dan pesan error/sukses

## 4. Admin & Verifikasi

- [ ] Buat UI admin untuk:
  - melihat daftar user
  - melihat user pending
  - approval user
  - suspend / unsuspend user
  - hapus user
- [ ] Koneksikan UI admin ke API:
  - `GET /admin/users`
  - `GET /admin/pending`
  - `POST /admin/approve`
  - `PATCH /admin/user/:username/suspend`
  - `PATCH /admin/user/:username/unsuspend`
  - `DELETE /admin/user/:username`
- [ ] Kirim notifikasi Telegram saat admin menyetujui user

## 5. Realtime & Integrasi

- [ ] Pastikan MQTT client di `services/mqtt.js`:
  - reconnect otomatis
  - error handling
- [ ] Broadcast event `panic` melalui Socket.IO di `server.js`
- [ ] Konsumsi event realtime di frontend ketika tersedia
- [ ] Pastikan notifikasi alert tampil saat terjadi panic
- [ ] Evaluasi fallback Telegram jika gagal

## 6. Keamanan & Quality

- [ ] Sanitasi input dan validasi di backend
- [ ] Password hashing dengan `bcrypt`
- [ ] Lindungi endpoint admin dengan API key atau token
- [ ] Konfigurasi CORS di `server.js`
- [ ] Pastikan token tidak tersimpan di area publik
- [ ] Tambahkan batasan request / rate limiting jika perlu

## 7. Dokumentasi & Testing

- [ ] Buat dokumentasi arsitektur singkat
- [ ] Dokumentasikan alur:
  - registrasi
  - login
  - panic
  - verifikasi admin
- [ ] Tambahkan contoh `curl` atau Postman request untuk API penting
- [ ] Buat test minimal untuk:
  - register/login
  - panic
  - admin actions

## 8. Deployment & Operasional

- [ ] Rencanakan deployment ke server / cloud
- [ ] Siapkan environment production
- [ ] Pastikan service MQTT dan bot Telegram dapat dijalankan
- [ ] Buat backup/data recovery plan jika diperlukan

---

## Prioritas Rekomendasi

1. Stabilkan backend auth, panic, dan admin
2. Selesaikan UI login/register + portal user
3. Buat dashboard admin
4. Tambahkan realtime alert dan notifikasi
5. Siapkan deployment + dokumentasi