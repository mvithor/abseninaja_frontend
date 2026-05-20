import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Stack,
  Checkbox,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import {
  IconCalendarEvent,
  IconDoor,
  IconListNumbers,
  IconSearch,
  IconSwitch,
  IconRefresh,
  IconQrcode,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const safeText = (val) => {
  const s = String(val ?? "").trim();
  return s.length > 0 ? s : null;
};

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

const toMetaCode = (error) => {
  const meta = error?.response?.data?.meta || {};
  return (
    meta?.code ||
    meta?.error_code ||
    error?.response?.data?.code ||
    error?.response?.data?.error_code ||
    null
  );
};

const toApiMsg = (error) => {
  const msg = error?.response?.data?.msg;
  return msg ? String(msg) : "Terjadi kesalahan";
};

const toApiErrors = (error) => {
  const errs = error?.response?.data?.errors;
  return Array.isArray(errs) ? errs : [];
};

// ===================== SESSION ROOM LABEL HELPERS (NEW) =====================
const upper = (v) => String(v || "").trim().toUpperCase();

const getSessionRoomLabel = (r) => {
  // ✅ backend sudah kirim "label" final (ONLINE/OFFLINE)
  const label = safeText(r?.label);

  // fallback aman (kalau API lama)
  const mode = upper(r?.mode);
  if (label) return label;

  if (mode === "ONLINE") {
    return safeText(r?.room_label) || safeText(r?.online_url) || "Online";
  }

  // OFFLINE fallback
  const code = safeText(r?.Room?.code);
  const nama = safeText(r?.Room?.nama) || safeText(r?.room_label) || "Ruang";
  const lokasi = safeText(r?.Room?.lokasi);

  return `${code ? `${code} · ` : ""}${nama}${lokasi ? ` (${lokasi})` : ""}`;
};

const getSessionRoomSubLabel = (r) => {
  const mode = upper(r?.mode);

  if (mode === "ONLINE") {
    const url = safeText(r?.online_url);
    return url ? url : "Mode Online";
  }

  const capOverride = r?.capacity_override;
  const capMaster = r?.Room?.capacity;

  const cap =
    typeof capOverride === "number"
      ? capOverride
      : typeof capMaster === "number"
        ? capMaster
        : null;

  return cap === null ? "Kapasitas: ∞" : `Kapasitas: ${cap}`;
};

/**
 * Form Assign Peserta Tes
 * Endpoint:
 * - GET /api/v1/admin-sekolah/ppdb-test-participants/assign-context
 * - GET /api/v1/admin-sekolah/ppdb-test-participants/eligible-enrollments
 * - POST /api/v1/admin-sekolah/ppdb-test-participants/assign
 *
 * UX concurrency minimum:
 * - kalau 409 + meta code CAPACITY_FULL / SEAT_COLLISION_RETRY -> pesan spesifik + arahkan refresh context
 */
const AssignPpdbTestParticipantForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillSessionId = searchParams.get("ppdb_test_session_id") || "";
  const prefillSessionRoomId =
    searchParams.get("ppdb_test_session_room_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_test_session_id: prefillSessionId,
    ppdb_test_session_room_id: prefillSessionRoomId,
    q: "",
    ppdb_test_enrollment_ids: [],
    auto_seat: false,
    generate_qr: true,
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // ===================== DROPDOWNS (OPTIONAL) =====================
  const { data: sessionOptions = [] } = useQuery({
    queryKey: ["ppdbTestSessionOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/v1/admin-sekolah/dropdown/ppdb-test-session-participants"
      );
      return response.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: sessionRoomOptions = [] } = useQuery({
    queryKey: ["ppdbTestSessionRoomOptions", formState.ppdb_test_session_id],
    enabled: Boolean(formState.ppdb_test_session_id),
    queryFn: async () => {
      const q = formState.ppdb_test_session_id
        ? `?ppdb_test_session_id=${encodeURIComponent(
            formState.ppdb_test_session_id
          )}`
        : "";
      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/dropdown/ppdb-test-session-rooms${q}`
      );
      return response.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  // ===================== ASSIGN CONTEXT =====================
  const canLoadContext = useMemo(() => {
    return Boolean(
      formState.ppdb_test_session_id && formState.ppdb_test_session_room_id
    );
  }, [formState.ppdb_test_session_id, formState.ppdb_test_session_room_id]);

  const {
    data: assignContext,
    refetch: refetchAssignContext,
    isFetching: isFetchingContext,
  } = useQuery({
    queryKey: [
      "ppdbTestAssignContext",
      formState.ppdb_test_session_id,
      formState.ppdb_test_session_room_id,
    ],
    enabled: canLoadContext,
    queryFn: async () => {
      const q = `?ppdb_test_session_id=${encodeURIComponent(
        formState.ppdb_test_session_id
      )}&ppdb_test_session_room_id=${encodeURIComponent(
        formState.ppdb_test_session_room_id
      )}`;
      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/ppdb-participants/assign-context${q}`
      );
      return response.data?.data || null;
    },
    refetchOnWindowFocus: false,
  });

  // ===================== ELIGIBLE ENROLLMENTS =====================
  const canLoadEligible = useMemo(() => {
    return Boolean(formState.ppdb_test_session_id);
  }, [formState.ppdb_test_session_id]);

  const {
    data: eligibleEnrollmentsResp,
    refetch: refetchEligible,
    isFetching: isFetchingEligible,
  } = useQuery({
    queryKey: [
      "ppdbTestEligibleEnrollments",
      formState.ppdb_test_session_id,
      safeText(formState.q) || "",
    ],
    enabled: canLoadEligible,
    queryFn: async () => {
      const q = safeText(formState.q);
      const qs = [
        `ppdb_test_session_id=${encodeURIComponent(
          formState.ppdb_test_session_id
        )}`,
        q ? `q=${encodeURIComponent(q)}` : null,
        `page=1`,
        `limit=200`,
      ].filter(Boolean);

      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/ppdb-participants/eligible-enrollments?${qs.join(
          "&"
        )}`
      );
      return response.data || {};
    },
    refetchOnWindowFocus: false,
  });

  const eligibleEnrollments = useMemo(() => {
    const rows = eligibleEnrollmentsResp?.data;
    return Array.isArray(rows) ? rows : [];
  }, [eligibleEnrollmentsResp]);

  const selectedCount = formState.ppdb_test_enrollment_ids.length;

  // ===================== VALIDATION =====================
  const canSubmit = useMemo(() => {
    if (!formState.ppdb_test_session_id) return false;
    if (!formState.ppdb_test_session_room_id) return false;
    if (!Array.isArray(formState.ppdb_test_enrollment_ids)) return false;
    if (formState.ppdb_test_enrollment_ids.length < 1) return false;

    // kalau context ada, boleh lebih ketat: jangan submit kalau can_assign false
    if (assignContext && assignContext?.can_assign === false) return false;

    return true;
  }, [formState, assignContext]);

  // ===================== MUTATION =====================
  const mutation = useMutation({
    mutationKey: ["assignPpdbTestParticipants"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        "/api/v1/admin-sekolah/ppdb-participants/assign",
        payload
      );
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Peserta tes berhasil di-assign");
      setError("");

      await queryClient.invalidateQueries({
        queryKey: ["ppdb-test-participants"],
      });

      // context berubah (assigned_count)
      if (canLoadContext) {
        try {
          await refetchAssignContext();
        } catch {
          // ignore
        }
      }

      // eligible berubah (participant_id jadi terisi)
      if (canLoadEligible) {
        try {
          await refetchEligible();
        } catch {
          // ignore
        }
      }

      // reset pilihan
      emitChange("ppdb_test_enrollment_ids", []);

      setTimeout(() => {
        navigate(-1);
      }, 300);
    },
    onError: async (error) => {
      const metaCode = toMetaCode(error);
      const apiErrors = toApiErrors(error);
      const apiMsg = toApiMsg(error);

      // CONCURRENCY UX: tampilkan pesan spesifik + arahkan refresh context
      if (String(error?.response?.status) === "409") {
        if (metaCode === "CAPACITY_FULL") {
          setError(
            "Kapasitas ruangan sudah penuh. Refresh context dulu untuk melihat sisa kursi terbaru."
          );
          setSuccess("");
          try {
            if (canLoadContext) await refetchAssignContext();
          } catch {
            // ignore
          }
          setTimeout(() => setError(""), 3500);
          return;
        }

        if (metaCode === "SEAT_COLLISION_RETRY") {
          setError(
            "Terjadi konflik nomor kursi (dua admin assign bersamaan). Silakan refresh context lalu coba lagi."
          );
          setSuccess("");
          try {
            if (canLoadContext) await refetchAssignContext();
          } catch {
            // ignore
          }
          setTimeout(() => setError(""), 3500);
          return;
        }

        // fallback 409
        setError(apiMsg || "Gagal assign (konflik data). Refresh context lalu coba lagi.");
        setSuccess("");
        try {
          if (canLoadContext) await refetchAssignContext();
        } catch {
          // ignore
        }
        setTimeout(() => setError(""), 3500);
        return;
      }

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setError(apiErrors.join(", "));
      } else {
        setError(apiMsg);
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // ===================== HANDLERS =====================
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "ppdb_test_session_id") {
      emitChange("ppdb_test_session_id", value);
      // reset room + selections saat ganti session
      emitChange("ppdb_test_session_room_id", "");
      emitChange("ppdb_test_enrollment_ids", []);
      return;
    }

    if (name === "ppdb_test_session_room_id") {
      emitChange("ppdb_test_session_room_id", value);
      // optional: tetap pertahankan selected enrollments, tapi context harus update
      return;
    }

    if (name === "ppdb_test_enrollment_ids") {
      emitChange("ppdb_test_enrollment_ids", uniq(value));
      return;
    }

    emitChange(name, value);
  };

  const handleToggleSelectAll = () => {
    const allIds = eligibleEnrollments.map((r) => r.id);
    const isAllSelected =
      formState.ppdb_test_enrollment_ids.length > 0 &&
      formState.ppdb_test_enrollment_ids.length === allIds.length;

    emitChange("ppdb_test_enrollment_ids", isAllSelected ? [] : uniq(allIds));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Form belum valid");
      setSuccess("");
      return;
    }

    setLoading(true);

    const payload = {
      ppdb_test_session_id: formState.ppdb_test_session_id,
      ppdb_test_session_room_id: formState.ppdb_test_session_room_id,
      ppdb_test_enrollment_ids: formState.ppdb_test_enrollment_ids,
      auto_seat: Boolean(formState.auto_seat),
      generate_qr: Boolean(formState.generate_qr),
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleRefreshContext = async () => {
    try {
      if (canLoadContext) await refetchAssignContext();
      if (canLoadEligible) await refetchEligible();
      await queryClient.invalidateQueries({ queryKey: ["ppdb-test-participants"] });
      setSuccess("Context berhasil di-refresh");
      setError("");
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      console.error("Refresh context failed:", err);
      setError("Gagal refresh context");
      setSuccess("");
      setTimeout(() => setError(""), 2500);
    }
  };

  // ===================== DERIVED UI =====================
  const cap = assignContext?.capacity ?? null;
  const assigned = Number(assignContext?.assigned_count ?? 0);
  const available = assignContext?.available_seats ?? null;

  const canAssign = assignContext?.can_assign !== false;

  const selectedChips = useMemo(() => {
    if (!selectedCount) return null;

    // Tampilkan chips ringkas (biar nggak berat)
    const map = new Map(
      eligibleEnrollments.map((r) => [
        r.id,
        {
          kode: r?.Application?.kode_pendaftaran || "-",
          nama: r?.Application?.nama_calon_peserta_didik || "-",
          nisn: r?.Application?.nisn || "-",
        },
      ])
    );

    const show = formState.ppdb_test_enrollment_ids.slice(0, 6).map((id) => {
      const row = map.get(id);
      const label = row ? `${row.nama} — ${row.kode}` : String(id);
      return <Chip key={id} label={label} size="small" />;
    });

    const rest = selectedCount - show.length;

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {show}
        {rest > 0 ? <Chip label={`+${rest} lagi`} size="small" /> : null}
      </Stack>
    );
  }, [eligibleEnrollments, formState.ppdb_test_enrollment_ids, selectedCount]);

  // ✅ label yang tampil di input select (bukan uuid)
  const selectedRoomLabel = useMemo(() => {
    const id = formState.ppdb_test_session_room_id;
    if (!id) return "Pilih Room";
    const r = sessionRoomOptions.find((x) => String(x.id) === String(id));
    return r ? getSessionRoomLabel(r) : "Pilih Room";
  }, [formState.ppdb_test_session_room_id, sessionRoomOptions]);

  // ===================== RENDER =====================
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        {/* SESSION */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Test Session</CustomFormLabel>
          <CustomSelect
            name="ppdb_test_session_id"
            value={formState.ppdb_test_session_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <IconCalendarEvent />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Session
            </MenuItem>
            {sessionOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.title || s.nama || s.id}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        {/* SESSION ROOM */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Session Room</CustomFormLabel>
          <CustomSelect
            name="ppdb_test_session_room_id"
            value={formState.ppdb_test_session_room_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={!formState.ppdb_test_session_id}
            startAdornment={
              <InputAdornment position="start">
                <IconDoor />
              </InputAdornment>
            }
            renderValue={() => selectedRoomLabel}
          >
            <MenuItem value="" disabled>
              Pilih Room
            </MenuItem>

            {sessionRoomOptions.map((r) => {
              const label = getSessionRoomLabel(r);
              const mode = upper(r?.mode);
              const sub = getSessionRoomSubLabel(r);

              return (
                <MenuItem key={r.id} value={r.id}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                        <Chip
                          size="small"
                          label={mode || "OFFLINE"}
                          color={mode === "ONLINE" ? "info" : "default"}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={sub}
                  />
                </MenuItem>
              );
            })}
          </CustomSelect>
        </Grid>

        {/* CONTEXT SUMMARY */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              mt: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Context Assign
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={cap === null ? "Kapasitas: ∞" : `Kapasitas: ${cap}`}
                  />
                  <Chip size="small" label={`Terisi: ${assigned}`} />
                  <Chip
                    size="small"
                    label={
                      cap === null
                        ? "Sisa: ∞"
                        : `Sisa: ${
                            typeof available === "number"
                              ? available
                              : Math.max((cap || 0) - assigned, 0)
                          }`
                    }
                  />
                  <Chip
                    size="small"
                    color={canAssign ? "success" : "warning"}
                    label={canAssign ? "Bisa assign" : "Tidak bisa assign"}
                  />
                </Stack>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={handleRefreshContext}
                startIcon={<IconRefresh />}
                disabled={
                  loading ||
                  mutation.isLoading ||
                  isFetchingContext ||
                  isFetchingEligible
                }
              >
                Refresh
              </Button>
            </Box>

            {!canAssign ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Assign dibatasi oleh status session. Ubah status session ke
                  DRAFT/PUBLISHED jika ingin assign.
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Grid>

        {/* SEARCH */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Cari Peserta (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            name="q"
            value={formState.q}
            onChange={handleChange}
            placeholder="Cari nama / kode pendaftaran / NISN"
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <IconSearch />
              </InputAdornment>
            }
          />
        </Grid>

        {/* STRATEGY SWITCHES */}
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Auto Seat</CustomFormLabel>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "46px",
              px: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={Boolean(formState.auto_seat)}
                  onChange={(e) => emitChange("auto_seat", e.target.checked)}
                  icon={<IconSwitch />}
                />
              }
              label={formState?.auto_seat ? "ON" : "OFF"}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Generate QR</CustomFormLabel>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "46px",
              px: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={Boolean(formState.generate_qr)}
                  onChange={(e) => emitChange("generate_qr", e.target.checked)}
                  icon={<IconQrcode />}
                />
              }
              label={formState?.generate_qr ? "ON" : "OFF"}
            />
          </Box>
        </Grid>

        {/* ENROLLMENTS MULTISELECT */}
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>
            Pilih Peserta (Eligible Enrollments)
          </CustomFormLabel>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {isFetchingEligible
                ? "Memuat data eligible..."
                : `Tersedia: ${eligibleEnrollments.length} • Dipilih: ${selectedCount}`}
            </Typography>

            <Button
              variant="text"
              size="small"
              onClick={handleToggleSelectAll}
              disabled={!eligibleEnrollments.length}
              startIcon={<IconListNumbers />}
            >
              {selectedCount === eligibleEnrollments.length &&
              eligibleEnrollments.length > 0
                ? "Unselect all"
                : "Select all"}
            </Button>
          </Box>

          <CustomSelect
            multiple
            name="ppdb_test_enrollment_ids"
            value={formState.ppdb_test_enrollment_ids}
            onChange={handleChange}
            fullWidth
            displayEmpty
            renderValue={(selected) => {
              const n = Array.isArray(selected) ? selected.length : 0;
              return n > 0 ? `${n} peserta dipilih` : "Pilih peserta";
            }}
          >
            <MenuItem value="" disabled>
              Pilih peserta
            </MenuItem>

            {eligibleEnrollments.map((r) => {
              const app = r?.Application || {};
              const label = `${app?.nama_calon_peserta_didik || "-"} — ${
                app?.kode_pendaftaran || "-"
              } — ${app?.nisn || "-"}`;

              const checked = formState.ppdb_test_enrollment_ids.includes(r.id);

              return (
                <MenuItem key={r.id} value={r.id}>
                  <Checkbox checked={checked} />
                  <ListItemText primary={label} />
                </MenuItem>
              );
            })}
          </CustomSelect>

          {selectedChips ? <Box sx={{ mt: 1 }}>{selectedChips}</Box> : null}

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Catatan: jika dua admin assign bersamaan, bisa terjadi konflik
              seat/kapasitas dan backend akan balas 409. Kalau itu terjadi, klik{" "}
              <b>Refresh</b> lalu coba lagi.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default AssignPpdbTestParticipantForm;