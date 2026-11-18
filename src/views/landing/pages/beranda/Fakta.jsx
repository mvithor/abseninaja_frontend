import { Box } from '@mui/material';
import Kontainer from '../../components/Kontainer';
import PenandaDesain from '../../components/PenandaDesain';
import { renderJudul } from '../../components/renderJudul';
import { FAKTA } from '../../data/beranda';
import { colors } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Pita angka di dasar hero: empat butir, angka 42 px (seluler 26 px) dengan
// bagian aksen, pemisah garis tipis di kiri tiap butir (dua kolom di seluler).
const garis = `1px solid ${colors.borderSoft}`;

export default function Fakta() {
  const n = FAKTA.length;
  return (
    <Box sx={{ borderTop: garis }}>
      <Kontainer sx={{ pt: { xs: '18px', md: '36px' }, pb: { xs: '20px', md: '40px' } }}>
        <Box
          component="ul"
          sx={{
            ...resetDaftar,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: `repeat(${n}, minmax(0,1fr))` },
            rowGap: { xs: '20px', md: 0 },
          }}
        >
          {FAKTA.map((f, i) => {
            const kanan = i % 2 === 1;
            return (
              <Box
                key={f.label}
                component="li"
                sx={{
                  py: '4px',
                  borderLeft: { xs: kanan ? garis : 'none', md: i > 0 ? garis : 'none' },
                  pl: { xs: kanan ? '20px' : 0, md: i > 0 ? '20px' : 0 },
                  pr: { xs: kanan ? 0 : '12px', md: i < n - 1 ? '20px' : 0 },
                }}
              >
                <Box sx={{ fontSize: { xs: '26px', md: '42px' }, fontWeight: 700, lineHeight: 1.1, color: colors.ink }}>
                  {renderJudul(f.nilai)}
                </Box>
                <Box sx={{ fontSize: '13px', color: colors.muted, mt: '8px' }}>{f.label}</Box>
                {f.verifikasi && <PenandaDesain sx={{ mt: '8px' }} />}
              </Box>
            );
          })}
        </Box>
      </Kontainer>
    </Box>
  );
}
