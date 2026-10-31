import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AdminKantinForm from 'src/apps/admin-sekolah/admin-kantin/Form/AdminKantinForm';
import { sesiGagalDicabut } from 'src/apps/admin-sekolah/admin-kantin/kantin';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import axiosInstance from 'src/utils/axiosInstance';

const URL_API = '/api/v1/admin-sekolah/admin-kantin';

const AdminKantinEdit = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Backend tidak punya endpoint "ambil satu"; daftar sekolah memuat semua akun kantin
  // (jumlahnya kecil), jadi data akun dicari dari daftar yang sama dengan halaman List.
  const { data: daftar, isLoading, isError } = useQuery({
    queryKey: ['adminKantin'],
    queryFn: async () => (await axiosInstance.get(URL_API)).data.data,
  });
  const akun = daftar?.find((item) => String(item.id) === String(id));

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.put(`${URL_API}/${id}`, payload)).data,
    onSuccess: (respons) => {
      queryClient.invalidateQueries({ queryKey: ['adminKantin'] });
      navigate('/dashboard/admin-sekolah/admin-kantin', {
        state: {
          pesan: respons.msg || 'Admin kantin berhasil diperbarui.',
          peringatan: sesiGagalDicabut(respons),
        },
      });
    },
    onError: (err) => setError(pesanGalat(err, 'Terjadi kesalahan saat memperbarui admin kantin.')),
  });

  let isi;
  if (isLoading) {
    isi = (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  } else if (isError || !akun) {
    isi = <Alert severity="error">Admin kantin tidak ditemukan. Kembali ke daftar lalu coba lagi.</Alert>;
  } else {
    isi = (
      <AdminKantinForm
        mode="ubah"
        awal={{ nama: akun.nama, email: akun.email }}
        onSubmit={(payload) => mutation.mutate(payload)}
        isLoading={mutation.isPending}
        setError={setError}
        onCancel={() => navigate(-1)}
      />
    );
  }

  return (
    <PageContainer title="Edit Admin Kantin" description="Edit Admin Kantin">
      <ParentCard title="Edit Admin Kantin">
        <Alerts error={error} />
        {isi}
      </ParentCard>
    </PageContainer>
  );
};

export default AdminKantinEdit;
