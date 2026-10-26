import PropTypes from 'prop-types';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tampilAngka } from '../rentang';
import { sembunyi } from '../evaluasi/gayaMatriks';

// Garis tren rata-rata nilai per LM: siswa, rata-rata kelas (bila ada), dan garis KKTP (bila dipakai).
// `g` dari titikGrafikP4. Gambar ini hanya penegas; angka tiap titik tertulis dan ringkasan dibaca lewat `ringkasan`.
export default function GrafikTren({ g, ringkasan }) {
  const theme = useTheme();
  if (!g) return null;
  const garis = (titik) => titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ');
  const tick = [g.min, g.maks];
  return (
    <Box sx={{ maxWidth: 560 }}>
      <svg viewBox={`0 0 ${g.lebar} ${g.tinggi}`} width="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
        {tick.map((v) => (
          <g key={v}>
            <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.petakY(v)} y2={g.petakY(v)} stroke={theme.palette.divider} />
            <text x={g.kiri - 6} y={g.petakY(v) + 4} textAnchor="end" fontSize="10" fill={theme.palette.text.secondary}>{v}</text>
          </g>
        ))}
        {g.yKktp !== null && (
          <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.yKktp} y2={g.yKktp} stroke={theme.palette.error.main} strokeDasharray="4 4" />
        )}
        {g.kelas && <polyline points={garis(g.kelas)} fill="none" stroke={theme.palette.grey[600]} strokeWidth="2" />}
        <polyline points={garis(g.siswa)} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
        {g.siswa.map((t) => (
          <g key={t.lm}>
            <circle cx={t.x} cy={t.y} r="4" fill={theme.palette.primary.main} />
            <text x={t.x} y={t.y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={theme.palette.text.primary}>{tampilAngka(Math.round(t.nilai * 10) / 10)}</text>
            <text x={t.x} y={g.tinggi - 6} textAnchor="middle" fontSize="10" fill={theme.palette.text.secondary}>{`LM ${t.lm}`}</text>
          </g>
        ))}
      </svg>
      {ringkasan && <Box component="span" sx={sembunyi}>{ringkasan}</Box>}
      <Stack direction="row" spacing={2} sx={{ mt: 0.5, fontSize: 12 }} flexWrap="wrap" useFlexGap>
        <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'primary.main', verticalAlign: 'middle', mr: 0.75 }} />Siswa</Box>
        {g.kelas && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'grey.600', verticalAlign: 'middle', mr: 0.75 }} />Rata-rata kelas</Box>}
        {g.yKktp !== null && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, borderTop: '2px dashed', borderColor: 'error.main', verticalAlign: 'middle', mr: 0.75 }} />KKTP</Box>}
      </Stack>
    </Box>
  );
}

GrafikTren.propTypes = { g: PropTypes.object, ringkasan: PropTypes.string };
