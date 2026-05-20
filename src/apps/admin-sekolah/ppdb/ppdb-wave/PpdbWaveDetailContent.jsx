import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  Typography,
  Button
} from "@mui/material";
import {
  IconFileText,
  IconCalendarTime,
  IconBox,
  IconListNumbers,
  IconUser
} from "@tabler/icons-react";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import dayjs from "dayjs";

const formatDateTimeLabel = (val) => {
  if (!val) return "-";
  const d = dayjs(val);
  if (!d.isValid()) return "-";
  return d.format("DD MMM YYYY HH:mm");
};

const toLabelOrDash = (val) => {
  if (val === undefined || val === null) return "-";
  const s = String(val).trim();
  return s ? s : "-";
};

const PpdbWaveDetailContent = ({
  waveData,
  onOpenClick,
  onCloseClick,
  onBack,
  isActionLoading
}) => {
  const status = String(waveData?.status || "").toUpperCase();
  const canOpen = status === "DRAFT";
  const canClose = status === "OPEN";

  const periodNama = toLabelOrDash(waveData?.PpdbPeriod?.nama);
  const periodStatus = String(waveData?.PpdbPeriod?.status || "").toUpperCase();
  const periodStatusLabel = periodStatus ? ` (${periodStatus})` : "";

  return (
    <Box sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Periode PMB</CustomFormLabel>
          <CustomOutlinedInput
            value={`${periodNama}${periodStatusLabel}`}
            startAdornment={
              <InputAdornment position="start">
                <IconBox />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Nama Gelombang</CustomFormLabel>
          <CustomOutlinedInput
            value={toLabelOrDash(waveData?.nama)}
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Buka</CustomFormLabel>
          <CustomOutlinedInput
            value={formatDateTimeLabel(waveData?.open_at)}
            startAdornment={
              <InputAdornment position="start">
                <IconCalendarTime />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Tutup</CustomFormLabel>
          <CustomOutlinedInput
            value={formatDateTimeLabel(waveData?.close_at)}
            startAdornment={
              <InputAdornment position="start">
                <IconCalendarTime />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Kuota Global</CustomFormLabel>
          <CustomOutlinedInput
            value={
              waveData?.quota_global === null || waveData?.quota_global === undefined
                ? "-"
                : String(waveData.quota_global)
            }
            startAdornment={
              <InputAdornment position="start">
                <IconListNumbers />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Dibuat Oleh</CustomFormLabel>
          <CustomOutlinedInput
            value={
              waveData?.CreatedBy
                ? `${toLabelOrDash(waveData?.CreatedBy?.name)} (${toLabelOrDash(waveData?.CreatedBy?.email)})`
                : "-"
            }
            startAdornment={
              <InputAdornment position="start">
                <IconUser />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>
      </Grid>

      {/* CTA Area */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          Catatan: status hanya bisa diubah lewat aksi OPEN/CLOSE (bukan edit).
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={onBack}
            disabled={isActionLoading}
          >
            Kembali
          </Button>

          <Button
            variant="contained"
            onClick={onOpenClick}
            disabled={!canOpen || isActionLoading}
            title={!canOpen ? "Gelombang hanya bisa dibuka saat DRAFT" : "Buka gelombang"}
            sx={{
                bgcolor: "#34A853",
                "&:hover": { bgcolor: "#2f974a" },
                "&.Mui-disabled": {
                bgcolor: "rgba(0,0,0,0.12)",
                color: "rgba(0,0,0,0.38)",
                },
                borderRadius: 1,
                fontWeight: 700,
            }}
            >
            OPEN
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={onCloseClick}
            disabled={!canClose || isActionLoading}
            title={!canClose ? "Gelombang hanya bisa ditutup saat OPEN" : "Tutup gelombang"}
          >
            CLOSE
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PpdbWaveDetailContent;
