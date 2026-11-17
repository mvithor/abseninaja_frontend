import { Box } from '@mui/material';
import { hanyaPembaca } from '../theme/sx';

// Teks tersembunyi secara visual untuk butir nonaktif (halaman belum dibangun),
// supaya pembaca layar tahu alasannya. Dipakai TautanNav, BottomTabBar, TombolLanding.
export default function SegeraHadir() {
  return (
    <Box component="span" sx={hanyaPembaca}>
      {' '}
      (segera hadir)
    </Box>
  );
}
