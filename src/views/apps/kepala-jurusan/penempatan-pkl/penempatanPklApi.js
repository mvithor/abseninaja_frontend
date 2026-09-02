import axiosInstance from 'src/utils/axiosInstance';

// ═══════════════════════════════════════════════════════════════════════════
// PKL Placement Engine — panggilan endpoint (dok "Integrasi Frontend — PKL
// Placement Engine"). Base path: /api/v1/kepala-jurusan/placement.
// Auth Bearer & baseURL ditangani axiosInstance.
// ═══════════════════════════════════════════════════════════════════════════
const BASE = '/api/v1/kepala-jurusan/placement';

// Opsi kelas untuk selektor. Sumber: profile-siswa/list (punya {id, nama_kelas}).
// Endpoint dashboard PKL butuh classId spesifik, jadi daftar kelas diambil dari
// sini (bukan endpoint PKL yang selalu per-kelas).
export const fetchClassOptions = async () => {
  const res = await axiosInstance.get('/api/v1/kepala-jurusan/profile-siswa/list');
  return res.data?.data?.kelas_options ?? [];
};

// §6 — Dashboard kelas (sidebar + progress + chip + daftar siswa).
export const fetchClassDashboard = async (classId) => {
  const res = await axiosInstance.get(`${BASE}/classes/${classId}/dashboard`);
  return res.data;
};

// §7 — Rekomendasi Top-3 + recommendationToken (berlaku 30 menit).
export const fetchRecommendations = async (studentId) => {
  const res = await axiosInstance.get(`${BASE}/students/${studentId}/recommendations`);
  return res.data;
};

// §8 — Tetapkan penempatan (terima rekomendasi). Wajib membawa recommendationToken.
export const createPlacement = async (payload) => {
  const res = await axiosInstance.post(`${BASE}/placements`, payload);
  return res.data;
};

// §9 — Batalkan penempatan (soft-cancel). `reason` wajib, dikirim di body.
export const cancelPlacement = async (placementId, reason) => {
  const res = await axiosInstance.delete(`${BASE}/placements/${placementId}`, {
    data: { reason },
  });
  return res.data;
};
