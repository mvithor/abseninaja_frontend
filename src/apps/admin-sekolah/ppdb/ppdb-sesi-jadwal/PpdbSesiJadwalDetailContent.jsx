import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Chip,
  Divider,
  Typography,
  Button,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import {
  IconCheck,
  IconX,
  IconCalendarTime,
  IconSettings,
  IconInfoCircle,
  IconWorld,
  IconUsers,
  IconClock,
  IconBan,
  IconSend,
  IconArrowBack,
} from "@tabler/icons-react";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const fmtDateTime = (val) => {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
};

const statusChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "PUBLISHED") return { label: "PUBLISHED", color: "success" };
  if (s === "ONGOING") return { label: "ONGOING", color: "info" };
  if (s === "CANCELLED") return { label: "CANCELLED", color: "error" };
  return { label: s || "-", color: "default" };
};

const modeChipProps = (mode) => {
  const m = safeUpper(mode);
  if (m === "OFFLINE") return { label: "OFFLINE", color: "default" };
  if (m === "ONLINE") return { label: "ONLINE", color: "primary" };
  if (m === "HYBRID") return { label: "HYBRID", color: "secondary" };
  return { label: m || "-", color: "default" };
};

const periodStatusChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "OPEN") return { label: "OPEN", color: "success" };
  if (s === "CLOSED") return { label: "CLOSED", color: "warning" };
  if (s === "ARCHIVED") return { label: "ARCHIVED", color: "default" };
  return { label: s || "-", color: "default" };
};

