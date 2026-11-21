import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuAngka from '../../components/KartuAngka';
import { RINGKASAN as D } from '../../data/dampak';
import { resetDaftar } from '../../theme/sx';

// Ringkasan: bagian gelap dengan empat kartu angka kaca (satu kolom di seluler,
// dua di sm, empat di md). Angka berupa teks dengan labelnya.
export default function RingkasanDampak() {
  return (
    <PerbandinganGelap id={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="48px">
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '18px',
        }}
      >
        {D.butir.map((b) => (
          <li key={b.label}>
            <KartuAngka angka={b.angka} label={b.label} verifikasi={b.verifikasi} />
          </li>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}
