import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import JadwalMapelEditForm from "src/apps/admin-sekolah/jadwal-mapel/Edit/JadwalMapelEditForm";

const fetchJadwalById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/jadwal-mapel/${id}`);
  return res.data.data;
};

const JadwalMapelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // single state object: submit + display (biar konsisten style FE kamu)
  const [jadwalData, setJadwalData] = useState({
    id: "",
    hari_id: "",
    waktu_id: "",
    kategori: "",
    kelas_id: "",
    offering_id: "",
    guru_id: "",
    // display-only
    hari: "",
    waktu: "",
    nama_kelas: "",
    nama_mapel: "",
    kode_offering: "",
    nama_guru: "",
  });

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["jadwal-mapel", id],
    queryFn: () => fetchJadwalById(id),
    onError: (err) => {
      const msg = err.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  // Prefill dari API
  useEffect(() => {
    if (!data) return;
    setJadwalData((prev) => ({
      ...prev,
      id: data.id || "",
      hari_id: data.hari_id ?? "",
      waktu_id: data.waktu_id ?? "",
      kategori: data.kategori || "",
      // kelas_id di-prefill via form (matching nama_kelas → id) setelah options ready
      offering_id: data.offering_id ?? "",
      guru_id: data.guru_id ?? "",
      // display
      hari: data.hari || "",
      waktu: data.waktu || "",
      nama_kelas: data.nama_kelas || "",
      nama_mapel: data.nama_mapel || "",
      kode_offering: data.kode_offering || "",
      nama_guru: data.nama_guru || "",
    }));
  }, [data]);

  const mutation = useMutation({
    mutationFn: async ({ isKBM, body }) => {
      const res = await axiosInstance.put(
        `/api/v1/admin-sekolah/jadwal-mapel/${id}`,
        body
      );
      return res.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg || "Jadwal berhasil diperbarui");
      queryClient.invalidateQueries(["jadwal-mapel", id]);
      queryClient.invalidateQueries(["jadwalMapel"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-mapel"), 3000);
    },
    onError: (err) => {
      const msg = err.response?.data?.msg || "Terjadi kesalahan saat memperbarui jadwal";
      const details = err.response?.data?.errors || [];
      setError(details.length ? details.join(", ") : msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJadwalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event, isKBM) => {
    event.preventDefault();
    const body = {
      hari_id: jadwalData.hari_id,
      waktu_id: jadwalData.waktu_id,
      offering_id: isKBM ? (jadwalData.offering_id || null) : null,
      guru_id: isKBM ? (jadwalData.guru_id || null) : null,
    };
    mutation.mutate({ isKBM, body });
  };

  const handleCancel = () => navigate(-1);

  return (
    <PageContainer title="Edit Jadwal" description="Edit Jadwal Mata Pelajaran">
      <ParentCard title="Form Edit Jadwal">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <JadwalMapelEditForm
          jadwalData={jadwalData}
          setJadwalData={setJadwalData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default JadwalMapelEdit;
