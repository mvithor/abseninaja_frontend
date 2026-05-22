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
  IconTimeline,
  IconChecklist,
  IconAlertTriangle,
  IconCircleCheck,
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

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const statusAppChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "DRAFT") return { label: "DRAFT", color: "default" };
  if (s === "SUBMITTED") return { label: "SUBMITTED", color: "info" };
  if (s === "VERIFIED") return { label: "VERIFIED", color: "primary" };
  if (s === "ACCEPTED") return { label: "ACCEPTED", color: "success" };
  if (s === "RE_REGISTERED") return { label: "RE-REGISTERED", color: "success" };
  if (s === "REJECTED") return { label: "REJECTED", color: "error" };
  return { label: s || "-", color: "default" };
};

const nilaiStatusChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "GRADED") return { label: "GRADED", color: "success" };
  if (s === "NEEDS_ATTENTION") return { label: "NEEDS ATTENTION", color: "warning" };
  if (s === "NO_PARTICIPANT") return { label: "NO PARTICIPANT", color: "default" };
  if (s === "UNGRADED") return { label: "UNGRADED", color: "info" };
  return { label: s || "-", color: "default" };
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

const buildTimeline = (a) => {
  const steps = [
    { key: "submitted_at", label: "Form Disubmit", time: a?.submitted_at },
    { key: "finalized_at", label: "Finalisasi", time: a?.finalized_at },
    { key: "verified_at", label: "Berkas Diverifikasi", time: a?.verified_at },
    { key: "accepted_at", label: "Diterima", time: a?.accepted_at },
    { key: "rejected_at", label: "Ditolak", time: a?.rejected_at },
  ];
  return steps;
};

const toPct = (num, den) => {
  const a = Number(num || 0);
  const b = Number(den || 0);
  if (!b) return "0%";
  const p = Math.round((a / b) * 100);
  return `${p}%`;
};

const PpdbNilaiDetailContent = ({ detail, onBack, isActionLoading }) => {
  const [tab, setTab] = useState(0);

  const d = useMemo(() => detail || {}, [detail]);
  const application = useMemo(() => d?.application || {}, [d]);
  const tests = useMemo(() => (Array.isArray(d?.tests) ? d.tests : []), [d]);
  const summary = useMemo(() => d?.summary || {}, [d]);

  const appStatus = useMemo(
    () => statusAppChipProps(application?.status),
    [application?.status]
  );

  const total = useMemo(() => Number(summary?.total || tests.length || 0), [summary?.total, tests.length]);
  const graded = useMemo(() => Number(summary?.GRADED || 0), [summary?.GRADED]);
  const ungraded = useMemo(() => Number(summary?.UNGRADED || 0), [summary?.UNGRADED]);
  const needs = useMemo(() => Number(summary?.NEEDS_ATTENTION || 0), [summary?.NEEDS_ATTENTION]);
  const noParticipant = useMemo(() => Number(summary?.NO_PARTICIPANT || 0), [summary?.NO_PARTICIPANT]);

  const hasAnyParticipant = useMemo(() => {
    return tests.some((t) => Boolean(t?.participant_id));
  }, [tests]);

  const hasNeedsAttention = useMemo(() => needs > 0, [needs]);

  const hasAnyUngraded = useMemo(() => {
    return tests.some((t) => {
      const s = safeUpper(t?.nilai_status);
      return s === "UNGRADED" || s === "NO_PARTICIPANT";
    });
  }, [tests]);

  const timeline = useMemo(() => buildTimeline(application), [application]);

  const scopeLabel = useMemo(() => application?.scope_label || "-", [application?.scope_label]);

  const renderNilaiStatusChip = (s, labelOverride) => {
    const chip = nilaiStatusChipProps(s);
    return (
      <Chip
        size="small"
        label={labelOverride || chip.label}
        color={chip.color}
        sx={{
          borderRadius: "4px",
          fontWeight: 900,
          height: 22,
          "& .MuiChip-label": { px: 1.1 },
        }}
      />
    );
  };

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
                  {application?.nama_calon_peserta_didik || "-"}
                </Typography>

                <Chip
                  label={appStatus.label}
                  color={appStatus.color}
                  size="small"
                  sx={{
                    borderRadius: "4px",
                    fontWeight: 900,
                    height: 22,
                    "& .MuiChip-label": { px: 1.1 },
                  }}
                />

                <Chip
                  label={`Kode: ${application?.kode_pendaftaran || "-"}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: "4px", fontWeight: 900, height: 22 }}
                />
              </Stack>

              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Scope: <b>{scopeLabel}</b>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <Button variant="outlined" onClick={onBack} disabled={isActionLoading}>
                Kembali
              </Button>
            </Stack>
          </Box>
        </Box>

        <Divider />

        {/* METADATA RINGKAS */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Ringkasan Monitoring Nilai
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow label="Total Komponen Tes" value={<b>{total}</b>} />
                  <MetaRow label="Sudah Dinilai" value={<b>{graded} ({toPct(graded, total)})</b>} />
                  <MetaRow label="Belum Dinilai" value={<b>{ungraded} ({toPct(ungraded, total)})</b>} />
                  <MetaRow label="Perlu Diproses" value={<b>{needs} ({toPct(needs, total)})</b>} />
                  <MetaRow label="Belum Ikut Tes" value={<b>{noParticipant} ({toPct(noParticipant, total)})</b>} />
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Audit Pendaftaran
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Status Pendaftaran"
                    value={<Chip size="small" label={appStatus.label} color={appStatus.color} />}
                  />
                  <MetaRow label="Submitted" value={`${fmtDateTime(application?.submitted_at)} WIB`} />
                  <MetaRow label="Finalized" value={`${fmtDateTime(application?.finalized_at)} WIB`} />
                  <MetaRow label="Verified" value={`${fmtDateTime(application?.verified_at)} WIB`} />
                  <MetaRow label="Accepted" value={`${fmtDateTime(application?.accepted_at)} WIB`} />
                  <MetaRow label="Rejected" value={`${fmtDateTime(application?.rejected_at)} WIB`} />
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* READINESS (operasional) */}
      <Typography sx={{ fontWeight: 900, mb: 1 }}>
        Indikator Operasional
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={Boolean(hasAnyParticipant)}
            title="Ada peserta yang ikut tes"
            subtitle="Jika tidak ada participant, berarti komponen tes belum diikuti"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={!hasNeedsAttention}
            title="Tidak ada yang perlu diproses"
            subtitle={hasNeedsAttention ? "Ada komponen sudah hadir/selesai tapi belum dinilai" : "Aman"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReadinessItem
            ok={!hasAnyUngraded}
            title="Semua sudah dinilai"
            subtitle={hasAnyUngraded ? "Masih ada UNGRADED / NO_PARTICIPANT" : "Nilai lengkap"}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<IconUser size={18} />} iconPosition="start" label="Ringkasan" />
        <Tab icon={<IconChecklist size={18} />} iconPosition="start" label={`Komponen Tes (${tests.length})`} />
        <Tab icon={<IconTimeline size={18} />} iconPosition="start" label="Timeline" />
      </Tabs>

      {/* TAB: Ringkasan */}
      {tab === 0 ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Identitas Pendaftar</Typography>
              <Table size="small">
                <TableBody>
                  <MetaRow label="Nama" value={application?.nama_calon_peserta_didik || "-"} />
                  <MetaRow label="Kode Pendaftaran" value={application?.kode_pendaftaran || "-"} />
                  <MetaRow label="Status" value={<Chip size="small" label={appStatus.label} color={appStatus.color} />} />
                  <MetaRow label="Scope" value={scopeLabel} />
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Ringkasan Nilai</Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  icon={<IconCircleCheck size={16} />}
                  label={`GRADED: ${graded}`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  icon={<IconFileText size={16} />}
                  label={`UNGRADED: ${ungraded}`}
                  color="info"
                  size="small"
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  icon={<IconAlertTriangle size={16} />}
                  label={`NEEDS: ${needs}`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  icon={<IconX size={16} />}
                  label={`NO PARTICIPANT: ${noParticipant}`}
                  color="default"
                  size="small"
                  sx={{ fontWeight: 900 }}
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Table size="small">
                <TableBody>
                  <MetaRow label="Progress Dinilai" value={<b>{toPct(graded, total)}</b>} />
                  <MetaRow label="Sisa Belum Dinilai" value={<b>{toPct(ungraded + needs, total)}</b>} />
                  <MetaRow
                    label="Catatan"
                    value="Status nilai dihitung dari Result.graded_at / Enrollment.score + Attendance + Enrollment.status."
                  />
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* TAB: Komponen Tes */}
      {tab === 1 ? (
        <Box>
          {tests.length === 0 ? (
            <EmptyState
              title="Belum ada komponen tes"
              desc="Jika ini tidak wajar, berarti enrollment belum dibootstrap atau application belum punya requirement tes."
            />
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableBody>
                  {tests.map((t) => {
                    const nilaiChip = nilaiStatusChipProps(t?.nilai_status);
                    const isPassFail = Boolean(t?.is_passfail);
                    const hasScore = t?.result?.score !== null && t?.result?.score !== undefined;

                    return (
                      <TableRow key={t?.enrollment_id}>
                        <TableCell sx={{ width: 320, fontWeight: 900 }}>
                          {t?.test_nama || "-"}
                          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                            {t?.test_code || "-"} • {t?.test_type || "-"}
                            {isPassFail ? " • PASS/FAIL" : ""}
                          </Typography>
                          <Box sx={{ mt: 0.75 }}>
                            {renderNilaiStatusChip(t?.nilai_status, nilaiChip.label)}
                            {t?.nilai_label ? (
                              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                                {t.nilai_label}
                              </Typography>
                            ) : null}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ fontWeight: 700 }}>
                          <Typography sx={{ fontWeight: 900, mb: 0.25 }}>Sesi & Kehadiran</Typography>
                          <Typography sx={{ fontSize: 13 }}>
                            Sesi: {t?.session?.title || "-"}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                            {t?.session?.start_at ? `${fmtDateTime(t.session.start_at)} WIB` : "-"}{" "}
                            s/d{" "}
                            {t?.session?.end_at ? `${fmtDateTime(t.session.end_at)} WIB` : "-"}
                          </Typography>

                          <Divider sx={{ my: 0.75 }} />

                          <Typography sx={{ fontSize: 13 }}>
                            Attendance: <b>{t?.attendance?.status || "-"}</b>
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                            Check-in: {t?.attendance?.checkin_at ? `${fmtDateTime(t.attendance.checkin_at)} WIB` : "-"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ width: 260, fontWeight: 700 }}>
                          <Typography sx={{ fontWeight: 900, mb: 0.25 }}>Nilai</Typography>

                          <Table size="small" sx={{ "& td, & th": { borderBottom: "none", py: 0.35 } }}>
                            <TableBody>
                              <MetaRow
                                label="Score"
                                value={
                                  hasScore ? (
                                    <b>{t?.result?.score}</b>
                                  ) : t?.enrollment_score !== null && t?.enrollment_score !== undefined ? (
                                    <b>{t?.enrollment_score}</b>
                                  ) : (
                                    "-"
                                  )
                                }
                              />
                              <MetaRow
                                label="Passed"
                                value={boolChip(
                                  t?.result?.passed ?? t?.enrollment_passed ?? null,
                                  "LULUS",
                                  "TIDAK"
                                )}
                              />
                              <MetaRow
                                label="Graded At"
                                value={t?.result?.graded_at ? `${fmtDateTime(t.result.graded_at)} WIB` : "-"}
                              />
                              <MetaRow
                                label="Catatan"
                                value={t?.result?.notes || "-"}
                              />
                            </TableBody>
                          </Table>

                          <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                            <Tooltip
                              title={!t?.participant_id ? "Belum ada participant (belum ikut tes)" : ""}
                              disableHoverListener={Boolean(t?.participant_id)}
                            >
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  disabled={!t?.participant_id}
                                  onClick={() => {
                                    // placeholder: kamu bisa arahkan ke halaman participant/result kalau ada
                                    window.open(`#`, "_self");
                                  }}
                                >
                                  Lihat Participant
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : null}

      {/* TAB: Timeline */}
      {tab === 2 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Timeline Pendaftaran</Typography>

          <Table size="small">
            <TableBody>
              {timeline.map((s) => (
                <MetaRow
                  key={s.key}
                  label={s.label}
                  value={s.time ? `${fmtDateTime(s.time)} WIB` : "-"}
                />
              ))}
            </TableBody>
          </Table>
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

export default PpdbNilaiDetailContent;