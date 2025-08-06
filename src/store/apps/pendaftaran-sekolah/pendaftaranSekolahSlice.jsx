// redux/slices/pendaftaranSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendaftaranSekolah: [],
  currentFilter: 'all',
  pendaftaranSearch: '',
  editingItem: null,
  selectedPendaftaran: null,
  loading: false,
  error: '',
};

const pendaftaranSekolahSlice = createSlice({
  name: 'pendaftaranSekolah',
  initialState,
  reducers: {
    getPendaftaranSekolah: (state, action) => {
      state.pendaftaranSekolah = Array.isArray(action.payload)
        ? action.payload
        : action.payload ? [action.payload] : [];
    },    
    setVisibilityFilter: (state, action) => {
      state.currentFilter = action.payload;
    },
    searchPendaftaranSekolah: (state, action) => {
      state.pendaftaranSearch = action.payload;
    },
    deletePendaftaranSekolah: (state, action) => {
      state.pendaftaranSekolah = state.pendaftaranSekolah.filter(
        (pendaftaran) => pendaftaran.id !== action.payload
      );
    },
    setEditingItem: (state, action) => {
      state.editingItem = action.payload;
    },
    fetchPendaftaranSekolahByIdRequest: (state) => {
      state.loading = true;
      state.error = '';
    },
    fetchPendaftaranSekolahByIdSuccess: (state, action) => {
      state.selectedPendaftaran = action.payload;
      state.loading = false;
      state.error = '';
    },
    fetchPendaftaranSekolahByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedPendaftaran: (state, action) => {
      state.selectedPendaftaran = action.payload;
    },
  },
});

export const {
  getPendaftaranSekolah,
  setVisibilityFilter,
  searchPendaftaranSekolah,
  deletePendaftaranSekolah,
  setEditingItem,
  fetchPendaftaranSekolahByIdRequest,
  fetchPendaftaranSekolahByIdSuccess,
  fetchPendaftaranSekolahByIdFailure,
  setSelectedPendaftaran,
} = pendaftaranSekolahSlice.actions;

export default pendaftaranSekolahSlice.reducer;
