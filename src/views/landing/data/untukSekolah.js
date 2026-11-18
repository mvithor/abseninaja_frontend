// Teks dan daftar halaman Untuk Sekolah (`/produk/untuk-sekolah`). Disalin apa
// adanya dari desain kanvas (Untuk-Sekolah.dc.html dan Untuk-Sekolah-Seluler.dc.html).
// Teks dua versi berbentuk { web, mobile } dari gen/short.py. Tanda bintang pada
// judul (*kata*) = kata berwarna aksen.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Ganti
// dengan data produksi sebelum tayang. Penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
import { IconBriefcase, IconChartLine, IconSchool } from '@tabler/icons-react';
import { URL_MODUL_SMK } from './nav';

export const META = {
  title: 'Untuk Sekolah | Absenin Aja',
  description: 'Pilih jenis sekolah untuk melihat modul dan peran yang dipakai.',
};

export const HERO = {
  eyebrow: 'Produk · Untuk Sekolah',
  judul: 'Satu sistem untuk *dua jalur sekolah.*',
  sub: {
    web: 'Pilih jenis sekolah untuk melihat modul dan peran yang dipakai.',
    mobile: 'Pilih jenis sekolah untuk melihat modul.',
  },
  labelTab: 'Jenis sekolah',
};

// Dua jalur. `gaya` memilih gradasi kartu jenis (brand atau dark). Peran dengan
// `tag` menampilkan label berteks (selalu terlihat); `verifikasi` menampilkan
// penanda desain.
export const JENIS = [
  {
    id: 'umum',
    gaya: 'brand',
    ikon: IconSchool,
    nama: 'Sekolah umum',
    sub: 'SD, MI, SMP, MTs, SMA, MA',
    butir: [
      { teks: 'Absensi QR dan rekap otomatis' },
      { teks: 'Kabar kehadiran ke wali murid' },
      { teks: 'Analitik pembelajaran untuk guru' },
    ],
    peran: [
      { nama: 'Admin dan tata usaha', deskripsi: 'Kelola data, jadwal, dan keuangan.' },
      { nama: 'Kepala sekolah', deskripsi: 'Pantau kondisi sekolah di satu dasbor.' },
      { nama: 'Waka kurikulum', deskripsi: 'Pantau perangkat ajar guru.' },
      { nama: 'Guru', deskripsi: 'Absensi mapel dan analitik pembelajaran.' },
      { nama: 'Guru BK', deskripsi: 'Jurnal dan pemetaan konseling.' },
      // DUMMY: ganti dengan data produksi
      { nama: 'Wali murid', deskripsi: 'Kabar kehadiran dan tagihan.', verifikasi: 'Verifikasi aplikasi' },
    ],
    aksi: { label: 'Lihat Fitur Lengkap', rute: 'fitur' },
    strip: {
      ikon: IconChartLine,
      judul: 'Analitik pembelajaran untuk guru',
      teks: 'Tersedia untuk semua jenis sekolah, juga lewat akun guru mandiri.',
      aksi: { label: 'Lihat fitur', rute: 'fitur' },
      verifikasi: 'Status rilis diverifikasi', // DUMMY: ganti dengan data produksi
    },
  },
  {
    id: 'smk',
    gaya: 'dark',
    ikon: IconBriefcase,
    nama: 'SMK dan MAK',
    sub: 'Jurusan, kompetensi, dan PKL',
    butir: [
      { teks: 'Semua fitur sekolah umum' },
      { teks: 'Jurusan dan kompetensi SKKNI', verifikasi: true }, // DUMMY: ganti dengan data produksi
      { teks: 'Penempatan dan logbook PKL' },
    ],
    peran: [
      { nama: 'Admin dan tata usaha', deskripsi: 'Kelola data, jadwal, dan keuangan.' },
      { nama: 'Kepala sekolah', deskripsi: 'Pantau kondisi sekolah di satu dasbor.' },
      { nama: 'Guru', deskripsi: 'Absensi mapel dan analitik pembelajaran.' },
      { nama: 'Kepala jurusan', deskripsi: 'Kompetensi murid dan penempatan PKL.', tag: 'Di Prakersa' },
      { nama: 'Mitra industri', deskripsi: 'Memantau murid PKL dan memberi evaluasi.', tag: 'Di Prakersa' },
      // DUMMY: ganti dengan data produksi
      { nama: 'Wali murid', deskripsi: 'Kabar kehadiran dan tagihan.', verifikasi: 'Verifikasi aplikasi' },
    ],
    aksi: { label: 'Buka Prakersa', href: URL_MODUL_SMK },
    strip: {
      ikon: IconBriefcase,
      judul: 'Modul khusus SMK ada di Prakersa',
      teks: 'Jurusan, kompetensi SKKNI, dan penempatan PKL. Diaktifkan per sekolah.',
      aksi: { label: 'Buka Prakersa', href: URL_MODUL_SMK },
    },
  },
];

export const PERAN = { judul: 'Peran yang dipakai' };

export const PERBANDINGAN = {
  id: 'perbandingan-jalur',
  eyebrow: 'Perbedaan jalur',
  judul: 'Apa yang *berbeda* antara keduanya',
  caption: 'Perbandingan modul antara sekolah umum dan SMK dan MAK',
  kolom: { modul: 'Modul', umum: 'Sekolah umum', smk: 'SMK dan MAK' },
  // Status ditulis sebagai teks (ikon hanya pendamping): ada, tidak, prakersa.
  status: { ada: 'Tersedia', tidak: 'Tidak ada', prakersa: 'Di Prakersa' },
  baris: [
    { modul: 'Absensi QR', umum: 'ada', smk: 'ada' },
    { modul: 'Jadwal sekolah', umum: 'ada', smk: 'ada' },
    { modul: 'Keuangan dan SPP', umum: 'ada', smk: 'ada' },
    { modul: 'Analitik pembelajaran', umum: 'ada', smk: 'ada' },
    { modul: 'Jurusan dan kompetensi', umum: 'tidak', smk: 'prakersa' },
    { modul: 'PKL dan mitra industri', umum: 'tidak', smk: 'prakersa' },
  ],
};

export const CTA = {
  judul: 'Mulai dari jenis sekolah Anda',
  sub: {
    web: 'Jadwalkan demo. Kita tunjukkan modul yang relevan.',
    mobile: 'Jadwalkan demo, lihat modul relevan.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur', rute: 'fitur' },
};
