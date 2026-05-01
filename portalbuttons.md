Ide Konten & Fungsi untuk 4 Tombol
1. Lapor
Gunakan untuk laporan masalah lingkungan / keamanan.
Konten:
form singkat: kategori, deskripsi, lokasi, foto (opsional).
tombol Kirim Laporan.
Backend:
route POST /report
simpan ke koleksi Report
kirim notifikasi ke admin / grup Telegram
UX:
beri feedback Laporan terkirim
tampilkan daftar laporan terakhir di halaman Notif atau Home
2. Tamu
Gunakan untuk mencatat tamu atau delivery.
Konten:
form: nama tamu, no hp tamu, tujuan, no rumah yang dikunjungi
status: Menunggu persetujuan / Sudah masuk
Backend:
route POST /guest
simpan ke koleksi Guest
kirim notifikasi ke pemilik rumah jika dipilih
UX:
bisa menampilkan daftar tamu hari ini
action Sudah pulang atau Batalkan
3. Darurat
Gunakan untuk kontak langsung saat butuh bantuan cepat.
Konten:
langsung tombol panggil beberapa layanan:
Satpam RT
Ambulans
Pemadam
atau form singkat: jenis darurat + lokasi + pesan
Backend:
route POST /emergency
simpan log darurat
kirim alert Telegram ke admin / buzzer
UX:
tampilkan nomor darurat penting
konfirmasi sebelum mengirim alert
4. Info
Gunakan untuk akses informasi RT / layanan.
Konten:
daftar informasi penting:
jadwal ronda
nomor telepon admin
lokasi pos keamanan
aturan / pengumuman terbaru
Backend:
bisa dari API GET /info atau data statis
UX:
tampilkan sebagai daftar card
tambahkan tombol Refresh atau Lihat detail
Struktur Saran
Lapor dan Darurat = aksi langsung / submit
Tamu = catatan tamu dan notifikasi tetangga
Info = referensi / data statis
Prioritas Implementasi
Darurat — paling penting untuk keamanan
Lapor — fitur komunikasi warga
Tamu — manajemen tamu
Info — dukungan dan panduan RT
Jika mau, saya bisa bantu buat struktur HTML + JS sederhana untuk keempat tombol ini.