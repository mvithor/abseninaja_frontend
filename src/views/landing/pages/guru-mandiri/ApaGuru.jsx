import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import Tag from '../../components/Tag';
import { renderTeks } from '../../components/renderTeks';
import PerhatianMock from '../../mock/PerhatianMock';
import { APA as D } from '../../data/guruMandiri';
import { colors, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// "Apa itu": teks rata kiri dengan tiga tag di kiri dan peraga dasbor kecil
// "Perlu perhatian" (data dummy, dekoratif) di kanan; satu kolom di bawah md.
// Peraga memakai kartu putih bertepi di latar terang.
export default function ApaGuru() {
  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas={{ xs: '12px', md: '24px' }}
      padBawah={{ xs: '44px', md: '88px' }}
      aria-labelledby="judul-apa-itu"
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px' }}>
          <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-apa-itu" rata="kiri" />
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {D.tag.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </Box>
        </Box>
        <PerhatianMock
          data={D.mock}
          sx={{
            p: '24px',
            borderRadius: radius.kartuBesar,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.mockup,
          }}
        />
      </Box>
    </Seksi>
  );
}
