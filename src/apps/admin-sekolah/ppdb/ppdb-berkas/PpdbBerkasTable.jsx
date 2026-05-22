// src/apps/admin-sekolah/ppdb/ppdb-berkas/PpdbBerkasTable.jsx
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Tooltip,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Button
} from '@mui/material';
import { IconEye, IconLock, IconAlertCircle } from '@tabler/icons-react';

const getStatusChipProps = (status) => {
  const s = String(status || '').toUpperCase();

  // ✅ sesuai controller terbaru (unlock & resubmit)
  if (s === 'FINALIZED') return { label: 'FINALIZED', color: 'success' }; // locked, siap diverifikasi
  if (s === 'REVISION_REQUIRED') return { label: 'REVISION REQUIRED', color: 'warning' }; // UNLOCKED: menunggu resubmit
  if (s === 'SUBMITTED') return { label: 'SUBMITTED', color: 'info' }; // submit tapi belum locked
  if (s === 'VERIFIED') return { label: 'VERIFIED', color: 'primary' };
  if (s === 'RE_REGISTERED') return { label: 'RE-REGISTERED', color: 'secondary' };
  if (s === 'DRAFT') return { label: 'DRAFT', color: 'default' };

  // legacy tolerance
  if (s === 'ACCEPTED') return { label: 'ACCEPTED', color: 'default' };
  if (s === 'REJECTED') return { label: 'REJECTED', color: 'default' };

  return { label: s || '-', color: 'default' };
};

const getVerificationStateChipProps = (state) => {
  const s = String(state || '').toUpperCase();
  if (s === 'NEED_REVIEW') return { label: 'NEED REVIEW', color: 'info' };
  if (s === 'COMPLETE') return { label: 'COMPLETE', color: 'success' };
  if (s === 'INCOMPLETE') return { label: 'INCOMPLETE', color: 'warning' };
  return { label: s || '-', color: 'default' };
};

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const StatPill = ({ label, value, color = 'default' }) => {
  return (
    <Chip
      size="small"
      color={color}
      variant="outlined"
      label={
        <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{label}</Typography>
          <Typography sx={{ fontSize: 12 }}>{Number(value || 0)}</Typography>
        </Box>
      }
    />
  );
};

StatPill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'])
};

