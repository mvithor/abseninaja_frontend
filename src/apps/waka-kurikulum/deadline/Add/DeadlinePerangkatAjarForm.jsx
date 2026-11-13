import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment, MenuItem } from "@mui/material";
import { IconClock, IconNotes } from "@tabler/icons-react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useSemesterTerpilih, labelSemester } from "src/components/perangkat-ajar/useSemesterTerpilih";
import { useJenisPerangkat } from "src/components/perangkat-ajar/useJenisPerangkat";
import { formatTanggalYMD, isKonflik, pesanGalat, WAKA_API } from "src/components/perangkat-ajar/perangkatAjarConfig";
import axiosInstance from "src/utils/axiosInstance";

const DeadlinePerangkatAjarForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    options: semesterOptions,
    semesterId: semesterDariUrl,
    isArsip: semesterDariUrlArsip,
    isLoading: isSemesterLoading,
  } = useSemesterTerpilih(WAKA_API);
  const { data: jenisList = [], isLoading: isJenisLoading } = useJenisPerangkat(WAKA_API);

  const [formState, setFormState] = useState({
    semester_ajaran_id: "",
    jenis: "",
    tanggal_deadline: null,
    jam_deadline: "23:59",
    keterangan: "",
  });

  // Default: semester dari ?semester= (dibawa dari halaman daftar), lalu semester aktif.
  // Semester arsip tidak bisa diberi deadline (server menjawab 409), jadi jatuh ke semester aktif.
  const semesterDefault = semesterDariUrlArsip ? semesterOptions.find((s) => s.is_aktif)?.id : semesterDariUrl;
  const semesterTerpilih = formState.semester_ajaran_id || semesterDefault || "";

  // Satu jenis hanya boleh satu deadline per semester: jenis yang sudah punya deadline dinonaktifkan.
  const { data: deadlineSemester = [] } = useQuery({
    queryKey: ["waka-deadline-list", semesterTerpilih],
    queryFn: async () => {
      const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/deadline`, {
        params: { semester_ajaran_id: semesterTerpilih },
      });
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    enabled: !!semesterTerpilih,
    refetchOnWindowFocus: false,
  });
  const jenisSudahAda = new Set(deadlineSemester.map((d) => d.jenis?.kode));
  const jenisTerpilih = jenisSudahAda.has(formState.jenis) ? "" : formState.jenis;

  const mutation = useMutation({
    mutationKey: ["tambahDeadlinePerangkatAjar"],
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`${WAKA_API}/perangkat-ajar/deadline`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || "Deadline berhasil ditambahkan");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["waka-deadline-list"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-list"] });
      queryClient.invalidateQueries({ queryKey: ["waka-perangkat-guru-detail"] });
      setTimeout(() => {
        navigate(`/dashboard/waka-kurikulum/deadline?semester=${semesterTerpilih}`);
      }, 1500);
    },
    onError: (error) => {
      if (isKonflik(error)) queryClient.invalidateQueries({ queryKey: ["waka-deadline-list"] });
      setError(pesanGalat(error, "Terjadi kesalahan saat menambahkan deadline"));
      setSuccess("");
      setTimeout(() => setError(""), 4000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const tanggal = formatTanggalYMD(formState.tanggal_deadline);
    if (!semesterTerpilih || !jenisTerpilih || !tanggal || !formState.jam_deadline) {
      setError("Lengkapi semester, jenis perangkat ajar, tanggal, dan jam deadline.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    mutation.mutate({
      semester_ajaran_id: semesterTerpilih,
      jenis: jenisTerpilih,
      tanggal_deadline: tanggal,
      jam_deadline: formState.jam_deadline,
      keterangan: formState.keterangan.trim(),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="semester_ajaran_id" sx={{ mt: 1.85 }}>Semester Ajaran</CustomFormLabel>
          <CustomSelect
            id="semester_ajaran_id"
            name="semester_ajaran_id"
            value={semesterTerpilih}
            onChange={(e) => setFormState((prev) => ({ ...prev, semester_ajaran_id: e.target.value, jenis: "" }))}
            fullWidth
            required
            displayEmpty
            disabled={isSemesterLoading}
          >
            <MenuItem value="" disabled>{isSemesterLoading ? "Memuat semester..." : "Pilih Semester"}</MenuItem>
            {semesterOptions.map((s) => (
              <MenuItem key={s.id} value={s.id} disabled={!s.is_aktif}>
                {labelSemester(s)}{s.is_aktif ? " (Aktif)" : " (Arsip)"}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jenis" sx={{ mt: 1.85 }}>Jenis Perangkat Ajar</CustomFormLabel>
          <CustomSelect
            id="jenis"
            name="jenis"
            value={jenisTerpilih}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={isJenisLoading}
          >
            <MenuItem value="" disabled>{isJenisLoading ? "Memuat jenis..." : "Pilih Jenis"}</MenuItem>
            {jenisList.map((j) => (
              <MenuItem key={j.kode} value={j.kode} disabled={jenisSudahAda.has(j.kode)}>
                {j.label}{jenisSudahAda.has(j.kode) ? " (sudah ada deadline)" : ""}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tanggal_deadline" sx={{ mt: 1.85 }}>Tanggal Deadline</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={formState.tanggal_deadline}
              onChange={(date) => setFormState((prev) => ({ ...prev, tanggal_deadline: date }))}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  InputProps: { sx: { height: "46px" } },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jam_deadline" sx={{ mt: 1.85 }}>Jam Deadline (waktu sekolah)</CustomFormLabel>
          <CustomOutlinedInput
            id="jam_deadline"
            name="jam_deadline"
            type="time"
            value={formState.jam_deadline}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="keterangan" sx={{ mt: 1.85 }}>Keterangan (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            id="keterangan"
            name="keterangan"
            value={formState.keterangan}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconNotes /></InputAdornment>}
            fullWidth
            multiline
            minRows={2}
            inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default DeadlinePerangkatAjarForm;
