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
// Koreksi klaim F8 (naskah Fitur Lengkap v2, bagian G3): angka contoh (12 modul,
// 13 peran), "semua modul", kartu Keuangan dan SPP, ujian, dan kanal WhatsApp ke
// wali dihapus; LAKSANA diberi chip Segera (ChipStatus). Apakah fitur Segera
// masuk paket lengkap tanpa biaya tambahan belum diputuskan (H-24).
//
// DUMMY wajib diganti sebelum main (klaim contoh dari desain, belum terbukti):
//  - "Semua paket sudah termasuk pelatihan dan pendampingan", "Termasuk di setiap paket"
//  - "Demo gratis", "Dukungan WhatsApp", "jam kerja sekolah"
//  - label "Rekomendasi" dan nama paket (Paket lengkap, Paket modular); "Harga dibahas saat demo"
//  - tiga modul tambahan paket modular (Analitik, Jurusan dan kompetensi, PKL)
import {
  IconBell,
  IconCalendar,
  IconChartLine,
  IconFileCheck,
  IconHeadset,
  IconPlayerPlay,
  IconQrcode,
  IconSchool,
  IconStack2,
  IconUsers,
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
    { ikon: IconPlayerPlay, label: 'Demo gratis', verifikasi: 'Verifikasi H-20' },
    { ikon: IconSchool, label: 'Pelatihan per peran' },
    { ikon: IconHeadset, label: 'Dukungan WhatsApp', verifikasi: 'Verifikasi H-20' },
    { ikon: IconStack2, label: 'Fitur per peran' },
  ],
};

export const LENGKAP = {
  id: 'paket-lengkap',
  eyebrow: 'Paket lengkap',
  // Naskah G3 memberi satu kalimat pengganti untuk judul dan sub; ditempel sebagai
  // judul, subjudul dihapus. Eyebrow "Paket lengkap" mengulang dua kata pertamanya.
  judul: 'Paket lengkap: fitur yang sudah berjalan, dengan fitur Segera menyusul.',
  statistik: [{ angka: 'Web + HP', label: 'Satu data' }],
  modul: [
    { ikon: IconQrcode, judul: 'Absensi QR', deskripsi: 'Datang dan pulang tercatat otomatis.' },
    { ikon: IconCalendar, judul: 'Jadwal sekolah', deskripsi: 'Kelas, mapel, ekskul.' },
    { ikon: IconFileCheck, judul: 'Perizinan', deskripsi: 'Izin tercatat, rekap bisa diunduh.' },
    { ikon: IconBell, judul: 'Kabar wali murid', deskripsi: 'Notifikasi di aplikasi wali.' },
    { ikon: IconUsers, judul: 'Data murid dan pegawai', deskripsi: 'Satu data untuk semua fitur.' },
    { ikon: IconChartLine, judul: 'Analitik pembelajaran', deskripsi: 'Segera dipakai guru.', chip: 'segera', verifikasi: 'Verifikasi H-5' },
  ],
  aksi: { label: 'Tanya Harga Paket Ini', rute: 'demo' },
  verifikasi: 'Verifikasi H-24', // apakah fitur Segera masuk paket lengkap tanpa biaya tambahan
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
    // Naskah G3 hanya memberi satu teks (web); dipakai di semua lebar karena pendek.
    deskripsi: 'Fitur yang berjalan, pelatihan, dan pendampingan.',
    verifikasi: 'Verifikasi H-20, H-24',
    harga: 'Hubungi kami',
    aksi: { label: 'Jadwalkan Demo', rute: 'demo' },
  },
  modular: {
    judul: 'Paket modular',
    deskripsi: {
      web: 'Fitur inti ada di setiap paket. Jurusan, PKL, dan analitik pembelajaran ditambahkan sesuai kebutuhan sekolah.',
      mobile: 'Jurusan, PKL, dan analitik ditambah sesuai kebutuhan.',
    },
    verifikasi: 'Verifikasi H-24',
    tag: ['Analitik pembelajaran', 'Jurusan dan kompetensi (SMK)', 'PKL (SMK)'],
    harga: 'Hubungi kami',
    aksi: { label: 'Konsultasikan Kebutuhan', rute: 'demo' },
  },
};

export const TERMASUK = {
  id: 'termasuk-di-setiap-paket',
  eyebrow: 'Termasuk di setiap paket',
  judul: 'Aplikasi, pelatihan, dan pendampingan',
  verifikasi: 'Verifikasi H-20',
  kartu: [
    {
      ikon: IconPlayerPlay,
      judul: 'Demo gratis',
      deskripsi: { web: 'Kebutuhan dipetakan sebelum sekolah memutuskan.', mobile: 'Kebutuhan dipetakan sebelum memutuskan.' },
      verifikasi: 'Verifikasi H-20', // "Demo gratis" sendiri belum terverifikasi
    },
    {
      ikon: IconSchool,
      judul: 'Pelatihan per peran',
      deskripsi: { web: 'Admin, guru, dan wali kelas dilatih sesuai tugas.', mobile: 'Admin, guru, dan wali kelas dilatih.' },
    },
    { ikon: IconHeadset, judul: 'Dukungan WhatsApp', deskripsi: 'Kendala dibantu pada jam kerja sekolah.', verifikasi: 'Verifikasi H-20' },
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
