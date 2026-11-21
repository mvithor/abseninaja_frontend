import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, gerak, radius, shadows } from '../theme/tokens';
import { resetDaftar, resetTombol } from '../theme/sx';

// Akordeon FAQ. Satu butir terbuka sekali waktu. Tombol memakai aria-expanded.
// Butir boleh memuat `verifikasi` (true atau teks label): penanda desain di
// bawah jawaban untuk klaim yang belum terbukti.
export default function Faq({ butir, bukaAwal = 0, sx }) {
  const dasarId = useId();
  const [buka, setBuka] = useState(bukaAwal);

  return (
    <Box
      component="ul"
      // role="list": Safari dan VoiceOver membuang semantik daftar bila list-style: none.
      role="list"
      sx={{
        ...resetDaftar,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: 820,
        mx: 'auto',
        ...sx,
      }}
    >
      {butir.map((b, i) => {
        const terbuka = buka === i;
        const idTombol = `${dasarId}-q-${i}`;
        const idPanel = `${dasarId}-a-${i}`;
        return (
          <Box
            key={b.q}
            component="li"
            sx={{
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.kartu,
              boxShadow: shadows.kartu,
            }}
          >
            <Box component="h3" sx={{ m: 0 }}>
              <Box
                component="button"
                type="button"
                id={idTombol}
                aria-expanded={terbuka}
                aria-controls={terbuka ? idPanel : undefined}
                onClick={() => setBuka(terbuka ? -1 : i)}
                sx={{
                  ...resetTombol,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  width: '100%',
                  minHeight: 64,
                  boxSizing: 'border-box',
                  p: { xs: '14px 16px', md: '14px 24px' },
                  borderRadius: radius.kartu,
                  color: colors.ink,
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {b.q}
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    flex: 'none',
                    borderRadius: '50%',
                    background: colors.accent,
                    color: colors.white,
                    transform: terbuka ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${gerak.sedang} ${gerak.ease}`,
                  }}
                >
                  <IconChevronDown size={16} stroke={2.6} />
                </Box>
              </Box>
            </Box>
            {terbuka && (
              <Box
                id={idPanel}
                sx={{
                  p: { xs: '0 16px 20px', md: '0 24px 22px' },
                  color: colors.muted,
                  fontSize: '15px',
                  lineHeight: 1.75,
                }}
              >
                {b.a}
                <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ display: 'flex', width: 'fit-content', mt: '12px' }} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

Faq.propTypes = {
  butir: PropTypes.arrayOf(
    PropTypes.shape({
      q: PropTypes.string.isRequired,
      a: PropTypes.node.isRequired,
      verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    }),
  ).isRequired,
  bukaAwal: PropTypes.number,
  sx: PropTypes.object,
};
