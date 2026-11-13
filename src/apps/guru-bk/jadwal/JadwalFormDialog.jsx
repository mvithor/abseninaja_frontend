import Grid from '@mui/material/Grid';
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import SiswaBinaanAutocomplete from 'src/components/jurnal-bk/SiswaBinaanAutocomplete';
import { JENIS_LAYANAN } from 'src/components/jurnal-bk/jurnalConfig';
import { LOKASI_SARAN } from 'src/components/jadwal-bk/jadwalConfig';
import { BK_API } from 'src/components/pemetaan-siswa/pemetaanConfig';
import { formatTanggalYMD, isKonflik, parseTanggalYMD, pesanGalat } from 'src/components/perangkat-ajar/perangkatAjarConfig';

const tambahMenit = (jam, menit) => {
  const [h, m] = jam.split(':').map(Number);
  const total = Math.min(h * 60 + m + menit, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

// Buat jadwal baru (jadwal = null) atau ubah/jadwal ulang sesi yang masih "Terjadwal".
// `awal` mengisi nilai awal untuk sesi baru: { tanggal: Date, jam_mulai, jam_selesai, siswa }.
const JadwalFormDialog = ({ jadwal, awal, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const isBaru = !jadwal;
  const [form, setForm] = useState(() => ({
    tanggal: jadwal ? parseTanggalYMD(jadwal.tanggal) : awal?.tanggal || new Date(),
    jam_mulai: jadwal?.jam_mulai || awal?.jam_mulai || '09:00',
    jam_selesai: jadwal?.jam_selesai || awal?.jam_selesai || '09:45',
    siswa: jadwal?.siswa || awal?.siswa || [],
    jenis_layanan: jadwal?.jenis_layanan?.kode || 'konseling_individu',
    topik: jadwal?.topik || '',
    lokasi: jadwal?.lokasi || 'Ruang BK 1',
    catatan: jadwal?.catatan || '',
  }));
  const [error, setError] = useState('');
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (payload) =>
      (isBaru ? await axiosInstance.post(`${BK_API}/jadwal`, payload) : await axiosInstance.patch(`${BK_API}/jadwal/${jadwal.id}`, payload)).data,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bk-jadwal'] });
      queryClient.invalidateQueries({ queryKey: ['bk-jadwal-detail'] });
      onSuccess(res?.msg || 'Jadwal disimpan');
    },
    onError: (err) => {
      // 409 bentrok / bukan lagi "Terjadwal": kalender di belakang dialog perlu disegarkan.
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['bk-jadwal'] });
      setError(pesanGalat(err, 'Jadwal gagal disimpan'));
    },
  });

  const handleSimpan = () => {
    if (!form.siswa.length) return setError('Pilih minimal satu siswa');
    if (form.topik.trim().length < 3) return setError('Topik minimal 3 karakter');
    if (!form.jam_mulai || !form.jam_selesai || form.jam_selesai <= form.jam_mulai) return setError('Jam selesai harus setelah jam mulai');
    setError('');
    return mutation.mutate({
      tanggal: formatTanggalYMD(form.tanggal),
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai,
      siswa_ids: form.siswa.map((s) => s.id),
      jenis_layanan: form.jenis_layanan,
      topik: form.topik.trim(),
      lokasi: form.lokasi?.trim() || null,
      catatan: form.catatan.trim() || null,
    });
  };

  return (
    <Dialog open onClose={() => !mutation.isPending && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{isBaru ? 'Buat Jadwal Konseling' : 'Ubah Jadwal Konseling'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} rowSpacing={0}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Tanggal</CustomFormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={form.tanggal}
                onChange={(d) => set('tanggal', d)}
                format="dd/MM/yyyy"
                disablePast
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Mulai</CustomFormLabel>
            <CustomOutlinedInput
              type="time"
              size="small"
              value={form.jam_mulai}
              onChange={(e) => {
                const mulai = e.target.value;
                // Pertahankan durasi 45 menit bila jam selesai belum disesuaikan.
                setForm((p) => ({ ...p, jam_mulai: mulai, jam_selesai: p.jam_selesai <= mulai ? tambahMenit(mulai, 45) : p.jam_selesai }));
              }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CustomFormLabel sx={{ mt: 0 }}>Selesai</CustomFormLabel>
            <CustomOutlinedInput type="time" size="small" value={form.jam_selesai} onChange={(e) => set('jam_selesai', e.target.value)} fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Siswa</CustomFormLabel>
            <SiswaBinaanAutocomplete value={form.siswa} onChange={(v) => set('siswa', v)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>Jenis layanan</CustomFormLabel>
            <CustomSelect value={form.jenis_layanan} onChange={(e) => set('jenis_layanan', e.target.value)} fullWidth size="small">
              {JENIS_LAYANAN.map((j) => <MenuItem key={j.kode} value={j.kode}>{j.label}</MenuItem>)}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel>Lokasi</CustomFormLabel>
            <Autocomplete
              freeSolo
              options={LOKASI_SARAN}
              value={form.lokasi}
              onInputChange={(_e, v) => set('lokasi', v)}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Topik</CustomFormLabel>
            <CustomOutlinedInput
              value={form.topik}
              onChange={(e) => set('topik', e.target.value)}
              placeholder="Mis. evaluasi kesepakatan kehadiran"
              size="small"
              fullWidth
              inputProps={{ maxLength: 120 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel>Catatan persiapan (opsional)</CustomFormLabel>
            <CustomOutlinedInput value={form.catatan} onChange={(e) => set('catatan', e.target.value)} multiline minRows={2} fullWidth />
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>Batal</Button>
        <Button variant="contained" onClick={handleSimpan} disabled={mutation.isPending}>
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

JadwalFormDialog.propTypes = {
  jadwal: PropTypes.object,
  awal: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default JadwalFormDialog;
