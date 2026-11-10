import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import GuruMandiriForm from 'src/apps/super-admin/guru-mandiri/Form/GuruMandiriForm';
import SandiAwalDialog from 'src/apps/super-admin/guru-mandiri/Dialog/SandiAwalDialog';
import { KUNCI_GURU_MANDIRI, URL_GURU_MANDIRI, ambilSandiAwal } from 'src/apps/super-admin/guru-mandiri/guruMandiri';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import axiosInstance from 'src/utils/axiosInstance';

const URL_DAFTAR = '/dashboard/super-admin/guru-mandiri';

const GuruMandiriAdd = () => {
  const [error, setError] = useState('');
  // Sandi awal hanya hidup di state ini (bukan di cache query) dan hilang begitu halaman ditinggalkan.
  const [hasil, setHasil] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.post(URL_GURU_MANDIRI, payload)).data,
    onSuccess: (respons) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_GURU_MANDIRI] });
      setHasil({ nama: respons.data?.nama, email: respons.data?.email, sandi: ambilSandiAwal(respons), msg: respons.msg });
      mutation.reset();
    },
    onError: (err) => setError(pesanGalat(err, 'Terjadi kesalahan saat membuat akun guru mandiri.')),
  });

  const selesai = () => {
    const pesan = hasil?.msg || 'Akun guru mandiri berhasil dibuat.';
    setHasil(null);
    navigate(URL_DAFTAR, { state: { pesan } });
  };

  return (
    <PageContainer title="Tambah Guru Mandiri" description="Tambah Guru Mandiri">
      <ParentCard title="Tambah Guru Mandiri">
        <Alerts error={error} />
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