const ActionHint = ({ canReview, reason, status }) => {
  const st = String(status || '').toUpperCase();

  if (canReview) {
    const hintText =
      st === 'FINALIZED'
        ? 'Locked: siap diverifikasi'
        : st === 'VERIFIED'
          ? 'Verified: audit / review ulang (opsional)'
          : 'Siap ditinjau';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
        <IconLock size={16} />
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {hintText}
        </Typography>
      </Box>
    );
  }

  // ✅ REVISION_REQUIRED sekarang UNLOCKED → admin tidak review
  const lockedText =
    st === 'REVISION_REQUIRED'
      ? 'UNLOCKED: pendaftar sedang revisi, tunggu resubmit & finalisasi ulang'
      : `Belum bisa diverifikasi${reason ? `: ${reason}` : ''}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.2 }}>
      <IconAlertCircle size={16} />
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {lockedText}
      </Typography>
    </Box>
  );
};

ActionHint.propTypes = {
  canReview: PropTypes.bool,
  reason: PropTypes.string,
  status: PropTypes.string
};

const PpdbBerkasTable = ({ rows, isLoading, isError, errorMessage, onView }) => {
  if (isLoading) {
    return (
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, p: 2 }}>
          <Typography color="error" variant="h6">
            {errorMessage || 'Gagal memuat data'}
          </Typography>
        </Box>
      </Paper>
    );
  }

  if ((rows?.length || 0) === 0) {
    return (
      <Paper variant="outlined">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, p: 2 }}>
          <Typography variant="h6">Tidak ada antrian verifikasi.</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {rows.map((a, idx) => {
        const stChip = getStatusChipProps(a?.status);
        const vsChip = getVerificationStateChipProps(a?.verification_state);

        const summary = a?.required_summary || {};
        const flags = a?.flags || {};
        const canReview = Boolean(flags?.can_review_files);
        const isLocked = Boolean(flags?.is_locked);

        const requiredTotal = Number(summary?.required_total || 0);
        const requiredUploaded = Number(summary?.required_uploaded || 0);

        const todoText = (() => {
          const st = String(a?.status || '').toUpperCase();
          const vs = String(a?.verification_state || '').toUpperCase();

          if (st === 'REVISION_REQUIRED') return 'Menunggu pendaftar perbaiki & resubmit';
          if (st === 'SUBMITTED') return 'Menunggu pendaftar finalisasi (LOCK)';
          if (vs === 'INCOMPLETE') return 'Dokumen wajib belum lengkap';
          if (vs === 'NEED_REVIEW') return 'Perlu review dokumen wajib';
          if (vs === 'COMPLETE') return 'Selesai (wajib approved semua)';
          return '-';
        })();

        const helperReason = (() => {
          const st = String(a?.status || '').toUpperCase();
          if (canReview) return null;

          // ✅ align dengan controller terbaru
          if (st === 'REVISION_REQUIRED') return 'tunggu pendaftar resubmit & finalisasi ulang (FINALIZED)';
          if (st === 'SUBMITTED') return 'menunggu finalisasi pendaftar (FINALIZED)';
          if (st === 'DRAFT') return 'pendaftaran masih DRAFT';
          if (!isLocked) return 'status belum memenuhi untuk review';
          return null;
        })();

        const ctaText = (() => {
          // ✅ jangan misleading: kalau tidak bisa review, jangan seolah-olah verifikasi
          if (canReview) return 'Verifikasi Sekarang';
          return 'Lihat Detail';
        })();

        const shouldHighlight = (() => {
          const st = String(a?.status || '').toUpperCase();
          const vs = String(a?.verification_state || '').toUpperCase();
          // ✅ highlight antrian utama: FINALIZED + NEED_REVIEW / INCOMPLETE
          if (st === 'FINALIZED' && (vs === 'NEED_REVIEW' || vs === 'INCOMPLETE')) return true;
          return false;
        })();

        return (
          <Grid item xs={12} md={6} lg={4} key={a?.id || idx}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.2,
                transition: '0.15s',
                borderWidth: shouldHighlight ? 2 : 1,
                '&:hover': { transform: 'translateY(-1px)' }
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {a?.kode_pendaftaran || '-'}
                  </Typography>

                  <Typography sx={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }} noWrap>
                    {a?.nama || '-'}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.4 }}>
                    WA: <b>{a?.wa || '-'}</b>
                    {a?.nisn ? (
                      <>
                        {' '}• NISN: <b>{a.nisn}</b>
                      </>
                    ) : null}
                  </Typography>

                  <ActionHint
                    canReview={canReview}
                    reason={helperReason}
                    status={a?.status}
                  />
                </Box>

                {/* Action */}
                <Tooltip
                  title={canReview ? 'Verifikasi' : 'Lihat (read-only)'}
                  placement="bottom"
                >
                  <span>
                    <IconButton onClick={() => onView?.(a?.id)}>
                      <IconEye width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {/* Chips */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                <Chip size="small" {...stChip} />
                <Chip size="small" {...vsChip} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={todoText}
                />
              </Stack>

              <Divider />

              {/* Meta */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Gelombang</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }} noWrap>
                    {a?.gelombang || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Jalur</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }} noWrap>
                    {a?.jalur || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Queue Time</Typography>
                  <Typography sx={{ fontSize: 13 }}>{formatDateTime(a?.queue_time)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Dokumen Wajib</Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    {requiredUploaded}/{requiredTotal} terunggah
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Stats */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                <StatPill label="Approved" value={summary?.required_approved} color="success" />
                <StatPill label="Pending" value={summary?.required_pending} color="info" />
                <StatPill label="Rejected" value={summary?.required_rejected} color="warning" />
                <StatPill label="Revision" value={summary?.required_revision_required} color="secondary" />
                <StatPill label="Need Review" value={summary?.required_need_review} color="primary" />
                <StatPill label="Missing" value={summary?.required_missing} color="error" />
              </Stack>

              {/* CTA */}
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Button
                  fullWidth
                  variant={canReview ? 'contained' : 'outlined'}
                  onClick={() => onView?.(a?.id)}
                  disabled={!a?.id}
                >
                  {ctaText}
                </Button>

                {!canReview ? (
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.8, textAlign: 'center' }}>
                    {String(a?.status || '').toUpperCase() === 'REVISION_REQUIRED'
                      ? 'Pendaftar sedang revisi. Admin review setelah pendaftar resubmit & FINALIZED.'
                      : 'Admin tidak bisa review sebelum pendaftar FINALIZED.'}
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

PpdbBerkasTable.propTypes = {
  rows: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  onView: PropTypes.func.isRequired
};

export default PpdbBerkasTable;
