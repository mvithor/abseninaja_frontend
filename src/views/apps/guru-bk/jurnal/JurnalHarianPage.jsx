import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import JurnalHarianList from "src/apps/guru-bk/jurnal/List/JurnalHarianList";
import PenangananDetailDialog from "src/components/jurnal-bk/PenangananDetailDialog";
import HapusPenangananDialog from "src/components/jurnal-bk/HapusPenangananDialog";
import PermintaanAksesBanner from "src/components/jurnal-bk/PermintaanAksesBanner";
import PemilihLingkup from "src/components/pemetaan-siswa/PemilihLingkup";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { BK_API, LINGKUP } from "src/components/pemetaan-siswa/pemetaanConfig";
import {
  hariIniDi,
  JENIS_LAYANAN,
  KATEGORI_MASALAH,
  STATUS_PENANGANAN_OPTIONS,
} from "src/components/jurnal-bk/jurnalConfig";
import { formatTanggalYMD, parseTanggalYMD } from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

const URL_JURNAL = "/dashboard/guru-bk/jurnal";
const LIMIT_AWAL = 50;
const FILTER_KOSONG = { jenis_layanan: "", kategori: "", status: "" };
const RENTANG_CEPAT = [
  { kode: "hari", label: "Hari ini", hari: 0 },
  { kode: "7", label: "7 hari", hari: 6 },
  { kode: "30", label: "30 hari", hari: 29 },
];

const geserTanggal = (ymd, hari) => {
  const d = parseTanggalYMD(ymd);
  d.setDate(d.getDate() + hari);
  return formatTanggalYMD(d);
};

const fetchJurnal = async (params) => {
  const res = await axiosInstance.get(`${BK_API}/jurnal`, { params });
  return { list: res.data?.data || [], total: res.data?.meta?.total ?? 0, ringkasan: res.data?.meta?.ringkasan || null };
};

