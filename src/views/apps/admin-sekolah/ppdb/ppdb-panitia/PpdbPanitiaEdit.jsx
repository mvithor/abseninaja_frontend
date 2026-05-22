import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbPanitiaEditForm from "src/apps/admin-sekolah/ppdb/ppdb-panitia/PpdbPanitiaEditForm";

const fetchPpdbPanitiaById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-panitia/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching panitia ppdb:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
    throw error;
  }
};

const PpdbPanitiaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [panitiaData, setPanitiaData] = useState({
    id: "",
    ppdb_period_id: "",
    user_id: "",
    is_active: "true",
    revoked_at: null,

    // include dari backend
    AkunPanitia: null,
    PpdbPeriod: null,
    Sekolah: null,
    AssignedBy: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["ppdbPanitia", id],
    queryFn: () => fetchPpdbPanitiaById(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(String(errorMessage));
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setPanitiaData((prev) => ({
        ...prev,
        ...data,
        id: data?.id || prev.id,
        ppdb_period_id: data?.ppdb_period_id || prev.ppdb_period_id,
        user_id: data?.user_id || prev.user_id,
        is_active: String(data?.is_active ?? true),
        revoked_at: data?.revoked_at ?? null,

        AkunPanitia: data?.AkunPanitia || null,
        PpdbPeriod: data?.PpdbPeriod || null,
        Sekolah: data?.Sekolah || null,
        AssignedBy: data?.AssignedBy || null,
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (panitia) => {
      const payload = {
        is_active: String(panitia.is_active) === "true",
      };
      const response = await axiosInstance.put(`/api/v1/admin-sekolah/ppdb-panitia/${id}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg || "Panitia PPDB berhasil diperbarui");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["ppdbPanitia", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdbPanitiaList"] });

      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-panitia"), 1200);
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.msg || "Terjadi kesalahan saat memperbarui panitia PPDB";
      const errorDetails = err?.response?.data?.errors || [];
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(String(errorMsg));
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPanitiaData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(panitiaData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Panitia PPDB" description="Edit Panitia PPDB">
      <ParentCard title="Form Edit Panitia PPDB">
        <Alerts error={error || (isError && (queryError?.message || "Gagal memuat data"))} success={success} />

        <PpdbPanitiaEditForm
          panitiaData={panitiaData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
          error={error}
          setError={setError}
          success={success}
          setSuccess={setSuccess}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPanitiaEdit;
