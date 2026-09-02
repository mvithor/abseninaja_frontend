import { Box, Typography, useTheme } from '@mui/material';
import Chart from 'react-apexcharts';

const DimensiScoreCard = ({
  title, subtitle, score, ambang, siap, footerText,
  overridden = false, unitKritisCount = 0,
}) => {
  const theme = useTheme();
  const displayScore = score !== null && score !== undefined ? Math.round(score) : 0;
  const ambangNum = Math.round(Number(ambang));
  const color = siap ? '#34A853' : '#FF383C';

  const skorMemenuhiAmbang = score !== null && score !== undefined && Number(score) >= ambangNum;

  const options = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: '62%' },
        track: { background: theme.palette.mode === 'dark' ? theme.palette.action.hover : '#EEF0F2' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 8,
            fontSize: '30px',
            fontWeight: 800,
            color: theme.palette.text.primary,
            formatter: () => `${displayScore}`,
          },
        },
      },
    },
    stroke: { lineCap: 'round' },
  };

  let overrideText = null;
  if (overridden) {
    overrideText = skorMemenuhiAmbang
      ? `Skor ${displayScore} sudah ≥ ambang ${ambangNum}, namun ${unitKritisCount} unit kompetensi inti berstatus Kritis`
      : `Skor ${displayScore} < ambang ${ambangNum}, dan ${unitKritisCount} unit kompetensi inti berstatus Kritis, keduanya menyebabkan status Belum Siap.`;
  }

  return (
    <Box sx={{ p: 2.5, borderRadius: '10px', backgroundColor: theme.palette.background.paper, textAlign: 'center' }}>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 0.5 }}>
        {title.toUpperCase()}
      </Typography>

      <Box sx={{ position: 'relative', mt: -1 }}>
        <Chart options={options} series={[displayScore]} type="radialBar" height={170} />
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 44, left: 0, right: 0, color: 'text.disabled' }}>
          /100
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ color: skorMemenuhiAmbang ? '#34A853' : '#FF383C', fontWeight: 700, display: 'block', mb: 0.5 }}>
        {skorMemenuhiAmbang ? `Skor Di Atas T=${ambangNum}` : `Skor Di Bawah T=${ambangNum}`}
      </Typography>
      <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>{subtitle}</Typography>

      <Box sx={{ py: 1, px: 1.5, borderRadius: '8px', backgroundColor: siap ? '#34C75914' : '#FF383C14' }}>
        <Typography variant="caption" sx={{ color: siap ? '#059669' : '#DC2626', fontWeight: 700, display: 'block' }}>
          {siap ? 'Status: Siap' : 'Status: Belum Siap'}
        </Typography>
        {overrideText ? (
          <Typography variant="caption" sx={{ color: '#B91C1C', display: 'block', mt: 0.3 }}>
            {overrideText}
          </Typography>
        ) : footerText && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{footerText}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default DimensiScoreCard;