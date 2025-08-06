import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { IconCalendarEvent } from "@tabler/icons-react";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const semesterOptions = [
  { value: "ganjil", label: "Ganjil" },
  { value: "genap", label: "Genap" }
];

const isAktifOptions = [
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" }
];

const isLockedOptions = [
  { value: "true", label: "Terkunci" },
  { value: "false", label: "Terbuka" }
];

const SemesterAjaranForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    semester: "",
    tahun_ajaran: "",
    is_aktif: "true",
    is_locked: "true",
  });

  const [tahunError, setTahunError] = useState("");

  const mutation = useMutation({
    mutationKey: ["tambahSemester"],
    mutationFn: async (newSemester) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/semester-ajaran", newSemester);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/semester-ajaran"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data semester dan tahun ajaran";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
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
  
    if (name === "tahun_ajaran") {
      let clean = value.replace(/[^0-9]/g, "");
      if (clean.length > 8) clean = clean.slice(0, 8);
  
      let formatted = clean;
      if (clean.length > 4) {
        formatted = `${clean.slice(0, 4)}/${clean.slice(4)}`;
      }
  
      setFormState((prevState) => ({
        ...prevState,
        tahun_ajaran: formatted,
      }));
  
      // Live validation
      if (formatted.length === 9 && /^\d{4}\/\d{4}$/.test(formatted) === false) {
        setTahunError("Format tahun ajaran tidak valid (contoh: 2024/2025)");
      } else {
        setTahunError("");
      }
  
      return; 
    }
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const tahunRegex = /^\d{4}\/\d{4}$/;
    if (!tahunRegex.test(formState.tahun_ajaran)) {
    setTahunError("Format tahun ajaran harus 2024/2025");
    return;
    }
    mutation.mutate({
      ...formState,
      is_aktif: formState.is_aktif === "true",
      is_locked: formState.is_locked === "true",
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="semester" sx={{ mt: 1.85 }}>Semester</CustomFormLabel>
          <CustomSelect
            id="semester"
            name="semester"
            value={formState.semester}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="">Pilih Semester</MenuItem>
            {semesterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tahun_ajaran" sx={{ mt: 1.85 }}>Tahun Ajaran</CustomFormLabel>
          <CustomOutlinedInput
            id="tahun_ajaran"
            name="tahun_ajaran"
            placeholder="Contoh: 2024/2025"
            value={formState.tahun_ajaran}
            onChange={handleChange}
            fullWidth
            required
            error={!!tahunError}
            startAdornment={
              <InputAdornment position="start">
                <IconCalendarEvent size={20} />
              </InputAdornment>
            }
          />
          {tahunError && (
            <Typography variant="caption" color="error">
              {tahunError}
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_aktif" sx={{ mt: 1.85 }}>Status</CustomFormLabel>
          <CustomSelect
            id="is_aktif"
            name="is_aktif"
            value={formState.is_aktif}
            onChange={handleChange}
            fullWidth
            required
          >
            {isAktifOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_locked" sx={{ mt: 1.85 }}>Status Penguncian</CustomFormLabel>
          <CustomSelect
            id="is_locked"
            name="is_locked"
            value={formState.is_locked}
            onChange={handleChange}
            fullWidth
            required
          >
            {isLockedOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <SubmitButton type="submit" loading={mutation.isPending}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>
            Batal
          </CancelButton>  
        </Grid>
      </Grid>
    </Box>
  );
};

export default SemesterAjaranForm;

