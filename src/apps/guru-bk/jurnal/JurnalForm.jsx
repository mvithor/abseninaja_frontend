import Grid from '@mui/material/Grid';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, FormControlLabel, InputAdornment, MenuItem, Switch, Typography } from '@mui/material';
import { IconClock } from '@tabler/icons-react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import SiswaBinaanAutocomplete from 'src/components/jurnal-bk/SiswaBinaanAutocomplete';
import {
  hariIniDi,
  JENIS_LAYANAN,
  KATEGORI_MASALAH,
  LAYANAN_KELOMPOK,
  STATUS_PENANGANAN,
  STATUS_PENANGANAN_OPTIONS,
} from 'src/components/jurnal-bk/jurnalConfig';
import { formatTanggalYMD, parseTanggalYMD } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';

const MIN_JUDUL = 5;

const dariEntri = (entri, siswaAwal, awal = {}) => ({
  tanggal: entri ? parseTanggalYMD(entri.tanggal) : new Date(),
  jam_mulai: entri?.jam_mulai || '',
  jam_selesai: entri?.jam_selesai || '',
  siswa: entri?.siswa || siswaAwal || [],
  jenis_layanan: entri?.jenis_layanan?.kode || 'konseling_individu',
  kategori: entri?.kategori?.kode || '',
  judul: entri?.judul || '',
  uraian: entri?.uraian || '',
  tindakan: entri?.tindakan || '',
  hasil: entri?.hasil || '',
  status: entri?.status?.kode || STATUS_PENANGANAN.SELESAI,
  rencana: entri?.tindak_lanjut?.rencana || '',
  tanggal_tl: entri?.tindak_lanjut?.tanggal ? parseTanggalYMD(entri.tindak_lanjut.tanggal) : null,
  rahasia: Boolean(entri?.rahasia),
  // Nilai awal dari sumber lain (jadwal konseling / pengaduan) untuk catatan baru.
  ...Object.fromEntries(Object.entries(awal).filter(([, v]) => v !== undefined && v !== null)),
});

const sxInput = { height: '46px' };

