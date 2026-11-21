import { Box } from '@mui/material';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import TombolLanding from '../../components/TombolLanding';
import { renderTeks } from '../../components/renderTeks';
import RingkasanKelasMock from '../../mock/lad/RingkasanKelasMock';
import { propsAksi } from '../../data/aksi';
import { HERO as D } from '../../data/analitik';
import { MOCK_KELAS } from '../../data/analitikMock';
import { colors } from '../../theme/tokens';

// Hero Analitik Pembelajaran: teks, dua tombol (menumpuk penuh lebar di
// seluler), dan catatan Kelas latihan di kiri; peraga kartu ringkasan kelas di
// kanan (di bawah md ditumpuk di bawah teks). Satu-satunya h1 halaman.
export default function HeroAnalitik() {
  return (
    <Seksi
      varian="hero"
      padAtas={{ xs: '28px', md: '56px' }}
      padBawah={{ xs: '32px', md: '64px' }}
      aria-labelledby="judul-analitik"
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.05fr)' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
          textAlign: 'left',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px', minWidth: 0 }}>
          <JudulSeksi
            eyebrow={D.eyebrow}
            judul={D.judul}
            sub={renderTeks(D.sub)}
            tingkat="h1"
            id="judul-analitik"
            rata="kiri"
            maxJudul={560}
            maxSub={500}
            sx={{ gap: '20px', '& > h1 + p': { fontSize: { xs: '16px', md: '17px' } } }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              alignSelf: { xs: 'stretch', sm: 'flex-start' },
              gap: '12px',
              mt: '6px',
            }}
          >
            <TombolLanding
              varian="gradasi"
              ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
              {...propsAksi(D.aksiUtama.rute)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {D.aksiUtama.label}
            </TombolLanding>
            <TombolLanding varian="garis" href={D.aksiKedua.href} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {D.aksiKedua.label}
            </TombolLanding>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.muted }}>
            <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', flex: 'none', color: colors.success }}>
              <IconCheck size={16} stroke={2} />
            </Box>
            <span>{renderTeks(D.catatan)}</span>
          </Box>
        </Box>
        <RingkasanKelasMock data={MOCK_KELAS} />
      </Box>
    </Seksi>
  );
}
