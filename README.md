# RuangBaca v5 — Paste Link Google Drive

Versi ini tidak memakai `GOOGLE_DRIVE_API_KEY`. Katalog dibaca melalui Google Apps Script, sedangkan PDF publik dialirkan melalui endpoint Vercel `/api/pdf` agar tetap terbuka di reader RuangBaca.

## Fitur

- Paste link folder Google Drive dari HP.
- Memindai PDF, subfolder, dan shortcut folder secara rekursif.
- Mencegah loop dan duplikasi file.
- Maksimum 2.500 PDF, kedalaman 10 folder.
- Katalog dirender per 100 buku agar 1.999+ item tidak membuat HP berat.
- Mobile satu halaman; desktop dua halaman.
- Swipe, tombol navigasi, slider, zoom, fullscreen, dan PDF lokal.
- Tidak membutuhkan Google Cloud API key atau environment variable Vercel.

## Setup konektor Apps Script — satu kali

1. Buka `https://script.google.com` memakai akun Google yang dapat membaca folder.
2. Pilih **New project**.
3. Buka file `apps-script/Code.gs` dari paket ini, salin seluruh isinya, lalu tempel menggantikan isi editor Apps Script.
4. Klik **Deploy → New deployment**.
5. Pilih type **Web app**.
6. Atur:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Klik **Deploy**, setujui otorisasi Drive, lalu salin URL yang berakhir `/exec`.
8. Jangan memakai URL `/dev`.

`apps-script/appsscript.json` disertakan sebagai referensi manifest, tetapi setup paling sederhana hanya membutuhkan `Code.gs`.

## Deploy website ke Vercel

Upload seluruh isi paket sebagai root project. Pastikan file berikut ikut:

- `index.html`
- `api/pdf.js`
- `package.json`
- `vercel.json`
- `demo-book.pdf`

Tidak perlu menambahkan `GOOGLE_DRIVE_API_KEY` atau `DRIVE_FOLDER_ID`.

## Cara menggunakan

1. Buka RuangBaca.
2. Tekan menu koleksi.
3. Tekan **Tambah folder Drive**.
4. Paste link folder Google Drive.
5. Paste URL Apps Script `/exec` pada setup pertama.
6. Tekan **Tampilkan semua PDF**.

URL konektor dan folder disimpan di `localStorage` perangkat. Pada pembukaan berikutnya katalog akan tersinkron otomatis.

## Izin Google Drive

Folder utama dan file yang akan dibaca harus berizin:

```text
Anyone with the link → Viewer
```

Target shortcut juga harus dapat diakses. Konektor Apps Script dapat membaca katalog menggunakan akun pemilik script, tetapi endpoint PDF Vercel hanya dapat mengunduh file yang publik.

## Pengujian

```bash
node --test tests/api.test.js
python3 tests/mock_server.py
```

Kemudian buka `http://127.0.0.1:8767/index.html`. Untuk simulasi konektor, gunakan:

```text
Link folder: https://drive.google.com/drive/folders/11jov9nAQ3aWPFZh17U63dlpo662R7hSS
URL konektor: http://127.0.0.1:8767/apps-script
```

## Batasan

- Apps Script mempunyai kuota dan batas waktu eksekusi. Katalog besar pertama kali dapat membutuhkan waktu lebih lama; hasilnya di-cache 15 menit.
- PDF privat tidak dapat dibaca endpoint Vercel tanpa OAuth. Gunakan izin publik hanya untuk dokumen yang memang boleh didistribusikan.
- Jangan mempublikasikan koleksi tanpa memastikan hak distribusinya.
