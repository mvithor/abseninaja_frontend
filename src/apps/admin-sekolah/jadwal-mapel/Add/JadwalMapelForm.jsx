import { useState, useMemo, useEffect } from "react";
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

  // 🔹 Dropdown Kelas
  const { data: kelasOptions = [] } = useQuery({
    queryKey: ["kelasOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/kelas"),
  });

  // 🔹 Dropdown Waktu
  const { data: waktuOptions = [] } = useQuery({
    queryKey: ["waktuOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/waktu"),
  });

  // 🔹 Dropdown Offering (per kelas)
  const { data: offeringOptions = [], isLoading: isOfferingLoading } = useQuery({
    queryKey: ["offeringOptions", selectedClass],
    enabled: !!selectedClass,
    queryFn: () =>
      fetchData(`/api/v1/admin-sekolah/dropdown/offering?kelas_id=${selectedClass}`),
  });

  // 🔹 Dropdown Guru
  const { data: guruOptions = [] } = useQuery({
    queryKey: ["guruOptions"],
    queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/guru-mapel"),
  });

  // 🔹 Hari aktif & tersedia per kelas
  const { data: hariAktif = [] } = useQuery({
    queryKey: ["hariAktif", selectedClass],
    enabled: !!selectedClass,
    queryFn: () => fetchData(`/api/v1/admin-sekolah/dropdown/hari?kelas_id=${selectedClass}`),
  });

  const { data: hariTersedia = [] } = useQuery({
    queryKey: ["hariTersedia", selectedClass],
    enabled: !!selectedClass,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/admin-sekolah/dropdown/hari/tersedia?kelas_id=${selectedClass}`
      );
      return res.data.data.map((h) => h.nama_hari);
    },
    onSuccess: (data) => {
      const initial = {};
      data.forEach((h) => (initial[h] = []));
      setFormState(initial); // reset agar bersih saat ganti kelas
    },
  });

  // 🔹 Waktu terpakai (kelas & semester aktif)
  const { data: waktuTerpakai = [] } = useQuery({
    queryKey: ["waktuTerpakai", selectedClass],
    enabled: !!selectedClass,
    queryFn: () => fetchData(`/api/v1/admin-sekolah/jadwal-mapel/terpakai?kelas_id=${selectedClass}`),
  });

  // helper
  const findWaktuById = (id) => waktuOptions.find((w) => String(w.id) === String(id));

  // === Mapping hari ===
  const hariNameToId = useMemo(() => {
    const m = new Map();
    (hariAktif || []).forEach((h) => m.set(String(h.nama_hari).toLowerCase(), String(h.id)));
    return m;
  }, [hariAktif]);

  // === Grup waktu terpakai -> Map(hari_id_str -> Set(waktu_id_str)) ===
  const usedByDay = useMemo(() => {
    const m = new Map();
    (waktuTerpakai || []).forEach(({ hari_id, waktu_id }) => {
      const hid = String(hari_id);
      const wid = String(waktu_id);
      if (!m.has(hid)) m.set(hid, new Set());
      m.get(hid).add(wid);
    });
    return m;
  }, [waktuTerpakai]);

  const findHariIdByName = (namaHari) => {
    if (!namaHari) return null;
    return hariNameToId.get(String(namaHari).toLowerCase()) ?? null;
  };

  // apakah suatu waktu di hari tertentu tidak boleh dipilih
  const isWaktuDisabled = (namaHari, waktuId, currentIndex) => {
    const hid = findHariIdByName(namaHari);
    if (!hid) return false;

    const wid = String(waktuId);
    const taken = usedByDay.get(hid)?.has(wid) ?? false;

    const localList = formState[namaHari] || [];
    const dupLocal = localList.some(
      (s, i) => i !== currentIndex && String(s.waktu_id) === wid
    );

    return taken || dupLocal;
  };

  // Tambah/Hapus
  const addSlot = (day) => {
    setFormState((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        { waktu_id: "", kategori_waktu: "", offering_id: "", guru_id: "" },
      ],
    }));
  };

  const removeSlot = (day, index) => {
    const updated = [...formState[day]];
    updated.splice(index, 1);
    setFormState((prev) => ({ ...prev, [day]: updated }));
  };

  // Perubahan nilai
  const handleJadwalChange = (day, index, field, value) => {
    setFormState((prev) => {
      const list = [...(prev[day] || [])];

      // Guard: kalau user memilih waktu yang disabled (klik cepat), abaikan
      if (field === "waktu_id" && isWaktuDisabled(day, value, index)) {
        return prev;
      }

      const current = { ...(list[index] || {}) };
      const next = { ...current, [field]: value };

      if (field === "waktu_id") {
        const w = findWaktuById(value);
        const kategori = w?.kategori_waktu || "";
        next.kategori_waktu = kategori;
        if (kategori && kategori !== "KBM") {
          next.offering_id = "";
          next.guru_id = "";
        }
      }
      if (field === "offering_id") {
        next.guru_id = "";
      }

      list[index] = next;
      return { ...prev, [day]: list };
    });
  };

  // Submit
  const mutation = useMutation({
    mutationFn: async (newJadwal) =>
      (await axiosInstance.post("/api/v1/admin-sekolah/jadwal-mapel", newJadwal)).data,
    onSuccess: (res) => {
      setSuccess(res.msg);
      queryClient.invalidateQueries(["jadwalMapel"]);
      setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-mapel"), 2500);
    },
    onError: (err) => {
      setError(err.response?.data?.msg || "Terjadi kesalahan saat menyimpan jadwal");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const jadwalItems = (hariTersedia || []).flatMap((hariNama) => {
      const hariObj = (hariAktif || []).find((h) => h.nama_hari === hariNama);
      if (!hariObj) return [];

      return (formState[hariNama] || [])
        .filter((s) => {
          if (!s.waktu_id) return false;
          const kategori = s.kategori_waktu || findWaktuById(s.waktu_id)?.kategori_waktu;
          return kategori === "KBM" ? !!s.offering_id : true;
        })
        .map((slot) => {
          const kategori = slot.kategori_waktu || findWaktuById(slot.waktu_id)?.kategori_waktu;
          const isKBM = kategori === "KBM";
          return {
            hari_id: hariObj.id,
            waktu_id: slot.waktu_id,
            offering_id: isKBM ? slot.offering_id : null,
            guru_id: isKBM ? (slot.guru_id || null) : null,
          };
        });
    });

    mutation.mutate({ jadwal: jadwalItems });
  };

  // Reset ketika ganti kelas → bersihkan state hari supaya tidak carry-over
  useEffect(() => {
    if (!selectedClass) setFormState({});
  }, [selectedClass]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2}>
        {/* Pilih Kelas */}
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel>Pilih Kelas</CustomFormLabel>
          <CustomSelect
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            fullWidth
            required
            displayEmpty
            MenuProps={{
              disablePortal: true,
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="" disabled>
              Pilih Kelas
            </MenuItem>
            {kelasOptions.map((k) => (
              <MenuItem key={k.id} value={String(k.id)}>
                {k.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        {/* Hari per Kelas */}
        {(hariTersedia || []).map((namaHari) => {
          const hari = (hariAktif || []).find((h) => h.nama_hari === namaHari);
          if (!hari) return null;

          // hitung berapa waktu yang masih available untuk info
          const hid = String(hari.id);
          const takenSet = usedByDay.get(hid) || new Set();
          const totalWaktu = waktuOptions.length;
          // waktu bebas = total - terpakai DB - yg sedang dipilih user lokal (unik)
          const localPicked = new Set(
            (formState[namaHari] || [])
              .map((s) => String(s.waktu_id))
              .filter(Boolean)
          );
          const freeCount =
            totalWaktu -
            takenSet.size -
            Array.from(localPicked).filter((wid) => !takenSet.has(wid)).length;

          return (
            <Grid key={namaHari} size={{ xs: 12 }}>
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: "#fff",
                  boxShadow: 1,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {namaHari}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ background: "#0A84FF", textTransform: "none", borderRadius: 2 }}
                    onClick={() => addSlot(namaHari)}
                    disabled={!selectedClass || freeCount <= 0}
                  >
                    {`+ Tambah Slot Waktu ${freeCount > 0 ? `(${freeCount} tersisa)` : ""}`}
                  </Button>
                </Box>

                {formState[namaHari]?.length === 0 && (
                  <Typography color="text.secondary">Belum ada slot waktu ditambahkan.</Typography>
                )}

                {(formState[namaHari] || []).map((slot, index) => {
                  const kategori =
                    slot.kategori_waktu || findWaktuById(slot.waktu_id)?.kategori_waktu;
                  const isKBM = kategori === "KBM";

                  const guruByOffering = (guruOptions || []).filter(
                    (g) => String(g.offering_id) === String(slot.offering_id)
                  );

                  return (
                    <Grid
                      container
                      spacing={2}
                      key={`${namaHari}-${index}`}
                      alignItems="center"
                      mb={2}
                    >
                      {/* Waktu */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <CustomFormLabel>Waktu</CustomFormLabel>
                        <CustomSelect
                          value={slot.waktu_id}
                          onChange={(e) =>
                            handleJadwalChange(namaHari, index, "waktu_id", e.target.value)
                          }
                          fullWidth
                          required
                          displayEmpty
                          MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
                        >
                          <MenuItem value="" disabled>
                            Pilih Waktu
                          </MenuItem>
                          {waktuOptions.map((w) => {
                            const disabled = isWaktuDisabled(namaHari, w.id, index);
                            const labelStatus = disabled
                              ? (usedByDay.get(String(hari.id))?.has(String(w.id)) ? " • Terpakai" : " • Dipilih")
                              : "";
                            return (
                              <MenuItem
                                key={w.id}
                                value={String(w.id)}
                                disabled={disabled}
                                sx={disabled ? { opacity: 0.5 } : undefined}
                              >
                                {`${w.jam_mulai} - ${w.jam_selesai} • ${w.kategori_waktu}${labelStatus}`}
                              </MenuItem>
                            );
                          })}
                        </CustomSelect>
                      </Grid>

                      {/* Offering */}
                      {kategori === "KBM" && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomFormLabel>Offering (Mapel • Kode • Kelas)</CustomFormLabel>
                          <CustomSelect
                            value={slot.offering_id}
                            onChange={(e) =>
                              handleJadwalChange(namaHari, index, "offering_id", e.target.value)
                            }
                            fullWidth
                            required
                            displayEmpty
                            MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value="" disabled>
                              {isOfferingLoading ? "Memuat..." : "Pilih Offering"}
                            </MenuItem>
                            {offeringOptions.map((o) => (
                              <MenuItem key={o.id} value={String(o.id)}>
                                {o.label}
                              </MenuItem>
                            ))}
                          </CustomSelect>
                        </Grid>
                      )}

                      {/* Guru */}
                      {kategori === "KBM" && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <CustomFormLabel>Guru Pengampu</CustomFormLabel>
                          <CustomSelect
                            value={slot.guru_id || ""}
                            onChange={(e) =>
                              handleJadwalChange(namaHari, index, "guru_id", e.target.value)
                            }
                            fullWidth
                            displayEmpty
                            disabled={!slot.offering_id}
                            MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value="">
                              {slot.offering_id ? "Tanpa Guru" : "Pilih Offering terlebih dahulu"}
                            </MenuItem>
                            {guruByOffering.map((g) => (
                              <MenuItem key={g.id} value={String(g.id)}>
                                {g.nama_guru}
                              </MenuItem>
                            ))}
                          </CustomSelect>
                        </Grid>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => removeSlot(namaHari, index)}
                          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 500 }}
                        >
                          Hapus
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
              </Box>
            </Grid>
          );
        })}

        <Grid size={{ xs: 12 }} sx={{ display: "flex", gap: 2 }}>
          <SubmitButton isLoading={mutation.isLoading}>Simpan</SubmitButton>
          <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JadwalMapelForm;



// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Box, MenuItem, Typography, Button, Chip } from "@mui/material";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import Grid from "@mui/material/Grid";
// import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
// import SubmitButton from "src/components/button-group/SubmitButton";
// import CancelButton from "src/components/button-group/CancelButton";
// import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
// import axiosInstance from "src/utils/axiosInstance";

// const JadwalMapelForm = ({ setSuccess, setError }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [selectedClass, setSelectedClass] = useState("");
//   const [formState, setFormState] = useState({});

//   const fetchData = async (url) => (await axiosInstance.get(url)).data.data;

//   // 🔹 Dropdown Kelas
//   const { data: kelasOptions = [] } = useQuery({
//     queryKey: ["kelasOptions"],
//     queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/kelas"),
//   });

//   // 🔹 Dropdown Waktu
//   const { data: waktuOptions = [] } = useQuery({
//     queryKey: ["waktuOptions"],
//     queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/waktu"),
//   });

//   // 🔹 Dropdown Offering (per kelas)
//   const { data: offeringOptions = [], isLoading: isOfferingLoading } = useQuery({
//     queryKey: ["offeringOptions", selectedClass],
//     enabled: !!selectedClass,
//     queryFn: () =>
//       fetchData(`/api/v1/admin-sekolah/dropdown/offering?kelas_id=${selectedClass}`),
//   });

//   // 🔹 Dropdown Guru (berisi guru yang sudah terdaftar di offering)
//   const { data: guruOptions = [] } = useQuery({
//     queryKey: ["guruOptions"],
//     queryFn: () => fetchData("/api/v1/admin-sekolah/dropdown/guru-mapel"),
//   });

//   // 🔹 Hari aktif & hari tersedia per kelas
//   const { data: hariAktif = [] } = useQuery({
//     queryKey: ["hariAktif", selectedClass],
//     enabled: !!selectedClass,
//     queryFn: () => fetchData(`/api/v1/admin-sekolah/dropdown/hari?kelas_id=${selectedClass}`),
//   });

//   const { data: hariTersedia = [] } = useQuery({
//     queryKey: ["hariTersedia", selectedClass],
//     enabled: !!selectedClass,
//     queryFn: async () => {
//       const res = await axiosInstance.get(
//         `/api/v1/admin-sekolah/dropdown/hari/tersedia?kelas_id=${selectedClass}`
//       );
//       return res.data.data.map((h) => h.nama_hari);
//     },
//     onSuccess: (data) => {
//       const initial = {};
//       data.forEach((h) => (initial[h] = []));
//       setFormState((prev) => ({ ...initial, ...prev }));
//     },
//   });

//   // helper: cari info waktu berdasarkan id
//   const findWaktuById = (id) => waktuOptions.find((w) => String(w.id) === String(id));

//   // 🔹 Tambah Slot Baru per Hari
//   const addSlot = (day) => {
//     setFormState((prev) => ({
//       ...prev,
//       [day]: [
//         ...(prev[day] || []),
//         { waktu_id: "", kategori_waktu: "", offering_id: "", guru_id: "" }, 
//       ],
//     }));
//   };

//   // 🔹 Hapus Slot
//   const removeSlot = (day, index) => {
//     const updated = [...formState[day]];
//     updated.splice(index, 1);
//     setFormState((prev) => ({ ...prev, [day]: updated }));
//   };

//   // 🔹 Handle perubahan nilai input
//   const handleJadwalChange = (day, index, field, value) => {
//     setFormState((prev) => {
//       const list = [...(prev[day] || [])];
//       const current = { ...(list[index] || {}) };

//       // update field
//       const next = { ...current, [field]: value };

//       // jika field waktu berubah → derive kategori_waktu dari dropdown waktu
//       if (field === "waktu_id") {
//         const w = findWaktuById(value);
//         const kategori = w?.kategori_waktu || "";
//         next.kategori_waktu = kategori;

//         // Jika Non-KBM → kosongkan offering & guru
//         if (kategori && kategori !== "KBM") {
//           next.offering_id = "";
//           next.guru_id = ""; // ✅ reset guru_id
//         }
//       }

//       // jika offering berubah, reset guru
//       if (field === "offering_id") {
//         next.guru_id = ""; // ✅ reset guru_id
//       }

//       list[index] = next;
//       return { ...prev, [day]: list };
//     });
//   };
  
//   // 🔹 Submit form
//   const mutation = useMutation({
//     mutationFn: async (newJadwal) =>
//       (await axiosInstance.post("/api/v1/admin-sekolah/jadwal-mapel", newJadwal)).data,
//     onSuccess: (res) => {
//       setSuccess(res.msg);
//       queryClient.invalidateQueries(["jadwalMapel"]);
//       setTimeout(() => navigate("/dashboard/admin-sekolah/jadwal-mapel"), 2500);
//     },
//     onError: (err) => {
//       setError(err.response?.data?.msg || "Terjadi kesalahan saat menyimpan jadwal");
//       setTimeout(() => setError(""), 3000);
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const jadwalItems = hariTersedia.flatMap((hariNama) => {
//       const hariObj = hariAktif.find((h) => h.nama_hari === hariNama);

//       return (formState[hariNama] || [])
//         .filter((s) => {
//           // wajib punya waktu
//           if (!s.waktu_id) return false;
//           const kategori = s.kategori_waktu || findWaktuById(s.waktu_id)?.kategori_waktu;
//           // Jika KBM → butuh offering, jika Non-KBM → offering tidak wajib
//           return kategori === "KBM" ? !!s.offering_id : true;
//         })
//         .map((slot) => {
//           const kategori = slot.kategori_waktu || findWaktuById(slot.waktu_id)?.kategori_waktu;
//           const isKBM = kategori === "KBM";

//           return {
//             hari_id: hariObj.id,
//             waktu_id: slot.waktu_id,
//             offering_id: isKBM ? slot.offering_id : null,
//             guru_id:    isKBM ? (slot.guru_id || null) : null, // ✅ kirim guru_id
//           };
//         });
//     });

//     mutation.mutate({ jadwal: jadwalItems });
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
//       <Grid container spacing={2}>
//         {/* 🔸 Pilih Kelas */}
//         <Grid size={{ xs: 12 }}>
//           <CustomFormLabel>Pilih Kelas</CustomFormLabel>
//           <CustomSelect
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             fullWidth
//             required
//             displayEmpty
//             MenuProps={{
//               disablePortal: true,
//               PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
//             }}
//           >
//             <MenuItem value="" disabled>
//               Pilih Kelas
//             </MenuItem>
//             {kelasOptions.map((k) => (
//               <MenuItem key={k.id} value={k.id}>
//                 {k.nama_kelas}
//               </MenuItem>
//             ))}
//           </CustomSelect>
//         </Grid>

//         {/* 🔸 Hari per Kelas */}
//         {hariTersedia.map((namaHari) => {
//           const hari = hariAktif.find((h) => h.nama_hari === namaHari);
//           if (!hari) return null;

//           return (
//             <Grid key={namaHari} size={{ xs: 12 }}>
//               <Box
//                 sx={{
//                   border: "1px solid #e0e0e0",
//                   borderRadius: 2,
//                   p: 2,
//                   backgroundColor: "#fff",
//                   boxShadow: 1,
//                 }}
//               >
//                 <Box
//                   display="flex"
//                   justifyContent="space-between"
//                   alignItems="center"
//                   mb={2}
//                 >
//                   <Typography variant="h6" fontWeight="bold">
//                     {namaHari}
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     sx={{
//                       background: "#0A84FF",
//                       textTransform: "none",
//                       borderRadius: 2,
//                     }}
//                     onClick={() => addSlot(namaHari)}
//                   >
//                     + Tambah Slot Waktu
//                   </Button>
//                 </Box>

//                 {/* Slot Kosong */}
//                 {formState[namaHari]?.length === 0 && (
//                   <Typography color="text.secondary">
//                     Belum ada slot waktu ditambahkan.
//                   </Typography>
//                 )}

//                 {/* Daftar Slot */}
//                 {formState[namaHari]?.map((slot, index) => {
//                   const kategori = slot.kategori_waktu || findWaktuById(slot.waktu_id)?.kategori_waktu;
//                   const isKBM = kategori === "KBM";

//                   const guruByOffering = guruOptions.filter(
//                     (g) => String(g.offering_id) === String(slot.offering_id)
//                   );

//                   return (
//                     <Grid
//                       container
//                       spacing={2}
//                       key={`${namaHari}-${index}`}
//                       alignItems="center"
//                       mb={2}
//                     >
//                       {/* ⏰ Waktu */}
//                       <Grid size={{ xs: 12, sm: 4 }}>
//                         <CustomFormLabel>Waktu</CustomFormLabel>
//                         <CustomSelect
//                           value={slot.waktu_id}
//                           onChange={(e) =>
//                             handleJadwalChange(namaHari, index, "waktu_id", e.target.value)
//                           }
//                           fullWidth
//                           required
//                           displayEmpty
//                           MenuProps={{
//                             disablePortal: true,
//                             PaperProps: { style: { maxHeight: 300 } },
//                           }}
//                         >
//                           <MenuItem value="" disabled>
//                             Pilih Waktu
//                           </MenuItem>
//                           {waktuOptions.map((w) => (
//                             <MenuItem key={w.id} value={w.id}>
//                               {`${w.jam_mulai} - ${w.jam_selesai} • ${w.kategori_waktu}`}
//                             </MenuItem>
//                           ))}
//                         </CustomSelect>
//                       </Grid>

//                       {/* 📘 Offering (hanya tampil kalau KBM) */}
//                       {isKBM && (
//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <CustomFormLabel>Offering (Mapel • Kode • Kelas)</CustomFormLabel>
//                           <CustomSelect
//                             value={slot.offering_id}
//                             onChange={(e) =>
//                               handleJadwalChange(namaHari, index, "offering_id", e.target.value)
//                             }
//                             fullWidth
//                             required
//                             displayEmpty
//                             MenuProps={{
//                               disablePortal: true,
//                               PaperProps: { style: { maxHeight: 300 } },
//                             }}
//                           >
//                             <MenuItem value="" disabled>
//                               {isOfferingLoading ? "Memuat..." : "Pilih Offering"}
//                             </MenuItem>
//                             {offeringOptions.map((o) => (
//                               <MenuItem key={o.id} value={o.id}>
//                                 {o.label}
//                               </MenuItem>
//                             ))}
//                           </CustomSelect>
//                         </Grid>
//                       )}

//                       {/* 👩‍🏫 Guru (opsional; hanya jika KBM) */}
//                       {isKBM && (
//                         <Grid size={{ xs: 12, sm: 4 }}>
//                           <CustomFormLabel>Guru Pengampu</CustomFormLabel>
//                           <CustomSelect
//                             value={slot.guru_id || ""}
//                             onChange={(e) =>
//                               handleJadwalChange(
//                                 namaHari,
//                                 index,
//                                 "guru_id",
//                                 e.target.value
//                               )
//                             }
//                             fullWidth
//                             displayEmpty
//                             disabled={!slot.offering_id}
//                             MenuProps={{
//                               disablePortal: true,
//                               PaperProps: { style: { maxHeight: 300 } },
//                             }}
//                           >
//                             <MenuItem value="">
//                               {slot.offering_id
//                                 ? "Tanpa Guru"
//                                 : "Pilih Offering terlebih dahulu"}
//                             </MenuItem>
//                             {guruByOffering.map((g) => (
//                               <MenuItem key={g.id} value={g.id}>
//                                 {g.nama_guru}
//                               </MenuItem>
//                             ))}
//                           </CustomSelect>
//                         </Grid>
//                       )}
//                       <Grid size={{ xs: 12 }}>
//                         <Button
//                           variant="contained"
//                           color="error"
//                           size="small"
//                           onClick={() => removeSlot(namaHari, index)}
//                           sx={{
//                             borderRadius: "12px",
//                             textTransform: "none",
//                             fontWeight: 500,
//                           }}
//                         >
//                           Hapus
//                         </Button>
//                       </Grid>
//                     </Grid>
//                   );
//                 })}
//               </Box>
//             </Grid>
//           );
//         })}

//         <Grid size={{ xs: 12 }} sx={{ display: "flex", gap: 2 }}>
//           <SubmitButton isLoading={mutation.isLoading}>Simpan</SubmitButton>
//           <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default JadwalMapelForm;
