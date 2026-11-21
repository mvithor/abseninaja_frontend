// Teks dan daftar halaman Testimoni (`/bukti/testimoni`). Disalin apa adanya dari
// desain kanvas (Testimoni.dc.html dan Testimoni-Seluler.dc.html). Teks dua
// versi berbentuk { web, mobile }. Tanda bintang pada judul (*kata*) = kata
// berwarna aksen.
//
// SELURUH NAMA, JABATAN, SEKOLAH, KUTIPAN, DAN BINTANG DI HALAMAN INI DUMMY dari
// desain (instruksi pengguna 21 Nov 2026: dummy dulu agar desain bersih).
// Halaman digerbang oleh BUKTI_DIRILIS (lib/gerbang.js) dan tidak boleh tampil
// di produksi sebelum kutipan nyata dan izin tertulis narasumber ada.
// `verifikasi` (true atau teks label) = klaim berisiko; penandanya tampil hanya
// bila flags.tampilkanPenandaDesain menyala.
import { IconBell, IconSchool, IconUser, IconUsers } from '@tabler/icons-react';
import { JUMLAH_SEKOLAH } from './sekolahMitra';

// DUMMY wajib diganti sebelum main: klaim izin ("sudah memberi izin") di
// description dan HERO.sub; pastikan izin tertulis narasumber memang ada.
export const META = {
  title: 'Testimoni | Absenin Aja',
  description: 'Pengalaman pengguna yang sudah memberi izin.',
};

// Empat kartu fakta di hero: peran pemberi testimoni. Di desain berupa kartu
// penanda, bukan kontrol, jadi bukan tab.
export const HERO = {
  eyebrow: 'Bukti · Testimoni',
  judul: 'Kata mereka *tentang Absenin Aja.*',
  sub: {
    web: 'Pengalaman pengguna yang sudah memberi izin.',
    mobile: 'Dari pengguna yang memberi izin.',
  },
  fakta: [
    { ikon: IconUsers, label: 'Kepala sekolah' },
    { ikon: IconSchool, label: 'Guru' },
    { ikon: IconBell, label: 'Wali murid' },
    { ikon: IconUser, label: 'Admin sekolah' },
  ],
};

export const SOROT = {
  id: 'judul-dipercaya',
  tag: 'Sekolah mitra',
  // DUMMY wajib diganti sebelum main (angka dari JUMLAH_SEKOLAH di data/sekolahMitra.js)
  judul: `Dipercaya ${JUMLAH_SEKOLAH} sekolah`,
  teks: {
    web: 'Dari sekolah negeri sampai swasta, dari kota sampai kabupaten.',
    mobile: 'Negeri dan swasta, kota dan kabupaten.',
  },
  aksi: { label: 'Jadwalkan Demo', rute: 'demo' },
  verifikasi: 'Verifikasi jumlah sekolah mitra',
};

// DUMMY wajib diganti sebelum main: seluruh butir di bawah (kutipan, nama,
// jabatan, sekolah, bintang). Nyatakan hanya testimoni yang sudah disetujui
// tertulis oleh narasumber.
export const TESTIMONI = {
  id: 'judul-testimoni',
  eyebrow: 'Dari pengguna',
  judul: 'Pengalaman nyata *setelah memakai*',
  butir: [
    {
      kutipan: 'Rekap kehadiran yang dulu memakan satu hari kini selesai dalam hitungan menit.',
      nama: 'Siti Rahmawati',
      peran: 'Kepala Sekolah, SMP Harapan Bangsa',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
    {
      kutipan: 'Wali murid langsung tahu kabar kehadiran anaknya, dan telepon ke sekolah jauh berkurang.',
      nama: 'Ahmad Fauzi',
      peran: 'Guru Matematika, MTs Nurul Ilmu',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
    {
      kutipan: 'Jadwal dan absensi tidak lagi terpisah. Semua guru melihat data yang sama.',
      nama: 'Dewi Lestari',
      peran: 'Wali Kelas, SMP Tunas Mandiri',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
    {
      kutipan: 'Pendampingan timnya membuat guru cepat terbiasa, bahkan yang belum akrab dengan aplikasi.',
      nama: 'Budi Santoso',
      peran: 'Admin Sekolah, SMA Cendekia',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
    {
      kutipan: 'Kami memantau kondisi sekolah dari satu layar, tanpa menunggu laporan manual.',
      nama: 'Rina Marlina',
      peran: 'Wakil Kepala Sekolah, MTs Al-Hidayah',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
    {
      kutipan: 'Pembayaran SPP tercatat rapi dan riwayatnya mudah dicari kapan saja.',
      nama: 'Yusuf Hidayat',
      peran: 'Bendahara, SMP Bina Insani',
      peringkat: 5,
      verifikasi: 'Verifikasi testimoni dan izin narasumber',
    },
  ],
};

export const CTA = {
  judul: 'Bergabunglah bersama sekolah mitra',
  sub: {
    web: 'Jadwalkan demo. Kita mulai dari kebutuhan yang paling mendesak.',
    mobile: 'Jadwalkan demo, mulai dari yang mendesak.',
  },
  aksiUtama: { label: 'Jadwalkan Demo', rute: 'demo' },
  aksiKedua: { label: 'Lihat Sekolah Mitra', rute: 'sekolahMitra' },
};
