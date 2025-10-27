import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  Chip,
  Stack,
  MenuItem,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconMessageChatbot } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const TambahTemplateNotifikasiForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    key: "",      
    title: "",
    body_short: "",
    body_long: "",
    enabled: true,      
    locale: "id",
  });

  const { data: catalog = [], isError: catalogError } = useQuery({
    queryKey: ["templateCatalog"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/notification-template/catalog");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  // Dropdown options
  const keyOptions = useMemo(
    () =>
      catalog.map((c) => ({
        value: c.key,
        label: `${c.key} • ${c.business_category || '-' } (${c.type})`,
        type: c.type,
        business_category: c.business_category || null,
        placeholders: c.placeholders || [],
      })),
    [catalog]
  );
  const localeOptions = [
    { value: "id", label: "Indonesia (id)" },
    { value: "en", label: "English (en)" },
  ];

  const selectedCatalogItem = keyOptions.find((o) => o.value === formState.key);
  const selectedPlaceholders = selectedCatalogItem?.placeholders || [];

  const mutation = useMutation({
    mutationKey: ["tambahNotificationTemplate"],
    mutationFn: async (payload) => {
      setLoading(true);
      const res = await axiosInstance.post("/api/v1/admin-sekolah/notification-template", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg || "Template notifikasi berhasil dibuat");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/notifikasi-template"), 2000);
    },
    onError: (error) => {
      const details = error.response?.data?.errors || [];
      const msg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan template notifikasi";
      setError(details.length ? details.join(", ") : msg);
      setSuccess("");
    },
    onSettled: () => {
      setTimeout(() => setLoading(false), 300);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formState.key) return setError("Pilih Key template terlebih dahulu");
    if (!formState.title?.trim()) return setError("Judul (title) wajib diisi");
    if (!formState.body_short?.trim()) return setError("Body Pendek (body_short) wajib diisi");

    const payload = {
      key: formState.key,
      title: formState.title,
      body_short: formState.body_short,
      body_long: formState.body_long || null,
      enabled: formState.enabled,
      locale: formState.locale || null,
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => navigate(-1);

  useEffect(() => {
    if (catalogError) setError("Gagal memuat katalog template");
  }, [catalogError, setError]);

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="key" sx={{ mt: 1.85 }}>
              Pilih Key Template
            </CustomFormLabel>
            <CustomSelect
              id="key"
              name="key"
              value={formState.key}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="">Pilih Key</MenuItem>
              {keyOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
            {formState.key && (
              <Box sx={{ mt: 1 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Placeholder tersedia</CustomFormLabel>
                {selectedPlaceholders.length ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedPlaceholders.map((ph) => (
                      <Chip key={ph} size="small" label={`{{${ph}}}`} />
                    ))}
                  </Stack>
                ) : (
                  <Chip size="small" label="Tidak ada placeholder" variant="outlined" />
                )}
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="locale" sx={{ mt: 1.85 }}>
              Locale (opsional)
            </CustomFormLabel>
            <CustomSelect
              id="locale"
              name="locale"
              value={formState.locale}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Pilih Locale</MenuItem>
              {localeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>
              Judul
            </CustomFormLabel>
            <CustomOutlinedInput
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Contoh: Status Perizinan"
              startAdornment={
                <InputAdornment position="start">
                  <IconMessageChatbot />
                </InputAdornment>
              }
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="body_short" sx={{ mt: 1.85 }}>
              Body Pendek
            </CustomFormLabel>
            <CustomTextField
              id="body_short"
              name="body_short"
              value={formState.body_short}
              onChange={handleChange}
              placeholder='Contoh: Pengajuan izin kamu: {{status}}.'
              multiline
              minRows={2}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CustomFormLabel htmlFor="body_long" sx={{ mt: 1.85 }}>
              Body Panjang opsional
            </CustomFormLabel>
            <CustomTextField
              id="body_long"
              name="body_long"
              value={formState.body_long}
              onChange={handleChange}
              placeholder='Contoh: Status perizinan: {{status}}. {{catatan_admin}}'
              multiline
              minRows={3}
              fullWidth
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 2 }}>
          <SubmitButton isLoading={loading}>Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default TambahTemplateNotifikasiForm;
