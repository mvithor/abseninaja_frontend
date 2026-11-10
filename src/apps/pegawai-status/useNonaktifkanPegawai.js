import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { KUNCI, KUNCI_TERDAMPAK, urlPegawai } from './api';
import { pesanHasilNonaktif } from './status';

/**
 * Alur Nonaktifkan satu pegawai untuk halaman daftar (Guru, Staf). Memegang target, memuat tanggung jawab yang masih
 * dipegang HANYA saat dialog terbuka, mengirim nonaktifkan, lalu menyegarkan semua cache yang terdampak.
 *
 * `onHasil({ sukses, galat })` dipanggil pemilik halaman untuk menampilkan alert di halamannya.
 * Pakai: <DialogNonaktif {...dialog} /> dengan `dialog` dari hook ini.
 */
export default function useNonaktifkanPegawai({ onHasil }) {
  const [target, setTarget] = useState(null);
  const queryClient = useQueryClient();

  const tanggungJawab = useQuery({
    queryKey: [KUNCI.tanggungJawab, target?.id],
    queryFn: async () => (await axiosInstance.get(urlPegawai(target.id, 'tanggung-jawab'))).data.data,
    enabled: Boolean(target),
    // Selalu mutakhir: jadwal bisa berubah antara dua pembukaan dialog.
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (badan) => (await axiosInstance.post(urlPegawai(target.id, 'nonaktifkan'), badan)).data,
    onSuccess: (respons) => {
      KUNCI_TERDAMPAK.forEach((kunci) => queryClient.invalidateQueries({ queryKey: [kunci] }));
      setTarget(null);
      onHasil(pesanHasilNonaktif(respons));
    },
    onError: (err) => {
      setTarget(null);
      onHasil({ sukses: '', galat: pesanGalat(err, 'Terjadi kesalahan saat menonaktifkan pegawai.') });
    },
  });

  const buka = useCallback((id, nama) => setTarget({ id, nama }), []);
  const tutup = useCallback(() => setTarget(null), []);

  return {
    buka,
    dialog: {
      buka: Boolean(target),
      nama: target?.nama,
      tanggungJawab: tanggungJawab.data ?? null,
      memuatTanggungJawab: tanggungJawab.isFetching,
      galatTanggungJawab: tanggungJawab.isError,
      sibuk: mutation.isPending,
      onKonfirmasi: (badan) => mutation.mutate(badan),
      onTutup: tutup,
    },
  };
}
