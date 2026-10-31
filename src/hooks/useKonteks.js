import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import isTokenExpired from 'src/utils/isTokenExpired';
import { setDaftarPersona } from 'src/store/apps/user/userSlice';

// Waktu segar sengaja sama dengan TTL cache persona di backend (60 detik): bertanya lebih
// sering tidak memberi data yang lebih baru.
const STALE_MS = 60 * 1000;

/**
 * Menyegarkan daftar persona akun dari server (GET /api/v1/konteks) tanpa login ulang.
 * Tanpa ini, persona yang baru diberikan atau dicabut admin sekolah baru terlihat setelah
 * logout dan login lagi, karena state persona tersimpan di browser.
 *
 * Hanya informasi untuk menu dan guard di sisi tampilan. Otorisasi sebenarnya tetap diputuskan
 * server pada setiap endpoint. Gagal (jaringan, server lama yang belum punya endpoint ini)
 * tidak berdampak apa-apa: persona yang sudah ada dipertahankan. Sesi kedaluwarsa (401)
 * ditangani axiosInstance.
 *
 * Dipasang SEKALI di FullLayout, yang membungkus semua halaman dashboard.
 */
export default function useKonteks() {
  const dispatch = useDispatch();
  const { isLoggedIn, accessToken, userId } = useSelector((state) => state.user);
  const aktif = Boolean(isLoggedIn && accessToken && !isTokenExpired(accessToken));

  const { data } = useQuery({
    // userId di kunci: pengguna lain di browser yang sama tidak boleh memakai hasil orang sebelumnya.
    queryKey: ['konteks', userId],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/konteks');
      return response.data?.data;
    },
    enabled: aktif,
    staleTime: STALE_MS,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data && Array.isArray(data.persona)) {
      dispatch(setDaftarPersona(data.persona));
    }
  }, [data, dispatch]);
}
