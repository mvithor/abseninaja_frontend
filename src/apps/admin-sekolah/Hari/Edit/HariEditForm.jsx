import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { IconCalendar } from "@tabler/icons-react";
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

const HariEditForm = ({ 
    hariData,
    handleChange,
    handleDateChange,
    handleSubmit,
    handleCancel,
    isLoading
}) => {

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="nama_hari" sx={{ mt: 1.85 }}>Nama Hari</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_hari"
                        name="nama_hari"
                        value={hariData.nama_hari || ""}
                        onChange={handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconCalendar />
                            </InputAdornment>
                        }
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="kategori_hari" sx={{ mt: 1.85 }}>Kategori Hari</CustomFormLabel>
                    <CustomSelect
                        id="kategori_hari"
                        name="kategori_hari"
                        value={hariData.kategori_hari}
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
                        value={hariData.tipe_hari}
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
                {hariData.tipe_hari === "Libur Khusus" && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomFormLabel htmlFor="tanggal_khusus" sx={{ mt: 1.85 }}>Tanggal Khusus</CustomFormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={hariData.tanggal_khusus || null}
                            onChange={handleDateChange}
                            placeholder="Tanggal Khusus"
                            slotProps={{
                                textField: {
                                fullWidth: true,
                                size: 'medium',
                                required: true,
                                InputProps: {
                                    sx: {
                                    height: '46px',
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
                        value={hariData.is_aktif?.toString()}
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
                        value={hariData.deskripsi_hari || ""}
                        onChange={handleChange}
                        multiline
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default HariEditForm;
