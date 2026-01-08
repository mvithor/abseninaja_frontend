import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import {
  IconTrophy,
  IconBuilding,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import axiosInstance from "src/utils/axiosInstance";

const enumKategoriSifat = [
  { label: "Akademik", value: "AKADEMIK" },
  { label: "Non Akademik", value: "NON_AKADEMIK" },
];

const enumKategoriBidang = [
  { label: "Sains", value: "SAINS" },
  { label: "Humaniora", value: "HUMANIORA" },
  { label: "Olahraga", value: "OLAHRAGA" },
  { label: "Seni", value: "SENI" },
  { label: "Keagamaan", value: "KEAGAMAAN" },
  { label: "Lingkungan", value: "LINGKUNGAN" },
  { label: "Teknologi", value: "TEKNOLOGI" },
  { label: "Lainnya", value: "LAINNYA" },
];

const enumTingkat = [
  { label: "Sekolah", value: "SEKOLAH" },
  { label: "Kecamatan", value: "KECAMATAN" },
  { label: "Kabupaten", value: "KABUPATEN" },
  { label: "Kota", value: "KOTA" },
  { label: "Provinsi", value: "PROVINSI" },
  { label: "Nasional", value: "NASIONAL" },
  { label: "Internasional", value: "INTERNASIONAL" },
];

const enumPeringkat = [
  { label: "Juara 1", value: "JUARA_1" },
  { label: "Juara 2", value: "JUARA_2" },
  { label: "Juara 3", value: "JUARA_3" },
  { label: "Harapan 1", value: "HARAPAN_1" },
  { label: "Harapan 2", value: "HARAPAN_2" },
  { label: "Harapan 3", value: "HARAPAN_3" },
  { label: "Finalis", value: "FINALIS" },
];

const MAX_PDF_SIZE = 1 * 1024 * 1024;  
const MAX_IMG_SIZE = 2 * 1024 * 1024;  

const PrestasiMadrasahForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    nama_prestasi: "",
    kategori_sifat: "",
    kategori_bidang: "",
    tingkat: "",
    peringkat: "",
    penyelenggara: "",
    tanggal_pencapaian: null,  
    lokasi: "",
    link_berita: "",
    deskripsi: "",
    buktiSertifikatFile: null, 
    fotoKegiatanFile: null,   
  });

  const mutation = useMutation({
    mutationKey: ["tambahPrestasiMadrasah"],
    mutationFn: async (formData) => {
      setLoading(true);
      const response = await axiosInstance.post(
        "/api/v1/admin-sekolah/prestasi-madrasah",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg || "Prestasi madrasah berhasil ditambahkan");
      setError("");
      setTimeout(
        () => navigate("/dashboard/admin-sekolah/prestasi-institusi"),
        3000
      );
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg ||
        "Terjadi kesalahan saat menambahkan data prestasi institusi";
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

  const handleDateChange = (date) => {
    setFormState((prevState) => {
      const updated = { ...prevState };
      if (date) {
        updated.tanggal_pencapaian = date;
      } else {
        updated.tanggal_pencapaian = null;
      }
      return updated;
    });
  };

  const handleBuktiSertifikatChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setFormState((prev) => ({ ...prev, buktiSertifikatFile: null }));
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Bukti sertifikat wajib berupa file PDF");
      setFormState((prev) => ({ ...prev, buktiSertifikatFile: null }));
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setError("Ukuran file sertifikat maksimal 1MB");
      setFormState((prev) => ({ ...prev, buktiSertifikatFile: null }));
      setTimeout(() => setError(""), 3000);
      return;
    }

    setFormState((prev) => ({
      ...prev,
      buktiSertifikatFile: file,
    }));
  };

  const handleFotoKegiatanChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setFormState((prev) => ({ ...prev, fotoKegiatanFile: null }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Foto kegiatan wajib berupa file gambar (PNG/JPG/WEBP)");
      setFormState((prev) => ({ ...prev, fotoKegiatanFile: null }));
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (file.size > MAX_IMG_SIZE) {
      setError("Ukuran foto kegiatan maksimal 2MB");
      setFormState((prev) => ({ ...prev, fotoKegiatanFile: null }));
      setTimeout(() => setError(""), 3000);
      return;
    }

    setFormState((prev) => ({
      ...prev,
      fotoKegiatanFile: file,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const {
      nama_prestasi,
      kategori_sifat,
      kategori_bidang,
      tingkat,
      peringkat,
      penyelenggara,
      tanggal_pencapaian,
      lokasi,
      link_berita,
      deskripsi,
      buktiSertifikatFile,
      fotoKegiatanFile,
    } = formState;

    if (
      !nama_prestasi ||
      !kategori_sifat ||
      !kategori_bidang ||
      !tingkat ||
      !peringkat ||
      !penyelenggara ||
      !tanggal_pencapaian
    ) {
      setError("Lengkapi seluruh field wajib bertanda *.");
      setSuccess("");
      return;
    }

    // Convert Date → 'YYYY-MM-DD'
    const tanggalStr = new Date(tanggal_pencapaian)
      .toISOString()
      .split("T")[0];

    const formData = new FormData();
    formData.append("nama_prestasi", nama_prestasi);
    formData.append("kategori_sifat", kategori_sifat);
    formData.append("kategori_bidang", kategori_bidang);
    formData.append("tingkat", tingkat);
    formData.append("peringkat", peringkat);
    formData.append("penyelenggara", penyelenggara);
    formData.append("tanggal_pencapaian", tanggalStr);
    formData.append("lokasi", lokasi || "");
    formData.append("link_berita", link_berita || "");
    formData.append("deskripsi", deskripsi || "");

    if (buktiSertifikatFile) {
      formData.append("bukti_sertifikat", buktiSertifikatFile);
    }

    if (fotoKegiatanFile) {
      formData.append("foto_kegiatan", fotoKegiatanFile);
    }

    mutation.mutate(formData);
  };

  const handleCancel = () => navigate(-1);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_prestasi" sx={{ mt: 1.85 }}>
            Nama Prestasi
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama_prestasi"
            name="nama_prestasi"
            value={formState.nama_prestasi}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconTrophy />
              </InputAdornment>
            }
            placeholder="Contoh: Juara 1 Lomba Film Pendek Madrasah"
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori_sifat" sx={{ mt: 1.85 }}>
            Sifat Prestasi
          </CustomFormLabel>
          <CustomSelect
            id="kategori_sifat"
            name="kategori_sifat"
            value={formState.kategori_sifat}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Pilih Sifat Prestasi
            </MenuItem>
            {enumKategoriSifat.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori_bidang" sx={{ mt: 1.85 }}>
            Bidang Prestasi
          </CustomFormLabel>
          <CustomSelect
            id="kategori_bidang"
            name="kategori_bidang"
            value={formState.kategori_bidang}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Pilih Bidang Prestasi
            </MenuItem>
            {enumKategoriBidang.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tingkat" sx={{ mt: 1.85 }}>
            Tingkat
          </CustomFormLabel>
          <CustomSelect
            id="tingkat"
            name="tingkat"
            value={formState.tingkat}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Pilih Tingkat
            </MenuItem>
            {enumTingkat.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="peringkat" sx={{ mt: 1.85 }}>
            Peringkat
          </CustomFormLabel>
          <CustomSelect
            id="peringkat"
            name="peringkat"
            value={formState.peringkat}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="" disabled>
              Pilih Peringkat
            </MenuItem>
            {enumPeringkat.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="penyelenggara" sx={{ mt: 1.85 }}>
            Penyelenggara
          </CustomFormLabel>
          <CustomOutlinedInput
            id="penyelenggara"
            name="penyelenggara"
            value={formState.penyelenggara}
            onChange={handleChange}
            placeholder="Contoh: Kementerian Agama RI"
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
          <CustomFormLabel htmlFor="tanggal_pencapaian" sx={{ mt: 1.85 }}>
            Tanggal Pencapaian
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={formState.tanggal_pencapaian || null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "medium",
                  InputProps: {
                    sx: {
                      height: "46px",
                      paddingHorizontal: 0,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="lokasi" sx={{ mt: 1.85 }}>
            Lokasi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="lokasi"
            name="lokasi"
            value={formState.lokasi}
            onChange={handleChange}
            placeholder="Contoh: Jakarta, Bandung, Online, dll."
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="link_berita" sx={{ mt: 1.85 }}>
            Link Berita (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="link_berita"
            name="link_berita"
            value={formState.link_berita}
            onChange={handleChange}
            placeholder="Masukkan URL berita resmi jika ada"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
            Deskripsi (Opsional)
          </CustomFormLabel>
          <CustomTextField
            id="deskripsi"
            name="deskripsi"
            value={formState.deskripsi}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
            placeholder="Tuliskan ringkasan prestasi, detail lomba, atau catatan penting lainnya."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="bukti_sertifikat" sx={{ mt: 1.85 }}>
            Bukti Sertifikat (PDF)
          </CustomFormLabel>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap={1}
            mb={1}
          >
            {formState.buktiSertifikatFile && (
              <Typography variant="body2">
                File terpilih: {formState.buktiSertifikatFile.name}
              </Typography>
            )}
            <CustomOutlinedInput
              id="bukti_sertifikat"
              name="bukti_sertifikat"
              type="file"
              inputProps={{ accept: "application/pdf" }}
              onChange={handleBuktiSertifikatChange}
              fullWidth
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Hanya file PDF, maksimal 1MB.
            </Typography>
          </Box>
        </Grid>

        {/* Foto Kegiatan (Image) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="foto_kegiatan" sx={{ mt: 1.85 }}>
            Foto Kegiatan (Gambar)
          </CustomFormLabel>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap={1}
            mb={1}
          >
            {formState.fotoKegiatanFile && (
              <Box
                sx={{
                  border: "1px solid #E0E0E0",
                  borderRadius: 2,
                  p: 1,
                  backgroundColor: "#FAFAFA",
                  maxWidth: 160,
                  maxHeight: 160,
                  overflow: "hidden",
                }}
              >
                <img
                  src={URL.createObjectURL(formState.fotoKegiatanFile)}
                  alt="Preview Foto Kegiatan"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
            <CustomOutlinedInput
              id="foto_kegiatan"
              name="foto_kegiatan"
              type="file"
              inputProps={{ accept: "image/*" }}
              onChange={handleFotoKegiatanChange}
              fullWidth
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Format gambar (PNG/JPG/WEBP), maksimal 2MB.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}
      >
        <SubmitButton isLoading={loading}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PrestasiMadrasahForm;
