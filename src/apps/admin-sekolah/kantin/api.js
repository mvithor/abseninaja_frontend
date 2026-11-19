import axiosInstance from 'src/utils/axiosInstance';
import { ADMIN_KANTIN_AKUN_API, KANTIN_SEKOLAH_API } from './kantinSekolah';

// Klien HTTP tipis untuk modul Kantin Cashless di Portal Admin Sekolah.
// Seluruh respons mengikuti amplop standar backend { success, msg, data }.

export const ambilDaftarAkunAdminKantin = async () =>
  (await axiosInstance.get(ADMIN_KANTIN_AKUN_API)).data.data;

export const ambilDaftarUnitKantin = async (params = {}) =>
  (await axiosInstance.get(KANTIN_SEKOLAH_API, { params })).data.data;

export const buatUnitKantin = async (payload) =>
  (await axiosInstance.post(KANTIN_SEKOLAH_API, payload)).data;

export const ubahUnitKantin = async ({ id, payload }) =>
  (await axiosInstance.put(`${KANTIN_SEKOLAH_API}/${id}`, payload)).data;

export const ambilMenuUnitKantin = async ({ kantinId, params = {} }) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/${kantinId}/menu`, { params })).data.data;

export const cariSiswaDompetSekolah = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/dompet/siswa`, { params })).data.data;

export const ambilDetailDompetSekolah = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/dompet`, { params })).data.data;

export const prosesTopupSekolah = async (payload) =>
  (await axiosInstance.post(`${KANTIN_SEKOLAH_API}/dompet/topup`, payload)).data;

export const simpanPinSekolah = async ({ siswaId, payload }) =>
  (await axiosInstance.put(`${KANTIN_SEKOLAH_API}/dompet/${siswaId}/pin`, payload)).data;

export const resetPinSekolah = async ({ siswaId, payload }) =>
  (await axiosInstance.put(`${KANTIN_SEKOLAH_API}/dompet/${siswaId}/pin/reset`, payload)).data;

export const simpanLimitSekolah = async ({ siswaId, payload }) =>
  (await axiosInstance.put(`${KANTIN_SEKOLAH_API}/dompet/${siswaId}/limit`, payload)).data;

export const ambilDaftarTransaksiSekolah = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/transaksi`, { params })).data.data;

export const ambilDetailTransaksiSekolah = async (id) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/transaksi/${id}`)).data.data;

export const prosesReversalSekolah = async ({ id, payload }) =>
  (await axiosInstance.post(`${KANTIN_SEKOLAH_API}/transaksi/${id}/reversal`, payload)).data;

export const ambilDaftarPencairanSekolah = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/pencairan`, { params })).data.data;

export const buatPencairanSekolah = async ({ kantinId, payload }) =>
  (await axiosInstance.post(`${KANTIN_SEKOLAH_API}/${kantinId}/pencairan`, payload)).data;

export const ubahStatusPencairanSekolah = async ({ id, payload }) =>
  (await axiosInstance.patch(`${KANTIN_SEKOLAH_API}/pencairan/${id}/status`, payload)).data;

export const ambilRekonsiliasiSekolah = async () =>
  (await axiosInstance.get(`${KANTIN_SEKOLAH_API}/rekonsiliasi`)).data.data;
