// src/components/dashboards-kepala-jurusan/detail/TrenSkorChart.jsx
import { Box, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';

const cariNonNullPertama = (arr, key) => arr.find((t) => t[key] !== null)?.[key] ?? null;
const cariNonNullTerakhir = (arr, key) => [...arr].reverse().find((t) => t[key] !== null)?.[key] ?? null;

const DeltaBox = ({ label, dari, ke, bg }) => {
  if (dari === null || ke === null) {
    return (
      <Box sx={{ flex: 1, p: 1.2, borderRadius: '8px', backgroundColor: bg, textAlign: 'center' }}>
        <Typography variant="body2" fontWeight={700}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>Data belum cukup untuk dibandingkan</Typography>
      </Box>
    );
  }
  const delta = Math.round((ke - dari) * 10) / 10;
  const arah = delta > 0 ? 'Naik' : delta < 0 ? 'Turun' : 'Tetap';
  return (
    <Box sx={{ flex: 1, p: 1.2, borderRadius: '8px', backgroundColor: bg, textAlign: 'center' }}>
      <Typography variant="body2" fontWeight={700}>{label}: {delta >= 0 ? '+' : ''}{delta} poin</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {Math.round(dari)} → {Math.round(ke)} ({arah})
      </Typography>
    </Box>
  );
};

const TrenSkorChart = ({ tren, ambangBehavior }) => {
  const theme = useTheme();

  if (!tren?.tersedia || tren.titik.length === 0) {
    return (
      <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Tren Skor</Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
          Belum ada data semester untuk siswa ini.
        </Typography>
      </Box>
    );
  }

  const { titik } = tren;
  const jumlahSemester = titik.length;

  const behaviorAwal = cariNonNullPertama(titik, 'behavior_score');
  const behaviorAkhir = cariNonNullTerakhir(titik, 'behavior_score');
  const competencyAwal = cariNonNullPertama(titik, 'competency_score');
  const competencyAkhir = cariNonNullTerakhir(titik, 'competency_score');

  const options = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#34A853', '#2388FF'],
    stroke: { curve: 'straight', width: 3 },
    markers: { size: 5 },
    xaxis: { categories: titik.map((t) => t.label) },
    yaxis: { min: 0, max: 100 },
    grid: { strokeDashArray: 3 },
    legend: { position: 'top', horizontalAlign: 'right' },
    annotations: {
      yaxis: [
        { y: Number(ambangBehavior) || 70, borderColor: theme.palette.divider, strokeDashArray: 4, label: { text: `T=${Math.round(Number(ambangBehavior) || 70)}`, style: { fontSize: '10px' } } },
      ],
    },
  };

  const series = [
    { name: 'Behavior Score', data: titik.map((t) => t.behavior_score) },
    { name: 'Skor Kompetensi', data: titik.map((t) => t.competency_score) },
  ];

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1] }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.3 }}>
        Tren Skor — {jumlahSemester} Semester
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Perkembangan Behavior Score dan Skor Kompetensi sepanjang riwayat siswa
      </Typography>

      <Chart options={options} series={series} type="line" height={280} />

      <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
        <DeltaBox label="Behavior" dari={behaviorAwal} ke={behaviorAkhir} bg={theme.palette.mode === 'dark' ? 'action.hover' : '#EEF2FF'} />
        <DeltaBox label="Kompetensi" dari={competencyAwal} ke={competencyAkhir} bg={theme.palette.mode === 'dark' ? 'action.hover' : '#ECFDF5'} />
      </Box>
    </Box>
  );
};

export default TrenSkorChart;