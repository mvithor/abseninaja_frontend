// Tab Kepala jurusan (D10) halaman Fitur Lengkap per peran. Teks dari naskah "Naskah Halaman
// Fitur Lengkap v2" (22 Nov 2026), ditempel apa adanya; ikon dan tata letak dari desain
// kanvas (Fitur.dc.html dan Fitur-Seluler.dc.html). Bentuk data dan arti `tata`,
// `akordeon`, `chip`, dan `verifikasi`: lihat data/fitur.js dan lib/fitur.js.
import {
  IconBriefcase,
  IconClipboardCheck,
  IconGitBranch,
  IconLayoutGrid,
  IconSearch,
  IconUserCheck,
} from '@tabler/icons-react';

export const PERAN_JURUSAN = {
  label: { web: 'Kepala jurusan', mobile: 'Jurusan' },
  judul: 'Kesiapan kerja murid dan penempatan PKL dikelola di Prakersa.',
  deskripsi: { web: 'Kepala jurusan memantau kesiapan murid dan memutuskan penempatan PKL. Fitur unggulannya ada di bawah.', mobile: 'Kesiapan dan PKL ada di Prakersa.' },
  tata: 'grup',
  ikonGrup: {
    'Kesiapan dan kompetensi': IconUserCheck,
    'Penempatan dan pemantauan': IconGitBranch,
  },
  tautanLuar: { label: 'Selengkapnya di Prakersa' }, // tautan keluar; href = URL_MODUL_SMK dipasang di PanelPeran
  sub: [
    {
      kartu: [
        {
          grup: 'Kesiapan dan kompetensi',
          ikon: IconUserCheck,
          judul: 'Profil kesiapan kerja per murid',
          deskripsi: { web: 'Dua skor kesiapan kerja per murid: perilaku dari data kehadiran, dan kompetensi.', mobile: 'Skor perilaku dan kompetensi per murid.' },
          tag: ['Perilaku', 'Kompetensi', 'Dua skor'],
          chip: 'uji-terbatas',
          verifikasi: 'Verifikasi H-17',
        },
        {
          grup: 'Kesiapan dan kompetensi',
          ikon: IconClipboardCheck,
          judul: 'Pemetaan kompetensi SKKNI',
          deskripsi: { web: 'Unit kompetensi SKKNI dan pemetaan mapel ke SKKNI diatur per jurusan.', mobile: 'Pemetaan mapel ke SKKNI per jurusan.' },
          tag: ['SKKNI', 'Pemetaan mapel', 'Jurusan'],
          chip: 'uji-terbatas',
          verifikasi: 'Verifikasi H-17',
        },
        {
          grup: 'Kesiapan dan kompetensi',
          ikon: IconLayoutGrid,
          judul: 'Dasbor kesiapan dan penanda dini',
          deskripsi: { web: 'Ringkasan kelas, matriks kesiapan, dan panel penanda dini, dengan ekspor PDF.', mobile: 'Matriks kesiapan dan penanda dini.' },
          tag: ['Matriks kesiapan', 'Penanda dini', 'Ekspor PDF'],
          chip: 'uji-terbatas',
          verifikasi: 'Verifikasi H-17',
        },
        {
          grup: 'Penempatan dan pemantauan',
          ikon: IconGitBranch,
          judul: 'Saran penempatan PKL',
          deskripsi: { web: 'Saran industri untuk tiap murid, kepala jurusan yang memutuskan dan menetapkan penempatan.', mobile: 'Saran industri, kepala jurusan memutuskan.' },
          tag: ['Saran industri', 'Keputusan kepala jurusan'],
          chip: 'uji-terbatas',
          verifikasi: 'Verifikasi H-17',
        },
        {
          grup: 'Penempatan dan pemantauan',
          ikon: IconBriefcase,
          judul: 'Mitra industri',
          deskripsi: { web: 'Kepala jurusan mengelola daftar mitra industri untuk penempatan PKL.', mobile: 'Kelola daftar mitra industri.' },
          tag: ['Mitra industri', 'Daftar'],
          chip: 'uji-terbatas',
        },
        {
          grup: 'Penempatan dan pemantauan',
          ikon: IconSearch,
          judul: 'Pemantauan selama PKL',
          deskripsi: { web: 'Pemantauan murid selama PKL akan tersedia.', mobile: 'Pemantauan murid selama PKL.' },
          tag: ['Pemantauan', 'PKL'],
          chip: 'segera',
          verifikasi: 'Verifikasi H-17',
        },
      ],
    },
  ],
  catatan: { teks: 'SKKNI adalah Standar Kompetensi Kerja Nasional Indonesia.' },
};
