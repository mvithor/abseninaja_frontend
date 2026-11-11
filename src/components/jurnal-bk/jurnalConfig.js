// Konfigurasi jurnal penanganan siswa (portal Guru BK).
// Kontrak: docunentation/dashboard bk/PRD-Frontend-Jurnal-Riwayat-BK.md.

export const JENIS_LAYANAN = [
  { kode: 'konseling_individu', label: 'Konseling Individu' },
  { kode: 'konseling_kelompok', label: 'Konseling Kelompok' },
  { kode: 'panggilan_ortu', label: 'Panggilan Orang Tua' },
  { kode: 'home_visit', label: 'Kunjungan Rumah' },
  { kode: 'mediasi', label: 'Mediasi' },
  { kode: 'konsultasi', label: 'Konsultasi Guru/Wali Kelas' },
  { kode: 'referal', label: 'Alih Tangan Kasus' },
];

export const KATEGORI_MASALAH = [
  { kode: 'pribadi', label: 'Pribadi' },
  { kode: 'sosial', label: 'Sosial' },
  { kode: 'belajar', label: 'Belajar' },
  { kode: 'karier', label: 'Karier' },
  { kode: 'kedisiplinan', label: 'Kedisiplinan' },
  { kode: 'kehadiran', label: 'Kehadiran' },
  { kode: 'ekonomi', label: 'Ekonomi' },
  { kode: 'kesehatan', label: 'Kesehatan' },
  { kode: 'keluarga', label: 'Keluarga' },
];

export const STATUS_PENANGANAN = Object.freeze({ SELESAI: 'selesai', TINDAK_LANJUT: 'tindak_lanjut', DIRUJUK: 'dirujuk' });

export const STATUS_PENANGANAN_OPTIONS = [
  { kode: STATUS_PENANGANAN.SELESAI, label: 'Selesai', color: 'success' },
  { kode: STATUS_PENANGANAN.TINDAK_LANJUT, label: 'Perlu Tindak Lanjut', color: 'warning' },
  { kode: STATUS_PENANGANAN.DIRUJUK, label: 'Dirujuk', color: 'info' },
];

export const statusPenangananMeta = (kode) =>
  STATUS_PENANGANAN_OPTIONS.find((s) => s.kode === kode) || { kode, label: kode, color: 'default' };

// Layanan yang wajar melibatkan lebih dari satu siswa.
export const LAYANAN_KELOMPOK = ['konseling_kelompok', 'mediasi'];

/** "Kamis, 5 November 2026" dari "2026-11-05" (tanpa geser zona waktu). */
export const formatTanggalPanjang = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  if (!m) return '-';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
};

export const formatTanggalPendek = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  if (!m) return '-';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
};

/** Hari ini (YYYY-MM-DD) di zona waktu sekolah. */
export const hariIniDi = (timeZone = 'Asia/Jakarta', geserHari = 0) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(Date.now() + geserHari * 24 * 60 * 60 * 1000));

/** Tindak lanjut dengan tanggal yang sudah lewat (dibandingkan hari ini di sekolah). */
export const isTindakLanjutLewat = (entri, hariIni) =>
  entri?.status?.kode === STATUS_PENANGANAN.TINDAK_LANJUT && entri?.tindak_lanjut?.tanggal && entri.tindak_lanjut.tanggal < hariIni;

// Query yang memuat data jurnal: dibuat ulang setelah tambah/ubah/hapus catatan.
const QUERY_KEY_JURNAL = ['bk-jurnal', 'bk-riwayat', 'bk-riwayat-detail', 'bk-jurnal-detail', 'bk-akses-rahasia'];

export const invalidasiJurnal = (queryClient) =>
  QUERY_KEY_JURNAL.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

// Status izin baca catatan rahasia oleh koordinator (diputuskan penulis catatan).
export const STATUS_AKSES = Object.freeze({ DIMINTA: 'diminta', DISETUJUI: 'disetujui', DITOLAK: 'ditolak', DICABUT: 'dicabut' });
