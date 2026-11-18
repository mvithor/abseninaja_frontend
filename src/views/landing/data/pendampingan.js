// Teks dan daftar halaman Pendampingan (`/produk/pendampingan`). Disalin apa
// adanya dari desain kanvas (Pendampingan.dc.html dan Pendampingan-Seluler.dc.html).
// Teks dua versi berbentuk { web, mobile } dari gen/short.py. Tanda bintang pada
// judul (*kata*) = kata berwarna aksen.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Ganti
// dengan data produksi sebelum tayang. Penandanya tampil hanya bila
// flags.tampilkanPenandaDesain menyala.
import { IconHeadset, IconPlayerPlay, IconSchool, IconTool, IconUsers } from '@tabler/icons-react';

export const META = {
  title: 'Pendampingan | Absenin Aja',
  description: 'Dari demo sampai tim sekolah bisa berjalan sendiri.',
};

export const HERO = {
  eyebrow: 'Produk · Pendampingan',
  judul: 'Pendampingan *hingga mandiri.*',
  sub: {
    web: 'Dari demo sampai tim sekolah bisa berjalan sendiri.',
    mobile: 'Dari demo sampai sekolah mandiri.',
  },
  manfaat: [
    { ikon: IconPlayerPlay, label: 'Demo gratis', sub: 'Kebutuhan dipetakan dulu' },
    { ikon: IconSchool, label: 'Pelatihan per peran', sub: 'Admin, guru, wali kelas' },
    { ikon: IconHeadset, label: 'Dukungan WhatsApp', sub: 'Jam kerja sekolah' },
  ],
  // DUMMY: ganti dengan data produksi (rincian layanan belum diverifikasi)
  verifikasi: 'Rincian layanan diverifikasi',
};

export const BANDING = {
  id: 'mengapa-pendampingan',
  eyebrow: 'Mengapa pendampingan',
  judul: 'Jalan sendiri *atau didampingi*',
  sub: {
    web: 'Sistem baru lebih cepat dipakai bila ada yang menemani.',
    mobile: 'Sistem baru lebih cepat bila ditemani.',
  },
  sendiri: {
    judul: 'Jalan sendiri',
    sub: 'Sekolah belajar dan menyiapkan semuanya',
    butir: [
      'Belajar fitur dari panduan sendiri',
      'Data murid disiapkan sendiri',
      'Pelatihan diatur sendiri',
      'Kendala dicari jawabannya sendiri',
    ],
  },
  didampingi: {
    judul: 'Dengan pendampingan',
    sub: 'Ada tim yang menemani tiap tahap',
    butir: [
      'Kebutuhan dipetakan lewat demo',
      'Data disiapkan bersama tim',
      'Pelatihan sesuai peran',
      'Dukungan lewat WhatsApp',
    ],
  },
};

export const ALUR = {
  id: 'alur-pendampingan',
  eyebrow: 'Alur pendampingan',
  judul: 'Empat langkah *sampai mandiri*',
  langkah: [
    {
      label: 'Gratis',
      judul: 'Demo dan konsultasi',
      deskripsi: {
        web: 'Tim memetakan kebutuhan sekolah dan menunjukkan modul yang relevan.',
        mobile: 'Kebutuhan dipetakan, modul ditunjukkan.',
      },
      tag: ['Pemetaan kebutuhan', 'Tanpa komitmen'],
      verifikasi: true, // DUMMY: ganti dengan data produksi (demo gratis tanpa komitmen)
    },
    {
      label: 'Bersama tim',
      judul: 'Penyiapan data',
      deskripsi: {
        web: 'Data murid, pegawai, kelas, dan jadwal disiapkan bersama.',
        mobile: 'Data murid, pegawai, dan jadwal disiapkan.',
      },
      tag: ['Murid dan pegawai', 'Kelas', 'Jadwal'],
    },
    {
      label: 'Per peran',
      judul: 'Pelatihan per peran',
      deskripsi: {
        web: 'Admin, guru, wali kelas, dan petugas dilatih sesuai tugasnya.',
        mobile: 'Setiap peran dilatih sesuai tugasnya.',
      },
      tag: ['Admin', 'Guru', 'Wali kelas', 'Petugas'],
    },
    {
      label: 'WhatsApp',
      judul: 'Dukungan harian',
      deskripsi: {
        web: 'Kendala di lapangan dibantu pada jam kerja sekolah.',
        mobile: 'Kendala dibantu pada jam kerja.',
      },
      tag: ['Jam kerja sekolah'],
      verifikasi: true, // DUMMY: ganti dengan data produksi (dukungan WhatsApp jam kerja)
    },
  ],
};

export const BENTUK = {
  id: 'bentuk-pendampingan',
  eyebrow: 'Bentuk pendampingan',
  judul: 'Dukungan yang *sesuai kebutuhan* sekolah',
  kartu: [
    {
      ikon: IconHeadset,
      judul: 'Online',
      deskripsi: 'Lewat panggilan video atau WhatsApp.',
      tag: ['Termasuk di paket'],
      verifikasi: true, // DUMMY: ganti dengan data produksi
    },
    {
      ikon: IconUsers,
      judul: 'Di sekolah',
      deskripsi: {
        web: 'Kunjungan untuk penyiapan awal atau pelatihan.',
        mobile: 'Kunjungan untuk penyiapan atau pelatihan.',
      },
      tag: ['Per permintaan'],
      verifikasi: true, // DUMMY: ganti dengan data produksi
    },
    {
      ikon: IconTool,
      judul: 'Permintaan fitur',
      deskripsi: {
        web: 'Kebutuhan baru dibahas dan dievaluasi bersama.',
        mobile: 'Kebutuhan baru dievaluasi bersama.',
      },
      tag: ['Dievaluasi bersama'],
      verifikasi: true, // DUMMY: ganti dengan data produksi
    },
  ],
};

export const FAQ = {
  id: 'tanya-jawab-pendampingan',
  eyebrow: 'Pertanyaan umum',
  judul: 'Yang sering ditanyakan *soal pendampingan*',
  verifikasi: 'Teks contoh', // DUMMY: ganti dengan data produksi
  butir: [
    {
      q: 'Apakah pendampingan berbayar?',
      a: 'Pendampingan sudah termasuk di setiap paket tanpa biaya tambahan.',
      verifikasi: true, // DUMMY: ganti dengan data produksi
    },
    {
      q: 'Berapa lama sampai sekolah bisa memakai?',
      a: 'Umumnya beberapa hari sampai dua minggu, tergantung kesiapan data murid dan pegawai.',
      verifikasi: true, // DUMMY: ganti dengan data produksi
    },
    {
      q: 'Bagaimana jika ada kendala setelah berjalan?',
      a: 'Hubungi tim lewat WhatsApp. Kendala dibantu pada jam kerja sekolah.',
    },
  ],
};

export const CTA = {
  judul: 'Mulai dengan satu demo',
  sub: {
    web: 'Kita petakan kebutuhan sekolah, lalu susun langkahnya.',
    mobile: 'Kita petakan kebutuhan, susun langkah.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Paket', rute: 'paket' },
};
