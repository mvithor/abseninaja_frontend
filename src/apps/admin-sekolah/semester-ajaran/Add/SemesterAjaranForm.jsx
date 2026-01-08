import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
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

const fetchTahunAjaran = async () => {
  const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/tahun-ajaran");
  return response.data.data || [];
};

const SemesterAjaranForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    semester: "",
    tahun_ajaran_id: "",
    is_aktif: "true",
    is_locked: "false",
  });

  const [localError, setLocalError] = useState("");

  const { data: tahunRows = [], isLoading: loadingTahun } = useQuery({
    queryKey: ["tahun-ajaran-dropdown"],
    queryFn: fetchTahunAjaran,
    onError: (error) => {
      const msg = error?.response?.data?.msg || "Gagal memuat data tahun ajaran";
      setError(msg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    }
  });

  // BE dropdown sudah kirim yang "terbuka" saja → FE tidak perlu filter is_locked lagi
  const tahunOptions = useMemo(() => {
    return (tahunRows || []).map((x) => ({
      value: x.id,
      label: x.tahun_ajaran,
    }));
  }, [tahunRows]);

  useEffect(() => {
    // kalau opsi tahun ajaran berubah dan id yang dipilih sudah tidak valid, reset
    if (formState.tahun_ajaran_id && !tahunOptions.some((o) => o.value === formState.tahun_ajaran_id)) {
      setFormState((prev) => ({ ...prev, tahun_ajaran_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahunOptions]);

  const mutation = useMutation({
    mutationKey: ["tambahSemester"],
    mutationFn: async (newSemester) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/semester-ajaran", newSemester);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setLocalError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/semester-ajaran"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data semester ajaran";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess("");
      setLocalError("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => {
      setTimeout(() => {
        setError("");
        setSuccess("");
        setLocalError("");
      }, 3000);
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Guard: tidak boleh aktif + terkunci
    if (name === "is_aktif") {
      setFormState((prevState) => ({
        ...prevState,
        is_aktif: value,
        is_locked: value === "true" ? "false" : prevState.is_locked,
      }));
      return;
    }

    if (name === "is_locked") {
      setFormState((prevState) => ({
        ...prevState,
        is_locked: value,
        is_aktif: value === "true" ? "false" : prevState.is_aktif,
      }));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.tahun_ajaran_id) {
      setLocalError("Tahun ajaran wajib dipilih");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    if (!formState.semester) {
      setLocalError("Semester wajib dipilih");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    if (formState.is_aktif === "true" && formState.is_locked === "true") {
      setLocalError("Semester aktif tidak boleh dalam kondisi terkunci");
      setTimeout(() => setLocalError(""), 3000);
      return;
    }

    const payload = {
      tahun_ajaran_id: formState.tahun_ajaran_id,
      semester: formState.semester,
      is_aktif: formState.is_aktif === "true",
      is_locked: formState.is_locked === "true",
    };

    mutation.mutate(payload);
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
          <CustomFormLabel htmlFor="tahun_ajaran_id" sx={{ mt: 1.85 }}>Tahun Ajaran</CustomFormLabel>
          <CustomSelect
            id="tahun_ajaran_id"
            name="tahun_ajaran_id"
            value={formState.tahun_ajaran_id}
            onChange={handleChange}
            fullWidth
            required
            disabled={loadingTahun}
          >
            <MenuItem value="">
              {loadingTahun ? "Memuat tahun ajaran..." : "Pilih Tahun Ajaran (Terbuka)"}
            </MenuItem>

            {tahunOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </CustomSelect>

          {!!localError && (
            <Typography variant="caption" color="error">
              {localError}
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
