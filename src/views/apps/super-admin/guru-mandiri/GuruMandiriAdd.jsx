import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import usePesanAlert from 'src/hooks/usePesanAlert';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import GuruMandiriForm from 'src/apps/super-admin/guru-mandiri/Form/GuruMandiriForm';
import SandiAwalDialog from 'src/apps/super-admin/guru-mandiri/Dialog/SandiAwalDialog';
import { KUNCI_GURU_MANDIRI, URL_GURU_MANDIRI, ambilSandiAwal } from 'src/apps/super-admin/guru-mandiri/guruMandiri';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import axiosInstance from 'src/utils/axiosInstance';

const URL_DAFTAR = '/dashboard/super-admin/guru-mandiri';

const GuruMandiriAdd = () => {
  const [error, setError, kunciError] = usePesanAlert();
  // Sandi awal hanya hidup di state ini (bukan di cache query) dan hilang begitu halaman ditinggalkan.
  const [hasil, setHasil] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // gcTime 0: sandi awal tidak boleh tertinggal di cache mutasi.
    gcTime: 0,
    mutationFn: async (payload) => (await axiosInstance.post(URL_GURU_MANDIRI, payload)).data,
    onSuccess: (respons) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_GURU_MANDIRI] });
      const sandi = ambilSandiAwal(respons);
      mutation.reset();
      // Akun sudah terbuat di server. Tanpa sandi di respons, dialog kosong akan menyesatkan: arahkan ke Reset Sandi.
      if (!sandi) {
        navigate(URL_DAFTAR, { state: { pesan: 'Akun dibuat, tetapi sandi awal tidak diterima. Pilih Reset Sandi pada guru ini untuk mendapat sandi baru.' } });
        return;
      }
      setHasil({ nama: respons.data?.nama, email: respons.data?.email, sandi, msg: respons.msg });
    },
    onError: (err) => setError(pesanGalat(err, 'Terjadi kesalahan saat membuat akun guru mandiri.')),
  });

  // Selama sandi awal tampil, menutup tab atau memuat ulang menghilangkannya (hanya Reset Sandi yang membuat baru).
  const adaSandi = Boolean(hasil);
  useEffect(() => {
    if (!adaSandi) return undefined;
    const jaga = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', jaga);
    return () => window.removeEventListener('beforeunload', jaga);
  }, [adaSandi]);

  const selesai = () => {
    const pesan = hasil?.msg || 'Akun guru mandiri berhasil dibuat.';
    setHasil(null);
    navigate(URL_DAFTAR, { state: { pesan } });
  };

  return (
    <PageContainer title="Tambah Guru Mandiri" description="Tambah Guru Mandiri">
      <ParentCard title="Tambah Guru Mandiri">
        <Alerts key={kunciError} error={error} />
        <GuruMandiriForm
          onSubmit={(payload) => mutation.mutate(payload)}
          isLoading={mutation.isPending || Boolean(hasil)}
          setError={setError}
          onCancel={() => navigate(-1)}
        />
      </ParentCard>
      <SandiAwalDialog
        buka={Boolean(hasil)}
        nama={hasil?.nama}
        email={hasil?.email}
        sandi={hasil?.sandi || ''}
        onTutup={selesai}
      />
    </PageContainer>
  );
};

export default GuruMandiriAdd;
