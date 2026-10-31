# RuangBaca v6.1 — Immersive Bookshelf

Perpustakaan digital dengan katalog seperti rak buku, cover otomatis dari halaman pertama PDF, kategori Google Drive, animasi membuka buku, serta reader responsif.

## Penggunaan

1. Deploy isi project ke Vercel.
2. Tekan **Tambah koleksi**.
3. Paste link folder Google Drive.
4. Tekan **Tampilkan semua PDF**.

Konektor Google Apps Script sudah tertanam di aplikasi. Pengguna tidak perlu memasukkan URL konektor atau Google Drive API key.

## Fitur

- Kategori mengikuti folder Google Drive.
- Pencarian judul, kategori, dan path folder.
- Cover dibuat otomatis dari halaman pertama PDF.
- Lazy loading dan cache cover di browser.
- Animasi cover menuju reader.
- Dua halaman di desktop dan satu halaman di HP.
- Swipe, tombol halaman, slider, zoom 65–180%, fullscreen, dan keyboard arrow.
- Light/dark mode.
- Katalog besar dirender bertahap per kategori.

## Struktur penting

- `index.html` — struktur aplikasi.
- `styles.css` — UI katalog, rak, dan reader.
- `app.js` — katalog, konektor internal, cover, kategori, animasi, dan reader.
- `api/pdf.js` — proxy streaming PDF publik dari Google Drive.
- `apps-script/Code.gs` — salinan source konektor untuk pemeliharaan.
- `vercel.json` — konfigurasi deployment.

## Izin Drive

Folder utama, file PDF, serta target shortcut harus dapat diakses oleh akun Apps Script. File yang dibaca melalui endpoint publik harus memiliki izin **Anyone with the link → Viewer**.

## Pengujian lokal

```bash
node --test tests/api.test.js
python3 tests/mock_server.py
```

Lalu buka `http://127.0.0.1:8767/index.html`.

## Catatan

- Katalog Apps Script di-cache selama 15 menit.
- Cover pertama kali muncul bertahap karena halaman pertama PDF dirender secara lazy.
- URL Apps Script bukan kredensial rahasia, tetapi penggantian deployment memerlukan pembaruan konstanta `CONNECTOR_URL` di `app.js`.
- Pastikan koleksi yang dipublikasikan memiliki hak distribusi yang sesuai.
