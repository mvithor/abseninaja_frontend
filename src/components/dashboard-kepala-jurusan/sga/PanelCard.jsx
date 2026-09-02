import { Box } from '@mui/material';
import { T, RADIUS, SHADOW_CARD } from './sgaConfig';

// PRD §5.6 — wrapper surface reusable (Profile Data Siswa & Early Warning).
const PanelCard = ({ children, sx }) => (
  <Box
    sx={{
      backgroundColor: T.surface, borderRadius: RADIUS.card,
      border: `1px solid ${T.border}`, boxShadow: SHADOW_CARD,
      p: { xs: 2.5, md: 3.5 },
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default PanelCard;
