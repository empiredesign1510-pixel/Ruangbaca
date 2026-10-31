# Prompt Vibe Coding V3 — RuangBaca Reader-First

Buat aplikasi perpustakaan digital **reader-first** bernama RuangBaca. Ketika website dibuka, pengguna harus langsung melihat PDF sebagai buku terbuka—bukan landing page dan bukan diarahkan ke Google Drive.

## Product direction

- Primary surface: **Explore + Read**, bukan marketing landing page.
- Desktop: sidebar koleksi di kiri, toolbar tipis di atas, buku dua halaman di tengah, kontrol halaman di bawah.
- Mobile: sidebar menjadi drawer dan buku tampil satu halaman.
- Google Drive hanya berfungsi sebagai penyimpanan belakang layar. Pengunjung tidak boleh dilempar ke UI Google Drive.

## Visual direction

- Modern editorial, tenang, premium, dan fokus membaca.
- Dark olive canvas dengan kertas warm ivory.
- Warna: `#111411`, `#191D19`, `#F8F3E9`, burgundy `#A94C55`, gold `#D8A55D`.
- Heading: Newsreader/Fraunces. UI: DM Sans/Manrope.
- Hindari glassmorphism berlebihan, gradient teknologi ungu-biru, kartu SaaS, dan landing hero generik.

## Reader requirements

- PDF.js merender PDF langsung di website.
- Otomatis membuka buku pertama ketika aplikasi dimuat.
- Desktop dua halaman; ponsel satu halaman.
- Navigasi: tombol kiri/kanan, keyboard, swipe/drag, dan slider.
- Zoom, layar penuh, nomor halaman, loading, serta error state.
- Lazy-render halaman aktif saja dan batalkan render lama ketika navigasi cepat.
- Tombol “Buka PDF sendiri” menggunakan File API sehingga pengguna dapat membaca PDF lokal tanpa upload.
- Mendukung query `?pdf=URL_PDF` untuk pengujian URL CORS-enabled.
- Semua kontrol accessible dan mobile hit target minimal 44 px.

## Google Drive production architecture

Frontend menerima katalog JSON yang berisi:

```json
{
  "books": [
    {
      "id": "drive-file-id",
      "title": "Judul",
      "author": "Penulis",
      "category": "Novel",
      "pdfUrl": "/api/pdf?id=drive-file-id"
    }
  ]
}
```

Backend harus memindai folder Drive secara rekursif, mengikuti shortcut, mencegah loop, dan menyediakan route `pdfUrl` yang mengirim byte PDF dengan `Content-Type: application/pdf`, dukungan range request, cache, dan CORS yang sesuai. OAuth token dan service-account key tidak boleh berada di frontend.

Folder sumber:
`https://drive.google.com/drive/folders/11jov9nAQ3aWPFZh17U63dlpo662R7hSS`

## Deliverables

- `index.html` reader-first responsif.
- `demo-book.pdf` yang otomatis terbuka untuk membuktikan bahwa PDF benar-benar dirender.
- `README.md` berisi cara menjalankan dan integrasi backend.
- Tidak boleh mengklaim koleksi demo sebagai isi Drive.
- Verifikasi: PDF tampil, halaman berpindah, zoom berjalan, file lokal dapat dipilih, dan console tanpa error.
