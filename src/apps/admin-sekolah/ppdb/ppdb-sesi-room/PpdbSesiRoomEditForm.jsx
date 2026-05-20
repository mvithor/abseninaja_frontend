import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import {
  IconDeviceDesktop,
  IconWorld,
  IconListNumbers,
  IconLink,
  IconDoor,
  IconFileText,
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
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

const normalizeMode = (val) => String(val || "").trim().toUpperCase();

const PpdbSesiRoomEditForm = ({
  formState,
  sessionRoomData,
  roomOptions,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const modeUpper = normalizeMode(formState?.mode || sessionRoomData?.mode);
  const isOffline = modeUpper === "OFFLINE";
  const isOnline = modeUpper === "ONLINE";

  const participantCount = Number(sessionRoomData?.participant_count || 0);

  const sessionLabel = useMemo(() => {
    const s = sessionRoomData?.Session;
    if (!s) return "-";
    const title = s?.title || "-";
    const mode = String(s?.mode || "-").toUpperCase();
    const status = String(s?.status || "-").toUpperCase();
    return `${title} (${mode} • ${status})`;
  }, [sessionRoomData]);

  const canSubmit = useMemo(() => {
    if (!modeUpper) return false;
    if (modeUpper !== "OFFLINE" && modeUpper !== "ONLINE") return false;

    if (isOffline) {
      if (!formState?.ppdb_test_room_id) return false;
    }

    if (isOnline) {
      const label = String(formState?.room_label || "").trim();
      if (!label) return false;
      if (String(formState?.ppdb_test_room_id || "").trim()) return false;
    }

    const coRaw = String(formState?.capacity_override ?? "").trim();
    if (coRaw.length > 0) {
      const co = toIntOrNull(coRaw);
      if (co === null) return false;
      if (co < 1) return false;
      if (participantCount > 0 && co < participantCount) return false;
    }

    const url = String(formState?.online_url || "").trim();
    if (url && !/^https?:\/\/.+/i.test(url)) return false;

    return true;
  }, [formState, modeUpper, isOffline, isOnline, participantCount]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" height={40}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Sesi Tes</CustomFormLabel>
          <CustomOutlinedInput
            name="session_display"
            value={sessionLabel}
            fullWidth
            readOnly
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Typography sx={{ fontSize: "0.9rem", opacity: 0.8 }}>
              Peserta terdaftar di sesi ini:
            </Typography>
            <Chip size="small" label={String(participantCount)} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="online_url" sx={{ mt: 1.85 }}>
            Online URL (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="online_url"
            name="online_url"
            value={formState?.online_url ?? ""}
            onChange={handleChange}
            placeholder="Contoh: https://meet.google.com/xxx-yyy-zzz"
            startAdornment={
              <InputAdornment position="start">
                <IconLink />
              </InputAdornment>
            }
            fullWidth
            disabled={isOffline} 
          />
          {isOffline && (
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.75, mt: 0.75 }}>
              Mode OFFLINE: online_url akan dikosongkan otomatis.
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="mode" sx={{ mt: 1.85 }}>
            Mode Sesi Ruangan
          </CustomFormLabel>
          <CustomSelect
            id="mode"
            name="mode"
            value={formState?.mode || ""}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Mode" }}
            startAdornment={
              <InputAdornment position="start">
                {isOffline ? <IconDeviceDesktop /> : <IconWorld />}
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Mode
            </MenuItem>
            <MenuItem value="OFFLINE">OFFLINE</MenuItem>
            <MenuItem value="ONLINE">ONLINE</MenuItem>
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="capacity_override" sx={{ mt: 1.85 }}>
            Kapasitas Sesi Ruangan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="capacity_override"
            name="capacity_override"
            value={formState?.capacity_override ?? ""}
            onChange={handleChange}
            placeholder={participantCount > 0 ? `Minimal ${participantCount}` : "Contoh: 30"}
            startAdornment={
              <InputAdornment position="start">
                <IconListNumbers />
              </InputAdornment>
            }
            fullWidth
            inputMode="numeric"
          />
          {participantCount > 0 && (
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.75, mt: 0.75 }}>
              Tidak boleh lebih kecil dari jumlah peserta terdaftar ({participantCount}).
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_room_id" sx={{ mt: 1.85 }}>
            Ruang Tes (OFFLINE)
          </CustomFormLabel>

          <CustomSelect
            id="ppdb_test_room_id"
            name="ppdb_test_room_id"
            value={formState?.ppdb_test_room_id || ""}
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
              {isOffline ? "Pilih Ruang Tes" : "Nonaktif (Mode ONLINE)"}
            </MenuItem>

            {roomOptions.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.code ? `${r.code} — ` : ""}
                {r.nama} {r.lokasi ? `(${r.lokasi})` : ""} — Kapasitas: {String(r.capacity)}
              </MenuItem>
            ))}
          </CustomSelect>

          {!isOffline && (
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.75, mt: 0.75 }}>
              Mode ONLINE tidak boleh memilih ruang tes.
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="room_label" sx={{ mt: 1.85 }}>
            Label Ruangan {isOnline ? "(Wajib - ONLINE)" : "(Opsional)"}
          </CustomFormLabel>
          <CustomOutlinedInput
            id="room_label"
            name="room_label"
            value={formState?.room_label ?? ""}
            onChange={handleChange}
            placeholder={isOnline ? "Contoh: Ruang Online 1" : "Contoh: Ruang 1 (opsional)"}
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton disabled={!canSubmit}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PpdbSesiRoomEditForm;