const MetaRow = ({ label, value }) => {
  return (
    <TableRow>
      <TableCell
        sx={{
          width: 220,
          color: "text.secondary",
          fontWeight: 800,
          borderBottom: "none",
          py: 0.75,
          pr: 2,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </TableCell>
      <TableCell sx={{ borderBottom: "none", py: 0.75, fontWeight: 700 }}>
        {value}
      </TableCell>
    </TableRow>
  );
};

const ReadinessItem = ({ ok, title, subtitle }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: ok ? "#34A853" : "grey.300",
        bgcolor: ok ? "success.lighter" : "transparent",
      }}
    >
      <Box sx={{ mt: "2px" }}>
        {ok ? <IconCheck size={18} /> : <IconX size={18} />}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

const EmptyState = ({ title, desc }) => {
  return (
    <Box sx={{ p: 2, border: "1px dashed", borderColor: "grey.300", borderRadius: 2 }}>
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{desc}</Typography>
    </Box>
  );
};

const PpdbSesiJadwalDetailContent = ({
  detail,
  onBack,
  onEdit,
  onPublish,
  onUnpublish,
  onCancel,
  isActionLoading,
}) => {
  const [tab, setTab] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  const d = useMemo(() => detail || {}, [detail]);

  const statusChip = useMemo(() => statusChipProps(d?.status), [d?.status]);
  const modeChip = useMemo(() => modeChipProps(d?.mode), [d?.mode]);

  const period = d?.PpdbPeriod || null;
  const periodStatusChip = useMemo(() => periodStatusChipProps(period?.status), [period?.status]);

  const component = d?.Component || null;
  const wave = d?.WaveTrack?.Wave || null;
  const track = d?.WaveTrack?.Track || null;

  const summary = d?.summary || {};
  const actions = d?.actions || {};

  // ===== READINESS (untuk publish) =====
  const mode = safeUpper(d?.mode);
  const hasTitle = String(d?.title || "").trim().length >= 3;
  const hasStartEnd = Boolean(d?.start_at) && Boolean(d?.end_at);
  const startOk = (() => {
    if (!d?.start_at || !d?.end_at) return false;
    const s = new Date(d.start_at).getTime();
    const e = new Date(d.end_at).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
    return s < e;
  })();

  const needsUrl = mode === "ONLINE" || mode === "HYBRID";
  const hasUrl = String(d?.online_url || "").trim().length > 0;
  const urlOk = !needsUrl ? true : hasUrl;

  const canPublish = Boolean(actions?.can_publish);
  const canUnpublish = Boolean(actions?.can_unpublish);
  const canCancel = Boolean(actions?.can_cancel);

  const disablePublishReason = useMemo(() => {
    const st = safeUpper(d?.status);
    if (st !== "DRAFT") return "Publish hanya bisa saat status masih DRAFT.";
    if (!hasTitle) return "Judul sesi belum valid.";
    if (!hasStartEnd || !startOk) return "Waktu start/end belum valid.";
    if (!urlOk) return "Mode ONLINE/HYBRID wajib memiliki online_url.";
    if (safeUpper(period?.status) === "ARCHIVED") return "Period sudah ARCHIVED.";
    return null;
  }, [d?.status, hasTitle, hasStartEnd, startOk, urlOk, period?.status]);

  const disableUnpublishReason = useMemo(() => {
    const st = safeUpper(d?.status);
    if (st !== "PUBLISHED") return "UNPUBLISH hanya untuk status PUBLISHED.";
    if ((summary?.participant_count ?? 0) > 0) return "Sudah ada participant, UNPUBLISH ditolak.";
    return null;
  }, [d?.status, summary?.participant_count]);

  const disableCancelReason = useMemo(() => {
    const st = safeUpper(d?.status);
    if (!(st === "PUBLISHED" || st === "ONGOING")) return "CANCEL hanya untuk PUBLISHED/ONGOING.";
    return null;
  }, [d?.status]);

  const canEdit = safeUpper(d?.status) === "DRAFT";

  return (
    <Box>
      {/* HEADER */}
      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                  {d?.title || "-"}
                </Typography>

                <Chip
                  label={statusChip.label}
                  color={statusChip.color}
                  size="small"
                  sx={{
                    borderRadius: "4px",
                    fontWeight: 800,
                    height: 22,
                    "& .MuiChip-label": { px: 1.1 },
                  }}
                />

                <Chip
                  label={modeChip.label}
                  color={modeChip.color}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: "4px",
                    fontWeight: 900,
                    height: 22,
                    "& .MuiChip-label": { px: 1.1 },
                  }}
                />

                <Chip
                  label={d?.scope_label || "Scope"}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: "4px", fontWeight: 800, height: 22 }}
                />

                {d?.scope_tooltip ? (
                  <Tooltip title={d.scope_tooltip}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", mt: "1px" }}>
                      <IconInfoCircle size={16} />
                    </Box>
                  </Tooltip>
                ) : null}
              </Stack>

              <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
                Komponen: <b>{component ? `${component?.code || "-"} — ${component?.nama || "-"}` : "-"}</b> • Period:{" "}
                <b>{period?.nama || "-"}</b>
              </Typography>

              <Typography sx={{ color: "text.secondary", mt: 0.25 }}>
                Jadwal: <b>{fmtDateTime(d?.start_at)} WIB</b> - <b>{fmtDateTime(d?.end_at)} WIB</b>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<IconArrowBack size={18} />}
                onClick={onBack}
                disabled={isActionLoading}
              >
                Kembali
              </Button>

              <Tooltip
                title={canEdit ? "" : "Edit hanya tersedia saat status masih DRAFT"}
                disableHoverListener={canEdit}
              >
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<IconSettings size={18} />}
                    onClick={() => onEdit?.(d?.id)}
                    disabled={!canEdit || isActionLoading}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={disablePublishReason || ""} disableHoverListener={!disablePublishReason}>
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<IconSend size={18} />}
                    onClick={() => onPublish?.(d?.id)}
                    disabled={!canPublish || Boolean(disablePublishReason) || isActionLoading}
                  >
                    Publish
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={disableUnpublishReason || ""} disableHoverListener={!disableUnpublishReason}>
                <span>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => onUnpublish?.(d?.id)}
                    disabled={!canUnpublish || Boolean(disableUnpublishReason) || isActionLoading}
                  >
                    Unpublish
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        <Divider />

        {/* METADATA RINGKAS */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Ringkasan Session
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Status"
                    value={<Chip size="small" label={statusChip.label} color={statusChip.color} />}
                  />
                  <MetaRow
                    label="Mode"
                    value={<Chip size="small" label={modeChip.label} color={modeChip.color} />}
                  />
                  <MetaRow
                    label="Capacity"
                    value={d?.capacity ?? "-"}
                  />
                  <MetaRow
                    label="Published At"
                    value={d?.published_at ? `${fmtDateTime(d.published_at)} WIB` : "-"}
                  />
                  <MetaRow
                    label="Cancelled Reason"
                    value={d?.cancelled_reason || "-"}
                  />
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Period & Scope
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Status Period"
                    value={<Chip size="small" label={periodStatusChip.label} color={periodStatusChip.color} />}
                  />
                  <MetaRow
                    label="Periode"
                    value={period?.nama || "-"}
                  />
                  <MetaRow
                    label="Scope"
                    value={d?.scope_label || "-"}
                  />
                  <MetaRow
                    label="Gelombang"
                    value={wave?.nama || (d?.ppdb_wave_track_id ? "-" : "GLOBAL")}
                  />
                  <MetaRow
                    label="Jalur"
                    value={track ? `${track?.nama || "-"}${track?.kode ? ` (${track.kode})` : ""}` : (d?.ppdb_wave_track_id ? "-" : "GLOBAL")}
                  />
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* READINESS */}
      <Typography sx={{ fontWeight: 900, mb: 1 }}>
        Kesiapan Publish
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(hasTitle)}
            title="Judul valid"
            subtitle="Minimal 3 karakter"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(hasStartEnd && startOk)}
            title="Validasi Waktu"
            subtitle="Waktu mulai tidak boleh melebihi waktu selesai"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(urlOk)}
            title="Link URL"
            subtitle={needsUrl ? "Wajib untuk ONLINE/HYBRID" : "Tidak wajib untuk OFFLINE"}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={safeUpper(period?.status) !== "ARCHIVED"}
            title="Period tidak ARCHIVED"
            subtitle="ARCHIVED tidak boleh publish"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<IconCalendarTime size={18} />} iconPosition="start" label="Ringkasan" />
        <Tab icon={<IconClock size={18} />} iconPosition="start" label="Check-in Window" />
        <Tab icon={<IconWorld size={18} />} iconPosition="start" label="Online" />
        <Tab icon={<IconUsers size={18} />} iconPosition="start" label="Usage" />
        <Tab icon={<IconBan size={18} />} iconPosition="start" label="Aksi" />
      </Tabs>

      {/* TAB 0: Ringkasan */}
      {tab === 0 ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Jadwal</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Start" value={`${fmtDateTime(d?.start_at)} WIB`} />
                  <MetaRow label="End" value={`${fmtDateTime(d?.end_at)} WIB`} />
                  <MetaRow label="Durasi" value={(() => {
                    if (!d?.start_at || !d?.end_at) return "-";
                    const s = new Date(d.start_at).getTime();
                    const e = new Date(d.end_at).getTime();
                    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return "-";
                    const mins = Math.round((e - s) / 60000);
                    return `${mins} menit`;
                  })()} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Komponen</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Code" value={component?.code || "-"} />
                  <MetaRow label="Nama" value={component?.nama || "-"} />
                  <MetaRow label="Type" value={component?.type ? safeUpper(component.type) : "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* TAB 1: Check-in Window */}
      {tab === 1 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Check-in Window</Typography>
          <Table size="small">
            <TableBody>
              <MetaRow label="Open" value={d?.checkin_open_at ? `${fmtDateTime(d.checkin_open_at)} WIB` : "-"} />
              <MetaRow label="Late After" value={d?.late_after_at ? `${fmtDateTime(d.late_after_at)} WIB` : "-"} />
              <MetaRow label="Close" value={d?.checkin_close_at ? `${fmtDateTime(d.checkin_close_at)} WIB` : "-"} />
            </TableBody>
          </Table>

          <Divider sx={{ my: 1.5 }} />

          <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Catatan</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Pengaturan check-in tidak wajib. Jika digunakan, sistem akan menyesuaikan agar waktu buka, batas terlambat, dan waktu tutup tersusun dengan benar.
          </Typography>
        </Paper>
      ) : null}

      {/* TAB 2: Online */}
      {tab === 2 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Online</Typography>

          {safeUpper(d?.mode) === "OFFLINE" ? (
            <EmptyState
              title="Mode OFFLINE"
              desc="Link URL tidak wajib untuk mode OFFLINE."
            />
          ) : (
            <Table size="small">
              <TableBody>
                <MetaRow label="Mode" value={<Chip size="small" label={modeChip.label} color={modeChip.color} />} />
                <MetaRow
                  label="online_url"
                  value={
                    d?.online_url ? (
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 800 }}>{d.online_url}</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(d.online_url, "_blank", "noreferrer")}
                          startIcon={<IconWorld size={16} />}
                        >
                          Buka
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => navigator.clipboard?.writeText(String(d.online_url))}
                        >
                          Salin
                        </Button>
                      </Stack>
                    ) : (
                      "-"
                    )
                  }
                />
              </TableBody>
            </Table>
          )}
        </Paper>
      ) : null}

      {/* TAB 3: Usage */}
      {tab === 3 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Usage</Typography>

          <Table size="small">
            <TableBody>
              <MetaRow label="Room Count" value={summary?.room_count ?? 0} />
              <MetaRow label="Participant Count" value={summary?.participant_count ?? 0} />
            </TableBody>
          </Table>

          <Divider sx={{ my: 1.5 }} />

          <Typography sx={{ color: "text.secondary" }}>
            Demi keamanan data, item tidak dapat di-unpublish jika sudah memiliki peserta terdaftar.
          </Typography>
        </Paper>
      ) : null}

      {/* TAB 4: Aksi */}
      {tab === 4 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Aksi Status</Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Publish</Typography>
                <Typography sx={{ color: "text.secondary", mb: 1 }}>
                  Saat dipublikasikan, status akan berubah dari DRAFT ke PUBLISHED dan waktu publikasi akan dicatat otomatis.
                </Typography>

                <Tooltip title={disablePublishReason || ""} disableHoverListener={!disablePublishReason}>
                  <span>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<IconSend size={18} />}
                      onClick={() => onPublish?.(d?.id)}
                      disabled={!canPublish || Boolean(disablePublishReason) || isActionLoading}
                      fullWidth
                    >
                      Publish
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography sx={{ fontWeight: 900, mb: 0.75 }}>Unpublish</Typography>
                <Typography sx={{ color: "text.secondary", mb: 1 }}>
                  Mengubah status dari PUBLISHED menjadi DRAFT. Tindakan ini tidak dapat dilakukan jika sudah ada peserta terdaftar.
                </Typography>

                <Tooltip title={disableUnpublishReason || ""} disableHoverListener={!disableUnpublishReason}>
                  <span>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => onUnpublish?.(d?.id)}
                      disabled={!canUnpublish || Boolean(disableUnpublishReason) || isActionLoading}
                      fullWidth
                    >
                      Unpublish
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                  <IconBan size={18} />
                  <Typography sx={{ fontWeight: 900 }}>Cancel</Typography>
                </Stack>

                <Typography sx={{ color: "text.secondary", mb: 1 }}>
                  Membatalkan sesi hanya dapat dilakukan untuk status PUBLISHED atau ONGOING, dan harus disertai alasan pembatalan.
                </Typography>

                <TextField
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tulis alasan pembatalan (wajib)"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mb: 1 }}
                />

                <Tooltip title={disableCancelReason || ""} disableHoverListener={!disableCancelReason}>
                  <span>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<IconBan size={18} />}
                      onClick={() => onCancel?.(d?.id, cancelReason)}
                      disabled={!canCancel || Boolean(disableCancelReason) || isActionLoading || String(cancelReason || "").trim().length < 3}
                      fullWidth
                    >
                      Cancel Session
                    </Button>
                  </span>
                </Tooltip>

                {String(cancelReason || "").trim().length > 0 && String(cancelReason || "").trim().length < 3 ? (
                  <Typography sx={{ mt: 0.75, color: "warning.main", fontSize: 12 }}>
                    cancelled_reason minimal 3 karakter
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ) : null}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<IconArrowBack size={18} />}
          onClick={onBack}
          disabled={isActionLoading}
        >
          Kembali
        </Button>
      </Box>
    </Box>
  );
};

export default PpdbSesiJadwalDetailContent;