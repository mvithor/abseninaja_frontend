import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import Teks from '../../components/Teks';
import PonselMock from '../../mock/PonselMock';
import { KOMUNIKASI as D, MOCK_PONSEL } from '../../data/beranda';
import { colors } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { PAD_SEKSI, sxJudulBeranda } from './gaya';

// Bagian Komunikasi: teks dan tiga kanal di kiri, peraga ponsel wali murid di
// kanan (di bawah md bertumpuk, teks lebih dulu).
export default function Komunikasi() {
  return (
    <Seksi varian="tint" padAtas={PAD_SEKSI} padBawah={PAD_SEKSI} aria-labelledby="judul-komunikasi">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: { xs: '24px', md: '64px' },
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px' }}>
          <JudulSeksi
            eyebrow={D.eyebrow}
            judul={D.judul}
            sub={<Teks web={D.sub.web} seluler={D.sub.mobile} />}
            id="judul-komunikasi"
            rata="kiri"
            sx={{ gap: '20px', ...sxJudulBeranda }}
          />
          <Box component="ul" role="list" aria-label="Kanal kabar" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {D.kanal.map((k) => (
              <li key={k}>
                <Tag
                  sx={{
                    height: 'auto',
                    py: '8px',
                    px: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: colors.white,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {k}
                </Tag>
              </li>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PonselMock data={MOCK_PONSEL} />
        </Box>
      </Box>
    </Seksi>
  );
}
