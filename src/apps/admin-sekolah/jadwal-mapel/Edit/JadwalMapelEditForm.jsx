import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Chip, // (boleh tetap ada meski tidak dipakai lagi)
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

/* ➕ Helper untuk parent: mapping error BE → FE (tetap diexport agar View bisa pakai) */
export const buildUpdateErrorMessage = (err) => {
  const d = err?.response?.data || {};
  const msg = d.msg || "Terjadi kesalahan saat menyimpan perubahan.";
  let detail = Array.isArray(d.detail) ? d.detail.slice() : [];
  if (!detail.length && Array.isArray(d.errors)) detail = d.errors.slice();
  if (!detail.length && Array.isArray(d.conflicts)) {
    const toHHMM = (t) => {
      if (!t) return "-";
      const [h, m] = String(t).split(":");
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    detail = d.conflicts.map((c) => {
      const jam = `${toHHMM(c.jam_mulai)}-${toHHMM(c.jam_selesai)}`;
      const kat = c.kategori || "-";
      return c.kelas
        ? `Konflik: ${jam} (${kat}) sudah terisi untuk ${c.kelas}.`
        : `Konflik: ${jam} (${kat}) adalah Non-KBM (global).`;
    });
  }
  return { msg, detail };
};

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
    keepPreviousData: true,
    queryFn: () =>
      fetcher(
        `/api/v1/admin-sekolah/dropdown/offering?kelas_id=${jadwalData.kelas_id}`
      ),
  });

  const { data: guruOptions = [], isLoading: isGuruLoading } = useQuery({
    queryKey: ["guruOptions"],
    queryFn: () => fetcher("/api/v1/admin-sekolah/dropdown/guru-mapel"),
    keepPreviousData: true,
  });

  // 🔎 Filter waktu berdasarkan hari yang sedang diedit (jadwalData.hari_id)
  const waktuOptionsFiltered = useMemo(() => {
    const hid = jadwalData?.hari_id;
    if (!hid) return waktuOptions;
    return (waktuOptions || []).filter((w) => strEq(w.hari_id, hid));
  }, [waktuOptions, jadwalData?.hari_id]);

  // Jika waktu_id terpilih tidak termasuk waktu hari ini, kosongkan agar valid
  useEffect(() => {
    if (!jadwalData?.waktu_id) return;
    if (!hasOption(waktuOptionsFiltered, jadwalData.waktu_id)) {
      setJadwalData((prev) => ({
        ...prev,
        waktu_id: "",
        kategori: "",
      }));
    }
  }, [waktuOptionsFiltered, jadwalData?.waktu_id, setJadwalData]);

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

  // Jika Non-KBM → kosongkan offering_id & guru_id
  useEffect(() => {
    if (!isKBM) {
      if (jadwalData?.offering_id || jadwalData?.guru_id) {
        setJadwalData((prev) => ({ ...prev, offering_id: "", guru_id: "" }));
      }
    }
  }, [isKBM, jadwalData?.offering_id, jadwalData?.guru_id, setJadwalData]);

  // Validasi guru saat opsi berubah (jangan reset offering di sini; biarkan prefill tampil)
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

  const hasCurrentOffering = hasOption(offeringOptions, jadwalData?.offering_id);
  const hasCurrentGuru =
    jadwalData?.guru_id && guruByOffering.some((g) => strEq(g.id, jadwalData?.guru_id));

  return (
    <Box component="form" onSubmit={(e) => handleSubmit(e, isKBM)} sx={{ mt: -4 }}>
      {/* ❌ Tidak ada lagi blok error di sini; semua error ke Alerts (view) */}
      <Grid container spacing={2} rowSpacing={1}>
        {/* Kelas (read-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
          <CustomOutlinedInput
            value={
              jadwalData?.nama_kelas ||
              (jadwalData?.kelas_id ? `Kelas #${jadwalData.kelas_id}` : "")
            }
            readOnly
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <IconBuilding size={18} />
              </InputAdornment>
            }
          />
        </Grid>

        {/* Hari (display-only) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
          <CustomOutlinedInput value={jadwalData?.hari || ""} readOnly fullWidth />
        </Grid>

        {/* Waktu (hanya hari yang sedang diedit) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Waktu</CustomFormLabel>
          <CustomOutlinedInput
            readOnly
            fullWidth
            value={
              jadwalData?.waktu
                ? `${jadwalData.waktu} • ${jadwalData?.kategori || ''}`
                : ''
            }
          />
        </Grid>

        {/* Offering (KBM only) */}
        {isKBM && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Offering (Mapel • Kode • Kelas)
            </CustomFormLabel>
            <CustomSelect
              name="offering_id"
              value={jadwalData?.offering_id || ""}
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

              {!isOfferingLoading && jadwalData?.offering_id && !hasCurrentOffering && (
                <MenuItem value={jadwalData.offering_id}>
                  {(jadwalData?.nama_mapel || "-") +
                    " • " +
                    (jadwalData?.nama_kelas || "-") +
                    " • " +
                    (jadwalData?.kode_offering || "-")}
                </MenuItem>
              )}

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
              value={jadwalData?.guru_id || ""}
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

              {!isGuruLoading && jadwalData?.guru_id && !hasCurrentGuru && (
                <MenuItem value={jadwalData.guru_id}>
                  {jadwalData?.nama_guru || "Guru terpilih"}
                </MenuItem>
              )}

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
