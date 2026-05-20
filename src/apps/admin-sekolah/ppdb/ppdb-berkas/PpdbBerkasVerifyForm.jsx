import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment,
  MenuItem,
  Alert
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";

import {
  IconCalendarEvent,
  IconUser,
  IconChecklist,
  IconExternalLink,
  IconInfoCircle,
  IconLock,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

const formatDateTime = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
};

const chipStatusApp = (status) => {
  const s = String(status || "").toUpperCase();

  // ✅ status baru harus masuk
  if (s === "FINALIZED") return { label: "LOCKED / FINALIZED", color: "success" };
  if (s === "REVISION_REQUIRED") return { label: "REVISION REQUIRED", color: "warning" };
  if (s === "VERIFIED") return { label: "VERIFIED", color: "primary" };
  if (s === "SUBMITTED") return { label: "SUBMITTED", color: "info" };
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "RE_REGISTERED") return { label: "RE-REGISTERED", color: "secondary" };

  // legacy tolerance
  if (s === "ACCEPTED") return { label: "ACCEPTED", color: "default" };
  if (s === "REJECTED") return { label: "REJECTED", color: "default" };

  return { label: s || "-", color: "default" };
};

const chipReview = (review) => {
  const st = String(review?.status || "").toUpperCase();
  if (st === "APPROVED") return { label: "APPROVED", color: "success", variant: "filled" };
  if (st === "REJECTED") return { label: "REJECTED", color: "error", variant: "filled" };
  if (st === "REVISION_REQUIRED") return { label: "PERLU REVISI", color: "warning", variant: "filled" };
  if (st === "PENDING") return { label: "PENDING", color: "info", variant: "outlined" };
  return { label: "NEED REVIEW", color: "default", variant: "outlined" };
};

const reviewOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REVISION_REQUIRED", label: "Perlu Revisi" },
  { value: "REJECTED", label: "Rejected" },
];

const SummaryCard = ({ title, value, icon, rightEl }) => {
  const Icon = icon;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 0.8,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </Box>

        <Typography sx={{ fontWeight: 900, fontSize: 14, lineHeight: 1.2 }} noWrap>
          {value}
        </Typography>

        <Box sx={{ flex: 1 }} />
        {rightEl || null}
      </Box>
    </Paper>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.any.isRequired,
  rightEl: PropTypes.node,
};

