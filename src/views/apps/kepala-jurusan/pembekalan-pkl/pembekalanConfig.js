// Konfigurasi modul Pembekalan PKL.
// Warna & label profil diambil dari KuadranConfig agar konsisten dengan
// modul Profil Siswa / Penempatan PKL (jangan hardcode ulang di sini).
import { STATUS_PROFIL_CONFIG } from 'src/components/dashboard-kepala-jurusan/sga/KuadranConfig';

export { STATUS_PROFIL_CONFIG };

// Urutan tampil grup profil: risiko paling berat dulu, siap penuh terakhir —
// selaras dengan prioritas penanganan (mirip CHIP_ORDER di PenempatanPKL,
// namun di sini yang berat didahulukan karena butuh pembekalan lebih intensif).
export const GROUP_ORDER = [
  'RISIKO_GANDA',
  'RISIKO_BEHAVIOR',
  'RISIKO_COMPETENCY',
  'SIAP_PENUH',
  'PARSIAL_BEHAVIOR_SAJA',
  'PARSIAL_COMPETENCY_SAJA',
  'DATA_BELUM_CUKUP',
];

// Materi pembekalan default per profil. Otomatis disarankan sistem
// berdasarkan profil siswa; kepala jurusan tetap bisa menambah/menghapus/
// mengubah lewat MateriEditor. `id` dipakai sebagai key list di FE.
export const MATERI_TEMPLATE = {
  RISIKO_BEHAVIOR: [
    { id: 'rb-1', judul: 'Etika & Disiplin Kerja', deskripsi: 'Membangun sikap disiplin, kehadiran, dan tanggung jawab di lingkungan industri.' },
    { id: 'rb-2', judul: 'Manajemen Waktu & Kehadiran', deskripsi: 'Ketepatan waktu, pengelolaan tugas, dan kepatuhan perizinan.' },
    { id: 'rb-3', judul: 'Sikap Kerja Profesional', deskripsi: 'Komunikasi, kerja sama tim, dan adaptasi budaya kerja.' },
  ],
  RISIKO_COMPETENCY: [
    { id: 'rk-1', judul: 'Penguatan Kompetensi Inti SKKNI', deskripsi: 'Pendalaman unit kompetensi inti yang masih lemah/kritis.' },
    { id: 'rk-2', judul: 'Praktik Keterampilan Teknis', deskripsi: 'Latihan langsung sesuai tuntutan unit kompetensi jurusan.' },
    { id: 'rk-3', judul: 'Studi Kasus Industri', deskripsi: 'Penerapan kompetensi pada studi kasus nyata dari mitra industri.' },
  ],
  RISIKO_GANDA: [
    { id: 'rg-1', judul: 'Pendampingan Intensif Dua Sisi', deskripsi: 'Pembinaan perilaku sekaligus penguatan kompetensi secara terjadwal.' },
    { id: 'rg-2', judul: 'Etika & Disiplin Kerja', deskripsi: 'Membangun sikap disiplin, kehadiran, dan tanggung jawab.' },
    { id: 'rg-3', judul: 'Penguatan Kompetensi Inti SKKNI', deskripsi: 'Pendalaman unit kompetensi inti yang masih lemah/kritis.' },
  ],
  SIAP_PENUH: [
    { id: 'sp-1', judul: 'Orientasi Umum PKL', deskripsi: 'Gambaran pelaksanaan, hak & kewajiban, serta ekspektasi selama PKL.' },
    { id: 'sp-2', judul: 'Budaya & K3 Industri', deskripsi: 'Keselamatan kerja dan adaptasi budaya perusahaan.' },
    { id: 'sp-3', judul: 'Komunikasi Profesional', deskripsi: 'Etika komunikasi, pelaporan, dan kolaborasi di tempat kerja.' },
  ],
};

// Paket orientasi umum untuk status yang tidak punya template khusus
// (parsial / data belum cukup).
export const MATERI_DEFAULT = [
  { id: 'um-1', judul: 'Orientasi Umum PKL', deskripsi: 'Gambaran pelaksanaan, hak & kewajiban, serta ekspektasi selama PKL.' },
  { id: 'um-2', judul: 'Budaya & K3 Industri', deskripsi: 'Keselamatan kerja dan adaptasi budaya perusahaan.' },
];

// Kembalikan salinan (bukan referensi) template materi untuk sebuah profil,
// supaya edit di satu grup tidak mengubah template global.
export const getMateriTemplate = (profilStatus) => {
  const src = MATERI_TEMPLATE[profilStatus] || MATERI_DEFAULT;
  return src.map((m) => ({ ...m }));
};
