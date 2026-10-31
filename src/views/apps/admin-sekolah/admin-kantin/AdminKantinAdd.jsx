import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AdminKantinForm from 'src/apps/admin-sekolah/admin-kantin/Form/AdminKantinForm';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import axiosInstance from 'src/utils/axiosInstance';

const URL_API = '/api/v1/admin-sekolah/admin-kantin';

const AdminKantinAdd = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.post(URL_API, payload)).data,
    onSuccess: (respons) => {
      queryClient.invalidateQueries({ queryKey: ['adminKantin'] });
      navigate('/dashboard/admin-sekolah/admin-kantin', {
        state: { pesan: respons.msg || 'Admin kantin berhasil ditambahkan.' },
      });
    },
    onError: (err) => setError(pesanGalat(err, 'Terjadi kesalahan saat menambahkan admin kantin.')),
  });

  return (
    <PageContainer title="Tambah Admin Kantin" description="Tambah Admin Kantin">
      <ParentCard title="Tambah Admin Kantin">
        <Alerts error={error} />
        <AdminKantinForm
          mode="buat"
          onSubmit={(payload) => mutation.mutate(payload)}
          isLoading={mutation.isPending}
          setError={setError}
          onCancel={() => navigate(-1)}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default AdminKantinAdd;
