import { Box, Typography, Chip, useTheme } from '@mui/material';
import UserIcon from 'src/assets/images/svgs/user.svg?react';
import { KUADRAN_CONFIG } from '../kuadranConfig';

const ProfilSiswaDetailHeader = ({ header }) => {
  const theme = useTheme();
  const cfg = KUADRAN_CONFIG[header.profil_status];

  const subtitleParts = [
    header.tahun_ajaran ? `TA ${header.tahun_ajaran}` : null,
    header.semester ? `Semester ${header.semester === 'genap' ? 'Genap' : 'Ganjil'}` : null,
  ].filter(Boolean);

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {header.foto_url ? (
            <Box component="img" src={header.foto_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box component={UserIcon} sx={{ width: '100%', height: '100%' }} />
          )}
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={800}>{header.nama}</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>NIS {header.nis || '-'}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {[header.kelas, ...subtitleParts].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>Profile SGA</Typography>
        {cfg && (
          <Chip
            label={cfg.label}
            sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 700, borderRadius: '8px', border: `1px solid ${cfg.color}44` }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ProfilSiswaDetailHeader;