// Teks dan daftar halaman Afiliator (`/afiliator`). Disalin apa adanya dari
// desain kanvas (Afiliator.dc.html dan Afiliator-Seluler.dc.html). Teks dua
// versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata
// berwarna aksen (di latar gelap: kuning). Daftar tanya jawab (FAQ) dari skrip
// `faqItems` pada blok script desain. Kolom formulir ada di data/formulir.js
// (SKEMA.afiliator).
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// PROGRAM AFILIATOR BELUM ADA SEBAGAI PRODUK. Seluruh isi halaman ini dummy dari
// desain. Halaman digerbang oleh PERUSAHAAN_DIRILIS (lib/gerbang.js) dan tidak
// boleh tampil di produksi sebelum program, imbalan, dan dasbornya diputuskan.
//
// DUMMY wajib diganti sebelum main:
//  - "Imbalan per sekolah", "Dapatkan imbalan" dan besaran "Contoh besaran 10%"
//  - "Pendaftaran gratis" (hero) dan "Daftar gratis" (banner penutup)
//  - "Pantau lewat dasbor" (hero dan kartu): dasbor afiliator belum ada
//  - "Bahan promosi siap" dan "Bahan siap pakai" (bahan promosi belum ada)
//  - "Rekomendasi tepercaya" (sekolah rujukan didampingi tim)
//  - langkah "Bagikan" (tautan referral) dan "Imbalan dicatat saat sekolah resmi bergabung"
//  - tiga jawaban tanya jawab (siapa yang boleh mendaftar, kapan imbalan dibayarkan,
//    target minimum)
//  - "Data dipakai hanya untuk pendaftaran" (jaminan formulir): butuh tinjauan
//    hukum UU PDP sebelum rilis; juga kalimat "KTP dan rekening bank tidak diminta"
import { IconChartLine, IconCheck, IconFileText, IconLock, IconShieldCheck, IconWallet } from '@tabler/icons-react';

// Teks meta tidak ada di desain: judul memakai nama program (eyebrow hero),
// deskripsi = subjudul hero desain.
export const META = {
  title: 'Program Afiliator | Absenin Aja',
  description: 'Perkenalkan Absenin Aja ke sekolah yang membutuhkannya.',
};

// Id jangkar tautan dalam halaman.
export const ID_CARA = 'cara-bergabung';
export const ID_DAFTAR = 'pendaftaran-afiliator';

export const HERO = {
  eyebrow: 'Program Afiliator',
  judul: 'Ajak sekolah bergabung, *dapatkan imbalan.*',
  sub: {
    web: 'Perkenalkan Absenin Aja ke sekolah yang membutuhkannya.',
    mobile: 'Kenalkan Absenin Aja, dapat imbalan.',
  },
  // Tautan dalam halaman (jangkar ke formulir dan ke tiga langkah).
  aksiUtama: { label: 'Daftar Jadi Afiliator', href: `#${ID_DAFTAR}` },
  aksiKedua: { label: 'Pelajari Cara Kerja', href: `#${ID_CARA}` },
  fakta: [
    { ikon: IconWallet, label: 'Imbalan per sekolah', verifikasi: 'Verifikasi imbalan per sekolah' }, // DUMMY wajib diganti sebelum main
    { ikon: IconCheck, label: 'Pendaftaran gratis', verifikasi: 'Verifikasi pendaftaran gratis' }, // DUMMY wajib diganti sebelum main
    { ikon: IconChartLine, label: 'Pantau lewat dasbor', verifikasi: 'Verifikasi dasbor afiliator (belum ada)' }, // DUMMY wajib diganti sebelum main
    { ikon: IconFileText, label: 'Bahan promosi siap', verifikasi: 'Verifikasi bahan promosi' }, // DUMMY wajib diganti sebelum main
  ],
};

export const KEUNTUNGAN = {
  id: 'judul-keuntungan',
  eyebrow: 'Keuntungan afiliator',
  judul: 'Alasan menjadi *afiliator*',
  butir: [
    {
      ikon: IconWallet,
      judul: 'Dapatkan imbalan',
      deskripsi: {
        web: 'Imbalan untuk setiap sekolah yang bergabung. Contoh besaran 10%.',
        mobile: 'Imbalan tiap sekolah yang bergabung.',
      },
      aksen: true,
      verifikasi: 'Verifikasi imbalan dan besaran 10%', // DUMMY wajib diganti sebelum main
    },
    {
      ikon: IconChartLine,
      judul: 'Pantau lewat dasbor',
      deskripsi: {
        web: 'Lihat status referral dan imbalan yang tercatat.',
        mobile: 'Pantau status referral dan imbalan.',
      },
      verifikasi: 'Verifikasi dasbor afiliator (belum ada)', // DUMMY wajib diganti sebelum main
    },
    {
      ikon: IconFileText,
      judul: 'Bahan siap pakai',
      deskripsi: {
        web: 'Caption, gambar, dan penjelasan singkat produk.',
        mobile: 'Caption, gambar, dan penjelasan produk.',
      },
      verifikasi: 'Verifikasi bahan promosi', // DUMMY wajib diganti sebelum main
    },
    {
      ikon: IconShieldCheck,
      judul: 'Rekomendasi tepercaya',
      deskripsi: {
        web: 'Sekolah yang Anda ajak didampingi tim kami.',
        mobile: 'Sekolah yang diajak didampingi tim.',
      },
      verifikasi: 'Verifikasi pendampingan sekolah rujukan', // DUMMY wajib diganti sebelum main
    },
  ],
};

