import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, InputAdornment, MenuItem, Typography } from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBox, IconLink, IconListNumbers, IconDoor, IconToggleLeft } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

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

const safeStrOrNull = (val) => {
  const s = String(val ?? "").trim();
  return s.length ? s : null;
};

const safeMode = (val) => {
  const s = String(val || "").trim().toUpperCase();
  return s === "OFFLINE" || s === "ONLINE" ? s : "";
};

const AttachAndSanitizeNumber = (val) => {
  return String(val ?? "").replace(/[^\d]/g, "");
};

const TambahPpdbSesiRoomForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";
  const prefillSessionId = searchParams.get("ppdb_test_session_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    ppdb_test_session_id: prefillSessionId,
    mode: "OFFLINE",
    ppdb_test_room_id: "",
    room_label: "",
    online_url: "",
    capacity_override: "",
  });

  // ===================== Dropdown: Period =====================
  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
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
    },
    refetchOnWindowFocus: false,
  });

  // ===================== Dropdown: Test Session (by period) =====================
  const { data: sessionOptions = [] } = useQuery({
    queryKey: ["ppdbTestSessionOptions", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const q = formState.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-test-session${q}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows.map((s) => ({
        id: s.id,
        title: s.title,
        mode: s.mode,
        status: s.status,
        start_at: s.start_at,
        end_at: s.end_at,
        ppdb_test_component_id: s.ppdb_test_component_id,
        ppdb_wave_track_id: s.ppdb_wave_track_id,
      }));
    },
    refetchOnWindowFocus: false,
  });

  const selectedSession = useMemo(() => {
    if (!formState.ppdb_test_session_id) return null;
    return sessionOptions.find((s) => String(s.id) === String(formState.ppdb_test_session_id)) || null;
  }, [sessionOptions, formState.ppdb_test_session_id]);

  // ===================== Dropdown: Test Room (active only) =====================
  const { data: roomOptions = [] } = useQuery({
    queryKey: ["ppdbTestRoomOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-ruang-tes");
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows.map((r) => ({
        id: r.id,
        code: r.code,
        nama: r.nama,
        lokasi: r.lokasi,
        capacity: r.capacity,
      }));
    },
    refetchOnWindowFocus: false,
  });

  const modeUpper = safeMode(formState.mode);
  const isOnline = modeUpper === "ONLINE";
  const isOffline = modeUpper === "OFFLINE";

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!formState.ppdb_test_session_id) return false;
    if (isOffline) {
      if (!formState.ppdb_test_room_id) return false;
    }
    if (isOnline) {
      if (String(formState.ppdb_test_room_id || "").trim().length > 0) return false;
      if (!safeStrOrNull(formState.room_label)) return false;
    }
    if (String(formState.capacity_override || "").trim().length > 0) {
      const n = toIntOrNull(formState.capacity_override);
      if (n === null) return false;
      if (n < 1) return false;
    }
    return true;
  }, [formState, isOffline, isOnline]);

  const mutation = useMutation({
    mutationKey: ["tambahPpdbSesiRoom"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-sesi-room", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Sesi ruangan berhasil ditambahkan");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["ppdb-test-session-room"] });

      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/ppdb-sesi-room");
      }, 400);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan Sesi ruangan";
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "capacity_override") {
      const cleaned = AttachAndSanitizeNumber(value);
      setFormState((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === "ppdb_period_id") {
      setFormState((prev) => ({
        ...prev,
        ppdb_period_id: value,
        ppdb_test_session_id: "",
        mode: "OFFLINE",
        ppdb_test_room_id: "",
        room_label: "",
        online_url: "",
        capacity_override: "",
      }));
      return;
    }

    if (name === "ppdb_test_session_id") {
      setFormState((prev) => ({
        ...prev,
        ppdb_test_session_id: value,
      }));
      return;
    }

    if (name === "mode") {
      const m = safeMode(value) || "OFFLINE";
      setFormState((prev) => ({
        ...prev,
        mode: m,
        ppdb_test_room_id: m === "ONLINE" ? "" : prev.ppdb_test_room_id,
        room_label: m === "OFFLINE" ? prev.room_label : prev.room_label,
        online_url: m === "OFFLINE" ? "" : prev.online_url,
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError("Periode PMB wajib dipilih");
      setSuccess("");
      return;
    }

    if (!formState.ppdb_test_session_id) {
      setError("Sesi tes wajib dipilih");
      setSuccess("");
      return;
    }

    const m = safeMode(formState.mode);
    if (!m) {
      setError("Mode wajib diisi");
      setSuccess("");
      return;
    }

    if (m === "OFFLINE") {
      if (!formState.ppdb_test_room_id) {
        setError("Mode OFFLINE wajib memilih Ruang Tes");
        setSuccess("");
        return;
      }
    }

    if (m === "ONLINE") {
      if (String(formState.ppdb_test_room_id || "").trim().length > 0) {
        setError("Mode ONLINE tidak boleh memilih Ruang Tes");
        setSuccess("");
        return;
      }
      if (!safeStrOrNull(formState.room_label)) {
        setError("Mode ONLINE wajib mengisi label ruangan");
        setSuccess("");
        return;
      }
    }

    const cap = toIntOrNull(formState.capacity_override);
    if (String(formState.capacity_override || "").trim().length > 0) {
      if (cap === null) {
        setError("Kapasitas ruangan harus berupa angka");
        setSuccess("");
        return;
      }
      if (cap < 1) {
        setError("Kapasitas ruangan minimal 1");
        setSuccess("");
        return;
      }
    }

    setLoading(true);

    const payload = {
      ppdb_test_session_id: formState.ppdb_test_session_id,
      mode: m,

      ppdb_test_room_id: m === "OFFLINE" ? formState.ppdb_test_room_id : null,
      room_label: m === "ONLINE" ? safeStrOrNull(formState.room_label) : safeStrOrNull(formState.room_label),
      online_url: m === "ONLINE" ? safeStrOrNull(formState.online_url) : null,
      capacity_override: String(formState.capacity_override || "").trim().length > 0 ? cap : null,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
            Periode PMB
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_period_id"
            name="ppdb_period_id"
            value={formState.ppdb_period_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Periode PMB" }}
            startAdornment={
              <InputAdornment position="start">
                <IconBox />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Periode PMB
            </MenuItem>
            {periodOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nama} — {p.tahun_ajaran} ({String(p.status || "").toUpperCase()})
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_session_id" sx={{ mt: 1.85 }}>
            Sesi Tes
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_test_session_id"
            name="ppdb_test_session_id"
            value={formState.ppdb_test_session_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={!formState.ppdb_period_id}
            inputProps={{ "aria-label": "Pilih Sesi Tes" }}
            startAdornment={
              <InputAdornment position="start">
                <IconBox />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Sesi Tes
            </MenuItem>
            {sessionOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.title} — {String(s.mode || "").toUpperCase()} ({String(s.status || "").toUpperCase()})
              </MenuItem>
            ))}
          </CustomSelect>

          {selectedSession ? (
            <Typography sx={{ fontSize: "0.9rem", opacity: 0.8, mt: 0.75 }}>
              Sesi terpilih: {String(selectedSession.mode || "").toUpperCase()} • {String(selectedSession.status || "").toUpperCase()}
            </Typography>
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="mode" sx={{ mt: 1.85 }}>
            Mode
          </CustomFormLabel>
          <CustomSelect
            id="mode"
            name="mode"
            value={formState.mode}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Mode" }}
            startAdornment={
              <InputAdornment position="start">
                <IconToggleLeft />
              </InputAdornment>
            }
          >
            <MenuItem value="OFFLINE">OFFLINE</MenuItem>
            <MenuItem value="ONLINE">ONLINE</MenuItem>
          </CustomSelect>

          <Typography sx={{ fontSize: "0.9rem", opacity: 0.8, mt: 0.75 }}>
            OFFLINE wajib pilih Ruang Tes. ONLINE wajib isi label ruangan dan Ruang Tes harus kosong
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_room_id" sx={{ mt: 1.85 }}>
            Ruang Tes (OFFLINE)
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_test_room_id"
            name="ppdb_test_room_id"
            value={formState.ppdb_test_room_id}
            onChange={handleChange}
            fullWidth
            displayEmpty
            disabled={!isOffline}
            inputProps={{ "aria-label": "Pilih Ruang Tes" }}
            startAdornment={
              <InputAdornment position="start">
                <IconDoor />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              {isOffline ? "Pilih Ruang Tes" : "Hanya untuk OFFLINE"}
            </MenuItem>
            {roomOptions.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.code} — {r.nama} {r.lokasi ? `(${r.lokasi})` : ""} • Kap: {String(r.capacity)}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="room_label" sx={{ mt: 1.85 }}>
            Label Ruangan {isOnline ? "(Wajib untuk ONLINE)" : "(Opsional)"}
          </CustomFormLabel>
          <CustomOutlinedInput
            id="room_label"
            name="room_label"
            value={formState.room_label}
            onChange={handleChange}
            placeholder={isOnline ? "Contoh: Zoom Room A / Google Meet 1" : "Contoh: Ruang 1 / Lab IPA"}
            startAdornment={
              <InputAdornment position="start">
                <IconBox />
              </InputAdornment>
            }
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="online_url" sx={{ mt: 1.85 }}>
            Online URL (ONLINE - opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="online_url"
            name="online_url"
            value={formState.online_url}
            onChange={handleChange}
            placeholder="Contoh: https://meet.google.com/xxx-xxxx-xxx"
            startAdornment={
              <InputAdornment position="start">
                <IconLink />
              </InputAdornment>
            }
            fullWidth
            disabled={!isOnline}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="capacity_override" sx={{ mt: 1.85 }}>
            Kapasitas Ruangan Digunakan (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="capacity_override"
            name="capacity_override"
            value={formState.capacity_override}
            onChange={handleChange}
            placeholder="Contoh: 30"
            startAdornment={
              <InputAdornment position="start">
                <IconListNumbers />
              </InputAdornment>
            }
            fullWidth
            inputMode="numeric"
          />
          <Typography sx={{ fontSize: "0.9rem", opacity: 0.8, mt: 0.75 }}>
            Dipakai untuk menimpa kapasitas ruangan tes (OFFLINE) atau kapasitas ruangan online.
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbSesiRoomForm;