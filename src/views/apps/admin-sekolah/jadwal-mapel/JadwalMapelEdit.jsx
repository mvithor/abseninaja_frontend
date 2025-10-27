import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import JadwalMapelEditForm, {
  buildUpdateErrorMessage,
} from "src/apps/admin-sekolah/jadwal-mapel/Edit/JadwalMapelEditForm";

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

  const [jadwalData, setJadwalData] = useState({
    id: "",
    hari_id: "",
    waktu_id: "",
    kategori: "",
    kelas_id: "",
    offering_id: "",
    guru_id: "",
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
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
      setTimeout(() => setError(""), 4000);
    },
  });

  useEffect(() => {
    if (!data) return;
    setJadwalData((prev) => ({
      ...prev,
      id: data.id || "",
      hari_id: data.hari_id ?? "",
      waktu_id: data.waktu_id ?? "",
      kategori: data.kategori || "",
      // kelas_id di-prefill via form (matching nama_kelas → id)
      offering_id: data.offering_id ?? "",
      guru_id: data.guru_id ?? "",
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
      // reset alert sebelum submit
      setError("");
      setSuccess("");
      const res = await axiosInstance.put(
        `/api/v1/admin-sekolah/jadwal-mapel/${id}`,
        body
      );
      return res.data;
    },
    onSuccess: (response) => {
      setSuccess(response?.msg || "Jadwal berhasil diperbarui");
      queryClient.invalidateQueries(["jadwal-mapel", id]);
      queryClient.invalidateQueries(["jadwalMapel"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-mapel"), 3000);
    },
    onError: (err) => {
      const { msg, detail } = buildUpdateErrorMessage(err);
      // Gabungkan msg + detail menjadi satu string untuk Alerts
      const fullMsg =
        Array.isArray(detail) && detail.length
          ? [msg, ...detail.map((d) => `• ${d}`)].join("\n")
          : msg;

      setError(fullMsg);
      setTimeout(() => setError(""), 6000);
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
        <Alerts
          error={error || (isError && queryError?.message)}
          success={success}
        />
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
