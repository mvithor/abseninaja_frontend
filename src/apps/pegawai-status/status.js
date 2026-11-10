// Logika murni nonaktifkan/aktifkan pegawai (tanpa React), dipakai admin sekolah (Guru, Staf, Pegawai Nonaktif) dan
// super admin (Guru Mandiri). Cermin abseninaja_backend/src/utils/pegawai-konstanta.js; server tetap yang memutuskan.
// Kalimat tanpa kata "Anda".

export const BATAS_CATATAN = 500;

// Urutan = urutan di dropdown. Kode ini dijaga CHECK di database, jadi tidak boleh dikarang di klien.
export const ALASAN_NONAKTIF = Object.freeze([
  { kode: 'MUTASI', label: 'Mutasi atau pindah tugas' },
  { kode: 'MENGUNDURKAN_DIRI', label: 'Mengundurkan diri' },
  { kode: 'PENSIUN', label: 'Pensiun' },
  { kode: 'KONTRAK_BERAKHIR', label: 'Kontrak berakhir' },
  { kode: 'DIBERHENTIKAN', label: 'Diberhentikan' },
  { kode: 'MENINGGAL', label: 'Meninggal dunia' },
  { kode: 'CUTI_PANJANG', label: 'Cuti panjang' },
  { kode: 'LAINNYA', label: 'Lainnya (catatan wajib)' },
]);

const LABEL_ALASAN = Object.freeze(Object.fromEntries(ALASAN_NONAKTIF.map((a) => [a.kode, a.label.replace(' (catatan wajib)', '')])));

export const labelAlasan = (kode) => (Object.prototype.hasOwnProperty.call(LABEL_ALASAN, kode) ? LABEL_ALASAN[kode] : '-');

export const metaStatusPegawai = (status) =>
  status === 'nonaktif'
    ? { label: 'Nonaktif', bg: '#E0E0E0', color: '#424242' }
    : { label: 'Aktif', bg: '#34C759', color: '#fff' };

/** Pesan galat, atau '' bila siap dikirim. */
export const validasiNonaktif = ({ alasanKode, catatan }) => {
  if (!alasanKode) return 'Alasan nonaktif wajib dipilih.';
  if (!ALASAN_NONAKTIF.some((a) => a.kode === alasanKode)) return 'Alasan nonaktif tidak valid.';
  const teks = String(catatan ?? '').trim();
  if (alasanKode === 'LAINNYA' && !teks) return 'Catatan wajib diisi bila alasan Lainnya.';
  if (teks.length > BATAS_CATATAN) return `Catatan maksimal ${BATAS_CATATAN} karakter.`;
  return '';
};

export const bangunPayloadNonaktif = ({ alasanKode, catatan }) => {
  const teks = String(catatan ?? '').trim();
  return teks ? { alasan_kode: alasanKode, catatan: teks } : { alasan_kode: alasanKode };
};

// Tanggung jawab yang masih dipegang pegawai pada periode aktif (GET /pegawai/:id/tanggung-jawab).
const BARIS_TANGGUNG_JAWAB = [
  ['guru_mapel', (n) => `Guru mata pelajaran di ${n} kelas`],
  ['jadwal', (n) => `${n} slot jadwal pelajaran`],
  ['wali_kelas', (n) => `Wali kelas di ${n} kelas`],
  ['ekskul', (n) => `Pembina ${n} ekstrakurikuler`],
  ['kepala_jurusan', (n) => `Kepala jurusan di ${n} jurusan`],
  ['penugasan_peran', (n) => `${n} penugasan peran (persona) yang akan dicabut`],
  ['kelas_lad', (n) => `${n} kelas di Analitik Pembelajaran`],
];

/** Daftar kalimat peringatan; kosong bila tidak ada tanggung jawab. */
export const peringatanTanggungJawab = (tj) => {
  if (!tj || typeof tj !== 'object') return [];
  return BARIS_TANGGUNG_JAWAB
    .map(([kunci, kalimat]) => [Number(tj[kunci]) || 0, kalimat])
    .filter(([n]) => n > 0)
    .map(([n, kalimat]) => kalimat(n));
};

/** Tanggung jawab yang perlu pengganti (jadwal, wali kelas, dst.); penugasan peran dan kelas LAD tidak dihitung. */
export const adaYangPerluPengganti = (tj) =>
  ['guru_mapel', 'jadwal', 'wali_kelas', 'ekskul', 'kepala_jurusan'].some((k) => Number(tj?.[k]) > 0);

/**
 * Respons nonaktifkan membawa efek samping yang gagal (sesi/FCM/cache). Itu bukan kegagalan operasi, tetapi pengelola
 * harus tahu, jadi ditampilkan sebagai peringatan (bukan sukses polos).
 */
export const adaEfekGagal = (respons) => {
  const efek = respons?.data?.efek;
  return Boolean(respons?.peringatan) || Boolean(efek?.sesi_gagal || efek?.fcm_gagal || efek?.cache_gagal);
};

export const pesanHasilNonaktif = (respons) => {
  if (respons?.peringatan) return { galat: respons.peringatan, sukses: '' };
  if (adaEfekGagal(respons)) {
    return { galat: `${respons.msg} Sebagian efek (sesi login atau notifikasi) belum berhasil dibersihkan. Ulangi Nonaktifkan.`, sukses: '' };
  }
  return { galat: '', sukses: respons?.msg || 'Pegawai berhasil dinonaktifkan.' };
};

// Tempat mengganti tanggung jawab pegawai nonaktif (halaman Perlu Pengganti). Hanya yang perlu pengganti.
const TUJUAN_PENGGANTI = [
  ['guru_mapel', 'Guru mata pelajaran', '/dashboard/admin-sekolah/guru-mapel'],
  ['jadwal', 'Jadwal pelajaran', '/dashboard/admin-sekolah/jadwal-mapel'],
  ['wali_kelas', 'Wali kelas', '/dashboard/admin-sekolah/wali-kelas'],
  ['ekskul', 'Ekstrakurikuler', '/dashboard/admin-sekolah/ekskul'],
  ['kepala_jurusan', 'Kepala jurusan', '/dashboard/admin-sekolah/jurusan'],
];

/** [{ kunci, label, jumlah, href }] untuk tanggung jawab yang masih > 0 dan perlu diganti. */
export const butirPengganti = (tj) =>
  TUJUAN_PENGGANTI
    .map(([kunci, label, href]) => ({ kunci, label, href, jumlah: Number(tj?.[kunci]) || 0 }))
    .filter((b) => b.jumlah > 0);
