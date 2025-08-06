import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBuilding } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const TambahEkskulForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    logo_file: null,
    nama_ekskul: "",
    deskripsi:"",
    pembinaTerpilih: [],
  });


  const { data: pegawaiOptions = [], isError: pegawaiError } = useQuery({
    queryKey: ["pegawaiOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/guru");
      return response.data.data;
    },
  });

  const mutation = useMutation({
    mutationKey: ["tambahEkskul"],
    mutationFn: async (formData) => {
      setLoading(true);
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ekskul", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/ekskul"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg ||
        "Terjadi kesalahan saat menambahkan ekskul";
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
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 1 * 1024 * 1024) {
      setError("Ukuran file maksimal 1MB");
      setTimeout(() => setError(""), 3000);
      setFormState((prev) => ({ ...prev, logo_file: null }));
      return;
    }
  
    setFormState((prev) => ({
      ...prev,
      logo_file: file,
    }));
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nama_ekskul", formState.nama_ekskul);
    formData.append("logo", formState.logo_file);
    formData.append("deskripsi", formState.deskripsi);
    formState.pembinaTerpilih.forEach((p) => {
      formData.append("pembina_ids[]", p.id);
    });
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (pegawaiError) return <div>Error loading data...</div>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_ekskul" sx={{ mt:1.85}}>
            Nama Ekstrakurikuler
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama_ekskul"
            name="nama_ekskul"
            value={formState.nama_ekskul}
            onChange={handleChange}
            placeholder="Masukkan Nama Ekskul"
            startAdornment={
              <InputAdornment position="start">
                <IconBuilding />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt:1.85}}>
            Deskripsi
          </CustomFormLabel>
          <CustomOutlinedInput
            id="deskripsi"
            name="deskripsi"
            value={formState.deskripsi}
            onChange={handleChange}
            placeholder="Masukkan Deskripsi Ekstrakurikuler"
            startAdornment={
              <InputAdornment position="start">
                <IconBuilding />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="pembinaIds" sx={{ mt:1.85}}>
            Pembina
          </CustomFormLabel>
          <Autocomplete
            multiple
            id="pembinaIds"
            options={pegawaiOptions}
            getOptionLabel={(option) => option.nama}
            value={formState.pembinaTerpilih}
            onChange={(event, newValue) => {
                setFormState({ ...formState, pembinaTerpilih: newValue });
            }}
            limitTags={2}
            size="small"
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                {option.nama}
                </li>
            )}
            renderInput={(params) => (
                <CustomTextField
                {...params}
                placeholder="Pilih pembina ekskul"
                sx={{
                    '& .MuiInputBase-root': {
                    minHeight: 44,
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    },
                    '& .MuiChip-root': {
                    height: 24,
                    fontSize: 12,
                    marginTop: 0.5,
                    },
                }}
                />
            )}
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
        <CustomFormLabel htmlFor="logo_file" sx={{ mt: 1.85 }}>
            Logo
        </CustomFormLabel>
        <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap={1}
            mb={1}
        >
            {formState.logo_file && (
            <Box
                sx={{
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                p: 1,
                backgroundColor: '#FAFAFA',
                maxWidth: 140,
                maxHeight: 140,
                overflow: 'hidden'
                }}
            >
                <img
                src={URL.createObjectURL(formState.logo_file)}
                alt="Preview Logo"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />
            </Box>
            )}
            <CustomOutlinedInput
            id="logo_file"
            name="logo_file"
            type="file"
            inputProps={{ accept: "image/*" }}
            onChange={handleFileChange}
            fullWidth
            />
        </Box>
        </Grid>
      </Grid>
      <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }} >
        <SubmitButton isLoading={loading}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
     </Box>
    </Box>
  );
};

export default TambahEkskulForm;
