import { Box, InputAdornment, CircularProgress, FormControl, Select, MenuItem } from "@mui/material";
import { IconBuildingArch, IconHash } from "@tabler/icons-react";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const JurusanEditForm = ({ jurusanData, handleChange, handleSubmit, handleCancel, isLoading }) => {
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
                <Grid size={{ xs: 12 }}>
                    <Box display="flex" alignItems="center">
                        <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
                            Nama Jurusan
                        </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        fullWidth
                        id="nama"
                        name="nama"
                        value={jurusanData?.nama || ''}
                        onChange={handleChange}
                        variant="outlined"
                        startAdornment={
                            <InputAdornment position="start">
                                <IconBuildingArch />
                            </InputAdornment>
                        }
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" alignItems="center">
                        <CustomFormLabel htmlFor="kode_lokal" sx={{ mt: 1.85 }}>
                            Kode Lokal
                        </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        fullWidth
                        id="kode_lokal"
                        name="kode_lokal"
                        value={jurusanData?.kode_lokal || ''}
                        onChange={handleChange}
                        variant="outlined"
                        startAdornment={
                            <InputAdornment position="start">
                                <IconHash />
                            </InputAdornment>
                        }
                        inputProps={{ maxLength: 20 }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="is_aktif" sx={{ mt: 1.85 }}>
                        Status
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="is_aktif"
                            name="is_aktif"
                            value={Boolean(jurusanData?.is_aktif)}
                            onChange={handleChange}
                            sx={{
                                '& .MuiSelect-select': { py: '10.5px' },
                            }}
                        >
                            <MenuItem value={true}>Aktif</MenuItem>
                            <MenuItem value={false}>Nonaktif</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default JurusanEditForm;