import PropTypes from 'prop-types';
import { Grid, Paper, Typography, Box } from '@mui/material';

const KpiCard = ({ title, value, helper, onClick, active = false }) => {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        borderWidth: active ? 2 : 1,
        transition: '0.15s',
        '&:hover': onClick ? { transform: 'translateY(-1px)' } : undefined
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {Number(value || 0)}
        </Typography>
      </Box>
      {helper ? (
        <Typography variant="body2" sx={{ mt: 0.6, color: 'text.secondary' }}>
          {helper}
        </Typography>
      ) : null}
    </Paper>
  );
};

const PpdbOverviewKpiCards = ({ kpi }) => {
  const items = [
    { key: 'total_pendaftar', title: 'Total', helper: 'Total pendaftar (semua status)' },
    { key: 'draft', title: 'Draft', helper: 'Belum submit' },
    { key: 'submitted', title: 'Submitted', helper: 'Sudah submit, belum finalisasi' },
    { key: 'finalized_menunggu_verifikasi', title: 'Perlu Verifikasi', helper: 'FINALIZED (locked), siap diverifikasi' },
    { key: 'revision_required', title: 'Revisi', helper: 'REVISION_REQUIRED' },
    { key: 'verified', title: 'Verified', helper: 'Terverifikasi panitia' },
    { key: 'accepted', title: 'Diterima', helper: 'ACCEPTED' },
    { key: 'rejected', title: 'Ditolak', helper: 'REJECTED' },
    { key: 're_registered', title: 'Daftar Ulang', helper: 'RE_REGISTERED' }
  ];

  return (
    <Grid container spacing={2}>
      {items.map((it) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={it.key}>
          <KpiCard title={it.title} value={kpi?.[it.key] ?? 0} helper={it.helper} />
        </Grid>
      ))}
    </Grid>
  );
};

PpdbOverviewKpiCards.propTypes = {
  kpi: PropTypes.object
};

export default PpdbOverviewKpiCards;
