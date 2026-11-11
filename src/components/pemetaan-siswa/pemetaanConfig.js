// Konfigurasi bersama portal Guru BK: dimensi pemetaan siswa dan lingkup data.
// Kategori tiap dimensi (label, jumlah, flag perhatian) dikirim server lewat /pemetaan/ringkasan,
// jadi FE hanya menyimpan metadata tampilan (label & ikon) per kode dimensi.
// Kontrak: docunentation/dashboard bk/PRD-Frontend-Dashboard-BK.md.

import { IconBallFootball, IconCoin, IconHeartbeat, IconMapPin, IconMotorbike } from '@tabler/icons-react';

export const BK_API = '/api/v1/guru-bk';

export const DIMENSI = [
  { kode: 'ekonomi', label: 'Ekonomi', icon: IconCoin, keterangan: 'Penghasilan orang tua per bulan & bantuan sosial' },
  { kode: 'geografis', label: 'Geografis', icon: IconMapPin, keterangan: 'Jarak tempat tinggal ke sekolah' },
  { kode: 'kesehatan', label: 'Kesehatan', icon: IconHeartbeat, keterangan: 'Kondisi kesehatan yang perlu diketahui sekolah' },
  { kode: 'kendaraan', label: 'Kendaraan', icon: IconMotorbike, keterangan: 'Moda transportasi ke sekolah' },
  { kode: 'ekskul', label: 'Ekstrakurikuler', icon: IconBallFootball, keterangan: 'Keikutsertaan ekstrakurikuler' },
];

export const dimensiMeta = (kode) => DIMENSI.find((d) => d.kode === kode);

/** Koordinator boleh melihat semua kelas; anggota selalu "saya" (server memaksa). */
export const LINGKUP = Object.freeze({ SAYA: 'saya', SEMUA: 'semua' });

/** Siswa dengan >= 2 faktor perhatian diprioritaskan untuk pendampingan. */
export const AMBANG_PRIORITAS = 2;

/** Kategori dimensi yang datanya belum diisi (server: `belum_diisi`); tidak pernah menjadi faktor perhatian. */
export const BELUM_DIISI = 'belum_diisi';
export const isBelumDiisi = (dimensi) => dimensi?.kategori === BELUM_DIISI;

/** Data siswa bisa belum lengkap: `jenis_kelamin` dan `nis` boleh null. */
export const labelJenisKelamin = (jk) => (jk === 'L' ? 'Laki-laki' : jk === 'P' ? 'Perempuan' : '-');
export const teksNis = (nis) => `NIS ${nis || '-'}`;
