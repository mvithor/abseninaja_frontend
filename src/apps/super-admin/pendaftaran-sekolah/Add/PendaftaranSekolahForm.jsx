import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllPendaftaranSekolah } from 'src/store/apps/pendaftaran-sekolah';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { useMutation } from '@tanstack/react-query';
import { IconSchool, IconUser, IconMail, 
         IconPhone, IconId, IconBrandTelegram,
         IconUsers
       } from '@tabler/icons-react';
import Grid from "@mui/material/Grid";
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import axiosInstance from 'src/utils/axiosInstance';

const PendaftaranSekolahForm = ({ setSuccess, setError }) => {
  const dispatch = useDispatch(); 
  const [formState, setFormState] = useState({
    nama_admin: '',
    kepala_sekolah: '',
    email: '',
    kontak_admin: '',
    nama: '',
    npsn: '',
    alamat: '',
    jumlah_siswa: '',
    jumlah_guru: '',
    jumlah_staf: '',
  });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ['pendaftaranSekolah'],
    mutationFn: async (newPendaftaran) => {
      const response = await axiosInstance.post('/api/v1/super-admin/pendaftaran', newPendaftaran);
      return response.data;
    },
    onSuccess: (data) => {
        setSuccess(data.msg);
        setError("");
        dispatch(fetchAllPendaftaranSekolah());
      
        setTimeout(() => navigate('/dashboard/super-admin/pendaftaran-sekolah'), 3000);
      },
      
    onError: (error) => {
        const errorDetails = error.response?.data?.errors || []; 
        const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan da';
        if (errorDetails.length > 0) {
            setError(errorDetails.join(', '));
        } else {
            setError(errorMsg);
        }
        setSuccess('');
        setTimeout(() => setError(''), 3000); 
    },
    onSettled: () => {
      setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
    }
  });
  
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      };

  // Fungsi untuk menangani pengiriman form
  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formState); 
  };

  const handleCancel = () => {
    navigate(-1)
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ borderRadius: 2}}>
            <Typography variant="h6">
                Detail Pendaftar
            </Typography>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nama_admin" sx={{ mt: 1.85 }}>Nama Pendaftar</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_admin"
                        name="nama_admin"
                        value={formState.nama_admin}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="kepala_sekolah" sx={{ mt: 1.85 }}>Kepala Sekolah</CustomFormLabel>
                    <CustomOutlinedInput
                        id="kepala_sekolah"
                        name="kepala_sekolah"
                        value={formState.kepala_sekolah}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="email" sx={{ mt: 1.85 }}>Email</CustomFormLabel>
                    <CustomOutlinedInput
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="kontak_admin" sx={{ mt: 1.85 }}>No Telepon</CustomFormLabel>
                    <CustomOutlinedInput
                        id="kontak_admin"
                        name="kontak_admin"
                        value={formState.kontak_admin}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>

            <Divider variant="fullWidth" sx={{ my: 4, width: '100%' }} />
            
            <Typography variant="h6">
                Informasi Sekolah
            </Typography>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>Nama Sekolah</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama"
                        name="nama"
                        value={formState.nama}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconSchool /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="npsn" sx={{ mt: 1.85 }}>Nomor Pokok Sekolah Nasional</CustomFormLabel>
                    <CustomOutlinedInput
                        id="npsn"
                        name="npsn"
                        value={formState.npsn}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconId /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.85 }}>Alamat</CustomFormLabel>
                    <CustomOutlinedInput
                        id="alamat"
                        name="alamat"
                        value={formState.alamat}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconBrandTelegram /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="jumlah_siswa" sx={{ mt: 1.85 }}>
                        Jumlah Siswa
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="jumlah_siswa"
                        name="jumlah_siswa"
                        value={formState.jumlah_siswa}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUsers /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="jumlah_guru" sx={{ mt: 1.85 }}>
                        Jumlah Guru
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="jumlah_guru"
                        name="jumlah_guru"
                        value={formState.jumlah_guru}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUsers /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}> 
                    <CustomFormLabel htmlFor="jumlah_staf" sx={{ mt: 1.85 }}>
                        Jumlah Staff
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="jumlah_staf"
                        name="jumlah_staf"
                        value={formState.jumlah_staf}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUsers /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
            <SubmitButton type="submit">Simpan</SubmitButton>
            <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
    </Box>
  );
};

export default PendaftaranSekolahForm;
