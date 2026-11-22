// Tab Kepala sekolah (D9) halaman Fitur Lengkap per peran. Teks dari naskah "Naskah Halaman
// Fitur Lengkap v2" (22 Nov 2026), ditempel apa adanya; ikon dan tata letak dari desain
// kanvas (Fitur.dc.html dan Fitur-Seluler.dc.html). Bentuk data dan arti `tata`,
// `akordeon`, `chip`, dan `verifikasi`: lihat data/fitur.js dan lib/fitur.js.
import {
  IconLayoutGrid,
} from '@tabler/icons-react';

export const PERAN_KEPSEK = {
  label: { web: 'Kepala sekolah', mobile: 'Kepala sekolah' },
  judul: 'Dasbor kepala sekolah dijadwalkan rilis Januari 2027.',
  deskripsi: { web: 'Dasbor akan merangkum kondisi sekolah secara agregat, tanpa peringkat guru. Saat ini berstatus Segera.', mobile: 'Dasbor satu layar, rilis Januari 2027.' },
  tata: 'penuh',
  verifikasi: 'Verifikasi H-15', // isi dasbor: "merangkum kondisi sekolah secara agregat, tanpa peringkat guru"
  sub: [
    {
      kartu: [
        {
          grup: 'Dasbor',
          ikon: IconLayoutGrid,
          judul: 'Dasbor kepala sekolah',
          deskripsi: { web: 'Kondisi sekolah di satu layar, dijadwalkan rilis Januari 2027.', mobile: 'Satu layar, rilis Januari 2027.' },
          tag: ['Satu layar', 'Ringkasan', 'Tanpa peringkat guru'],
          chip: 'segera',
          // Tanpa penanda H-15 di kartu: pemilik mengonfirmasi rilis Januari 2027 pasti (22 Nov).
        },
      ],
    },
  ],
  catatan: { teks: 'Tanpa peringkat guru adalah prinsip rancangan dasbor.', verifikasi: 'Verifikasi H-15' },
};
