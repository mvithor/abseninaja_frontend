import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, InputAdornment } from "@mui/material";
import { IconHash, IconBook2 } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const KATEGORI_OPTIONS = [
  { value: "kompetensi_umum", label: "Kompetensi Umum" },
  { value: "kompetensi_inti", label: "Kompetensi Inti" },
  { value: "kompetensi_pilihan", label: "Kompetensi Pilihan" },
];

const TambahSkkniUnitForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    kode_unit: "",
    judul_unit: "",
    kategori: "",
  });

  const mutation = useMutation({
    mutationKey: ["tambahSkkniUnit"],
    mutationFn: async (newUnit) => {
      const payload = {
        kode_unit: String(newUnit.kode_unit || "").trim().toUpperCase(),
        judul_unit: String(newUnit.judul_unit || "").trim(),
        kategori: newUnit.kategori,
      };
      const response = await axiosInstance.post("/api/v1/kepala-jurusan/skkni-unit", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["skkni-unit-list"] });
      setTimeout(() => navigate("/dashboard/kepala-jurusan/skkni-unit"), 2000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan unit SKKNI";
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formState);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kode_unit" sx={{ mt: 1.85 }}>Kode Unit</CustomFormLabel>
          <CustomOutlinedInput
            id="kode_unit"
            name="kode_unit"
            value={formState.kode_unit}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconHash /></InputAdornment>}
            fullWidth
            required
            inputProps={{ maxLength: 20 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="judul_unit" sx={{ mt: 1.85 }}>Judul Unit</CustomFormLabel>
          <CustomOutlinedInput
            id="judul_unit"
            name="judul_unit"
            value={formState.judul_unit}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconBook2 /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori" sx={{ mt: 1.85 }}>Kategori</CustomFormLabel>
          <CustomSelect
            id="kategori"
            name="kategori"
            value={formState.kategori}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kategori" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="" disabled>
              Pilih Kategori
            </MenuItem>
            {KATEGORI_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahSkkniUnitForm;