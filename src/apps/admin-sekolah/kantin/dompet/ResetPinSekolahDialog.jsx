import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import {
  BATAS_KANTIN,
  BATAS_KANTIN_SEKOLAH,
  bangunPayloadResetPinSekolah,
  validasiResetPinSekolah,
} from '../kantinSekolah';

const ResetPinSekolahDialog = ({ buka, siswa, sibuk = false, errorServer = '', onKirim, onTutup }) => {
  const [pinBaru, setPinBaru] = useState('');
  const [alasan, setAlasan] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setPinBaru('');
    setAlasan('');
    setErrorLokal('');
  }, [buka, siswa?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const galat = validasiResetPinSekolah({ pin_baru: pinBaru, alasan });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(bangunPayloadResetPinSekolah({ pin_baru: pinBaru, alasan }));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-reset-pin-sekolah">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-reset-pin-sekolah">Reset PIN Dompet (Admin Sekolah)</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {siswa?.nama || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              NIS: {siswa?.nis || '-'} {siswa?.kelas ? `· Kelas: ${siswa.kelas}` : ''}
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ mb: 2 }}>
            Reset PIN oleh Admin Sekolah mengganti PIN siswa tanpa PIN lama sekaligus membuka kunci bila akun sempat terkunci karena salah PIN. Semua perubahan tercatat di audit log.
          </Alert>

          <Stack spacing={2}>
            <Box>
              <CustomFormLabel htmlFor="pin_baru_reset" sx={{ mt: 0 }}>
                PIN Baru (6 digit angka)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="pin_baru_reset"
                type="password"
                autoComplete="off"
                value={pinBaru}
                onChange={(e) => setPinBaru(e.target.value.replace(/\D/g, '').slice(0, BATAS_KANTIN.PIN_PANJANG))}
                inputProps={{ inputMode: 'numeric', maxLength: BATAS_KANTIN.PIN_PANJANG }}
                placeholder="Tepat 6 digit angka"
                fullWidth
                required
              />
            </Box>

            <Box>
              <CustomFormLabel htmlFor="alasan_reset_pin" sx={{ mt: 0 }}>
                Alasan Reset PIN
              </CustomFormLabel>
              <CustomOutlinedInput
                id="alasan_reset_pin"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Contoh: Siswa lupa PIN kartu pelajar / terkunci"
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.ALASAN_RESET_PIN_MAX }}
                multiline
                minRows={2}
                fullWidth
                required
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Reset PIN Sekarang</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

ResetPinSekolahDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  siswa: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default ResetPinSekolahDialog;
