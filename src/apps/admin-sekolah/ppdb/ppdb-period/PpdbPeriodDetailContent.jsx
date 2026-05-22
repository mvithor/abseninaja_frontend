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
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import {
  IconCheck,
  IconX,
  IconBolt,
} from "@tabler/icons-react";

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
  const s = String(status || "").toUpperCase();
  if (s === "OPEN") return { label: "OPEN", color: "success" };
  if (s === "CLOSED") return { label: "CLOSED", color: "warning" };
  if (s === "ARCHIVED") return { label: "ARCHIVED", color: "default" };
  return { label: "DRAFT", color: "info" };
};

const MetaRow = ({ label, value }) => {
  return (
    <TableRow>
      <TableCell
        sx={{
          width: 180,
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
      <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{desc}</Typography>
    </Box>
  );
};

const PpdbPeriodDetailContent = ({
  detail,
  onOpen,
  onClose,
  onArchive,
  isActionLoading,
}) => {
  const [tab, setTab] = useState(0);

  const period = useMemo(() => detail || {}, [detail]);
  const { label, color } = statusChipProps(period.status);

  const tahunAjaranText = period?.TahunAjaranTarget?.tahun_ajaran || "-";
  const createdByName = period?.CreatedBy?.name || "-";
  const createdByEmail = period?.CreatedBy?.email || "-";

  const readiness = useMemo(() => period?.readiness || {}, [period]);
  const actions = useMemo(() => period?.actions || {}, [period]);
  const waves = useMemo(() => Array.isArray(period?.waves) ? period.waves : [], [period]);
  const tracks = useMemo(() => Array.isArray(period?.tracks) ? period.tracks : [], [period]);

  const blockingText = useMemo(() => {
    if (!period?.blocking) return null;
    const msg = period?.blocking?.message || "Ada konfigurasi yang memblokir aksi";
    const other = period?.blocking?.other_open_period?.nama
      ? `Period lain: ${period.blocking.other_open_period.nama}`
      : null;
    return other ? `${msg}. ${other}` : msg;
  }, [period]);

  const disableOpenReason = useMemo(() => {
    if (label !== "DRAFT") return "Period bukan DRAFT.";
    if (actions?.can_open) return null;
    if (blockingText) return blockingText;

    // readiness = true artinya sudah memenuhi
    if (!readiness.open_at_required) return "Jadwal buka belum diisi.";
    if (!readiness.waves_min_1) return "Minimal harus ada 1 gelombang.";
    if (!readiness.tracks_min_1) return "Minimal harus ada 1 jalur.";
    if (!readiness.no_other_open_period) return "Masih ada period lain yang OPEN.";
    if (!readiness.has_active_track) return "Minimal ada 1 jalur yang aktif.";
    // has_open_wave ini opsional, tapi kalau kamu mau strict, bisa dipakai
    return "Period belum siap dibuka.";
  }, [actions?.can_open, blockingText, label, readiness]);

  return (
    <Box>
      {/* HEADER SUMMARY (rapi: judul + status + aksi + tabel metadata) */}
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
                {period?.nama || "-"}
              </Typography>

              <Chip
                label={label}
                color={color}
                size="small"
                sx={{
                  borderRadius: "4px",      
                  fontWeight: 800,
                  height: 22,                
                  "& .MuiChip-label": {
                    px: 1.1,                
                  },
                }}
              />
            </Stack>

              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Target Tahun Ajaran: <b>{tahunAjaranText}</b>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <Tooltip title={disableOpenReason || ""} disableHoverListener={Boolean(actions?.can_open)}>
                <span>
                  <Button
                    variant="contained"
                    startIcon={<IconBolt size={18} />}
                    onClick={onOpen}
                    disabled={!actions?.can_open || isActionLoading}
                  >
                    Buka PMB
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={!actions?.can_close ? "Hanya bisa ditutup saat status OPEN." : ""}>
                <span>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={onClose}
                    disabled={!actions?.can_close || isActionLoading}
                  >
                    Tutup
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={!actions?.can_archive ? "Hanya bisa diarsipkan saat status CLOSED." : ""}>
                <span>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onArchive}
                    disabled={!actions?.can_archive || isActionLoading}
                  >
                    Arsipkan
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Informasi Periode
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Jadwal Buka"
                    value={`${fmtDateTime(period?.open_at)} WIB`}
                  />
                  <MetaRow
                    label="Jadwal Tutup"
                    value={`${fmtDateTime(period?.close_at)} WIB`}
                  />
                  <MetaRow
                    label="Tahun Ajaran Target"
                    value={tahunAjaranText}
                  />
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Audit
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Dibuat oleh"
                    value={`${createdByName} (${createdByEmail})`}
                  />
                  <MetaRow
                    label="Dibuat"
                    value={`${fmtDateTime(period?.created_at)} WIB`}
                  />
                  <MetaRow
                    label="Diupdate"
                    value={`${fmtDateTime(period?.updated_at)} WIB`}
                  />
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* BLOCKING */}
      {blockingText ? (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ color: "error.main", fontWeight: 800 }}>
            {blockingText}
          </Typography>
        </Box>
      ) : null}

      <Divider sx={{ my: 2 }} />

      {/* READINESS */}
      <Typography sx={{ fontWeight: 900, mb: 1 }}>
        Kesiapan Dibuka
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.open_at_required)}
            title="Jadwal Buka sudah diisi"
            subtitle="Wajib sebelum PMB bisa dibuka"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.waves_min_1)}
            title="Minimal 1 Gelombang"
            subtitle="Tambahkan gelombang agar proses penerimaan punya skenario"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.tracks_min_1)}
            title="Minimal 1 Jalur"
            subtitle="Tambahkan jalur (misal: Reguler, Prestasi, Afirmasi)"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.no_other_open_period)}
            title="Tidak ada periode lain yang Terbuka"
            subtitle="Satu sekolah hanya boleh punya 1 PMB yang Terbuka"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.has_active_track)}
            title="Ada Jalur yang aktif"
            subtitle="Minimal satu jalur yang aktif"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(readiness.has_open_wave)}
            title="Ada Gelombang yang Terbuka"
            subtitle="Disarankan agar PMB benar-benar berjalan"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Gelombang (${waves.length})`} />
        <Tab label={`Jalur (${tracks.length})`} />
      </Tabs>

      {/* TAB CONTENT */}
      {tab === 0 ? (
        <Box>
          {waves.length === 0 ? (
            <EmptyState
              title="Belum ada Gelombang"
              desc="Tambahkan minimal 1 gelombang agar PMB bisa dibuka"
            />
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Nama</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Buka</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Tutup</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Kuota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {waves.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{w.nama}</TableCell>
                      <TableCell>{String(w.status || "-")}</TableCell>
                      <TableCell>{fmtDateTime(w.open_at)} WIB</TableCell>
                      <TableCell>{fmtDateTime(w.close_at)} WIB</TableCell>
                      <TableCell>{w.quota_global ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : null}

      {tab === 1 ? (
        <Box>
          {tracks.length === 0 ? (
            <EmptyState
              title="Belum ada Jalur"
              desc="Tambahkan minimal 1 jalur agar PMB bisa dibuka"
            />
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Kode</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Nama</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Aktif</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Urutan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tracks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{t.kode}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t.nama}</TableCell>
                      <TableCell>{t.is_active ? "Ya" : "Tidak"}</TableCell>
                      <TableCell>{t.sort_order ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : null}
      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-Start" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => window.history.back()}
        >
          Kembali
        </Button>
      </Box>
    </Box>
  );
};

export default PpdbPeriodDetailContent;
