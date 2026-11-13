import Grid from '@mui/material/Grid';
import { useState } from 'react';
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
  Divider,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { IconCircleCheck, IconMessageReport, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import PdfViewer from 'src/components/perangkat-ajar/PdfViewer';
import {
  formatTanggalWaktu,
  isKonflik,
  labelPenugasan,
  pesanGalat,
  STATUS_PERANGKAT,
  WAKA_API,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

const MIN_CATATAN = 10;
const MAX_CATATAN = 1000;

const Info = ({ label, children }) => (
  <Box sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>{label}</Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>{children}</Typography>
  </Box>
);

Info.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

// `target` = { guru, penugasan, dokumen }. Dirender ulang (key) per dokumen oleh induknya,
// jadi state form selalu mulai bersih.
const ValidasiDialog = ({ target, timezone, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { guru, penugasan, dokumen } = target;
  const [keputusan, setKeputusan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [konfirmasiSetuju, setKonfirmasiSetuju] = useState(false);
  const [error, setError] = useState('');

  const isRevisi = keputusan === STATUS_PERANGKAT.PERLU_REVISI;
  const isSetujui = keputusan === STATUS_PERANGKAT.DISETUJUI;
  const panjangCatatan = catatan.trim().length;
  const catatanKurang = isRevisi && panjangCatatan < MIN_CATATAN;

  const mutation = useMutation({
    mutationKey: ['validasiPerangkatAjar'],
    mutationFn: async () => {
      const res = await axiosInstance.post(`${WAKA_API}/perangkat-ajar/dokumen/${dokumen.id}/validasi`, {
        keputusan,
        catatan: catatan.trim() || null,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-detail'] });
      queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-list'] });
      queryClient.invalidateQueries({ queryKey: ['perangkat-ajar-riwayat'] });
      onSuccess(
        data?.msg ||
          (isSetujui
            ? `${dokumen.jenis?.label} disetujui`
            : `Permintaan revisi ${dokumen.jenis?.label} dikirim ke guru`),
      );
    },
    onError: (err) => {
      setKonfirmasiSetuju(false);
      // 409: dokumen sudah divalidasi Waka lain atau semester diarsipkan; segarkan data di belakang dialog.
      if (isKonflik(err)) {
        queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-detail'] });
        queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-list'] });
      }
      setError(pesanGalat(err, 'Terjadi kesalahan saat menyimpan validasi'));
    },
  });

  const handleKeputusan = (e) => {
    setKeputusan(e.target.value);
    setKonfirmasiSetuju(false);
    setError('');
  };

  const handleSimpan = () => {
    if (!keputusan) {
      setError('Pilih keputusan validasi terlebih dahulu');
      return;
    }
    if (catatanKurang) {
      setError(`Catatan revisi wajib diisi minimal ${MIN_CATATAN} karakter`);
      return;
    }
    // Persetujuan mengunci dokumen, jadi minta konfirmasi sekali lagi.
    if (isSetujui && !konfirmasiSetuju) {
      setKonfirmasiSetuju(true);
      return;
    }
    setError('');
    mutation.mutate();
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  const fileUrl = `${WAKA_API}/perangkat-ajar/dokumen/${dokumen.id}/file`;

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap>Validasi {dokumen.jenis?.label}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {guru?.nama} · {labelPenugasan(penugasan)}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={mutation.isPending}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Grid container sx={{ minHeight: { md: '70vh' } }}>
          <Grid size={{ xs: 12, md: 7 }} sx={{ height: { xs: '50vh', md: 'auto' } }}>
            <PdfViewer fileUrl={fileUrl} judul={dokumen.jenis?.label} />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} sx={{ p: 3, borderLeft: { md: 1 }, borderColor: { md: 'divider' } }}>
            <Info label="Versi">v{dokumen.versi_terakhir || 1}</Info>
            <Info label="Diunggah">
              {formatTanggalWaktu(dokumen.diunggah_pada, timezone)}{' '}
              {dokumen.terlambat && <Chip label="Terlambat" color="error" variant="outlined" size="small" sx={{ ml: 0.5 }} />}
            </Info>
            <Info label="Deadline">{dokumen.deadline ? formatTanggalWaktu(dokumen.deadline, timezone) : 'Belum diatur'}</Info>
            <Info label="File">{dokumen.file?.nama || '-'}</Info>

            {dokumen.versi_terakhir > 1 && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Ini unggahan ulang setelah revisi. Lihat catatan sebelumnya di Riwayat Versi.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <CustomFormLabel sx={{ mt: 0 }}>Keputusan</CustomFormLabel>
            <RadioGroup value={keputusan} onChange={handleKeputusan}>
              <FormControlLabel
                value={STATUS_PERANGKAT.DISETUJUI}
                control={<Radio color="success" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconCircleCheck size={18} /> Setujui
                  </Box>
                }
              />
              <FormControlLabel
                value={STATUS_PERANGKAT.PERLU_REVISI}
                control={<Radio color="error" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconMessageReport size={18} /> Minta Revisi
                  </Box>
                }
              />
            </RadioGroup>

            <CustomFormLabel htmlFor="catatan">
              {isRevisi ? 'Feedback untuk guru (wajib)' : 'Catatan (opsional)'}
            </CustomFormLabel>
            <CustomOutlinedInput
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                isRevisi
                  ? 'Jelaskan bagian yang perlu diperbaiki, mis. TP belum diturunkan dari CP...'
                  : 'Catatan tambahan untuk guru'
              }
              multiline
              minRows={5}
              fullWidth
              error={Boolean(error) && catatanKurang}
              inputProps={{ maxLength: MAX_CATATAN }}
            />
            <Typography variant="caption" color={catatanKurang ? 'error' : 'text.secondary'}>
              {panjangCatatan}/{MAX_CATATAN}
              {isRevisi && ` · minimal ${MIN_CATATAN} karakter`}
            </Typography>

            {isRevisi && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Guru akan bisa mengunggah ulang dokumen ini setelah feedback dikirim.
              </Alert>
            )}
            {konfirmasiSetuju && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Dokumen akan terkunci dan guru tidak bisa mengunggah ulang. Klik <strong>Ya, Setujui</strong> untuk melanjutkan.
              </Alert>
            )}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Batal</Button>
        <Button
          variant="contained"
          color={isRevisi ? 'error' : 'success'}
          onClick={handleSimpan}
          disabled={!keputusan || mutation.isPending}
        >
          {mutation.isPending
            ? 'Menyimpan...'
            : isRevisi
              ? 'Kirim Permintaan Revisi'
              : konfirmasiSetuju
                ? 'Ya, Setujui'
                : 'Setujui Dokumen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ValidasiDialog.propTypes = {
  target: PropTypes.shape({
    guru: PropTypes.object,
    penugasan: PropTypes.object.isRequired,
    dokumen: PropTypes.object.isRequired,
  }).isRequired,
  timezone: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ValidasiDialog;