// Rentang tanggal & filter disimpan di URL (?dari, sampai, lingkup, penulis, jenis_layanan, kategori, status).
const JurnalHarianPage = () => {
  const navigate = useNavigate();
  const timezone = useSchoolTimezone();
  const hariIni = hariIniDi(timezone);
  const [searchParams, setSearchParams] = useSearchParams();
  const dari = searchParams.get("dari") || hariIni;
  const sampai = searchParams.get("sampai") || dari;
  const lingkup = searchParams.get("lingkup") || LINGKUP.SAYA;
  const penulis = searchParams.get("penulis") || "";
  const filters = {
    jenis_layanan: searchParams.get("jenis_layanan") || "",
    kategori: searchParams.get("kategori") || "",
    status: searchParams.get("status") || "",
  };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(LIMIT_AWAL);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState(FILTER_KOSONG);
  const [detail, setDetail] = useState(null);
  const [hapus, setHapus] = useState(null);

  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);

  const setParam = useCallback(
    (perubahan) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(perubahan).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          return next;
        },
        { replace: true },
      );
      setLimit(LIMIT_AWAL);
    },
    [setSearchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = {
    tanggal_mulai: dari,
    tanggal_selesai: sampai,
    lingkup: isKoordinator ? lingkup : LINGKUP.SAYA,
    penulis: penulis || undefined,
    jenis_layanan: filters.jenis_layanan || undefined,
    kategori: filters.kategori || undefined,
    status: filters.status || undefined,
    q: search || undefined,
    page: 1,
    limit,
  };

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["bk-jurnal", params],
    queryFn: () => fetchJurnal(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const satuHari = dari === sampai;
  const rentangAktif = RENTANG_CEPAT.find((r) => sampai === hariIni && dari === geserTanggal(hariIni, -r.hari))?.kode || null;

  const pilihRentang = (kode) => {
    const r = RENTANG_CEPAT.find((x) => x.kode === kode);
    if (r) setParam({ dari: geserTanggal(hariIni, -r.hari), sampai: hariIni });
  };

  const setRentang = (kunci, tanggal) => {
    const ymd = formatTanggalYMD(tanggal);
    if (!ymd) return;
    if (kunci === "dari") setParam({ dari: ymd, sampai: ymd > sampai ? ymd : sampai });
    else setParam({ sampai: ymd, dari: ymd < dari ? ymd : dari });
  };

  const tampilkanPesan = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(""), 4000);
  };

  const handleUbah = (entri) => {
    if (isUUID(entri.id)) navigate(`${URL_JURNAL}/edit/${entri.id}`);
  };

  const labelFilter = [
    filters.jenis_layanan && JENIS_LAYANAN.find((j) => j.kode === filters.jenis_layanan)?.label,
    filters.kategori && KATEGORI_MASALAH.find((k) => k.kode === filters.kategori)?.label,
    filters.status && STATUS_PENANGANAN_OPTIONS.find((s) => s.kode === filters.status)?.label,
  ].filter(Boolean);

  const ringkasan = data?.ringkasan;
  const sxTanggal = { textField: { size: "small", sx: { width: 160 } } };

  return (
    <PageContainer title="Jurnal Harian" description="Jurnal Harian Penanganan Siswa">
      <ParentCard title="Jurnal Harian Penanganan Siswa">
        <Alerts error={error || (isError && (queryError?.response?.data?.msg || queryError?.message))} success={success} />
        <PermintaanAksesBanner timezone={timezone} onLihatCatatan={setDetail} />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <ToggleButtonGroup
              value={rentangAktif}
              exclusive
              size="small"
              color="primary"
              onChange={(_e, v) => v && pilihRentang(v)}
              sx={{ height: 40, "& .MuiToggleButton-root": { textTransform: "none", px: 1.5 } }}
            >
              {RENTANG_CEPAT.map((r) => <ToggleButton key={r.kode} value={r.kode}>{r.label}</ToggleButton>)}
            </ToggleButtonGroup>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {satuHari && (
                <Tooltip title="Hari sebelumnya">
                  <IconButton onClick={() => setParam({ dari: geserTanggal(dari, -1), sampai: geserTanggal(dari, -1) })}>
                    <IconChevronLeft size={18} />
                  </IconButton>
                </Tooltip>
              )}
              <DatePicker value={parseTanggalYMD(dari)} onChange={(d) => setRentang("dari", d)} format="dd/MM/yyyy" disableFuture slotProps={sxTanggal} />
              <Typography variant="body2" color="text.secondary">s.d.</Typography>
              <DatePicker value={parseTanggalYMD(sampai)} onChange={(d) => setRentang("sampai", d)} format="dd/MM/yyyy" disableFuture slotProps={sxTanggal} />
              {satuHari && (
                <Tooltip title="Hari berikutnya">
                  <span>
                    <IconButton
                      disabled={dari >= hariIni}
                      onClick={() => setParam({ dari: geserTanggal(dari, 1), sampai: geserTanggal(dari, 1) })}
                    >
                      <IconChevronRight size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </LocalizationProvider>
          </Box>
          <AddButton icon={<IconPlus size={20} color="white" />} onClick={() => navigate(`${URL_JURNAL}/tambah`)}>
            Catat Penanganan
          </AddButton>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            ["Penanganan", ringkasan?.jumlah_penanganan],
            ["Siswa ditangani", ringkasan?.jumlah_siswa],
            ["Perlu tindak lanjut", ringkasan?.tindak_lanjut],
          ].map(([label, nilai]) => (
            <Grid key={label} size={{ xs: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: "divider" }}>
                <Typography variant="h4">{nilai ?? "-"}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <SearchButton value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari siswa / masalah" />
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            {labelFilter.map((l) => <Chip key={l} size="small" label={l} />)}
            {labelFilter.length > 0 && (
              <Button size="small" onClick={() => setParam(FILTER_KOSONG)} sx={{ textTransform: "none" }}>Hapus filter</Button>
            )}
            <ToggleButtonGroup
              value={penulis || "semua"}
              exclusive
              size="small"
              color="primary"
              onChange={(_e, v) => v && setParam({ penulis: v === "saya" ? "saya" : "" })}
              sx={{ height: 40, "& .MuiToggleButton-root": { textTransform: "none", px: 1.5 } }}
            >
              <ToggleButton value="semua">Semua catatan</ToggleButton>
              <ToggleButton value="saya">Catatan saya</ToggleButton>
            </ToggleButtonGroup>
            {isKoordinator && <PemilihLingkup value={lingkup} onChange={(v) => setParam({ lingkup: v === LINGKUP.SAYA ? "" : v })} />}
            <FilterButton onClick={() => { setDraft(filters); setFilterOpen(true); }} />
          </Box>
        </Box>

        <JurnalHarianList
          entriList={data?.list || []}
          hariIni={hariIni}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat jurnal"}
          emptyMessage={
            labelFilter.length || search ? "Tidak ada catatan yang cocok dengan filter" : satuHari ? "Belum ada penanganan pada tanggal ini" : "Belum ada penanganan pada rentang ini"
          }
          onDetail={setDetail}
          onUbah={handleUbah}
          onHapus={setHapus}
          onTambah={() => navigate(`${URL_JURNAL}/tambah`)}
        />

        {data && data.total > data.list.length && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="outlined" onClick={() => setLimit((l) => l + LIMIT_AWAL)} sx={{ textTransform: "none" }}>
              Tampilkan lebih banyak ({data.list.length} dari {data.total})
            </Button>
          </Box>
        )}
      </ParentCard>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Filter Jurnal</DialogTitle>
        <DialogContent>
          {[
            ["jenis_layanan", "Jenis layanan", JENIS_LAYANAN],
            ["kategori", "Kategori masalah", KATEGORI_MASALAH],
            ["status", "Status", STATUS_PENANGANAN_OPTIONS],
          ].map(([kunci, label, opsi]) => (
            <Box key={kunci}>
              <CustomFormLabel htmlFor={kunci} sx={{ mt: 1.85 }}>{label}</CustomFormLabel>
              <CustomSelect
                id={kunci}
                value={draft[kunci]}
                onChange={(e) => setDraft((p) => ({ ...p, [kunci]: e.target.value }))}
                fullWidth
                displayEmpty
              >
                <MenuItem value="">Semua</MenuItem>
                {opsi.map((o) => <MenuItem key={o.kode} value={o.kode}>{o.label}</MenuItem>)}
              </CustomSelect>
            </Box>
          ))}
          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1 }}>
            <Button onClick={() => setFilterOpen(false)}>Batal</Button>
            <Button onClick={() => setDraft(FILTER_KOSONG)} color="secondary" variant="outlined">Reset</Button>
            <Button
              variant="contained"
              onClick={() => {
                setParam(draft);
                setFilterOpen(false);
              }}
            >
              Terapkan
            </Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>

      <PenangananDetailDialog
        entri={detail}
        timezone={timezone}
        onClose={() => setDetail(null)}
        onUbah={(e) => {
          setDetail(null);
          handleUbah(e);
        }}
      />
      <HapusPenangananDialog
        entri={hapus}
        onClose={() => setHapus(null)}
        onSuccess={(msg) => {
          setHapus(null);
          tampilkanPesan(setSuccess, msg);
        }}
        onError={(msg) => {
          setHapus(null);
          tampilkanPesan(setError, msg);
        }}
      />
    </PageContainer>
  );
};

export default JurnalHarianPage;
