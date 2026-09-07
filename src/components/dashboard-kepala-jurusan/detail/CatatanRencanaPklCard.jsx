import PropTypes from 'prop-types';
import { Box, Typography, Button, CircularProgress, useTheme } from '@mui/material';
import { IconPrinter } from '@tabler/icons-react';

// [TODO] "Lihat Detail Rencana PKL" belum punya halaman/route tujuan —
// tombol ditampilkan tapi sengaja non-aktif sampai route-nya diputuskan,
// bukan diarahkan ke path yang saya karang sendiri.
//
// Tombol "Cetak" memicu export PDF Profil Kesiapan Kerja lewat prop `onCetak`
// (logika penarikan API ada di layer Views: profilSiswaExportApi.jsx).
const CatatanRencanaPklCard = ({ catatan, onCetak, exporting = false }) => {
  const theme = useTheme();
  if (!catatan) return null;

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Catatan Rencana PKL</Typography>
      <Box sx={{ p: 1.5, mb: 2, borderRadius: '8px', backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : '#F5F3FF' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{catatan}</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" fullWidth disabled sx={{ borderRadius: '8px' }}>
          Lihat Detail Rencana PKL
        </Button>
        <Button
          variant="outlined"
          disabled={exporting || !onCetak}
          onClick={onCetak}
          startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <IconPrinter size={16} />}
          sx={{ borderRadius: '8px', whiteSpace: 'nowrap' }}
        >
          {exporting ? 'Menyiapkan...' : 'Cetak'}
        </Button>
      </Box>
    </Box>
  );
};

CatatanRencanaPklCard.propTypes = {
  catatan: PropTypes.string,
  onCetak: PropTypes.func,
  exporting: PropTypes.bool,
};

export default CatatanRencanaPklCard;