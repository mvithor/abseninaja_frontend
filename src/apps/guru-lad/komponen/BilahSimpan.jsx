import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

/**
 * Bilah di bawah tabel isian (latar abu-biru muda): status simpan di kiri, tombol Batalkan/Simpan di kanan. Menempel di
 * bawah layar saat tabelnya panjang, supaya tombol simpan tidak jauh dari sel yang sedang diisi.
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
        bgcolor: w.latar,
        borderRadius: '7px',
        boxShadow: 'none',
        position: 'sticky',
        bottom: 8,
        zIndex: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 1.5, md: 2 },
        px: { xs: 2, md: 2.5 },
        py: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', minHeight: { md: 44 } }}>
        <Typography
          aria-live="polite"
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: w.ink,
            // Penanda kedua selain warna: garis bawah putus-putus saat ada yang belum disimpan.
            textDecoration: kotor ? 'underline dashed' : 'none',
            textUnderlineOffset: 4,
          }}
        >
          {kotor ? `${jumlahKotor} ${labelSel} belum disimpan` : 'Semua tersimpan'}
        </Typography>
        {kiri}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Button variant="outlined" color="inherit" onClick={onBuang} disabled={!kotor || sibuk} sx={{ whiteSpace: 'nowrap', borderColor: '#D1D5DB', color: '#374151' }}>Batalkan</Button>
        <Button variant="contained" onClick={onSimpan} disabled={!kotor || adaGalat || sibuk} sx={{ whiteSpace: 'nowrap', boxShadow: 'none' }}>
          {sibuk ? 'Menyimpan...' : labelSimpan}
        </Button>
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
