import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { validate as isUUID } from "uuid";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import DeadlinePerangkatAjarEditForm from "src/apps/waka-kurikulum/deadline/Edit/DeadlinePerangkatAjarEditForm";
import {
  formatTanggalYMD,
  isDeadlineLewat,
  isKonflik,
  parseTanggalYMD,
  pesanGalat,
  WAKA_API,
} from "src/components/perangkat-ajar/perangkatAjarConfig";

const fetchDeadlineById = async (id) => {
  const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/deadline/${id}`);
  return res.data?.data;
};

const DeadlinePerangkatAjarEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deadlineData, setDeadlineData] = useState({
    semester_ajaran: null,
    jenis: null,
    tanggal_deadline: null,
    jam_deadline: "",
    keterangan: "",
  });

  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["waka-deadline-detail", safeId],
    queryFn: () => fetchDeadlineById(safeId),
    enabled: !!safeId,
  });

  useEffect(() => {
    if (!safeId) navigate("/dashboard/waka-kurikulum/deadline");
  }, [safeId, navigate]);

  useEffect(() => {
    if (data) {
      setDeadlineData({
        semester_ajaran: data.semester_ajaran || null,
        jenis: data.jenis || null,
        tanggal_deadline: parseTanggalYMD(data.tanggal_deadline),
        jam_deadline: data.jam_deadline || "",
        keterangan: data.keterangan || "",
      });
    }
  }, [data]);

  const daftarUrl = `/dashboard/waka-kurikulum/deadline${
    data?.semester_ajaran_id ? `?semester=${data.semester_ajaran_id}` : ""
  }`;

  const mutation = useMutation({
    mutationFn: async (payload) => axiosInstance.patch(`${WAKA_API}/perangkat-ajar/deadline/${safeId}`, payload),
    onSuccess: async (response) => {
      setSuccess(response?.data?.msg || "Deadline berhasil diperbarui");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["waka-deadline-detail", safeId] });
      await queryClient.invalidateQueries({ queryKey: ["waka-deadline-list"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-list"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-detail"] });
      setTimeout(() => navigate(daftarUrl), 1500);
    },
    onError: (err) => {
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ["waka-deadline-detail", safeId] });
      setError(pesanGalat(err, "Terjadi kesalahan saat memperbarui deadline"));
      setTimeout(() => setError(""), 4000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDeadlineData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setDeadlineData((prev) => ({ ...prev, tanggal_deadline: date }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const tanggal = formatTanggalYMD(deadlineData.tanggal_deadline);
    if (!tanggal || !deadlineData.jam_deadline) {
      setError("Tanggal dan jam deadline wajib diisi.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    mutation.mutate({
      tanggal_deadline: tanggal,
      jam_deadline: deadlineData.jam_deadline,
      // "" = mengosongkan keterangan; null/tidak dikirim membuat server mempertahankan nilai lama.
      keterangan: deadlineData.keterangan.trim(),
    });
  };

  return (
    <PageContainer title="Edit Deadline" description="Edit Deadline Pengumpulan Perangkat Ajar">
      <ParentCard title="Form Edit Deadline Perangkat Ajar">
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />
        <DeadlinePerangkatAjarEditForm
          deadlineData={deadlineData}
          handleChange={handleChange}
          handleDateChange={handleDateChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isFetching}
          isSubmitting={mutation.isPending}
          sudahLewat={isDeadlineLewat(data?.deadline)}
          bacaSaja={data?.semester_ajaran?.is_aktif === false}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default DeadlinePerangkatAjarEdit;
