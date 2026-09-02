import { Box, Typography, Chip, useTheme } from '@mui/material';

const BADGE_CONFIG = {
  KRITIS: { color: '#DC2626', bg: '#FF383C14' },
  SEDANG: { color: '#D97706', bg: '#FF7B0114' },
};

const RekomendasiIntervensiCard = ({ rekomendasiIntervensi }) => {
  const theme = useTheme();
  const items = rekomendasiIntervensi || [];

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700}>Rekomendasi Intervensi</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Dihasilkan oleh sistem · Keputusan final ada pada kepala jurusan
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#34C75914' }}>
          <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
            Tidak ada rekomendasi intervensi — seluruh unit dan komponen behavior sudah memenuhi ambang.
          </Typography>
        </Box>
      ) : items.map((item, i) => {
        const cfg = BADGE_CONFIG[item.badge] || BADGE_CONFIG.SEDANG;
        const judul = item.judul_unit || item.label;
        const kodeAtauKomponen = item.kode_unit ? ` (${item.kode_unit})` : '';
        const skorText = item.skor !== null && item.skor !== undefined ? ` — skor ${Math.round(item.skor)}` : '';
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1.2, p: 1.2, mb: 1, borderRadius: '8px', border: `1px solid ${cfg.bg}`, backgroundColor: cfg.bg }}>
            <Chip size="small" label={item.badge} sx={{ backgroundColor: cfg.color, color: '#fff', fontWeight: 700, fontSize: '0.68rem', height: 22, flexShrink: 0 }} />
            <Typography variant="body2">
              <strong>{judul}{kodeAtauKomponen}</strong>{skorText}, {item.rekomendasi}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default RekomendasiIntervensiCard;