import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { invalidasiJurnal } from './jurnalConfig';

// Izin baca catatan rahasia: koordinator meminta, penulis (anggota) memutuskan atau mencabut.

/** { masuk: permintaan yang menunggu keputusan saya, keluar: permintaan saya sebagai koordinator } */
export const useDaftarAksesRahasia = () =>
  useQuery({
    queryKey: ['bk-akses-rahasia'],
    queryFn: async () => (await axiosInstance.get(`${BK_API}/akses-rahasia`)).data?.data || { masuk: [], keluar: [] },
    staleTime: 30_000,
  });

export const useAksesRahasiaMutations = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();
  const opsi = {
    onSuccess: (res) => {
      invalidasiJurnal(queryClient);
      onSuccess?.(res?.msg);
    },
    onError: (err) => {
      // 409: status izin sudah berubah (mis. penulis memutuskan lebih dulu); segarkan catatan & banner.
      if (err?.response?.status === 409) invalidasiJurnal(queryClient);
      onError?.(err?.response?.data?.msg || 'Terjadi kesalahan, silakan coba lagi');
    },
  };

  const minta = useMutation({
    mutationFn: async ({ id, alasan }) => (await axiosInstance.post(`${BK_API}/jurnal/${id}/akses`, { alasan })).data,
    ...opsi,
  });
  const putuskan = useMutation({
    mutationFn: async ({ id, keputusan }) => (await axiosInstance.patch(`${BK_API}/jurnal/${id}/akses`, { keputusan })).data,
    ...opsi,
  });
  // Penulis: cabut izin yang sudah diberikan. Koordinator: batalkan permintaan yang belum diputuskan.
  const cabut = useMutation({
    mutationFn: async ({ id }) => (await axiosInstance.delete(`${BK_API}/jurnal/${id}/akses`)).data,
    ...opsi,
  });

  return { minta, putuskan, cabut, isPending: minta.isPending || putuskan.isPending || cabut.isPending };
};
