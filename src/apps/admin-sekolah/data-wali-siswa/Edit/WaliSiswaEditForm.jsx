import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  IconBriefcase,
  IconUser,
  IconPhone,
  IconHome
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const HUBUNGAN_OPTIONS = [
  { value: 'Ayah', label: 'Ayah' },
  { value: 'Ibu', label: 'Ibu' },
  { value: 'Kakak', label: 'Kakak' },
  { value: 'Paman', label: 'Paman' },
  { value: 'Bibi', label: 'Bibi' },
  { value: 'wali_lainnya', label: 'Wali Lainnya' },
];

const WalisSiswaEditForm = ({
  waliSiswaData,
  handleChange,       // generic: (e) => setState
  handleSubmit,
  handleCancel,
  isLoading,
  setWaliSiswaData,   // ⬅️ tambahkan dari parent agar bisa set khusus
}) => {
  const { data: siswaOptions = [], isLoading: isSiswaLoading } = useQuery({
    queryKey: ["siswaOptions"],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/siswa');
      return res.data.data; // [{id, User:{name}, Kelas:{nama_kelas}, ...}]
    }
  });

  const onPhoneChange = (e) => {
    const clean = (e.target.value || '').replace(/\D/g, '');
    handleChange({ target: { name: 'nomor_telepon', value: clean }});
  };

  if (isLoading || isSiswaLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  const selectedSiswa = siswaOptions.find(s => s.id === waliSiswaData.siswa_id) || null;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 3 }}>Nama Wali Siswa</CustomFormLabel>
          <CustomOutlinedInput
            id="name"
            name="name"
            value={waliSiswaData.name || ""}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="siswa_id" sx={{ mt: 3 }}>Nama Siswa</CustomFormLabel>
          <Autocomplete
            id="siswa_id"
            options={siswaOptions}
            getOptionLabel={(opt) => opt?.User?.name || '-'}
            value={selectedSiswa}
            onChange={(_, newValue) => {
              setWaliSiswaData(prev => ({ ...prev, siswa_id: newValue ? newValue.id : "" }));
            }}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                fullWidth
                placeholder="Cari / Pilih nama siswa"
                aria-label="Pilih nama siswa"
                InputProps={{ ...params.InputProps, style: { height: 43 } }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="hubungan" sx={{ mt: 1.85 }}>Hubungan Keluarga</CustomFormLabel>
          <CustomSelect
            id="hubungan"
            name="hubungan"
            value={waliSiswaData.hubungan || ""}
            onChange={(e) => {
              // kirim value kanonik
              handleChange({ target: { name: 'hubungan', value: e.target.value }});
            }}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Pilih Hubungan</MenuItem>
            {HUBUNGAN_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="pekerjaan" sx={{ mt: 1.85 }}>Pekerjaan</CustomFormLabel>
          <CustomOutlinedInput
            id="pekerjaan"
            name="pekerjaan"
            value={waliSiswaData.pekerjaan || ""}
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
            value={waliSiswaData.nomor_telepon || ""}
            onChange={onPhoneChange}
            startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.85 }}>Alamat</CustomFormLabel>
          <CustomOutlinedInput
            id="alamat"
            name="alamat"
            value={waliSiswaData.alamat || ""}
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
            value={String(!!waliSiswaData.is_wali_utama)} // "true" / "false"
            onChange={(e) => {
              const boolVal = e.target.value === 'true';
              setWaliSiswaData(prev => ({ ...prev, is_wali_utama: boolVal }));
            }}
            fullWidth
          >
            <MenuItem value="true">Iya</MenuItem>
            <MenuItem value="false">Tidak</MenuItem>
          </CustomSelect>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default WalisSiswaEditForm;
