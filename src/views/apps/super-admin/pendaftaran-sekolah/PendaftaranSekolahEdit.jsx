import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import PendaftaranEditForm from 'src/apps/super-admin/pendaftaran-sekolah/Edit/PendaftaranEditForm';
import Alerts from 'src/components/alerts/Alerts';
import { fetchPendaftaranSekolahById, setEditingItem } from 'src/store/apps/pendaftaran-sekolah';

const fetchStatusPendaftaran = async () => {
  const response = await axiosInstance.get('/api/v1/super-admin/pendaftaran/status');
  return response.data;
};

const PendaftaranEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedPendaftaran = useSelector((state) => state.pendaftaran.selectedPendaftaran);

  const { data: statusOptions = [], isLoading: isLoadingStatus } = useQuery({
    queryKey: ['statusPendaftaran'],
    queryFn: fetchStatusPendaftaran,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPendaftaranSekolahById(id)).catch(() =>
        setError('Gagal memuat data pendaftaran'),
      );
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedPendaftaran) {
      dispatch(setEditingItem(selectedPendaftaran));
    }
  }, [dispatch, selectedPendaftaran]);

  /**
   * handleSubmit hanya menerima { status_id } dari PendaftaranEditForm.
   * Tidak perlu destructure/strip apapun karena form memang hanya
   * mengirim satu field — tidak ada field kotor yang perlu dibuang.
   */
  const handleSubmit = async ({ status_id }) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/super-admin/pendaftaran/${id}`,
        { status_id }, // eksplisit — hanya ini yang dikirim
      );
      setSuccess(response.data.msg);
      setError('');
      setTimeout(() => navigate('/dashboard/super-admin/pendaftaran-sekolah'), 3000);
    } catch (err) {
      const errorDetails = err.response?.data?.errors || [];
      const errorMsg = err.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data';
      setError(errorDetails.length > 0 ? errorDetails.join(', ') : errorMsg);
      setSuccess('');
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <PageContainer
      title="Edit Pendaftaran Sekolah"
      description="Edit Status Pendaftaran Sekolah"
    >
      <Alerts error={error} success={success} />
      <ParentCard title="Form Edit Pendaftaran Sekolah">
        <PendaftaranEditForm
          statusOptions={statusOptions}
          isLoadingStatus={isLoadingStatus}
          selectedPendaftaran={selectedPendaftaran}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PendaftaranEdit;