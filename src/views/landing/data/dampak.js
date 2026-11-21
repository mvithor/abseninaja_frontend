// Teks dan daftar halaman Dampak (`/bukti/dampak`). Disalin apa adanya dari
// desain kanvas (Dampak.dc.html dan Dampak-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata berwarna
// aksen (di latar gelap: kuning).
//
// SELURUH ANGKA DAN NAMA SEKOLAH DI HALAMAN INI DUMMY dari desain (instruksi
// pengguna 21 Nov 2026: dummy dulu agar desain bersih). Halaman digerbang oleh
// BUKTI_DIRILIS (lib/gerbang.js) dan tidak boleh tampil di produksi sebelum
// angka nyata, sumber, dan izin sekolah ada. `verifikasi` (true atau teks label)
// = klaim berisiko; penandanya tampil hanya bila flags.tampilkanPenandaDesain
// menyala.
import { IconChartLine, IconScan, IconUsers, IconWallet } from '@tabler/icons-react';
import { JUMLAH_SEKOLAH } from './sekolahMitra';

// DUMMY wajib diganti sebelum main: klaim izin ("sudah memberi izin") di
// description dan HERO.sub; pastikan izin tertulis sekolah memang ada.
export const META = {
  title: 'Dampak | Absenin Aja',
  description: 'Angka dari sekolah mitra yang sudah memberi izin.',
};

// Empat kartu fakta di hero. Di desain berupa kartu penanda ringkasan, bukan kontrol.
export const HERO = {
  eyebrow: 'Bukti · Dampak',
  judul: 'Angka yang berasal dari *sekolah mitra.*',
  sub: {
    web: 'Angka dari sekolah mitra yang sudah memberi izin.',
    mobile: 'Angka dari sekolah mitra.',
  },
  fakta: [
    { ikon: IconChartLine, label: 'Sekolah mitra' },
    { ikon: IconScan, label: 'Absensi otomatis' },
    { ikon: IconWallet, label: 'Waktu terhemat' },
    { ikon: IconUsers, label: 'Wali terinformasi' },
  ],
};

// DUMMY wajib diganti sebelum main: seluruh angka di bawah.
export const RINGKASAN = {
  id: 'judul-ringkasan-dampak',
  eyebrow: 'Ringkasan',
  judul: 'Dampak dari *sekolah mitra*',
  butir: [
    { angka: `${JUMLAH_SEKOLAH}+`, label: 'Sekolah mitra aktif', verifikasi: 'Verifikasi jumlah sekolah mitra' },
    { angka: '92%', label: 'Rata-rata kehadiran tercatat otomatis', verifikasi: 'Verifikasi persentase dan sumber data' },
    { angka: '120 jam', label: 'Rata-rata waktu rekap terhemat', verifikasi: 'Verifikasi jam terhemat dan cara menghitung' },
    { angka: '7 hari', label: 'Rata-rata penyiapan awal', verifikasi: 'Verifikasi lama penyiapan' },
  ],
};

// DUMMY wajib diganti sebelum main: nama sekolah, wilayah, angka, dan sumber.
// Studi kasus nyata butuh izin tertulis sekolah dan data sebelum dan sesudah.
const DESKRIPSI_STUDI = {
  web: 'Rekap kehadiran dan laporan bulanan kini selesai dalam sehari, dan wali murid menerima kabar kehadiran langsung di aplikasi.',
  mobile: 'Rekap bulanan kini selesai dalam sehari.',
};
const METRIK_STUDI = [
  { label: 'Sebelum', nilai: '4 jam' },
  { label: 'Sesudah', nilai: '1 jam' },
  { label: 'Perubahan', nilai: '-75%' },
];

export const STUDI = {
  id: 'judul-studi-kasus',
  eyebrow: 'Studi kasus',
  judul: 'Cerita nyata dari *sekolah yang sudah memakai*',
  butir: [
    {
      tag: ['MTs', 'Pesawaran'],
      nama: 'MTs Nurul Ilmu',
      deskripsi: DESKRIPSI_STUDI,
      metrik: METRIK_STUDI,
      sumber: 'Sumber: data sekolah, Oktober 2026',
      verifikasi: 'Verifikasi angka -75% dan izin sekolah',
    },
    {
      tag: ['SMP', 'Bandar Lampung'],
      nama: 'SMP Harapan Bangsa',
      deskripsi: DESKRIPSI_STUDI,
      metrik: METRIK_STUDI,
      sumber: 'Sumber: data sekolah, Oktober 2026',
      verifikasi: 'Verifikasi angka -75% dan izin sekolah',
    },
  ],
};

export const CTA = {
  judul: 'Ingin sekolah Anda jadi cerita berikutnya?',
  sub: {
    web: 'Jadwalkan demo dan lihat yang cocok untuk sekolah Anda.',
    mobile: 'Jadwalkan demo dan lihat hasilnya.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Testimoni', rute: 'testimoni' },
};
