// src/components/dashboards-kepala-jurusan/RingkasanKuadranCards.jsx
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { KUADRAN_CONFIG } from './kuadranConfig';

// Bar proporsi murni MUI LinearProgress (determinate) — TIDAK pakai
// ApexCharts, itu overkill untuk indikator sesederhana ini. ApexCharts
// (sudah terpasang di package.json) ditahan untuk mode Scatter nanti.
const StatCard = ({ label, value, color, cardBg, percent }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: '10px',
      backgroundColor: cardBg,
    }}
  >
    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: 0.5 }}>
      {label.toUpperCase()}
    </Typography>
    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
      {value}
    </Typography>
    <LinearProgress
      variant="determinate"
      value={Math.max(percent, 3)} // minimum kecil supaya tetap kelihatan sebagai garis, bukan hilang total
      sx={{
        height: 4,
        borderRadius: 4,
        backgroundColor: (t) => (t.palette.mode === 'dark' ? 'action.hover' : '#F1F1F4'),
        '& .MuiLinearProgress-bar': {
          borderRadius: 4,
          backgroundColor: color,
        },
      }}
    />
  </Box>
);

const RingkasanKuadranCards = ({ totalSiswa, ringkasan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? theme.palette.action.hover : theme.palette.background.paper;

  // Proporsi terhadap total_siswa — dipilih SENGAJA supaya "Total Siswa"
  // otomatis dapat bar 100% tanpa kasus khusus (total/total = 100%), dan
  // makna bar konsisten: "porsi dari keseluruhan jurusan", bukan
  // dibandingkan antar-kartu.
  const pct = (value) => (totalSiswa > 0 ? (value / totalSiswa) * 100 : 0);

  const cards = [
    { key: 'TOTAL', label: 'Total Siswa', value: totalSiswa, color: theme.palette.primary.main, percent: pct(totalSiswa) },
    { key: 'SIAP_PENUH', label: KUADRAN_CONFIG.SIAP_PENUH.label, value: ringkasan.SIAP_PENUH ?? 0, color: KUADRAN_CONFIG.SIAP_PENUH.color, percent: pct(ringkasan.SIAP_PENUH ?? 0) },
    { key: 'RISIKO_BEHAVIOR', label: KUADRAN_CONFIG.RISIKO_BEHAVIOR.label, value: ringkasan.RISIKO_BEHAVIOR ?? 0, color: KUADRAN_CONFIG.RISIKO_BEHAVIOR.color, percent: pct(ringkasan.RISIKO_BEHAVIOR ?? 0) },
    { key: 'RISIKO_COMPETENCY', label: KUADRAN_CONFIG.RISIKO_COMPETENCY.label, value: ringkasan.RISIKO_COMPETENCY ?? 0, color: KUADRAN_CONFIG.RISIKO_COMPETENCY.color, percent: pct(ringkasan.RISIKO_COMPETENCY ?? 0) },
    { key: 'RISIKO_GANDA', label: KUADRAN_CONFIG.RISIKO_GANDA.label, value: ringkasan.RISIKO_GANDA ?? 0, color: KUADRAN_CONFIG.RISIKO_GANDA.color, percent: pct(ringkasan.RISIKO_GANDA ?? 0) },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((c) => (
        <Grid key={c.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard label={c.label} value={c.value} color={c.color} cardBg={cardBg} percent={c.percent} />
        </Grid>
      ))}
    </Grid>
  );
};

export default RingkasanKuadranCards;