import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';

// Jenis perangkat ajar (silabus, CP, TP, ATP, modul ajar) dibaca dari server, tidak di-hardcode,
// supaya sekolah bisa menambah/menonaktifkan jenis tanpa rilis FE.
export const useJenisPerangkat = (apiBase) =>
  useQuery({
    queryKey: ['perangkat-ajar-jenis', apiBase],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiBase}/perangkat-ajar/jenis`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
