# RuangBaca V3 — Reader-First

Website perpustakaan digital yang langsung membuka PDF sebagai buku, tanpa mengarahkan pembaca ke Google Drive.

## Menjalankan

Karena PDF.js perlu memuat file PDF melalui HTTP, jalankan folder ini menggunakan server lokal:

```bash
python3 -m http.server 8080
```

Buka `http://localhost:8080`.

`demo-book.pdf` otomatis tampil ketika website dibuka.

## Fitur

- PDF benar-benar dirender menggunakan PDF.js
- Tampilan dua halaman di desktop dan satu halaman di ponsel
- Swipe/drag, keyboard, tombol navigasi, dan slider halaman
- Zoom dan layar penuh
- Sidebar koleksi responsif
- Buka PDF lokal dari perangkat tanpa upload
- Dukungan pengujian URL: `?pdf=https://domain/file.pdf`

## Integrasi Drive

Google Drive tetap menjadi sumber penyimpanan. Website produksi membutuhkan backend dengan dua fungsi:

1. Menghasilkan katalog buku dari folder Drive dan shortcut di dalamnya.
2. Menyediakan route seperti `/api/pdf?id=FILE_ID` yang mengirim byte PDF secara langsung kepada PDF.js.

`pdfUrl` harus same-origin atau mengizinkan CORS. Tautan halaman preview Google Drive tidak digunakan sebagai pembaca utama.

Folder sumber:
`https://drive.google.com/drive/folders/11jov9nAQ3aWPFZh17U63dlpo662R7hSS`

Token OAuth, service-account key, dan kredensial tidak boleh ditaruh di frontend.
