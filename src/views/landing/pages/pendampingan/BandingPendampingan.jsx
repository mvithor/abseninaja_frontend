import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconCheck, IconX } from '@tabler/icons-react';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import { renderTeks } from '../../components/renderTeks';
import { BANDING as D } from '../../data/pendampingan';
import { colors, gradients, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Bagian gelap "Jalan sendiri atau didampingi": dua kartu (kaca tipis dan
// gradasi merek). Tanda X dan centang hanya pendamping; makna ada pada teks
// butir dan judul kartu.
function KartuBanding({ data, aksen = false }) {
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        p: { xs: '24px', md: '36px' },
        borderRadius: radius.kartuXL,
        ...(aksen
          ? { background: gradients.brand, border: `1px solid ${colors.garisKacaAksen}`, boxShadow: shadows.kartuAksen }
          : { background: colors.glassSangatTipis, border: `1px solid ${colors.garisKaca}` }),
      }}
    >
      <Box component="h3" sx={{ m: 0, color: colors.white, ...huruf.judulKartuBesar }}>
        {data.judul}
      </Box>
      <Box component="p" sx={{ m: '4px 0 0', fontSize: '13px', color: aksen ? colors.white : colors.onDark }}>
        {data.sub}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar, mt: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.butir.map((b) => (
          <Box
            key={b}
            component="li"
            sx={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: aksen ? colors.white : colors.onDark }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                flex: 'none',
                borderRadius: '50%',
                background: aksen ? colors.yellow : colors.glassHover,
                color: aksen ? colors.yellowInk : colors.onDark,
              }}
            >
              {aksen ? <IconCheck size={14} stroke={3} /> : <IconX size={13} stroke={2.6} />}
            </Box>
            {b}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

KartuBanding.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string,
    sub: PropTypes.string,
    butir: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  aksen: PropTypes.bool,
};

export default function BandingPendampingan() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      sub={renderTeks(D.sub)}
      padAtas={{ xs: '40px', md: '80px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      jarak="56px"
      sxJudul={{ '& > h2 + p': { fontSize: { md: '16px' } } }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '28px',
        }}
      >
        <KartuBanding data={D.sendiri} />
        <KartuBanding data={D.didampingi} aksen />
      </Box>
    </PerbandinganGelap>
  );
}
