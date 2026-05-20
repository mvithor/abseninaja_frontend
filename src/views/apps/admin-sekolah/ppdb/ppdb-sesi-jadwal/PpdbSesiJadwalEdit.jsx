import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbSesiJadwalEditForm from "src/apps/admin-sekolah/ppdb/ppdb-sesi-jadwal/PpdbSesiJadwalEditForm";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const safeText = (val) => {
  const s = String(val ?? "").trim();
  return s.length > 0 ? s : "";
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

const toIsoOrNull = (val) => {
  const s = String(val ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const fetchSessionById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-sesi-jadwal/${id}`);
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
  return rows.map((r) => {
    const wave = r?.wave_nama || r?.Wave?.nama || "WAVE";
    const track = r?.track_nama || r?.Track?.nama || "TRACK";
    const kode = r?.track_kode || r?.Track?.kode;
    const suffix = kode ? ` (${String(kode)})` : "";
    const open = r?.is_open === true ? "OPEN" : r?.is_open === false ? "CLOSED" : "-";
    const waveStatus = r?.wave_status ? String(r.wave_status).toUpperCase() : "-";
    return {
      id: r.id,
      label: `${wave} [${waveStatus}] — ${track}${suffix} — ${open}`,
    };
  });
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

const PpdbSesiJadwalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbSesiJadwal", id],
    queryFn: () => fetchSessionById(id),
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

    const isGlobal = !String(data.ppdb_wave_track_id || "").trim();

    setFormData({
      ...data,
      ppdb_period_id: data.ppdb_period_id || "",
      ppdb_wave_track_id: data.ppdb_wave_track_id || "",
      ppdb_test_component_id: data.ppdb_test_component_id || "",

      is_global_scope: Boolean(isGlobal),

      title: data.title || "",
      mode: safeUpper(data.mode || "OFFLINE"),
      online_url: data.online_url || "",

      start_at: data.start_at || "",
      end_at: data.end_at || "",

      checkin_open_at: data.checkin_open_at || "",
      late_after_at: data.late_after_at || "",
      checkin_close_at: data.checkin_close_at || "",

      capacity: data.capacity ?? "",
    });
  }, [data]);

  const periodStatus = useMemo(() => safeUpper(formData?.PpdbPeriod?.status || ""), [formData]);
  const isArchived = periodStatus === "ARCHIVED";
  const sessionStatus = useMemo(() => safeUpper(formData?.status || ""), [formData]);
  const isDraft = sessionStatus === "DRAFT";

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-sesi-jadwal/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data?.msg || "Sesi/Jadwal berhasil diperbarui");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["ppdbSesiJadwal", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-sesi-jadwal"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Gagal memperbarui sesi/jadwal";
      if (Array.isArray(details) && details.length > 0) {
        setError(details.join(", "));
      } else {
        setError(msg);
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (!isError) return;
    const msg =
      queryError?.response?.data?.msg ||
      queryError?.message ||
      "Gagal memuat detail sesi/jadwal";
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
        is_global_scope: true,
      }));
      return;
    }

    if (name === "is_global_scope") {
      const next = Boolean(value);
      setFormData((prev) => ({
        ...prev,
        is_global_scope: next,
        ppdb_wave_track_id: next ? "" : prev.ppdb_wave_track_id,
      }));
      return;
    }

    if (name === "mode") {
      const nextMode = safeUpper(value);
      setFormData((prev) => ({
        ...prev,
        mode: nextMode,
        online_url: nextMode === "OFFLINE" ? "" : prev.online_url,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isArchived) {
      setError("Period sudah ARCHIVED, sebaiknya tidak melakukan perubahan");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!isDraft) {
      setError("Sesi tidak DRAFT. Backend akan menolak update.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const periodId = String(formData.ppdb_period_id || "").trim();
    const componentId = String(formData.ppdb_test_component_id || "").trim();
    const waveTrackId = String(formData.ppdb_wave_track_id || "").trim();

    const title = safeText(formData.title);
    const mode = safeUpper(formData.mode || "OFFLINE");
    const onlineUrl = safeText(formData.online_url);

    const startIso = toIsoOrNull(formData.start_at);
    const endIso = toIsoOrNull(formData.end_at);

    if (!periodId) {
      setError("ppdb_period_id wajib diisi");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!componentId) {
      setError("ppdb_test_component_id wajib diisi");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!title || title.length < 3) {
      setError("Judul sesi minimal 3 karakter");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!startIso || !endIso) {
      setError("Waktu mulai & selesai wajib diisi");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const s = new Date(startIso).getTime();
    const en = new Date(endIso).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(en) || s >= en) {
      setError("start_at harus lebih kecil dari end_at");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if ((mode === "ONLINE" || mode === "HYBRID") && !onlineUrl) {
      setError("online_url wajib diisi untuk mode ONLINE/HYBRID");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const checkinOpenIso = toIsoOrNull(formData.checkin_open_at);
    const lateAfterIso = toIsoOrNull(formData.late_after_at);
    const checkinCloseIso = toIsoOrNull(formData.checkin_close_at);

    const open = checkinOpenIso ? new Date(checkinOpenIso).getTime() : null;
    const late = lateAfterIso ? new Date(lateAfterIso).getTime() : null;
    const close = checkinCloseIso ? new Date(checkinCloseIso).getTime() : null;

    if (open && close && open > close) {
      setError("checkin_open_at harus <= checkin_close_at");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (open && late && open > late) {
      setError("checkin_open_at harus <= late_after_at");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (late && close && late > close) {
      setError("late_after_at harus <= checkin_close_at");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const capFilled = String(formData.capacity ?? "").trim().length > 0;
    const cap = capFilled ? toIntOrNull(formData.capacity) : null;
    if (capFilled && (cap === null || cap < 1)) {
      setError("capacity harus bilangan bulat minimal 1");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const payload = {
      ppdb_period_id: periodId,
      ppdb_test_component_id: componentId,

      ppdb_wave_track_id: formData.is_global_scope ? null : (waveTrackId || null),
      title,
      mode,
      online_url: (mode === "ONLINE" || mode === "HYBRID") ? onlineUrl : (onlineUrl || null),

      start_at: startIso,
      end_at: endIso,

      checkin_open_at: checkinOpenIso,
      late_after_at: lateAfterIso,
      checkin_close_at: checkinCloseIso,

      capacity: cap,
    };

    // strip undefined saja (null harus tetap terkirim untuk clear field)
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Sesi / Jadwal Tes" description="Form Edit Sesi / Jadwal Tes PPDB">
      <ParentCard title="Form Edit Sesi / Jadwal Tes PPDB">
        <Alerts error={error} success={success} />
        <PpdbSesiJadwalEditForm
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

export default PpdbSesiJadwalEdit;