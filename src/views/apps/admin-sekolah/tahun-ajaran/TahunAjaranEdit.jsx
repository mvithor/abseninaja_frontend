import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import TahunAjaranEditForm from "src/apps/admin-sekolah/tahun-ajaran/Edit/TahunAjaranEditForm";

const fetchTahunAjaranById = async (id) => {
  const response = await axiosInstance.get(`/api/v1/admin-sekolah/tahun-ajaran/${id}`);
  return response.data.data;
};

const TahunAjaranEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tahunData, setTahunData] = useState({
    tahun_ajaran: "",
    is_locked: "false",
  });

  // Simpan kondisi awal buat guard
  const originalRef = useRef({ tahun_ajaran: "", is_locked: "false" });

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["tahun-ajaran", id],
    queryFn: () => fetchTahunAjaranById(id),
    onError: (error) => {
      const errorMessage = error?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      const mapped = {
        tahun_ajaran: data.tahun_ajaran || "",
        is_locked: data.is_locked ? "true" : "false",
      };

      setTahunData(mapped);
      originalRef.current = mapped;
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (updatedTahun) => {
      const response = await axiosInstance.put(`/api/v1/admin-sekolah/tahun-ajaran/${id}`, updatedTahun);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg);
      queryClient.invalidateQueries(["tahun-ajaran"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/tahun-ajaran"), 3000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || "Gagal memperbarui data";
      const errorDetails = error.response?.data?.errors || [];
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTahunData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const original = originalRef.current;
    const wasLocked = original.is_locked === "true";

    // Guard: kalau awalnya locked, tidak boleh mengubah tahun_ajaran
    if (wasLocked && tahunData.tahun_ajaran !== original.tahun_ajaran) {
      setError("Tahun ajaran terkunci: tidak boleh mengubah nilai Tahun Ajaran. Silakan buka kunci terlebih dahulu.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const payload = {
      tahun_ajaran: tahunData.tahun_ajaran,
      is_locked: tahunData.is_locked === "true", // wajib konversi
    };

    if (!payload.tahun_ajaran) {
      setError("Tahun Ajaran wajib diisi");
      setTimeout(() => setError(""), 3000);
      return;
    }

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Tahun Ajaran" description="Formulir edit data tahun ajaran">
      <ParentCard title="Edit Tahun Ajaran">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <TahunAjaranEditForm
          tahunData={tahunData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isPending}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default TahunAjaranEdit;
