import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { FAKTA } from '../../data/analitik';
import { colors, huruf } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Pita fakta: empat angka dengan garis kuning di kiri, rata kiri. Dua kolom di
// bawah md, empat kolom dari md. Angka berupa teks, jadi terbaca pembaca layar.
export default function PitaFakta() {
  return (
    <Seksi varian="terang" padAtas={{ xs: '4px', md: '8px' }} padBawah={{ xs: '28px', md: '56px' }}>
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
        }}
      >
        {FAKTA.map((f) => (
          <Box
            key={f.angka + f.label.web}
            component="li"
            sx={{
              textAlign: 'left',
              borderLeft: `3px solid ${colors.yellow}`,
              py: { xs: '2px', md: '4px' },
              pl: '16px',
            }}
          >
            <Box sx={{ color: colors.ink, ...huruf.angkaBesar }}>{f.angka}</Box>
            <Box sx={{ mt: '4px', fontSize: '13px', color: colors.muted }}>{renderTeks(f.label)}</Box>
            <PenandaVerifikasi verifikasi={f.verifikasi} sx={{ mt: '8px' }} />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}
