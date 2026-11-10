import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconUser, IconMail, IconSchool } from '@tabler/icons-react';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import KolomIsian from 'src/apps/guru-lad/komponen/KolomIsian';
import { BATAS, BENTUK_PENDIDIKAN, ZONA_WAKTU, bangunPayloadBuat, validasiBuat } from '../guruMandiri';

// Form Tambah Guru Mandiri. Edit memakai dialog sendiri (hanya nama dan nama sekolah), jadi form ini hanya untuk buat.
const GuruMandiriForm = ({ onSubmit, isLoading, setError, onCancel }) => {
  const [form, setForm] = useState({ nama: '', email: '', namaSekolah: '', bentuk: '', zona: 'Asia/Jakarta' });

  const ubah = useCallback((nama) => (e) => setForm((prev) => ({ ...prev, [nama]: e.target.value })), []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const pesan = validasiBuat(form);
    if (pesan) {
      setError(pesan);
      return;
    }
    setError('');
    onSubmit(bangunPayloadBuat(form));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: -2 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <KolomIsian
            id="nama" label="Nama Guru" wajib ikon={<IconUser />} value={form.nama} onChange={ubah('nama')}
            inputProps={{ maxLength: BATAS.NAMA_MAX }} sx={{ mt: 1.85 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KolomIsian
            id="email" label="Email" wajib tipe="email" ikon={<IconMail />} value={form.email} onChange={ubah('email')}
            inputProps={{ maxLength: BATAS.EMAIL_MAX }} autoComplete="off"
            bantuan="Satu email satu akun. Email yang sudah dipakai akun lain tidak bisa dipakai lagi."
            sx={{ mt: 1.85 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KolomIsian
            id="nama-sekolah" label="Nama Sekolah" ikon={<IconSchool />} value={form.namaSekolah} onChange={ubah('namaSekolah')}
            inputProps={{ maxLength: BATAS.SEKOLAH_MAX }}
            bantuan="Opsional. Bila kosong, dipakai nama LAD Mandiri dengan nama guru."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KolomIsian id="bentuk" label="Bentuk Pendidikan" pilih value={form.bentuk} onChange={ubah('bentuk')}>
            <MenuItem value="">Tidak diisi</MenuItem>
            {BENTUK_PENDIDIKAN.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </KolomIsian>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KolomIsian id="zona" label="Zona Waktu" pilih wajib value={form.zona} onChange={ubah('zona')}>
            {ZONA_WAKTU.map((z) => <MenuItem key={z.kode} value={z.kode}>{z.label}</MenuItem>)}
          </KolomIsian>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
        <SubmitButton isLoading={isLoading}>Buat Akun</SubmitButton>
        <CancelButton onClick={onCancel} />
      </Box>
    </Box>
  );
};

GuruMandiriForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  setError: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default GuruMandiriForm;
