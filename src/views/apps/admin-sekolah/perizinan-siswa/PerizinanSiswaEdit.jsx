import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PerizinanSiswaEditForm from "src/apps/admin-sekolah/perizinan-siswa/Edit/PerizinanSiswaEditForm";

const fetchPerizinanSiswaById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/v1/admin-sekolah/perizinan-siswa/${id}`);
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching perizinan pegawai:', error);
          }
        throw new Error('Terjadi kesalahan saat mengambil data perizinan. Silakan coba lagi');
    }
};

const PerizinanSiswaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();
  const [perizinanData, setPerizinanData] = useState({
    nama_siswa: '',
    nama_wali_utama: '',
    nomor_telepon_wali: '',
    kelas: '',
    jenis_izin: '',
    kategori_izin: '',
    tanggal_izin: '',
    diajukan: '',
    alasan: '',
    status: '',
    lampiran: '',
    catatan_admin: '',
    disetujui_oleh: ''
  });

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ['perizinanSiswa', id],
    queryFn: () => fetchPerizinanSiswaById(id),
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
        nama_siswa: data.nama_siswa || '',
        nama_wali_utama: data.nama_wali_utama || '',
        nomor_telepon_wali: data.nomor_telepon_wali || '',
        kelas: data.kelas || '',
        jenis_izin: data.jenis_izin || '',
        kategori_izin: data.kategori_izin || '',
        tanggal_izin: data.tanggal_izin || '',
        diajukan: data.diajukan || '',
        alasan: data.alasan || '',
        status: data.status || 'Menunggu',
        lampiran: data.lampiran || '',
        catatan_admin: data.catatan_admin || '',
        disetujui_oleh: data.disetujui_oleh || '',
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/perizinan-siswa/${id}`, payload);
    },
    onSuccess: (response) => {
      setSuccess(response.data.msg || 'Perizinan berhasil diperbarui');
      queryClient.invalidateQueries(['perizinanSiswa']);
      queryClient.invalidateQueries(['perizinanSiswa', id]);
      setTimeout(() => {
        navigate('/dashboard/admin-sekolah/perizinan-siswa');
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
    <PageContainer title="Edit Perizinan Siswa" description="Edit Perizinan Siswa">
        <ParentCard title="Edit Perizinan Siswa">
            <Alerts error={error || (isError && queryError?.message)} success={success} />
            <PerizinanSiswaEditForm
                perizinanData={perizinanData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                isLoading={isFetching || mutation.isLoading}
                perizinanId={id} 
            />
        </ParentCard>
    </PageContainer>
  );
};

export default PerizinanSiswaEdit;
