import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Kotak "cara membaca" di atas tabel. Aturan yang tadinya satu paragraf kecil dipecah menjadi butir pendek,
 * satu aturan per butir, dengan garis tegas di kiri (bukan hanya warna latar) supaya terbaca juga di cetak hitam-putih.
 * `children` dipakai untuk keterangan tambahan di bawah butir, mis. legenda ikon.
 */
export default function PetunjukTab({ judul = 'Cara membaca', butir, children, id }) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      id={id}
      component="section"
      aria-label={judul}
      sx={{
        bgcolor: w.latar,
        border: `1px solid ${w.garisLembut}`,
        borderLeft: `4px solid ${w.ink}`,
        borderRadius: '6px',
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.75, md: 2 },
        boxShadow: 'none',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: '1.5rem', color: w.ink, mb: 0.75 }}>{judul}</Typography>
      <Box component="ul" sx={{ m: 0, p: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75, borderRadius: 0 }}>
        {butir.map((b, i) => (
          // Butir adalah teks tetap per tab; urutannya tidak berubah, jadi indeks aman sebagai kunci.
          <Typography key={i} component="li" sx={{ fontSize: '1rem', lineHeight: '1.5rem', color: w.ink, pl: 0.5, maxWidth: '80ch' }}>{b}</Typography>
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
