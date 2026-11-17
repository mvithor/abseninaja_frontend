import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Tag from './Tag';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';

// Kartu ikon. Varian:
//  terang : kartu putih bertepi, ikon dalam kotak gradasi merek (latar terang)
//  kaca   : kartu kaca di latar gelap, ikon dalam kotak kuning; `aksen`
//           mengisi kartu dengan gradasi merek.
export default function KartuIkon({
  ikon,
  judul,
  deskripsi,
  tag = [],
  varian = 'terang',
  aksen = false,
  tingkatJudul = 'h3',
  ekstra,
  sx,
}) {
  const Ikon = ikon;
  const kaca = varian === 'kaca';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box',
        p: { xs: '26px 20px', md: '28px 26px' },
        borderRadius: radius.kartuBesar,
        ...(kaca
          ? {
              background: aksen ? gradients.brand : colors.glass,
              border: `1px solid ${colors.glassLine}`,
            }
          : {
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }),
        ...sx,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 48, md: 56 },
          height: { xs: 48, md: 56 },
          flex: 'none',
          borderRadius: radius.ikon,
          background: kaca ? colors.yellow : gradients.brand,
          color: kaca ? colors.yellowInk : colors.white,
          alignSelf: 'flex-start',
        }}
      >
        <Ikon size={26} stroke={1.8} />
      </Box>
      <Box
        component={tingkatJudul}
        sx={{ m: 0, color: kaca ? colors.white : colors.ink, ...huruf.judulKartu }}
      >
        {judul}
      </Box>
      <Box component="p" sx={{ m: 0, color: kaca ? colors.onDarkSoft : colors.muted, ...huruf.isi }}>
        {deskripsi}
      </Box>
      {ekstra}
      {tag.length > 0 && (
        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', mt: 'auto' }}>
          {tag.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </Box>
      )}
    </Box>
  );
}

KartuIkon.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.node.isRequired,
  deskripsi: PropTypes.node,
  tag: PropTypes.arrayOf(PropTypes.string),
  varian: PropTypes.oneOf(['terang', 'kaca']),
  aksen: PropTypes.bool,
  tingkatJudul: PropTypes.oneOf(['h2', 'h3', 'h4', 'div']),
  ekstra: PropTypes.node,
  sx: PropTypes.object,
};
