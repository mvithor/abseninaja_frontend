import { useEffect, useState } from "react";
import { Box, Typography, MenuItem } from '@mui/material';
import Grid from "@mui/material/Grid";
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import Divider from '@mui/material/Divider';

const PendaftaranEditForm = ({
    selectedPendaftaran,
    statusOptions, 
    isLoadingStatus,
    handleSubmit,
    handleCancel
}) => {
    const [formState, setFormState] = useState({});

    useEffect(() => {
        if(selectedPendaftaran) {
            setFormState({ ...selectedPendaftaran});
        }
    }, [selectedPendaftaran]);
    
    const handleLocalChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
          ...prevState,
          [name]: value
        }));
      };

      const handleLocalSubmit = (event) => {
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
      
        if (typeof handleSubmit === 'function') {
          handleSubmit(formState);
        } else {
          console.error('handleSubmit is not defined or not a function');
        }
      };

      return (
        <form onSubmit={handleLocalSubmit}>
            <Box sx={{ borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
                    Detail Pendaftar
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="nama_admin" sx={{ mt: 0, mb: 1 }}>
                            Nama Pendaftar
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="nama_admin"
                            name="nama_admin"
                            value={formState.nama_admin || ''}
                            onChange={handleLocalChange}
                            fullWidth
                            readOnly
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="kepala_sekolah" sx={{ mt: 0, mb: 1 }}>
                            Kepala Sekolah
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="kepala_sekolah"
                            name="kepala_sekolah"
                            value={formState.kepala_sekolah || ''}
                            onChange={handleLocalChange}
                            fullWidth
                            readOnly
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: 1 }}>
                            Email
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="email"
                            name="email"
                            value={formState.email || ''}
                            onChange={handleLocalChange}
                            fullWidth
                            readOnly
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="kontak_admin" sx={{ mt: 0, mb: 1 }}>
                            No Telepon
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="kontak_admin"
                            name="kontak_admin"
                            value={formState.kontak_admin || ''}
                            onChange={handleLocalChange}
                            fullWidth
                            readOnly
                        />
                    </Grid> 
                </Grid>
                <Divider variant="fullWidth" sx={{ my: 4, width: '100%' }} />
                {/* Personal Info Section */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Informasi Sekolah
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="nama" sx={{ mt: 0, mb: 1 }}>
                            Nama Sekolah
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="nama"
                            name="nama"
                            value={formState.nama || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="npsn" sx={{ mt: 0, mb: 1 }}>
                            Nomor Pokok Sekolah Nasional
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="npsn"
                            name="npsn"
                            value={formState.npsn || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="alamat" sx={{ mt: 0, mb: 1 }}>
                            Alamat
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="alamat"
                            name="alamat"
                            value={formState.alamat || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jumlah_siswa" sx={{ mt: 0, mb: 1 }}>
                            Jumlah Siswa
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="jumlah_siswa"
                            name="jumlah_siswa"
                            value={formState.jumlah_siswa || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jumlah_guru" sx={{ mt: 0, mb: 1 }}>
                            Jumlah Guru
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="jumlah_guru"
                            name="jumlah_guru"
                            value={formState.jumlah_guru || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jumlah_staf" sx={{ mt: 0, mb: 1 }}>
                            Jumlah Staf
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="jumlah_staf"
                            name="jumlah_staf"
                            value={formState.jumlah_staf || ''}
                            onChange={handleLocalChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <Divider variant="fullWidth" sx={{ my: 4, width: '100%' }} />

                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Status Pendaftaran
                </Typography>
                <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="created_at" sx={{ mt: 0, mb: 1 }}>
                            Diajukan
                        </CustomFormLabel>
                        <CustomOutlinedInput
                            id="created_at"
                            name="created_at"
                            value={formState.created_at || ''}
                            onChange={handleLocalChange}
                            fullWidth
                            readOnly
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="status_id" sx={{ mt: 0, mb: 1 }}>
                        Status Pendaftaran
                    </CustomFormLabel>
                    {
                        isLoadingStatus ? (
                            <p>Loading status...</p>
                        ) : (
                            <CustomSelect
                                id="status_id"
                                name="status_id"
                                value={formState.status_id || ''}
                                onChange={handleLocalChange}
                                fullWidth
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.status_pendaftaran}
                                    </MenuItem>
                                ))}
                            </CustomSelect>
                        )
                    }
                    </Grid>
                    </Grid>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                    <SubmitButton type="submit">Simpan</SubmitButton>
                    <CancelButton onClick={handleCancel}>Batal</CancelButton>
                </Box>
            </Box>
        </form>
      );
};

export default PendaftaranEditForm;
