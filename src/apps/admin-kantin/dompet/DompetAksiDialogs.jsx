import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import {
  BATAS_KANTIN,
  bangunPayloadLimit,
  bangunPayloadPin,
  bangunPayloadTopup,
  buatKunciIdempotensi,
  formatRupiah,
  metaStatusDompet,
  sisaLimitHarian,
  validasiLimitForm,
  validasiPinForm,
  validasiTopup,
} from '../kantin';

export const TopupDompetDialog = ({ buka, siswa, dompet, sibuk = false, errorServer = '', onKirim, onTutup }) => {
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [kunciIdem, setKunciIdem] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setNominal('');
    setCatatan('');
    setErrorLokal('');
    setKunciIdem(buatKunciIdempotensi('topup'));
  }, [buka, siswa?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nilai = nominal === '' ? '' : Number(nominal);
    const galat = validasiTopup({ siswa, nominal: nilai, catatan });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(
      bangunPayloadTopup({
        siswaId: siswa.id,
        nominal: nilai,
        idempotencyKey: kunciIdem,
        catatan,
      }),
    );
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-topup-dompet">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-topup-dompet">Top-Up Saldo Siswa</DialogTitle>
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
            <Typography variant="caption" color="text.secondary">
              NIS: {siswa?.nis || '-'} {siswa?.kelas ? `· Kelas: ${siswa.kelas}` : ''}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Saldo saat ini: <strong>{formatRupiah(dompet?.saldo ?? 0)}</strong>
            </Typography>
          </Paper>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Pilih Nominal Cepat:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {BATAS_KANTIN.NOMINAL_TOPUP_PRESET.map((p) => (
                  <Button
                    key={p}
                    size="small"
                    variant={Number(nominal) === p ? 'contained' : 'outlined'}
                    onClick={() => {
                      setNominal(String(p));
                      setKunciIdem(buatKunciIdempotensi('topup'));
                    }}
                  >
                    {formatRupiah(p)}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box>
              <CustomFormLabel htmlFor="nominal_topup" sx={{ mt: 0 }}>
                Nominal Top-Up (Rupiah)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="nominal_topup"
                type="number"
                value={nominal}
                onChange={(e) => {
                  setNominal(e.target.value);
                  setKunciIdem(buatKunciIdempotensi('topup'));
                }}
                placeholder="50000"
                inputProps={{ min: 1, step: 1000 }}
                fullWidth
                required
              />
            </Box>

            <Box>
              <CustomFormLabel htmlFor="catatan_topup" sx={{ mt: 0 }}>
                Catatan (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="catatan_topup"
                value={catatan}
                onChange={(e) => {
                  setCatatan(e.target.value);
                  setKunciIdem(buatKunciIdempotensi('topup'));
                }}
                placeholder="Setoran tunai loket kantin"
                inputProps={{ maxLength: BATAS_KANTIN.CATATAN_MAX }}
                fullWidth
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Proses Top-Up</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

TopupDompetDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  siswa: PropTypes.object,
  dompet: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export const AturPinDialog = ({ buka, siswa, dompet, sibuk = false, errorServer = '', onKirim, onTutup }) => {
  const punyaPin = Boolean(dompet?.punya_pin);
  const [pinLama, setPinLama] = useState('');
  const [pinBaru, setPinBaru] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setPinLama('');
    setPinBaru('');
    setErrorLokal('');
  }, [buka, siswa?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const galat = validasiPinForm({ pin_baru: pinBaru, pin_lama: pinLama, punyaPin });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(bangunPayloadPin({ pin_baru: pinBaru, pin_lama: pinLama, punyaPin }));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="xs" fullWidth aria-labelledby="judul-pin-dompet">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-pin-dompet">{punyaPin ? 'Ubah PIN Dompet Siswa' : 'Atur PIN Awal Dompet'}</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Siswa: <strong>{siswa?.nama || '-'}</strong> ({siswa?.nis || 'Tanpa NIS'})
          </Typography>
          <Stack spacing={2}>
            {punyaPin && (
              <Box>
                <CustomFormLabel htmlFor="pin_lama" sx={{ mt: 0 }}>
                  PIN Lama (6 digit)
                </CustomFormLabel>
                <CustomOutlinedInput
                  id="pin_lama"
                  type="password"
                  autoComplete="off"
                  value={pinLama}
                  onChange={(e) => setPinLama(e.target.value.replace(/\D/g, '').slice(0, BATAS_KANTIN.PIN_PANJANG))}
                  inputProps={{ inputMode: 'numeric', maxLength: BATAS_KANTIN.PIN_PANJANG }}
                  placeholder="••••••"
                  fullWidth
                  required
                />
              </Box>
            )}
            <Box>
              <CustomFormLabel htmlFor="pin_baru" sx={{ mt: 0 }}>
                PIN Baru (6 digit angka)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="pin_baru"
                type="password"
                autoComplete="off"
                value={pinBaru}
                onChange={(e) => setPinBaru(e.target.value.replace(/\D/g, '').slice(0, BATAS_KANTIN.PIN_PANJANG))}
                inputProps={{ inputMode: 'numeric', maxLength: BATAS_KANTIN.PIN_PANJANG }}
                placeholder="••••••"
                fullWidth
                required
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Simpan PIN</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

AturPinDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  siswa: PropTypes.object,
  dompet: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export const AturLimitDialog = ({ buka, siswa, dompet, sibuk = false, errorServer = '', onKirim, onTutup }) => {
  const [tanpaBatas, setTanpaBatas] = useState(true);
  const [limitHarian, setLimitHarian] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setErrorLokal('');
    if (dompet?.limit_harian === null || dompet?.limit_harian === undefined) {
      setTanpaBatas(true);
      setLimitHarian('');
    } else {
      setTanpaBatas(false);
      setLimitHarian(String(dompet.limit_harian));
    }
  }, [buka, dompet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nilai = limitHarian === '' ? '' : Number(limitHarian);
    const galat = validasiLimitForm({ tanpaBatas, limit_harian: nilai });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(bangunPayloadLimit({ tanpaBatas, limit_harian: nilai }));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="xs" fullWidth aria-labelledby="judul-limit-dompet">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-limit-dompet">Atur Limit Jajan Harian</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Siswa: <strong>{siswa?.nama || '-'}</strong>
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={tanpaBatas} onChange={(e) => setTanpaBatas(e.target.checked)} />}
              label="Tanpa batas belanja harian"
            />
            {!tanpaBatas && (
              <Box>
                <CustomFormLabel htmlFor="limit_harian" sx={{ mt: 0 }}>
                  Batas Maksimal per Hari (Rupiah)
                </CustomFormLabel>
                <CustomOutlinedInput
                  id="limit_harian"
                  type="number"
                  value={limitHarian}
                  onChange={(e) => setLimitHarian(e.target.value)}
                  placeholder="25000"
                  inputProps={{ min: 0, step: 1000 }}
                  fullWidth
                  required
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Simpan Limit</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

AturLimitDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  siswa: PropTypes.object,
  dompet: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export const DetailDompetDialog = ({ buka, detail, isLoading = false, onTutup }) => {
  const status = metaStatusDompet(detail?.dompet);
  const sisa = sisaLimitHarian(detail?.dompet, detail?.pemakaian_hari_ini);

  return (
    <Dialog open={buka} onClose={onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-detail-dompet">
      <DialogTitle id="judul-detail-dompet">Detail Dompet Siswa</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Memuat detail dompet...
          </Typography>
        ) : !detail ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Data dompet belum tersedia.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="h6">{detail.siswa?.nama || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    NIS: {detail.siswa?.nis || '-'} · Kelas: {detail.siswa?.kelas || '-'} · QR: {detail.siswa?.kode_qr || '-'}
                  </Typography>
                </Box>
                <Chip size="small" label={status.label} color={status.color} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Saldo Dompet
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {formatRupiah(detail.dompet?.saldo ?? 0)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Pemakaian Hari Ini ({detail.zona_waktu || 'WIB'})
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {formatRupiah(detail.pemakaian_hari_ini ?? 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {detail.dompet?.limit_harian !== null && detail.dompet?.limit_harian !== undefined
                    ? `Limit: ${formatRupiah(detail.dompet.limit_harian)} · Sisa: ${formatRupiah(sisa)}`
                    : 'Tanpa batas harian'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onTutup}>
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DetailDompetDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  detail: PropTypes.object,
  isLoading: PropTypes.bool,
  onTutup: PropTypes.func.isRequired,
};
