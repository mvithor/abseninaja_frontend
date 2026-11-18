// Teks dan daftar halaman Paket dan Harga (`/produk/paket`). Disalin apa adanya
// dari desain kanvas (Paket.dc.html dan Paket-Seluler.dc.html). Teks dua versi
// berbentuk { web, mobile } dari gen/short.py. Tanda bintang pada judul
// (*kata*) = kata berwarna aksen.
//
// TIDAK ADA ANGKA HARGA di desain. Jangan menambahkannya: harga dibahas saat
// demo ("Hubungi kami").
//
// `verifikasi` (true atau teks label) = klaim yang belum diverifikasi. Penandanya
// tampil hanya bila flags.tampilkanPenandaDesain menyala.
//
// DUMMY wajib diganti sebelum main (klaim contoh dari desain, belum terbukti):
//  - "12 modul", "13 peran pengguna", "Web + HP" (sama dengan data/fitur.js)
//  - "Semua paket sudah termasuk pelatihan dan pendampingan", "Termasuk di setiap paket"
//  - "Demo gratis", "Dukungan WhatsApp", "jam kerja sekolah"
//  - label "Rekomendasi" dan nama paket (Paket lengkap, Paket modular); "Harga dibahas saat demo"
//  - tiga modul tambahan paket modular (Analitik, Jurusan dan kompetensi, PKL)
import {
  IconBell,
  IconCalendar,
  IconChartLine,
  IconHeadset,
  IconPlayerPlay,
  IconQrcode,
  IconSchool,
  IconStack2,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';

export const META = {
  title: 'Paket dan Harga | Absenin Aja',
  description: 'Semua paket sudah termasuk pelatihan dan pendampingan.',
};

export const HERO = {
  eyebrow: 'Produk · Paket dan Harga',
  judul: 'Pilih paket yang *sesuai kebutuhan.*',
  sub: {
    web: 'Semua paket sudah termasuk pelatihan dan pendampingan.',
    mobile: 'Sudah termasuk pelatihan dan pendampingan.',
  },
  // Tujuan "Konsultasikan Kebutuhan" tidak ditentukan desain; sementara ke Jadwalkan Demo.
  aksiUtama: { label: 'Konsultasikan Kebutuhan', rute: 'demo' },
  aksiKedua: { label: 'Jadwalkan Demo', rute: 'demo' },
  fakta: [
    { ikon: IconPlayerPlay, label: 'Demo gratis' },
    { ikon: IconSchool, label: 'Pelatihan per peran' },
    { ikon: IconHeadset, label: 'Dukungan WhatsApp' },
    { ikon: IconStack2, label: '12 modul sekolah' },
  ],
};

export const LENGKAP = {
  id: 'paket-lengkap',
  eyebrow: 'Paket lengkap',
  judul: 'Semua modul *dalam satu paket*',
  sub: {
    web: 'Mulai dari satu paket, sekolah memakai modul yang dibutuhkan.',
    mobile: 'Pakai modul yang dibutuhkan.',
  },
  statistik: [
    { angka: '12', label: 'Modul' },
    { angka: '13', label: 'Peran pengguna' },
    { angka: 'Web + HP', label: 'Satu data' },
  ],
  modul: [
    { ikon: IconQrcode, judul: 'Absensi QR', deskripsi: 'Datang dan pulang tercatat otomatis.' },
    { ikon: IconCalendar, judul: 'Jadwal sekolah', deskripsi: 'Kelas, mapel, ekskul, ujian.' },
    { ikon: IconWallet, judul: 'Keuangan dan SPP', deskripsi: 'Tagihan dan riwayat bayar.' },
    { ikon: IconBell, judul: 'Kabar wali murid', deskripsi: 'Aplikasi dan WhatsApp.' },
    { ikon: IconUsers, judul: 'Data murid dan pegawai', deskripsi: 'Satu data untuk semua modul.' },
    { ikon: IconChartLine, judul: 'Analitik pembelajaran', deskripsi: 'Murid yang perlu perhatian.' },
  ],
  aksi: { label: 'Tanya Harga Paket Ini', rute: 'demo' },
  verifikasi: true, // DUMMY wajib diganti sebelum main (angka 12, 13)
};

export const JALUR = {
  id: 'pilih-jalur',
  eyebrow: 'Pilih jalurnya',
  judul: 'Lengkap atau *modular*',
  sub: {
    web: 'Harga dibahas saat demo, sesuai jumlah murid dan modul.',
    mobile: 'Harga dibahas saat demo.',
  },
  lengkap: {
    judul: 'Paket lengkap',
    status: 'Rekomendasi',
    deskripsi: {
      web: 'Semua modul sekolah, pelatihan, dan pendampingan.',
      mobile: 'Semua modul, pelatihan, pendampingan.',
    },
    harga: 'Hubungi kami',
    aksi: { label: 'Jadwalkan Demo', rute: 'demo' },
  },
  modular: {
    judul: 'Paket modular',
    deskripsi: {
      web: 'Mulai dari satu modul, tambah kapan saja. Modul tambahan diaktifkan per sekolah.',
      mobile: 'Mulai satu modul, tambah kapan saja.',
    },
    tag: ['Analitik pembelajaran', 'Jurusan dan kompetensi (SMK)', 'PKL (SMK)'],
    harga: 'Hubungi kami',
    aksi: { label: 'Konsultasikan Kebutuhan', rute: 'demo' },
  },
};

export const TERMASUK = {
  id: 'termasuk-di-setiap-paket',
  eyebrow: 'Termasuk di setiap paket',
  judul: 'Bukan hanya aplikasi',
  kartu: [
    {
      ikon: IconPlayerPlay,
      judul: 'Demo gratis',
      deskripsi: { web: 'Kebutuhan dipetakan sebelum Anda memutuskan.', mobile: 'Kebutuhan dipetakan sebelum memutuskan.' },
    },
    {
      ikon: IconSchool,
      judul: 'Pelatihan per peran',
      deskripsi: { web: 'Admin, guru, dan wali kelas dilatih sesuai tugas.', mobile: 'Admin, guru, dan wali kelas dilatih.' },
    },
    { ikon: IconHeadset, judul: 'Dukungan WhatsApp', deskripsi: 'Kendala dibantu pada jam kerja sekolah.' },
  ],
};

export const CTA = {
  judul: 'Belum yakin paket mana?',
  sub: {
    web: 'Ceritakan kebutuhan sekolah. Kami bantu memilih.',
    mobile: 'Ceritakan kebutuhan, kami bantu pilih.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Pendampingan', rute: 'pendampingan' },
};
