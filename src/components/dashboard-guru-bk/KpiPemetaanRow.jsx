import PropTypes from 'prop-types';
import { Box, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconAlertTriangle, IconSchool, IconUrgent, IconUsers } from '@tabler/icons-react';

// Baris stat tile: angka utama + keterangan. Angka diambil dari server, bukan array.length di FE.
const Tile = ({ icon, label, nilai, keterangan, onClick, isLoading }) => {
  const Icon = icon;
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s',
        '&:hover': onClick ? { borderColor: 'primary.main' } : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
        <Icon size={18} />
        <Typography variant="subtitle2">{label}</Typography>
      </Box>
      <Typography variant="h2" sx={{ mt: 1 }}>
        {isLoading ? <Skeleton width={60} /> : nilai}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {keterangan}
      </Typography>
    </Box>
  );
};

Tile.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  nilai: PropTypes.node,
  keterangan: PropTypes.string,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
};

const persen = (a, b) => (b ? `${Math.round((a / b) * 100)}% dari siswa binaan` : '');

const KpiPemetaanRow = ({ ringkasan, isLoading, onPerhatian, onPrioritas }) => {
  const total = ringkasan?.total_siswa ?? 0;
  const tiles = [
    { icon: IconUsers, label: 'Siswa Binaan', nilai: total, keterangan: `${ringkasan?.per_kelas?.length ?? 0} kelas` },
    {
      icon: IconSchool,
      label: 'Kelas Binaan',
      nilai: ringkasan?.per_kelas?.length ?? 0,
      keterangan: 'Sesuai tanggung jawab BK',
    },
    {
      icon: IconAlertTriangle,
      label: 'Perlu Perhatian',
      nilai: ringkasan?.total_perhatian ?? 0,
      keterangan: `≥ 1 faktor · ${persen(ringkasan?.total_perhatian ?? 0, total)}`,
      onClick: onPerhatian,
    },
    {
      icon: IconUrgent,
      label: 'Prioritas Pendampingan',
      nilai: ringkasan?.total_prioritas ?? 0,
      keterangan: `≥ 2 faktor · ${persen(ringkasan?.total_prioritas ?? 0, total)}`,
      onClick: onPrioritas,
    },
  ];

  return (
    <Grid container spacing={2}>
      {tiles.map((t) => (
        <Grid key={t.label} size={{ xs: 6, md: 3 }}>
          <Tile {...t} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

KpiPemetaanRow.propTypes = {
  ringkasan: PropTypes.object,
  isLoading: PropTypes.bool,
  onPerhatian: PropTypes.func,
  onPrioritas: PropTypes.func,
};

export default KpiPemetaanRow;
