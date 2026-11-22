// Teks dan daftar halaman Fitur Lengkap per peran (`/produk/fitur`), versi 2.
// Sumber teks: naskah "Naskah Halaman Fitur Lengkap v2" (22 Nov 2026), bagian A sampai
// E, ditempel apa adanya. Struktur dan ukuran dari desain kanvas (Fitur.dc.html dan
// Fitur-Seluler.dc.html, versi 64). Bila desain dan naskah berbeda, naskah menang.
// Teks dua versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata
// berwarna aksen.
//
// Sepuluh peran ada di data/fiturPeran/ (satu berkas per tab), diekspor ulang di sini
// sebagai PERAN. Bentuk satu peran:
//   { label: {web, mobile}, judul, deskripsi: {web, mobile},
//     tata: 'penuh' | 'ringkas' | 'grup',   // tampilan kartu di web (seluler: ringkas,
//                                           // kecuali 'grup')
//     akordeon?: true,                      // seluler: grup bisa dilipat
//     ikonGrup?: { [nama grup]: ikon },     // hanya untuk tata 'grup'
//     verifikasi?, tautanLuar?: { label }, catatan?: { teks, verifikasi? },
//     sub: [{ judul?, kartu: [{ grup, ikon, judul, deskripsi: {web, mobile}, tag: [],
//                               chip?: 'uji-terbatas' | 'segera', verifikasi? }] }] }
//
// Status fitur: hanya dua chip, 'uji-terbatas' dan 'segera' (lib/fitur.js,
// STATUS_CHIP). Fitur yang sudah berjalan tidak punya `chip` dan tampil tanpa label.
// Kartu tanpa chip yang bertanda `verifikasi` dianggap sudah dipakai hanya sementara,
// sampai pemakaian di sekolah dikonfirmasi.
//
// `verifikasi` (true atau teks label) = butir [V: H-x] di bagian H naskah. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala. Butir yang di bagian H sudah
// terkonfirmasi pemilik (22 Nov) tidak diberi penanda.
//
// Tidak ada angka hitungan (jumlah modul, peran, fitur) yang ditulis tangan di halaman
// ini; hero tiga butir tanpa angka (naskah A, H-18). Bila suatu hari angka ditampilkan,
// turunkan dari data (mis. jumlahKartu di lib/fitur.js), jangan ketik ulang.
//
// Berkas ini tidak mengimpor ./nav (node:test memuatnya untuk memeriksa data): tautan
// Prakersa (URL_MODUL_SMK) dipasang di komponen halaman.
//
// Batas deskripsi kartu: web maksimal 14 kata, seluler maksimal 8 (dijaga
// lib/fiturData.test.js).
import { IconBuilding, IconDeviceMobile, IconUsers } from '@tabler/icons-react';

export { PERAN } from './fiturPeran/index.js';

export const META = {
  title: 'Fitur Lengkap per Peran | Absenin Aja',
  description:
    'Fitur Absenin Aja untuk admin, guru, wali, murid, Waka, Guru BK, dan kepala sekolah. Fitur yang belum berjalan diberi label uji terbatas atau segera.',
};

export const HERO = {
  eyebrow: 'Produk · Fitur',
  judul: {
    web: 'Satu data sekolah, *tampilan sendiri untuk tiap peran.*',
    mobile: 'Satu data sekolah, *tampilan tiap peran.*',
  },
  sub: {
    web: 'Pilih peran untuk melihat fitur yang tersedia. Fitur yang belum berjalan diberi label uji terbatas atau segera.',
    mobile: 'Pilih peran, lihat fitur dan labelnya.',
  },
  aksiUtama: { label: 'Jadwalkan demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat paket', rute: 'paket' },
  // Tiga butir tanpa angka hitungan (naskah A, H-18). Semua bisa dibuktikan dari kode.
  statistik: [
    { ikon: IconDeviceMobile, angka: 'Web + HP', label: 'Satu data sekolah', kecil: true },
    { ikon: IconUsers, angka: 'Per peran', label: 'Tampilan sendiri', kecil: true },
    { ikon: IconBuilding, angka: 'Per sekolah', label: 'Data terpisah', kecil: true },
  ],
};

// Bar tab peran (naskah C): label tablist dan tombol geser.
export const LABEL_TAB = 'Pilih peran';
export const LABEL_PANAH = { kiri: 'Geser peran ke kiri', kanan: 'Geser peran ke kanan' };

