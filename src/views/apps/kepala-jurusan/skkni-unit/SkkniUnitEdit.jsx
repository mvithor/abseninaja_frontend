import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import { validate as isUUID } from "uuid";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import SkkniUnitEditForm from "src/apps/kepala-jurusan/skkni-unit/Edit/SkkniEditForm";

const fetchSkkniUnitById = async (id) => {
  try {
    if (!id || !isUUID(id)) {
      throw new Error("Unit SKKNI tidak ditemukan");
    }

    const response = await axiosInstance.get(`/api/v1/kepala-jurusan/skkni-unit/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching skkni unit:", error);
    }
    throw new Error("Terjadi kesalahan saat mengambil data unit SKKNI. Silakan coba lagi.");
  }
};

const SkkniUnitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skkniUnitData, setSkkniUnitData] = useState({
    kode_unit: "",
    judul_unit: "",
    kategori: "",
    is_aktif: true,
  });

  const queryClient = useQueryClient();

  const safeId = useMemo(() => (id && isUUID(id) ? id : null), [id]);

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["skkni-unit", safeId],
    queryFn: () => fetchSkkniUnitById(safeId),
    enabled: !!safeId,
    onError: (err) => {
      const errorMessage =
        err?.response?.data?.msg ||
        err?.message ||
        "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (!safeId) {
      navigate("/dashboard/kepala-jurusan/skkni-unit");
    }
  }, [safeId, navigate]);

  useEffect(() => {
    if (data) {
      setSkkniUnitData((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/kepala-jurusan/skkni-unit/${safeId}`, payload);
    },
    onSuccess: async (response) => {
      setSuccess(response?.data?.msg || "Unit SKKNI berhasil diperbarui");

      await queryClient.invalidateQueries({ queryKey: ["skkni-unit", safeId] });
      await queryClient.invalidateQueries({ queryKey: ["skkni-unit-list"] });

      setTimeout(() => {
        navigate("/dashboard/kepala-jurusan/skkni-unit");
      }, 1500);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        "Terjadi kesalahan saat memperbarui unit SKKNI";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }

      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSkkniUnitData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!skkniUnitData || !safeId) return;

    const dataToSend = {
      kode_unit: String(skkniUnitData.kode_unit || "").trim().toUpperCase(),
      judul_unit: String(skkniUnitData.judul_unit || "").trim(),
      kategori: skkniUnitData.kategori,
      is_aktif: Boolean(skkniUnitData.is_aktif),
    };

    mutation.mutate(dataToSend);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Unit SKKNI" description="Edit Unit Kompetensi SKKNI">
      <ParentCard title="Form Edit Unit SKKNI">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <SkkniUnitEditForm
          skkniUnitData={skkniUnitData || {}}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isPending}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default SkkniUnitEdit;