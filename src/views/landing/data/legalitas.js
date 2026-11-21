// Teks dan daftar halaman Legalitas (`/bukti/legalitas`). Disalin apa adanya dari
// desain kanvas (Legalitas.dc.html dan Legalitas-Seluler.dc.html). Teks dua
// versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata
// berwarna aksen (di latar gelap: kuning).
//
// SELURUH ISI HALAMAN INI DUMMY dari desain (instruksi pengguna 21 Nov 2026:
// dummy dulu agar desain bersih). Halaman digerbang oleh BUKTI_DIRILIS
// (lib/gerbang.js). `verifikasi` (true atau teks label) = klaim berisiko;
// penandanya tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main: seluruh nomor dokumen ("No. 000/2026",
// "No. 000/PSE/2026", "Terdaftar 2026"). Data PT nyata (SK AHU-A123697.AH.01.30.Tahun
// 2026, 19 September 2026) menggantikannya kelak. JANGAN diisi sebelum dokumen,
// nomor, dan izin tampilnya diverifikasi.
import { IconFileCheck, IconFileText, IconLock, IconShieldCheck } from '@tabler/icons-react';

export const META = {
  title: 'Legalitas | Absenin Aja',
  description: 'Badan hukum, izin usaha, dan pendaftaran sistem elektronik Absenin Aja.',
};

// DUMMY wajib diganti sebelum main (daftar dokumen yang diklaim ada dan dapat diperiksa).
export const HERO = {
  eyebrow: 'Bukti · Legalitas',
  judul: 'Dokumen resmi *yang dapat Anda periksa.*',
  sub: {
    web: 'Badan hukum, izin usaha, dan pendaftaran sistem elektronik Absenin Aja.',
    mobile: 'Badan hukum, izin usaha, dan PSE.',
  },
  verifikasi: 'Verifikasi klaim legalitas di subjudul',
  fakta: [
    { ikon: IconFileText, label: 'Badan hukum', verifikasi: 'Verifikasi badan hukum' },
    { ikon: IconShieldCheck, label: 'Pendaftaran PSE', verifikasi: 'Verifikasi pendaftaran PSE' },
    { ikon: IconLock, label: 'Kebijakan privasi', verifikasi: 'Verifikasi kebijakan privasi' },
    { ikon: IconFileCheck, label: 'Syarat layanan', verifikasi: 'Verifikasi syarat layanan (belum ada dokumennya)' },
  ],
};

// Dokumen utama (pendaftaran PSE). Tombol "Lihat dokumen" selalu nonaktif:
// berkas dokumennya belum ada, jadi tidak ada tujuan yang boleh ditautkan.
export const UTAMA = {
  id: 'judul-dokumen-utama',
  ikon: IconShieldCheck,
  label: 'Pendaftaran PSE',
  judul: 'Sertifikat dan nomor tanda daftar',
  nomor: 'No. 000/PSE/2026 · Terdaftar 2026',
  aksi: { label: 'Lihat dokumen' },
  verifikasi: 'Verifikasi pendaftaran PSE dan tahun terdaftar',
};

// DUMMY wajib diganti sebelum main: seluruh nomor dokumen di blok ini.
export const DOKUMEN = [
  { ikon: IconFileText, judul: 'Badan hukum', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor badan hukum' },
  { ikon: IconFileText, judul: 'NPWP perusahaan', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor NPWP' },
  { ikon: IconFileText, judul: 'NIB dan izin usaha', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor NIB' },
  { ikon: IconFileText, judul: 'Akta pendirian', nomor: 'No. 000/2026', verifikasi: 'Verifikasi nomor akta' },
];

// DUMMY wajib diganti sebelum main: ringkasan tiga kebijakan di blok ini.
// Kartu belum menaut ke mana pun (Kebijakan privasi, Syarat layanan, dan
// Perlindungan data statis); "Rujukan ke halaman Keamanan Data" juga DUMMY dan
// kartunya belum menaut ke /bukti/keamanan-data.
export const KEBIJAKAN = {
  id: 'judul-kebijakan',
  eyebrow: 'Kebijakan',
  judul: 'Aturan yang *berlaku di sini*',
  butir: [
    {
      ikon: IconLock,
      judul: 'Kebijakan privasi',
      deskripsi: {
        web: 'Cara data pribadi dikumpulkan, dipakai, dan dilindungi.',
        mobile: 'Cara data pribadi dijaga.',
      },
      aksen: true,
    },
    {
      ikon: IconFileText,
      judul: 'Syarat layanan',
      deskripsi: {
        web: 'Ketentuan penggunaan Absenin Aja oleh sekolah dan pengguna.',
        mobile: 'Ketentuan memakai Absenin Aja.',
      },
      verifikasi: 'Verifikasi syarat layanan (belum ada dokumennya)',
    },
    {
      ikon: IconShieldCheck,
      judul: 'Perlindungan data',
      deskripsi: 'Rujukan ke halaman Keamanan Data.',
    },
  ],
};

export const CTA = {
  judul: 'Butuh salinan dokumen?',
  sub: {
    web: 'Hubungi kami. Dokumen dikirim setelah tersedia.',
    mobile: 'Hubungi kami, dokumen kami kirim.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Keamanan Data', rute: 'keamananData' },
};
