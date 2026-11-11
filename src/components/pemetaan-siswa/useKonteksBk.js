import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { BK_API } from './pemetaanConfig';

// Profil BK yang sedang login: koordinator atau bukan, aktif atau tidak, dan kelas tanggung jawabnya.
// Dipakai untuk menampilkan/menyembunyikan pilihan lingkup "Semua Kelas" dan aksi Tim BK.
// userId di kunci (sama seperti useKonteks): sesi akun lain di browser yang sama tidak boleh memakai
// konteks BK orang sebelumnya, mis. setelah logout paksa yang tidak membersihkan cache.
export const useKonteksBk = () => {
  const userId = useSelector((state) => state.user.userId);
  return useQuery({
    queryKey: ['bk-konteks', userId],
    queryFn: async () => {
      const res = await axiosInstance.get(`${BK_API}/konteks`);
      return res.data?.data || null;
    },
    staleTime: 60_000,
    retry: false,
  });
};
