import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Eyebrow from '../../components/Eyebrow';
import ChipStatus from '../../components/ChipStatus';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import TombolLuar from '../../components/TombolLuar';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import { URL_MODUL_SMK } from '../../data/nav';
import { PRAKERSA as D } from '../../data/fitur';
import { blobs, colors, gradients, huruf, radius } from '../../theme/tokens';

// Blok gelap menuju Prakersa (SMK dan MAK): chip Uji terbatas (varian gelap, isi
// transparan bertepi putih), teks bantu, dan tautan keluar. Tombol buka di tab
// baru (target _blank, rel noopener noreferrer lewat TombolLanding `external`);
// di seluler tombol selebar kartu. Ditampilkan di bawah daftar peran, juga untuk
// tab Kepala jurusan yang tidak punya kartu.
export default function StripPrakersa() {
  return (
    <Seksi varian="terang" padAtas="0px" padBawah={{ xs: '24px', md: '32px' }} aria-labelledby="judul-prakersa">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: { xs: '14px', md: '32px' },
          boxSizing: 'border-box',
          p: { xs: '28px 20px', md: '40px 44px' },
          borderRadius: { xs: radius.kartuBesar, md: radius.kartuXL },
          background: gradients.dark,
          color: colors.white,
        }}
      >
        <DaftarBlob daftar={blobs.stripGelap} />
        <Box sx={{ position: 'relative', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
          <Eyebrow gelap component="p" sx={{ m: 0 }}>
            {D.eyebrow}
          </Eyebrow>
          <Box
            component="h2"
            id="judul-prakersa"
            sx={{ m: 0, color: colors.white, textWrap: 'balance', ...huruf.judulBagian, ...huruf.judulPanel }}
          >
            {D.judul}
          </Box>
          <Box component="p" sx={{ m: 0, color: colors.white, textWrap: 'pretty', ...huruf.subjudul, fontSize: '15px' }}>
            {renderTeks(D.sub)}
            <PenandaVerifikasi verifikasi={D.verifikasi} sx={{ ml: '10px' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <ChipStatus status={D.chip} varian="gelap" />
            <Box component="span" sx={{ fontSize: '13px', lineHeight: 1.6, color: colors.white }}>
              {renderTeks(D.catatan)}
            </Box>
          </Box>
        </Box>
        <TombolLuar varian="kuning" href={URL_MODUL_SMK} sx={{ position: 'relative', alignSelf: { xs: 'stretch', md: 'auto' } }}>
          {D.aksi.label}
        </TombolLuar>
      </Box>
    </Seksi>
  );
}
