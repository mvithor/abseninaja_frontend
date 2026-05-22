import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbJadwalTahapanEditForm from "src/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanEditForm";
import dayjs from "dayjs";

const fetchScheduleById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb/jadwal-tahapan/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching ppdb jadwal tahapan:", error);
    }
    throw error;
  }
};

const toSafeString = (v) => {
  if (v === undefined || v === null) return "";
  return String(v);
};

const toIntOrEmpty = (v) => {
  if (v === undefined || v === null) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  const i = parseInt(String(n), 10);
  if (Number.isNaN(i)) return "";
  return String(i);
};

const normalizeIsoOrEmpty = (iso) => {
  const s = String(iso || "").trim();
  if (!s) return "";
  const d = dayjs(s);
  return d.isValid() ? d.toISOString() : "";
};

const PpdbJadwalTahapanEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    ppdb_period_id: "",
    ppdb_event_type_id: "",

    ppdb_wave_track_id: "",

    sequence: "",
    title: "",
    start_at: "",
    end_at: "",

    location: "",
    description: "",

    is_active: true,
  });

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["ppdbEventScheduleById", id],
    queryFn: () => fetchScheduleById(id),
    enabled: Boolean(id),
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (!data) return;

    setFormData({
      ppdb_period_id: toSafeString(data.ppdb_period_id),
      ppdb_event_type_id: toSafeString(data.ppdb_event_type_id),
      ppdb_wave_track_id: toSafeString(data.ppdb_wave_track_id),
      sequence: toIntOrEmpty(data.sequence),
      title: toSafeString(data.title),
      start_at: toSafeString(data.start_at),
      end_at: toSafeString(data.end_at),
      location: toSafeString(data.location),
      description: toSafeString(data.description),

      is_active: data.is_active !== false,
    });
  }, [data]);

  const canSubmit = useMemo(() => {
    if (!formData.ppdb_period_id) return false;
    if (!formData.ppdb_event_type_id) return false;
    if (!formData.start_at) return false;

    if (formData.start_at && formData.end_at) {
      const s = new Date(formData.start_at).getTime();
      const e = new Date(formData.end_at).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) return false;
    }

    if (String(formData.sequence || "").trim().length > 0) {
      const n = Number(formData.sequence);
      if (!Number.isFinite(n)) return false;
      if (parseInt(String(n), 10) < 1) return false;
    }

    return true;
  }, [formData]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return await axiosInstance.put(`/api/v1/admin-sekolah/ppdb/jadwal-tahapan/${id}`, payload);
    },
    onSuccess: async (response) => {
      setSuccess(response.data?.msg || "Jadwal tahapan berhasil diperbarui");
      setError("");

      await queryClient.invalidateQueries({ queryKey: ["ppdbEventSchedules"] });
      await queryClient.invalidateQueries({ queryKey: ["ppdb-jadwal-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["ppdb-jadwal-tahapan"] });
      await queryClient.invalidateQueries({ queryKey: ["ppdbEventScheduleById", id] });

      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/ppdb-jadwal-tahapan");
      }, 3000);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memperbarui jadwal";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(msg);
      }

      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    const hasWT = Boolean(String(formData.ppdb_wave_track_id || "").trim());

    const seqRaw = String(formData.sequence || "").trim();
    const seqNum = seqRaw.length ? parseInt(seqRaw, 10) : 1; 

    const payload = {
      ppdb_period_id: formData.ppdb_period_id || undefined,
      ppdb_event_type_id: formData.ppdb_event_type_id || undefined,
      ppdb_wave_track_id: hasWT ? formData.ppdb_wave_track_id : null,
      sequence: Number.isFinite(seqNum) && seqNum >= 1 ? seqNum : 1,
      title: String(formData.title || "").trim().length ? String(formData.title).trim() : null,
      start_at: normalizeIsoOrEmpty(formData.start_at) || undefined,
      end_at: String(formData.end_at || "").trim().length ? normalizeIsoOrEmpty(formData.end_at) : null,
      location: String(formData.location || "").trim().length ? String(formData.location).trim() : null,
      description: String(formData.description || "").trim().length ? String(formData.description).trim() : null,

      is_active: Boolean(formData.is_active),
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    return payload;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Lengkapi field wajib dan pastikan input valid.");
      setSuccess("");
      setTimeout(() => setError(""), 2500);
      return;
    }

    mutation.mutate(buildPayload());
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Jadwal Tahapan PMB" description="Edit Jadwal Tahapan PMB">
      <ParentCard title="Edit Jadwal Tahapan PMB">
        <Alerts
          error={error || (isError && (queryError?.message || queryError?.response?.data?.msg))}
          success={success}
        />

        <PpdbJadwalTahapanEditForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbJadwalTahapanEdit;
