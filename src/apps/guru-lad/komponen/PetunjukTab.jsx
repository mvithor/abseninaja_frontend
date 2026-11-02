import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Kotak "cara membaca" di atas tabel (latar biru muda). Aturan yang tadinya satu paragraf kecil dipecah menjadi butir
 * pendek, satu aturan per butir. `children` dipakai untuk keterangan tambahan di bawah butir.
 */
export default function PetunjukTab({ judul = 'Cara membaca', butir, children, id }) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      id={id}
      component="section"
      role="note"
      aria-label={judul}
      sx={{
        bgcolor: w.bgPetunjuk,
        border: 0,
        borderRadius: '7px',
        px: { xs: 2, md: 2.5 },
        py: 2,
        boxShadow: 'none',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: w.ink, mb: 0.75 }}>{judul}</Typography>
      <Box component="ul" sx={{ m: 0, p: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: '3px', borderRadius: 0 }}>
        {butir.map((b, i) => (
          // Butir adalah teks tetap per tab; urutannya tidak berubah, jadi indeks aman sebagai kunci.
          <Typography key={i} component="li" sx={{ fontSize: 14, lineHeight: 1.5, color: w.ink, maxWidth: '80ch' }}>{b}</Typography>
        ))}
      </Box>
      {children && <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${w.garis}`, borderRadius: 0 }}>{children}</Box>}
    </Box>
  );
}

PetunjukTab.propTypes = {
  judul: PropTypes.string,
  butir: PropTypes.arrayOf(PropTypes.node).isRequired,
  children: PropTypes.node,
  id: PropTypes.string,
};
