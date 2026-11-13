import PropTypes from 'prop-types';
import { useTheme } from '@mui/material';
import Chart from 'react-apexcharts';

// Distribusi siswa per kategori satu dimensi: bar horizontal satu warna (satu seri, tanpa legend).
// Urutan kategori mengikuti urutan dari server (skala ordinal, mis. penghasilan / jarak).
// Kategori yang perlu perhatian ditandai teks "⚠" pada label sumbu, bukan warna, supaya
// terbaca juga oleh pembaca buta warna. Klik bar memanggil onPilihKategori.
const DistribusiKategoriChart = ({ kategori, total, kategoriAktif, onPilihKategori, height }) => {
  const theme = useTheme();
  const warna = theme.palette.primary.main;
  const redup = theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300];

  const label = kategori.map((k) => (k.perhatian ? `⚠ ${k.label}` : k.label));
  const data = kategori.map((k) => ({
    x: k.perhatian ? `⚠ ${k.label}` : k.label,
    y: k.jumlah,
    // Saat satu kategori dipilih, kategori lain diredupkan (emphasis), bukan diberi warna lain.
    fillColor: !kategoriAktif || kategoriAktif === k.kode ? warna : redup,
  }));

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      foreColor: theme.palette.text.secondary,
      events: {
        dataPointSelection: (_e, _ctx, { dataPointIndex }) => onPilihKategori?.(kategori[dataPointIndex]?.kode),
      },
    },
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4, borderRadiusApplication: 'end' } },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 6,
      style: { colors: [theme.palette.text.primary], fontWeight: 600 },
      formatter: (v) => (total ? `${v} (${Math.round((v / total) * 100)}%)` : v),
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    xaxis: { categories: label, labels: { formatter: (v) => Math.round(v) }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: '13px' }, maxWidth: 180 } },
    tooltip: {
      theme: theme.palette.mode,
      y: { formatter: (v) => `${v} siswa${total ? ` (${Math.round((v / total) * 100)}%)` : ''}`, title: { formatter: () => '' } },
    },
    states: { hover: { filter: { type: 'darken', value: 0.9 } }, active: { filter: { type: 'none' } } },
    legend: { show: false },
  };

  return (
    <Chart
      options={options}
      series={[{ name: 'Siswa', data }]}
      type="bar"
      height={height || Math.max(160, kategori.length * 44 + 40)}
    />
  );
};

DistribusiKategoriChart.propTypes = {
  kategori: PropTypes.arrayOf(
    PropTypes.shape({ kode: PropTypes.string, label: PropTypes.string, jumlah: PropTypes.number, perhatian: PropTypes.bool }),
  ).isRequired,
  total: PropTypes.number,
  kategoriAktif: PropTypes.string,
  onPilihKategori: PropTypes.func,
  height: PropTypes.number,
};

export default DistribusiKategoriChart;
