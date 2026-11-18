import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowUpRight, IconCheck } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import { propsAksi } from '../../data/aksi';
import { UNTUK_SEKOLAH as D } from '../../data/beranda';
import { colors, gradients, radius, shadows } from '../../theme/tokens';
import { hanyaPembaca, resetDaftar } from '../../theme/sx';
import { JARAK, PAD_SEKSI, sxJudulBeranda } from './gaya';

// Bagian Untuk sekolah: dua kartu berdampingan, sekolah umum (gradasi merek)
// dan SMK atau MAK (gradasi gelap, tombol keluar ke Prakersa).
const GAYA = {
  umum: {
    kartu: { background: gradients.brand, boxShadow: shadows.kartuAksen },
    sub: colors.white,
    centang: { background: colors.glassLine, color: colors.white },
    tag: colors.tabGelapJumlah,
    tombol: 'putih',
  },
  smk: {
    kartu: { background: gradients.dark, border: `1px solid ${colors.onDarkLine}` },
    sub: colors.onDark,
    centang: { background: colors.yellow, color: colors.yellowInk },
    tag: colors.glassHover,
    tombol: 'kuning',
  },
};

function KartuJenis({ data }) {
  const g = GAYA[data.id];
  const luar = Boolean(data.aksi.href);
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: radius.kartuXL,
        p: { xs: '26px 20px', md: '40px 36px' },
        color: colors.white,
        ...g.kartu,
      }}
    >
      <Box component="h3" sx={{ m: 0, fontSize: { xs: '20px', md: '28px' }, fontWeight: 600, color: colors.white }}>
        {data.judul}
      </Box>
      <Box component="p" sx={{ m: '4px 0 0', fontSize: '14px', color: g.sub }}>
        {data.sub}
      </Box>
      <Box component="ul" sx={{ ...resetDaftar, mt: '24px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px' }}>
        {data.butir.map((b) => (
          <Box key={b} component="li" sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Box
              component="span"
              aria-hidden="true"
              sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', flex: 'none', ...g.centang }}
            >
              <IconCheck size={13} stroke={3} />
            </Box>
            {b}
          </Box>
        ))}
      </Box>
      <Box component="ul" aria-label="Peran pengguna" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '24px' }}>
        {data.peran.map((p) => (
          <li key={p}>
            <Tag sx={{ height: 'auto', py: '6px', px: '12px', background: g.tag, color: colors.white }}>{p}</Tag>
          </li>
        ))}
      </Box>
      <TombolLanding
        varian={g.tombol}
        {...(luar ? { href: data.aksi.href, external: true } : propsAksi(data.aksi.rute))}
        ikonAkhir={luar ? <IconArrowUpRight size={18} stroke={2.2} aria-hidden="true" /> : undefined}
        sx={{ mt: '28px', alignSelf: 'flex-start' }}
      >
        {data.aksi.label}
        {luar && (
          <Box component="span" sx={hanyaPembaca}>
            {' '}
            (buka di tab baru)
          </Box>
        )}
      </TombolLanding>
    </Box>
  );
}

KartuJenis.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOf(['umum', 'smk']).isRequired,
    judul: PropTypes.string,
    sub: PropTypes.string,
    butir: PropTypes.arrayOf(PropTypes.string),
    peran: PropTypes.arrayOf(PropTypes.string),
    aksi: PropTypes.object,
  }).isRequired,
};

export default function UntukSekolah() {
  return (
    <Seksi varian="terang" id={D.id} padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-untuk-sekolah">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-untuk-sekolah" maxJudul={700} sx={sxJudulBeranda} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '28px',
          mt: JARAK.untukSekolah,
        }}
      >
        {D.kartu.map((k) => (
          <KartuJenis key={k.id} data={k} />
        ))}
      </Box>
    </Seksi>
  );
}
