# RuangBaca v6.2 — Fast Categories & Covers

Perpustakaan digital dengan katalog Google Drive, kategori dinamis, cover halaman pertama, animasi membuka buku, dan reader responsif.

## Perbaikan v6.2

- Kategori utama dibaca terlebih dahulu tanpa menunggu pemindaian ribuan PDF.
- Buku dimuat saat kategori dipilih, maksimal 300 buku per kategori per sesi.
- Pemindaian Apps Script memakai round-robin/BFS agar satu folder besar tidak menghabiskan seluruh batas katalog.
- Cover menggunakan thumbnail Google Drive yang biasanya tampil sekitar satu detik.
- PDF.js hanya digunakan sebagai fallback jika thumbnail Drive gagal.
- URL Apps Script tetap tertanam; pengguna hanya paste link folder Drive.

## WAJIB: perbarui deployment Apps Script

Perubahan `Code.gs` di GitHub tidak otomatis memperbarui Web App Apps Script.

1. Buka project Apps Script yang URL-nya dipakai RuangBaca.
2. Ganti seluruh isi editor dengan file terbaru `apps-script/Code.gs`.
3. Klik **Deploy → Manage deployments**.
4. Klik ikon pensil/edit pada deployment Web App.
5. Pada **Version**, pilih **New version**.
6. Klik **Deploy**.

Gunakan deployment yang sama agar URL `/exec` tidak berubah.

## Publish website

Upload semua isi ZIP ke root repository GitHub yang terhubung ke Vercel. Minimal file yang wajib berubah:

```text
app.js
index.html
README.md
apps-script/Code.gs
```

`apps-script/Code.gs` di GitHub hanya menjadi source/backup; tetap lakukan langkah deployment Apps Script di atas.

## Cara penggunaan

1. Tekan **Tambah koleksi**.
2. Paste link folder Google Drive.
3. Tekan **Tampilkan koleksi**.
4. Pilih kategori; buku kategori tersebut akan dimuat ketika dibutuhkan.

## Fitur reader

- Cover otomatis halaman pertama.
- Dua halaman di desktop, satu halaman di HP.
- Swipe, tombol halaman, slider, zoom 65–180%, fullscreen, dan keyboard arrow.
- Light/dark mode.
- Cache katalog dan cover.

## Pengujian lokal

```bash
node --test tests/api.test.js
python3 tests/mock_server.py
```

Buka `http://127.0.0.1:8767/index.html`.

## Catatan

- Katalog Apps Script di-cache selama 15 menit.
- Kategori ditampilkan cepat, lalu isi kategori dimuat on-demand.
- File dan target shortcut harus dapat diakses oleh akun Apps Script.
- PDF yang dibuka melalui website harus memiliki izin **Anyone with the link → Viewer**.
- Pastikan koleksi yang dipublikasikan memiliki hak distribusi yang sesuai.
