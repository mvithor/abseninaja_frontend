import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, peragaLad, radius } from '../../theme/tokens';

// Peraga grafik tren nilai rata-rata per lingkup materi (bagian "Kelas
// terbaca"): garis murid, rata-rata kelas, dan garis putus KKTP. Koordinat dan
// angka adalah data contoh (DUMMY wajib diganti sebelum main, lihat
// data/analitikMock.js), bukan hasil hitung. Dekoratif, aria-hidden. Setiap
// titik punya angka dan setiap garis punya label legenda, jadi bentuk garis
// bukan satu-satunya pembeda (garis putus vs penuh juga berbeda).
const titik = (daftar) => daftar.map((p) => `${p.x},${p.y}`).join(' ');

function Swatch({ sx }) {
  return <Box component="b" sx={{ display: 'inline-block', width: 14, verticalAlign: 'middle', ...sx }} />;
}

Swatch.propTypes = { sx: PropTypes.object };

export default function TrenNilaiMock({ data }) {
  const { murid, kelas, kktp } = data;
  return (
    <Box
      aria-hidden="true"
      sx={{
        boxSizing: 'border-box',
        p: '18px 20px',
        borderRadius: radius.kartu,
        background: colors.white,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box sx={{ fontSize: '13px', fontWeight: 700, color: colors.ink }}>{data.judul}</Box>
      <Box component="svg" viewBox="0 0 360 150" width="100%" sx={{ mt: '8px', display: 'block', fontFamily: 'inherit' }}>
        {data.garisBantu.map((y) => (
          <line key={y} x1="30" y1={y} x2="350" y2={y} stroke={colors.borderSoft} />
        ))}
        <line x1="30" y1={kktp.y} x2="350" y2={kktp.y} stroke={peragaLad.kktp} strokeDasharray="5 4" />
        <text x="352" y={kktp.y - 4} fontSize="9" fill={peragaLad.kktpInk} textAnchor="end">
          {kktp.label}
        </text>
        <polyline points={titik(murid)} fill="none" stroke={colors.brand} strokeWidth="2.5" />
        <polyline points={titik(kelas)} fill="none" stroke={colors.ink} strokeWidth="2" />
        {murid.map((p) => (
          <circle key={p.lm} cx={p.x} cy={p.y} r="4" fill={colors.brand} />
        ))}
        {murid.map((p, i) => (
          <text
            key={`n-${p.lm}`}
            x={p.x}
            y={i === 0 ? p.y - 10 : p.y + 20}
            fontSize="10"
            fontWeight="700"
            fill={colors.ink}
            textAnchor="middle"
          >
            {p.nilai}
          </text>
        ))}
        {murid.map((p) => (
          <text key={`l-${p.lm}`} x={p.x} y="144" fontSize="10" fill={colors.muted} textAnchor="middle">
            {p.lm}
          </text>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', mt: '2px', fontSize: '11px', color: colors.muted }}>
        <span>
          <Swatch sx={{ height: 3, background: colors.brand }} /> {data.legenda.murid}
        </span>
        <span>
          <Swatch sx={{ height: 3, background: colors.ink }} /> {data.legenda.kelas}
        </span>
        <span>
          <Swatch sx={{ height: 0, borderTop: `2px dashed ${peragaLad.kktp}` }} /> {data.legenda.kktp}
        </span>
      </Box>
    </Box>
  );
}

TrenNilaiMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    garisBantu: PropTypes.arrayOf(PropTypes.number).isRequired,
    kktp: PropTypes.shape({ y: PropTypes.number, label: PropTypes.string }).isRequired,
    murid: PropTypes.array.isRequired,
    kelas: PropTypes.array.isRequired,
    legenda: PropTypes.shape({ murid: PropTypes.string, kelas: PropTypes.string, kktp: PropTypes.string }).isRequired,
  }).isRequired,
};
