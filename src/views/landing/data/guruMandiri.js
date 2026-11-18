// Teks dan daftar halaman Akun Guru Mandiri (`/akun-guru-mandiri`). Disalin
// apa adanya dari desain kanvas (Guru-Mandiri.dc.html dan
// Guru-Mandiri-Seluler.dc.html). Teks dua versi berbentuk { web, mobile } dari
// gen/short.py. Tanda bintang pada judul (*kata*) = kata berwarna aksen.
// Kolom formulir dan teks bersama formulir ada di data/formulir.js.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main (klaim contoh dari desain, belum terbukti):
//  - "Data nilai aman", "Data dipakai hanya untuk membuat akun"
//  - peraga "Perlu perhatian" (angka dan nama murid contoh)
//  - tiga jawaban FAQ (gratis selama masa percobaan, data nilai hanya terlihat akun sendiri,
//    bisa dihubungkan ke sekolah)
//  - "Akun dibuat setelah tim memeriksa permintaan"
import { IconChartLine, IconFileCheck, IconLock, IconSparkles, IconUserPlus } from '@tabler/icons-react';

export const META = {
  title: 'Akun Guru Mandiri | Absenin Aja',
  description: 'Guru bisa memakainya sendiri, dari nilai yang sudah ada.',
};

export const HERO = {
  eyebrow: 'Akun Guru Mandiri',
  judul: 'Analitik pembelajaran, *tanpa menunggu sekolah.*',
  sub: {
    web: 'Guru bisa memakainya sendiri, dari nilai yang sudah ada.',
    mobile: 'Dipakai sendiri, dari nilai yang ada.',
  },
  // Tautan dalam halaman (anchor ke seksi formulir dan seksi cara memakai).
  aksiUtama: { label: 'Minta Akun Guru', href: '#minta-akun' },
  aksiKedua: { label: 'Lihat Cara Pakai', href: '#cara-memakai' },
  fakta: [
    { ikon: IconFileCheck, label: 'Impor dari Excel' },
    { ikon: IconChartLine, label: 'Nilai per tujuan' },
    { ikon: IconSparkles, label: 'Saran tindak lanjut' },
    { ikon: IconLock, label: 'Data nilai aman' }, // DUMMY wajib diganti sebelum main
  ],
};

export const APA = {
  id: 'apa-itu',
  eyebrow: 'Apa itu',
  judul: 'Lihat murid yang *perlu perhatian.*',
  sub: {
    web: 'Impor nilai dari Excel, lihat nilai per tujuan pembelajaran, dan dapatkan saran tindak lanjut.',
    mobile: 'Impor nilai, lihat tujuan, dapat saran.',
  },
  tag: ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'],
  // Data dummy peraga (dua baris, sesuai desain; MOCK_PERHATIAN di data/fitur.js memuat tiga).
  mock: {
    judul: 'Perlu perhatian',
    verifikasi: 'Data contoh', // DUMMY wajib diganti sebelum main
    ringkasan: [
      { label: 'Kelas', nilai: '5' },
      { label: 'Hadir rata-rata', nilai: '92%' },
      { label: 'Perlu perhatian', nilai: '3' },
    ],
    baris: [
      { teks: 'Ahmad F. tujuan 1.2 belum tuntas', aksi: 'Remedial' },
      { teks: 'Ahmad F. kehadiran menurun', aksi: 'Pantau' },
    ],
  },
};

export const CARA = {
  id: 'cara-memakai',
  eyebrow: 'Cara memakai',
  judul: 'Tiga langkah *tanpa sekolah*',
  langkah: [
    {
      ikon: IconUserPlus,
      judul: '1. Minta akun',
      deskripsi: { web: 'Isi formulir, tim kami menyiapkan akun Anda.', mobile: 'Isi formulir, akun kami siapkan.' },
      aksen: true,
    },
    { ikon: IconFileCheck, judul: '2. Impor nilai', deskripsi: 'Unggah berkas Excel nilai kelas Anda.' },
    {
      ikon: IconChartLine,
      judul: '3. Lihat hasilnya',
      deskripsi: { web: 'Murid yang perlu perhatian muncul di dasbor.', mobile: 'Murid yang perlu perhatian muncul.' },
    },
  ],
};

export const AKUN = {
  id: 'minta-akun',
  eyebrow: 'Permintaan akun',
  judul: 'Minta akun *guru mandiri.*',
  sub: {
    web: 'Akun dibuat setelah tim memeriksa permintaan Anda.',
    mobile: 'Akun dibuat setelah permintaan diperiksa.',
  },
  formulir: {
    judul: 'Formulir permintaan akun',
    teksKirim: 'Kirim Permintaan',
    // Teks pada tautan WhatsApp keadaan "Formulir belum aktif". Tidak ada di desain.
    pesanWa: 'Halo Absenin Aja, saya ingin meminta akun guru mandiri.',
    // Teks keadaan terkirim tidak ada di desain Guru Mandiri: memakai judul bersama
    // formulir dan kalimat proses dari desain (sama dengan sub bagian ini).
    terkirim: {
      sub: {
        web: 'Akun dibuat setelah tim memeriksa permintaan Anda.',
        mobile: 'Akun dibuat setelah permintaan diperiksa.',
      },
    },
    jaminan: [{ ikon: IconLock, label: 'Data dipakai hanya untuk membuat akun' }], // DUMMY wajib diganti sebelum main
  },
};

export const FAQ = {
  id: 'tanya-jawab-guru',
  eyebrow: 'Pertanyaan guru',
  judul: 'Yang sering *ditanyakan*',
  butir: [
    {
      q: 'Apakah akun guru mandiri gratis?',
      a: 'Akun guru mandiri disediakan tanpa biaya selama masa percobaan. Ketentuannya dijelaskan saat permintaan akun disetujui.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Apakah data nilai saya aman?',
      a: 'Data nilai hanya bisa dilihat oleh akun Anda. Tidak ada guru lain yang dapat membukanya.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Bisakah nanti dihubungkan ke sekolah?',
      a: 'Bisa. Jika sekolah Anda kelak memakai Absenin Aja, akun dan data Anda dapat dihubungkan.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
  ],
};

export const CTA = {
  judul: 'Mulai dari satu kelas',
  sub: {
    web: 'Minta akun, impor nilai, dan lihat hasilnya.',
    mobile: 'Minta akun, impor nilai, lihat hasil.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Fitur', rute: 'fitur' },
};
