import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import { IconBuilding } from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetcher = async (url) => (await axiosInstance.get(url)).data.data;
const strEq = (a, b) => String(a ?? "") === String(b ?? "");
const hasOption = (options, id) => options?.some((o) => strEq(o.id, id));

const JadwalMapelEditForm = ({
  jadwalData,          
  setJadwalData,
  handleChange,        
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const { data: kelasOptions = [], isLoading: isKelasLoading } = useQuery({
    queryKey: ["kelasOptions"],
    queryFn: () => fetcher("/api/v1/admin-sekolah/dropdown/kelas"),
  });

  const { data: waktuOptions = [], isLoading: isWaktuLoading } = useQuery({
    queryKey: ["waktuOptions"],
    queryFn: () => fetcher("/api/v1/admin-sekolah/dropdown/waktu"),
  });

  const { data: offeringOptions = [], isLoading: isOfferingLoading } = useQuery({
    queryKey: ["offeringOptions", jadwalData?.kelas_id || ""],
    enabled: !!jadwalData?.kelas_id,
    queryFn: () =>
      fetcher(
        `/api/v1/admin-sekolah/dropdown/offering?kelas_id=${jadwalData.kelas_id}`
      ),
  });

  const { data: guruOptions = [], isLoading: isGuruLoading } = useQuery({
    queryKey: ["guruOptions"],
    queryFn: () => fetcher("/api/v1/admin-sekolah/dropdown/guru-mapel"),
  });

  // derive kategori dari waktu_id bila ada (fallback ke yang sudah ada di state)
  const selectedWaktu = useMemo(
    () => waktuOptions.find((w) => strEq(w.id, jadwalData?.waktu_id)),
    [waktuOptions, jadwalData?.waktu_id]
  );
  const kategori = selectedWaktu?.kategori_waktu || jadwalData?.kategori || "";
  const isKBM = kategori === "KBM";

  // Prefill kelas_id dari nama_kelas (sekali saat options siap)
  useEffect(() => {
    if (!jadwalData?.kelas_id && jadwalData?.nama_kelas && kelasOptions.length) {
      const match = kelasOptions.find((k) => k.nama_kelas === jadwalData.nama_kelas);
      if (match) {
        setJadwalData((prev) => ({ ...prev, kelas_id: match.id }));
      }
    }
  }, [jadwalData?.kelas_id, jadwalData?.nama_kelas, kelasOptions, setJadwalData]);

  // Jika Non-KBM → pastikan offering_id & guru_id kosong (hindari out-of-range)
  useEffect(() => {
    if (!isKBM) {
      if (jadwalData?.offering_id || jadwalData?.guru_id) {
        setJadwalData((prev) => ({ ...prev, offering_id: "", guru_id: "" }));
      }
    }
  }, [isKBM, jadwalData?.offering_id, jadwalData?.guru_id, setJadwalData]);

  // Validasi saat opsi offering berubah: value harus ada di options
  useEffect(() => {
    if (!isKBM) return;
    if (!jadwalData?.kelas_id) {
      if (jadwalData?.offering_id || jadwalData?.guru_id) {
        setJadwalData((prev) => ({ ...prev, offering_id: "", guru_id: "" }));
      }
      return;
    }
    if (jadwalData?.offering_id && !hasOption(offeringOptions, jadwalData.offering_id)) {
      setJadwalData((prev) => ({ ...prev, offering_id: "", guru_id: "" }));
    }
  }, [
    isKBM,
    jadwalData?.kelas_id,
    jadwalData?.offering_id,
    offeringOptions,
    setJadwalData,
  ]);

  // Validasi guru saat opsi berubah
  const guruByOffering = useMemo(
    () => guruOptions.filter((g) => strEq(g.offering_id, jadwalData?.offering_id)),
    [guruOptions, jadwalData?.offering_id]
  );
  useEffect(() => {
    if (!isKBM) return;
    if (!jadwalData?.offering_id) {
      if (jadwalData?.guru_id) {
        setJadwalData((prev) => ({ ...prev, guru_id: "" }));
      }
      return;
    }
    const ok = guruByOffering.some((g) => strEq(g.id, jadwalData?.guru_id));
    if (jadwalData?.guru_id && !ok) {
      setJadwalData((prev) => ({ ...prev, guru_id: "" }));
    }
  }, [isKBM, jadwalData?.offering_id, jadwalData?.guru_id, guruByOffering, setJadwalData]);

  // onChange khusus waktu (update waktu_id + kategori + reset jika Non-KBM)
  const onChangeWaktu = (value) => {
    const w = waktuOptions.find((x) => strEq(x.id, value));
    const kat = w?.kategori_waktu || "";
    setJadwalData((prev) => ({
      ...prev,
      waktu_id: value,
      kategori: kat,
      ...(kat && kat !== "KBM" ? { offering_id: "", guru_id: "" } : null),
    }));
  };

  // onChange offering (reset guru)
  const onChangeOffering = (value) => {
    setJadwalData((prev) => ({ ...prev, offering_id: value || "", guru_id: "" }));
  };

  const anyLoading =
    isLoading || isKelasLoading || isWaktuLoading || (isKBM && isOfferingLoading);

  return (
    <Box component="form" onSubmit={(e) => handleSubmit(e, isKBM)} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        {/* Kelas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
          <CustomSelect
            name="kelas_id"
            value={jadwalData?.kelas_id || ""}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={anyLoading}
            MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
            startAdornment={
              <InputAdornment position="start">
                <IconBuilding size={18} />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              {isKelasLoading ? "Memuat..." : "Pilih Kelas"}
            </MenuItem>
            {kelasOptions.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        {/* Hari (display-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
          <CustomOutlinedInput value={jadwalData?.hari || ""} readOnly fullWidth />
        </Grid>

        {/* Waktu */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Waktu</CustomFormLabel>
          <CustomSelect
            name="waktu_id"
            value={jadwalData?.waktu_id || ""}
            onChange={(e) => onChangeWaktu(e.target.value)}
            fullWidth
            required
            displayEmpty
            disabled={isWaktuLoading}
            MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
          >
            <MenuItem value="" disabled>
              {isWaktuLoading ? "Memuat..." : "Pilih Waktu"}
            </MenuItem>
            {waktuOptions.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {`${w.jam_mulai} - ${w.jam_selesai} • ${w.kategori_waktu}`}
              </MenuItem>
            ))}
          </CustomSelect>

          {kategori && (
            <Box mt={1}>
              <Chip
                size="small"
                variant="outlined"
                label={isKBM ? "KBM" : `Non-KBM: ${kategori}`}
              />
            </Box>
          )}
        </Grid>

        {/* Offering (KBM only) */}
        {isKBM && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Offering (Mapel • Kode • Kelas)
            </CustomFormLabel>
            <CustomSelect
              name="offering_id"
              value={
                jadwalData?.kelas_id && hasOption(offeringOptions, jadwalData?.offering_id)
                  ? jadwalData.offering_id
                  : ""
              }
              onChange={(e) => onChangeOffering(e.target.value)}
              fullWidth
              required
              displayEmpty
              disabled={!jadwalData?.kelas_id || isOfferingLoading}
              MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="" disabled>
                {isOfferingLoading
                  ? "Memuat..."
                  : !jadwalData?.kelas_id
                  ? "Pilih Kelas terlebih dahulu"
                  : "Pilih Offering"}
              </MenuItem>
              {offeringOptions.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
        )}

        {/* Guru (opsional; KBM only) */}
        {isKBM && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Guru Pengampu</CustomFormLabel>
            <CustomSelect
              name="guru_id"
              value={
                jadwalData?.offering_id &&
                guruByOffering.some((g) => strEq(g.id, jadwalData?.guru_id))
                  ? jadwalData.guru_id
                  : ""
              }
              onChange={handleChange}
              fullWidth
              displayEmpty
              disabled={!jadwalData?.offering_id || isGuruLoading}
              MenuProps={{ disablePortal: true, PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem value="">
                {jadwalData?.offering_id
                  ? "Tanpa Guru"
                  : "Pilih Offering terlebih dahulu"}
              </MenuItem>
              {guruByOffering.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.nama_guru}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
        )}

        {/* Info KBM (display-only) */}
        {isKBM && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Info KBM</CustomFormLabel>
            <CustomOutlinedInput
              readOnly
              fullWidth
              value={`${jadwalData?.nama_mapel || "-"} • ${jadwalData?.nama_kelas || "-"} • ${
                jadwalData?.kode_offering || "-"
              }`}
            />
          </Grid>
        )}

        {/* Aksi */}
        <Grid size={{ xs: 12 }} sx={{ display: "flex", gap: 2, mt: 2 }}>
          <SubmitButton isLoading={anyLoading}>
            {anyLoading ? <CircularProgress size={18} /> : "Simpan"}
          </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JadwalMapelEditForm;
