// src/components/dashboards-kepala-jurusan/KelasTabs.jsx
import { Box, useTheme } from '@mui/material';

const KelasTabs = ({ kelasOptions, kelasId, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const containerBg = isDark ? theme.palette.action.hover : theme.palette.background.paper;

  const items = [{ id: null, nama_kelas: 'Semua Kelas' }, ...kelasOptions];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.6,
        mb: 2,
        borderRadius: '12px',
        backgroundColor: containerBg,
      }}
    >
      {items.map((k) => {
        const active = k.id === kelasId;
        return (
          <Box
            key={k.id ?? 'semua'}
            onClick={() => onChange(k.id)}
            sx={{
              px: 2,
              py: 0.9,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: active ? 'primary.main' : 'transparent',
              color: active ? 'primary.contrastText' : 'text.secondary',
              transition: 'background-color 0.15s, color 0.15s',
              '&:hover': {
                backgroundColor: active ? 'primary.main' : (isDark ? 'action.selected' : 'action.hover'),
              },
            }}
          >
            {k.nama_kelas}
          </Box>
        );
      })}
    </Box>
  );
};

export default KelasTabs;