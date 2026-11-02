import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconAlertTriangle } from '@tabler/icons-react';
import { CETAK, gayaTautan, warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Peringatan kelas yang datanya tertinggal: lama tidak berubah dan banyak isian TP masih kosong. Angka kelas itu
 * tetap tampil di tabel, tetapi pembacanya diberi tahu bahwa angka dari data lama kurang bisa dipercaya.
 */
export default function BannerTertinggal({ daftar, onBuka }) {
  const tema = useTheme();
  const w = warnaRingkasan(tema);
  if (daftar.length === 0) return null;
  const tunggal = daftar.length === 1;
  const tautan = (x) => (
    <Box component="button" type="button" onClick={() => onBuka(x.id)} sx={{ ...gayaTautan(w), flex: 'none', whiteSpace: 'nowrap' }}>{`Lengkapi di ${x.nama}`}</Box>
  );
  return (
    <Box
      role="status"
      aria-label="Kelas dengan data tertinggal"
      sx={{
        bgcolor: w.bgPeringatan, borderRadius: '7px', px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, color: w.ink, ...CETAK,
      }}
    >
      <Box component="span" aria-hidden="true" sx={{ display: 'flex', mt: '1px', color: tema.palette.warning.dark, flex: 'none' }}>
        <IconAlertTriangle size={22} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {tunggal ? (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Box sx={{ flex: '1 1 320px' }}>
              <b>Data tertinggal.</b>
              {` ${daftar[0].nama}: ${daftar[0].kalimat}`}
            </Box>
            {tautan(daftar[0])}
          </Box>
        ) : (
          <>
            <b>Data tertinggal.</b>
            <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 0.5, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {daftar.map((x) => (
                <Box component="li" key={x.id} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: '1 1 320px' }}>
                    <b>{x.nama}</b>
                    {`: ${x.kalimat}`}
                  </Box>
                  {tautan(x)}
                </Box>
              ))}
            </Box>
          </>
        )}
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
