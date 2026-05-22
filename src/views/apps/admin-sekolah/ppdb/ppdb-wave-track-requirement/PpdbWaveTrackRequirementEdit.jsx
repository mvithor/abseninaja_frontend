import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbWaveTrackTestRequirementEditForm from "src/apps/admin-sekolah/ppdb/ppdb-wave-track-requirement/PpdbWaveTrackRequirementEditForm";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const toNumberOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
};

const toIntOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = parseInt(String(n), 10);
  if (Number.isNaN(i)) return null;
  return i;
};

const fetchRequirementById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-wave-track-requirement/${id}`);
  return res.data.data;
};

const fetchPeriodOptions = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
  const rows = Array.isArray(response.data?.data) ? response.data.data : [];
  return rows.map((p) => ({
    id: p.id,
    nama: p.nama,
    status: p.status,
    tahun_ajaran: p?.tahun_ajaran || "-",
  }));
};

const fetchWaveTrackOptions = async (ppdb_period_id) => {
  if (!ppdb_period_id) return [];
  const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-wave-track", {
    params: { ppdb_period_id },
  });
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  return rows.map((r) => ({
    id: r.id,
    label:
      `${r?.wave_nama || r?.Wave?.nama || "WAVE"} — ` +
      `${r?.track_nama || r?.Track?.nama || "TRACK"}` +
      (r?.quota ? ` | quota: ${r.quota}` : ""),
  }));
};

const fetchComponentOptions = async (ppdb_period_id) => {
  if (!ppdb_period_id) return [];
  const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-komponen-tes", {
    params: { ppdb_period_id },
  });
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  return rows.map((c) => ({
    id: c.id,
    code: c.code || "-",
    nama: c.nama || "-",
    type: c.type || "MANUAL",
    is_active: c.is_active ?? true,
  }));
};

const PpdbWaveTrackTestRequirementEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbWaveTrackTestRequirement", id],
    queryFn: () => fetchRequirementById(id),
    refetchOnWindowFocus: false,
  });

  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: fetchPeriodOptions,
    refetchOnWindowFocus: false,
  });

  const periodIdForDropdown = useMemo(() => {
    return String(formData?.ppdb_period_id || "").trim();
  }, [formData]);

  const { data: waveTrackOptions = [] } = useQuery({
    queryKey: ["ppdbWaveTrackOptions", periodIdForDropdown],
    queryFn: () => fetchWaveTrackOptions(periodIdForDropdown),
    enabled: Boolean(periodIdForDropdown),
    refetchOnWindowFocus: false,
  });

  const { data: componentOptions = [] } = useQuery({
    queryKey: ["ppdbTestComponentOptions", periodIdForDropdown],
    queryFn: () => fetchComponentOptions(periodIdForDropdown),
    enabled: Boolean(periodIdForDropdown),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    setFormData({
      ...data,
      ppdb_period_id: data.ppdb_period_id || "",
      ppdb_wave_track_id: data.ppdb_wave_track_id || "",
      ppdb_test_component_id: data.ppdb_test_component_id || "",
      is_required: data.is_required ?? true,
      min_score: data.min_score ?? "",
      weight: data.weight ?? "",
      is_elimination: data.is_elimination ?? false,
      sort_order: data.sort_order ?? 1,
    });
  }, [data]);

  const periodStatus = useMemo(() => safeUpper(formData?.PpdbPeriod?.status || ""), [formData]);
  const isArchived = periodStatus === "ARCHIVED";
  const isUsed = Boolean(formData?.usage?.used);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-wave-track-requirement/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data?.msg || "Requirement berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["ppdbWaveTrackTestRequirement", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdbWaveTrackTestRequirements"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Gagal memperbarui requirement";
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(msg);
      }
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (!isError) return;
    const msg =
      queryError?.response?.data?.msg ||
      queryError?.message ||
      "Gagal memuat detail requirement";
    setError(msg);
    setTimeout(() => setError(""), 3000);
  }, [isError, queryError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "ppdb_period_id") {
      setFormData((prev) => ({
        ...prev,
        ppdb_period_id: value,
        ppdb_wave_track_id: "",
        ppdb_test_component_id: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isArchived) {
      setError("Period sudah ARCHIVED, perubahan tidak dapat disimpan");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const payload = {};

    const periodId = String(formData.ppdb_period_id || "").trim();
    const waveTrackId = String(formData.ppdb_wave_track_id || "").trim();
    const componentId = String(formData.ppdb_test_component_id || "").trim();

    if (!isUsed) {
      if (periodId) payload.ppdb_period_id = periodId;
      if (waveTrackId) payload.ppdb_wave_track_id = waveTrackId;
      if (componentId) payload.ppdb_test_component_id = componentId;
    }

    payload.is_required = Boolean(formData.is_required);
    payload.is_elimination = Boolean(formData.is_elimination);
    const minScoreFilled = String(formData.min_score ?? "").trim().length > 0;
    const weightFilled = String(formData.weight ?? "").trim().length > 0;
    const minScore = minScoreFilled ? toNumberOrNull(formData.min_score) : null;
    const weight = weightFilled ? toNumberOrNull(formData.weight) : null;

    if (minScoreFilled && minScore === null) {
      setError("Nilai minimum harus berupa angka");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (weightFilled && weight === null) {
      setError("Bobot harus berupa angka");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (minScore !== null && minScore < 0) {
      setError("Nilai minimum minimal 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (weight !== null && weight < 0) {
      setError("bobot minimal 0");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const nextIsElim = Boolean(formData.is_elimination);
    const nextMinScore = minScoreFilled ? minScore : (formData?.min_score ?? null);
    if (nextIsElim && (nextMinScore === null || nextMinScore === undefined || String(nextMinScore).trim() === "")) {
      setError("min_score wajib diisi jika is_elimination=true");
      setTimeout(() => setError(""), 3000);
      return;
    }

    payload.min_score = minScoreFilled ? minScore : null;
    payload.weight = weightFilled ? weight : null;
    const sortFilled = String(formData.sort_order ?? "").trim().length > 0;
    if (sortFilled) {
      const so = toIntOrNull(formData.sort_order);
      if (so === null || so < 1) {
        setError("Urutan harus bilangan bulat minimal 1");
        setTimeout(() => setError(""), 3000);
        return;
      }
      payload.sort_order = so;
    } else {
      payload.sort_order = null;
    }

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Persyaratan Tes PMB" description="Form Edit Persyaratan Tes PMB">
      <ParentCard title="Form Edit Persyaratan Tes PMB">
        <Alerts error={error} success={success} />
        <PpdbWaveTrackTestRequirementEditForm
          formData={formData}
          periodOptions={periodOptions}
          waveTrackOptions={waveTrackOptions}
          componentOptions={componentOptions}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbWaveTrackTestRequirementEdit;