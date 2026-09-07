import axiosInstance from 'src/utils/axiosInstance';

const BASE = '/api/v1/kepala-jurusan/placement';

export const fetchClassOptions = async () => {
  const res = await axiosInstance.get('/api/v1/kepala-jurusan/profile-siswa/list');
  return res.data?.data?.kelas_options ?? [];
};

export const fetchClassDashboard = async (classId) => {
  const res = await axiosInstance.get(`${BASE}/classes/${classId}/dashboard`);
  return res.data;
};

export const fetchRecommendations = async (studentId) => {
  const res = await axiosInstance.get(`${BASE}/students/${studentId}/recommendations`);
  return res.data;
};

export const createPlacement = async (payload) => {
  const res = await axiosInstance.post(`${BASE}/placements`, payload);
  return res.data;
};

export const cancelPlacement = async (placementId, reason) => {
  const res = await axiosInstance.delete(`${BASE}/placements/${placementId}`, {
    data: { reason },
  });
  return res.data;
};

// [Siswa PKL] Roster operasional — semester aktif sistem, tanpa parameter.
export const fetchSiswaPklAktif = async () => {
  const res = await axiosInstance.get(`${BASE}/siswa-pkl`);
  return res.data;
};

export const fetchRiwayatSemesters = async () => {
  const res = await axiosInstance.get(`${BASE}/riwayat-pkl/semesters`);
  return res.data?.data ?? [];
};

export const fetchRiwayatPenempatan = async (semesterAjaranId) => {
  const res = await axiosInstance.get(`${BASE}/riwayat-pkl`, {
    params: { semesterAjaranId },
  });
  return res.data;
};