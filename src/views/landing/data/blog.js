// Teks dan daftar halaman Blog (`/blog` dan `/blog/:slug`). Disalin apa adanya dari
// desain kanvas (Blog.dc.html, Blog-Seluler.dc.html, Blog-Artikel.dc.html, dan
// Blog-Artikel-Seluler.dc.html). Teks dua versi berbentuk { web, mobile }. Tanda
// bintang pada judul (*kata*) = kata berwarna aksen.
//
// Artikel adalah berkas statis di repo (keputusan F7, tanpa API atau CMS). Format
// tanggal, waktu baca, penyaringan, dan daftar isi ada di lib/blog.js (murni, ada
// tesnya). Angka jumlah artikel dan hitungan per kategori tidak ditulis di sini:
// diturunkan dari ARTIKEL.
//
// SELURUH ARTIKEL DI BAWAH DUMMY dari desain. Halaman digerbang oleh ALAT_DIRILIS
// (lib/gerbang.js) dan tidak boleh tampil di produksi sebelum artikel nyata ada.
//
// DUMMY wajib diganti sebelum main:
//  - ketujuh artikel: judul, ringkasan, tanggal, menit baca, dan `isi` (semua
//    artikel memakai isi contoh yang sama dari desain)
//  - daftar isi eksplisit artikel utama ("Siapkan data murid", "Bagikan kartu QR",
//    "Pantau dari dasbor"): tidak sama dengan judul bagian di isi contoh
//  - penulis "Tim Absenin Aja" dan inisial avatar "SR" (tidak cocok satu sama lain)
//  - empat kartu kategori di hero ("Panduan", "Tips sekolah", "Kabar produk",
//    "Cerita mitra"): hiasan dari desain, tidak sama dengan kategori artikel
import {
  IconBook,
  IconChartLine,
  IconLayoutGrid,
  IconScan,
  IconSchool,
  IconSparkles,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';

export const META = {
  title: 'Blog | Absenin Aja',
  description: 'Panduan, tips, dan kabar terbaru untuk sekolah yang ingin lebih rapi.',
};

// Judul halaman artikel: `${judul}${AKHIRAN_JUDUL}`.
export const AKHIRAN_JUDUL = ' | Absenin Aja';

export const HERO = {
  eyebrow: 'Blog',
  judul: 'Seputar *digitalisasi sekolah.*',
  sub: {
    web: 'Panduan, tips, dan kabar terbaru untuk sekolah yang ingin lebih rapi.',
    mobile: 'Panduan, tips, dan kabar sekolah.',
  },
  // DUMMY wajib diganti sebelum main (hiasan desain, bukan kategori artikel)
  fakta: [
    { ikon: IconBook, label: 'Panduan' },
    { ikon: IconChartLine, label: 'Tips sekolah' },
    { ikon: IconSparkles, label: 'Kabar produk' },
    { ikon: IconUsers, label: 'Cerita mitra' },
  ],
};

// Urutan kategori di bar tab dan bilah samping (urutan kartu pada desain). Kategori
// yang tidak tercantum di sini tetap tampil, di akhir.
export const URUTAN_KATEGORI = ['Absensi', 'Keuangan', 'Pembelajaran', 'Fitur', 'Panduan'];

// Ikon kotak gambar kartu menurut kategori (desain: ikon per kartu; di sini per
// kategori, jadi kartu keenam memakai ikon Absensi). Kategori baru memakai IKON_BAWAAN.
export const IKON_KATEGORI = {
  Absensi: IconScan,
  Keuangan: IconWallet,
  Pembelajaran: IconSchool,
  Fitur: IconLayoutGrid,
  Panduan: IconBook,
};
export const IKON_BAWAAN = IconBook;

// Ikon untuk satu kategori (IKON_BAWAAN bila belum terdaftar).
export function ikonKategori(kategori) {
  return IKON_KATEGORI[kategori] ?? IKON_BAWAAN;
}

export const UTAMA = {
  label: 'Artikel utama',
  aksi: 'Baca Selengkapnya',
};

export const DAFTAR = {
  labelTab: 'Kategori artikel',
  labelSemua: 'Semua',
  judul: 'Artikel terbaru',
  satuan: 'artikel',
  baca: 'Baca selengkapnya',
  kosong: 'Belum ada artikel di kategori ini.',
};

const AJAKAN_DEMO = {
  judul: 'Jadwalkan demo gratis',
  sub: {
    web: 'Lihat langsung bagaimana Absenin Aja bekerja untuk sekolah Anda.',
    mobile: 'Lihat cara kerjanya untuk sekolah Anda.',
  },
  aksi: { label: 'Jadwalkan Demo', rute: 'demo' },
};

export const BILAH = {
  label: 'Bilah samping',
  ajakan: AJAKAN_DEMO,
  kategori: { id: 'judul-kategori-artikel', judul: 'Kategori artikel' },
};

export const CTA = {
  judul: 'Mau artikel ini diterapkan di sekolah Anda?',
  sub: 'Jadwalkan demo. Kita bahas langsung.',
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur', rute: 'fitur' },
};

// Halaman artikel.
export const ARTIKEL_HALAMAN = {
  remah: { label: 'Remah roti', blog: 'Blog' },
  // DUMMY wajib diganti sebelum main (nama penulis dan inisial avatar)
  penulis: { nama: 'Tim Absenin Aja', inisial: 'SR', verifikasi: 'Verifikasi penulis' },
  daftarIsi: { id: 'judul-isi-artikel', judul: 'Isi artikel' },
  bilah: { label: 'Bilah samping', ajakan: AJAKAN_DEMO },
  terkait: { id: 'judul-artikel-terkait', eyebrow: 'Artikel terkait', judul: 'Baca juga' },
  cta: {
    judul: 'Mau mencoba langsung?',
    sub: { web: 'Jadwalkan demo gratis untuk sekolah Anda.', mobile: 'Jadwalkan demo gratis.' },
    aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
    aksiKedua: { label: 'Kembali ke Blog', rute: 'blog' },
  },
};

// Kalimat contoh dari desain. Paragraf, ringkasan, dan kutipan semuanya disusun
// dari tiga kalimat ini.
const A = 'Paragraf ini menjelaskan langkah pertama dengan bahasa yang sederhana, lengkap dengan contoh yang dekat dengan keseharian sekolah.';
const B = 'Setiap sekolah punya kebiasaan sendiri. Karena itu, mulailah dari satu proses yang paling sering menyita waktu dan ukur hasilnya selama satu bulan.';
const C = 'Setelah proses berjalan, catat hal yang masih membingungkan guru dan wali murid, lalu perbaiki sedikit demi sedikit tanpa mengubah semuanya sekaligus.';

// Isi contoh persis dari desain Blog-Artikel: dua paragraf, judul bagian, dua
// paragraf, kutipan, judul bagian, dua paragraf.
// DUMMY wajib diganti sebelum main
function isiContoh() {
  return [
    { tipe: 'p', teks: `${A} ${B}` },
    { tipe: 'p', teks: `${B} ${C}` },
    { tipe: 'h2', teks: 'Mulai dari yang paling sering dikerjakan' },
    { tipe: 'p', teks: `${C} ${A}` },
    { tipe: 'p', teks: `${A} ${B}` },
    { tipe: 'kutipan', teks: 'Mulailah dari satu proses saja, lalu tambah modul setelah tim terbiasa.' },
    { tipe: 'h2', teks: 'Ukur hasilnya setiap bulan' },
    { tipe: 'p', teks: `${B} ${C}` },
    { tipe: 'p', teks: `${C} ${A}` },
  ];
}

// DUMMY wajib diganti sebelum main
export const ARTIKEL = [
  {
    slug: 'cara-memulai-absensi-qr-satu-minggu',
    judul: 'Cara memulai absensi QR di sekolah dalam satu minggu',
    kategori: 'Panduan',
    tanggal: '2026-11-12',
    menitBaca: 5,
    ringkasan: A,
    utama: true,
    daftarIsi: ['Siapkan data murid', 'Bagikan kartu QR', 'Pantau dari dasbor'],
    isi: isiContoh(),
  },
  {
    slug: 'tujuh-kebiasaan-absensi-rekap-rapi',
    judul: 'Tujuh kebiasaan absensi yang membuat rekap lebih rapi',
    kategori: 'Absensi',
    tanggal: '2026-11-05',
    menitBaca: 4,
    ringkasan: A,
    isi: isiContoh(),
  },
  {
    slug: 'membaca-laporan-keuangan-sekolah',
    judul: 'Cara membaca laporan keuangan sekolah tanpa pusing',
    kategori: 'Keuangan',
    tanggal: '2026-10-29',
    menitBaca: 6,
    ringkasan: B,
    isi: isiContoh(),
  },
  {
    slug: 'mengenali-murid-butuh-perhatian-lebih-awal',
    judul: 'Mengenali murid yang butuh perhatian lebih awal',
    kategori: 'Pembelajaran',
    tanggal: '2026-10-21',
    menitBaca: 3,
    ringkasan: C,
    isi: isiContoh(),
  },
  {
    slug: 'memilih-modul-untuk-sekolah-baru',
    judul: 'Panduan memilih modul untuk sekolah baru',
    kategori: 'Fitur',
    tanggal: '2026-11-12',
    menitBaca: 5,
    ringkasan: A,
    isi: isiContoh(),
  },
  {
    slug: 'menyiapkan-data-murid-semester-baru',
    judul: 'Langkah menyiapkan data murid sebelum semester baru',
    kategori: 'Panduan',
    tanggal: '2026-11-05',
    menitBaca: 4,
    ringkasan: B,
    isi: isiContoh(),
  },
  {
    slug: 'absensi-harian-penting-untuk-wali-murid',
    judul: 'Mengapa absensi harian penting untuk wali murid',
    kategori: 'Absensi',
    tanggal: '2026-10-29',
    menitBaca: 6,
    ringkasan: C,
    isi: isiContoh(),
  },
];
