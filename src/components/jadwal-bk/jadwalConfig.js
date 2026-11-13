// Konfigurasi jadwal konseling BK. Kontrak: docunentation/dashboard bk/PRD-Frontend-Pengaduan-Jadwal-BK.md.
// Waktu dikirim/diterima sebagai tanggal + jam dinding di zona waktu sekolah.

export const STATUS_JADWAL = [
  { kode: 'terjadwal', label: 'Terjadwal', color: 'primary', simbol: '' },
  { kode: 'selesai', label: 'Selesai', color: 'success', simbol: '✓ ' },
  { kode: 'tidak_hadir', label: 'Tidak Hadir', color: 'error', simbol: '⚠ ' },
  { kode: 'dibatalkan', label: 'Dibatalkan', color: 'default', simbol: '✕ ' },
];

export const metaStatusJadwal = (kode) => STATUS_JADWAL.find((s) => s.kode === kode) || STATUS_JADWAL[0];

export const LOKASI_SARAN = ['Ruang BK 1', 'Ruang BK 2', 'Ruang Konseling Kelompok', 'Rumah siswa', 'Daring (video call)'];

/** "2026-11-05" + "09:30" → Date lokal (jam dinding, tanpa geser zona waktu) untuk kalender. */
export const keDate = (tanggal, jam = '00:00') => {
  const [y, m, d] = tanggal.split('-').map(Number);
  const [hh, mm] = jam.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

/** Date lokal → "HH:mm". */
export const keJam = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