// Form catatan penanganan, dipakai halaman Tambah dan Ubah. Validasi dasar di FE; validasi akhir
// (siswa di lingkup BK, hak ubah) di server.
const JurnalForm = ({ entri, siswaAwal, nilaiAwal, onSubmit, onCancel, isSubmitting }) => {
  const [form, setForm] = useState(() => dariEntri(entri, siswaAwal, nilaiAwal));
  const [error, setError] = useState('');
  const [dicoba, setDicoba] = useState(false);
  // "Hari ini" menurut zona waktu sekolah (server menolak tanggal masa depan dengan acuan yang sama).
  const hariIniSekolah = parseTanggalYMD(hariIniDi(useSchoolTimezone()));

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const butuhTindakLanjut = form.status !== STATUS_PENANGANAN.SELESAI;
  const salah = {
    siswa: form.siswa.length === 0,
    kategori: !form.kategori,
    judul: form.judul.trim().length < MIN_JUDUL,
    jam_mulai: !form.jam_mulai,
    rencana: form.status === STATUS_PENANGANAN.TINDAK_LANJUT && !form.rencana.trim(),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDicoba(true);
    if (Object.values(salah).some(Boolean) || !form.tanggal) {
      setError('Lengkapi isian yang ditandai merah.');
      return;
    }
    if (form.jam_selesai && form.jam_selesai <= form.jam_mulai) {
      setError('Jam selesai harus setelah jam mulai.');
      return;
    }
    setError('');
    onSubmit({
      tanggal: formatTanggalYMD(form.tanggal),
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai || null,
      siswa_ids: form.siswa.map((s) => s.id),
      jenis_layanan: form.jenis_layanan,
      kategori: form.kategori,
      judul: form.judul.trim(),
      uraian: form.uraian.trim() || null,
      tindakan: form.tindakan.trim() || null,
      hasil: form.hasil.trim() || null,
      status: form.status,
      tindak_lanjut: butuhTindakLanjut ? { rencana: form.rencana.trim() || null, tanggal: formatTanggalYMD(form.tanggal_tl) } : null,
      rahasia: form.rahasia,
    });
  };

  const tandai = (kunci) => dicoba && salah[kunci];

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomFormLabel htmlFor="tanggal" sx={{ mt: 1.85 }}>Tanggal</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={form.tanggal}
              onChange={(d) => set('tanggal', d)}
              format="dd/MM/yyyy"
              maxDate={hariIniSekolah}
              slotProps={{ textField: { fullWidth: true, InputProps: { sx: sxInput } } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="jam_mulai" sx={{ mt: 1.85 }}>Jam mulai</CustomFormLabel>
          <CustomOutlinedInput
            id="jam_mulai"
            name="jam_mulai"
            type="time"
            value={form.jam_mulai}
            onChange={handleChange}
            error={tandai('jam_mulai')}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <CustomFormLabel htmlFor="jam_selesai" sx={{ mt: 1.85 }}>Jam selesai (opsional)</CustomFormLabel>
          <CustomOutlinedInput
            id="jam_selesai"
            name="jam_selesai"
            type="time"
            value={form.jam_selesai}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Siswa</CustomFormLabel>
          <SiswaBinaanAutocomplete value={form.siswa} onChange={(v) => set('siswa', v)} error={tandai('siswa')} />
          {form.siswa.length > 1 && !LAYANAN_KELOMPOK.includes(form.jenis_layanan) && (
            <Typography variant="caption" color="warning.dark">
              Lebih dari satu siswa: pertimbangkan jenis layanan Konseling Kelompok atau Mediasi.
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jenis_layanan" sx={{ mt: 1.85 }}>Jenis layanan</CustomFormLabel>
          <CustomSelect id="jenis_layanan" name="jenis_layanan" value={form.jenis_layanan} onChange={handleChange} fullWidth>
            {JENIS_LAYANAN.map((j) => <MenuItem key={j.kode} value={j.kode}>{j.label}</MenuItem>)}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori" sx={{ mt: 1.85 }}>Kategori masalah</CustomFormLabel>
          <CustomSelect id="kategori" name="kategori" value={form.kategori} onChange={handleChange} fullWidth displayEmpty error={tandai('kategori')}>
            <MenuItem value="" disabled>Pilih kategori</MenuItem>
            {KATEGORI_MASALAH.map((k) => <MenuItem key={k.kode} value={k.kode}>{k.label}</MenuItem>)}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="judul" sx={{ mt: 1.85 }}>Ringkasan masalah</CustomFormLabel>
          <CustomOutlinedInput
            id="judul"
            name="judul"
            value={form.judul}
            onChange={handleChange}
            placeholder="Mis. Sering terlambat masuk kelas"
            error={tandai('judul')}
            inputProps={{ maxLength: 150 }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="uraian" sx={{ mt: 1.85 }}>Uraian / kronologi</CustomFormLabel>
          <CustomOutlinedInput id="uraian" name="uraian" value={form.uraian} onChange={handleChange} multiline minRows={3} fullWidth inputProps={{ maxLength: 5000 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tindakan" sx={{ mt: 1.85 }}>Tindakan / layanan yang diberikan</CustomFormLabel>
          <CustomOutlinedInput id="tindakan" name="tindakan" value={form.tindakan} onChange={handleChange} multiline minRows={3} fullWidth inputProps={{ maxLength: 5000 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="hasil" sx={{ mt: 1.85 }}>Hasil</CustomFormLabel>
          <CustomOutlinedInput id="hasil" name="hasil" value={form.hasil} onChange={handleChange} multiline minRows={3} fullWidth inputProps={{ maxLength: 5000 }} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>Status</CustomFormLabel>
          <CustomSelect id="status" name="status" value={form.status} onChange={handleChange} fullWidth>
            {STATUS_PENANGANAN_OPTIONS.map((s) => <MenuItem key={s.kode} value={s.kode}>{s.label}</MenuItem>)}
          </CustomSelect>
        </Grid>
        {butuhTindakLanjut && (
          <>
            <Grid size={{ xs: 12, md: 5 }}>
              <CustomFormLabel htmlFor="rencana" sx={{ mt: 1.85 }}>
                {form.status === STATUS_PENANGANAN.DIRUJUK ? 'Dirujuk ke' : 'Rencana tindak lanjut'}
              </CustomFormLabel>
              <CustomOutlinedInput
                id="rencana"
                name="rencana"
                value={form.rencana}
                onChange={handleChange}
                error={tandai('rencana')}
                placeholder={form.status === STATUS_PENANGANAN.DIRUJUK ? 'Mis. psikolog puskesmas' : 'Mis. sesi konseling lanjutan'}
                fullWidth
                inputProps={{ maxLength: 5000 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CustomFormLabel htmlFor="tanggal_tl" sx={{ mt: 1.85 }}>Tanggal (opsional)</CustomFormLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={form.tanggal_tl}
                  onChange={(d) => set('tanggal_tl', d)}
                  format="dd/MM/yyyy"
                  slotProps={{ textField: { fullWidth: true, InputProps: { sx: sxInput } } }}
                />
              </LocalizationProvider>
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Switch checked={form.rahasia} onChange={(e) => set('rahasia', e.target.checked)} />}
            label="Catatan rahasia"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Isi catatan rahasia hanya dapat dibaca Anda. BK lain hanya melihat ringkasan, kategori, dan status.
          </Typography>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton isLoading={isSubmitting}>Simpan</SubmitButton>
        <CancelButton onClick={onCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

JurnalForm.propTypes = {
  entri: PropTypes.object,
  siswaAwal: PropTypes.array,
  nilaiAwal: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default JurnalForm;
