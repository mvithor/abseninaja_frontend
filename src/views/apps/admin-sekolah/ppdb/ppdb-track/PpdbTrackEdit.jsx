import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbTrackEditForm from "src/apps/admin-sekolah/ppdb/ppdb-track/PpdbTrackEditForm";

const fetchTrackById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-track/${id}`);
  return res.data.data;
};

const toIntOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = parseInt(String(n), 10);
  return Number.isNaN(i) ? null : i;
};

const PpdbTrackEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [trackData, setTrackData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: qErr } = useQuery({
    queryKey: ["ppdbTrack", id],
    queryFn: () => fetchTrackById(id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setTrackData({
        ...data,
        sort_order: data?.sort_order ?? "",
      });
    }
  }, [data]);

  const periodStatus = useMemo(
    () => String(trackData?.PpdbPeriod?.status || "").toUpperCase(),
    [trackData]
  );

  const isArchived = periodStatus === "ARCHIVED";
  const isOpen = periodStatus === "OPEN";

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-track/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data?.msg || "Jalur berhasil diperbarui");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["ppdbTrack", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-track"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Gagal memperbarui jalur";
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(msg);
      }
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isOpen && (name === "kode" || name === "nama")) return;

    setTrackData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isArchived) {
      setError("Periode sudah ARCHIVED. Jalur tidak bisa diubah.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const payload = {};

    if (!isOpen) {
      if (trackData.kode !== undefined) payload.kode = String(trackData.kode || "").trim();
      if (trackData.nama !== undefined) payload.nama = String(trackData.nama || "").trim();
    }

    payload.is_active = Boolean(trackData.is_active);
    const so = toIntOrNull(trackData.sort_order);
    if (String(trackData.sort_order ?? "").trim().length === 0) {
      // kalau kosong, jangan kirim (biar tidak mengubah)
      // kalau kamu mau set null eksplisit, ganti ini jadi: payload.sort_order = null;
    } else {
      if (so === null || so < 0) {
        setError("Urutan (sort_order) harus berupa angka >= 0");
        setTimeout(() => setError(""), 3000);
        return;
      }
      payload.sort_order = so;
    }

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Jalur Pendaftaran PMB" description="Edit Jalur Pendaftaran PMB">
      <ParentCard title="Form Edit Jalur Pendaftaran PMB">
        <Alerts
          error={
            error ||
            (isError && (qErr?.response?.data?.msg || qErr?.message || "Gagal memuat detail jalur"))
          }
          success={success}
        />

        <PpdbTrackEditForm
          trackData={trackData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbTrackEdit;