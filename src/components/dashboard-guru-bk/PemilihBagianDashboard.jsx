import PropTypes from 'prop-types';
import { Box, ButtonBase, Chip, Typography } from '@mui/material';

// Tombol pemilih bagian dashboard BK. Satu bagian tampil dalam satu waktu.
// `penanda` (opsional): { [kode]: 'teks' } untuk hal mendesak di bagian yang sedang tidak dibuka.
const PemilihBagianDashboard = ({ bagianList, value, onChange, penanda = {} }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: `repeat(${bagianList.length}, 1fr)` }, gap: 1.5, mb: 3 }}>
    {bagianList.map((b) => {
      const Icon = b.icon;
      const aktif = b.kode === value;
      return (
        <ButtonBase
          key={b.kode}
          onClick={() => onChange(b.kode)}
          aria-pressed={aktif}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            border: 1,
            textAlign: 'left',
            borderColor: aktif ? 'primary.main' : 'divider',
            bgcolor: aktif ? 'primary.main' : 'background.paper',
            color: aktif ? 'primary.contrastText' : 'text.primary',
            transition: 'background-color .15s, border-color .15s',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <Icon size={24} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color="inherit">{b.label}</Typography>
            <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>{b.keterangan}</Typography>
          </Box>
          {penanda[b.kode] && <Chip size="small" color="error" label={penanda[b.kode]} />}
        </ButtonBase>
      );
    })}
  </Box>
);

PemilihBagianDashboard.propTypes = {
  bagianList: PropTypes.arrayOf(
    PropTypes.shape({ kode: PropTypes.string, label: PropTypes.string, keterangan: PropTypes.string, icon: PropTypes.elementType }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  penanda: PropTypes.object,
};

export default PemilihBagianDashboard;
