// Tab Admin sekolah (D1) halaman Fitur Lengkap per peran. Teks dari naskah "Naskah Halaman
// Fitur Lengkap v2" (22 Nov 2026), ditempel apa adanya; ikon dan tata letak dari desain
// kanvas (Fitur.dc.html dan Fitur-Seluler.dc.html). Bentuk data dan arti `tata`,
// `akordeon`, `chip`, dan `verifikasi`: lihat data/fitur.js dan lib/fitur.js.
import {
  IconAward,
  IconBallFootball,
  IconCalendar,
  IconFileCheck,
  IconId,
  IconScan,
  IconTable,
  IconUserCheck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';

export const PERAN_ADMIN = {
  label: { web: 'Admin sekolah', mobile: 'Admin' },
  judul: 'Kehadiran, data, dan jadwal sekolah dikelola dari satu portal web.',
  deskripsi: { web: 'Admin dan tata usaha mengelola kehadiran, data murid dan pegawai, serta jadwal. Keuangan sedang dibuat. Penerimaan murid baru ada di tab sendiri.', mobile: 'Kehadiran, data, dan jadwal. Keuangan segera.' },
  tata: 'penuh',
  sub: [
    {
      kartu: [
        {
          grup: 'Presensi',
          ikon: IconScan,
          judul: 'Absensi QR di gerbang',
          deskripsi: { web: 'Murid memindai kartu QR saat datang dan pulang, kehadiran tercatat otomatis.', mobile: 'Datang dan pulang tercatat dari kartu QR.' },
          tag: ['Kartu QR', 'Datang', 'Pulang'],
        },
        {
          grup: 'Presensi',
          ikon: IconUserCheck,
          judul: 'Absensi pegawai',
          deskripsi: { web: 'Kehadiran guru dan staf dicatat dalam sistem yang sama.', mobile: 'Kehadiran guru dan staf dicatat.' },
          tag: ['Guru', 'Staf'],
          verifikasi: 'Verifikasi H-2',
        },
        {
          grup: 'Presensi',
          ikon: IconFileCheck,
          judul: 'Perizinan',
          deskripsi: { web: 'Izin murid dan pegawai dicatat, rekapnya bisa diunduh sebagai PDF.', mobile: 'Izin tercatat, rekap bisa diunduh.' },
          tag: ['Murid', 'Pegawai', 'Rekap PDF'],
        },
        {
          grup: 'Kesiswaan',
          ikon: IconUsers,
          judul: 'Data murid, alumni, dan transfer kelas',
          deskripsi: { web: 'Data murid, wali, dan alumni di satu tempat, termasuk transfer kelas.', mobile: 'Murid, wali, alumni, dan transfer kelas.' },
          tag: ['Murid', 'Alumni', 'Transfer kelas'],
        },
        {
          grup: 'Kesiswaan',
          ikon: IconBallFootball,
          judul: 'Ekskul',
          deskripsi: { web: 'Admin mengelola ekskul, jadwal, dan anggotanya.', mobile: 'Kelola ekskul, jadwal, dan anggota.' },
          tag: ['Ekskul', 'Jadwal', 'Anggota'],
        },
        {
          grup: 'Kesiswaan',
          ikon: IconAward,
          judul: 'Prestasi',
          deskripsi: { web: 'Prestasi murid dan prestasi sekolah dicatat di satu tempat.', mobile: 'Prestasi murid dan sekolah tercatat.' },
          tag: ['Murid', 'Sekolah', 'Galeri'],
        },
        {
          grup: 'Data induk',
          ikon: IconId,
          judul: 'Data pegawai dan status',
          deskripsi: { web: 'Data guru dan staf, termasuk status nonaktif dengan alasan baku.', mobile: 'Data guru dan staf, termasuk status nonaktif.' },
          tag: ['Guru', 'Staf', 'Status nonaktif'],
        },
        {
          grup: 'Data induk',
          ikon: IconTable,
          judul: 'Impor Excel dan pusat unduh',
          deskripsi: { web: 'Data masuk lewat berkas Excel, dokumen dan rekap keluar lewat pusat unduh.', mobile: 'Impor Excel, unduh rekap dari satu tempat.' },
          tag: ['Impor Excel', 'Pusat unduh'],
        },
        {
          grup: 'Akademik',
          ikon: IconCalendar,
          judul: 'Struktur akademik dan jadwal',
          deskripsi: { web: 'Semester, kelas, mapel, dan jadwal pelajaran serta ekskul disusun di satu tempat.', mobile: 'Kelas, mapel, ekskul, dan jadwal.' },
          tag: ['Kelas', 'Mapel', 'Ekskul'],
        },
        {
          grup: 'Keuangan',
          ikon: IconWallet,
          judul: 'Keuangan dan SPP',
          deskripsi: { web: 'Tagihan dan pembayaran SPP akan dikelola dalam sistem.', mobile: 'Tagihan dan pembayaran SPP.' },
          tag: ['Tagihan', 'Pembayaran'],
          chip: 'segera',
          verifikasi: 'Verifikasi H-11',
        },
      ],
    },
  ],
};
