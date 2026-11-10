import PropTypes from 'prop-types';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

// Dialog konfirmasi seragam dengan dialog Nonaktifkan/Hapus yang sudah ada di aplikasi (judul tengah, tombol oranye).
const DialogKonfirmasi = ({ buka, judul, isi, tombol, sibuk = false, onKonfirmasi, onTutup }) => (
  <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
    <DialogContent>
      <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
        {judul}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {isi}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
      <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={onTutup} disabled={sibuk}>
        Batal
      </Button>
      <Button
        sx={{ mr: 3, backgroundColor: '#F48C06', '&:hover': { backgroundColor: '#f7a944' } }}
        variant="contained"
        onClick={onKonfirmasi}
        disabled={sibuk}
      >
        {sibuk ? <CircularProgress size={24} /> : tombol}
      </Button>
    </DialogActions>
  </Dialog>
);

DialogKonfirmasi.propTypes = {
  buka: PropTypes.bool.isRequired,
  judul: PropTypes.string,
  isi: PropTypes.string,
  tombol: PropTypes.string,
  sibuk: PropTypes.bool,
  onKonfirmasi: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default DialogKonfirmasi;
