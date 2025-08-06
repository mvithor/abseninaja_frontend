import axiosInstance from "src/utils/axiosInstance";
import { 
    getPendaftaranSekolah, 
    fetchPendaftaranSekolahByIdFailure,
    fetchPendaftaranSekolahByIdRequest,
    fetchPendaftaranSekolahByIdSuccess, 
} from "./pendaftaranSekolahSlice";

const API_URL = "/api/v1/super-admin/pendaftaran/form";

export const fetchAllPendaftaranSekolah = (sekolahId = null) => async (dispatch) => {
  try {
    const response = sekolahId
      ? await axiosInstance.get(`${API_URL}/${sekolahId}`)
      : await axiosInstance.get(API_URL);
    
    const data = response.data;

    // 🔧 Normalisasi: pastikan selalu array
    const normalizedData = Array.isArray(data) ? data : [data];

    dispatch(getPendaftaranSekolah(normalizedData));
  } catch (error) {
    console.error("❌ Gagal fetch pendaftaran:", error);
  }
};


export const fetchPendaftaranSekolahById = (id) => async (dispatch) => {
  dispatch(fetchPendaftaranSekolahByIdRequest());
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    dispatch(fetchPendaftaranSekolahByIdSuccess(response.data));
  } catch (error) {
    dispatch(fetchPendaftaranSekolahByIdFailure(error.message));
  }
};
