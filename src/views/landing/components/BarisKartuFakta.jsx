import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import BarisFakta from './BarisFakta';
import KotakIkon from './KotakIkon';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Baris kartu di bawah hero halaman dalam. Varian (`varian`):
//  fakta   : kartu kecil ikon + label (hero_two); diserahkan ke BarisFakta.
//            Seluler: 2 kolom tanpa ikon.
//  angka   : ikon + angka besar + label (hero Fitur). 4 kolom di md ke atas,
//            2 kolom di sm, 1 kolom di seluler (sesuai desain seluler).
//  manfaat : ikon + judul + keterangan, tiga kolom maks 900 (hero Pendampingan).
//            Satu kolom di bawah md.
// Butir: { ikon, label, angka?, kecil?, sub?, verifikasi? }. `kecil` = angka
// berupa teks pendek (mis. "Web + HP") dengan huruf lebih kecil.
const KISI = {
  angka: {
    templat: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
    maxWidth: undefined,
  },
  manfaat: {
    templat: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
    maxWidth: 900,
  },
};

export default function BarisKartuFakta({ butir, varian = 'fakta', sx }) {
  if (varian === 'fakta') return <BarisFakta butir={butir} varian="ikon" sx={sx} />;

  const angka = varian === 'angka';
  const kisi = KISI[varian];
  return (
    <Box
      component="ul"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: '16px',
        width: '100%',
        maxWidth: kisi.maxWidth,
        mt: '28px',
        gridTemplateColumns: kisi.templat,
        ...sx,
      }}
    >
      {butir.map((b) => (
        <Box
          key={b.label}
          component="li"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: angka ? '16px' : '14px',
            boxSizing: 'border-box',
            p: angka ? '20px 22px' : '18px 22px',
            textAlign: 'left',
            borderRadius: radius.kartuSedang,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.kartu,
          }}
        >
          {angka ? (
            <KotakIkon ikon={b.ikon} ukuran={56} />
          ) : (
            <KotakIkon ikon={b.ikon} ukuran={48} ikonUkuran={24} sudut="14px" />
          )}
          <Box sx={{ minWidth: 0 }}>
            {angka ? (
              <>
                <Box sx={{ color: colors.ink, ...(b.kecil ? huruf.angkaKartuTeks : huruf.angkaKartu) }}>{b.angka}</Box>
                <Box sx={{ mt: '2px', fontSize: '13px', color: colors.muted }}>{b.label}</Box>
              </>
            ) : (
              <>
                <Box sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{b.label}</Box>
                <Box sx={{ mt: '2px', fontSize: '12px', color: colors.muted }}>{b.sub}</Box>
              </>
            )}
            <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

BarisKartuFakta.propTypes = {
  butir: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      ikon: PropTypes.elementType,
      angka: PropTypes.string,
      kecil: PropTypes.bool,
      sub: PropTypes.string,
      verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
  ).isRequired,
  varian: PropTypes.oneOf(['fakta', 'angka', 'manfaat']),
  sx: PropTypes.object,
};
