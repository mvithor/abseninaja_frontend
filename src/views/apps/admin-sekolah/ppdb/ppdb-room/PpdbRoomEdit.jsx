import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbRoomEditForm from "src/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomEditForm";

const fetchPpdbRoomById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-room/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching ppdb room:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
    throw error;
  }
};

const PpdbRoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usageMeta, setUsageMeta] = useState(null);
  const [roomData, setRoomData] = useState({
    id: "",
    code: "",
    nama: "",
    lokasi: "",
    capacity: "",
    is_active: "true",
  });

  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isFetching,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ["ppdbRoom", id],
    queryFn: () => fetchPpdbRoomById(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(String(errorMessage));
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setRoomData((prev) => ({
        ...prev,
        ...data,
        id: data?.id || prev.id,
        code: data?.code || "",
        nama: data?.nama || "",
        lokasi: data?.lokasi ?? "",
        capacity: data?.capacity ?? "",
        is_active: String(data?.is_active ?? true),
      }));

      setUsageMeta(null);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (room) => {
      const payload = {
        code: String(room.code || "").trim().toUpperCase(),
        nama: String(room.nama || "").trim(),
        lokasi: String(room.lokasi || "").trim() ? String(room.lokasi || "").trim() : null,
        capacity: room.capacity === "" || room.capacity === undefined || room.capacity === null ? null : Number(room.capacity),
        is_active: String(room.is_active) === "true",
      };

      // jangan kirim null yg gak perlu (style kamu)
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null || payload[k] === undefined || payload[k] === "") delete payload[k];
      });

      const response = await axiosInstance.put(`/api/v1/admin-sekolah/ppdb-room/${id}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg || "Ruang tes berhasil diperbarui");
      setError("");
      setUsageMeta(null);

      queryClient.invalidateQueries({ queryKey: ["ppdbRoom", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-room-list"] });

      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-room"), 1200);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memperbarui ruang tes";
      const details = err?.response?.data?.errors || [];
      const meta = err?.response?.data?.meta;

      // tangkap meta usageFloor dari backend (capacity constraint)
      if (status === 409 && meta && typeof meta === "object") {
        setUsageMeta(meta);
      }

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

    setRoomData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(roomData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Ruang Tes PMB" description="Edit Ruang Tes PMB">
      <ParentCard title="Form Edit Ruang Tes PMB">
        <Alerts
          error={error || (isError && (queryError?.response?.data?.msg || queryError?.message || "Gagal memuat data"))}
          success={success}
        />

        <PpdbRoomEditForm
          roomData={roomData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
          setError={setError}
          setSuccess={setSuccess}
          usageMeta={usageMeta}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbRoomEdit;