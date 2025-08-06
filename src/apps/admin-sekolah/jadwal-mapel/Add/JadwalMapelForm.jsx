import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, Typography, Button } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const JadwalMapelForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedClass, setSelectedClass] = useState("");
  const [formState, setFormState] = useState({});

  const fetchData = async (url) => (await axiosInstance.get(url)).data.data;

  const { data: kelasOptions = [] } = useQuery({
    queryKey: ["kelasOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/kelas"),
  });

  const { data: waktuOptions = [] } = useQuery({
    queryKey: ["waktuOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/waktu"),
  });

  const { data: mapelOptions = [] } = useQuery({
    queryKey: ["mapelOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/mapel"),
  });

  const { data: guruOptions = [] } = useQuery({
    queryKey: ["guruOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/guru-mapel"),
  });

  const { data: hariAktif = [] } = useQuery({
    queryKey: ["hariAktif", selectedClass],
    enabled: !!selectedClass,
    queryFn: () => fetchData(`/api/v1/admin-sekolah/dropdown/hari?kelas_id=${selectedClass}`),
  });

  const { data: hariTersedia = [] } = useQuery({
    queryKey: ["hariTersedia", selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/hari/tersedia?kelas_id=${selectedClass}`);
      return res.data.data.map((h) => h.nama_hari);
    },
    onSuccess: (data) => {
      const initialState = {};
      data.forEach((namaHari) => {
        initialState[namaHari] = [];
      });
      setFormState((prev) => ({ ...initialState, ...prev }));
    },
  });

  const mutation = useMutation({
    mutationFn: async (newJadwal) => (await axiosInstance.post("/api/v1/admin-sekolah/jadwal-mapel", newJadwal)).data,
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      queryClient.invalidateQueries(["jadwalMapel"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-mapel"), 3000);
    },
    onError: (error) => {
      setError(error.response?.data?.msg || "Terjadi kesalahan");
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleChangeClass = (e) => setSelectedClass(e.target.value);

  const handleJadwalChange = (day, index, field, value) => {
    const updated = [...formState[day]];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "waktu_id") {
      const waktu = waktuOptions.find((w) => w.id === value);
      if (waktu) updated[index].kategori_waktu = waktu.kategori_waktu;
    }

    setFormState((prev) => ({ ...prev, [day]: updated }));
  };

  const addSlot = (day) => {
    setFormState((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), {
        waktu_id: "",
        mata_pelajaran_id: "",
        guru_id: "",
        kategori_waktu: "",
      }],
    }));
  };

  const removeSlot = (day, index) => {
    const updated = [...formState[day]];
    updated.splice(index, 1);
    setFormState((prev) => ({ ...prev, [day]: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const jadwalItems = hariTersedia.flatMap((namaHari) => {
      const hari = hariAktif.find((h) => h.nama_hari === namaHari);
      return (formState[namaHari] || []).filter((s) => s.waktu_id).map((slot) => ({
        hari_id: hari.id,
        waktu_id: slot.waktu_id,
        kategori_waktu: slot.kategori_waktu,
        ...(slot.kategori_waktu === "KBM" && {
          mata_pelajaran_id: slot.mata_pelajaran_id,
          guru_id: slot.guru_id,
        }),
      }));
    });
    mutation.mutate({ kelas_id: selectedClass, jadwal: jadwalItems });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -6 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormLabel htmlFor="kelas_id">Pilih Kelas</CustomFormLabel>
          <CustomSelect
            id="kelas_id"
            name="kelas_id"
            value={selectedClass}
            onChange={handleChangeClass}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kelas" }}
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
                Pilih Kelas
            </MenuItem>
            {kelasOptions.length === 0 ? (
                <MenuItem value="" disabled>Memuat...</MenuItem>
            ) : (
                kelasOptions.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                    {k.nama_kelas}
                </MenuItem>
                ))
            )}
            </CustomSelect>
        </Grid>

        {hariTersedia.map((namaHari) => {
          const hari = hariAktif.find((h) => h.nama_hari === namaHari);
          if (!hari) return null;

          return (
            <Grid key={namaHari} size={{ xs: 12 }}>
              <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, boxShadow: 1, backgroundColor: "#fff" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">{namaHari}</Typography>
                  <button
                    type="button"
                    onClick={() => addSlot(namaHari)}
                    style={{ background: "#0A84FF", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    + Tambah Slot Waktu
                  </button>
                </Box>

                {formState[namaHari]?.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Belum ada slot waktu ditambahkan.
                  </Typography>
                )}

                {formState[namaHari]?.map((slot, index) => (
                  <Grid container spacing={2} key={index} mb={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CustomFormLabel htmlFor="waktu_id" sx={{ mt: 1 }}>Waktu</CustomFormLabel>
                      <CustomSelect
                        id="waktu_id"
                        name="waktu_id"
                        value={slot.waktu_id}
                        onChange={(e) => handleJadwalChange(namaHari, index, "waktu_id", e.target.value)}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Waktu" }}
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
                            Pilih Waktu
                        </MenuItem>
                        {waktuOptions.length === 0 ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            waktuOptions.map((w) => (
                            <MenuItem key={w.id} value={w.id}>
                                {`${w.jam_mulai} - ${w.jam_selesai} (${w.kategori_waktu})`}
                            </MenuItem>
                            ))
                        )}
                        </CustomSelect>
                    </Grid>
                    {slot.kategori_waktu === "KBM" && (
                      <>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomFormLabel htmlFor={`mata_pelajaran_id-${index}`} sx={{ mt: 1 }}>Mata Pelajaran</CustomFormLabel>
                          <CustomSelect
                            id={`mata_pelajaran_id-${index}`}
                            name={`mata_pelajaran_id-${index}`}
                            value={slot.mata_pelajaran_id || ""}
                            onChange={(e) => handleJadwalChange(namaHari, index, "mata_pelajaran_id", e.target.value)}
                            fullWidth
                            required
                            displayEmpty
                            inputProps={{ "aria-label": "Pilih Mapel" }}
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
                                Pilih Mapel
                            </MenuItem>
                            {mapelOptions.length === 0 ? (
                                <MenuItem value="" disabled>Memuat...</MenuItem>
                            ) : (
                                mapelOptions.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                    {m.nama_mapel}
                                </MenuItem>
                                ))
                            )}
                            </CustomSelect>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomFormLabel htmlFor={`guru_id-${index}`} sx={{ mt: 1 }}>Guru</CustomFormLabel>
                          <CustomSelect
                            id={`guru_id-${index}`}
                            name={`guru_id-${index}`}
                            value={slot.guru_id || ""}
                            onChange={(e) => handleJadwalChange(namaHari, index, "guru_id", e.target.value)}
                            fullWidth required
                          >
                            <MenuItem value="" disabled>Pilih Guru</MenuItem>
                            {guruOptions.filter((g) => g.mata_pelajaran_id === slot.mata_pelajaran_id).map((g) => (
                              <MenuItem key={g.id} value={g.id}>{g.nama_guru}</MenuItem>
                            ))}
                          </CustomSelect>
                        </Grid>
                      </>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <Button
                        variant="contained"
                        onClick={() => removeSlot(namaHari, index)}
                        size="small"
                        sx={{ backgroundColor: "#EA4335", color: "#ffffff", borderRadius: "12px", px: 2, py: 0.5, textTransform: "none", fontWeight: 500, "&:hover": { backgroundColor: "#1f1e66" } }}
                      >
                        Hapus
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Grid>
          );
        })}

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
          <SubmitButton isLoading={mutation.isLoading}>Simpan</SubmitButton>
          <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JadwalMapelForm;
