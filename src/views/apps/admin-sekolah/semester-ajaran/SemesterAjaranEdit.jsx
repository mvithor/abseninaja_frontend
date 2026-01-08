import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import SemesterAjaranEditForm from "src/apps/admin-sekolah/semester-ajaran/Edit/SemesterAjaranEditForm";

const fetchSemesterAjaranById = async (id) => {
  const response = await axiosInstance.get(`/api/v1/admin-sekolah/semester-ajaran/${id}`);
  return response.data.data;
};

const fetchTahunAjaran = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/tahun-ajaran");
  return response.data.data || [];
};

const SemesterAjaranEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [localError, setLocalError] = useState("");

  const [semesterData, setSemesterData] = useState({
    semester: "",
    tahun_ajaran_id: "",
    is_aktif: "false",
    is_locked: "false",
  });

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["semester", id],
    queryFn: () => fetchSemesterAjaranById(id),
    onError: (error) => {
      const errorMessage = error?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  const { data: tahunRows = [], isLoading: loadingTahun } = useQuery({
    queryKey: ["tahun-ajaran-dropdown"],
    queryFn: fetchTahunAjaran,
    onError: (error) => {
      const msg = error?.response?.data?.msg || "Gagal memuat data tahun ajaran";
      setError(msg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  // hanya tampilkan tahun ajaran yang terbuka
  const tahunOptions = useMemo(() => {
    return (tahunRows || [])
      .filter((x) => x?.is_locked === false || x?.is_locked === undefined) // fallback kalau endpoint dropdown hanya kirim id+tahun_ajaran
      .map((x) => ({
        value: x.id,
        label: x.tahun_ajaran,
      }));
  }, [tahunRows]);

  useEffect(() => {
    if (!data) return;

    setSemesterData({
      semester: data.semester || "",
      tahun_ajaran_id: data.tahun_ajaran_id || data?.TahunAjaran?.id || "",
      is_aktif: data.is_aktif ? "true" : "false",
      is_locked: data.is_locked ? "true" : "false",
    });
  }, [data]);

  // kalau opsi tahun ajaran berubah dan id terpilih tidak valid, reset (kecuali semester locked)
  useEffect(() => {
    if (!semesterData.tahun_ajaran_id) return;

    const isSemesterLocked = semesterData.is_locked === "true";
    if (isSemesterLocked) return;

    if (!tahunOptions.some((o) => o.value === semesterData.tahun_ajaran_id)) {
      setSemesterData((prev) => ({ ...prev, tahun_ajaran_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahunOptions]);

  const mutation = useMutation({
    mutationFn: async (updatedSemester) => {
      const response = await axiosInstance.put(`/api/v1/admin-sekolah/semester-ajaran/${id}`, updatedSemester);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg);
      setError("");
      setLocalError("");
      queryClient.invalidateQueries(["semester"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/semester-ajaran"), 3000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || "Gagal memperbarui data";
      const errorDetails = error.response?.data?.errors || [];
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setSuccess("");
      setLocalError("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSemesterData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setLocalError("");

    if (!semesterData.semester) {
      setLocalError("Semester wajib dipilih");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    if (!semesterData.tahun_ajaran_id) {
      setLocalError("Tahun ajaran wajib dipilih");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    if (semesterData.is_aktif === "true" && semesterData.is_locked === "true") {
      setLocalError("Semester aktif tidak boleh dalam kondisi terkunci");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    const payload = {
      semester: semesterData.semester,
      tahun_ajaran_id: semesterData.tahun_ajaran_id,
      is_aktif: semesterData.is_aktif === "true",
      is_locked: semesterData.is_locked === "true",
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Semester" description="Formulir edit data semester ajaran">
      <ParentCard title="Edit Semester Ajaran">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <SemesterAjaranEditForm
          semesterData={semesterData}
          tahunOptions={tahunOptions}
          loadingTahun={loadingTahun}
          localError={localError}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isPending}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default SemesterAjaranEdit;
