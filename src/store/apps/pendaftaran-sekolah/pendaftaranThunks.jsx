// pendaftaranThunks.jsx
import axiosInstance from "src/utils/axiosInstance";
import { 
  getPendaftaranSekolah, 
  fetchPendaftaranSekolahByIdFailure,
  fetchPendaftaranSekolahByIdRequest,
  fetchPendaftaranSekolahByIdSuccess, 
} from "./pendaftaranSekolahSlice";

// Konsisten dengan router backend
const API_BASE = "/api/v1/super-admin/pendaftaran";
const FORM_URL = `${API_BASE}/form`;

export const fetchAllPendaftaranSekolah = (sekolahId = null) => async (dispatch) => {
  try {
    const url = sekolahId ? `${FORM_URL}?sekolah_id=${sekolahId}` : FORM_URL;
    const { data } = await axiosInstance.get(url);
    const normalized = Array.isArray(data) ? data : (data ? [data] : []);
    dispatch(getPendaftaranSekolah(normalized));
  } catch (error) {
    console.error("❌ Gagal fetch pendaftaran:", error);
  }
};

export const fetchPendaftaranSekolahById = (id) => async (dispatch) => {
  dispatch(fetchPendaftaranSekolahByIdRequest());
  try {
    const { data } = await axiosInstance.get(`${API_BASE}/${id}`); // ⬅️ BUKAN /form/:id
    dispatch(fetchPendaftaranSekolahByIdSuccess(data));
  } catch (error) {
    const msg = error?.response?.status === 404
      ? "Data pendaftaran tidak ditemukan."
      : (error?.message || "Terjadi kesalahan mengambil data pendaftaran.");
    dispatch(fetchPendaftaranSekolahByIdFailure(msg));
    console.error("❌ fetchPendaftaranSekolahById:", error);
  }
};
