// src/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentEdit.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbTestComponentEditForm from "src/apps/admin-sekolah/ppdb/ppdb-test-component/PpdbTestComponentEditForm";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

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

const toNumberOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
};

const fetchTestComponentById = async (id) => {
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-test-component/${id}`);
  return res.data.data;
};

const fetchPeriodOptions = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
  const rows = Array.isArray(response.data?.data) ? response.data.data : [];
  return rows
    .filter((p) => String(p?.status || "").toUpperCase() !== "ARCHIVED")
    .map((p) => ({
      id: p.id,
      nama: p.nama,
      status: p.status,
      tahun_ajaran: p?.tahun_ajaran || "-",
    }));
};

const PpdbTestComponentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["ppdbTestComponent", id],
    queryFn: () => fetchTestComponentById(id),
    refetchOnWindowFocus: false,
  });

  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: fetchPeriodOptions,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    setFormData({
      ...data,
      ppdb_period_id: data.ppdb_period_id || "",
      code: data.code || "",
      nama: data.nama || "",
      type: safeUpper(data.type) || "MANUAL",
      description: data.description ?? "",
      duration_minutes: data.duration_minutes ?? "",
      score_min: data.score_min ?? "",
      score_max: data.score_max ?? "",
      is_active: data.is_active ?? true,
    });
  }, [data]);

  const periodStatus = useMemo(() => {
    return String(formData?.PpdbPeriod?.status || "").toUpperCase();
  }, [formData]);

  const isArchived = periodStatus === "ARCHIVED";

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return axiosInstance.put(`/api/v1/admin-sekolah/ppdb-test-component/${id}`, payload);
    },
    onSuccess: (res) => {
      setSuccess(res.data?.msg || "Komponen tes berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["ppdbTestComponent", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-test-components"] });
      setTimeout(() => navigate(-1), 1200);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Gagal memperbarui komponen tes";
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
    const msg = queryError?.response?.data?.msg || queryError?.message || "Gagal memuat detail komponen tes";
    setError(msg);
    setTimeout(() => setError(""), 3000);
  }, [isError, queryError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData((prev) => ({ ...prev, type: safeUpper(value) }));
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

    // policy backend: jika used => jangan kirim ppdb_period_id & code kalau berubah.
    // FE form sudah disable, tapi tetap aman untuk payload.
    const isUsed = Boolean(formData?.usage?.used);

    const payload = {};

    // ppdb_period_id (opsional)
    const periodId = String(formData.ppdb_period_id || "").trim();
    if (periodId && !isUsed) payload.ppdb_period_id = periodId;

    // code (opsional)
    const code = String(formData.code || "").trim();
    if (code.length > 0 && !isUsed) payload.code = code;

    // nama
    const nama = String(formData.nama || "").trim();
    if (nama.length > 0) payload.nama = nama;

    // type
    const type = safeUpper(formData.type) || "MANUAL";
    payload.type = type;

    // description optional
    const desc = String(formData.description ?? "").trim();
    payload.description = desc.length > 0 ? desc : null;

    // duration optional (int 1..1440)
    const durationFilled = String(formData.duration_minutes ?? "").trim().length > 0;
    if (durationFilled) {
      const dm = toIntOrNull(formData.duration_minutes);
      if (dm === null) {
        setError("Durasi harus berupa angka");
        setTimeout(() => setError(""), 3000);
        return;
      }
      payload.duration_minutes = dm;
    } else {
      // biarkan null agar backend update jika user mengosongkan
      payload.duration_minutes = null;
    }

    // score_min/max optional (number, min<=max)
    const sMinFilled = String(formData.score_min ?? "").trim().length > 0;
    const sMaxFilled = String(formData.score_max ?? "").trim().length > 0;

    const scoreMin = sMinFilled ? toNumberOrNull(formData.score_min) : null;
    const scoreMax = sMaxFilled ? toNumberOrNull(formData.score_max) : null;

    const nextMin = scoreMin ?? Number(formData?.score_min ?? 0);
    const nextMax = scoreMax ?? Number(formData?.score_max ?? 100);

    if (scoreMin !== null && scoreMin < 0) {
      setError("Score minimum minimal 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (scoreMax !== null && scoreMax < 0) {
      setError("Score maksimum minimal 0");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax) && nextMin > nextMax) {
      setError("score_min tidak boleh lebih besar dari score_max");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Kalau kosong, jangan paksa update. Tapi kalau user kosongkan, kamu memang butuh mengirim null.
    // Di sini kita kirim nilai jika diisi, kalau kosong -> tidak kirim, biar backend keep existing.
    if (scoreMin !== null) payload.score_min = scoreMin;
    if (scoreMax !== null) payload.score_max = scoreMax;

    // is_active
    payload.is_active = Boolean(formData.is_active);

    // rapikan
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    mutation.mutate(payload);
  };

  return (
    <PageContainer title="Edit Komponen Tes PMB" description="Form Edit Komponen Tes PMB">
      <ParentCard title="Form Edit Komponen Tes PMB">
        <Alerts error={error} success={success} />
        <PpdbTestComponentEditForm
          formData={formData}
          periodOptions={periodOptions}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => navigate(-1)}
          isLoading={isLoading || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbTestComponentEdit;