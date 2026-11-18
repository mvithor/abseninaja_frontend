import { Box } from '@mui/material';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import PerhatianMock from '../../mock/PerhatianMock';
import { propsAksi } from '../../data/aksi';
import { ANALITIK as D, MOCK_PERHATIAN } from '../../data/fitur';
import { blobs, colors, gradients, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Banner analitik pembelajaran: kartu gradasi dua kolom (teks di kiri, peraga
// "Perlu perhatian" di kanan), satu kolom di bawah md. Tombol menuju halaman
// Analitik, nonaktif sampai halamannya tersedia (data/nav.js).
const sxTagKaca = {
  height: 'auto',
  py: '6px',
  px: '12px',
  background: colors.tabGelapJumlah,
  color: colors.white,
};

export default function BannerAnalitik() {
  return (
    <Seksi varian="terang" id={D.id} padAtas="0px" padBawah="56px" aria-labelledby="judul-analitik">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.1fr) minmax(0,1fr)' },
          gap: { xs: '24px', md: '40px' },
          alignItems: 'center',
          p: { xs: '26px 20px', md: '44px 48px' },
          borderRadius: radius.kartuXL,
          background: gradients.brand,
          color: colors.white,
          boxShadow: shadows.kartuAksen,
        }}
      >
        <DaftarBlob daftar={blobs.banner} />
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <Box
            component="p"
            sx={{
              m: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: 28,
              px: '12px',
              borderRadius: radius.tag,
              background: colors.tabGelapJumlah,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <IconSparkles size={14} stroke={2} aria-hidden="true" />
            {D.label}
          </Box>
          <Box
            component="h2"
            id="judul-analitik"
            sx={{ m: 0, color: colors.white, textWrap: 'balance', ...huruf.judulBagian, ...huruf.judulBanner }}
          >
            {D.judul}
          </Box>
          <Box component="p" sx={{ m: 0, color: colors.white, textWrap: 'pretty', ...huruf.subjudul, fontSize: '15px' }}>
            {renderTeks(D.deskripsi)}
          </Box>
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {D.tag.map((t) => (
              <li key={t}>
                <Tag sx={sxTagKaca}>{t}</Tag>
              </li>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', mt: '6px' }}>
            <TombolLanding
              varian="kuning"
              ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
              {...propsAksi(D.aksi.rute)}
            >
              {D.aksi.label}
            </TombolLanding>
            <PenandaVerifikasi verifikasi={D.verifikasi} />
          </Box>
        </Box>
        <PerhatianMock data={MOCK_PERHATIAN} />
      </Box>
    </Seksi>
  );
}
