import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Bilah di atas tabel isian: aksi tambahan di kiri, status simpan dan tombol Batalkan/Simpan di kanan.
 * Dipakai tab Nilai TP, Proyek, dan Kehadiran. Status tertulis ("N sel belum disimpan") dan diumumkan
 * pembaca layar; tidak hanya berupa warna tombol.
 */
export default function BilahSimpan({
  jumlahKotor, sibuk, adaGalat, onBuang, onSimpan, labelSimpan = 'Simpan nilai', labelSel = 'sel', kiri,
}) {
  const w = warnaRingkasan(useTheme());
  const kotor = jumlahKotor > 0;
  return (
    <Box
      sx={{
        ...gayaKartu(w),
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, md: 2 },
        px: { xs: 2, md: 2.5 },
        py: { xs: 1.5, md: 1.75 },
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', minHeight: { md: 44 } }}>{kiri}</Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1.25, sm: 2 } }}>
        <Typography
          aria-live="polite"
          sx={{
            fontSize: '1rem',
            fontWeight: kotor ? 700 : 400,
            color: kotor ? w.ink : w.sekunder,
            whiteSpace: { sm: 'nowrap' },
            // Penanda kedua selain warna: garis bawah putus-putus saat ada yang belum disimpan.
            textDecoration: kotor ? 'underline dashed' : 'none',
            textUnderlineOffset: 4,
          }}
        >
          {kotor ? `${jumlahKotor} ${labelSel} belum disimpan` : 'Semua tersimpan'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
          <Button variant="outlined" onClick={onBuang} disabled={!kotor || sibuk} sx={{ whiteSpace: 'nowrap' }}>Batalkan</Button>
          <Button variant="contained" onClick={onSimpan} disabled={!kotor || adaGalat || sibuk} sx={{ whiteSpace: 'nowrap' }}>
            {sibuk ? 'Menyimpan...' : labelSimpan}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

BilahSimpan.propTypes = {
  jumlahKotor: PropTypes.number.isRequired,
  sibuk: PropTypes.bool,
  adaGalat: PropTypes.bool,
  onBuang: PropTypes.func.isRequired,
  onSimpan: PropTypes.func.isRequired,
  labelSimpan: PropTypes.string,
  labelSel: PropTypes.string,
  kiri: PropTypes.node,
};
