import PropTypes from 'prop-types';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconArrowRight } from '@tabler/icons-react';
import DashboardCard from 'src/components/shared/DashboardCard';

const TILE = [
  { key: 'disetujui', label: 'Disetujui', color: 'success' },
  { key: 'menunggu_validasi', label: 'Menunggu Validasi', color: 'warning' },
  { key: 'perlu_revisi', label: 'Perlu Revisi', color: 'error' },
  { key: 'belum_unggah', label: 'Belum Unggah', color: 'secondary' },
];

const RingkasanPerangkatAjarCard = ({ ringkasan, semesterLabel, onLihatSemua }) => {
  const { jumlah, persenTerunggah, persenDisetujui } = ringkasan;

  return (
    <DashboardCard
      title="Perangkat Ajar Saya"
      subtitle={semesterLabel}
      action={
        <Button size="small" endIcon={<IconArrowRight size={16} />} onClick={onLihatSemua} sx={{ textTransform: 'none' }}>
          Kelola
        </Button>
      }
    >
      <Grid container spacing={2}>
        {TILE.map((t) => (
          <Grid key={t.key} size={{ xs: 6, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${t.color}.light`, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color={`${t.color}.main`}>{jumlah[t.key] || 0}</Typography>
              <Typography variant="subtitle2" color={`${t.color}.dark`}>{t.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2">Terunggah</Typography>
          <Typography variant="subtitle2">{jumlah.total - jumlah.belum_unggah}/{jumlah.total} ({persenTerunggah}%)</Typography>
        </Box>
        <LinearProgress variant="determinate" value={persenTerunggah} sx={{ height: 8, borderRadius: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 0.5 }}>
          <Typography variant="subtitle2">Disetujui Waka Kurikulum</Typography>
          <Typography variant="subtitle2">{jumlah.disetujui}/{jumlah.total} ({persenDisetujui}%)</Typography>
        </Box>
        <LinearProgress variant="determinate" color="success" value={persenDisetujui} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {jumlah.terkunci > 0 && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {jumlah.terkunci} dokumen terkunci karena deadline lewat. Hubungi Waka Kurikulum bila perlu dibuka.
        </Typography>
      )}
    </DashboardCard>
  );
};

RingkasanPerangkatAjarCard.propTypes = {
  ringkasan: PropTypes.object.isRequired,
  semesterLabel: PropTypes.string,
  onLihatSemua: PropTypes.func.isRequired,
};

export default RingkasanPerangkatAjarCard;
