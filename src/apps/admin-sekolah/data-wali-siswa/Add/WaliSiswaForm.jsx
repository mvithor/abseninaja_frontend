import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  Stack,
  Typography
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

// Enum hubungan keluarga (label tampilan)
const enumHubunganKeluarga = ["Ayah", "Ibu", "Kakak", "Paman", "Bibi", "Wali Lainnya"];

const WaliSiswaForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    hubungan: "",
    pekerjaan: "",
    nomor_telepon: "",
    alamat: "",
    siswaTerpilih: [], 
    anak: [] 
  });

  const { data: siswaOptions = [], isError: siswaError } = useQuery({
    queryKey: ["siswaOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/siswa");
      return response.data.data; // asumsi: [{ id, User:{name}, Kelas:{nama_kelas}, ...}]
    }
  });

  const mutation = useMutation({
    mutationKey: ["tambahWaliSiswa"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/wali-siswa", payload);
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
      if (errorDetails.length > 0) setError(errorDetails.join(", "));
      else setError(errorMsg);
      setSuccess("");
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
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle per-anak untuk set Wali Utama
  const handleToggleWaliUtama = (siswaId, checked) => {
    setFormState((prev) => ({
      ...prev,
      anak: prev.anak.map((a) =>
        a.siswa_id === siswaId ? { ...a, is_wali_utama: checked } : a
      )
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    // map label hubungan ke value schema
    const hubunganMapped =
      formState.hubungan === "Wali Lainnya" ? "wali_lainnya" : formState.hubungan;

    // payload final (selalu kirim dalam bentuk anak[])
    const payload = {
      name: formState.name,
      email: formState.email,
      password: formState.password,
      hubungan: hubunganMapped,
      pekerjaan: formState.pekerjaan || null,
      nomor_telepon: formState.nomor_telepon,
      alamat: formState.alamat || null,
      anak: formState.anak // [{ siswa_id, is_wali_utama }]
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => navigate(-1);

  if (siswaError) return <div>Error loading data...</div>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 1.85 }}>
            Nama Wali Siswa
          </CustomFormLabel>
          <CustomOutlinedInput
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconUser />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        {/* MULTI SELECT ANAK */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="siswaIds" sx={{ mt: 1.85 }}>
            Pilih Anak (Boleh Lebih dari 1)
          </CustomFormLabel>
          <Autocomplete
            multiple
            id="siswaIds"
            options={siswaOptions}
            getOptionLabel={(option) => option?.User?.name || "-"}
            value={formState.siswaTerpilih}
            onChange={(event, newValue) => {
              setFormState((prev) => ({
                ...prev,
                siswaTerpilih: newValue,
                anak: newValue.map((opt) => {
                  const existing = prev.anak.find((a) => a.siswa_id === opt.id);
                  return { siswa_id: opt.id, is_wali_utama: existing?.is_wali_utama ?? false };
                })
              }));
            }}
            limitTags={2}
            size="small"
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option?.User?.name} {option?.Kelas?.nama_kelas ? `— ${option.Kelas.nama_kelas}` : ""}
              </li>
            )}
            renderInput={(params) => (
              <CustomTextField
                {...params}
                placeholder="Cari / Pilih nama siswa"
                sx={{
                  "& .MuiInputBase-root": {
                    minHeight: 44,
                    paddingTop: "2px",
                    paddingBottom: "2px"
                  },
                  "& .MuiChip-root": {
                    height: 24,
                    fontSize: 12,
                    marginTop: 0.5
                  }
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="email" sx={{ mt: 1.85 }}>
            Email
          </CustomFormLabel>
          <CustomOutlinedInput
            id="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconMail />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>
            Password
          </CustomFormLabel>
          <CustomOutlinedInput
            id="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            required
            fullWidth
            type={showPassword ? "text" : "password"}
            startAdornment={
              <InputAdornment position="start">
                <IconLock />
              </InputAdornment>
            }
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
          <CustomFormLabel htmlFor="hubungan" sx={{ mt: 1.85 }}>
            Hubungan Keluarga
          </CustomFormLabel>
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
          <CustomFormLabel htmlFor="pekerjaan" sx={{ mt: 1.85 }}>
            Pekerjaan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="pekerjaan"
            name="pekerjaan"
            value={formState.pekerjaan}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconBriefcase />
              </InputAdornment>
            }
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nomor_telepon" sx={{ mt: 1.85 }}>
            Nomor WhatsApp
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nomor_telepon"
            name="nomor_telepon"
            value={formState.nomor_telepon}
            onChange={(e) => {
              // keep digits only; format WA dilakukan di backend
              const onlyDigits = e.target.value.replace(/\D/g, "");
              setFormState((prev) => ({ ...prev, nomor_telepon: onlyDigits }));
            }}
            startAdornment={
              <InputAdornment position="start">
                <IconPhone />
              </InputAdornment>
            }
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.85 }}>
            Alamat
          </CustomFormLabel>
          <CustomOutlinedInput
            id="alamat"
            name="alamat"
            value={formState.alamat}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconHome />
              </InputAdornment>
            }
            fullWidth
          />
        </Grid>

        {/* DAFTAR ANAK TERPILIH + TOGGLE WALI UTAMA */}
        {formState.anak.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 1,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper"
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Pengaturan Wali Utama per Anak
              </Typography>
              <Stack spacing={1}>
                {formState.anak.map((a) => {
                  const siswa = formState.siswaTerpilih.find((s) => s.id === a.siswa_id);
                  return (
                    <Box
                      key={a.siswa_id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "background.default"
                      }}
                    >
                      <Typography variant="body2">
                        {siswa?.User?.name || "-"}
                        {siswa?.Kelas?.nama_kelas ? ` — ${siswa.Kelas.nama_kelas}` : ""}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!a.is_wali_utama}
                            onChange={(e) => handleToggleWaliUtama(a.siswa_id, e.target.checked)}
                          />
                        }
                        label="Wali Utama"
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default WaliSiswaForm;
