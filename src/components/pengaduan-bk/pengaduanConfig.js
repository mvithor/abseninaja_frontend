// Konfigurasi pengaduan anonim (sisi BK). Kontrak: docunentation/dashboard bk/PRD-Frontend-Pengaduan-Jadwal-BK.md.

export const KATEGORI_PENGADUAN = [
  { kode: 'perundungan', label: 'Perundungan (bullying)' },
  { kode: 'kekerasan', label: 'Kekerasan fisik' },
  { kode: 'pelecehan', label: 'Pelecehan' },
  { kode: 'kesehatan_mental', label: 'Kesehatan mental' },
  { kode: 'keluarga', label: 'Masalah keluarga' },
  { kode: 'zat_terlarang', label: 'Rokok / narkoba' },
  { kode: 'lainnya', label: 'Lainnya' },
];

export const STATUS_PENGADUAN = [
  { kode: 'baru', label: 'Baru', color: 'primary' },
  { kode: 'ditinjau', label: 'Ditinjau', color: 'info' },
  { kode: 'ditindaklanjuti', label: 'Ditindaklanjuti', color: 'warning' },
  { kode: 'selesai', label: 'Selesai', color: 'success' },
  { kode: 'ditutup', label: 'Ditutup', color: 'default' },
];

export const URGENSI_PENGADUAN = [
  { kode: 'darurat', label: 'Darurat', color: 'error' },
  { kode: 'tinggi', label: 'Tinggi', color: 'warning' },
  { kode: 'normal', label: 'Normal', color: 'default' },
];

export const metaStatusPengaduan = (kode) => STATUS_PENGADUAN.find((s) => s.kode === kode) || { kode, label: kode, color: 'default' };
export const metaUrgensi = (kode) => URGENSI_PENGADUAN.find((u) => u.kode === kode) || { kode, label: kode, color: 'default' };

/** Kategori pengaduan → kategori masalah jurnal, untuk mengisi awal form "Catat di jurnal". */
export const KATEGORI_KE_JURNAL = {
  perundungan: 'sosial',
  kekerasan: 'kedisiplinan',
  pelecehan: 'sosial',
  kesehatan_mental: 'pribadi',
  keluarga: 'keluarga',
  zat_terlarang: 'kedisiplinan',
  lainnya: 'pribadi',
};

/** "3 jam lalu", "2 hari lalu" untuk kotak masuk. */
export const waktuRelatif = (iso, now = Date.now()) => {
  const selisih = Math.max(0, now - new Date(iso).getTime());
  const menit = Math.floor(selisih / 60000);
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
};
