// src/components/dashboards-kepala-jurusan/detail/UnitKompetensiCard.jsx
import { Box, Typography, Chip, useTheme } from '@mui/material';

const STATUS_UNIT_CONFIG = {
  MEMENUHI: { color: '#34A853', bg: '#34C75914', label: 'Memenuhi' },
  LEMAH: { color: '#D97706', bg: '#FF7B0114', label: 'Lemah' },
  KRITIS: { color: '#DC2626', bg: '#FF383C14', label: 'Kritis' },
};

// Urutan tampil: Inti dulu, Umum, baru Pilihan — konsisten dengan
// URUTAN_KATEGORI yang sudah dipakai rencana-pkl-service.js di backend.
const KATEGORI_ORDER = { kompetensi_inti: 0, kompetensi_umum: 1, kompetensi_pilihan: 2 };

const UnitKompetensiCard = ({ daftarUnit }) => {
  const theme = useTheme();
  const sorted = [...(daftarUnit || [])].sort((a, b) => {
    const diff = (KATEGORI_ORDER[a.kategori] ?? 9) - (KATEGORI_ORDER[b.kategori] ?? 9);
    return diff !== 0 ? diff : a.kode_unit.localeCompare(b.kode_unit);
  });

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700}>Unit Kompetensi SKKNI</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Data otomatis dari Penilaian Langsung guru per unit
      </Typography>

      {sorted.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>Belum ada data unit kompetensi.</Typography>
      ) : sorted.map((unit) => {
        const cfg = STATUS_UNIT_CONFIG[unit.status_unit] || STATUS_UNIT_CONFIG.LEMAH;
        return (
          <Box key={unit.kode_unit} sx={{ p: 1.5, mb: 1.2, borderRadius: '8px', backgroundColor: cfg.bg, border: `1px solid ${cfg.bg}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Box sx={{ minWidth: 0, pr: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{unit.kode_unit}</Typography>
                <Typography variant="body2" fontWeight={700}>{unit.judul_unit}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Typography variant="body1" fontWeight={800} sx={{ color: cfg.color }}>
                  {Math.round(unit.ketercapaian_unit)}
                </Typography>
                <Chip size="small" label={cfg.label} sx={{ backgroundColor: cfg.color, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>
            </Box>
            <Box sx={{ height: 5, borderRadius: 4, backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : '#fff', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${Math.min(unit.ketercapaian_unit, 100)}%`, backgroundColor: cfg.color, borderRadius: 4 }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default UnitKompetensiCard;