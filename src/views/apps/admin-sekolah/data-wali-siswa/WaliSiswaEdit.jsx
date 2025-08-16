import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import WalisSiswaEditForm from "src/apps/admin-sekolah/data-wali-siswa/Edit/WaliSiswaEditForm";

const fetchWaliSiswaById = async (id) => {
  if (!id || !isUUID(id)) throw new Error("Data Wali Siswa tidak ditemukan");
  const { data } = await axiosInstance.get(`/api/v1/admin-sekolah/wali-siswa/${id}`);
  const w = data.data;

  // Normalisasi FE state
  return {
    id: w.id,
    name: w.nama_wali || w.User?.name || "",
    siswa_id: w.siswa_id || "",
    hubungan: (w.hubungan === 'Wali Lainnya') ? 'wali_lainnya' : (w.hubungan || ''), // pastikan kanonik
    pekerjaan: w.pekerjaan || "",
    nomor_telepon: (w.nomor_telepon || '').replace(/\D/g, ''),
    alamat: w.alamat || "",
    is_wali_utama: !!w.is_wali_utama, // boolean
  };
};

const pruneEmpty = (obj) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v === "") return;            // jangan kirim empty string
    out[k] = v;
  });
  return out;
};

const WaliSiswaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [waliData, setWaliData] = useState({
    name: '',
    siswa_id: '',
    hubungan: '',
    pekerjaan: '',
    nomor_telepon: '',
    alamat: '',
    is_wali_utama: false,
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ['wali-siswa', id],
    queryFn: () => fetchWaliSiswaById(id),
    enabled: !!id,
    onError: (err) => {
      const msg = err.response?.data?.msg || err.message || 'Terjadi kesalahan saat memuat data';
      setError(msg);
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    if (!id) navigate("/dashboard/admin-sekolah/wali-siswa");
  }, [id, navigate]);

  useEffect(() => {
    if (data) setWaliData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/wali-siswa/${id}`, payload);
    },
    onSuccess: (response) => {
      setSuccess(response.data.msg);
      queryClient.invalidateQueries(['wali-siswa']);
      setTimeout(() => navigate('/dashboard/admin-sekolah/wali-siswa'), 1500);
    },
    onError: (error) => {
      const details = error.response?.data?.errors || [];
      const msg = error.response?.data?.msg || 'Terjadi kesalahan saat memperbarui data wali siswa';
      setError(details.length ? details.join(', ') : msg);
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setWaliData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!waliData) return;

    // Normalisasi hubungan kirim ke BE (kanonik)
    const hubunganKanonik = (waliData.hubungan === 'Wali Lainnya') ? 'wali_lainnya' : waliData.hubungan;

    // Pastikan boolean
    const isWaliUtamaBool = typeof waliData.is_wali_utama === 'boolean'
      ? waliData.is_wali_utama
      : (waliData.is_wali_utama === 'true');

    const payload = pruneEmpty({
      name: (waliData.name || '').trim(),
      siswa_id: waliData.siswa_id,
      hubungan: hubunganKanonik,
      pekerjaan: waliData.pekerjaan || null,
      nomor_telepon: waliData.nomor_telepon || undefined, // biarkan BE re-format/validasi
      alamat: waliData.alamat || null,
      is_wali_utama: isWaliUtamaBool,
    });

    mutation.mutate(payload);
  };

  const handleCancel = () => navigate(-1);

  return (
    <PageContainer title="Form Edit Wali Siswa" description="Form Edit Wali Siswa">
      <ParentCard title="Form Edit Wali Siswa">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <WalisSiswaEditForm
          waliSiswaData={waliData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
          setWaliSiswaData={setWaliData}   // ⬅️ penting untuk onChange khusus
        />
      </ParentCard>
    </PageContainer>
  );
};

export default WaliSiswaEdit;
