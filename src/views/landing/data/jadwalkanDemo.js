// Teks dan daftar halaman Jadwalkan Demo (`/jadwalkan-demo`). Disalin apa adanya
// dari desain kanvas (Demo.dc.html dan Demo-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile } dari gen/short.py. Tanda bintang pada judul
// (*kata*) = kata berwarna aksen. Kolom formulir dan teks bersama formulir ada
// di data/formulir.js.
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main (klaim contoh dari desain, belum terbukti):
//  - "Demo gratis", "Tanpa komitmen / Tidak ada kewajiban sesudahnya"
//  - "Data aman", "Tanpa spam", "Dibalas lewat WhatsApp", "pada jam kerja"
//  - tiga jawaban FAQ (gratis, 30 sampai 45 menit, lewat video atau di sekolah)
import { IconLock, IconMessage, IconPlayerPlay, IconShieldCheck } from '@tabler/icons-react';

export const META = {
  title: 'Jadwalkan Demo | Absenin Aja',
  description: 'Isi formulir singkat. Tim kami menghubungi lewat WhatsApp.',
};

export const HERO = {
  id: 'judul-demo',
  eyebrow: 'Mulai dari sini',
  judul: 'Jadwalkan demo, *kami sesuaikan dengan sekolah Anda.*',
  sub: {
    web: 'Isi formulir singkat. Tim kami menghubungi lewat WhatsApp.',
    mobile: 'Isi formulir, kami hubungi lewat WhatsApp.',
  },
  kartu: [
    { ikon: IconPlayerPlay, label: 'Demo gratis', sub: 'Sesuai jenjang dan ukuran sekolah', verifikasi: true }, // DUMMY wajib diganti sebelum main
    { ikon: IconShieldCheck, label: 'Tanpa komitmen', sub: 'Tidak ada kewajiban sesudahnya', verifikasi: true }, // DUMMY wajib diganti sebelum main
    { ikon: IconMessage, label: 'Dihubungi lewat WhatsApp', sub: 'Ke nomor yang Anda isi' },
  ],
};

export const FORMULIR = {
  judul: 'Formulir demo',
  teksKirim: 'Kirim Permintaan Demo',
  // Teks pada tautan WhatsApp keadaan "Formulir belum aktif". Tidak ada di desain.
  pesanWa: 'Halo Absenin Aja, saya ingin menjadwalkan demo untuk sekolah saya.',
  terkirim: {
    // DUMMY wajib diganti sebelum main ("jam kerja" belum terverifikasi)
    sub: {
      web: 'Tim kami menghubungi Anda lewat WhatsApp pada jam kerja.',
      mobile: 'Dihubungi lewat WhatsApp jam kerja.',
    },
    langkah: ['Pesan WhatsApp dari tim masuk', 'Kita sepakati jadwal demo', 'Demo disesuaikan dengan sekolah'],
  },
  // DUMMY wajib diganti sebelum main (data aman, tanpa spam, dibalas lewat WhatsApp)
  jaminan: [
    { ikon: IconLock, label: 'Data aman' },
    { ikon: IconMessage, label: 'Dibalas lewat WhatsApp' },
    { ikon: IconShieldCheck, label: 'Tanpa spam' },
  ],
};

export const BERIKUTNYA = {
  id: 'apa-yang-terjadi-berikutnya',
  eyebrow: 'Sesudah Anda kirim',
  judul: 'Apa yang *terjadi berikutnya*',
  langkah: [
    {
      judul: 'Pesan WhatsApp masuk',
      deskripsi: { web: 'Tim menyapa dan memastikan kebutuhan sekolah.', mobile: 'Tim menyapa dan memastikan kebutuhan.' },
    },
    { judul: 'Jadwal demo disepakati', deskripsi: 'Waktu dipilih sesuai kesediaan sekolah.' },
    {
      judul: 'Demo disesuaikan',
      deskripsi: {
        web: 'Modul yang ditunjukkan sesuai jenjang dan ukuran sekolah.',
        mobile: 'Modul sesuai jenjang dan ukuran sekolah.',
      },
    },
    { judul: 'Tanya jawab langsung', deskripsi: 'Semua pertanyaan dijawab tanpa tekanan.' },
  ],
};

export const FAQ = {
  id: 'tanya-jawab-demo',
  eyebrow: 'Pertanyaan demo',
  judul: 'Masih ada yang *ingin ditanyakan?*',
  butir: [
    {
      q: 'Apakah demo benar-benar gratis?',
      a: 'Ya. Demo tidak dipungut biaya dan tidak mengharuskan sekolah berlangganan.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Berapa lama demo berlangsung?',
      a: 'Sekitar 30 sampai 45 menit, disesuaikan dengan jumlah pertanyaan dari sekolah.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
    {
      q: 'Apakah demo bisa dilakukan di sekolah?',
      a: 'Bisa. Demo dapat dilakukan lewat video atau langsung di sekolah, sesuai kesepakatan jadwal.',
      verifikasi: true, // DUMMY wajib diganti sebelum main
    },
  ],
};
