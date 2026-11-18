// Teks dan daftar halaman Promo (`/produk/promo`). Disalin apa adanya dari
// desain kanvas (Promo.dc.html dan Promo-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile } dari gen/short.py. Tanda bintang pada judul
// (*kata*) = kata berwarna aksen.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main (klaim contoh dari desain, belum terbukti):
//  - seluruh isi promo: "Promo Semester Genap: 20% untuk sekolah baru", "Promo akhir tahun"
//  - "Berlaku sampai 31 Januari 2027", "semester genap 2026/2027", "Tidak dapat digabung dengan promo lain"
//  - tiga butir isi promo (demo gratis, pelatihan, potongan tahun pertama)
//  - AKHIR_PROMO di bawah (tanggal berakhir promo)
import { IconCalendar, IconCheck, IconPlayerPlay, IconSchool, IconWallet } from '@tabler/icons-react';

export const META = {
  title: 'Promo | Absenin Aja',
  description: 'Potongan khusus untuk sekolah yang mulai semester ini.',
};

export const HERO = {
  eyebrow: 'Produk · Promo',
  judul: 'Penawaran *yang sedang berlaku.*',
  sub: {
    web: 'Potongan khusus untuk sekolah yang mulai semester ini.',
    mobile: 'Potongan untuk sekolah baru.',
  },
  fakta: [
    { ikon: IconCalendar, label: 'Periode terbatas' },
    { ikon: IconCheck, label: 'Untuk sekolah baru' },
    { ikon: IconWallet, label: 'Potongan biaya' },
    { ikon: IconSchool, label: 'Termasuk pelatihan' },
  ],
};

// DUMMY wajib diganti sebelum main: tanggal berakhir promo (31 Januari 2027,
// akhir hari, WIB +07:00) dari desain. Hitung mundur dihitung dari konstanta
// ini (lib/hitungMundur.js, dipakai pages/promo/KartuPromo.jsx). Sesudah waktu
// ini lewat, kotak hitung mundur disembunyikan dan tombol "Ambil Promo"
// diganti keterangan "Promo telah berakhir.".
export const AKHIR_PROMO = '2027-01-31T23:59:59+07:00';
export const AKHIR_PROMO_MS = Date.parse(AKHIR_PROMO);

export const SATUAN_HITUNG = [
  { kunci: 'hari', label: 'Hari' },
  { kunci: 'jam', label: 'Jam' },
  { kunci: 'menit', label: 'Menit' },
];

export const KARTU = {
  id: 'promo-berlaku',
  tag: 'Promo akhir tahun',
  judul: 'Promo Semester Genap: 20% untuk sekolah baru',
  deskripsi: {
    web: 'Berlaku untuk pendaftaran sekolah baru selama periode promo.',
    mobile: 'Berlaku selama periode promo.',
  },
  aksi: { label: 'Ambil Promo', rute: 'demo' },
  labelHitung: 'Sisa waktu promo',
  berakhir: 'Promo telah berakhir.',
  verifikasi: 'Data contoh',
};

export const ISI = {
  id: 'isi-promo',
  label: 'Isi promo', // nama aksesibel seksi (tidak tampil; desain tanpa judul)
  kartu: [
    {
      ikon: IconPlayerPlay,
      judul: 'Demo dan penyiapan',
      deskripsi: {
        web: 'Demo dan penyiapan data awal tanpa biaya tambahan.',
        mobile: 'Demo dan penyiapan data awal gratis.',
      },
    },
    { ikon: IconSchool, judul: 'Pelatihan', deskripsi: 'Pelatihan untuk admin, guru, dan wali kelas.' },
    {
      ikon: IconWallet,
      judul: 'Potongan biaya',
      deskripsi: {
        web: 'Potongan biaya pada tahun pertama berlangganan.',
        mobile: 'Potongan biaya tahun pertama.',
      },
    },
  ],
};

export const SYARAT = {
  id: 'syarat-dan-ketentuan',
  eyebrow: 'Syarat dan ketentuan',
  judul: 'Baca dulu *sebelum mengambil*',
  butir: [
    'Berlaku untuk sekolah baru semester genap 2026/2027.',
    'Tidak dapat digabung dengan promo lain.',
    'Berlaku sampai 31 Januari 2027.',
    'Syarat dan ketentuan lain berlaku.',
  ],
};

export const CTA = {
  judul: 'Siap memakai promo ini?',
  sub: 'Jadwalkan demo dan sebutkan promonya.',
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Paket', rute: 'paket' },
};
