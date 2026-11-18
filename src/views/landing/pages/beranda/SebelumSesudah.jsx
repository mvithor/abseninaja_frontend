import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconCheck, IconCircleCheck, IconFile } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import Teks from '../../components/Teks';
import { SEBELUM_SESUDAH as D } from '../../data/beranda';
import { colors, gradients, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK, PAD_SEKSI, sxJudulBeranda } from './gaya';

// Bagian gelap "Dari manual ke tersambung": dua kartu, Sebelum (kaca tipis,
// butir bertitik) dan Sesudah (gradasi merek, butir bercentang).
function Kartu({ sesudah = false, data, ikonSudut }) {
  const Ikon = ikonSudut;
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: radius.kartuXL,
        p: { xs: '26px 20px 22px', md: '44px 36px 36px' },
        ...(sesudah
          ? { background: gradients.brand, border: `1px solid ${colors.glassLine}`, boxShadow: shadows.kartuAksen }
          : { background: colors.glassTipis, border: `1px solid ${colors.glassGaris}` }),
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          right: '28px',
          top: '-22px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: '18px',
          background: sesudah ? colors.yellow : colors.brandDark,
          color: sesudah ? colors.yellowInk : colors.white,
        }}
      >
        <Ikon size={24} stroke={sesudah ? 2.4 : 2} />
      </Box>
      <Tag
        sx={{
          height: 26,
          px: '12px',
          fontWeight: 600,
          background: sesudah ? colors.tabGelapJumlah : colors.glassHover,
          color: sesudah ? colors.white : colors.onDarkSoft,
        }}
      >
        {data.tag}
      </Tag>
      <Box component="h3" sx={{ m: '14px 0 0', fontSize: { xs: '20px', md: '26px' }, fontWeight: 600, color: colors.white }}>
        {data.judul}
      </Box>
      <Box
        component="ul"
        sx={{
          ...resetDaftar,
          mt: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '15px',
          color: sesudah ? colors.white : colors.onDark,
        }}
      >
        {data.butir.map((b) => (
          <Box key={b} component="li" sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {sesudah ? (
              <Box
                component="span"
                aria-hidden="true"
                sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: colors.glassLine, color: colors.white, flex: 'none' }}
              >
                <IconCheck size={13} stroke={3} />
              </Box>
            ) : (
              <Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', background: colors.penandaDaftar, flex: 'none' }} />
            )}
            {b}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

Kartu.propTypes = {
  sesudah: PropTypes.bool,
  data: PropTypes.shape({ tag: PropTypes.string, judul: PropTypes.string, butir: PropTypes.arrayOf(PropTypes.string) }).isRequired,
  ikonSudut: PropTypes.elementType.isRequired,
};

export default function SebelumSesudah() {
  return (
    <Seksi varian="gelap" padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-sebelum-sesudah">
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        sub={<Teks web={D.sub.web} seluler={D.sub.mobile} />}
        gelap
        id="judul-sebelum-sesudah"
        maxSub={560}
        sx={sxJudulBeranda}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '28px',
          mt: JARAK.sebelumSesudah,
        }}
      >
        <Kartu data={D.sebelum} ikonSudut={IconFile} />
        <Kartu sesudah data={D.sesudah} ikonSudut={IconCircleCheck} />
      </Box>
    </Seksi>
  );
}
