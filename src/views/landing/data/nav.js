// Struktur menu landing (persis dari desain Dropdown.dc.html dan Menu-Seluler.dc.html).
//
// `tersedia: false` berarti halamannya belum dibangun. Butir seperti itu tampil
// sebagai teks nonaktif (aria-disabled) dan tidak menavigasi. Ubah menjadi
// `true` di REGISTRI_RUTE saat halamannya selesai; menu, bar tab, dan footer
// mengikuti otomatis.

export const REGISTRI_RUTE = {
  beranda: { to: '/', tersedia: true }, // Landing.jsx lama sampai F1
  fitur: { to: '/produk/fitur', tersedia: false },
  untukSekolah: { to: '/produk/untuk-sekolah', tersedia: false },
  pendampingan: { to: '/produk/pendampingan', tersedia: false },
  paket: { to: '/produk/paket', tersedia: false },
  promo: { to: '/produk/promo', tersedia: false },
  analitik: { to: '/analitik-pembelajaran', tersedia: false },
  dampak: { to: '/bukti/dampak', tersedia: false },
  testimoni: { to: '/bukti/testimoni', tersedia: false },
  sekolahMitra: { to: '/bukti/sekolah-mitra', tersedia: false },
  keamananData: { to: '/bukti/keamanan-data', tersedia: false },
  legalitas: { to: '/bukti/legalitas', tersedia: false },
  tentangKami: { to: '/tentang-kami', tersedia: false },
  kerjaSama: { to: '/kerja-sama', tersedia: false },
  afiliator: { to: '/afiliator', tersedia: false },
  blog: { to: '/blog', tersedia: false },
  demo: { to: '/jadwalkan-demo', tersedia: false },
  akunGuruMandiri: { to: '/akun-guru-mandiri', tersedia: false },
  kalkulator: { to: '/kalkulator', tersedia: false },
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
const rutePadaSlot = SLOT_BAR_TAB.filter((s) => s.to).map((s) => s.to);

const rutePadaMenu = [];
MENU.forEach((m) => {
  if (m.to) rutePadaMenu.push(m.to);
  (m.anak || []).forEach((a) => {
    if (a.to) rutePadaMenu.push(a.to);
  });
});
MENU_TAMBAHAN.forEach((m) => rutePadaMenu.push(m.to));

export const RUTE_LAINNYA = rutePadaMenu.filter((to) => !rutePadaSlot.includes(to));
