import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KotakIkon from '../../components/KotakIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import ProfilMuridMock from '../../mock/lad/ProfilMuridMock';
import SaranTindakLanjutMock from '../../mock/lad/SaranTindakLanjutMock';
import { PROFIL_SARAN as D } from '../../data/analitik';
import { MOCK_PROFIL, MOCK_SARAN } from '../../data/analitikMock';
import { colors } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { sxSubLad } from './gaya';

// Profil murid dan Saran tindak lanjut: dua peraga di kiri (data contoh, aria-hidden),
// teks dan tiga poin di kanan. Urutan DOM dan tumpukan seluler sama dengan
// desain: peraga lebih dulu, lalu teks.
export default function ProfilSaran() {
  return (
    <Seksi varian="tint" aria-labelledby="judul-profil-saran">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: { xs: '24px', md: '48px' },
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <ProfilMuridMock data={MOCK_PROFIL} />
          <SaranTindakLanjutMock data={MOCK_SARAN} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px', minWidth: 0 }}>
          <JudulSeksi
            eyebrow={D.eyebrow}
            judul={D.judul}
            sub={renderTeks(D.sub)}
            rata="kiri"
            id="judul-profil-saran"
            maxJudul={560}
            penanda={<PenandaVerifikasi verifikasi={D.verifikasi} />}
            sx={sxSubLad}
          />
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {D.poin.map((p) => (
              <Box key={p.judul} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <KotakIkon ikon={p.ikon} ukuran={44} ikonUkuran={20} sudut="14px" />
                <Box>
                  <Box component="h3" sx={{ m: 0, fontSize: '16px', fontWeight: 600, color: colors.ink }}>
                    {p.judul}
                  </Box>
                  <Box component="p" sx={{ m: '2px 0 0', fontSize: '14px', lineHeight: 1.65, color: colors.muted }}>
                    {renderTeks(p.deskripsi)}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Seksi>
  );
}
