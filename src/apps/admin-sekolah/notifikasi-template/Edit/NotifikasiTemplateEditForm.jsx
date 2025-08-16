import Grid from "@mui/material/Grid";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconMessageChatbot, IconEye } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const NotifikasiTemplateEditForm = ({ setSuccess, setError, templateId: templateIdProp }) => {
  const navigate = useNavigate();
  const params = useParams();
  const templateId = templateIdProp ?? params.id;

  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    key: "",
    title: "",
    body_short: "",
    body_long: "",
    enabled: true,
    locale: "id",
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const { data: catalog = [], isError: catalogError } = useQuery({
    queryKey: ["templateCatalog"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin-sekolah/notification-template/catalog");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const {
    isFetching: isFetchingTpl,
    isError: isTplError,
    error: tplError,
  } = useQuery({
    queryKey: ["notificationTemplateDetail", templateId],
    enabled: !!templateId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/admin-sekolah/notification-template/${templateId}`);
      return res.data?.data || null;
    },
    onSuccess: (tpl) => {
      if (!tpl) return;
      setFormState({
        key: tpl.key || "",
        title: tpl.title || "",
        body_short: tpl.body_short || "",
        body_long: tpl.body_long || "",
        enabled: typeof tpl.enabled === "boolean" ? tpl.enabled : true,
        locale: tpl.locale || "id",
      });
    },
  });
  
  const keyOptions = useMemo(
    () =>
      catalog.map((c) => ({
        value: c.key,
        label: `${c.key} • ${c.business_category || "-"} (${c.type})`,
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

  // === Mutations ===
  const mutation = useMutation({
    mutationKey: ["updateNotificationTemplate", templateId],
    mutationFn: async (payload) => {
      setLoading(true);
      const res = await axiosInstance.put(`/api/v1/admin-sekolah/notification-template/${templateId}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg || "Template notifikasi berhasil diperbarui");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/notifikasi-template"), 1500);
    },
    onError: (error) => {
      const details = error.response?.data?.errors || [];
      const msg = error.response?.data?.msg || "Terjadi kesalahan saat memperbarui template notifikasi";
      setError(details.length ? details.join(", ") : msg);
      setSuccess("");
    },
    onSettled: () => {
      setTimeout(() => setLoading(false), 300);
    },
  });

  // === Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  };

  const handleToggleEnabled = (e) => {
    setFormState((s) => ({ ...s, enabled: e.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formState.title?.trim()) return setError("Judul (title) wajib diisi");
    if (!formState.body_short?.trim()) return setError("Body Pendek (body_short) wajib diisi");

    const payload = {
      title: formState.title,
      body_short: formState.body_short,
      body_long: formState.body_long || null,
      enabled: formState.enabled,
      locale: formState.locale || null,
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => navigate(-1);

  const openPreview = async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewData(null);

    if (!formState.key) {
      setPreviewLoading(false);
      setPreviewError("Key template tidak tersedia");
      return;
    }

    try {
      const variables = Object.fromEntries(
        (selectedPlaceholders || []).map((p) => [p, `{${p}}`])
      );

      const res = await axiosInstance.post(
        "/api/v1/admin-sekolah/notification-template/preview",
        { templateKey: formState.key, variables }
      );

      setPreviewData(res.data);
    } catch (err) {
      const msg = err.response?.data?.msg || "Gagal melakukan preview template";
      setPreviewError(msg);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (catalogError) setError("Gagal memuat katalog template");
    if (isTplError) setError(tplError?.message || "Gagal memuat detail template");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogError, isTplError]);

  const disabledAll = loading || isFetchingTpl;

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4, opacity: disabledAll ? 0.7 : 1 }}>
        <Grid container spacing={2} rowSpacing={1}>
          {/* KEY (read-only) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="key" sx={{ mt: 1.85 }}>
              Key Template (tidak dapat diubah)
            </CustomFormLabel>
            <CustomSelect
              id="key"
              name="key"
              value={formState.key}
              onChange={() => {}}
              fullWidth
              disabled
            >
              {formState.key ? (
                <MenuItem value={formState.key}>
                  {selectedCatalogItem?.label || formState.key}
                </MenuItem>
              ) : (
                <MenuItem value="">Memuat...</MenuItem>
              )}
            </CustomSelect>

            {/* Helper placeholder */}
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

          {/* LOCALE */}
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
              disabled={disabledAll}
            >
              <MenuItem value="">Pilih Locale</MenuItem>
              {localeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          {/* TITLE */}
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
              disabled={disabledAll}
            />
          </Grid>

          {/* BODY SHORT */}
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
              disabled={disabledAll}
            />
          </Grid>

          {/* BODY LONG */}
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
              disabled={disabledAll}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formState.enabled}
                  onChange={handleToggleEnabled}
                  disabled={disabledAll}
                />
              }
              label="Aktifkan template"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 2 }}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<IconEye size={18} />}
            onClick={openPreview}
            disabled={!formState.key || disabledAll}
          >
            Preview
          </Button>
            <SubmitButton isLoading={loading || isFetchingTpl} disabled={disabledAll}>
              Simpan 
            </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preview Template</DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <Typography>Memuat preview…</Typography>
          ) : previewError ? (
            <Typography color="error">{previewError}</Typography>
          ) : previewData ? (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="subtitle2">Title</Typography>
              <Typography sx={{ mb: 1 }}>{previewData.payload?.notification?.title || '-'}</Typography>
              <Typography variant="subtitle2">Body</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{previewData.payload?.notification?.body || '-'}</Typography>
              {Array.isArray(previewData.missingVariables) && previewData.missingVariables.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="warning.main">Variabel belum terisi:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {previewData.missingVariables.map((v) => (
                      <Chip key={v} size="small" label={v} color="warning" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>Tidak ada data preview</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotifikasiTemplateEditForm ;
