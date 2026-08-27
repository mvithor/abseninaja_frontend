import { Box, Typography, IconButton } from '@mui/material';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

const AlertBanner = ({ perizinanSiswaCount = 0, perizinanPegawaiCount = 0, mapelBelumDiisiCount = 0 }) => {
  const [dismissed, setDismissed] = useState(false);

  const total = perizinanSiswaCount + perizinanPegawaiCount + mapelBelumDiisiCount;
  if (dismissed || total === 0) return null;

  const parts = [];
  if (perizinanSiswaCount > 0) parts.push(`${perizinanSiswaCount} perizinan siswa`);
  if (perizinanPegawaiCount > 0) parts.push(`${perizinanPegawaiCount} perizinan pegawai`);
  if (mapelBelumDiisiCount > 0) parts.push(`${mapelBelumDiisiCount} sesi mapel belum diisi (jam sudah lewat)`);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        mb: 2,
        borderRadius: '8px',
        backgroundColor: '#FEF3C7',
        border: '1px solid #F59E0B',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconAlertTriangle size={18} color="#D97706" />
        <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 500 }}>
          <strong>{total} item butuh tindakan hari ini</strong>
          {' — '}
          {parts.join(' · ')}
        </Typography>
      </Box>
      <IconButton size="small" onClick={() => setDismissed(true)} sx={{ color: '#92400E' }}>
        <IconX size={16} />
      </IconButton>
    </Box>
  );
};

export default AlertBanner;
