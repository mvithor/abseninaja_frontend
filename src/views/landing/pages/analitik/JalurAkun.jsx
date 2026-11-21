import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { JALUR as D } from '../../data/analitik';
import { colors, gradients, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK_ISI, sxJangkar, sxSubLad } from './gaya';

// Dua jalur akun: kartu putih (guru sekolah) dan kartu gradasi (guru mandiri),
// masing-masing empat langkah berurutan (daftar berurutan, nomor di kotak kecil
// hanya tampilan) dan satu tombol. Sasaran jangkar #jalur-akun.
function Jalur({ data, gelap = false, varianTombol }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxSizing: 'border-box',
        p: { xs: '26px 20px', md: '34px 32px' },
        borderRadius: radius.kartuBesar,
        ...(gelap
          ? { background: gradients.brand, color: colors.white, boxShadow: shadows.kartuAksen }
          : { background: colors.white, color: colors.ink, border: `1px solid ${colors.border}`, boxShadow: shadows.kartu }),
      }}
    >
      <Box
        component="span"
        sx={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: gelap ? colors.yellow : colors.accent,
        }}
      >
        {data.label}
      </Box>
      <Box component="h3" sx={{ m: 0, fontSize: { xs: '18px', md: '24px' }, fontWeight: 600, color: 'inherit' }}>
        {data.judul}
      </Box>
      <Box component="ol" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {data.langkah.map((l, i) => (
          <Box key={l.web} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
                width: 26,
                height: 26,
                borderRadius: radius.menuItem,
                background: gelap ? colors.garisKaca : colors.tint,
                color: gelap ? colors.white : colors.accent,
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {i + 1}
            </Box>
            <Box sx={{ mt: '2px', fontSize: '14px', lineHeight: 1.6, color: gelap ? colors.onDarkTerang : colors.muted }}>
              {renderTeks(l)}
            </Box>
          </Box>
        ))}
      </Box>
      <TombolLanding
        varian={varianTombol}
        {...propsAksi(data.aksi.rute)}
        sx={{ alignSelf: 'flex-start', mt: '6px' }}
      >
        {data.aksi.label}
      </TombolLanding>
      <PenandaVerifikasi verifikasi={data.verifikasi} sx={{ alignSelf: 'flex-start' }} />
    </Box>
  );
}

Jalur.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    judul: PropTypes.string,
    langkah: PropTypes.array,
    aksi: PropTypes.shape({ label: PropTypes.string, rute: PropTypes.string }),
    verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }).isRequired,
  gelap: PropTypes.bool,
  varianTombol: PropTypes.string.isRequired,
};

export default function JalurAkun() {
  return (
    <Seksi
      varian="terang"
      id={D.id}
      sx={{ background: gradients.hero, ...sxJangkar }}
      aria-labelledby="judul-jalur-akun"
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-jalur-akun" sx={sxSubLad} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '24px',
          mt: JARAK_ISI,
        }}
      >
        <Jalur data={D.sekolah} varianTombol="gradasi" />
        <Jalur gelap data={D.mandiri} varianTombol="kuning" />
      </Box>
    </Seksi>
  );
}
