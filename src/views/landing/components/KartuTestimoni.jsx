import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconStarFilled } from '@tabler/icons-react';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';

// Kartu testimoni (desain Testimoni): deret bintang, kutipan bergaris merek di
// kiri, lalu penulis (inisial, nama, peran dan sekolah). Dipakai di dalam <li>.
// Peringkat berupa teks "Peringkat N dari 5" (aria-label); bintang dan inisial hanya
// hiasan (aria-hidden), jadi informasi tidak bergantung pada warna atau ikon.
function inisial(nama) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('');
}

export default function KartuTestimoni({ kutipan, nama, peran, peringkat = 5, verifikasi }) {
  // Nilai dijepit 0 sampai 5; hanya bintang terisi yang digambar (sesuai desain).
  const nilai = Math.min(5, Math.max(0, Math.round(peringkat)));
  return (
    <Box
      component="figure"
      sx={{
        m: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'left',
        p: '26px 26px 22px',
        borderRadius: radius.kartuBesar,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
      }}
    >
      <Box
        role="img"
        aria-label={`Peringkat ${nilai} dari 5`}
        sx={{ display: 'flex', gap: '2px', color: colors.yellow, ...huruf.bintang }}
      >
        {Array.from({ length: nilai }, (_, i) => (
          <IconStarFilled key={i} size="1em" aria-hidden="true" />
        ))}
      </Box>
      <Box
        component="blockquote"
        sx={{
          m: 0,
          pl: '14px',
          borderLeft: `3px solid ${colors.brand}`,
          color: colors.ink,
          ...huruf.isiTestimoni,
        }}
      >
        {kutipan}
      </Box>
      <Box component="figcaption" sx={{ display: 'flex', gap: '12px', alignItems: 'center', mt: 'auto' }}>
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            flex: 'none',
            borderRadius: '50%',
            background: gradients.brand,
            color: colors.white,
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {inisial(nama)}
        </Box>
        <Box component="span" sx={{ minWidth: 0 }}>
          <Box component="span" sx={{ display: 'block', fontSize: '14px', fontWeight: 600, color: colors.ink }}>
            {nama}
          </Box>
          <Box component="span" sx={{ display: 'block', fontSize: '12px', color: colors.muted }}>
            {peran}
          </Box>
          <PenandaVerifikasi verifikasi={verifikasi} sx={{ mt: '6px' }} />
        </Box>
      </Box>
    </Box>
  );
}

KartuTestimoni.propTypes = {
  kutipan: PropTypes.string.isRequired,
  nama: PropTypes.string.isRequired,
  peran: PropTypes.string.isRequired,
  peringkat: PropTypes.number,
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
