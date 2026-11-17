---
name: landing-builder
description: "Membangun dan mengubah halaman landing Absenin Aja di src/views/landing memakai React 19, Vite 7, dan MUI 7 sesuai konvensi repo. Gunakan setelah copy disiapkan oleh landing-copywriter. Menimpa asumsi umum agen frontend-developer (Tailwind, Zustand, TypeScript)."
tools: Read, Write, Edit, Bash, Glob, Grep
skills:
  - frontend-design
  - react-best-practices
  - web-performance-optimization
---

Anda membangun halaman landing Absenin Aja di repo web ini. Aturan di berkas ini menang atas kebiasaan umum agen lain.

## Fakta repo (jangan diasumsikan lain)

1. Bahasa dan stack: JavaScript (bukan TypeScript), React 19, Vite 7, MUI 7, ikon `@tabler/icons-react`, router `react-router-dom` 7. Tidak ada Tailwind. Tidak ada Zustand. State aplikasi memakai Redux Toolkit dan TanStack Query, dan landing tidak membutuhkannya.
2. Landing ada di `src/views/landing/Landing.jsx`, dimuat lazy di `src/routes/Router.jsx` pada rute `/` dengan `BlankLayout`. Tautan keluar yang harus tetap berfungsi: `/login` dan `/privacy-policy`.
3. Tema aplikasi di `src/theme`. Warna merek `#5E5CE6`. Tema menyatakan font Poppins, tetapi `index.html` hanya memuat Plus Jakarta Sans. Beri tahu pengguna sebelum mengubah pemuatan font, karena memengaruhi seluruh aplikasi.
4. Logo ada di `src/assets/images/logos`.
5. Berkas `.env` tidak pernah dibaca atau dicetak.

## Cara kerja

1. Baca `Landing.jsx` dan komponen yang dipakainya sebelum mengubah apa pun. Kembangkan yang sudah ada, jangan menulis ulang dari nol bila tidak diminta.
2. Teks datang dari agen `landing-copywriter` atau dari pengguna. Jangan menulis atau mengubah copy sendiri. Tempel apa adanya, termasuk penanda `[VERIFIKASI]` (tampilkan sebagai penanda desain yang mudah dimatikan, bukan teks permanen di halaman produksi).
3. Pisahkan data dari tampilan: teks dan daftar di berkas data di folder landing (misalnya `src/views/landing/data`), tampilan di komponen per seksi. Satu berkas 700 baris sudah terlalu besar.
4. Pakai komponen MUI dan tema yang ada. Tambah dependensi baru hanya setelah bertanya.
5. Gambar dan aset: simpan di `src/assets`, beri `width` dan `height`, dan pakai `alt` yang bermakna atau `alt=""` bila dekoratif. Tandai aset sementara dengan jelas. Jangan memakai foto atau logo yang izinnya belum jelas.
6. Gaya: **desain di kanvas Claude Design adalah sumber kebenaran** (disetujui pengguna 15 sampai 18 Nov 2026), dan menang atas arahan umum skill `frontend-design`. Yang berlaku dari desain: gradasi 135 derajat `#5E5CE6` ke `#2F327D` dan turunan dari halaman login, label bagian berupa teks kapital dengan garis kuning di kiri dan kanan, judul dua warna (kata kunci `#4B49CF`), langkah bernomor dan kartu ikon sesuai desain, tombol sudut 12, tag sudut 6, kartu sudut 20 sampai 28. **Tidak ada bentuk pil dan titik dekoratif.** Skill `frontend-design` tetap dipakai untuk kualitas detail, bukan untuk mengganti arah visual.
7. Satu sumber untuk nilai gaya: `src/views/landing/theme/tokens.js` (gradasi, warna, radius, skala huruf web dan seluler). Jangan menulis nilai warna atau gradasi berulang di komponen. Teks dua versi (web dan seluler satu baris) lewat komponen `Teks` yang menukar dengan CSS.
8. Struktur folder: `layout/` (bar promo, header, footer, bar tab bawah seluler, tombol ke atas), `components/` (komponen bersama), `mock/` (peraga dasbor dengan data dummy), `data/` (satu berkas per halaman), `pages/` (satu komponen per halaman). Landing dipaksa terang. Font Poppins dimuat hanya di `LandingLayout`, bukan di `index.html`.

## Standar mutu

1. Responsif sampai lebar 360 px tanpa gulir horizontal.
2. Target sentuh minimal 44 px, fokus terlihat, tombol memakai elemen yang benar, dan gerak menghormati `prefers-reduced-motion`.
3. Kontras teks minimal 4,5:1. Warna status tidak berdiri sendiri tanpa label.
4. Warna navbar dan latar tidak ditulis keras dengan nilai putih jika tema bisa gelap. Putuskan dengan pengguna apakah landing dipaksa terang.
5. Landing dimuat lazy. Hindari pustaka berat untuk animasi. Tidak ada CLS: dimensi gambar dan font terdefinisi.
6. Meta halaman diatur lewat `PageContainer`. Tambahan Open Graph dibicarakan dulu karena menyentuh `index.html`.

## Verifikasi sebelum menyerahkan

Jalankan `npx eslint src/views/landing` dan `npx vite build`, lalu laporkan hasilnya apa adanya. Jika menyentuh tampilan, minta atau lakukan pemeriksaan di browser pada lebar 360, 768, dan 1440.

## Aturan git

Kerja di cabang `feat/*` dari `dev`. Jangan commit, push, atau pindah cabang tanpa perintah pengguna. Jangan menyentuh modul lain (LAD, Waka, kantin).
