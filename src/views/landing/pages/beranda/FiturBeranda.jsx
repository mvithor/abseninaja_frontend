import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import Teks from '../../components/Teks';
import TombolLanding from '../../components/TombolLanding';
import { propsAksi } from '../../data/aksi';
import { FITUR as D } from '../../data/beranda';
import { colors, gradients, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK, PAD_SEKSI, sxJudulBeranda } from './gaya';

// Bagian Fitur (id "fitur"): delapan kartu modul dan banner analitik
// pembelajaran. Kartu: 4 kolom di md ke atas, 2 kolom di bawahnya (seperti
// desain seluler). Kantin memakai label status "Segera".
function KartuModul({ ikon, judul, deskripsi, status }) {
  const Ikon = ikon;
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
        p: { xs: '24px 18px', md: '26px 24px' },
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.kartuSedang,
        boxShadow: shadows.kartu,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 46, md: 56 },
          height: { xs: 46, md: 56 },
          flex: 'none',
          borderRadius: { xs: '14px', md: radius.ikon },
          background: gradients.brand,
          color: colors.white,
        }}
      >
        <Ikon size={26} stroke={2} />
      </Box>
      <Box>
        <Box component="h3" sx={{ m: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: { xs: '16px', md: '17px' }, fontWeight: 600, color: colors.ink, lineHeight: 1.3 }}>
          {judul}
          {status && <Tag varian="status" sx={{ height: 'auto', py: '2px' }}>{status}</Tag>}
        </Box>
        <Box component="p" sx={{ m: '4px 0 0', fontSize: '14px', lineHeight: 1.6, color: colors.muted }}>
          {deskripsi}
        </Box>
      </Box>
    </Box>
  );
}

KartuModul.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.string.isRequired,
  deskripsi: PropTypes.string.isRequired,
  status: PropTypes.string,
};

export default function FiturBeranda() {
  const { analitik } = D;
  return (
    <Seksi varian="tint" id={D.id} padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-fitur">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-fitur" maxJudul={700} sx={sxJudulBeranda} />
      <Box
        component="ul"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: { xs: '12px', md: '20px' },
          mt: JARAK.fitur,
        }}
      >
        {D.modul.map((m) => (
          <KartuModul key={m.judul} {...m} />
        ))}
      </Box>

      <Box
        sx={{
          position: 'relative',
          mt: '24px',
          p: { xs: '26px 20px', md: '32px 36px' },
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: '28px',
          background: gradients.dark,
          borderRadius: radius.kartuBesar,
          color: colors.white,
        }}
      >
        <Box sx={{ maxWidth: 640 }}>
          <Box component="h3" sx={{ m: 0, fontSize: { xs: '18px', md: '24px' }, fontWeight: 600, color: colors.white }}>
            {analitik.judul}
          </Box>
          <Box component="p" sx={{ m: '8px 0 0', ...huruf.isi, color: colors.onDark }}>
            <Teks web={analitik.deskripsi.web} seluler={analitik.deskripsi.mobile} />
          </Box>
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', gap: '8px', mt: '14px' }}>
            {analitik.tag.map((t) => (
              <li key={t}>
                <Tag sx={{ height: 'auto', py: '5px', px: '12px', background: colors.glassGaris, color: colors.white }}>{t}</Tag>
              </li>
            ))}
          </Box>
        </Box>
        <TombolLanding
          varian="kuning"
          ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
          {...propsAksi(analitik.aksi.rute)}
          sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}
        >
          {analitik.aksi.label}
        </TombolLanding>
      </Box>
    </Seksi>
  );
}
