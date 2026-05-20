import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tooltip,
  IconButton,
  Typography,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import {
  IconInfoCircle,
  IconUsers,
  IconDoorEnter,
  IconShieldCheck,
  IconBox,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const upper = (v) => String(v || "").trim().toUpperCase();

const TambahPpdbProctorForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: "",
    ppdb_test_session_id: "",
    ppdb_test_session_room_id: "",
    user_id: "",
    role: "PROCTOR",
  });

  const [fieldErrors, setFieldErrors] = useState({
    ppdb_period_id: "",
    ppdb_test_session_id: "",
    ppdb_test_session_room_id: "",
    user_id: "",
    role: "",
  });

  const clearGlobalAlert = () => {
    setError("");
    setSuccess("");
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setFieldError = (name, message) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const resetAllFieldErrors = () => {
    setFieldErrors({
      ppdb_period_id: "",
      ppdb_test_session_id: "",
      ppdb_test_session_room_id: "",
      user_id: "",
      role: "",
    });
  };

  const hasPeriod = useMemo(() => Boolean(String(formState.ppdb_period_id || "").trim()), [formState.ppdb_period_id]);
  const hasSession = useMemo(
    () => Boolean(String(formState.ppdb_test_session_id || "").trim()),
    [formState.ppdb_test_session_id]
  );

  const {
    data: periodOptions = [],
    isError: periodError,
    isLoading: periodLoading,
  } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .filter((p) => upper(p?.status) !== "ARCHIVED")
        .map((p) => ({
          id: p.id,
          nama: p.nama,
          status: p.status,
          tahun_ajaran: p?.tahun_ajaran || "-",
        }));
    },
    refetchOnWindowFocus: false,
  });

  const {
    data: sessionOptions = [],
    isError: sessionError,
    isLoading: sessionLoading,
  } = useQuery({
    queryKey: ["ppdbTestSessionOptions", formState.ppdb_period_id],
    queryFn: async () => {
      const params = { ppdb_period_id: formState.ppdb_period_id };
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-test-session", { params });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: hasPeriod,
    refetchOnWindowFocus: false,
  });

  const {
    data: roomOptions = [],
    isError: roomError,
    isLoading: roomLoading,
  } = useQuery({
    queryKey: ["ppdbTestSessionRoomOptions", formState.ppdb_period_id, formState.ppdb_test_session_id],
    queryFn: async () => {
      const params = {
        ppdb_period_id: formState.ppdb_period_id,
        ppdb_test_session_id: formState.ppdb_test_session_id,
      };

      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-test-session-rooms", { params });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: hasPeriod && hasSession,
    refetchOnWindowFocus: false,
  });

  const {
    data: proctorOptions = [],
    isError: proctorError,
    isLoading: proctorLoading,
  } = useQuery({
    queryKey: ["ppdbProctorPegawaiOptions", formState.ppdb_period_id],
    queryFn: async () => {
      const params = { ppdb_period_id: formState.ppdb_period_id };
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-proctor", { params });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: hasPeriod,
    refetchOnWindowFocus: false,
  });

  const canSubmit = useMemo(() => {
    if (!hasPeriod) return false;
    if (!hasSession) return false;
    if (!String(formState.ppdb_test_session_room_id || "").trim()) return false;
    if (!String(formState.user_id || "").trim()) return false;
    if (!["PROCTOR", "ASSISTANT"].includes(upper(formState.role))) return false;
    return true;
  }, [hasPeriod, hasSession, formState]);

  const mutation = useMutation({
    mutationKey: ["tambahPpdbProctor"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-proctor", payload);
      return response.data;
    },
    onSuccess: (data) => {
      resetAllFieldErrors();
      setSuccess(data?.msg || "Pengawas berhasil di-tambahkan");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-proctors"), 1200);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan pengawas";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }

      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const validateGuard = () => {
    let ok = true;

    if (!hasPeriod) {
      ok = false;
      setFieldError("ppdb_period_id", "Periode PMB wajib dipilih");
    }

    if (!hasSession) {
      ok = false;
      setFieldError("ppdb_test_session_id", "Sesi tes wajib dipilih");
    }

    if (!String(formState.ppdb_test_session_room_id || "").trim()) {
      ok = false;
      setFieldError("ppdb_test_session_room_id", "Sesi ruangan wajib dipilih");
    }

    if (!String(formState.user_id || "").trim()) {
      ok = false;
      setFieldError("user_id", "User pengawas wajib dipilih");
    }

    const role = upper(formState.role);
    if (!["PROCTOR", "ASSISTANT"].includes(role)) {
      ok = false;
      setFieldError("role", "Role tidak valid");
    }

    if (!ok) {
      setSuccess("");
      setError("Mohon lengkapi data yang wajib diisi");
    }

    return ok;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    resetAllFieldErrors();
    clearGlobalAlert();

    if (!validateGuard()) return;

    setLoading(true);

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      ppdb_test_session_room_id: formState.ppdb_test_session_room_id,
      user_id: Number(formState.user_id),
      role: upper(formState.role || "PROCTOR"),
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (periodError || sessionError || roomError || proctorError) {
    return <div>Error Loading Data...</div>;
  }

  const selectedPeriod =
    periodOptions.find((p) => String(p.id) === String(formState.ppdb_period_id)) || null;

  const selectedSession =
    sessionOptions.find((s) => String(s.id) === String(formState.ppdb_test_session_id)) || null;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        {/* Periode PMB */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
            Periode PMB
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_period_id"
            name="ppdb_period_id"
            value={formState.ppdb_period_id}
            onChange={(e) => {
              const value = e.target.value;
              clearGlobalAlert();
              clearFieldError("ppdb_period_id");
              setFormState((prev) => ({
                ...prev,
                ppdb_period_id: value,
                ppdb_test_session_id: "",
                ppdb_test_session_room_id: "",
                user_id: "",
              }));

              clearFieldError("ppdb_test_session_id");
              clearFieldError("ppdb_test_session_room_id");
              clearFieldError("user_id");
            }}
            fullWidth
            required
            displayEmpty
            error={Boolean(fieldErrors.ppdb_period_id)}
            slotProps={{
              input: {
                "aria-label": "Pilih Periode PMB",
                startAdornment: (
                  <InputAdornment position="start">
                    <IconBox />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="" disabled>
              {periodLoading ? "Memuat periode..." : "Pilih Periode PMB"}
            </MenuItem>
            {periodOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nama} — {p.tahun_ajaran} ({upper(p.status)})
              </MenuItem>
            ))}
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.ppdb_period_id ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.ppdb_period_id || " "}
          </Typography>
        </Grid>

        {/* Sesi Tes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_session_id" sx={{ mt: 1.85 }}>
            Sesi Tes
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_test_session_id"
            name="ppdb_test_session_id"
            value={formState.ppdb_test_session_id}
            onChange={(e) => {
              const value = e.target.value;
              clearGlobalAlert();
              clearFieldError("ppdb_test_session_id");
              setFormState((prev) => ({
                ...prev,
                ppdb_test_session_id: value,
                ppdb_test_session_room_id: "",
              }));

              clearFieldError("ppdb_test_session_room_id");
            }}
            fullWidth
            required
            displayEmpty
            disabled={!hasPeriod}
            error={Boolean(fieldErrors.ppdb_test_session_id)}
            slotProps={{
              input: {
                "aria-label": "Pilih Sesi Tes",
                startAdornment: (
                  <InputAdornment position="start">
                    <IconShieldCheck />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="" disabled>
              {!hasPeriod
                ? "Pilih periode terlebih dahulu"
                : sessionLoading
                ? "Memuat sesi tes..."
                : "Pilih Sesi Tes"}
            </MenuItem>
            {sessionOptions.map((s) => {
              const title = s?.title || s?.nama || "-";
              const status = s?.status || "-";
              return (
                <MenuItem key={s.id} value={s.id}>
                  {title} ({upper(status)})
                </MenuItem>
              );
            })}
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.ppdb_test_session_id ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.ppdb_test_session_id || " "}
          </Typography>
        </Grid>

        {/* Sesi Ruangan */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_session_room_id" sx={{ mt: 1.85 }}>
            Sesi Ruangan
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_test_session_room_id"
            name="ppdb_test_session_room_id"
            value={formState.ppdb_test_session_room_id}
            onChange={(e) => {
              const value = e.target.value;
              clearGlobalAlert();
              clearFieldError("ppdb_test_session_room_id");
              setFormState((prev) => ({ ...prev, ppdb_test_session_room_id: value }));
            }}
            fullWidth
            required
            displayEmpty
            disabled={!hasPeriod || !hasSession}
            error={Boolean(fieldErrors.ppdb_test_session_room_id)}
            slotProps={{
              input: {
                "aria-label": "Pilih Sesi Ruangan",
                startAdornment: (
                  <InputAdornment position="start">
                    <IconDoorEnter />
                  </InputAdornment>
                ),
              },
            }}
          >
            <MenuItem value="" disabled>
              {!hasPeriod
                ? "Pilih periode terlebih dahulu"
                : !hasSession
                ? "Pilih sesi tes terlebih dahulu"
                : roomLoading
                ? "Memuat sesi ruangan..."
                : "Pilih Sesi Ruangan"}
            </MenuItem>
            {roomOptions.map((r) => {
              const label = r?.room_label || r?.label || r?.nama || "-";
              const mode = upper(r?.mode || r?.Session?.mode || "");
              const roomName = r?.Room?.nama || r?.room_nama || "";
              const finalLabel = roomName ? `${label} - ${roomName}` : label;
              return (
                <MenuItem key={r.id} value={r.id}>
                  {mode ? `${finalLabel} (${mode})` : finalLabel}
                </MenuItem>
              );
            })}
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.ppdb_test_session_room_id ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.ppdb_test_session_room_id || " "}
          </Typography>
        </Grid>

        {/* Pengawas Ruangan */}
<Grid size={{ xs: 12, md: 6 }}>
  <CustomFormLabel htmlFor="user_id" sx={{ mt: 1.85 }}>
    Pengawas Ruangan
  </CustomFormLabel>
  <CustomSelect
    id="user_id"
    name="user_id"
    value={formState.user_id}
    onChange={(e) => {
      const value = e.target.value;
      clearGlobalAlert();
      clearFieldError("user_id");
      setFormState((prev) => ({ ...prev, user_id: value }));
    }}
    fullWidth
    required
    displayEmpty
    disabled={!hasPeriod}
    error={Boolean(fieldErrors.user_id)}
    inputProps={{ "aria-label": "Pilih Pengawas Ruangan" }}
    startAdornment={
      <InputAdornment position="start">
        <IconUsers />
      </InputAdornment>
    }
    MenuProps={{
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "left",
      },
      PaperProps: {
        style: {
          maxHeight: 300,
          overflowY: "auto",
        },
      },
    }}
  >
    <MenuItem value="" disabled>
      {!hasPeriod
        ? "Pilih periode terlebih dahulu"
        : proctorLoading
        ? "Memuat pegawai..."
        : "Pilih Pengawas Ruangan"}
    </MenuItem>
    {proctorOptions.map((p) => {
      const nama = p?.nama || "-";
      const kategori = p?.kategori_slug || p?.kategori || "-";
      const email = p?.email || "-";
      return (
        <MenuItem key={p.user_id} value={p.user_id}>
          {nama} ({kategori}) - {email}
        </MenuItem>
      );
    })}
  </CustomSelect>
  <Typography
    variant="caption"
    sx={{
      display: "block",
      mt: 0.75,
      color: fieldErrors.user_id ? "error.main" : "transparent",
    }}
  >
    {fieldErrors.user_id || " "}
  </Typography>
</Grid>

        {/* Role */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="role" sx={{ mt: 1.85 }}>
            Role Pengawas
          </CustomFormLabel>

          <CustomSelect
            id="role"
            name="role"
            value={formState.role}
            onChange={(e) => {
              const { name, value } = e.target;
              clearGlobalAlert();
              clearFieldError(name);
              setFormState((prev) => ({ ...prev, [name]: value }));
            }}
            fullWidth
            required
            displayEmpty
            error={Boolean(fieldErrors.role)}
            slotProps={{
              input: { "aria-label": "Pilih Role Proctor" },
            }}
          >
            <MenuItem value="PROCTOR">Pengawas</MenuItem>
            <MenuItem value="ASSISTANT">Asisten</MenuItem>
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.role ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.role || " "}
          </Typography>
        </Grid>

        {/* Catatan */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.85 }}>
            <CustomFormLabel sx={{ m: 0 }}>Catatan</CustomFormLabel>
            <Tooltip
              title="Pengawas hanya bisa ditambahkan jika sesi belum Berjalan/Selesai/Dibatalkan. Jika user sudah pernah di-tambahkan pada room yang sama, sistem akan update"
              placement="top"
            >
              <IconButton size="small">
                <IconInfoCircle size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
            Pilih periode, lalu pilih Sesi tes, baru pilih sesi ruangan dan pegawai yang bertugas.
            Daftar pengawas hanya menampilkan pegawai yang sudah terdaftar sebagai <b>panitia aktif</b> pada periode terpilih.
            Sistem menolak perubahan jika sesi sudah berjalan/selesai/dibatalkan.
          </Typography>

          {selectedPeriod && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.75, opacity: 0.8 }}>
              Period terpilih: <b>{selectedPeriod.nama}</b> — {selectedPeriod.tahun_ajaran} ({upper(selectedPeriod.status)})
            </Typography>
          )}

          {selectedSession && (
            <Typography variant="caption" sx={{ display: "block", mt: 0.25, opacity: 0.8 }}>
              Sesi terpilih: <b>{selectedSession.title || selectedSession.nama || "-"}</b> ({upper(selectedSession.status)})
            </Typography>
          )}
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel} disabled={loading || mutation.isLoading}>
          Batal
        </CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbProctorForm;