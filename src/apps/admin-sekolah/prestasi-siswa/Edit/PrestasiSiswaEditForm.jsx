import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Typography
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { IconIdBadge2, IconUser } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";

const jenisPesertaOptions = [
  { value: "INDIVIDU", label: "Individu" },
  { value: "REGU", label: "Regu / Kelompok" }
];

const kategoriSifatOptions = [
  { value: "AKADEMIK", label: "Akademik" },
  { value: "NON_AKADEMIK", label: "Non Akademik" }
];

const kategoriBidangOptions = [
  { value: "SAINS", label: "Sains" },
  { value: "HUMANIORA", label: "Humaniora" },
  { value: "OLAHRAGA", label: "Olahraga" },
  { value: "SENI", label: "Seni" },
  { value: "KEAGAMAAN", label: "Keagamaan" },
  { value: "LINGKUNGAN", label: "Lingkungan" },
  { value: "TEKNOLOGI", label: "Teknologi" },
  { value: "LAINNYA", label: "Lainnya" }
];

const tingkatOptions = [
  { value: "SEKOLAH", label: "Sekolah" },
  { value: "KECAMATAN", label: "Kecamatan" },
  { value: "KABUPATEN", label: "Kabupaten" },
  { value: "KOTA", label: "Kota" },
  { value: "PROVINSI", label: "Provinsi" },
  { value: "NASIONAL", label: "Nasional" },
  { value: "INTERNASIONAL", label: "Internasional" }
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

const PrestasiSiswaEditForm = ({
  prestasiData,
  handleChange,
  handleSubmit,
  handleCancel,
  handleDateChange,
  handleFileChange,
  filesState,
  isLoading
}) => {
  const {
    data: siswaOptions = [],
    isLoading: isSiswaLoading,
    isError: isSiswaError
  } = useQuery({
    queryKey: ["siswaOptions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/siswa");
      return res.data.data;
    }
  });

  const {
    data: ekskulOptions = [],
    isLoading: isEkskulLoading,
    isError: isEkskulError
  } = useQuery({
    queryKey: ["ekskulOptions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ekskul");
      return res.data.data;
    }
  });

  const [selectedSiswa, setSelectedSiswa] = useState([]);

  useEffect(() => {
    if (!siswaOptions.length || !prestasiData?.siswa_ids) return;

    const preselected = siswaOptions.filter((s) =>
      (prestasiData.siswa_ids || []).includes(s.id)
    );
    setSelectedSiswa(preselected);
  }, [siswaOptions, prestasiData?.siswa_ids]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  if (isSiswaError || isEkskulError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <Typography color="error">Gagal memuat data dropdown</Typography>
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
                  <IconIdBadge2 />
                </InputAdornment>
              }
              fullWidth
              required
            />
          </Grid>

          {/* JENIS PESERTA */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="jenis_peserta" sx={{ mt: 4 }}>
              Jenis Peserta
            </CustomFormLabel>
            <CustomSelect
              id="jenis_peserta"
              name="jenis_peserta"
              value={prestasiData.jenis_peserta || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="" disabled>
                Pilih Jenis Peserta
              </MenuItem>
              {jenisPesertaOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* KATEGORI SIFAT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kategori_sifat" sx={{ mt: 1.85 }}>
              Kategori (Akademik / Non Akademik)
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
              Tingkat Lomba
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
              required
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
              startAdornment={
                <InputAdornment position="start">
                  <IconUser />
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

          {/* EKSKUL (OPSIONAL) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ekskul_id" sx={{ mt: 1.85 }}>
              Terkait Ekskul (Opsional)
            </CustomFormLabel>
            <CustomSelect
              id="ekskul_id"
              name="ekskul_id"
              value={prestasiData.ekskul_id || ""}
              onChange={handleChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="">
                Tidak terkait ekskul
              </MenuItem>
              {isEkskulLoading ? (
                <MenuItem value="" disabled>
                  Memuat...
                </MenuItem>
              ) : (
                ekskulOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.nama_ekskul}
                  </MenuItem>
                ))
              )}
            </CustomSelect>
          </Grid>

          {/* DESKRIPSI */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
              Deskripsi / Keterangan (Opsional)
            </CustomFormLabel>
            <CustomTextField
              id="deskripsi"
              name="deskripsi"
              value={prestasiData.deskripsi || ""}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>

          {/* MULTI SELECT SISWA (ANGGOTA) */}
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="siswa_ids" sx={{ mt: 1.85 }}>
              Anggota (Siswa)
            </CustomFormLabel>
            <Autocomplete
              multiple
              id="siswa_ids"
              options={siswaOptions}
              getOptionLabel={(option) =>
                option?.User?.name
                  ? `${option.User.name}${
                      option?.Kelas?.nama_kelas ? ` — ${option.Kelas.nama_kelas}` : ""
                    }`
                  : "-"
              }
              loading={isSiswaLoading}
              value={selectedSiswa}
              onChange={(event, newValue) => {
                setSelectedSiswa(newValue);
                const ids = newValue.map((opt) => opt.id);
                handleChange({
                  target: { name: "siswa_ids", value: ids }
                });
              }}
              limitTags={3}
              size="small"
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option?.User?.name || "-"}
                  {option?.Kelas?.nama_kelas ? ` — ${option.Kelas.nama_kelas}` : ""}
                </li>
              )}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  placeholder="Cari / pilih siswa"
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
            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
              • INDIVIDU: wajib 1 siswa &bull; REGU: minimal 2 siswa
            </Typography>
          </Grid>

          {/* BUKTI SERTIFIKAT (PDF) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="bukti_sertifikat" sx={{ mt: 1.85 }}>
              Bukti Sertifikat (PDF)
            </CustomFormLabel>
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1} mb={1}>
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
            <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1} mb={1}>
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

PrestasiSiswaEditForm.propTypes = {
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
  isLoading: PropTypes.bool.isRequired
};

export default PrestasiSiswaEditForm;
