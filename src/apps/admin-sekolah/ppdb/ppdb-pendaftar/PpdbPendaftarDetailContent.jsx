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
  TableContainer,
  Paper,
} from "@mui/material";
import {
  IconCheck,
  IconX,
  IconUser,
  IconFileText,
  IconTrophy,
  IconTimeline,
  IconSchool,
  IconPhone,
  IconId,
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

const fmtDateOnly = (val) => {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
};

const statusAppChipProps = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "SUBMITTED") return { label: "SUBMITTED", color: "info" };
  if (s === "VERIFIED") return { label: "VERIFIED", color: "primary" };
  if (s === "ACCEPTED") return { label: "ACCEPTED", color: "success" };
  if (s === "RE_REGISTERED") return { label: "RE-REGISTERED", color: "success" };
  if (s === "REJECTED") return { label: "REJECTED", color: "error" };
  return { label: s || "-", color: "default" };
};

const statusPeriodChipProps = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "OPEN") return { label: "OPEN", color: "success" };
  if (s === "CLOSED") return { label: "CLOSED", color: "warning" };
  if (s === "ARCHIVED") return { label: "ARCHIVED", color: "default" };
  return { label: s || "DRAFT", color: "info" };
};

const boolChip = (val, yes = "YA", no = "TIDAK") => {
  if (val === true) return <Chip size="small" label={yes} color="success" />;
  if (val === false) return <Chip size="small" label={no} color="warning" />;
  return <Chip size="small" label="-" color="default" />;
};

const MetaRow = ({ label, value }) => {
  return (
    <TableRow>
      <TableCell
        sx={{
          width: 200,
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

const FileCard = ({ title, file }) => {
  const has = Boolean(file?.file_url);
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
        {has ? <Chip size="small" color="success" label="ADA" /> : <Chip size="small" color="default" label="BELUM" />}
      </Stack>

      <Typography sx={{ color: "text.secondary", mt: 0.75, fontSize: 12 }}>
        {has ? `Upload: ${fmtDateTime(file?.uploaded_at || file?.created_at)} WIB` : "Belum ada file"}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={!has}
          onClick={() => has && window.open(file.file_url, "_blank", "noreferrer")}
        >
          Lihat
        </Button>
        <Button
          variant="text"
          size="small"
          disabled={!has}
          onClick={() => has && navigator.clipboard?.writeText(file.file_url)}
        >
          Salin Link
        </Button>
      </Stack>
    </Paper>
  );
};

const buildTimeline = (t) => {
  const steps = [
    { key: "created_at", label: "Registrasi Dibuat", time: t?.created_at },
    { key: "finalized_at", label: "Form Disubmit", time: t?.finalized_at },
    { key: "verified_at", label: "Berkas Diverifikasi", time: t?.verified_at },
    { key: "accepted_at", label: "Diterima", time: t?.accepted_at },
    { key: "rejected_at", label: "Ditolak", time: t?.rejected_at },
  ];
  return steps;
};

const PpdbPendaftarDetailContent = ({
  detail,
  onBack,
  onPromote,
  isActionLoading,
}) => {
  const [tab, setTab] = useState(0);

  const d = useMemo(() => detail || {}, [detail]);
  const appStatus = useMemo(() => statusAppChipProps(d?.status), [d?.status]);

  const period = d?.jalur_gelombang?.ppdb_period || null;
  const wave = d?.jalur_gelombang?.wave || null;
  const track = d?.jalur_gelombang?.track || null;
  const waveTrack = d?.jalur_gelombang?.ppdb_wave_track || null;

  const periodStatusChip = useMemo(() => statusPeriodChipProps(period?.status), [period?.status]);

  const biodata = d?.biodata || {};
  const sekolahAsal = d?.sekolah_asal || {};
  const orangTua = d?.orang_tua || {};
  const kontak = d?.kontak || {};
  const berkas = d?.berkas || {};
  const prestasi = Array.isArray(d?.prestasi) ? d.prestasi : [];
  const t = d?.timestamps || {};

  // ===== READINESS (operasional, bukan konfigurasi) =====
  const hasSubmitted = Boolean(t?.finalized_at) || String(d?.status || "").toUpperCase() !== "DRAFT";
  const filesRequiredOk =
    Boolean(berkas?.pas_foto) &&
    Boolean(berkas?.kartu_keluarga) &&
    Boolean(berkas?.ijazah);

  const isPrestasiTrack = String(track?.kode || "").toUpperCase() === "PRESTASI";
  const prestasiOk = !isPrestasiTrack ? true : prestasi.length > 0; // minimal 1 prestasi jika jalur PRESTASI

  const canPromote =
    String(d?.status || "").toUpperCase() === "ACCEPTED" &&
    d?.is_promoted === false;

  const disablePromoteReason = useMemo(() => {
    const st = String(d?.status || "").toUpperCase();
    if (d?.is_promoted) return "Sudah dipromote.";
    if (st !== "ACCEPTED") return "Promote hanya bisa saat status ACCEPTED.";
    return null;
  }, [d?.is_promoted, d?.status]);

  const timeline = useMemo(() => buildTimeline(t), [t]);

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
                  {biodata?.nama || "-"}
                </Typography>

                <Chip
                  label={appStatus.label}
                  color={appStatus.color}
                  size="small"
                  sx={{
                    borderRadius: "4px",
                    fontWeight: 800,
                    height: 22,
                    "& .MuiChip-label": { px: 1.1 },
                  }}
                />

                <Chip
                  label={`Kode: ${d?.kode_pendaftaran || "-"}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: "4px", fontWeight: 800, height: 22 }}
                />
              </Stack>

              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Jalur: <b>{track?.nama || "-"}</b> • Gelombang: <b>{wave?.nama || "-"}</b> • Periode:{" "}
                <b>{period?.nama || "-"}</b>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <Button variant="outlined" onClick={onBack} disabled={isActionLoading}>
                Kembali
              </Button>

              <Tooltip title={disablePromoteReason || ""} disableHoverListener={!disablePromoteReason}>
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onPromote?.(d?.id)}
                    disabled={!canPromote || isActionLoading}
                  >
                    Promote ke Siswa
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
                Ringkasan Pendaftaran
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Jenis Kelamin"
                    value={biodata?.jenis_kelamin || "-"}
                  />
                  <MetaRow
                    label="Tgl Lahir"
                    value={fmtDateOnly(biodata?.tanggal_lahir)}
                  />
                  <MetaRow
                    label="No. WA Wali"
                    value={kontak?.no_hp_wa_wali_utama || "-"}
                  />
                  <MetaRow
                    label="Terakhir Aktivitas"
                    value={`${fmtDateTime(t?.effective_time)} WIB`}
                  />
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Jalur & Jadwal
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Status Periode"
                    value={<Chip size="small" label={periodStatusChip.label} color={periodStatusChip.color} />}
                  />
                  <MetaRow
                    label="Periode"
                    value={`${fmtDateTime(period?.open_at)} - ${fmtDateTime(period?.close_at)} WIB`}
                  />
                  <MetaRow
                    label="Jalur per Gelombang"
                    value={waveTrack
                      ? `${fmtDateTime(waveTrack?.open_at)} - ${fmtDateTime(waveTrack?.close_at)} WIB • Kuota: ${waveTrack?.quota ?? "-"}`
                      : "-"}
                  />
                  <MetaRow
                    label="Promoted"
                    value={boolChip(Boolean(d?.is_promoted))}
                  />
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* READINESS (operasional) */}
      <Typography sx={{ fontWeight: 900, mb: 1 }}>
        Kesiapan Operasional
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(hasSubmitted)}
            title="Form sudah disubmit"
            subtitle="Verifikasi berkas seharusnya dimulai setelah SUBMITTED"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(filesRequiredOk)}
            title="Berkas wajib lengkap"
            subtitle="Pas Foto, Kartu Keluarga, Ijazah"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(prestasiOk)}
            title="Syarat prestasi"
            subtitle={isPrestasiTrack ? "Wajib ada minimal 1 prestasi untuk jalur PRESTASI" : "Tidak wajib untuk jalur ini"}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<IconUser size={18} />} iconPosition="start" label="Ringkasan" />
        <Tab icon={<IconId size={18} />} iconPosition="start" label="Biodata" />
        <Tab icon={<IconSchool size={18} />} iconPosition="start" label="Sekolah Asal" />
        <Tab icon={<IconPhone size={18} />} iconPosition="start" label="Orang Tua" />
        <Tab icon={<IconFileText size={18} />} iconPosition="start" label="Berkas" />
        <Tab icon={<IconTrophy size={18} />} iconPosition="start" label={`Prestasi (${prestasi.length})`} />
        <Tab icon={<IconTimeline size={18} />} iconPosition="start" label="Timeline" />
      </Tabs>

      {/* TAB: Ringkasan */}
      {tab === 0 ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Identitas</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={biodata?.nama || "-"} />
                  <MetaRow label="JK" value={biodata?.jenis_kelamin || "-"} />
                  <MetaRow label="Tempat Lahir" value={biodata?.tempat_lahir || "-"} />
                  <MetaRow label="Tanggal Lahir" value={fmtDateOnly(biodata?.tanggal_lahir)} />
                  <MetaRow label="NISN" value={biodata?.nisn || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Status & Audit</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Status" value={<Chip size="small" label={appStatus.label} color={appStatus.color} />} />
                  <MetaRow label="Dibuat" value={`${fmtDateTime(t?.created_at)} WIB`} />
                  <MetaRow label="Diupdate" value={`${fmtDateTime(t?.updated_at)} WIB`} />
                  <MetaRow label="Terakhir Aktivitas" value={`${fmtDateTime(t?.effective_time)} WIB`} />
                  <MetaRow label="Alasan Ditolak" value={d?.keputusan?.rejected_reason || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* TAB: Biodata */}
      {tab === 1 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Biodata</Typography>
          <Table size="small">
            <TableBody>
              <MetaRow label="Nama" value={biodata?.nama || "-"} />
              <MetaRow label="Jenis Kelamin" value={biodata?.jenis_kelamin || "-"} />
              <MetaRow label="Tempat Lahir" value={biodata?.tempat_lahir || "-"} />
              <MetaRow label="Tanggal Lahir" value={fmtDateOnly(biodata?.tanggal_lahir)} />
              <MetaRow label="Anak ke" value={biodata?.anak_ke ?? "-"} />
              <MetaRow label="NISN" value={biodata?.nisn || "-"} />
              <MetaRow label="No KIP" value={biodata?.nomor_kip || "-"} />
              <MetaRow label="Email" value={biodata?.email || "-"} />
              <MetaRow label="Alamat" value={biodata?.alamat_rumah || "-"} />
              <MetaRow label="Kode Pos" value={biodata?.kode_pos || "-"} />
            </TableBody>
          </Table>
        </Paper>
      ) : null}

      {/* TAB: Sekolah Asal */}
      {tab === 2 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Sekolah Asal</Typography>
          <Table size="small">
            <TableBody>
              <MetaRow label="Nama Sekolah" value={sekolahAsal?.nama || "-"} />
              <MetaRow label="Status" value={sekolahAsal?.status || "-"} />
              <MetaRow label="NPSN" value={sekolahAsal?.npsn || "-"} />
              <MetaRow label="Tahun Lulus" value={sekolahAsal?.tahun_lulus ?? "-"} />
            </TableBody>
          </Table>
        </Paper>
      ) : null}

      {/* TAB: Orang Tua */}
      {tab === 3 ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Ayah</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={orangTua?.ayah?.nama || "-"} />
                  <MetaRow label="NIK" value={orangTua?.ayah?.nik || "-"} />
                  <MetaRow label="Tempat Lahir" value={orangTua?.ayah?.tempat_lahir || "-"} />
                  <MetaRow label="Tanggal Lahir" value={fmtDateOnly(orangTua?.ayah?.tanggal_lahir)} />
                  <MetaRow label="Pekerjaan" value={orangTua?.ayah?.pekerjaan || "-"} />
                  <MetaRow label="Pendidikan" value={orangTua?.ayah?.pendidikan_terakhir || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Ibu</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={orangTua?.ibu?.nama || "-"} />
                  <MetaRow label="NIK" value={orangTua?.ibu?.nik || "-"} />
                  <MetaRow label="Tempat Lahir" value={orangTua?.ibu?.tempat_lahir || "-"} />
                  <MetaRow label="Tanggal Lahir" value={fmtDateOnly(orangTua?.ibu?.tanggal_lahir)} />
                  <MetaRow label="Pekerjaan" value={orangTua?.ibu?.pekerjaan || "-"} />
                  <MetaRow label="Pendidikan" value={orangTua?.ibu?.pendidikan_terakhir || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Kontak & KK</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="No. KK" value={orangTua?.nomor_kartu_keluarga || "-"} />
                  <MetaRow label="No. WA Wali Utama" value={kontak?.no_hp_wa_wali_utama || "-"} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* TAB: Berkas */}
      {tab === 4 ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FileCard title="Pas Foto" file={berkas?.pas_foto} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FileCard title="Kartu Keluarga" file={berkas?.kartu_keluarga} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FileCard title="Ijazah" file={berkas?.ijazah} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            {!hasSubmitted ? (
              <EmptyState
                title="Masih DRAFT"
                desc="Pendaftar belum submit form. Verifikasi berkas sebaiknya dilakukan setelah status SUBMITTED."
              />
            ) : null}
          </Grid>
        </Grid>
      ) : null}

      {/* TAB: Prestasi */}
      {tab === 5 ? (
        <Box>
          {prestasi.length === 0 ? (
            <EmptyState
              title="Belum ada data prestasi"
              desc={isPrestasiTrack
                ? "Jalur PRESTASI seharusnya memiliki minimal 1 prestasi. Pastikan pendaftar mengisi dan mengunggah sertifikat."
                : "Jika jalur bukan PRESTASI, bagian ini memang bisa kosong."}
            />
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableBody>
                  {prestasi.map((p) => (
                    <TableRow key={p?.id}>
                      <TableCell sx={{ fontWeight: 900, width: 260 }}>
                        {p?.nama_prestasi || "-"}
                        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                          {p?.jenis_prestasi || "-"} • {p?.tingkat || "-"} • {p?.peringkat || "-"} • {p?.tahun || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Penyelenggara: {p?.penyelenggara || "-"}
                        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                          {p?.keterangan || ""}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 220 }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={!(Array.isArray(p?.sertifikat) && p.sertifikat.length > 0)}
                            onClick={() => {
                              const first = p?.sertifikat?.[0];
                              if (first?.file_url) window.open(first.file_url, "_blank", "noreferrer");
                            }}
                          >
                            Lihat Sertifikat
                          </Button>
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.75 }}>
                          Sertifikat: {Array.isArray(p?.sertifikat) ? p.sertifikat.length : 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : null}

      {/* TAB: Timeline */}
      {tab === 6 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Timeline</Typography>

          <Table size="small">
            <TableBody>
              {timeline.map((s) => (
                <MetaRow
                  key={s.key}
                  label={s.label}
                  value={s.time ? `${fmtDateTime(s.time)} WIB` : "-"}
                />
              ))}
              <MetaRow
                label="Terakhir Aktivitas"
                value={t?.effective_time ? `${fmtDateTime(t.effective_time)} WIB` : "-"}
              />
            </TableBody>
          </Table>

          {String(d?.status || "").toUpperCase() === "REJECTED" && d?.keputusan?.rejected_reason ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 900, color: "error.main" }}>
                Alasan Ditolak
              </Typography>
              <Typography sx={{ mt: 0.5 }}>
                {d.keputusan.rejected_reason}
              </Typography>
            </Box>
          ) : null}
        </Paper>
      ) : null}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="secondary" onClick={onBack} disabled={isActionLoading}>
          Kembali
        </Button>
      </Box>
    </Box>
  );
};

export default PpdbPendaftarDetailContent;
