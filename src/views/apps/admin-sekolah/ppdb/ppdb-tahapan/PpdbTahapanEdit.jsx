import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbTahapanEditForm from "src/apps/admin-sekolah/ppdb/ppdb-tahapan/PpdbTahapanEditForm";

const fetchPpdbTahapanById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb/event-types/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching ppdb event type:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
    throw error;
  }
};

const PpdbTahapanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [eventTypeData, setEventTypeData] = useState({
    id: "",
    code: "",
    nama: "",
    deskripsi: "",
    sort_order: null,
    is_active: "true",
    created_at: null,
    updated_at: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["ppdbEventType", id],
    queryFn: () => fetchPpdbTahapanById(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(String(errorMessage));
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setEventTypeData((prev) => ({
        ...prev,
        ...data,
        id: data?.id || prev.id,
        code: data?.code || "",
        nama: data?.nama || "",
        deskripsi: data?.deskripsi ?? "",
        sort_order: data?.sort_order ?? null,
        is_active: String(data?.is_active ?? true),
        created_at: data?.created_at ?? null,
        updated_at: data?.updated_at ?? null,
      }));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (evt) => {
      const payload = {
        code: String(evt.code || "").trim().toUpperCase(),
        nama: String(evt.nama || "").trim(),
        deskripsi: String(evt.deskripsi || "").trim() ? String(evt.deskripsi || "").trim() : null,
        is_active: String(evt.is_active) === "true",
        sort_order:
          evt.sort_order === "" || evt.sort_order === undefined
            ? null
            : evt.sort_order === null
              ? null
              : Number(evt.sort_order),
      };

      const response = await axiosInstance.put(`/api/v1/admin-sekolah/ppdb/event-types/${id}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg || "Tahapan PMB berhasil diperbarui");
      setError("");

      queryClient.invalidateQueries({ queryKey: ["ppdbEventType", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-tahapan-paged"] });

      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-tahapan"), 1200);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memperbarui tahapan";
      const details = err?.response?.data?.errors || [];

      if (status === 400 && Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(String(msg));
      }

      setSuccess("");
      setTimeout(() => setError(""), 3500);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEventTypeData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(eventTypeData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Tahapan PMB" description="Edit Tahapan PMB">
      <ParentCard title="Form Edit Tahapan PMB">
        <Alerts error={error || (isError && (queryError?.message || "Gagal memuat data"))} success={success} />

        <PpdbTahapanEditForm
          eventTypeData={eventTypeData}
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

export default PpdbTahapanEdit;
