import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tooltip,
  IconButton,
  Typography,
  InputAdornment,
  MenuItem
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconInfoCircle, IconUsers, IconChecklist } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const TambahPpdbPanitiaForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: "",
    user_id: "",
    is_active: "true",
  });

  const [fieldErrors, setFieldErrors] = useState({
    ppdb_period_id: "",
    user_id: "",
    is_active: "",
  });

  const clearGlobalAlert = () => {
    setError("");
    setSuccess("");
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setFieldError = (name, message) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const resetAllFieldErrors = () => {
    setFieldErrors({
      ppdb_period_id: "",
      user_id: "",
      is_active: "",
    });
  };

  const {
    data: periodOptions = [],
    isError: periodError,
    isLoading: periodLoading,
  } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    refetchOnWindowFocus: false,
  });

  const {
    data: userOptions = [],
    isError: userError,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["ppdbPanitiaUserOptions", formState.ppdb_period_id],
    queryFn: async () => {
      const params = {};

      if (formState.ppdb_period_id) {
        params.ppdb_period_id = formState.ppdb_period_id;
        params.include_assigned = "false";
      }

      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-panitia", {
        params,
      });

      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    refetchOnWindowFocus: false,
  });

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!String(formState.user_id || "").trim()) return false;
    if (!["true", "false"].includes(String(formState.is_active))) return false;
    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahPpdbPanitia"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-panitia", payload);
      return response.data;
    },
    onSuccess: (data) => {
      resetAllFieldErrors();
      setSuccess(data?.msg || "Petugas PMB berhasil ditambahkan");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-panitia"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg || "Terjadi kesalahan saat menambahkan petugas PMB";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }

      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    clearGlobalAlert();
    clearFieldError(name);

    if (name === "ppdb_period_id") {
      setFormState((prevState) => ({
        ...prevState,
        ppdb_period_id: value,
        user_id: "",
      }));

      clearFieldError("user_id");
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateGuard = () => {
    let ok = true;

    if (!formState.ppdb_period_id) {
      ok = false;
      setFieldError("ppdb_period_id", "PPDB Period wajib dipilih");
    }

    if (!String(formState.user_id || "").trim()) {
      ok = false;
      setFieldError("user_id", "User panitia wajib dipilih");
    }

    if (!["true", "false"].includes(String(formState.is_active))) {
      ok = false;
      setFieldError("is_active", "Status aktif tidak valid");
    }

    if (!ok) {
      setSuccess("");
      setError("Mohon lengkapi data yang wajib diisi");
    }

    return ok;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    resetAllFieldErrors();
    clearGlobalAlert();

    if (!validateGuard()) return;

    setLoading(true);

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      user_id: Number(formState.user_id),
      is_active: String(formState.is_active) === "true",
    };

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (periodError || userError) {
    return <div>Error Loading Data...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
            PMB Period
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_period_id"
            name="ppdb_period_id"
            value={formState.ppdb_period_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            error={Boolean(fieldErrors.ppdb_period_id)}
            inputProps={{ "aria-label": "Pilih PPDB Period" }}
            startAdornment={
              <InputAdornment position="start">
                <IconChecklist />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              {periodLoading ? "Memuat PMB Period..." : "Pilih PMB Period"}
            </MenuItem>

            {periodOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p?.nama ? `${p.nama} (${p?.status || "-"})` : "-"}
              </MenuItem>
            ))}
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.ppdb_period_id ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.ppdb_period_id || " "}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="user_id" sx={{ mt: 1.85 }}>
            Petugas PMB
          </CustomFormLabel>
          <CustomSelect
            id="user_id"
            name="user_id"
            value={formState.user_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            error={Boolean(fieldErrors.user_id)}
            inputProps={{ "aria-label": "Pilih Petugas PMB" }}
            startAdornment={
              <InputAdornment position="start">
                <IconUsers />
              </InputAdornment>
            }
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              PaperProps: {
                style: {
                  maxHeight: 300,
                  overflowY: "auto",
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              {userLoading ? "Memuat user..." : "Pilih Petugas PMB"}
            </MenuItem>

            {userOptions.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {(u?.name || "-")} ({u?.email || "-"})
              </MenuItem>
            ))}
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.user_id ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.user_id || " "}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>
          <CustomSelect
            id="is_active"
            name="is_active"
            value={formState.is_active}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            error={Boolean(fieldErrors.is_active)}
            inputProps={{ "aria-label": "Pilih Status Aktif" }}
          >
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Nonaktif</MenuItem>
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.is_active ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.is_active || " "}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.85 }}>
            <CustomFormLabel sx={{ m: 0 }}>Catatan</CustomFormLabel>
            <Tooltip
              title="Panitia akan terikat pada PPDB Period. Jika user sudah pernah jadi panitia di period yang sama, sistem akan re-activate."
              placement="top"
            >
              <IconButton size="small">
                <IconInfoCircle size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
            Panitia terikat pada PMB Period
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel} disabled={loading || mutation.isLoading}>
          Batal
        </CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbPanitiaForm;