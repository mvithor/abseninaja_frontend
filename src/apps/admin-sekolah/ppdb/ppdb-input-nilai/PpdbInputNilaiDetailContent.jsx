import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Chip,
  Divider,
  Typography,
  Button,
  Stack,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import {
  IconCheck,
  IconX,
  IconFileText,
  IconAlertTriangle,
  IconCircleCheck,
  IconLock,
  IconEdit,
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

const attendanceChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "PRESENT") return { label: "HADIR", color: "success", variant: "outlined" };
  if (s === "LATE") return { label: "TERLAMBAT", color: "warning", variant: "outlined" };
  if (s === "NOT_CHECKED_IN") return { label: "BELUM CHECK-IN", color: "default", variant: "outlined" };
  if (s === "ABSENT") return { label: "ABSEN", color: "error", variant: "outlined" };
  if (s === "DISQUALIFIED") return { label: "DISKUALIFIKASI", color: "error", variant: "filled" };
  return { label: s || "-", color: "default", variant: "outlined" };
};

const resultStatusChipProps = (status) => {
  const s = safeUpper(status);
  if (s === "FINAL") return { label: "FINAL", color: "success" };
  if (s === "DRAFT") return { label: "DRAFT", color: "warning" };
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

MetaRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
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

ReadinessItem.propTypes = {
  ok: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

const EmptyState = ({ title, desc }) => {
  return (
    <Box sx={{ p: 2, border: "1px dashed", borderColor: "grey.300", borderRadius: 2 }}>
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{desc}</Typography>
    </Box>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
};

const clampNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  return n;
};

const formatScore = (score) => {
  const n = clampNumber(score);
  if (n === null) return "-";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const getModeLabel = (mode) => {
  const m = safeUpper(mode);
  if (!m) return "-";
  if (m === "OFFLINE") return "OFFLINE";
  if (m === "ONLINE") return "ONLINE";
  if (m === "HYBRID") return "HYBRID";
  return m;
};

const getRoomLabel = (d) => {
  const sr = d?.SessionRoom || {};
  const label = sr?.room_label || sr?.Room?.nama || "-";
  const seat = d?.seat_number ? String(d.seat_number) : "-";
  return `${label} | ${seat}`;
};

const computeCanGrade = ({ participantStatus, sessionStatus, attendanceStatus }) => {
  const ps = safeUpper(participantStatus);
  const ss = safeUpper(sessionStatus);
  const as = safeUpper(attendanceStatus);

  const okParticipant = ps === "ASSIGNED";
  const okSession = ss && ss !== "CANCELLED";
  const okAttendance = as === "PRESENT" || as === "LATE";

  return {
    okParticipant,
    okSession,
    okAttendance,
    canGrade: okParticipant && okSession && okAttendance,
  };
};

const PpdbInputNilaiDetailContent = ({
  detail,
  onBack,
  isActionLoading,
  onSubmitNilai,
  onReopen,
}) => {
  const d = useMemo(() => detail || {}, [detail]);

  const application = useMemo(() => d?.Application || {}, [d]);
  const session = useMemo(() => d?.Session || {}, [d]);
  const component = useMemo(() => session?.Component || {}, [session]);
  const sessionRoom = useMemo(() => d?.SessionRoom || {}, [d]);
  const attendance = useMemo(() => d?.Attendance || null, [d]);
  const result = useMemo(() => d?.Result || null, [d]);
  const enrollment = useMemo(() => d?.Enrollment || null, [d]);

  const appStatus = useMemo(
    () => statusAppChipProps(application?.status),
    [application?.status]
  );

  const attChip = useMemo(
    () => attendanceChipProps(attendance?.status || "NOT_CHECKED_IN"),
    [attendance?.status]
  );

  const resStatus = useMemo(
    () => resultStatusChipProps(result?.status || ""),
    [result?.status]
  );

  const isResultFinal = useMemo(
    () => safeUpper(result?.status) === "FINAL",
    [result?.status]
  );

  const componentIsPassFail = useMemo(
    () => component?.is_passfail === true,
    [component?.is_passfail]
  );

  const componentActive = useMemo(
    () => component?.is_active !== false,
    [component?.is_active]
  );

  const scoreMin = useMemo(() => {
    const v = clampNumber(component?.score_min);
    return v === null ? 0 : v;
  }, [component?.score_min]);

  const scoreMax = useMemo(() => {
    const v = clampNumber(component?.score_max);
    return v === null ? 100 : v;
  }, [component?.score_max]);

  const rule = useMemo(() => {
    return computeCanGrade({
      participantStatus: d?.status,
      sessionStatus: session?.status,
      attendanceStatus: attendance?.status,
    });
  }, [d?.status, session?.status, attendance?.status]);

  const lockedBecauseFinal = useMemo(() => isResultFinal === true, [isResultFinal]);

  const canEdit = useMemo(() => {
    return rule.canGrade && !lockedBecauseFinal && componentActive;
  }, [rule.canGrade, lockedBecauseFinal, componentActive]);

  const showWhyBlocked = useMemo(() => {
    const reasons = [];

    if (!rule.okParticipant) reasons.push("Peserta tidak berstatus ASSIGNED");
    if (!rule.okSession) reasons.push("Sesi berstatus CANCELLED / tidak valid");
    if (!rule.okAttendance) reasons.push("Attendance bukan PRESENT/LATE (tidak eligible dinilai)");
    if (!componentActive) reasons.push("Komponen tes nonaktif");
    if (lockedBecauseFinal) reasons.push("Result sudah FINAL (terkunci). Klik REOPEN untuk mengubah.");

    return reasons;
  }, [rule.okParticipant, rule.okSession, rule.okAttendance, componentActive, lockedBecauseFinal]);

  // ===== Form state (harus sync saat detail berubah) =====
  const computedInitialScore = useMemo(() => {
    const v = result?.score ?? enrollment?.score ?? null;
    const n = clampNumber(v);
    return n === null ? "" : String(n);
  }, [result?.score, enrollment?.score]);

  const computedInitialPassed = useMemo(() => {
    const v = result?.passed ?? enrollment?.passed ?? null;
    if (v === true) return true;
    if (v === false) return false;
    return null;
  }, [result?.passed, enrollment?.passed]);

  const computedInitialNotes = useMemo(() => {
    const n = String(result?.notes ?? "").trim();
    return n || "";
  }, [result?.notes]);

  const [score, setScore] = useState(computedInitialScore);
  const [passedToggle, setPassedToggle] = useState(computedInitialPassed === true);
  const [usePassedToggle, setUsePassedToggle] = useState(componentIsPassFail && computedInitialPassed !== null);
  const [notes, setNotes] = useState(computedInitialNotes);

  useEffect(() => {
    // reset state saat pindah participant / data masuk
    setScore(computedInitialScore);
    setNotes(computedInitialNotes);

    const initPassed = computedInitialPassed;
    setPassedToggle(initPassed === true);

    const shouldUsePassed = componentIsPassFail && initPassed !== null;
    setUsePassedToggle(shouldUsePassed);
  }, [
    d?.id,
    computedInitialScore,
    computedInitialNotes,
    computedInitialPassed,
    componentIsPassFail,
  ]);

  const scoreNumber = useMemo(() => {
    if (score === "" || score === null || score === undefined) return null;
    const n = clampNumber(score);
    return n === null ? null : n;
  }, [score]);

  const passedValue = useMemo(() => {
    if (!componentIsPassFail) return undefined;
    if (!usePassedToggle) return undefined;
    return Boolean(passedToggle);
  }, [componentIsPassFail, usePassedToggle, passedToggle]);

  const canSubmitDraft = useMemo(() => {
    if (!canEdit) return false;
    const hasAny = score !== "" || (componentIsPassFail && usePassedToggle) || (notes && notes.trim().length > 0);
    return Boolean(hasAny);
  }, [canEdit, score, componentIsPassFail, usePassedToggle, notes]);

  const validateBeforeFinal = () => {
    if (!canEdit) return { ok: false, msg: "Tidak bisa submit: kondisi belum eligible" };

    if (componentIsPassFail) {
      const hasDecision = (usePassedToggle && typeof passedValue === "boolean") || scoreNumber !== null;
      if (!hasDecision) return { ok: false, msg: "Untuk komponen PASS/FAIL, isi Passed atau Score sebelum FINAL" };
    } else {
      if (scoreNumber === null) return { ok: false, msg: "Nilai (score) wajib diisi untuk FINAL" };
    }

    if (scoreNumber !== null) {
      if (scoreNumber < scoreMin) return { ok: false, msg: `Nilai tidak boleh < ${scoreMin}` };
      if (scoreNumber > scoreMax) return { ok: false, msg: `Nilai tidak boleh > ${scoreMax}` };
    }

    return { ok: true };
  };

  const onClickSaveDraft = () => {
    if (!onSubmitNilai) return;
    if (!canSubmitDraft) return;

    const payload = { status: "DRAFT" };

    if (score !== "") payload.score = scoreNumber;
    if (componentIsPassFail && usePassedToggle) payload.passed = passedValue;
    if (notes !== undefined) payload.notes = notes;

    onSubmitNilai(payload);
  };

  const onClickSaveFinal = () => {
    if (!onSubmitNilai) return;

    const v = validateBeforeFinal();
    if (!v.ok) {
      onSubmitNilai({ __client_error: v.msg });
      return;
    }

    const payload = { status: "FINAL" };

    if (score !== "") payload.score = scoreNumber;
    if (componentIsPassFail && usePassedToggle) payload.passed = passedValue;
    if (notes !== undefined) payload.notes = notes;

    onSubmitNilai(payload);
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

                <Chip
                  label={`Result: ${resStatus.label}`}
                  size="small"
                  color={resStatus.color}
                  sx={{ borderRadius: "4px", fontWeight: 900, height: 22 }}
                />
              </Stack>

              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                Komponen: <b>{component?.nama || "-"}</b>{" "}
                {component?.code ? <>({component.code})</> : null}
                {" • "}
                Type: <b>{safeUpper(component?.type) || "-"}</b>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={onBack} disabled={isActionLoading}>
                Kembali
              </Button>

              <Tooltip
                title={!isResultFinal ? "REOPEN hanya untuk result FINAL" : "Ubah FINAL → DRAFT agar bisa diedit"}
                placement="bottom"
              >
                <span>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<IconEdit size={18} />}
                    disabled={!isResultFinal || isActionLoading || !onReopen}
                    onClick={() => onReopen && onReopen()}
                  >
                    Reopen
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        <Divider />

        {/* META RINGKAS */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Informasi Tes
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow label="Participant ID" value={<b>{d?.id || "-"}</b>} />
                  <MetaRow label="Participant Status" value={<b>{safeUpper(d?.status) || "-"}</b>} />
                  <MetaRow label="Sesi" value={<b>{session?.title || "-"}</b>} />
                  <MetaRow label="Status Sesi" value={<b>{safeUpper(session?.status) || "-"}</b>} />
                  <MetaRow
                    label="Waktu Sesi"
                    value={
                      <>
                        <b>{session?.start_at ? `${fmtDateTime(session.start_at)} WIB` : "-"}</b>{" "}
                        s/d{" "}
                        <b>{session?.end_at ? `${fmtDateTime(session.end_at)} WIB` : "-"}</b>
                      </>
                    }
                  />
                  <MetaRow label="Mode Ruang" value={<b>{getModeLabel(sessionRoom?.mode || sessionRoom?.mode)}</b>} />
                  <MetaRow label="Ruang | Kursi" value={<b>{getRoomLabel(d)}</b>} />
                </TableBody>
              </Table>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>
                Kehadiran & Nilai Tersimpan
              </Typography>

              <Table size="small">
                <TableBody>
                  <MetaRow
                    label="Attendance"
                    value={
                      <Chip size="small" label={attChip.label} color={attChip.color} variant={attChip.variant} />
                    }
                  />
                  <MetaRow
                    label="Check-in At"
                    value={attendance?.checkin_at ? `${fmtDateTime(attendance.checkin_at)} WIB` : "-"}
                  />
                  <MetaRow
                    label="Score (Result)"
                    value={<b>{result?.score !== null && result?.score !== undefined ? formatScore(result.score) : "-"}</b>}
                  />
                  <MetaRow
                    label="Passed (Result)"
                    value={boolChip(result?.passed ?? null, "LULUS", "TIDAK")}
                  />
                  <MetaRow
                    label="Graded At"
                    value={result?.graded_at ? `${fmtDateTime(result.graded_at)} WIB` : "-"}
                  />
                  <MetaRow
                    label="Graded By"
                    value={result?.GradedBy?.name || "-"}
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
        Gate Penilaian (Rule Controller)
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(rule.okParticipant)}
            title="Status ASSIGNED"
            subtitle={rule.okParticipant ? "OK" : "Wajib ASSIGNED agar bisa dinilai"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(rule.okSession)}
            title="Sesi tidak CANCELLED"
            subtitle={rule.okSession ? "OK" : "Sesi CANCELLED diblokir"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(rule.okAttendance)}
            title="Attendance PRESENT/LATE"
            subtitle={rule.okAttendance ? "Eligible" : "Hanya PRESENT/LATE boleh input nilai"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <ReadinessItem
            ok={Boolean(!lockedBecauseFinal)}
            title="Result tidak terkunci"
            subtitle={!lockedBecauseFinal ? "Bisa edit" : "FINAL terkunci, harus REOPEN"}
          />
        </Grid>
      </Grid>

      {showWhyBlocked.length ? (
        <Box sx={{ mt: 1.5 }}>
          <Alert
            severity={canEdit ? "info" : "warning"}
            icon={canEdit ? <IconCircleCheck size={18} /> : <IconAlertTriangle size={18} />}
            sx={{ alignItems: "center" }}
          >
            <Typography sx={{ fontWeight: 800 }}>
              {canEdit ? "Eligible untuk input nilai" : "Tidak bisa input nilai saat ini"}
            </Typography>
            {!canEdit ? (
              <Box sx={{ mt: 0.5 }}>
                {showWhyBlocked.map((t, i) => (
                  <Typography key={String(i)} sx={{ fontSize: 13 }}>
                    • {t}
                  </Typography>
                ))}
              </Box>
            ) : null}
          </Alert>
        </Box>
      ) : null}

      <Divider sx={{ my: 2 }} />

      {/* INPUT NILAI (tanpa tabs) */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 900, mb: 0.75 }}>
              Form Input Nilai
            </Typography>

            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
              Range score: <b>{scoreMin}</b> – <b>{scoreMax}</b>{" "}
              {componentIsPassFail ? "• Mode PASS/FAIL aktif" : ""}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Score"
                  placeholder={componentIsPassFail ? "Opsional (boleh kosong jika isi Passed)" : "Wajib untuk FINAL"}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={!canEdit || isActionLoading}
                  helperText={
                    componentIsPassFail
                      ? "Jika PASS/FAIL, score opsional."
                      : "Untuk FINAL, score wajib diisi."
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                  <Stack spacing={0.75} sx={{ width: "100%" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(usePassedToggle)}
                          onChange={(e) => setUsePassedToggle(e.target.checked)}
                          disabled={!componentIsPassFail || !canEdit || isActionLoading}
                        />
                      }
                      label="Gunakan Passed (PASS/FAIL)"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(passedToggle)}
                          onChange={(e) => setPassedToggle(e.target.checked)}
                          disabled={!componentIsPassFail || !usePassedToggle || !canEdit || isActionLoading}
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>Passed</Typography>
                          {componentIsPassFail && usePassedToggle ? boolChip(passedToggle, "LULUS", "TIDAK") : null}
                        </Stack>
                      }
                    />
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Catatan"
                  placeholder="Opsional. Maks 2000 karakter."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canEdit || isActionLoading}
                  multiline
                  minRows={3}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Tooltip
                title={!canSubmitDraft ? "Isi minimal 1 field dan pastikan eligible" : "Simpan sebagai DRAFT"}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<IconFileText size={18} />}
                    disabled={!canSubmitDraft || isActionLoading}
                    onClick={onClickSaveDraft}
                  >
                    Simpan Draft
                  </Button>
                </span>
              </Tooltip>

              <Tooltip
                title={!canEdit ? "Tidak eligible / terkunci FINAL" : "Simpan sebagai FINAL"}
                placement="top"
              >
                <span>
                  <Button
                    variant="contained"
                    startIcon={lockedBecauseFinal ? <IconLock size={18} /> : <IconCircleCheck size={18} />}
                    disabled={!canEdit || isActionLoading}
                    onClick={onClickSaveFinal}
                  >
                    Simpan Final
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Ringkasan Cepat
            </Typography>

            <Table size="small">
              <TableBody>
                <MetaRow label="Nama" value={application?.nama_calon_peserta_didik || "-"} />
                <MetaRow label="NISN" value={application?.nisn || "-"} />
                <MetaRow label="Kode" value={application?.kode_pendaftaran || "-"} />
                <MetaRow label="Komponen" value={<b>{component?.nama || "-"}</b>} />
                <MetaRow label="Sesi" value={<b>{session?.title || "-"}</b>} />
                <MetaRow label="Ruang | Kursi" value={<b>{getRoomLabel(d)}</b>} />
                <MetaRow
                  label="Attendance"
                  value={<Chip size="small" label={attChip.label} color={attChip.color} variant={attChip.variant} />}
                />
                <MetaRow
                  label="Nilai tersimpan"
                  value={
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        label={`Score: ${result?.score !== null && result?.score !== undefined ? formatScore(result.score) : "-"}`}
                      />
                      <Chip
                        size="small"
                        label={`Passed: ${result?.passed === true ? "LULUS" : result?.passed === false ? "TIDAK" : "-"}`}
                      />
                      <Chip size="small" label={`Status: ${resStatus.label}`} color={resStatus.color} />
                    </Stack>
                  }
                />
              </TableBody>
            </Table>

            <Divider sx={{ my: 1.5 }} />

            {!componentActive ? (
              <EmptyState
                title="Komponen nonaktif"
                desc="Controller akan menolak penilaian jika komponen is_active = false."
              />
            ) : null}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button variant="contained" color="secondary" onClick={onBack} disabled={isActionLoading}>
          Kembali
        </Button>
      </Box>
    </Box>
  );
};

PpdbInputNilaiDetailContent.propTypes = {
  detail: PropTypes.object,
  onBack: PropTypes.func,
  isActionLoading: PropTypes.bool,
  onSubmitNilai: PropTypes.func,
  onReopen: PropTypes.func,
};

export default PpdbInputNilaiDetailContent;