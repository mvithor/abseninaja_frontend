import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from './pemetaanConfig';

// Ringkasan pemetaan (KPI, distribusi per dimensi, per kelas, siswa prioritas) untuk lingkup terpilih.
// Dipakai dashboard BK dan halaman Pemetaan Siswa (berbagi cache).
export const useRingkasanPemetaan = ({ lingkup, kelasId } = {}) =>
  useQuery({
    queryKey: ['bk-pemetaan-ringkasan', { lingkup, kelasId }],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/pemetaan/ringkasan`, {
        params: { lingkup, kelas_id: kelasId || undefined },
      });
      return res.data?.data || null;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
