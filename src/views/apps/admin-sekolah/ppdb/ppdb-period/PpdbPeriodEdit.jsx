import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import Alerts from "src/components/alerts/Alerts";
import PpdbPeriodEditForm from "src/apps/admin-sekolah/ppdb/ppdb-period/PpdbPeriodEditForm";

const upper = (v) => String(v || "").trim().toUpperCase();

const fetchPpdbPeriodById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-period/${id}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching periode ppdb:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
    }
    throw error;
  }
};

const toIsoOrNull = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const toMillis = (val) => {
  if (!val) return null;
  const d = new Date(val);
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
};

const PpdbPeriodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [periodData, setPeriodData] = useState({
    nama: "",
    tahun_ajaran_target_id: "",
    open_at: "",
    close_at: "",
    status: "DRAFT",
  });

  const [initialMeta, setInitialMeta] = useState({
    status: "DRAFT",
    close_at: "",
  });

  const queryClient = useQueryClient();

  const { data, isLoading: isFetching, isError, error: queryError } = useQuery({
    queryKey: ["period", id],
    queryFn: () => fetchPpdbPeriodById(id),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(String(errorMessage));
      setTimeout(() => setError(""), 3000);
    },
  });

  useEffect(() => {
    if (data) {
      setPeriodData((prev) => ({
        ...prev,
        ...data,
        nama: data?.nama || "",
        tahun_ajaran_target_id: data?.tahun_ajaran_target_id || "",
        open_at: data?.open_at || "",
        close_at: data?.close_at || "",
        status: data?.status || prev.status,
      }));

      setInitialMeta({
        status: data?.status || "DRAFT",
        close_at: data?.close_at || "",
      });
    }
  }, [data]);

  const status = useMemo(() => upper(periodData?.status), [periodData?.status]);
  const initialStatus = useMemo(() => upper(initialMeta?.status), [initialMeta?.status]);

  const mutation = useMutation({
    mutationFn: async (period) => {
      const s = upper(period?.status);

      // ====== Client validation sesuai rule terbaru ======
      // DRAFT: boleh edit semua
      // OPEN: hanya boleh extend close_at
      // CLOSED/ARCHIVED: tidak boleh edit
      if (s !== "DRAFT" && s !== "OPEN") {
        const err = new Error("Periode dengan status ini tidak dapat diedit");
        err.response = { data: { msg: `Periode berstatus ${s} tidak dapat diedit` } };
        throw err;
      }

      if (s === "OPEN") {
        const oldClose = toMillis(initialMeta?.close_at);
        const newClose = toMillis(period?.close_at);

        if (!newClose) {
          const err = new Error("close_at wajib diisi untuk memperpanjang periode");
          err.response = { data: { msg: "close_at wajib diisi untuk memperpanjang periode" } };
          throw err;
        }

        if (oldClose && newClose <= oldClose) {
          const err = new Error("close_at harus lebih besar dari close_at sebelumnya (extend only)");
          err.response = { data: { msg: "close_at harus lebih besar dari close_at sebelumnya (extend only)" } };
          throw err;
        }

        // payload OPEN: hanya close_at
        const payload = { close_at: toIsoOrNull(period.close_at) };

        const response = await axiosInstance.put(`/api/v1/admin-sekolah/ppdb-period/${id}`, payload);
        return response.data;
      }

      // s === "DRAFT"
      const payload = {
        nama: period.nama,
        tahun_ajaran_target_id: period.tahun_ajaran_target_id,
        open_at: toIsoOrNull(period.open_at),
        close_at: toIsoOrNull(period.close_at),
      };

      const response = await axiosInstance.put(`/api/v1/admin-sekolah/ppdb-period/${id}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg || "Periode PPDB berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["period", id] });
      queryClient.invalidateQueries({ queryKey: ["ppdb-period"] }); // FIX: sesuai list view kamu
      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-period"), 1500);
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.msg || "Terjadi kesalahan saat memperbarui periode PPDB";
      const errorDetails = err?.response?.data?.errors || [];
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(String(errorMsg));
      }
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPeriodData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Guard tambahan biar user nggak “bypass” lewat devtools
    if (status !== "DRAFT" && status !== "OPEN") {
      setError(`Periode berstatus ${status} tidak dapat diedit`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Kalau status berubah (harusnya tidak), tahan
    if (initialStatus && status !== initialStatus) {
      setError("Status periode berubah. Silakan reload halaman.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    mutation.mutate(periodData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Edit Periode PMB" description="Edit Periode PMB">
      <ParentCard title="Form Edit Periode PMB">
        <Alerts error={error || (isError && (queryError?.message || "Gagal memuat data"))} success={success} />
        <PpdbPeriodEditForm
          periodData={periodData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          isLoading={isFetching || mutation.isLoading}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default PpdbPeriodEdit;