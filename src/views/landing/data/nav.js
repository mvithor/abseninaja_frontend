// Struktur menu landing (persis dari desain Dropdown.dc.html dan Menu-Seluler.dc.html).
//
// `analitik.tersedia` mengikuti gerbang rilis LAD (lib/gerbang.js): false di
// produksi sampai VITE_LANDING_LAD_AKTIF=true, true di DEV. Berkas gerbang
// sengaja tanpa impor supaya nav.js tidak menyeret tokens.js.
//
// Lima rute Bukti (dampak, testimoni, sekolahMitra, keamananData, legalitas)
// mengikuti gerbang rilis F5 (lib/gerbang.js, BUKTI_DIRILIS): false di produksi
// sampai VITE_LANDING_BUKTI_AKTIF=true, true di DEV.
//
// Tiga rute Perusahaan (tentangKami, kerjaSama, afiliator) mengikuti gerbang
// rilis F6 (lib/gerbang.js, PERUSAHAAN_DIRILIS): false di produksi sampai
// VITE_LANDING_PERUSAHAAN_AKTIF=true, true di DEV.
//
// Dua rute alat (blog, kalkulator) mengikuti gerbang rilis F7 (lib/gerbang.js,
// ALAT_DIRILIS): false di produksi sampai VITE_LANDING_ALAT_AKTIF=true, true di
// DEV. Rute /blog/:slug tidak ada di sini (hanya anak dari /blog) dan ikut
// bendera yang sama di routes.jsx.
//
// `tersedia: false` berarti halamannya belum dibangun. Butir seperti itu tampil
// sebagai teks nonaktif (aria-disabled) dan tidak menavigasi. Ubah menjadi
// `true` di REGISTRI_RUTE saat halamannya selesai; menu, bar tab, dan footer
// mengikuti otomatis.

import { ALAT_DIRILIS, BUKTI_DIRILIS, LAD_DIRILIS, PERUSAHAAN_DIRILIS } from '../lib/gerbang';

export const REGISTRI_RUTE = {
  beranda: { to: '/', tersedia: true }, // Beranda (pages/Beranda.jsx), F1
  fitur: { to: '/produk/fitur', tersedia: true }, // pages/Fitur.jsx, F2
  untukSekolah: { to: '/produk/untuk-sekolah', tersedia: true }, // pages/UntukSekolah.jsx, F2
  pendampingan: { to: '/produk/pendampingan', tersedia: true }, // pages/Pendampingan.jsx, F2
  paket: { to: '/produk/paket', tersedia: true }, // pages/Paket.jsx, F3
  promo: { to: '/produk/promo', tersedia: true }, // pages/Promo.jsx, F3
  analitik: { to: '/analitik-pembelajaran', tersedia: LAD_DIRILIS }, // pages/Analitik.jsx, F4 (digerbang)
  dampak: { to: '/bukti/dampak', tersedia: BUKTI_DIRILIS }, // pages/Dampak.jsx, F5 (digerbang)
  testimoni: { to: '/bukti/testimoni', tersedia: BUKTI_DIRILIS }, // pages/Testimoni.jsx, F5 (digerbang)
  sekolahMitra: { to: '/bukti/sekolah-mitra', tersedia: BUKTI_DIRILIS }, // pages/SekolahMitra.jsx, F5 (digerbang)
  keamananData: { to: '/bukti/keamanan-data', tersedia: BUKTI_DIRILIS }, // pages/KeamananData.jsx, F5 (digerbang)
  legalitas: { to: '/bukti/legalitas', tersedia: BUKTI_DIRILIS }, // pages/Legalitas.jsx, F5 (digerbang)
  tentangKami: { to: '/tentang-kami', tersedia: PERUSAHAAN_DIRILIS }, // pages/TentangKami.jsx, F6 (digerbang)
  kerjaSama: { to: '/kerja-sama', tersedia: PERUSAHAAN_DIRILIS }, // pages/KerjaSama.jsx, F6 (digerbang)
  afiliator: { to: '/afiliator', tersedia: PERUSAHAAN_DIRILIS }, // pages/Afiliator.jsx, F6 (digerbang)
  blog: { to: '/blog', tersedia: ALAT_DIRILIS }, // pages/Blog.jsx dan BlogArtikel.jsx, F7 (digerbang)
  demo: { to: '/jadwalkan-demo', tersedia: true }, // pages/JadwalkanDemo.jsx, F3
  akunGuruMandiri: { to: '/akun-guru-mandiri', tersedia: true }, // pages/GuruMandiri.jsx, F3
  kalkulator: { to: '/kalkulator', tersedia: ALAT_DIRILIS }, // pages/Kalkulator.jsx, F7 (digerbang)
  masuk: { to: '/login', tersedia: true },
  kebijakanPrivasi: { to: '/privacy-policy', tersedia: true },
};

export const URL_MODUL_SMK = 'https://prakersa.abseninaja.com/';

const R = REGISTRI_RUTE;

export const MODUL_SMK = {
  label: 'Modul SMK',
  href: URL_MODUL_SMK,
  external: true,
  tersedia: true,
};

export const MENU = [
  { key: 'beranda', label: 'Beranda', ...R.beranda },
  {
    key: 'produk',
    label: 'Produk',
    anak: [
      { label: 'Fitur Lengkap', ...R.fitur },
      { label: 'Untuk Sekolah', ...R.untukSekolah },
      { label: 'Pendampingan', ...R.pendampingan },
      { label: 'Paket dan Harga', ...R.paket },
      { label: 'Promo', ...R.promo },
      { label: 'Analitik Pembelajaran', ...R.analitik },
      MODUL_SMK,
    ],
  },
  {
    key: 'bukti',
    label: 'Bukti',
    anak: [
      { label: 'Dampak', ...R.dampak },
      { label: 'Testimoni', ...R.testimoni },
      { label: 'Sekolah Mitra', ...R.sekolahMitra },
      { label: 'Keamanan Data', ...R.keamananData },
      { label: 'Legalitas', ...R.legalitas },
    ],
  },
  {
    key: 'tentang',
    label: 'Tentang Kami',
    anak: [
      { label: 'Tentang Kami', ...R.tentangKami },
      { label: 'Kerja Sama', ...R.kerjaSama },
      { label: 'Afiliator', ...R.afiliator },
    ],
  },
  { key: 'blog', label: 'Blog', ...R.blog },
];

// Aksi di kanan header.
export const AKSI_MASUK = { label: 'Masuk', ...R.masuk };
export const AKSI_DEMO = { label: 'Demo Gratis', ...R.demo };

// Butir tambahan di lembar "Lainnya" (seluler), di luar menu utama.
export const MENU_TAMBAHAN = [
  { label: 'Akun Guru Mandiri', ...R.akunGuruMandiri },
  { label: 'Kalkulator Digitalisasi', ...R.kalkulator },
  { label: 'Kebijakan Privasi', ...R.kebijakanPrivasi },
];

// Lima slot bar tab bawah. Slot "lainnya" membuka lembar, bukan halaman.
export const SLOT_BAR_TAB = [
  { key: 'beranda', label: 'Beranda', ...R.beranda },
  { key: 'fitur', label: 'Fitur', ...R.fitur },
  { key: 'demo', label: 'Demo', ...R.demo },
  { key: 'sekolah', label: 'Sekolah', ...R.untukSekolah },
  { key: 'lainnya', label: 'Lainnya' },
];

// Semua rute internal yang dikenal menu. Dipakai untuk menentukan slot
// "Lainnya" aktif pada halaman di luar empat slot lain.
// Dihitung lewat fungsi yang ditandai murni (/* @__PURE__ */) supaya berkas ini
// bebas efek samping tingkat modul: bundler boleh membuangnya dari chunk yang
// hanya mengimpor REGISTRI_RUTE (mis. routes.jsx di chunk entry).
function hitungRuteLainnya() {
  const rutePadaSlot = SLOT_BAR_TAB.filter((s) => s.to).map((s) => s.to);
  const rutePadaMenu = [];
  MENU.forEach((m) => {
    if (m.to) rutePadaMenu.push(m.to);
    (m.anak || []).forEach((a) => {
      if (a.to) rutePadaMenu.push(a.to);
    });
  });
  MENU_TAMBAHAN.forEach((m) => rutePadaMenu.push(m.to));
  return rutePadaMenu.filter((to) => !rutePadaSlot.includes(to));
}

export const RUTE_LAINNYA = /* @__PURE__ */ hitungRuteLainnya();
