import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Kontainer from './Kontainer';
import TombolLanding from './TombolLanding';
import { renderJudul } from './renderJudul';
import { blobs, colors, gradients, huruf, radius } from '../theme/tokens';

// Banner ajakan bertindak: panel gradasi merek, blob, judul, subjudul, dua tombol.
export default function BannerCta({ judul, sub, aksiUtama, aksiKedua, sx }) {
  return (
    <Box component="section" sx={{ pt: 0, pb: { xs: '48px', md: '96px' }, ...sx }}>
      <Kontainer>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: gradients.brand,
            borderRadius: radius.cta,
            p: { xs: '26px 20px', md: '64px 56px' },
            textAlign: 'center',
            color: colors.white,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {blobs.cta.map((b, i) => {
            const { size, color, blur, ...posisi } = b;
            return (
              <Box
                key={i}
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  ...Object.fromEntries(Object.entries(posisi).map(([k, v]) => [k, `${v}px`])),
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  background: color,
                  filter: `blur(${blur}px)`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}
          <Box
            component="h2"
            sx={{ m: 0, maxWidth: 700, position: 'relative', color: colors.white, textWrap: 'balance', ...huruf.judulBagian }}
          >
            {renderJudul(judul, true)}
          </Box>
          {sub && (
            <Box
              component="p"
              sx={{ m: 0, maxWidth: 520, position: 'relative', color: colors.white, textWrap: 'pretty', ...huruf.subjudul }}
            >
              {sub}
            </Box>
          )}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignSelf: { xs: 'stretch', md: 'auto' },
              gap: '12px',
              mt: '8px',
            }}
          >
            {[
              [aksiUtama, 'kuning'],
              [aksiKedua, 'garisTerang'],
            ].map(([aksi, varian]) => {
              if (!aksi) return null;
              const { label, ...props } = aksi;
              return (
                <TombolLanding key={label} varian={varian} {...props}>
                  {label}
                </TombolLanding>
              );
            })}
          </Box>
        </Box>
      </Kontainer>
    </Box>
  );
}

// Aksi: { label, to | href, nonaktif, onClick }. Semua kecuali label diteruskan ke TombolLanding.
const aksiShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
});

BannerCta.propTypes = {
  judul: PropTypes.node.isRequired,
  sub: PropTypes.node,
  aksiUtama: aksiShape,
  aksiKedua: aksiShape,
  sx: PropTypes.object,
};
