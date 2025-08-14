import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PerizinanPegawaiEditForm from "src/apps/admin-sekolah/perizinan-pegawai/Edit/PerizinanPegawaiEditForm";

const fetchPerizinanPegawaiById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/perizinan-pegawai/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching perizinan pegawai:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil data perizinan. Silakan coba lagi');
  }
};

const PerizinanPegawaiEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [perizinanData, setPerizinanData] = useState({
    nama_pegawai: '',
    email_pegawai: '',
    kategori: '',
    sub_kategori: '',
    jenis_izin: '',
    tanggal_izin: '',
    alasan: '',
    lampiran: '',
    disetujui_oleh: '',
    status: '',
    catatan_admin: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ['perizinanPegawai', id],
    queryFn: () => fetchPerizinanPegawaiById(id),
    onError: (err) => {
      const errorMessage = err.response?.data?.msg || err.message || 'Terjadi kesalahan saat memuat data';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    if (data) {
      setPerizinanData((prev) => ({
        ...prev,
        nama_pegawai: data.nama_pegawai || '',
        email_pegawai: data.email_pegawai || '',
        kategori: data.kategori || '',
        sub_kategori: data.sub_kategori || '',
        jenis_izin: data.jenis_izin || '',
        tanggal_izin: data.tanggal_izin || '',
        alasan: data.alasan || '',
        lampiran: data.lampiran || '',
        disetujui_oleh: data.disetujui_oleh || '',
        status: data.status || 'Menunggu',
        catatan_admin: data.catatan_admin || '',
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/perizinan-pegawai/${id}`, payload);
    },
    onSuccess: (response) => {
      setSuccess(response.data.msg || 'Perizinan berhasil diperbarui');
      queryClient.invalidateQueries(['perizinanPegawai']);
      queryClient.invalidateQueries(['perizinanPegawai', id]);
      setTimeout(() => {
        navigate('/dashboard/admin-sekolah/perizinan-pegawai');
      }, 3000);
    },
    onError: (err) => {
      const errorDetails = err.response?.data?.errors || [];
      const errorMsg = err.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data perizinan';
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(', '));
      } else {
        setError(errorMsg);
      }
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPerizinanData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // ===== Guard Logic =====
    // Backend yang mengisi disetujui_oleh berdasarkan req.user.name saat status === 'Disetujui'
    const payload = {
      status: perizinanData.status,
      catatan_admin: perizinanData.catatan_admin ?? '',
    };
    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Perizinan Pegawai" description="Edit Perizinan Pegawai">
      <ParentCard title="Edit Perizinan Pegawai">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <PerizinanPegawaiEditForm
          perizinanData={perizinanData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PerizinanPegawaiEdit;
