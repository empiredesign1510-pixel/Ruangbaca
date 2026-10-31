# RuangBaca Mobile + Google Drive

Reader PDF responsif untuk Vercel. Desktop menampilkan dua halaman, sedangkan ponsel menampilkan satu halaman penuh dengan swipe, tombol navigasi, slider, dan sidebar yang aman dari horizontal overflow.

## Struktur

- `index.html` — reader dan antarmuka katalog.
- `api/catalog.js` — memindai folder/subfolder Google Drive, mengikuti shortcut folder, mencegah loop, dan menghasilkan katalog JSON.
- `api/pdf.js` — proxy byte/range PDF agar dapat dibaca PDF.js tanpa membuka UI Google Drive.
- `.env.example` — nama environment variable yang dibutuhkan.
- `tests/api.test.js` — pengujian katalog dan proxy PDF.

## Konfigurasi Google Drive

1. Pastikan folder utama, target shortcut, dan PDF yang ingin ditampilkan dapat diakses melalui **Anyone with the link / Viewer**.
2. Di Google Cloud Console, aktifkan **Google Drive API**.
3. Buat API key dan batasi **API restrictions** hanya ke Google Drive API.
4. Di Vercel → Project → Settings → Environment Variables, tambahkan:

```text
GOOGLE_DRIVE_API_KEY=API_KEY_ANDA
DRIVE_FOLDER_ID=11jov9nAQ3aWPFZh17U63dlpo662R7hSS
```

5. Redeploy proyek.
6. Periksa `https://DOMAIN-ANDA/api/catalog`. Jika berhasil, respons berisi `ok: true`, `count`, dan daftar `books`.
7. Buka website. Katalog tersinkron otomatis; tombol **Sinkronkan ulang Drive** dapat digunakan untuk refresh.

API key tidak disimpan di frontend dan tidak boleh dimasukkan langsung ke `index.html`.

## Deploy ke Vercel

Upload seluruh isi folder ini sebagai root proyek, bukan hanya `index.html`. Folder `api/`, `package.json`, dan `vercel.json` harus ikut terunggah.

## Pengujian lokal

```bash
node --test tests/api.test.js
```

Untuk melihat UI statis:

```bash
python3 -m http.server 8765
```

API Vercel tidak berjalan melalui `http.server`; untuk pengujian API lokal gunakan Vercel CLI atau deploy preview.

## Catatan produksi

- Katalog dibatasi 2.500 PDF dan kedalaman delapan folder agar fungsi tidak berjalan tanpa batas.
- Shortcut folder diikuti melalui `shortcutDetails.targetId`; folder yang sudah dikunjungi tidak dipindai ulang.
- Proxy meneruskan HTTP Range dan frontend meminta chunk 1 MB untuk membantu PDF besar.
- Jika `/api/catalog` mengembalikan 403, cek API key, status Drive API, serta izin folder/target shortcut.
- Jangan mempublikasikan buku yang tidak memiliki izin distribusi.
