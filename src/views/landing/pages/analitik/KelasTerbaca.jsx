import { Box } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import { renderTeks } from '../../components/renderTeks';
import MatriksMuridMock from '../../mock/lad/MatriksMuridMock';
import TrenNilaiMock from '../../mock/lad/TrenNilaiMock';
import { KELAS_TERBACA as D } from '../../data/analitik';
import { MOCK_MATRIKS, MOCK_TREN } from '../../data/analitikMock';
import { colors } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Bagian gelap "Kelas terbaca": teks dan tiga butir di kiri, peraga matriks
// murid dan grafik tren di kanan (satu kolom di bawah md, teks lebih dulu).
// Peraga berupa data contoh (DUMMY) dan aria-hidden; isinya sudah dijelaskan
// oleh tiga butir di sebelahnya.
export default function KelasTerbaca() {
  return (
    <Seksi varian="gelap" aria-labelledby="judul-kelas-terbaca">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.9fr) minmax(0,1.1fr)' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px', minWidth: 0 }}>
          <JudulSeksi
            eyebrow={D.eyebrow}
            judul={D.judul}
            sub={renderTeks(D.sub)}
            gelap
            rata="kiri"
            id="judul-kelas-terbaca"
            sx={{ '& > h2 + p': { color: colors.onDarkSoft, fontSize: { xs: '15px', md: '16px' } } }}
          />
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {D.butir.map((b) => (
              <Box
                key={b.web}
                component="li"
                sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', lineHeight: 1.6, color: colors.white }}
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
                    background: colors.yellow,
                    color: colors.yellowInk,
                  }}
                >
                  <IconCheck size={13} stroke={3} />
                </Box>
                <span>{renderTeks(b)}</span>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <MatriksMuridMock data={MOCK_MATRIKS} />
          <TrenNilaiMock data={MOCK_TREN} />
        </Box>
      </Box>
    </Seksi>
  );
}
