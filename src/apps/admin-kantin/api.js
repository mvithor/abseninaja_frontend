import axiosInstance from 'src/utils/axiosInstance';
import { KANTIN_API } from './kantin';

// Klien HTTP tipis untuk seluruh endpoint Portal Admin Kantin (/api/v1/kantin).
// Respons backend mengikuti amplop standar { success, msg, data }.

export const ambilProfilKantin = async () =>
  (await axiosInstance.get(`${KANTIN_API}/profil`)).data.data;

export const ambilDaftarMenu = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_API}/menu`, { params })).data.data;

export const buatMenuKantin = async (payload) =>
  (await axiosInstance.post(`${KANTIN_API}/menu`, payload)).data;

export const ubahMenuKantin = async ({ id, payload }) =>
  (await axiosInstance.put(`${KANTIN_API}/menu/${id}`, payload)).data;

export const hapusMenuKantin = async (id) =>
  (await axiosInstance.delete(`${KANTIN_API}/menu/${id}`)).data;

export const cariSiswaDompet = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_API}/siswa`, { params })).data.data;

export const ambilDetailDompet = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_API}/dompet`, { params })).data.data;

export const simpanPinDompet = async ({ siswaId, payload }) =>
  (await axiosInstance.put(`${KANTIN_API}/dompet/${siswaId}/pin`, payload)).data;

export const simpanLimitHarian = async ({ siswaId, payload }) =>
  (await axiosInstance.put(`${KANTIN_API}/dompet/${siswaId}/limit`, payload)).data;

export const prosesTopupSaldo = async (payload) =>
  (await axiosInstance.post(`${KANTIN_API}/dompet/topup`, payload)).data;

export const prosesBelanjaKasir = async (payload) =>
  (await axiosInstance.post(`${KANTIN_API}/transaksi/belanja`, payload)).data;

export const ambilDaftarTransaksi = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_API}/transaksi`, { params })).data.data;

export const ambilDetailTransaksi = async (id) =>
  (await axiosInstance.get(`${KANTIN_API}/transaksi/${id}`)).data.data;

export const prosesReversalTransaksi = async ({ id, payload }) =>
  (await axiosInstance.post(`${KANTIN_API}/transaksi/${id}/reversal`, payload)).data;

export const ambilDaftarPencairan = async (params = {}) =>
  (await axiosInstance.get(`${KANTIN_API}/pencairan`, { params })).data.data;

export const ambilRekonsiliasiKantin = async () =>
  (await axiosInstance.get(`${KANTIN_API}/rekonsiliasi`)).data.data;
