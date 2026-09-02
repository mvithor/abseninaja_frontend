import { Box, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import { KUADRAN_CONFIG } from '../kuadranConfig';

const REKOMENDASI_RINGKAS = {
  SIAP_PENUH: 'Pertahankan performa saat ini',
  RISIKO_BEHAVIOR: 'Pembinaan disiplin & sikap kerja',
  RISIKO_COMPETENCY: 'Penguatan kompetensi teknis',
  RISIKO_GANDA: 'Perlu pendampingan intensif dua sisi',
};

const ProfilDiagnostikCard = ({
  profilStatus, behaviorScore, competencyScore,
  ambangBehavior, ambangCompetency, behaviorSiap, competencySiap,
}) => {
  const theme = useTheme();
  const cfg = KUADRAN_CONFIG[profilStatus];
  const rekomendasi = REKOMENDASI_RINGKAS[profilStatus] || null;

  // [FIX] Warna garis ambang sebelumnya pakai theme.palette.divider —
  // warna itu didesain untuk border tipis antar elemen (sengaja sangat
  // pudar), bukan untuk elemen yang perlu diperhatikan user. Diganti ke
  // abu-abu lebih pekat + border sedikit lebih tebal supaya garis
  // ambang (behavior & kompetensi) terlihat jelas di chart 130px.
  const warnaGarisAmbang = theme.palette.mode === 'dark' ? '#6B7280' : '#9CA3AF';

  const options = {
    chart: { type: 'scatter', toolbar: { show: false }, zoom: { enabled: false } },
    colors: [cfg?.color || theme.palette.text.disabled],
    markers: { size: 9 },
    xaxis: { min: 0, max: 100, labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { min: 0, max: 100, labels: { show: false }, axisTicks: { show: false } },
    grid: { show: false },
    annotations: {
      xaxis: [{ x: Number(ambangBehavior) || 0, borderColor: warnaGarisAmbang, borderWidth: 1.5, strokeDashArray: 5 }],
      yaxis: [{ y: Number(ambangCompetency) || 0, borderColor: warnaGarisAmbang, borderWidth: 1.5, strokeDashArray: 5 }],
    },
    tooltip: { enabled: false },
  };

  const series = [{ name: 'Posisi', data: [{ x: behaviorScore ?? 0, y: competencyScore ?? 0 }] }];

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, textAlign: 'center' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Profil Diagnostik</Typography>
      <Chart options={options} series={series} type="scatter" height={130} />

      {cfg && (
        <Typography variant="h6" fontWeight={800} sx={{ color: cfg.color, mt: 1 }}>{cfg.label}</Typography>
      )}
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
        Behavior: {behaviorSiap ? 'Baik' : 'Kurang'} · Kompetensi: {competencySiap ? 'Baik' : 'Perlu Penguatan'}
      </Typography>

      {rekomendasi && (
        <Box sx={{ py: 1, px: 1.5, borderRadius: '8px', backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : '#EEF2FF' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Rekomendasi intervensi</Typography>
          <Typography variant="body2" fontWeight={700}>{rekomendasi}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfilDiagnostikCard;