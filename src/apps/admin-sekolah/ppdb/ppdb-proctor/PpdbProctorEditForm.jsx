import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Chip,
  Typography,
} from "@mui/material";
import {
  IconUser,
  IconSchool,
  IconDoor,
  IconCalendarTime,
  IconShieldCheck,
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const safeStr = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));

const formatDateTime = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
};

const isSessionLocked = (status) => {
  const s = String(status || "").toUpperCase();
  return ["ONGOING", "FINISHED", "CANCELLED"].includes(s);
};

const getSessionStatusChipProps = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "SCHEDULED") return { label: "SCHEDULED", color: "info" };
  if (s === "ONGOING") return { label: "ONGOING", color: "warning" };
  if (s === "FINISHED") return { label: "FINISHED", color: "success" };
  if (s === "CANCELLED") return { label: "CANCELLED", color: "error" };
  return { label: s || "-", color: "default" };
};

const getRoleChipProps = (role) => {
  const r = String(role || "").toUpperCase();
  if (r === "PROCTOR") return { label: "PROCTOR", color: "primary" };
  if (r === "ASSISTANT") return { label: "ASSISTANT", color: "info" };
  return { label: "-", color: "default" };
};

const getModeChipProps = (mode) => {
  const m = String(mode || "").toUpperCase();
  if (m === "ONLINE") return { label: "ONLINE", color: "success" };
  if (m === "OFFLINE") return { label: "OFFLINE", color: "default" };
  if (m === "HYBRID") return { label: "HYBRID", color: "warning" };
  return { label: m || "-", color: "default" };
};

const READONLY_CHIP_FRAME_SX = {
  height: "46px",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  px: 1.5,
  display: "flex",
  alignItems: "center",
  gap: 1,
  backgroundColor: "transparent",
};

const PpdbProctorEditForm = ({
  proctorData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const sessionTitle = proctorData?.SessionRoom?.Session?.title || "-";
  const sessionStatus = proctorData?.SessionRoom?.Session?.status || "-";
  const startAt = proctorData?.SessionRoom?.Session?.start_at || null;
  const endAt = proctorData?.SessionRoom?.Session?.end_at || null;

  const roomLabel =
    proctorData?.SessionRoom?.room_label ||
    proctorData?.SessionRoom?.Room?.nama ||
    "-";

  const roomMode =
    proctorData?.SessionRoom?.mode ||
    proctorData?.SessionRoom?.Session?.mode ||
    "-";

  const proctorName = proctorData?.User?.name || "-";

  const locked = isSessionLocked(sessionStatus);
  const statusChip = getSessionStatusChipProps(sessionStatus);
  const roleChip = getRoleChipProps(proctorData?.role);
  const modeChip = getModeChipProps(roomMode);

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
          <CustomFormLabel sx={{ mt: 1.85 }}>Pengawas Ruangan</CustomFormLabel>
          <CustomOutlinedInput
            name="proctor_name"
            value={safeStr(proctorName)}
            fullWidth
            readOnly
            startAdornment={
              <InputAdornment position="start">
                <IconUser />
              </InputAdornment>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Ruangan</CustomFormLabel>
          <CustomOutlinedInput
            name="room_label"
            value={safeStr(roomLabel)}
            fullWidth
            readOnly
            startAdornment={
              <InputAdornment position="start">
                <IconDoor />
              </InputAdornment>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Sesi Tes</CustomFormLabel>
          <CustomOutlinedInput
            name="session_title"
            value={safeStr(sessionTitle)}
            fullWidth
            readOnly
            startAdornment={
              <InputAdornment position="start">
                <IconSchool />
              </InputAdornment>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Jadwal Sesi</CustomFormLabel>
          <CustomOutlinedInput
            name="session_time"
            value={
              startAt || endAt
                ? `${formatDateTime(startAt)} - ${formatDateTime(endAt)}`
                : "-"
            }
            fullWidth
            readOnly
            startAdornment={
              <InputAdornment position="start">
                <IconCalendarTime />
              </InputAdornment>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Mode</CustomFormLabel>
          <Box sx={READONLY_CHIP_FRAME_SX}>
            <Chip size="small" {...modeChip} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Status Session</CustomFormLabel>
          <Box sx={READONLY_CHIP_FRAME_SX}>
            <Chip size="small" {...statusChip} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>Role Pengawas</CustomFormLabel>
          <CustomSelect
            name="role"
            value={proctorData?.role || "PROCTOR"}
            onChange={handleChange}
            fullWidth
            disabled={locked}
            startAdornment={
              <InputAdornment position="start">
                <IconShieldCheck />
              </InputAdornment>
            }
          >
            <MenuItem value="PROCTOR">Pengawas</MenuItem>
            <MenuItem value="ASSISTANT">Asisten</MenuItem>
          </CustomSelect>

          {locked ? (
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.8, mt: 0.75 }}>
              Sesi sudah <b>{safeStr(sessionStatus)}</b>. Role proctor tidak bisa diubah.
            </Typography>
          ) : null}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>Role Saat Ini</CustomFormLabel>
          <Box sx={READONLY_CHIP_FRAME_SX}>
            <Chip size="small" {...roleChip} />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton disabled={locked}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PpdbProctorEditForm;