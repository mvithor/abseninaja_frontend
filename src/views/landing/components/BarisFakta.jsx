import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Baris fakta. Varian:
//  ikon  : kartu kecil berisi ikon + label (hero halaman). Seluler: 2 kolom tanpa ikon.
//  angka : kartu kaca di latar gelap, angka besar + label (34, seluler 22).
export default function BarisFakta({ butir, varian = 'ikon', sx }) {
  const angka = varian === 'angka';
  return (
    <Box
      component="ul"
      // role="list": Safari dan VoiceOver membuang semantik daftar bila list-style: none.
      role="list"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: { xs: '10px', md: '16px' },
        width: '100%',
        maxWidth: 1000,
        mt: { xs: '16px', md: '28px' },
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0,1fr))',
          md: 'repeat(4, minmax(0,1fr))',
        },
        ...(angka ? { gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } } : null),
        ...sx,
      }}
    >
      {butir.map((b) =>
        angka ? (
          <Box
            key={b.label}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              p: { xs: '18px 20px', md: '24px 26px' },
              textAlign: 'left',
              borderRadius: radius.kartu,
              background: colors.glass,
              border: `1px solid ${colors.glassLine}`,
            }}
          >
            <Box aria-hidden="true" sx={{ width: 4, alignSelf: 'stretch', borderRadius: '2px', background: colors.yellow, flex: 'none' }} />
            <Box>
              <Box sx={{ color: colors.white, ...huruf.angkaBesar }}>{b.angka}</Box>
              <Box sx={{ mt: '6px', fontSize: '14px', color: colors.onDarkSoft }}>{b.label}</Box>
            </Box>
          </Box>
        ) : (
          <Box
            key={b.label}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              p: { xs: '12px 14px', md: '14px 18px' },
              textAlign: 'left',
              borderRadius: radius.kartuKecil,
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                flex: 'none',
                borderRadius: radius.tombol,
                background: gradients.brand,
                color: colors.white,
              }}
            >
              <b.ikon size={20} stroke={1.9} />
            </Box>
            <Box component="span" sx={{ fontSize: '14px', fontWeight: 600, color: colors.ink, lineHeight: 1.3 }}>
              {b.label}
            </Box>
            <PenandaVerifikasi verifikasi={b.verifikasi} />
          </Box>
        ),
      )}
    </Box>
  );
}

BarisFakta.propTypes = {
  butir: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      ikon: PropTypes.elementType,
      angka: PropTypes.string,
    }),
  ).isRequired,
  varian: PropTypes.oneOf(['ikon', 'angka']),
  sx: PropTypes.object,
};
