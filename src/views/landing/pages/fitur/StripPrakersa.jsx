import { Box } from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Eyebrow from '../../components/Eyebrow';
import TombolLanding from '../../components/TombolLanding';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import { PRAKERSA as D } from '../../data/fitur';
import { blobs, colors, gradients, huruf, radius } from '../../theme/tokens';
import { hanyaPembaca } from '../../theme/sx';

// Strip gelap menuju Prakersa (modul SMK): tautan keluar, buka di tab baru
// (target _blank, rel noopener noreferrer lewat TombolLanding `external`).
export default function StripPrakersa() {
  return (
    <Seksi varian="terang" padAtas="0px" padBawah="80px" aria-labelledby="judul-prakersa">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px',
          boxSizing: 'border-box',
          p: { xs: '26px 20px', md: '40px 44px' },
          borderRadius: radius.kartuXL,
          background: gradients.dark,
          color: colors.white,
        }}
      >
        <DaftarBlob daftar={blobs.stripGelap} />
        <Box sx={{ position: 'relative', maxWidth: 660 }}>
          <Eyebrow gelap component="p" sx={{ m: 0 }}>
            {D.eyebrow}
          </Eyebrow>
          <Box
            component="h2"
            id="judul-prakersa"
            sx={{ m: '16px 0 0', color: colors.white, textWrap: 'balance', ...huruf.judulBagian, ...huruf.judulPanel }}
          >
            {D.judul}
          </Box>
          <Box component="p" sx={{ m: '10px 0 0', color: colors.white, textWrap: 'pretty', ...huruf.subjudul, fontSize: '15px' }}>
            {renderTeks(D.sub)}
          </Box>
        </Box>
        <TombolLanding
          varian="kuning"
          href={D.aksi.href}
          external
          ikonAkhir={<IconArrowUpRight size={18} stroke={2.2} aria-hidden="true" />}
          sx={{ position: 'relative' }}
        >
          {D.aksi.label}
          <Box component="span" sx={hanyaPembaca}>
            {' '}
            (buka di tab baru)
          </Box>
        </TombolLanding>
      </Box>
    </Seksi>
  );
}
