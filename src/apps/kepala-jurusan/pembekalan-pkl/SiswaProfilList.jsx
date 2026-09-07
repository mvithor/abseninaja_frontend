import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// Daftar nama siswa dalam satu grup profil. Menampilkan nama + NIS + kelas
// dalam grid ringkas agar muat banyak siswa tanpa kartu terlalu tinggi.
const SiswaProfilList = ({ siswa }) => {
  if (!siswa || siswa.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        Tidak ada siswa pada grup ini.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
      {siswa.map((s) => (
        <Box
          key={s.id}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
            px: 1.2, py: 0.8, borderRadius: '8px', backgroundColor: 'action.hover',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{s.nama}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {s.nis || '—'} · {s.kelas}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

SiswaProfilList.propTypes = {
  siswa: PropTypes.array,
};

export default SiswaProfilList;
