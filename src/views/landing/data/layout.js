// Teks tata letak (bar promo dan footer). Disalin apa adanya dari desain kanvas
// (gen/common.py: PROMO dan FOOTER). Teks contoh: ganti lewat landing-copywriter.
import { REGISTRI_RUTE as R, MODUL_SMK } from './nav';
import { CONTACT, KONTAK_RESMI, KONTAK_TAMPIL, mailLink, waLink } from './kontak';

export const PROMO = {
  web: 'Semester genap dimulai Januari. Siapkan absensi sekolah dari sekarang.',
  seluler: 'Semester genap mulai Januari.',
  aksi: { label: 'Jadwalkan demo', ...R.demo },
  labelTutup: 'Tutup pengumuman',
};

export const FOOTER = {
  afiliator: {
    judul: 'Kenal sekolah lain yang butuh ini?',
    deskripsi: 'Perkenalkan Absenin Aja ke jaringan Anda lewat program afiliator.',
    aksi: { label: 'Daftar Afiliator', ...R.afiliator },
  },
  // Versi seluler dari gen/short.py.
  tagline: { web: 'Absensi dan tata kelola sekolah di satu sistem.', mobile: 'Tata kelola sekolah, satu sistem.' },
  kolom: [
    {
      judul: 'Produk',
      tautan: [
        { label: 'Fitur Lengkap', ...R.fitur },
        { label: 'Untuk Sekolah', ...R.untukSekolah },
        { label: 'Pendampingan', ...R.pendampingan },
        { label: 'Paket dan Harga', ...R.paket },
      ],
    },
    {
      judul: 'Perusahaan',
      tautan: [
        { label: 'Tentang Kami', ...R.tentangKami },
        { label: 'Kerja Sama', ...R.kerjaSama },
        { label: 'Blog', ...R.blog },
        { ...MODUL_SMK, label: 'Prakersa' },
      ],
    },
    {
      judul: 'Hubungi kami',
      tautan: [
        // Gerbang rilis (lihat data/kontak.js): KONTAK_RESMI false berarti baris
        // WhatsApp dan email tidak ada di produksi (null disaring di bawah) dan
        // hanya tampil sebagai teks biasa (teks: true) di DEV. Tidak ada wa.me atau mailto.
        KONTAK_TAMPIL
          ? KONTAK_RESMI
            ? { label: `WhatsApp ${CONTACT.whatsappDisplay}`, href: waLink(), external: true, tersedia: true }
            : { label: `WhatsApp ${CONTACT.whatsappDisplay}`, teks: true }
          : null,
        KONTAK_TAMPIL
          ? KONTAK_RESMI
            ? { label: `Email ${CONTACT.email}`, href: mailLink, tersedia: true }
            : { label: `Email ${CONTACT.email}`, teks: true }
          : null,
        { label: 'Kebijakan privasi', ...R.kebijakanPrivasi },
      ].filter(Boolean),
    },
  ],
  hakCipta: '© 2026 Absenin Aja. Hak cipta dilindungi.',
};
