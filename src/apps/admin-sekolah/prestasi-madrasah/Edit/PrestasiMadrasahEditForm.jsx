import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Typography,
} from "@mui/material";
import { IconTrophy, IconBuilding } from "@tabler/icons-react";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";

const kategoriSifatOptions = [
  { value: "AKADEMIK", label: "Akademik" },
  { value: "NON_AKADEMIK", label: "Non Akademik" },
];

const kategoriBidangOptions = [
  { value: "SAINS", label: "Sains" },
  { value: "HUMANIORA", label: "Humaniora" },
  { value: "OLAHRAGA", label: "Olahraga" },
  { value: "SENI", label: "Seni" },
  { value: "KEAGAMAAN", label: "Keagamaan" },
  { value: "LINGKUNGAN", label: "Lingkungan" },
  { value: "TEKNOLOGI", label: "Teknologi" },
  { value: "LAINNYA", label: "Lainnya" },
];

const tingkatOptions = [
  { value: "SEKOLAH", label: "Sekolah" },
  { value: "KECAMATAN", label: "Kecamatan" },
  { value: "KABUPATEN", label: "Kabupaten" },
  { value: "KOTA", label: "Kota" },
  { value: "PROVINSI", label: "Provinsi" },
  { value: "NASIONAL", label: "Nasional" },
  { value: "INTERNASIONAL", label: "Internasional" },
];

const peringkatOptions = [
  { value: "JUARA_1", label: "Juara 1" },
  { value: "JUARA_2", label: "Juara 2" },
  { value: "JUARA_3", label: "Juara 3" },
  { value: "HARAPAN_1", label: "Harapan 1" },
  { value: "HARAPAN_2", label: "Harapan 2" },
  { value: "HARAPAN_3", label: "Harapan 3" },
  { value: "FINALIS", label: "Finalis" },
];

const PrestasiMadrasahEditForm = ({
  prestasiData,
  handleChange,
  handleSubmit,
  handleCancel,
  handleDateChange,
  handleFileChange,
  filesState,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
      <Box sx={{ borderRadius: 2, mt: 0 }}>
        <Grid container spacing={2} rowSpacing={1}>
          {/* NAMA PRESTASI */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nama_prestasi" sx={{ mt: 4 }}>
              Nama Prestasi
            </CustomFormLabel>
            <CustomOutlinedInput
              id="nama_prestasi"
              name="nama_prestasi"
              value={prestasiData.nama_prestasi || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <IconTrophy />
                </InputAdornment>
              }
              placeholder="Contoh: Juara 1 Lomba Sains Madrasah"
              fullWidth
              required
            />
          </Grid>

          {/* KATEGORI SIFAT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kategori_sifat" sx={{ mt: 4 }}>
              Kategori
            </CustomFormLabel>
            <CustomSelect
              id="kategori_sifat"
              name="kategori_sifat"
              value={prestasiData.kategori_sifat || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                Pilih Kategori Sifat
              </MenuItem>
              {kategoriSifatOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* KATEGORI BIDANG */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kategori_bidang" sx={{ mt: 1.85 }}>
              Bidang Prestasi
            </CustomFormLabel>
            <CustomSelect
              id="kategori_bidang"
              name="kategori_bidang"
              value={prestasiData.kategori_bidang || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                Pilih Bidang Prestasi
              </MenuItem>
              {kategoriBidangOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* TINGKAT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tingkat" sx={{ mt: 1.85 }}>
              Tingkat
            </CustomFormLabel>
            <CustomSelect
              id="tingkat"
              name="tingkat"
              value={prestasiData.tingkat || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                Pilih Tingkat
              </MenuItem>
              {tingkatOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* PERINGKAT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="peringkat" sx={{ mt: 1.85 }}>
              Peringkat
            </CustomFormLabel>
            <CustomSelect
              id="peringkat"
              name="peringkat"
              value={prestasiData.peringkat || ""}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="" disabled>
                Pilih Peringkat
              </MenuItem>
              {peringkatOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* PENYELENGGARA */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="penyelenggara" sx={{ mt: 1.85 }}>
              Penyelenggara
            </CustomFormLabel>
            <CustomOutlinedInput
              id="penyelenggara"
              name="penyelenggara"
              value={prestasiData.penyelenggara || ""}
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

          {/* TANGGAL PENCAPAIAN */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tanggal_pencapaian" sx={{ mt: 1.85 }}>
              Tanggal Pencapaian
            </CustomFormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={prestasiData.tanggal_pencapaian || null}
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

          {/* LOKASI */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="lokasi" sx={{ mt: 1.85 }}>
              Lokasi (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="lokasi"
              name="lokasi"
              value={prestasiData.lokasi || ""}
              onChange={handleChange}
              placeholder="Contoh: Jakarta, Bandung, Online, dll."
              fullWidth
            />
          </Grid>

          {/* LINK BERITA */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="link_berita" sx={{ mt: 1.85 }}>
              Link Berita (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="link_berita"
              name="link_berita"
              value={prestasiData.link_berita || ""}
              onChange={handleChange}
              placeholder="Masukkan URL berita resmi jika ada"
              fullWidth
            />
          </Grid>

          {/* DESKRIPSI */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
              Deskripsi (Opsional)
            </CustomFormLabel>
            <CustomTextField
              id="deskripsi"
              name="deskripsi"
              value={prestasiData.deskripsi || ""}
              onChange={handleChange}
              multiline
              minRows={3}
              fullWidth
              placeholder="Tuliskan ringkasan prestasi, detail lomba, atau catatan penting lainnya."
            />
          </Grid>

          {/* BUKTI SERTIFIKAT (PDF) */}
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
              {prestasiData.bukti_sertifikat_url && (
                <Typography variant="body2">
                  File saat ini:{" "}
                  <a
                    href={prestasiData.bukti_sertifikat_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat Sertifikat
                  </a>
                </Typography>
              )}
              {filesState.bukti_sertifikat && (
                <Typography variant="body2">
                  File baru: {filesState.bukti_sertifikat.name}
                </Typography>
              )}
              <CustomOutlinedInput
                id="bukti_sertifikat"
                name="bukti_sertifikat"
                type="file"
                inputProps={{ accept: "application/pdf" }}
                onChange={(e) => {
                  const file = e.target.files[0] || null;
                  handleFileChange("bukti_sertifikat", file);
                }}
                fullWidth
              />
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                Hanya file PDF, maksimal 1MB.
              </Typography>
            </Box>
          </Grid>

          {/* FOTO KEGIATAN (IMAGE) */}
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
              {prestasiData.foto_kegiatan_url && !filesState.foto_kegiatan && (
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
                    src={prestasiData.foto_kegiatan_url}
                    alt="Foto Kegiatan"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
              {filesState.foto_kegiatan && (
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
                    src={URL.createObjectURL(filesState.foto_kegiatan)}
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
                onChange={(e) => {
                  const file = e.target.files[0] || null;
                  handleFileChange("foto_kegiatan", file);
                }}
                fullWidth
              />
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                Format gambar (PNG/JPG/WEBP), maksimal 2MB.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
        <SubmitButton type="submit" isLoading={isLoading}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

PrestasiMadrasahEditForm.propTypes = {
  prestasiData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  filesState: PropTypes.shape({
    bukti_sertifikat: PropTypes.any,
    foto_kegiatan: PropTypes.any,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default PrestasiMadrasahEditForm;