const DocCard = ({
  title,
  required,
  file,
  review,
  disabled,
  values,
  onChange,
  onOpenFile,
}) => {
  const reviewChip = chipReview(review);

  const uploadedAt = file?.uploaded_at || file?.created_at || null;
  const reviewer = review?.reviewed_by?.name ? `${review.reviewed_by.name}` : "-";
  const reviewedAt = review?.reviewed_at ? formatDateTime(review.reviewed_at) : "-";

  const hasFile = Boolean(file?.id);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
            <Typography sx={{ fontWeight: 950, fontSize: 14 }}>{title}</Typography>
            {required ? (
              <Chip size="small" label="WAJIB" color="warning" variant="outlined" />
            ) : (
              <Chip size="small" label="OPSIONAL" color="default" variant="outlined" />
            )}
            <Chip size="small" {...reviewChip} />
          </Stack>

          <Typography variant="body2" sx={{ mt: 0.6, color: "text.secondary" }}>
            {hasFile ? (
              <>
                Uploaded: <b>{formatDateTime(uploadedAt)}</b>
              </>
            ) : (
              <Typography component="span" sx={{ color: "error.main", fontWeight: 900 }}>
                Belum di-upload
              </Typography>
            )}
          </Typography>

          <Typography variant="caption" sx={{ display: "block", mt: 0.4, color: "text.secondary" }}>
            Reviewer: <b>{reviewer}</b> • Reviewed: <b>{reviewedAt}</b>
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Tooltip title={file?.file_url ? "Buka file" : "File belum ada"} placement="top">
          <span>
            <IconButton
              onClick={() => onOpenFile?.(file?.file_url)}
              disabled={!file?.file_url}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <IconExternalLink size={18} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomFormLabel htmlFor={`status_${title}`} sx={{ mt: 0.5 }}>
            Status Review
          </CustomFormLabel>

          <CustomSelect
            id={`status_${title}`}
            value={values?.status || ""}
            onChange={(e) => onChange?.({ status: e.target.value, note: values?.note || "" })}
            fullWidth
            displayEmpty
            disabled={disabled || !hasFile}
            slotProps={{ input: { "aria-label": "Pilih status review" } }}
          >
            <MenuItem value="">
              <em>Pilih status</em>
            </MenuItem>
            {reviewOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </CustomSelect>

          {!hasFile ? (
            <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "error.main", fontWeight: 700 }}>
              Tidak bisa direview karena file belum diupload.
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
              Pilih status yang paling akurat.
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <CustomFormLabel htmlFor={`note_${title}`} sx={{ mt: 0.5 }}>
            Catatan (opsional)
          </CustomFormLabel>

          <CustomOutlinedInput
            id={`note_${title}`}
            value={values?.note || ""}
            onChange={(e) => onChange?.({ status: values?.status || "", note: e.target.value })}
            placeholder="Tulis catatan yang spesifik (contoh: pas foto blur, KK tidak terbaca, dsb)"
            fullWidth
            disabled={disabled || !hasFile}
            startAdornment={
              <InputAdornment position="start">
                <IconInfoCircle size={18} />
              </InputAdornment>
            }
          />

          <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
            Kalau pilih <b>Perlu Revisi</b>, tulis apa yang harus diperbaiki agar tidak bolak-balik.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

DocCard.propTypes = {
  title: PropTypes.string.isRequired,
  required: PropTypes.bool,
  file: PropTypes.object,
  review: PropTypes.object,
  disabled: PropTypes.bool,
  values: PropTypes.object,
  onChange: PropTypes.func,
  onOpenFile: PropTypes.func,
};

const PpdbBerkasVerifyForm = ({
  detail,
  localReviews,
  setLocalReviews,
  onSubmitBulk,
  onCancel,
  isLoading,
  error,
  success,
}) => {
  const applicant = detail?.applicant || null;
  const flags = detail?.flags || {};
  const canReview = Boolean(flags?.can_review_files);
  const reason = flags?.can_review_reason || null;

  const stApp = chipStatusApp(applicant?.status);

  const periodLabel = applicant?.period?.nama
    ? `${applicant.period.nama} (${String(applicant.period.status || "-").toUpperCase()})`
    : "-";

  const pendaftarLabel = applicant?.nama
    ? `${applicant.nama}${applicant?.nisn ? ` (${applicant.nisn})` : ""}`
    : "-";

  const requiredItems = detail?.berkas_wajib?.items || [];
  const ijazah = detail?.berkas_opsional?.ijazah || null;

  const openFile = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const setReviewForFile = (fileId, payload) => {
    setLocalReviews((prev) => ({
      ...prev,
      [fileId]: {
        status: payload.status,
        note: payload.note,
      },
    }));
  };

  const buildBulkPayload = () => {
    const items = [];

    for (const it of requiredItems) {
      const fid = it?.file?.id || null;
      if (!fid) continue;
      const v = localReviews?.[fid];
      if (!v?.status) continue;
      items.push({ ppdb_application_file_id: fid, status: v.status, note: v.note || "" });
    }

    // ✅ ijazah opsional boleh ikut bulk kalau admin set status
    if (ijazah?.id) {
      const v = localReviews?.[ijazah.id];
      if (v?.status) items.push({ ppdb_application_file_id: ijazah.id, status: v.status, note: v.note || "" });
    }

    return items;
  };

  const onLocalSubmit = (e) => {
    e.preventDefault();
    if (!canReview) return;
    const items = buildBulkPayload();
    if (items.length === 0) return;
    onSubmitBulk?.(items);
  };

  const hasChanges = buildBulkPayload().length > 0;
  const canSubmit = canReview && hasChanges && !isLoading;

  const canReviewLabel = (() => {
    const st = String(applicant?.status || "").toUpperCase();
    if (canReview && st === "REVISION_REQUIRED") return "BISA REVIEW (REVISI)";
    if (canReview) return "BISA REVIEW";
    return "TIDAK BISA REVIEW";
  })();

  const readinessChip = (() => {
    if (canReview) return { label: "READY", color: "success" };
    return { label: "NOT READY", color: "warning" };
  })();

  return (
    <Box component="form" onSubmit={onLocalSubmit} sx={{ mt: -1 }}>
      {error ? <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert> : null}

      {/* SUMMARY */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="PPDB Period" value={periodLabel} icon={IconCalendarEvent} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard title="Pendaftar" value={pendaftarLabel} icon={IconUser} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard
            title="Status Aplikasi"
            value={String(applicant?.status || "-").toUpperCase()}
            icon={IconChecklist}
            rightEl={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip size="small" {...stApp} />
              </Stack>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <SummaryCard
            title="Kondisi Review"
            value={canReviewLabel}
            icon={canReview ? IconCircleCheck : IconLock}
            rightEl={
              <Chip
                size="small"
                label={readinessChip.label}
                color={readinessChip.color}
                variant="outlined"
                sx={{ fontWeight: 900 }}
              />
            }
          />
        </Grid>
      </Grid>

      {/* Banner guidance */}
      <Alert
        severity={canReview ? "info" : "warning"}
        icon={<IconAlertTriangle size={18} />}
        sx={{
          mb: 2,
          borderRadius: 2,
          alignItems: "center",
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ fontWeight: 900 }}>
            Review dilakukan per dokumen.
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Gunakan catatan yang spesifik agar tidak bolak-balik.
          </Typography>

          <Box sx={{ flex: 1 }} />

          {!canReview && reason ? (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={reason}
              sx={{
                fontWeight: 900,
                maxWidth: "100%",
                height: 28,
                "& .MuiChip-label": {
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: 240, sm: 420, md: 520 },
                },
              }}
            />
          ) : null}
        </Box>
      </Alert>

      {/* BERKAS WAJIB */}
      <Typography sx={{ fontSize: 16, fontWeight: 950, mb: 1 }}>
        Berkas Wajib
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {requiredItems.map((it) => {
          const file = it?.file || null;
          const verification = it?.verification || null;
          const fid = file?.id || `missing-${it?.file_type}`;

          return (
            <DocCard
              key={fid}
              title={String(it?.file_type || "-").replaceAll("_", " ")}
              required
              file={file}
              review={verification}
              disabled={!canReview || isLoading}
              values={file?.id ? (localReviews?.[file.id] || { status: "", note: "" }) : { status: "", note: "" }}
              onChange={(payload) => {
                if (!file?.id) return;
                setReviewForFile(file.id, payload);
              }}
              onOpenFile={openFile}
            />
          );
        })}
      </Stack>

      {/* OPSIONAL */}
      <Typography sx={{ fontSize: 16, fontWeight: 950, mb: 1 }}>
        Berkas Opsional
      </Typography>

      <Stack spacing={2}>
        <DocCard
          title="IJAZAH"
          required={false}
          file={ijazah}
          review={null}
          disabled={!canReview || isLoading}
          values={ijazah?.id ? (localReviews?.[ijazah.id] || { status: "", note: "" }) : { status: "", note: "" }}
          onChange={(payload) => {
            if (!ijazah?.id) return;
            setReviewForFile(ijazah.id, payload);
          }}
          onOpenFile={openFile}
        />
      </Stack>

      {/* ACTIONS */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
        <SubmitButton isLoading={isLoading} disabled={!canSubmit}>
          Simpan Review
        </SubmitButton>
        <CancelButton onClick={onCancel} disabled={isLoading}>
          Kembali
        </CancelButton>
      </Box>

      {!canReview ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: "text.secondary" }}>
          Input dinonaktifkan karena pendaftar belum <b>FINALIZED/LOCKED</b> (atau status tidak mengizinkan). Admin tidak perlu membuang waktu review saat dokumen masih bisa berubah.
        </Typography>
      ) : null}

      {canReview && !hasChanges ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: "text.secondary" }}>
          Pilih minimal 1 status review untuk menyimpan perubahan.
        </Typography>
      ) : null}
    </Box>
  );
};

PpdbBerkasVerifyForm.propTypes = {
  detail: PropTypes.object,
  localReviews: PropTypes.object,
  setLocalReviews: PropTypes.func,
  onSubmitBulk: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
};

export default PpdbBerkasVerifyForm;