import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import { warnaRingkasan } from './gayaRingkasan';
import {
  ariaTren, barisTren, susunGrafikTren,
} from './ringkasan';
import { tampilAngka } from '../rentang';
import useLebar from './useLebar';

const LEBAR_MAKS = 640;

/**
 * Rata-rata nilai kelas per LM. Gambar hanya penegas: setiap titik bertuliskan nilainya, garis KKTP putus-putus
 * berwarna ink (bukan merah), dan tabel di bawahnya memuat angka yang sama beserta banyak siswa yang dihitung.
 * Titik berlubang berarti siswa yang terhitung masih sedikit, jadi rata-rata itu lemah sebagai pembanding.
 */
export default function TrenNr({ data }) {
  const w = warnaRingkasan(useTheme());
  const [ref, ukuran] = useLebar();
  const lebar = Math.max(280, Math.min(LEBAR_MAKS, ukuran || 520));
  const tinggi = lebar < 400 ? 210 : 230;
  const kktp = Number(data.kelas.kktp);
  const g = useMemo(
    () => susunGrafikTren(data.tren_lm, kktp, {
      lebar, tinggi, kiri: lebar < 400 ? 40 : 48, kanan: 16,
    }),
    [data.tren_lm, kktp, lebar, tinggi],
  );
  const baris = useMemo(() => barisTren(data.tren_lm), [data.tren_lm]);
  const adaKosong = baris.some((b) => b.kosong);
  const halo = { stroke: w.kartu, strokeWidth: 4, paintOrder: 'stroke' };

  return (
    <KartuBagian
      id="tren-nr"
      judul="Rata-rata nilai per lingkup materi"
      keterangan={`NR LM adalah rata-rata nilai TP asli. Garis putus adalah KKTP ${tampilAngka(kktp)}.`}
      sx={{ flex: { md: '1 1 520px' } }}
    >
      <Box ref={ref} sx={{ width: '100%', maxWidth: LEBAR_MAKS }}>
        {g ? (
          <svg
            viewBox={`0 0 ${g.lebar} ${g.tinggi}`}
            width={g.lebar}
            height={g.tinggi}
            role="img"
            aria-label={ariaTren(data.tren_lm, kktp)}
            focusable="false"
            style={{ display: 'block', maxWidth: '100%', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            {g.ticks.map((t) => (
              <g key={t.nilai}>
                <line x1={g.kiri} x2={g.lebar - g.kanan} y1={t.y} y2={t.y} stroke={w.garis} />
                <text x={g.kiri - 8} y={t.y + 4} textAnchor="end" fontSize="13" fill={w.sekunder}>{t.nilai}</text>
              </g>
            ))}
            {g.yKktp !== null && (
              <g>
                <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.yKktp} y2={g.yKktp} stroke={w.ink} strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={g.lebar - g.kanan} y={g.yKktp + 16} textAnchor="end" fontSize="13" fontWeight="700" fill={w.ink} {...halo}>{`KKTP ${tampilAngka(g.kktp)}`}</text>
              </g>
            )}
            {g.titik.length > 1 && (
              <polyline points={g.titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ')} fill="none" stroke={w.navy} strokeWidth="2.5" />
            )}
            {g.titik.map((t) => (
              <g key={t.lm}>
                <circle cx={t.x} cy={t.y} r="5" fill={t.kosong ? w.kartu : w.navy} stroke={w.navy} strokeWidth="2.5" />
                <text x={t.x} y={t.y - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill={w.ink} {...halo}>{tampilAngka(t.nilai)}</text>
              </g>
            ))}
            {g.labelX.map((l) => (
              <text key={l.lm} x={l.x} y={g.tinggi - 12} textAnchor="middle" fontSize="13" fill={w.ink}>{`LM ${l.lm}`}</text>
            ))}
          </svg>
        ) : (
          <Typography sx={{ fontSize: 14, color: w.sekunder }}>
            Belum ada lingkup materi yang rata-ratanya dapat dihitung. Rata-rata LM baru terhitung bila paling sedikit dua TP-nya terisi.
          </Typography>
        )}
      </Box>

      {baris.length > 0 && (
        <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, borderRadius: 0, borderTop: `1px solid ${w.garis}`, '& th, & td': { textAlign: 'left', py: '7px', pr: 1, verticalAlign: 'top' }, '& th': { fontWeight: 600, color: w.sekunder }, '& tbody td, & tbody th': { borderTop: `1px solid ${w.garisLembut}`, fontWeight: 400, color: w.ink } }}>
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Rata-rata kelas dan banyak siswa di bawah KKTP per lingkup materi</caption>
          <thead>
            <tr>
              <th scope="col">Lingkup materi</th>
              <th scope="col">Siswa dihitung</th>
              <th scope="col">NR kelas</th>
              <th scope="col">NR di bawah KKTP</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => (
              <tr key={b.lm}>
                <th scope="row">{b.nama}</th>
                <td>{b.siswa}</td>
                <td>{b.kosong ? `${b.nr} (sedikit siswa)` : b.nr}</td>
                <td>{b.bawah}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      )}
      {adaKosong && (
        <Typography sx={{ fontSize: 13, color: w.sekunder, lineHeight: 1.5 }}>
          Titik berlubang: siswa yang dihitung masih sedikit, jadi rata-rata itu kurang kuat sebagai pembanding.
        </Typography>
      )}
    </KartuBagian>
  );
}

TrenNr.propTypes = { data: PropTypes.object.isRequired };
