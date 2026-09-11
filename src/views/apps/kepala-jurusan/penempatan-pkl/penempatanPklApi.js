import axiosInstance from 'src/utils/axiosInstance';

const BASE = '/api/v1/kepala-jurusan/placement';
// [BARU] Resource terpisah dari placement — controller & router sendiri
// (readinessProfileController.js), bukan bagian dari BASE di atas.
const READINESS_PROFILE_BASE = '/api/v1/kepala-jurusan/readiness-profile';

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

// [BARU] axios dengan responseType 'blob' tetap mengembalikan Blob untuk
// response ERROR juga (body JSON error ikut terbungkus sebagai Blob, tidak
// otomatis di-parse) — tanpa ini, pesan spesifik dari backend (mis. "Belum
// ada unit SKKNI dinilai") tidak pernah sampai ke user, cuma error generik.
async function extractBlobErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (data instanceof Blob && data.type === 'application/json') {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.error?.message || parsed?.msg || fallback;
    } catch {
      return fallback;
    }
  }
  return error?.response?.data?.error?.message || error?.response?.data?.msg || fallback;
}

function filenameFromContentDisposition(headerValue, fallback) {
  if (!headerValue) return fallback;
  const match = /filename="?([^"]+)"?/.exec(headerValue);
  return match ? match[1] : fallback;
}

// [BARU] Unduh PDF Profil Kesiapan Kerja satu siswa.
export const downloadReadinessProfilePdf = async (siswaId) => {
  try {
    const res = await axiosInstance.get(`${READINESS_PROFILE_BASE}/${siswaId}/export`, {
      responseType: 'blob',
    });
    const filename = filenameFromContentDisposition(res.headers['content-disposition'], `Profil-Kesiapan-Kerja-${siswaId}.pdf`);
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(await extractBlobErrorMessage(error, 'Gagal mengunduh PDF profil siswa.'));
  }
};