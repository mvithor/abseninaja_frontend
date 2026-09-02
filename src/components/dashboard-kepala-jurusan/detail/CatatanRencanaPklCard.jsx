import { Box, Typography, Button, useTheme } from '@mui/material';
import { IconPrinter } from '@tabler/icons-react';

// [TODO] "Lihat Detail Rencana PKL" belum punya halaman/route tujuan —
// tombol ditampilkan tapi sengaja non-aktif sampai route-nya diputuskan,
// bukan diarahkan ke path yang saya karang sendiri.
const CatatanRencanaPklCard = ({ catatan }) => {
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
        <Button variant="outlined" startIcon={<IconPrinter size={16} />} onClick={() => window.print()} sx={{ borderRadius: '8px', whiteSpace: 'nowrap' }}>
          Cetak
        </Button>
      </Box>
    </Box>
  );
};

export default CatatanRencanaPklCard;