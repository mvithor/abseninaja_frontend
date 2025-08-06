import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment, MenuItem } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { IconCalendarEvent } from "@tabler/icons-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import axiosInstance from "src/utils/axiosInstance";

const kategoriHariOptions = [
    { value: "KBM", label: "KBM" },
    { value: "Ekstrakurikuler", label: "Ekstrakurikuler" },
    { value: "Libur", label: "Libur" },
    { value: "Pulang Cepat", label: "Pulang Cepat" },
];

const tipeHariOptions = [
    { value: "Reguler", label: "Reguler" },
    { value: "Akhir Pekan", label: "Akhir Pekan" },
    { value : "Libur Khusus", label: "Libur Khusus"}
];

const isAktifOptions = [
    { value: 'true', label: "Aktif" },
    { value: 'false', label: "Nonaktif" },
];

const HariForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        nama_hari: '',
        kategori_hari: '',
        tipe_hari: '',
        deskripsi_hari: '',
        is_aktif: 'true', 
        tanggal_khusus: null, 
    });

    const mutation = useMutation({
        mutationKey: ["tambahHari"],
        mutationFn: async (newHari) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/hari', newHari);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/hari"), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data hari";
            if (errorDetails.length > 0) {
                setError(errorDetails.join(", "));
            } else {
                setError(errorMsg);
            }
            setSuccess("");
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
            ...(name === "kategori_hari" && value === "KBM" ? { tanggal_khusus: null } : {}),
        }));
    };

    const handleDateChange = (date) => {
        setFormState((prevState) => ({
            ...prevState,
            tanggal_khusus: date,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate({
            ...formState,
            is_aktif: formState.is_aktif === 'true',
        });
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="nama_hari" sx={{ mt: 1.85 }}>Nama Hari</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_hari"
                        name="nama_hari"
                        value={formState.nama_hari}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconCalendarEvent /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="kategori_hari" sx={{ mt: 1.85 }}>Kategori Hari</CustomFormLabel>
                    <CustomSelect
                        id="kategori_hari"
                        name="kategori_hari"
                        value={formState.kategori_hari}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="">Pilih Kategori</MenuItem>
                        {kategoriHariOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="tipe_hari" sx={{ mt: 1.85 }}>Tipe Hari</CustomFormLabel>
                    <CustomSelect
                        id="tipe_hari"
                        name="tipe_hari"
                        value={formState.tipe_hari}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="">Pilih Tipe</MenuItem>
                        {tipeHariOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                {formState.kategori_hari !== "KBM" && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomFormLabel htmlFor="tanggal_khusus" sx={{ mt: 1.85 }}>Tanggal Khusus</CustomFormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={formState.tanggal_khusus || null}
                            onChange={handleDateChange}
                            placeholder="Tanggal Khusus"
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: 'medium',
                                    InputProps: {
                                        sx: {
                                            height: '44px',
                                            paddingHorizontal: 0,
                                        },
                                    },
                                },
                            }}
                        />
                        </LocalizationProvider>
                    </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="is_aktif" sx={{ mt: 1.85 }}>Status Aktif</CustomFormLabel>
                    <CustomSelect
                        id="is_aktif"
                        name="is_aktif"
                        value={formState.is_aktif}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="">Pilih Status</MenuItem>
                        {isAktifOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="deskripsi_hari" sx={{ mt: 1.85 }}>Deskripsi Hari</CustomFormLabel>
                    <CustomOutlinedInput
                        id="deskripsi_hari"
                        name="deskripsi_hari"
                        value={formState.deskripsi_hari}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} display='flex' gap={2}>
                    <SubmitButton isLoading={mutation.isLoading}>Simpan</SubmitButton>
                    <CancelButton onClick={handleCancel}>Batal</CancelButton>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HariForm;
