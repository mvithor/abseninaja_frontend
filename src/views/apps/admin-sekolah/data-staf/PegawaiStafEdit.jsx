import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PegawaiStafEditForm from "src/apps/admin-sekolah/data-staf/Edit/PegawaiStafEditForm";

const normalizeEmail = (v) => String(v || "").trim().toLowerCase();

const fetchPegawaiStafById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/pegawai/${id}`);
    const stafData = response.data.data;

    return {
      ...stafData,
      name: stafData?.AkunPegawai?.name || "",
      email: stafData?.AkunPegawai?.email || "",
      current_password: "", // hanya untuk input FE
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching pegawai staf:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil data pegawai staf. Silakan coba lagi.');
  }
};

const PegawaiStafEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stafData, setStafData] = useState({
    name: '',
    email: '',
    current_password: '',
    nip: '',
    tempat_lahir: '',
    tanggal_lahir: null,
    alamat: '',
    nomor_telepon: '',
    kategori_pegawai_id: '',
    subkategori_pegawai_id: ''
  });

  const [originalData, setOriginalData] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ['PegawaiStaf', id],
    queryFn: () => fetchPegawaiStafById(id),
    onError: (err) => {
      setError(err?.message || 'Terjadi kesalahan saat memuat data');
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    if (data) {
      setStafData(data);
      setOriginalData(data);
    }
  }, [data]);

  const isEmailChanged = useMemo(() => {
    if (!originalData) return false;
    return normalizeEmail(stafData.email) !== normalizeEmail(originalData.email);
  }, [stafData.email, originalData]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/pegawai/${id}`, payload);
    },
    onSuccess: (response) => {
      const updated = response.data.data;
      setStafData({
        ...updated,
        name: updated?.AkunPegawai?.name || stafData.name,
        email: updated?.AkunPegawai?.email || stafData.email,
        current_password: "",
      });
      setOriginalData({
        ...updated,
        name: updated?.AkunPegawai?.name || stafData.name,
        email: updated?.AkunPegawai?.email || stafData.email,
        current_password: "",
      });

      setSuccess(response.data.msg || 'Pegawai staf berhasil diperbarui.');
      queryClient.invalidateQueries(['PegawaiStaf']);
      setTimeout(() => {
        navigate('/dashboard/admin-sekolah/pegawai/staf');
      }, 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || err?.message || 'Terjadi kesalahan saat memperbarui data pegawai';
      const details = err?.response?.data?.errors || [];
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(', '));
      } else {
        setError(msg);
      }
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setStafData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'kategori_pegawai_id' ? { subkategori_pegawai_id: '' } : null),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!stafData) return;

    // backend kamu: kalau email berubah → wajib current_password
    if (isEmailChanged && !String(stafData.current_password || '').trim()) {
      setError("Password saat ini diperlukan untuk mengubah email.");
      setTimeout(() => setError(''), 3000);
      return;
    }

    const payload = {
      data: {
        id: stafData.id,
        kategori_pegawai_id: stafData.kategori_pegawai_id,
        subkategori_pegawai_id: stafData.subkategori_pegawai_id || null,
        nip: stafData.nip,
        tempat_lahir: stafData.tempat_lahir,
        tanggal_lahir: stafData.tanggal_lahir,
        alamat: stafData.alamat,
        nomor_telepon: stafData.nomor_telepon,
        user_id: stafData.user_id,
        sekolah_id: stafData.sekolah_id,
        User: {
          name: stafData.name,
          email: stafData.email,
          ...(isEmailChanged ? { current_password: stafData.current_password } : null),
        },
      },
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Form Edit Pegawai Staf" description="Form Edit Pegawai Staf">
      <ParentCard title="Form Edit Pegawai Staf" description="Form Edit Pegawai Staf">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <PegawaiStafEditForm
          stafData={stafData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PegawaiStafEdit;
