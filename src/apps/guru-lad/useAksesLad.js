import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { cekAkses, kunciLad } from './api';

/**
 * Apakah akun ini boleh memakai LAD. Satu-satunya sumber kebenaran adalah server (gerbang akses),
 * jadi ini hanya mengirim probe ringan. 403 berarti "tidak", bukan error; error jaringan/5xx
 * dianggap belum diketahui dan tidak menampilkan menu.
 */
export default function useAksesLad() {
  const role = useSelector((state) => state.user?.role);
  const { data, isLoading, error } = useQuery({
    queryKey: kunciLad.akses,
    queryFn: cekAkses,
    enabled: role === 'pegawai',
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const status = error?.response?.status;
  return {
    boleh: Boolean(data),
    memuat: isLoading,
    ditolak: status === 403,
    pesan: error?.response?.data?.msg,
    aturanVersi: data?.aturan_versi,
  };
}
