import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  InputAdornment,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import {
  IconBuilding,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUsers,
  IconCopy,
} from "@tabler/icons-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const formatDateToYYYYMMDD = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const TambahMitraIndustriForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    nama_industri: "",
    nama_kontak: "",
    telepon_kontak: "",
    email_kontak: "",
    alamat_industri: "",
    kapasitas_per_periode: "",
    tanggal_mulai_kemitraan: null,
    kemauan_membimbing_teknis: "",
  });
  const [selectedSkkni, setSelectedSkkni] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);

  const { data: skkniOptions = [], isLoading: isSkkniLoading } = useQuery({
    queryKey: ["skkni-unit-options"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/kepala-jurusan/skkni-unit");
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
  });

  const mutation = useMutation({
    mutationKey: ["tambahMitraIndustri"],
    mutationFn: async (newIndustri) => {
      const payload = {
        nama_industri: String(newIndustri.nama_industri || "").trim(),
        kapasitas_per_periode: Number(newIndustri.kapasitas_per_periode),
        tanggal_mulai_kemitraan: formatDateToYYYYMMDD(newIndustri.tanggal_mulai_kemitraan),
        kemauan_membimbing_teknis: newIndustri.kemauan_membimbing_teknis,
        nama_kontak: String(newIndustri.nama_kontak || "").trim(),
        telepon_kontak: String(newIndustri.telepon_kontak || "").trim(),
        email_kontak: newIndustri.email_kontak ? String(newIndustri.email_kontak).trim() : null,
        alamat_industri: String(newIndustri.alamat_industri || "").trim(),
        latitude: null,
        longitude: null,
        google_place_id: null,
        skkni_unit_ids: selectedSkkni.map((u) => u.id),
      };
      const response = await axiosInstance.post("/api/v1/kepala-jurusan/mitra-industri", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["mitra-industri-list"] });
      setAccountInfo({
        namaIndustri: data.data?.nama_industri,
        ...data.akun_admin_industri,
      });
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan mitra industri";
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setSuccess("");
      setTimeout(() => setError(""), 4000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormState((prevState) => ({ ...prevState, tanggal_mulai_kemitraan: date }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formState);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCopy = (text) => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleCloseDialog = () => {
    setAccountInfo(null);
    navigate("/dashboard/kepala-jurusan/mitra-industri");
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nama_industri" sx={{ mt: 1.85 }}>Nama Industri</CustomFormLabel>
            <CustomOutlinedInput
              id="nama_industri"
              name="nama_industri"
              value={formState.nama_industri}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconBuilding /></InputAdornment>}
              fullWidth
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kapasitas_per_periode" sx={{ mt: 1.85 }}>Kapasitas per Periode</CustomFormLabel>
            <CustomOutlinedInput
              id="kapasitas_per_periode"
              name="kapasitas_per_periode"
              type="number"
              value={formState.kapasitas_per_periode}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconUsers /></InputAdornment>}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nama_kontak" sx={{ mt: 1.85 }}>Nama Kontak</CustomFormLabel>
            <CustomOutlinedInput
              id="nama_kontak"
              name="nama_kontak"
              value={formState.nama_kontak}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
              fullWidth
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="telepon_kontak" sx={{ mt: 1.85 }}>Telepon Kontak</CustomFormLabel>
            <CustomOutlinedInput
              id="telepon_kontak"
              name="telepon_kontak"
              value={formState.telepon_kontak}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
              fullWidth
              required
              inputProps={{ maxLength: 15 }}
              placeholder="081234567890"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="email_kontak" sx={{ mt: 1.85 }}>Email Kontak (Opsional)</CustomFormLabel>
            <CustomOutlinedInput
              id="email_kontak"
              name="email_kontak"
              type="email"
              value={formState.email_kontak}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tanggal_mulai_kemitraan" sx={{ mt: 1.85 }}>Tanggal Mulai Kemitraan</CustomFormLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={formState.tanggal_mulai_kemitraan}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      sx: { height: "46px", paddingHorizontal: 0 },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kemauan_membimbing_teknis" sx={{ mt: 1.85 }}>Kemauan Membimbing Teknis</CustomFormLabel>
            <CustomSelect
              id="kemauan_membimbing_teknis"
              name="kemauan_membimbing_teknis"
              value={formState.kemauan_membimbing_teknis}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
            >
              <MenuItem value="" disabled>Pilih</MenuItem>
              <MenuItem value={true}>Ya</MenuItem>
              <MenuItem value={false}>Tidak</MenuItem>
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <CustomFormLabel htmlFor="alamat_industri" sx={{ mt: 1.85 }}>Alamat Industri</CustomFormLabel>
            <CustomOutlinedInput
              id="alamat_industri"
              name="alamat_industri"
              value={formState.alamat_industri}
              onChange={handleChange}
              startAdornment={<InputAdornment position="start"><IconMapPin /></InputAdornment>}
              fullWidth
              required
              multiline
              minRows={2}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <CustomFormLabel htmlFor="skkni_unit_ids" sx={{ mt: 1.85 }}>
              Unit SKKNI yang Dilatih (Opsional)
            </CustomFormLabel>
            <Autocomplete
              multiple
              disableCloseOnSelect
              id="skkni_unit_ids"
              options={skkniOptions}
              loading={isSkkniLoading}
              getOptionLabel={(opt) => `${opt?.kode_unit || ""} — ${opt?.judul_unit || ""}`}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              value={selectedSkkni}
              onChange={(_, value) => setSelectedSkkni(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={isSkkniLoading ? "Memuat unit SKKNI..." : "Pilih satu atau lebih unit"}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
          <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>

      <Dialog open={Boolean(accountInfo)} onClose={undefined} fullWidth maxWidth="sm" disableEscapeKeyDown>
        <DialogTitle>Mitra Industri Berhasil Didaftarkan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>{accountInfo?.namaIndustri}</strong> berhasil didaftarkan.
          </DialogContentText>

          {accountInfo?.akun_baru ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Akun Admin Mitra Industri baru telah dibuat. Teruskan informasi berikut
                ke kontak industri secara manual (WA, telepon, atau langsung) — info ini{" "}
                <strong>tidak akan ditampilkan lagi</strong> setelah dialog ini ditutup.
              </DialogContentText>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Email Login</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={accountInfo?.email_login} sx={{ fontFamily: "monospace" }} />
                  <IconButton size="small" onClick={() => handleCopy(accountInfo?.email_login)}>
                    <IconCopy size={16} />
                  </IconButton>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Link Aktivasi</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={accountInfo?.link_aktivasi} sx={{ fontFamily: "monospace", maxWidth: 320 }} />
                  <IconButton size="small" onClick={() => handleCopy(accountInfo?.link_aktivasi)}>
                    <IconCopy size={16} />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <DialogContentText>
              {accountInfo?.msg ||
                "Kontak ini sudah memiliki akun aktif dari mitra industri lain di sekolah ini — akun yang sama digunakan, tidak ada link aktivasi baru."}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Selesai
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TambahMitraIndustriForm;