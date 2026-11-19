import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  BATAS_KANTIN,
  BATAS_KANTIN_SEKOLAH,
  METODE_PENCAIRAN,
  STATUS_AWAL_PENCAIRAN,
  bangunPayloadPencairanSekolah,
  bangunPayloadUbahStatusPencairan,
  buatKunciIdempotensi,
  formatRupiah,
  validasiPencairanSekolah,
  validasiUbahStatusPencairan,
} from '../kantinSekolah';

export const BuatPencairanDialog = ({
  buka,
  unitList = [],
  kantinAwalId = null,
  sibuk = false,
  errorServer = '',
  onKirim,
  onTutup,
}) => {
  const [formState, setFormState] = useState({
    kantin_id: '',
    nominal: '',
    metode_pencairan: 'MANUAL',
    status: 'SELESAI',
    referensi_eksternal: '',
    catatan: '',
  });
  const [kunciIdem, setKunciIdem] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setFormState({
      kantin_id: kantinAwalId ? String(kantinAwalId) : '',
      nominal: '',
      metode_pencairan: 'MANUAL',
      status: 'SELESAI',
      referensi_eksternal: '',
      catatan: '',
    });
    setKunciIdem(buatKunciIdempotensi('cair'));
    setErrorLokal('');
  }, [buka, kantinAwalId]);

  const unitDipilih = unitList.find((u) => String(u.id) === String(formState.kantin_id)) || null;
  const saldoMengendap = unitDipilih ? Number(unitDipilih.saldo_mengendap ?? 0) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const nominalAngka = formState.nominal === '' ? '' : Number(formState.nominal);
    const galat = validasiPencairanSekolah({
      ...formState,
      kantin_id: formState.kantin_id ? Number(formState.kantin_id) : null,
      nominal: nominalAngka,
      saldoMengendap,
    });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim({
      kantinId: Number(formState.kantin_id),
      payload: bangunPayloadPencairanSekolah({
        form: { ...formState, nominal: nominalAngka },
        idempotencyKey: kunciIdem,
      }),
    });
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-buat-pencairan">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-buat-pencairan">Catat Pencairan Saldo Mengendap Kantin</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="kantin_pencairan" sx={{ mt: 0 }}>
                Unit Kantin Penerima
              </CustomFormLabel>
              <CustomSelect
                id="kantin_pencairan"
                displayEmpty
                value={formState.kantin_id}
                onChange={(e) => setFormState((prev) => ({ ...prev, kantin_id: e.target.value }))}
                fullWidth
              >
                <MenuItem value="">Pilih unit kantin...</MenuItem>
                {unitList.map((u) => (
                  <MenuItem key={u.id} value={String(u.id)}>
                    {u.nama_kantin} — Mengendap: {formatRupiah(u.saldo_mengendap)}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>

            {unitDipilih && (
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Saldo Mengendap Siap Cair ({unitDipilih.nama_kantin})
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {formatRupiah(saldoMengendap)}
                    </Typography>
                  </Box>
                  {saldoMengendap > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setFormState((prev) => ({ ...prev, nominal: String(saldoMengendap) }))}
                    >
                      Cairkan Semua
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="nominal_pencairan" sx={{ mt: 0 }}>
                Nominal Pencairan (Rupiah)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="nominal_pencairan"
                type="number"
                value={formState.nominal}
                onChange={(e) => setFormState((prev) => ({ ...prev, nominal: e.target.value }))}
                placeholder="Contoh: 50000"
                inputProps={{ min: 1, step: 500 }}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="metode_pencairan" sx={{ mt: 0 }}>
                Metode Pencairan
              </CustomFormLabel>
              <CustomSelect
                id="metode_pencairan"
                value={formState.metode_pencairan}
                onChange={(e) => setFormState((prev) => ({ ...prev, metode_pencairan: e.target.value }))}
                fullWidth
              >
                {METODE_PENCAIRAN.map((m) => (
                  <MenuItem key={m.kode} value={m.kode}>
                    {m.label}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="status_awal_pencairan" sx={{ mt: 0 }}>
                Status Awal Settlement
              </CustomFormLabel>
              <CustomSelect
                id="status_awal_pencairan"
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                fullWidth
              >
                {STATUS_AWAL_PENCAIRAN.map((s) => (
                  <MenuItem key={s.kode} value={s.kode}>
                    {s.label}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="referensi_eksternal" sx={{ mt: 0 }}>
                Referensi Bukti / No. Transfer (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="referensi_eksternal"
                value={formState.referensi_eksternal}
                onChange={(e) => setFormState((prev) => ({ ...prev, referensi_eksternal: e.target.value }))}
                placeholder="Contoh: TRF-BRI-20261119-01"
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.REFERENSI_MAX }}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="catatan_pencairan" sx={{ mt: 0 }}>
                Catatan (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="catatan_pencairan"
                value={formState.catatan}
                onChange={(e) => setFormState((prev) => ({ ...prev, catatan: e.target.value }))}
                placeholder="Catatan pencairan mingguan / harian"
                inputProps={{ maxLength: BATAS_KANTIN.CATATAN_MAX }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Catat Pencairan</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

BuatPencairanDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  unitList: PropTypes.array,
  kantinAwalId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export const UbahStatusPencairanDialog = ({
  buka,
  pencairan,
  sibuk = false,
  errorServer = '',
  onKirim,
  onTutup,
}) => {
  const [status, setStatus] = useState('SELESAI');
  const [referensi, setReferensi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka || !pencairan) return;
    setStatus('SELESAI');
    setReferensi(pencairan.referensi_eksternal || '');
    setCatatan(pencairan.catatan || '');
    setErrorLokal('');
  }, [buka, pencairan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const galat = validasiUbahStatusPencairan({
      status,
      referensi_eksternal: referensi,
      catatan,
    });
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onKirim(
      bangunPayloadUbahStatusPencairan({
        status,
        referensi_eksternal: referensi,
        catatan,
      }),
    );
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-ubah-pencairan">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-ubah-pencairan">Perbarui Status Settlement Pencairan</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {pencairan?.kode_pencairan || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pencairan?.kantin?.nama_kantin || '-'} · Nominal: {formatRupiah(pencairan?.nominal ?? 0)}
                </Typography>
              </Box>
              <Chip size="small" label="MENUNGGU" color="warning" />
            </Box>
          </Paper>

          {status === 'DIBATALKAN' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Membatalkan pencairan yang masih MENUNGGU akan mengembalikan nominal pencairan ke saldo mengendap unit kantin terkait.
            </Alert>
          )}

          <Stack spacing={2}>
            <Box>
              <CustomFormLabel htmlFor="status_baru_pencairan" sx={{ mt: 0 }}>
                Status Settlement Baru
              </CustomFormLabel>
              <CustomSelect
                id="status_baru_pencairan"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="SELESAI">SELESAI (Dana sudah diserahkan / ditransfer)</MenuItem>
                <MenuItem value="DIBATALKAN">DIBATALKAN (Kembalikan ke saldo mengendap)</MenuItem>
              </CustomSelect>
            </Box>

            <Box>
              <CustomFormLabel htmlFor="referensi_baru_pencairan" sx={{ mt: 0 }}>
                Referensi Bukti / Keterangan (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="referensi_baru_pencairan"
                value={referensi}
                onChange={(e) => setReferensi(e.target.value)}
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.REFERENSI_MAX }}
                fullWidth
              />
            </Box>

            <Box>
              <CustomFormLabel htmlFor="catatan_baru_pencairan" sx={{ mt: 0 }}>
                Catatan Tambahan (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="catatan_baru_pencairan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                inputProps={{ maxLength: BATAS_KANTIN.CATATAN_MAX }}
                multiline
                minRows={2}
                fullWidth
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>Simpan Status</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

UbahStatusPencairanDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  pencairan: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onKirim: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};
