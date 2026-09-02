import axiosInstance from 'src/utils/axiosInstance';

// GET /api/v1/kepala-jurusan/dashboard (dok: "Endpoint Dashboard Kepala Jurusan").
// Auth (Bearer) & baseURL sudah ditangani axiosInstance. Mengembalikan body
// mentah: bisa DashboardResponse (ada `kpi`) atau `{ data: null, msg }` (kosong).
export const fetchDashboard = async (kelasId = 'all') => {
  const res = await axiosInstance.get('/api/v1/kepala-jurusan/dashboard', {
    params: { kelas_id: kelasId ?? 'all' },
  });
  return res.data;
};
