import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconCheck, IconX } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { SEBELUM_SESUDAH as D } from '../../data/analitik';
import { colors, gradients, radius } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK_ISI, sxSubLad } from './gaya';

// Bagian gelap "Sebelum, sesudah": dua kartu. Sebelum = kaca tipis dengan ikon
// silang; Dengan LAD = gradasi merek dengan ikon centang kuning. Tiap butir
// tertulis lengkap; ikon hanya pendamping (aria-hidden).
function Kartu({ data, sesudah = false }) {
  const Ikon = sesudah ? IconCheck : IconX;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
        p: { xs: '26px 20px', md: '32px 30px' },
        borderRadius: radius.kartuBesar,
        border: `1px solid ${colors.glassLine}`,
        background: sesudah ? gradients.brand : colors.glass,
      }}
    >
      <Box
        component="span"
        sx={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: sesudah ? colors.yellow : colors.onDark,
        }}
      >
        {data.tag}
      </Box>
      <Box component="h3" sx={{ m: 0, fontSize: { xs: '18px', md: '24px' }, fontWeight: 600, color: colors.white }}>
        {data.judul}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.butir.map((b) => (
          <Box
            key={b.web}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '15px',
              lineHeight: 1.6,
              color: sesudah ? colors.white : colors.onDark,
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
                width: 22,
                height: 22,
                mt: '1px',
                borderRadius: '50%',
                background: sesudah ? colors.yellow : colors.glassIkon,
                color: sesudah ? colors.yellowInk : colors.onDark,
              }}
            >
              <Ikon size={sesudah ? 13 : 12} stroke={sesudah ? 3 : 2.6} />
            </Box>
            <span>{renderTeks(b)}</span>
          </Box>
        ))}
      </Box>
      <PenandaVerifikasi verifikasi={data.verifikasi} sx={{ alignSelf: 'flex-start' }} />
    </Box>
  );
}

Kartu.propTypes = {
  data: PropTypes.shape({
    tag: PropTypes.string,
    judul: PropTypes.string,
    butir: PropTypes.array,
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  sesudah: PropTypes.bool,
};

export default function SebelumSesudahLad() {
  return (
    <Seksi varian="gelap" aria-labelledby="judul-sebelum-sesudah-lad">
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        sub={renderTeks(D.sub)}
        gelap
        id="judul-sebelum-sesudah-lad"
        sx={sxSubLad}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '24px',
          mt: JARAK_ISI,
        }}
      >
        <Kartu data={D.sebelum} />
        <Kartu sesudah data={D.sesudah} />
      </Box>
    </Seksi>
  );
}
