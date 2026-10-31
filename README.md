# RuangBaca v6 — Immersive Bookshelf

Upgrade UI/UX perpustakaan digital dengan katalog seperti rak buku, cover otomatis dari halaman pertama PDF, kategori Google Drive, animasi membuka buku, dan reader responsif.

## Fitur baru

- Katalog modern terinspirasi rak toko buku.
- Kategori otomatis mengikuti folder tingkat pertama di Google Drive.
- Pencarian judul, kategori, dan path folder.
- Cover dibuat otomatis dari halaman pertama setiap PDF.
- Cover dimuat secara lazy, maksimal dua proses bersamaan, lalu disimpan di Cache Storage browser.
- Klik cover menjalankan animasi buku terbuka sebelum masuk ke reader.
- Reader dua halaman di desktop dan satu halaman di HP.
- Swipe, tombol halaman, slider, zoom 65–180%, fullscreen, dan keyboard arrow.
- Light mode dan dark mode tersimpan otomatis.
- Katalog besar dirender bertahap per kategori agar tetap ringan.
- Tidak membutuhkan Google Drive API key.

## Setup Apps Script — satu kali

1. Buka `https://script.google.com` dan buat project baru.
2. Salin seluruh isi `apps-script/Code.gs` ke editor Apps Script.
3. Pilih **Deploy → New deployment → Web app**.
4. Atur **Execute as: Me** dan **Who has access: Anyone**.
5. Setujui otorisasi Drive dan salin URL yang berakhir `/exec`.

## Deploy ke Vercel

Upload seluruh isi ZIP sebagai root project. Tidak ada environment variable yang wajib ditambahkan.

File utama:

- `index.html`
- `styles.css`
- `app.js`
- `api/pdf.js`
- `apps-script/Code.gs`
- `vercel.json`

## Menghubungkan koleksi

1. Buka website.
2. Tekan **Tambah koleksi**.
3. Paste link folder Google Drive.
4. Paste URL Apps Script `/exec` pada setup pertama.
5. Tekan **Tampilkan semua PDF**.

Folder utama, file PDF, dan target shortcut harus dapat diakses sebagai **Anyone with the link → Viewer** agar cover dan PDF dapat dibaca melalui proxy Vercel.

## Performa cover

Cover tidak dibuat sekaligus untuk seluruh koleksi. Hanya kartu yang mendekati area layar yang diproses. Hasil cover disimpan di browser sehingga kunjungan berikutnya lebih cepat.

## Pengujian lokal

```bash
node --test tests/api.test.js
python3 tests/mock_server.py
```

Buka `http://127.0.0.1:8767/index.html`, lalu gunakan:

```text
Folder: https://drive.google.com/drive/folders/11jov9nAQ3aWPFZh17U63dlpo662R7hSS
Konektor: http://127.0.0.1:8767/apps-script
```

## Catatan

- Apps Script memiliki kuota dan batas waktu eksekusi; hasil katalog di-cache 15 menit.
- Cover pertama kali membutuhkan akses ke PDF, sehingga akan muncul bertahap.
- PDF privat tidak dapat dialirkan oleh endpoint publik Vercel.
- Pastikan koleksi yang dipublikasikan memiliki hak distribusi yang sesuai.
