import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CETAK, gayaTautan, warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Peringatan kelas yang datanya tertinggal: lama tidak berubah dan banyak isian TP masih kosong. Angka kelas itu
 * tetap tampil di tabel, tetapi pembacanya diberi tahu bahwa angka dari data lama kurang bisa dipercaya.
 */
export default function BannerTertinggal({ daftar, onBuka }) {
  const w = warnaRingkasan(useTheme());
  if (daftar.length === 0) return null;
  return (
    <Box
      role="status"
      aria-label="Kelas dengan data tertinggal"
      sx={{
        bgcolor: w.kartu, border: `1.5px solid ${w.ink}`, borderRadius: '8px', px: 2.25, py: 1.75, display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex', alignItems: 'center', minHeight: 22, px: 1, borderRadius: '4px', fontSize: 13, fontWeight: 600, bgcolor: w.ink, color: w.kartu, ...CETAK,
        }}
      >
        Data tertinggal
      </Box>
      <Box component="ul" sx={{ flex: '1 1 400px', listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {daftar.map((x) => (
          <Box component="li" key={x.id} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Typography sx={{ flex: '1 1 320px', fontSize: 14, lineHeight: '21px' }}>
              <b>{x.nama}</b>
              {`: ${x.kalimat}`}
            </Typography>
            <Box component="button" type="button" onClick={() => onBuka(x.id)} sx={gayaTautan(w)}>{`Lengkapi di ${x.nama}`}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

BannerTertinggal.propTypes = {
  daftar: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number, nama: PropTypes.string, kalimat: PropTypes.string,
  })).isRequired,
  onBuka: PropTypes.func.isRequired,
};
