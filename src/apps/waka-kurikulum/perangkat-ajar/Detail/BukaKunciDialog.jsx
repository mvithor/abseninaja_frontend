import Grid from '@mui/material/Grid';
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Typography,
} from '@mui/material';
import { IconClock, IconLockOpen } from '@tabler/icons-react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import {
  formatTanggalWaktu,
  formatTanggalYMD,
  isKonflik,
  labelPenugasan,
  pesanGalat,
  WAKA_API,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

const HARI_DEFAULT = 3;

const gantiDokumenDiDetail = (queryClient, dokumenBaru) =>
  queryClient.setQueriesData({ queryKey: ['waka-perangkat-guru-detail'] }, (lama) =>
    lama?.penugasan
      ? {
          ...lama,
          penugasan: lama.penugasan.map((p) => ({
            ...p,
            dokumen: (p.dokumen || []).map((d) => (d.id === dokumenBaru.id ? dokumenBaru : d)),
          })),
        }
      : lama,
  );

const tanggalDefault = () => {
  const d = new Date();
  d.setDate(d.getDate() + HARI_DEFAULT);
  return d;
};

// Membuka kunci unggah satu dokumen yang terkunci karena deadline lewat, sampai batas waktu tertentu.
// Batas dikirim sebagai tanggal + jam dinding yang ditafsirkan server dalam zona waktu sekolah
// (sama seperti deadline). `target` = { guru, penugasan, dokumen }.
const BukaKunciDialog = ({ target, timezone, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { guru, penugasan, dokumen } = target;
  const [tanggal, setTanggal] = useState(tanggalDefault);
  const [jam, setJam] = useState('23:59');
  const [alasan, setAlasan] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationKey: ['bukaKunciPerangkatAjar'],
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`${WAKA_API}/perangkat-ajar/dokumen/${dokumen.id}/buka-kunci`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      // Respons membawa Dokumen terbaru: ganti langsung di cache detail tanpa memuat ulang.
      if (data?.data?.id) gantiDokumenDiDetail(queryClient, data.data);
      else queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-detail'] });
      queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-list'] });
      onSuccess(data?.msg || `Akses unggah ${dokumen.jenis?.label} dibuka`);
    },
    onError: (err) => {
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['waka-perangkat-guru-detail'] });
      setError(pesanGalat(err, 'Terjadi kesalahan saat membuka kunci'));
    },
  });

  const handleSimpan = () => {
    const tanggalBatas = formatTanggalYMD(tanggal);
    if (!tanggalBatas || !jam) {
      setError('Tanggal dan jam batas wajib diisi');
      return;
    }
    setError('');
    mutation.mutate({ tanggal_batas: tanggalBatas, jam_batas: jam, alasan: alasan.trim() || null });
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Buka Kunci Unggah
        <Typography variant="body2" color="text.secondary">
          {dokumen.jenis?.label} · {guru?.nama} · {labelPenugasan(penugasan)}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 1 }}>
          Deadline {formatTanggalWaktu(dokumen.deadline, timezone)} sudah lewat. Guru akan bisa mengunggah dokumen ini
          sampai batas waktu di bawah. Unggahan tetap ditandai <strong>Terlambat</strong>.
        </Alert>

        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <CustomFormLabel htmlFor="tanggal_batas">Dibuka sampai tanggal</CustomFormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={tanggal}
                onChange={setTanggal}
                format="dd/MM/yyyy"
                disablePast
                slotProps={{ textField: { fullWidth: true, InputProps: { sx: { height: '46px' } } } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <CustomFormLabel htmlFor="jam_batas">Jam (waktu sekolah)</CustomFormLabel>
            <CustomOutlinedInput
              id="jam_batas"
              type="time"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="alasan">Alasan (opsional)</CustomFormLabel>
            <CustomOutlinedInput
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Mis. guru sakit saat periode pengumpulan"
              multiline
              minRows={2}
              fullWidth
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Batal</Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<IconLockOpen size={16} />}
          onClick={handleSimpan}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Menyimpan...' : 'Buka Kunci'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BukaKunciDialog.propTypes = {
  target: PropTypes.shape({
    guru: PropTypes.object,
    penugasan: PropTypes.object.isRequired,
    dokumen: PropTypes.object.isRequired,
  }).isRequired,
  timezone: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default BukaKunciDialog;
