import { Box, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';
import { KUADRAN_CONFIG, SCATTER_SERIES_ORDER } from './kuadranConfig';

const CORNER_LABEL = {
  topLeft: 'Risiko Behavior',
  topRight: 'Siap Penuh',
  bottomLeft: 'Risiko Ganda',
  bottomRight: 'Risiko Kompetensi',
};

const ScatterKuadranSiswa = ({ kuadran, ambangBehavior, ambangCompetency, onSelectSiswa }) => {
  const theme = useTheme();
  const quadranArrays = SCATTER_SERIES_ORDER.map((key) => kuadran[key] || []);
  const colors = SCATTER_SERIES_ORDER.map((key) => KUADRAN_CONFIG[key].color);

  const series = SCATTER_SERIES_ORDER.map((key, i) => ({
    name: KUADRAN_CONFIG[key].label,
    data: quadranArrays[i].map((s) => ({ x: s.behavior_score, y: s.competency_score })),
  }));

  const ambangX = Number(ambangBehavior) || 0;
  const ambangY = Number(ambangCompetency) || 0;

  const options = {
    chart: {
      type: 'scatter',
      toolbar: { show: false },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const siswa = quadranArrays[config.seriesIndex]?.[config.dataPointIndex];
          if (siswa) onSelectSiswa(siswa, SCATTER_SERIES_ORDER[config.seriesIndex]);
        },
      },
    },
    colors,
    markers: { size: 7, hover: { size: 9 } },
    xaxis: { min: 0, max: 100, tickAmount: 5, title: { text: 'Skor Behavior', style: { fontSize: '11px' } } },
    yaxis: { min: 0, max: 100, tickAmount: 5, title: { text: 'Skor Kompetensi', style: { fontSize: '11px' } } },
    grid: { strokeDashArray: 3 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', markers: { size: 5 } },
    annotations: {
      xaxis: [{ x: ambangX, borderColor: theme.palette.text.disabled, strokeDashArray: 4 }],
      yaxis: [{ y: ambangY, borderColor: theme.palette.text.disabled, strokeDashArray: 4 }],
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex }) => {
        const siswa = quadranArrays[seriesIndex]?.[dataPointIndex];
        if (!siswa) return '';
        return `<div style="padding:6px 10px;font-size:12px"><strong>${siswa.nama}</strong><br/>Behavior: ${siswa.behavior_score} · Kompetensi: ${siswa.competency_score}</div>`;
      },
    },
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, left: 12, zIndex: 1, pointerEvents: 'none', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>{CORNER_LABEL.topLeft}</Box>
      <Box sx={{ position: 'absolute', top: 8, right: 12, zIndex: 1, pointerEvents: 'none', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>{CORNER_LABEL.topRight}</Box>
      <Box sx={{ position: 'absolute', bottom: 40, left: 12, zIndex: 1, pointerEvents: 'none', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>{CORNER_LABEL.bottomLeft}</Box>
      <Box sx={{ position: 'absolute', bottom: 40, right: 12, zIndex: 1, pointerEvents: 'none', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>{CORNER_LABEL.bottomRight}</Box>
      <Chart options={options} series={series} type="scatter" height={380} />
    </Box>
  );
};

export default ScatterKuadranSiswa;