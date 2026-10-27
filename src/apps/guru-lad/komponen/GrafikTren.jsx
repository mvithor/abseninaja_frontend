import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tampilAngka } from '../rentang';
import { sembunyi } from '../evaluasi/gayaMatriks';
import { titikGrafikP4 } from '../evaluasi/matriks';

const LEBAR_AWAL = 392;
const bulat1 = (x) => tampilAngka(Math.round(x * 10) / 10);

// Garis tren rata-rata nilai per LM: siswa, rata-rata kelas (bila ada), dan garis KKTP (bila dipakai).
// Lebar gambar mengikuti lebar wadah (diukur), sehingga huruf selalu berukuran tetap dan grafik mengisi ruang
// pada layar lebar maupun sempit. Gambar hanya penegas; angka tiap titik tertulis dan ringkasan dibaca lewat `ringkasan`.
export default function GrafikTren({ deret, kktp, ringkasan }) {
  const theme = useTheme();
  const wadah = useRef(null);
  const [lebar, setLebar] = useState(LEBAR_AWAL);

  useEffect(() => {
    const el = wadah.current;
    if (!el) return undefined;
    const ukur = () => { const w = Math.floor(el.getBoundingClientRect().width); if (w > 0) setLebar(w); };
    ukur();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  const tinggi = Math.max(170, Math.min(300, Math.round(lebar * 0.3)));
  const g = useMemo(
    () => titikGrafikP4(deret, kktp, {
      lebar, tinggi, kiri: 44, kanan: 20, atas: 28, bawah: 32, inset: Math.min(48, Math.round(lebar * 0.06)),
    }),
    [deret, kktp, lebar, tinggi],
  );

  const garis = (titik) => titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ');
  return (
    <Box ref={wadah} sx={{ width: '100%' }}>
      {g && (
        <>
          <svg viewBox={`0 0 ${g.lebar} ${g.tinggi}`} width={g.lebar} height={g.tinggi} aria-hidden="true" focusable="false" style={{ display: 'block', maxWidth: '100%' }}>
            {[g.min, (g.min + g.maks) / 2, g.maks].map((v) => (
              <g key={v}>
                <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.petakY(v)} y2={g.petakY(v)} stroke={theme.palette.divider} />
                <text x={g.kiri - 8} y={g.petakY(v) + 4} textAnchor="end" fontSize="12" fill={theme.palette.text.secondary}>{bulat1(v)}</text>
              </g>
            ))}
            {g.yKktp !== null && (
              <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.yKktp} y2={g.yKktp} stroke={theme.palette.error.main} strokeDasharray="5 4" />
            )}
            {g.kelas && <polyline points={garis(g.kelas)} fill="none" stroke={theme.palette.grey[600]} strokeWidth="2" />}
            <polyline points={garis(g.siswa)} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
            {g.siswa.map((t) => (
              <g key={t.lm}>
                <circle cx={t.x} cy={t.y} r="4.5" fill={theme.palette.primary.main} />
                <text x={t.x} y={t.y - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill={theme.palette.text.primary} stroke={theme.palette.background.paper} strokeWidth="3" paintOrder="stroke">{bulat1(t.nilai)}</text>
                <text x={t.x} y={g.tinggi - 8} textAnchor="middle" fontSize="12" fill={theme.palette.text.secondary}>{`LM ${t.lm}`}</text>
              </g>
            ))}
          </svg>
          {ringkasan && <Box component="span" sx={sembunyi}>{ringkasan}</Box>}
          <Stack direction="row" spacing={2} sx={{ mt: 0.5, fontSize: 12 }} flexWrap="wrap" useFlexGap>
            <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'primary.main', verticalAlign: 'middle', mr: 0.75 }} />Siswa</Box>
            {g.kelas && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'grey.600', verticalAlign: 'middle', mr: 0.75 }} />Rata-rata kelas</Box>}
            {g.yKktp !== null && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, borderTop: '2px dashed', borderColor: 'error.main', verticalAlign: 'middle', mr: 0.75 }} />KKTP</Box>}
          </Stack>
        </>
      )}
    </Box>
  );
}

GrafikTren.propTypes = {
  deret: PropTypes.array,
  kktp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ringkasan: PropTypes.string,
};
