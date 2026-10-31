# RuangBaca v6.3 — All Drive Categories

RuangBaca menampilkan kategori berdasarkan seluruh folder dan shortcut folder tingkat utama di Google Drive, lalu memuat semua buku ketika kategori dipilih.

## Perbaikan v6.3

- Membaca semua kategori utama, termasuk shortcut seperti **Self Improvement**.
- Tidak lagi memindai 2.500 PDF secara depth-first dari kategori pertama.
- Setiap kategori dimuat terpisah agar kategori besar tidak menutupi kategori lain.
- Maksimal 2.500 buku per kategori, naik dari 300 buku.
- Pemindaian folder menggunakan round-robin/BFS, deduplikasi, dan pencegahan loop shortcut.
- Cover menggunakan thumbnail Google Drive terlebih dahulu; PDF.js menjadi fallback.
- Frontend tetap kompatibel dengan konektor lama, tetapi hasil konektor lama ditandai sebagai koleksi sementara dan mungkin tidak lengkap.
- Cache-busting `v6.3.0` mencegah Chrome HP memakai JavaScript versi lama.

## Kenapa sebelumnya hanya dua kategori?

Frontend sudah baru, tetapi deployment Google Apps Script aktif masih memakai `Code.gs` lama. Konektor lama memindai seluruh koleksi secara depth-first dan berhenti setelah 2.500 PDF. Akibatnya kategori **Belajar AI** dan **Persiapan UTBK** menghabiskan batas sebelum kategori lain diperiksa.

Tulisan “mode kompatibilitas” pada website berarti deployment Apps Script belum diperbarui.

## WAJIB: update Web App Google Apps Script

Upload GitHub saja tidak mengubah Google Apps Script.

1. Buka project Apps Script yang dipakai RuangBaca.
2. Buka file `Code.gs`.
3. Hapus seluruh isinya, lalu paste isi `apps-script/Code.gs` dari paket ini.
4. Klik **Deploy → Manage deployments**.
5. Klik ikon pensil pada Web App aktif.
6. Pilih **New version**.
7. Klik **Deploy**.

Gunakan deployment yang sama agar URL `/exec` tidak berubah.

## Publish GitHub/Vercel

Upload seluruh isi ZIP ke root repository. File minimal yang berubah:

```text
index.html
app.js
README.md
apps-script/Code.gs
```

`apps-script/Code.gs` di GitHub hanya source/backup. Langkah deployment Apps Script di atas tetap wajib.

## Cara kerja setelah update

1. Paste link folder Google Drive.
2. Semua kategori utama langsung ditampilkan.
3. Pilih kategori seperti **Self Improvement**.
4. Seluruh PDF dalam kategori tersebut dipindai dan ditampilkan, sampai batas 2.500 buku per kategori.
5. Katalog kategori di-cache selama 15 menit.

## Pengujian

```bash
node --test tests/api.test.js
python3 tests/mock_server.py
```

Buka `http://127.0.0.1:8767/index.html`.

## Catatan izin

- Folder utama, subfolder, dan target shortcut harus dapat diakses akun yang menjalankan Apps Script.
- PDF yang dibaca melalui website harus memiliki izin **Anyone with the link → Viewer**.
- Pastikan koleksi yang dipublikasikan memiliki hak distribusi yang sesuai.
