import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Kontainer from './Kontainer';
import { DaftarBlob } from './Blob';
import { blobs, gradients, colors } from '../theme/tokens';

// Seksi halaman. Varian:
//  terang : latar putih
//  tint   : latar lembut (gradasi tint)
//  hero   : latar hero + blob + pudar ke putih, isi rata tengah
//  gelap  : gradasi gelap + blob, teks putih
const BLOB_UNTUK = { hero: blobs.hero, gelap: blobs.gelap };

const latar = {
  terang: { background: colors.white },
  tint: { background: gradients.tint },
  hero: { background: gradients.hero },
  gelap: { background: gradients.dark, color: colors.white },
};

// Padding atas dan bawah: seluler setengah dari web (aturan skala desain).
const padBawaan = {
  terang: { atas: { xs: '36px', md: '72px' }, bawah: { xs: '36px', md: '72px' } },
  tint: { atas: { xs: '36px', md: '72px' }, bawah: { xs: '36px', md: '72px' } },
  hero: { atas: { xs: '32px', md: '64px' }, bawah: { xs: '28px', md: '56px' } },
  gelap: { atas: { xs: '38px', md: '76px' }, bawah: { xs: '42px', md: '84px' } },
};

export default function Seksi({ varian = 'terang', padAtas, padBawah, children, sx, kontainerSx, ...rest }) {
  const blobSeksi = BLOB_UNTUK[varian];
  const atas = padAtas ?? padBawaan[varian].atas;
  const bawah = padBawah ?? padBawaan[varian].bawah;
  const hero = varian === 'hero';

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: blobSeksi ? 'hidden' : undefined,
        pt: atas,
        pb: bawah,
        ...latar[varian],
        ...sx,
      }}
      {...rest}
    >
      {blobSeksi && <DaftarBlob daftar={blobSeksi} />}
      {hero && (
        <Box
          aria-hidden="true"
          sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: gradients.heroFade }}
        />
      )}
      <Kontainer
        sx={{
          position: 'relative',
          ...(hero
            ? { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }
            : null),
          ...kontainerSx,
        }}
      >
        {children}
      </Kontainer>
    </Box>
  );
}

Seksi.propTypes = {
  varian: PropTypes.oneOf(['terang', 'tint', 'hero', 'gelap']),
  padAtas: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  padBawah: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
  sx: PropTypes.object,
  kontainerSx: PropTypes.object,
};
