import { Box } from '@mui/material';
import { IconArrowRight, IconCircleCheck } from '@tabler/icons-react';
import Kontainer from '../../components/Kontainer';
import JudulSeksi from '../../components/JudulSeksi';
import TombolLanding from '../../components/TombolLanding';
import Teks from '../../components/Teks';
import DasborMock from '../../mock/DasborMock';
import Fakta from './Fakta';
import { propsAksi } from '../../data/aksi';
import { HERO, MOCK_DASBOR } from '../../data/beranda';
import { colors, gradients } from '../../theme/tokens';

// Hero Beranda: teks dan dua tombol di kiri, peraga dasbor di kanan (di bawah
// md bertumpuk: teks, tombol penuh lebar, lalu peraga yang diperkecil).
// Pita fakta berada di dasar seksi yang sama.
export default function Hero() {
  const ikonPanah = <IconArrowRight size={18} stroke={2.2} aria-hidden="true" />;
  return (
    <Box component="section" aria-labelledby="judul-hero" sx={{ position: 'relative', overflow: 'hidden', background: gradients.hero }}>
      <Kontainer sx={{ pt: { xs: '36px', md: '72px' }, pb: { xs: '28px', md: '56px' } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.05fr)' },
            gap: { xs: '24px', md: '56px' },
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
            <JudulSeksi
              eyebrow={HERO.eyebrow}
              judul={HERO.judul}
              sub={<Teks web={HERO.sub.web} seluler={HERO.sub.mobile} />}
              tingkat="h1"
              id="judul-hero"
              rata="kiri"
              maxSub={480}
              sx={{ gap: '24px', '& > h1': { fontSize: { md: '54px' } } }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                gap: '12px',
                mt: '4px',
              }}
            >
              <TombolLanding varian="gradasi" ikonAkhir={ikonPanah} {...propsAksi(HERO.aksiUtama.rute)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {HERO.aksiUtama.label}
              </TombolLanding>
              <TombolLanding varian="garis" {...propsAksi(HERO.aksiKedua.rute)} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {HERO.aksiKedua.label}
              </TombolLanding>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: colors.muted }}>
              <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', color: colors.success }}>
                <IconCircleCheck size={18} stroke={2.4} />
              </Box>
              {HERO.catatan}
            </Box>
          </Box>
          <DasborMock data={MOCK_DASBOR} />
        </Box>
      </Kontainer>
      <Fakta />
    </Box>
  );
}
