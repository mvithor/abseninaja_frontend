// Teks dan daftar halaman Fitur Lengkap (`/produk/fitur`). Disalin apa adanya
// dari desain kanvas (Fitur.dc.html dan Fitur-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile }; versi seluler satu baris dari gen/short.py (kunci
// = teks web persis). Tanda bintang pada judul (*kata*) = kata berwarna aksen.
//
// `verifikasi` (true atau teks label) = klaim atau angka contoh yang belum
// diverifikasi. Ganti dengan data produksi sebelum tayang. Penandanya tampil
// hanya bila flags.tampilkanPenandaDesain menyala.
import {
  IconBell,
  IconBook,
  IconCalendar,
  IconDeviceMobile,
  IconFileCheck,
  IconLayoutGrid,
  IconMessage,
  IconQrcode,
  IconShoppingBag,
  IconStack2,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { URL_MODUL_SMK } from './nav';

export const META = {
  title: 'Fitur Lengkap | Absenin Aja',
  description: 'Pilih modul yang dipakai. Tambah yang lain nanti.',
};

export const HERO = {
  eyebrow: 'Produk · Fitur',
  judul: 'Semua kebutuhan sekolah, *satu sistem.*',
  sub: {
    web: 'Pilih modul yang dipakai. Tambah yang lain nanti.',
    mobile: 'Pilih modul, tambah nanti.',
  },
  statistik: [
    // DUMMY: ganti dengan data produksi (angka diambil dari kode, belum diverifikasi)
    { ikon: IconStack2, angka: '12', label: 'Modul', verifikasi: true },
    // DUMMY: ganti dengan data produksi
    { ikon: IconLayoutGrid, angka: '10', label: 'Portal web', verifikasi: true },
    // DUMMY: ganti dengan data produksi
    { ikon: IconUsers, angka: '13', label: 'Peran pengguna', verifikasi: true },
    { ikon: IconDeviceMobile, angka: 'Web + HP', label: 'Satu data', kecil: true },
  ],
};

export const ANALITIK = {
  id: 'analitik-guru',
  label: 'Untuk guru',
  judul: 'Analitik pembelajaran untuk guru',
  deskripsi: {
    web: 'Guru melihat murid yang perlu perhatian, dari nilai dan kehadiran kelas.',
    mobile: 'Lihat murid yang perlu perhatian.',
  },
  tag: ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'],
  aksi: { label: 'Lihat Analitik', rute: 'analitik' },
  // DUMMY: ganti dengan data produksi (halaman Analitik tampil bersama rilis LAD)
  verifikasi: 'Status rilis diverifikasi',
};

// Data peraga "Perlu perhatian". Semua angka dan nama adalah contoh.
// DUMMY: ganti dengan data produksi bila peraga diganti tangkapan layar asli.
export const MOCK_PERHATIAN = {
  judul: 'Perlu perhatian',
  verifikasi: 'Data contoh',
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

// Kelompok modul (isi bar tab). `semua` menampilkan seluruh modul. Judul dan
// deskripsi dipakai pada kepala daftar di bawah bar tab.
export const KELOMPOK = {
  labelTab: 'Kelompok modul',
  eyebrow: 'Web dan seluler',
  daftar: [
    {
      id: 'semua',
      nama: 'Semua',
      judul: 'Semua modul',
      deskripsi: {
        web: 'Dua belas modul yang membaca satu data sekolah.',
        mobile: 'Dua belas modul, satu data sekolah.',
      },
    },
    {
      id: 'kehadiran',
      nama: 'Kehadiran dan jadwal',
      judul: 'Kehadiran dan jadwal',
      deskripsi: 'Dari gerbang sampai jam pelajaran, tercatat sekali.',
    },
    {
      id: 'data',
      nama: 'Data dan keuangan',
      judul: 'Data dan keuangan',
      deskripsi: 'Data murid dan pegawai, SPP, dan penerimaan murid baru.',
    },
    {
      id: 'komunikasi',
      nama: 'Komunikasi dan pembelajaran',
      judul: 'Komunikasi dan pembelajaran',
      deskripsi: 'Kabar ke wali, perangkat ajar, konseling, dan dasbor.',
    },
  ],
};

export const MODUL = [
  { kelompok: 'kehadiran', ikon: IconQrcode, judul: 'Absensi QR', deskripsi: 'Kartu QR saat datang dan pulang.', tag: ['Kartu QR', 'Datang', 'Pulang'] },
  { kelompok: 'kehadiran', ikon: IconUser, judul: 'Absensi mata pelajaran', deskripsi: 'Guru mencatat dari aplikasi seluler.', tag: ['Aplikasi guru', 'Per mapel'] },
  { kelompok: 'kehadiran', ikon: IconCalendar, judul: 'Jadwal sekolah', deskripsi: 'Kelas, mapel, ekskul, dan ujian.', tag: ['Kelas', 'Mapel', 'Ekskul', 'Ujian'] },
  { kelompok: 'kehadiran', ikon: IconFileCheck, judul: 'Izin dan rekap', deskripsi: 'Izin tercatat, rekap siap diunduh.', tag: ['Pengajuan izin', 'Rekap', 'Unduh'] },
  { kelompok: 'data', ikon: IconUsers, judul: 'Data murid dan pegawai', deskripsi: 'Murid, wali, guru, staf, dan kelas.', tag: ['Murid', 'Wali', 'Guru', 'Staf'] },
  { kelompok: 'data', ikon: IconWallet, judul: 'Keuangan dan SPP', deskripsi: 'Tagihan dan riwayat pembayaran.', tag: ['Tagihan', 'Riwayat bayar'] },
  {
    kelompok: 'data',
    ikon: IconUserPlus,
    judul: 'Penerimaan murid baru',
    deskripsi: { web: 'Dari pendaftaran sampai penempatan kelas.', mobile: 'Dari pendaftaran ke penempatan kelas.' },
    tag: ['Pendaftaran', 'Penempatan kelas'],
    verifikasi: true, // DUMMY: ganti dengan data produksi
  },
  {
    kelompok: 'data',
    ikon: IconShoppingBag,
    judul: 'Kantin',
    deskripsi: 'Saldo digital dan transaksi kantin.',
    tag: ['Saldo digital', 'Transaksi'],
    status: 'Segera',
    verifikasi: true, // DUMMY: ganti dengan data produksi
  },
  { kelompok: 'komunikasi', ikon: IconBell, judul: 'Kabar wali murid', deskripsi: 'Lewat aplikasi dan WhatsApp.', tag: ['Aplikasi', 'WhatsApp'] },
  { kelompok: 'komunikasi', ikon: IconBook, judul: 'Perangkat ajar', deskripsi: 'Unggah dan pantau dokumen guru.', tag: ['Unggah', 'Pantau'] },
  { kelompok: 'komunikasi', ikon: IconMessage, judul: 'Bimbingan konseling', deskripsi: 'Jadwal, jurnal, dan pemetaan BK.', tag: ['Jadwal', 'Jurnal', 'Pemetaan'] },
  { kelompok: 'komunikasi', ikon: IconLayoutGrid, judul: 'Dasbor kepala sekolah', deskripsi: 'Kondisi sekolah di satu layar.', tag: ['Ringkasan', 'Satu layar'] },
];

export const KEAMANAN = {
  judul: 'Keamanan dan hak akses',
  tag: ['Data tiap sekolah terpisah', 'Akses sesuai peran'],
  verifikasi: 'Rincian diverifikasi', // DUMMY: ganti dengan data produksi
  aksi: { label: 'Lihat Keamanan Data', rute: 'keamananData' },
};

export const PRAKERSA = {
  eyebrow: 'Khusus SMK dan MAK',
  judul: 'Jurusan, kompetensi, dan PKL ada di Prakersa',
  sub: {
    web: 'Profil kesiapan kerja murid, dari kelas 10 sampai PKL, terhubung dengan data Absenin Aja.',
    mobile: 'Kesiapan kerja murid, kelas 10 sampai PKL.',
  },
  aksi: { label: 'Buka Prakersa', href: URL_MODUL_SMK },
};

export const CTA = {
  judul: 'Modul mana yang cocok untuk sekolah?',
  sub: {
    web: 'Jadwalkan demo. Kita mulai dari kebutuhan yang paling mendesak.',
    mobile: 'Jadwalkan demo, mulai dari yang mendesak.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Paket', rute: 'paket' },
};
