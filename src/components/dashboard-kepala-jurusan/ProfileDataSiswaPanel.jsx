import { useState } from 'react';
import { Box, Typography, IconButton, Button, useTheme } from '@mui/material';
import { IconList, IconChartScatter, IconFilter } from '@tabler/icons-react';
import { KUADRAN_CONFIG, SCATTER_SERIES_ORDER } from './kuadranConfig';
import { formatAmbang } from './kuadranConfig';
import PapanKuadranSiswa from './PapanKuadranSiswa';
import ScatterKuadranSiswa from './ScatterKuadranSiswa';
import StudentDetailModal from './StudentDetailModal';

const ProfileDataSiswaPanel = ({ kuadran, ringkasan, ambangBehavior, ambangCompetency }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? theme.palette.action.hover : theme.palette.background.paper;

  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);

  const handleSelect = (siswa, kuadranKey) => setSelected({ siswa, kuadranKey });
  const handleClose = () => setSelected(null);

  return (
    <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: cardBg, boxShadow: theme.shadows[1] }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Profile Data Siswa</Typography>
          <Typography variant="caption" sx={{ color: '#596D81' }}>
  Behavior Score × Skor Kompetensi · Ambang {formatAmbang(ambangBehavior)}/{formatAmbang(ambangCompetency)}
</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {SCATTER_SERIES_ORDER.map((key) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: KUADRAN_CONFIG[key].color }} />
              <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>{KUADRAN_CONFIG[key].label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 1, mb: 1.5 }}>
        {/* Scope filter belum disepakati — tombol sengaja belum fungsional */}
        <Button size="small" startIcon={<IconFilter size={15} />} sx={{ color: 'text.secondary' }}>Filter</Button>
        <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
          <IconButton size="small" onClick={() => setMode('list')} sx={{ borderRadius: 0, backgroundColor: mode === 'list' ? 'primary.main' : 'transparent', color: mode === 'list' ? 'primary.contrastText' : 'text.secondary' }}>
            <IconList size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => setMode('scatter')} sx={{ borderRadius: 0, backgroundColor: mode === 'scatter' ? 'primary.main' : 'transparent', color: mode === 'scatter' ? 'primary.contrastText' : 'text.secondary' }}>
            <IconChartScatter size={16} />
          </IconButton>
        </Box>
      </Box>

      {mode === 'list' ? (
        <PapanKuadranSiswa kuadran={kuadran} ringkasan={ringkasan} onSelectSiswa={handleSelect} />
      ) : (
        <ScatterKuadranSiswa kuadran={kuadran} ambangBehavior={ambangBehavior} ambangCompetency={ambangCompetency} onSelectSiswa={handleSelect} />
      )}

      <StudentDetailModal
        open={!!selected}
        onClose={handleClose}
        siswa={selected?.siswa}
        kuadranKey={selected?.kuadranKey}
        ambangBehavior={ambangBehavior}
        ambangCompetency={ambangCompetency}
      />
    </Box>
  );
};

export default ProfileDataSiswaPanel;