// E0. Banner Analitik, tampil di bawah panel tab pada semua tab. Chip Segera dan teks
// rencana; kalimat tanda tangan produk tidak diulang di sini (dipakai di kartu LAKSANA
// tab Guru). Tombol menuju halaman Analitik (nonaktif bila gerbang LAD mati).
export const ANALITIK = {
  id: 'analitik-guru',
  label: 'Untuk guru',
  chip: 'segera',
  judul: 'Analitik pembelajaran untuk guru',
  deskripsi: {
    web: 'Guru akan melihat murid yang perlu perhatian, dari nilai dan kehadiran kelas.',
    mobile: 'Guru akan melihat murid yang perlu perhatian.',
  },
  tag: ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'],
  aksi: { label: 'Lihat Analitik', rute: 'analitik' },
  verifikasi: 'Verifikasi H-5', // banner dan kartu LAKSANA harus berubah bersamaan
};

// Data peraga "Perlu perhatian". Semua angka dan nama adalah contoh, bukan data sekolah;
// `label` tampil permanen sebagai penanda "Data contoh".
// DUMMY: ganti dengan data produksi bila peraga diganti tangkapan layar asli.
export const MOCK_PERHATIAN = {
  judul: 'Perlu perhatian',
  label: 'Data contoh',
  ringkasan: [
    { label: 'Kelas', nilai: '5' },
    { label: 'Hadir rata-rata', nilai: '92%' },
    { label: 'Perlu perhatian', nilai: '3' },
  ],
  baris: [
    { teks: 'Ahmad F. tujuan 1.2 belum tuntas', aksi: 'Remedial' },
    { teks: 'Ahmad F. kehadiran menurun', aksi: 'Pantau' },
    { teks: 'Ahmad F. nilai proyek kosong', aksi: 'Lengkapi' },
  ],
};

// E1. Blok Prakersa. Tautan (URL_MODUL_SMK) dipasang di StripPrakersa.
export const PRAKERSA = {
  eyebrow: 'Khusus SMK dan MAK',
  judul: 'Jurusan, kompetensi, dan PKL ada di Prakersa',
  sub: {
    web: 'Profil kesiapan kerja murid dari kelas 10 sampai PKL, dengan data yang tersambung ke Absenin Aja.',
    mobile: 'Kesiapan kerja murid, kelas 10 sampai PKL.',
  },
  verifikasi: 'Verifikasi H-17',
  chip: 'uji-terbatas', // ditetapkan pemilik, 22 Nov
  catatan: { web: 'Jurusan dan PKL diaktifkan per sekolah.', mobile: 'Diaktifkan per sekolah.' },
  aksi: { label: 'Buka Prakersa' },
};

// E2. Blok keamanan dan hak akses. Hanya klaim yang terbukti di kode (H-9); enkripsi,
// lokasi server, PSE, kepatuhan UU PDP, dan sertifikasi sengaja tidak ditulis.
export const KEAMANAN = {
  judul: {
    web: 'Akses sesuai peran, data tiap sekolah terpisah',
    mobile: 'Akses sesuai peran, data sekolah terpisah',
  },
  sub: {
    web: 'Tiap peran membuka tampilan dan data sesuai tugasnya.',
    mobile: 'Tiap peran melihat data sesuai tugasnya.',
  },
  butir: [
    'Akses sesuai peran: admin, guru, wali, dan murid melihat data sesuai tugasnya.',
    'Data tiap sekolah terpisah dari sekolah lain.',
    'Pegawai yang berhenti diberi status nonaktif beserta alasannya.',
    'Sandi awal wajib diganti.',
  ],
  aksi: { label: 'Lihat keamanan data', rute: 'keamananData' },
};

// E3. CTA penutup. "gratis" dan "tanpa komitmen" tidak dipakai (H-20).
export const CTA = {
  judul: 'Demo bisa dimulai dari peran mana pun.',
  sub: {
    web: 'Jadwalkan demo untuk melihat yang sudah berjalan dan yang masih segera, peran demi peran.',
    mobile: 'Jadwalkan demo, lihat yang sudah berjalan.',
  },
  aksiUtama: { label: 'Jadwalkan demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat paket', rute: 'paket' },
};
