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

const SlotRow = ({
  namaHari,
  index,
  slot,
  hariIdStr,
  waktuOptionsHariIniFiltered,
  usedTakenSetForDay,
  findWaktuById,
  isWaktuDisabled,
  handleJadwalChange,
  removeSlot,
  guruByOfferingMap,
  isOfferingLoading,
  offeringOptions,
}) => {
  const kategori = slot.kategori_waktu || findWaktuById(slot.waktu_id)?.kategori_waktu;
  const isKBM = kategori === "KBM";
  const hid = hariIdStr;

  const guruByOffering =
    guruByOfferingMap.get((slot.offering_id ?? "").toString().trim()) || [];

  return (
    <Grid container spacing={2} alignItems="center" mb={0}>
      {/* Waktu */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomFormLabel>Waktu</CustomFormLabel>
        <CustomSelect
          value={slot.waktu_id}
          onChange={(e) => handleJadwalChange(namaHari, index, "waktu_id", e.target.value)}
          fullWidth
          required
          displayEmpty
          MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
        >
          <MenuItem value="" disabled>
            Pilih Waktu
          </MenuItem>
          {waktuOptionsHariIniFiltered.map((w) => {
            const disabled = isWaktuDisabled(namaHari, w.id, index);
            const isKBMOpt = w.kategori_waktu === "KBM";
            const isNonKBMOpt = !isKBMOpt;
            const isTaken = usedTakenSetForDay?.has(String(w.id));
            const labelStatus = disabled
              ? (isNonKBMOpt && isTaken
                  ? " • Non-KBM (Global)"
                  : (isKBMOpt && isTaken ? " • Terpakai" : " • Dipilih"))
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
      {isKBM && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel>Offering (Mapel • Kode • Kelas)</CustomFormLabel>
          <CustomSelect
            value={slot.offering_id}
            onChange={(e) => handleJadwalChange(namaHari, index, "offering_id", e.target.value)}
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
      {isKBM && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomFormLabel>Guru Pengampu</CustomFormLabel>
          <CustomSelect
            value={slot.guru_id || ""}
            onChange={(e) => handleJadwalChange(namaHari, index, "guru_id", e.target.value)}
            fullWidth
            displayEmpty
            disabled={!slot.offering_id}
            MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
          >
            <MenuItem value="">
              {slot.offering_id
                ? (guruByOffering.length ? "Pilih Guru" : "Tidak ada guru untuk offering ini")
                : "Pilih Offering terlebih dahulu"}
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
};

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

  // 🔹 Dropdown Waktu (per sekolah, berisi hari_id di tiap item)
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
      setFormState(initial);
    },
  });

  // === Ambil "terpakai" per-hari (KBM+Non-KBM) dalam SATU query supaya hooks tidak dinamis ===
  const { data: takenPerDay = {} } = useQuery({
    queryKey: ["takenPerDay", selectedClass, (hariAktif || []).map(h => h.id).join(",")],
    enabled: !!selectedClass && (hariAktif || []).length > 0,
    queryFn: async () => {
      const listHari = (hariAktif || []).map(h => Number(h.id)).filter(Boolean);
      const results = await Promise.all(
        listHari.map(async (hid) => {
          const url = `/api/v1/admin-sekolah/jadwal-mapel/terpakai?kelas_id=${selectedClass}&hari_id=${hid}&includeAll=true`;
          const resp = await axiosInstance.get(url);
          const items = resp.data?.data || [];
          const set = new Set(items.filter(Boolean).map(it => String(it.id)).filter(id => {
            const row = items.find(r => String(r.id) === String(id));
            return row?.terpakai === true;
          }));
          return [String(hid), { set, items }];
        })
      );
      return Object.fromEntries(results); // { '1': {set, items}, ... }
    },
  });

  // helper
  const findWaktuById = (id) => waktuOptions.find((w) => String(w.id) === String(id));

  const hariNameToId = useMemo(() => {
    const m = new Map();
    (hariAktif || []).forEach((h) => m.set(String(h.nama_hari).toLowerCase(), String(h.id)));
    return m;
  }, [hariAktif]);

  // Set "terpakai" per-hari
  const usedByDay = useMemo(() => {
    const m = new Map();
    Object.entries(takenPerDay || {}).forEach(([hid, obj]) => {
      m.set(String(hid), obj?.set || new Set());
    });
    return m;
  }, [takenPerDay]);

  // waktu per hari
  const waktuByHari = useMemo(() => {
    const map = new Map();
    (hariAktif || []).forEach((h) => map.set(String(h.id), []));
    (waktuOptions || []).forEach((w) => {
      const hid = String(w.hari_id ?? "");
      if (!hid) return;
      if (!map.has(hid)) map.set(hid, []);
      map.get(hid).push(w);
    });
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => String(a.jam_mulai).localeCompare(String(b.jam_mulai)));
      map.set(k, arr);
    }
    return map;
  }, [waktuOptions, hariAktif]);

  const findHariIdByName = (namaHari) => {
    if (!namaHari) return null;
    return hariNameToId.get(String(namaHari).toLowerCase()) ?? null;
  };

  // index guru per offering
  const guruByOfferingMap = useMemo(() => {
    const m = new Map();
    (guruOptions || []).forEach((g) => {
      const key = (g?.offering_id ?? "").toString().trim();
      if (!key) return;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(g);
    });
    return m;
  }, [guruOptions]);

  // disabled rule
  const isWaktuDisabled = (namaHari, waktuId, currentIndex) => {
    const hid = findHariIdByName(namaHari);
    if (!hid) return false;

    const wid = String(waktuId);
    const taken = usedByDay.get(String(hid))?.has(wid) ?? false;

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
        next.offering_id = (value ?? "").toString().trim();
        next.guru_id = "";
      }

      list[index] = next;
      return { ...prev, [day]: list };
    });
  };

  // 💡 Helper: rangkai error ramah pengguna dari BE
  const extractErrorMessage = (err) => {
    const d = err?.response?.data || {};
    const lines = [];

    if (d.msg) lines.push(d.msg);

    // BE kirim "detail": array string kalimat siap tampil
    if (Array.isArray(d.detail) && d.detail.length) {
      lines.push(...d.detail);
    }

    // Validasi schema "errors": array string
    if (Array.isArray(d.errors) && d.errors.length) {
      lines.push(...d.errors);
    }

    // Jika tak ada detail tapi ada conflicts terstruktur, buat ringkasannya
    if ((!d.detail || !d.detail.length) && Array.isArray(d.conflicts) && d.conflicts.length) {
      const toHHMM = (t) => {
        if (!t) return "-";
        const [h, m] = String(t).split(":");
        return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      };
      d.conflicts.forEach((c) => {
        const jam = `${toHHMM(c.jam_mulai)}-${toHHMM(c.jam_selesai)}`;
        const kat = c.kategori || "-";
        if (c.kelas) {
          lines.push(`Konflik: ${jam} (${kat}) sudah terisi untuk ${c.kelas}.`);
        } else {
          lines.push(`Konflik: ${jam} (${kat}) adalah Non-KBM (global).`);
        }
      });
    }

    // Fallback terakhir
    if (!lines.length) {
      lines.push("Terjadi kesalahan saat menyimpan jadwal.");
    }

    // Gabungkan dengan baris baru supaya toast/alert multi-line
    return lines.join("\n");
  };

  // 🔧 Helper: auto-append Non-KBM berdasarkan definisi "waktu" (kategori_waktu != 'KBM')
  const buildNonKbmPayloadForDay = (hariNama) => {
    const hariObj = (hariAktif || []).find((h) => h.nama_hari === hariNama);
    if (!hariObj) return [];

    const hid = String(hariObj.id);
    const waktuHariIni = waktuByHari.get(hid) || [];
    const takenSetAll = usedByDay.get(hid) || new Set();

    // Semua slot Non-KBM untuk hari tsb
    const nonKbmWaktu = waktuHariIni.filter((w) => w.kategori_waktu !== "KBM");

    // Jangan kirim yang sudah ada di DB atau sudah dipilih lokal
    const localPicked = new Set(
      (formState[hariNama] || [])
        .map((s) => String(s.waktu_id))
        .filter(Boolean)
    );

    const payload = [];
    for (const w of nonKbmWaktu) {
      const wid = String(w.id);
      if (takenSetAll.has(wid)) continue;   // sudah ada
      if (localPicked.has(wid)) continue;   // user kebetulan memilih
      payload.push({
        hari_id: hariObj.id,
        waktu_id: w.id,
        offering_id: null,
        guru_id: null,
      });
    }
    return payload;
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
      const message = extractErrorMessage(err);
      setError(message);
      setTimeout(() => setError(""), 6000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Item dari input user (hanya valid)
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

    // 2) AUTO: tambahkan Non-KBM (offering_id & guru_id = null) berdasarkan definisi "waktu"
    const autoNonKbm = (hariTersedia || []).flatMap((hariNama) =>
      buildNonKbmPayloadForDay(hariNama)
    );

    // 3) Gabungkan dan kirim
    mutation.mutate({ jadwal: [...jadwalItems, ...autoNonKbm] });
  };

  useEffect(() => {
    if (!selectedClass) setFormState({});
  }, [selectedClass]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
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

          const hid = String(hari.id);

          const waktuOptionsHariIni = waktuByHari.get(hid) || [];
          const waktuOptionsHariIniKBM = waktuOptionsHariIni.filter((w) => w.kategori_waktu === "KBM");

          // Set terpakai (KBM+NonKBM) dari BE
          const takenSetAll = usedByDay.get(hid) || new Set();

          // Filter Non-KBM yang sudah terpakai secara global (kecuali jika sedang terpilih pada baris itu)
          const buildFilteredOptionsForSlot = (slot) => {
            const currentWid = String(slot?.waktu_id || "");
            return waktuOptionsHariIni.filter((w) => {
              const isTaken = takenSetAll.has(String(w.id));
              const isNonKBM = w.kategori_waktu !== "KBM";
              if (isNonKBM && isTaken && String(w.id) !== currentWid) return false;
              return true;
            });
          };

          // Hitung sisa KBM (hanya dari KBM)
          const takenKBMCount = waktuOptionsHariIniKBM.filter((w) =>
            takenSetAll.has(String(w.id))
          ).length;

          const localPickedKBM = new Set(
            (formState[namaHari] || [])
              .filter((s) => {
                const k = s.kategori_waktu || findWaktuById(s.waktu_id)?.kategori_waktu;
                return k === "KBM";
              })
              .map((s) => String(s.waktu_id))
              .filter(Boolean)
          );
          const localNewUniqueKBM = Array.from(localPickedKBM).filter(
            (wid) => !takenSetAll.has(wid)
          ).length;

          const totalKBM = waktuOptionsHariIniKBM.length;
          const remainingKBM = Math.max(0, totalKBM - takenKBMCount - localNewUniqueKBM);
          const isFullKBM = totalKBM > 0 && remainingKBM === 0;
          const isEmptyKBM = totalKBM > 0 && takenKBMCount === 0 && localNewUniqueKBM === 0;
          const hasKBMSlots = totalKBM > 0;

          let addBtnLabel = "+ Tambah Blok Waktu";
          if (!hasKBMSlots) addBtnLabel = "Tidak ada blok KBM untuk hari ini";
          else if (isFullKBM) addBtnLabel = "Semua blok KBM terisi";
          else if (isEmptyKBM) addBtnLabel = "+ Tambah blok Waktu (belum ada)";
          else addBtnLabel = `+ Tambah Blok Waktu (${remainingKBM} tersisa)`;

          const addBtnDisabled = !selectedClass || !hasKBMSlots || isFullKBM;

          const noLocalItems = (formState[namaHari]?.length || 0) === 0;
          const showEmptyInfo = hasKBMSlots && isEmptyKBM && noLocalItems;

          return (
            <Grid key={namaHari} size={{ xs: 12 }}>
              <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, backgroundColor: "#fff" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">{namaHari}</Typography>
                  <Button
                    variant="contained"
                    sx={{ background: "#2F327D", textTransform: "none", borderRadius: 1 }}
                    onClick={() => addSlot(namaHari)}
                    disabled={addBtnDisabled}
                  >
                    {addBtnLabel}
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {!hasKBMSlots
                    ? "Status: Tidak ada blok KBM terdefinisi untuk hari ini"
                    : `Status: ${(totalKBM - remainingKBM)}/${totalKBM} blok KBM terisi`}
                </Typography>

                {showEmptyInfo && (
                  <Typography color="text.secondary" mb={1.5}>
                    Belum ada jadwal pada hari ini
                  </Typography>
                )}

                {(formState[namaHari] || []).map((slot, index) => (
                  <Box key={`${namaHari}-${index}`} sx={{ mb: 0 }}>
                    <SlotRow
                      namaHari={namaHari}
                      index={index}
                      slot={slot}
                      hariIdStr={hid}
                      waktuOptionsHariIniFiltered={buildFilteredOptionsForSlot(slot)}
                      usedTakenSetForDay={takenSetAll}
                      findWaktuById={findWaktuById}
                      isWaktuDisabled={isWaktuDisabled}
                      handleJadwalChange={handleJadwalChange}
                      removeSlot={removeSlot}
                      guruByOfferingMap={guruByOfferingMap}
                      isOfferingLoading={isOfferingLoading}
                      offeringOptions={offeringOptions}
                    />
                  </Box>
                ))}
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