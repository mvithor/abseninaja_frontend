import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from '@mui/material';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import {
  BATAS_KANTIN,
  bangunPayloadReversal,
  buatKunciIdempotensi,
  formatRupiah,
  validasiReversal,
} from '../kantin';

const ReversalDialog = ({ buka, transaksi, sibuk = false, errorServer = '', onKirim, onTutup }) => {
  const [alasan, setAlasan] = useState('');
  const [kunciIdem, setKunciIdem] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setAlasan('');
    setErrorLokal('');
    setKunciIdem(buatKunciIdempotensi('rev'));
  }, [buka, transaksi?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const galat = validasiReversal({ transaksi, alasan });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(bangunPayloadReversal({ alasan, idempotencyKey: kunciIdem }));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-reversal-kantin">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-reversal-kantin">Konfirmasi Reversal / Pembatalan Transaksi</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Alert severity="warning" sx={{ mb: 2 }}>
            Reversal akan mengembalikan saldo ke dompet siswa dan mengurangi saldo mengendap kantin melalui baris ledger pembalik. Setiap transaksi hanya dapat direversal satu kali.
          </Alert>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Kode Transaksi: <strong>{transaksi?.kode_transaksi || '-'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Siswa: <strong>{transaksi?.siswa?.nama || '-'}</strong>
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mt: 0.75 }}>
              {formatRupiah(transaksi?.nominal ?? 0)}
            </Typography>
          </Paper>

          <CustomFormLabel htmlFor="alasan_reversal" sx={{ mt: 0 }}>
            Alasan Pembatalan / Reversal (minimal 5 karakter)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="alasan_reversal"
            multiline
            rows={3}
            value={alasan}
            onChange={(e) => {
              setAlasan(e.target.value);
              setKunciIdem(buatKunciIdempotensi('rev'));
            }}
            placeholder="Contoh: Salah input jumlah pesanan di kasir"
            inputProps={{ maxLength: BATAS_KANTIN.ALASAN_REVERSAL_MAX }}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Proses Reversal</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

ReversalDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  transaksi: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default ReversalDialog;
