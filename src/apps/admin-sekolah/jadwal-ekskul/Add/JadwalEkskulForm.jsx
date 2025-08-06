import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const TambahJadwalEkskulForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        ekskul_id: "",
        hari_id: "",
        jam_mulai: null,
        jam_selesai: null,
    });

    const { data: hariOptions = [], isError: hariError } = useQuery({
        queryKey: ["hariOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/hari');
            return response.data.data;
        }
    });

    const { data: ekskulOptions = [], isError: ekskulError } = useQuery({
        queryKey: ["ekskulOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/ekskul');
            return response.data.data;
        }
    });

    const mutation = useMutation({
        mutationKey: ["tambahJadwal"],
        mutationFn: async (newJadwal) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/jadwal-ekskul', newJadwal);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-ekskul"), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan jadwal ekstrakurikuler";
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
                setLoading(false);
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

    const handleTimeChange = (field, value) => {
        if (value) {
            const formattedTime = `${value.getHours().toString().padStart(2, '0')}.${value.getMinutes().toString().padStart(2, '0')}`;
            setFormState((prevState) => ({
                ...prevState,
                [field]: formattedTime,
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formState.jam_mulai || !formState.jam_selesai) {
            setError("Waktu mulai dan selesai harus diisi dengan format yang valid");
            return;
        }

        mutation.mutate(formState);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (ekskulError || hariError) {
        return <div>Error Loading Data...</div>
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2} rowSpacing={1}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="ekskul_id" sx={{ mt: 1.85 }}>Nama Ekstrakurikuler</CustomFormLabel>
                        <CustomSelect
                            id="ekskul_id"
                            name="ekskul_id"
                            value={formState.ekskul_id || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            displayEmpty
                            inputProps={{ "aria-label": "Pilih Ekskul" }}
                            MenuProps={{
                                anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                                },
                                transformOrigin: {
                                vertical: "top",
                                horizontal: "left",
                                },
                                PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    overflowY: "auto",
                                },
                                },
                            }}
                            >
                            <MenuItem value="" disabled>
                                Pilih Ekskul
                            </MenuItem>
                            {ekskulOptions.length === 0 ? (
                                <MenuItem value="" disabled>Memuat...</MenuItem>
                            ) : (
                                ekskulOptions.map((ekskulOption) => (
                                <MenuItem key={`ekskul-${ekskulOption.id}`} value={ekskulOption.id}>
                                    {ekskulOption.nama_ekskul}
                                </MenuItem>
                                ))
                            )}
                        </CustomSelect>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="hari_id" sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
                        <CustomSelect
                            id="hari_id"
                            name="hari_id"
                            value={formState.hari_id || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            displayEmpty
                            inputProps={{ "aria-label": "Pilih Hari" }}
                            MenuProps={{
                                anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                                },
                                transformOrigin: {
                                vertical: "top",
                                horizontal: "left",
                                },
                                PaperProps: {
                                style: {
                                    maxHeight: 300,
                                    overflowY: "auto",
                                },
                                },
                            }}
                            >
                            <MenuItem value="" disabled>
                                Pilih Hari
                            </MenuItem>
                            {hariOptions.length === 0 ? (
                                <MenuItem value="" disabled>Memuat...</MenuItem>
                            ) : (
                                hariOptions.map((hariOption) => (
                                <MenuItem key={`hari-${hariOption.id}`} value={hariOption.id}>
                                    {hariOption.nama_hari}
                                </MenuItem>
                                ))
                            )}
                        </CustomSelect>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jam_mulai" sx={{ mt: 1.85 }}>Waktu Mulai</CustomFormLabel>
                        <TimePicker
                            ampm={false}
                            disableMaskedInput
                            value={
                                formState.jam_mulai
                                ? new Date(`1970-01-01T${formState.jam_mulai.replace('.', ':')}:00`)
                                : null
                            }
                            onChange={(value) => handleTimeChange("jam_mulai", value)}
                            desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
                            enableAccessibleFieldDOMStructure={false}
                            slotProps={{
                                textField: {
                                fullWidth: true,
                                size: "medium",
                                required: true,
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jam_selesai" sx={{ mt: 1.85 }}>Waktu Selesai</CustomFormLabel>
                        <TimePicker
                            ampm={false}
                            disableMaskedInput
                            value={
                            formState.jam_selesai
                                ? new Date(`1970-01-01T${formState.jam_selesai.replace('.', ':')}:00`)
                                : null
                            }
                            onChange={(value) => handleTimeChange("jam_selesai", value)}
                            desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
                            enableAccessibleFieldDOMStructure={false}
                            slotProps={{
                            textField: {
                                fullWidth: true,
                                size: "medium",
                                required: true,
                            },
                            }}
                        /> 
                    </Grid>
                </Grid>
                <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                    <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                    <CancelButton onClick={handleCancel}>Batal</CancelButton>
                </Box>
            </LocalizationProvider>
        </Box>
    );
};

export default TambahJadwalEkskulForm;