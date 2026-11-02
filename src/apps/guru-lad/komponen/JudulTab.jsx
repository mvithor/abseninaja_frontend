import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Kepala setiap tab data kelas: judul bagian, satu kalimat tujuan, dan (opsional) aksi utama di kanan.
 * Pola yang sama di semua tab supaya guru selalu tahu di mana judul dan tombol utamanya berada.
 */
export default function JudulTab({ judul, keterangan, aksi, id }) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
        <Typography id={id} component="h2" sx={{ fontSize: '1.1875rem', lineHeight: 1.5, fontWeight: 600, color: w.ink }}>
          {judul}
        </Typography>
        {keterangan && (
          <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: 1.5, color: w.sekunder, maxWidth: '80ch' }}>
            {keterangan}
          </Typography>
        )}
      </Box>
      {aksi && <Box sx={{ flex: 'none', width: { xs: '100%', sm: 'auto' } }}>{aksi}</Box>}
    </Box>
  );
}

JudulTab.propTypes = {
  judul: PropTypes.string.isRequired,
  keterangan: PropTypes.node,
  aksi: PropTypes.node,
  id: PropTypes.string,
};
