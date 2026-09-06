import axiosInstance from 'src/utils/axiosInstance';

// ═══════════════════════════════════════════════════════════════════════════
// Pembekalan PKL — lapisan data (HYBRID).
//
// • Daftar siswa: endpoint NYATA `profile-siswa/list` (sama dengan modul
//   Profil Siswa / sumber kelas Penempatan PKL). Difilter kelas XI saja.
// • Materi / jadwal / pemateri / publish: BELUM ada backend. Sementara
//   dipersistkan di localStorage sebagai dummy agar fitur bisa dipakai &
//   demoable. Setiap fungsi dummy ditandai [DUMMY — sambung backend] agar
//   mudah diganti axiosInstance ketika endpoint tersedia.
// ═══════════════════════════════════════════════════════════════════════════

// Cocokkan nama kelas tingkat XI saja (mis. "XI TKJ"), JANGAN ikut XII.
// `^XI` diikuti spasi atau akhir string; "XII..." otomatis tersaring keluar.
const KELAS_XI_REGEX = /^XI(\s|$)/i;

export const isKelasXI = (namaKelas) => KELAS_XI_REGEX.test((namaKelas || '').trim());

// Ambil SELURUH siswa (semester Ganjil = semester aktif backend) beserta
// opsi kelas. Penyaringan tingkat (XI saja / semua) dilakukan di komponen
// agar bisa di-toggle — berguna untuk pratinjau saat data kelas XI kosong.
// Bentuk response endpoint: { total_siswa, kelas_options, semua_siswa }
// (lihat ProfilSiswaList.jsx).
export const fetchSiswaPembekalan = async () => {
  const res = await axiosInstance.get('/api/v1/kepala-jurusan/profile-siswa/list');
  const data = res.data?.data ?? {};
  return {
    kelasOptions: data.kelas_options ?? [],
    siswa: data.semua_siswa ?? [],
  };
};

// [DUMMY — sambung backend] Daftar guru pemateri. Nanti diganti endpoint
// guru jurusan (mis. GET /kepala-jurusan/guru). ID dipakai sebagai value select.
export const fetchPemateriOptions = async () => [
  { id: 'g-1', nama: 'Budi Santoso, S.Pd.', bidang: 'Produktif / Kejuruan' },
  { id: 'g-2', nama: 'Siti Aminah, S.Pd.', bidang: 'Bimbingan Konseling' },
  { id: 'g-3', nama: 'Ahmad Fauzi, S.T.', bidang: 'Produktif / Kejuruan' },
  { id: 'g-4', nama: 'Dewi Lestari, M.Pd.', bidang: 'Wali Kelas' },
  { id: 'g-5', nama: 'Rizky Pratama, S.Kom.', bidang: 'Produktif / Kejuruan' },
];

// ── Persistensi dummy rencana pembekalan (localStorage) ────────────────────
const STORAGE_KEY = 'pembekalan-pkl-plan-v1';

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeStore = (obj) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
};

// [DUMMY — sambung backend] Ambil seluruh rencana pembekalan tersimpan.
// Bentuk: { [groupCode]: { materi, jadwal, sesi, lokasi, pemateriId, status } }.
export const getPembekalanPlan = async () => readStore();

// [DUMMY — sambung backend] Simpan rencana satu grup profil.
export const savePembekalanGroup = async (groupCode, payload) => {
  const store = readStore();
  store[groupCode] = { ...payload, status: payload.status || 'DRAFT' };
  writeStore(store);
  return store[groupCode];
};

// [DUMMY — sambung backend] Publikasikan rencana ke akun mobile siswa.
// Tandai grup PUBLISHED, kembalikan jumlah siswa terdampak (simulasi kirim).
export const publishPembekalan = async ({ groupCodes, siswaCount }) => {
  const store = readStore();
  groupCodes.forEach((code) => {
    if (store[code]) store[code].status = 'PUBLISHED';
  });
  writeStore(store);
  return { published: groupCodes.length, siswaCount };
};
