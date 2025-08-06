import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  InputAdornment,
  IconButton
} from "@mui/material";
import {
    IconUser,
    IconMail,
    IconLock,
    IconBriefcase,
    IconPhone,
    IconHome
    
  } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Autocomplete from "@mui/material/Autocomplete";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import axiosInstance from "src/utils/axiosInstance";

//Enum hubungan keluarga
const enumHubunganKeluarga = ["Ayah", "Ibu", "Kakak", "Paman", "Bibi", "Wali Lainnya"]

const WaliSiswaForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        name: '',
        siswa_id: '',
        email: '',
        password: '',
        hubungan: '',
        pekerjaan: '',
        nomor_telepon: '',
        alamat: '',
        is_wali_utama: ''
    });

    const { data: siswaOptions = [], isError: siswaError } = useQuery({
        queryKey: ["siswaOptions"],
        queryFn: async () => {
          const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/siswa');
          return response.data.data;
        }
    });

    const mutation = useMutation({
        mutationKey: ["tambahWaliSiswa"],
        mutationFn: async(newWaliSiswa) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/wali-siswa', newWaliSiswa);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/wali-siswa"), 3000);
          },
          onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data wali siswa";
            if (errorDetails.length > 0) {
              setError(errorDetails.join(", "));
            } else {
              setError(errorMsg);
            }
            setSuccess(""); 
          },
          onSettled: () => {
            setTimeout(() => {
              setLoading(false);
              setError("");
              setSuccess("");
            }, 3000);
          },
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(formState);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (siswaError ) {
        return <div>Error loading data...</div>;
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 1.85 }}>Nama Wali Siswa</CustomFormLabel>
                        <CustomOutlinedInput
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                            fullWidth
                            required
                     />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="siswa_id" sx={{ mt: 1.85 }}>
                        Nama Siswa
                    </CustomFormLabel>
                    <Autocomplete
                        id="siswa_id"
                        options={siswaOptions}
                        getOptionLabel={(option) => option.User.name}
                        value={siswaOptions.find((siswa) => siswa.id === formState.siswa_id) || null}
                        onChange={(event, newValue) => {
                        setFormState({
                            ...formState,
                            siswa_id: newValue ? newValue.id : ""
                        });
                        }}
                        renderInput={(params) => (
                        <CustomTextField
                            {...params}
                            fullWidth
                            placeholder="Cari / Pilih nama siswa"
                            aria-label="Pilih nama siswa"
                            InputProps={{
                            ...params.InputProps,
                            style: { height: 43 },
                            }}
                        />
                        )}
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
                        <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>Password</CustomFormLabel>
                        <CustomOutlinedInput
                            id="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            startAdornment={<InputAdornment position="start"><IconLock /></InputAdornment>}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                   </Grid>
                   <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="hubungan" sx={{ mt: 1.85 }}>Hubungan Keluarga</CustomFormLabel>
                        <CustomSelect
                        id="hubungan"
                        name="hubungan"
                        value={formState.hubungan}
                        onChange={handleChange}
                        fullWidth
                        required
                        >
                        <MenuItem value="" disabled>
                            Pilih Hubungan Keluarga
                        </MenuItem>
                        {enumHubunganKeluarga.map((status, index) => (
                            <MenuItem key={index} value={status}>
                            {status}
                            </MenuItem>
                        ))}
                        </CustomSelect>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="pekerjaan" sx={{ mt: 1.85 }}>Pekerjaan</CustomFormLabel>
                        <CustomOutlinedInput
                            id="pekerjaan"
                            name="pekerjaan"
                            value={formState.pekerjaan}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconBriefcase /></InputAdornment>}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="nomor_telepon" sx={{ mt: 1.85 }}>Nomor WhatsApp</CustomFormLabel>
                        <CustomOutlinedInput
                            id="nomor_telepon"
                            name="nomor_telepon"
                            value={formState.nomor_telepon}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.85 }}>Alamat</CustomFormLabel>
                        <CustomOutlinedInput
                            id="alamat"
                            name="alamat"
                            value={formState.alamat}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconHome /></InputAdornment>}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="is_wali_utama" sx={{ mt: 1.85 }}>Apakah Wali Utama?</CustomFormLabel>
                        <CustomSelect
                            id="is_wali_utama"
                            name="is_wali_utama"
                            value={formState.is_wali_utama}
                            onChange={(e) =>
                            setFormState({
                                ...formState,
                                is_wali_utama: e.target.value === 'true', 
                            })
                            }
                            fullWidth
                            required
                        >
                            <MenuItem value="">Pilih Status Wali Utama</MenuItem>
                            <MenuItem value="true">Iya</MenuItem>
                            <MenuItem value="false">Tidak</MenuItem>
                        </CustomSelect>
                    </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default WaliSiswaForm;