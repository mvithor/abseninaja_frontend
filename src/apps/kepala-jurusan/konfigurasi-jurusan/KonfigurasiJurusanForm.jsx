import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Box, InputAdornment, Typography } from "@mui/material";
import { IconAdjustments, IconTargetArrow, IconMoodSmile, IconAlertTriangle } from "@tabler/icons-react";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";


const CONFIG_ENDPOINT = "/api/v1/kepala-jurusan/konfigurasi-jurusan";
const SKKNI_UNIT_ENDPOINT = "/api/v1/kepala-jurusan/skkni-unit";

const fetchKonfigurasi = async () => {
  const res = await axiosInstance.get(CONFIG_ENDPOINT);
  return res.data?.data ?? null;
};

const fetchJumlahUnitAktif = async () => {
  const res = await axiosInstance.get(SKKNI_UNIT_ENDPOINT);
  const list = Array.isArray(res.data?.data) ? res.data.data : [];
  return list.filter((u) => u.is_aktif !== false).length;
};

const KonfigurasiJurusanForm = ({ setSuccess, setError }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    total_unit_jurusan: "",
    ambang_competency_baik: "",
    ambang_behavior_baik: "",
    ambang_peringatan: "",
  });

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["konfigurasi-jurusan"],
    queryFn: fetchKonfigurasi,
    refetchOnWindowFocus: false,
  });

  // Cuma buat referensi helper text — TIDAK dipakai memvalidasi/mengunci
  // input Total Unit Jurusan. Lihat catatan sebelum kode ini.
  const { data: jumlahUnitAktif } = useQuery({
    queryKey: ["skkni-unit-count"],
    queryFn: fetchJumlahUnitAktif,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setFormState({
        total_unit_jurusan: data.total_unit_jurusan ?? "",
        ambang_competency_baik: data.ambang_competency_baik ?? "",
        ambang_behavior_baik: data.ambang_behavior_baik ?? "",
        ambang_peringatan: data.ambang_peringatan ?? "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.put(CONFIG_ENDPOINT, payload);
      return res.data;
    },
    onSuccess: (res) => {
      setSuccess(res.msg);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["konfigurasi-jurusan"] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat menyimpan konfigurasi";
      setError(details.length > 0 ? details.join(", ") : msg);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({
      total_unit_jurusan: Number(formState.total_unit_jurusan),
      ambang_competency_baik: Number(formState.ambang_competency_baik),
      ambang_behavior_baik: Number(formState.ambang_behavior_baik),
      ambang_peringatan: formState.ambang_peringatan === "" ? null : Number(formState.ambang_peringatan),
    });
  };

  if (isLoading) {
    return <Typography variant="body2" color="text.secondary">Memuat konfigurasi...</Typography>;
  }

  if (isError) {
    return (
      <Typography variant="body2" color="error">
        {queryError?.message || "Gagal memuat konfigurasi jurusan"}
      </Typography>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -2 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="total_unit_jurusan" sx={{ mt: 1.85 }}>
            Total Unit Jurusan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="total_unit_jurusan"
            name="total_unit_jurusan"
            type="number"
            value={formState.total_unit_jurusan}
            onChange={handleChange}
            placeholder="Contoh: 10"
            startAdornment={
              <InputAdornment position="start">
                <IconAdjustments size={20} />
              </InputAdornment>
            }
            inputProps={{ min: 1, step: 1 }}
            fullWidth
            required
          />
          {typeof jumlahUnitAktif === "number" && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Saat ini ada {jumlahUnitAktif} unit SKKNI aktif untuk jurusan ini — bukan patokan mutlak,
              tapi jadikan referensi supaya angka di atas tidak asal diketik.
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ambang_competency_baik" sx={{ mt: 1.85 }}>
            Ambang Competency Baik
          </CustomFormLabel>
          <CustomOutlinedInput
            id="ambang_competency_baik"
            name="ambang_competency_baik"
            type="number"
            value={formState.ambang_competency_baik}
            onChange={handleChange}
            placeholder="0-100"
            startAdornment={
              <InputAdornment position="start">
                <IconTargetArrow size={20} />
              </InputAdornment>
            }
            inputProps={{ min: 0, max: 100, step: 1 }}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ambang_behavior_baik" sx={{ mt: 1.85 }}>
            Ambang Behavior Baik
          </CustomFormLabel>
          <CustomOutlinedInput
            id="ambang_behavior_baik"
            name="ambang_behavior_baik"
            type="number"
            value={formState.ambang_behavior_baik}
            onChange={handleChange}
            placeholder="0-100"
            startAdornment={
              <InputAdornment position="start">
                <IconMoodSmile size={20} />
              </InputAdornment>
            }
            inputProps={{ min: 0, max: 100, step: 1 }}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ambang_peringatan" sx={{ mt: 1.85 }}>
            Ambang Peringatan (opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="ambang_peringatan"
            name="ambang_peringatan"
            type="number"
            value={formState.ambang_peringatan}
            onChange={handleChange}
            placeholder="Kosongkan jika belum perlu"
            startAdornment={
              <InputAdornment position="start">
                <IconAlertTriangle size={20} />
              </InputAdornment>
            }
            inputProps={{ min: 0, max: 100, step: 1 }}
            fullWidth
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Untuk fitur pencocokan mitra industri lanjutan, belum aktif saat ini.
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton type="submit" isLoading={mutation.isPending}>
          Simpan
        </SubmitButton>
      </Box>
    </Box>
  );
};

export default KonfigurasiJurusanForm;