export const CARA = {
  id: ID_CARA,
  eyebrow: 'Cara bergabung',
  judul: 'Tiga langkah *jadi afiliator*',
  langkah: [
    { judul: 'Daftar', deskripsi: 'Isi formulir singkat di bawah.' },
    {
      judul: 'Bagikan',
      deskripsi: {
        web: 'Bagikan tautan atau kenalkan sekolah langsung.',
        mobile: 'Bagikan tautan atau kenalkan langsung.',
      },
      verifikasi: 'Verifikasi tautan referral', // DUMMY wajib diganti sebelum main
    },
    {
      judul: 'Terima imbalan',
      deskripsi: {
        web: 'Imbalan dicatat saat sekolah resmi bergabung.',
        mobile: 'Dicatat saat sekolah resmi bergabung.',
      },
      verifikasi: 'Verifikasi aturan pencatatan imbalan', // DUMMY wajib diganti sebelum main
    },
  ],
};

export const DAFTAR = {
  id: ID_DAFTAR,
  eyebrow: 'Pendaftaran',
  judul: 'Daftar *sekarang.*',
  sub: {
    web: 'KTP dan rekening bank tidak diminta di formulir ini. Data itu diminta nanti, lewat cara yang aman.',
    mobile: 'KTP dan rekening tidak diminta di sini.',
  },
  formulir: {
    judul: 'Formulir afiliator',
    teksKirim: 'Kirim Pendaftaran',
    // Teks pada tautan WhatsApp keadaan "Formulir belum aktif". Tidak ada di desain.
    pesanWa: 'Halo Absenin Aja, saya ingin mendaftar sebagai afiliator.',
    // Keadaan terkirim tidak punya kalimat di desain dan tidak ditulis di sini:
    // panel hanya menampilkan judul bersama formulir. Perlu teks dari copywriter.
    terkirim: {},
    // DUMMY wajib diganti sebelum main: kalimat privasi desain; butuh tinjauan hukum UU PDP.
    jaminan: [{ ikon: IconLock, label: 'Data dipakai hanya untuk pendaftaran', verifikasi: 'Verifikasi kalimat privasi (UU PDP)' }],
  },
};

// Tanya jawab: isi `defs` pada skrip Afiliator.dc.html dan Afiliator-Seluler.dc.html
// (sama di kedua versi). Butir pertama terbuka (openQ bawaan 0) = bukaAwal 0 pada Faq.
export const FAQ = {
  id: 'tanya-jawab-afiliator',
  eyebrow: 'Pertanyaan afiliator',
  judul: 'Yang sering *ditanyakan*',
  butir: [
    {
      q: 'Siapa yang boleh mendaftar?',
      a: 'Siapa saja yang dekat dengan dunia sekolah, seperti guru, kepala sekolah, komunitas, dan pemilik usaha pendidikan.',
      verifikasi: 'Verifikasi syarat pendaftar', // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Kapan imbalan dibayarkan?',
      a: 'Imbalan dicatat saat sekolah resmi bergabung dan dibayarkan pada periode pembayaran berikutnya.',
      verifikasi: 'Verifikasi jadwal pembayaran imbalan', // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Apakah ada target minimum?',
      a: 'Tidak ada target minimum. Anda bebas mengajak sekolah sebanyak yang Anda kenal.',
      verifikasi: 'Verifikasi aturan target minimum', // DUMMY wajib diganti sebelum main
    },
  ],
};

export const CTA = {
  judul: 'Mulai ajak sekolah hari ini',
  sub: {
    web: 'Daftar gratis, tim kami membantu dari awal.',
    mobile: 'Daftar gratis, kami bantu dari awal.',
  },
  verifikasi: 'Verifikasi pendaftaran gratis', // DUMMY wajib diganti sebelum main
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Pelajari Cara Kerja', href: `#${ID_CARA}` },
};
