import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, MenuItem, Tab, Tabs, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { IconShieldLock } from "@tabler/icons-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import PengaduanInbox from "src/apps/guru-bk/pengaduan/List/PengaduanInbox";
import { useKonteksBk } from "src/components/pemetaan-siswa/useKonteksBk";
import { BK_API } from "src/components/pemetaan-siswa/pemetaanConfig";
import { KATEGORI_PENGADUAN, URGENSI_PENGADUAN } from "src/components/pengaduan-bk/pengaduanConfig";
import axiosInstance from "src/utils/axiosInstance";

const LIMIT_AWAL = 30;

const fetchPengaduan = async (params) => {
  const res = await axiosInstance.get(`${BK_API}/pengaduan`, { params });
  return { list: res.data?.data || [], total: res.data?.meta?.total ?? 0, ringkasan: res.data?.meta?.ringkasan || null };
};

const PengaduanList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Pesan dari halaman detail (mis. pengaduan sudah ditugaskan ulang ke BK lain).
  const pesanMasuk = location.state?.pesan;
  const [searchParams, setSearchParams] = useSearchParams();
  const kelompok = searchParams.get("kelompok") === "arsip" ? "arsip" : "aktif";
  const ditugaskan = searchParams.get("ditugaskan") || "";
  const [kategori, setKategori] = useState("");
  const [urgensi, setUrgensi] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(LIMIT_AWAL);

  const { data: konteks } = useKonteksBk();
  const isKoordinator = Boolean(konteks?.is_koordinator);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const setParam = (k, v) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set(k, v);
      else next.delete(k);
      return next;
    }, { replace: true });
    setLimit(LIMIT_AWAL);
  };

  const params = {
    kelompok,
    ditugaskan: ditugaskan || undefined,
    kategori: kategori || undefined,
    urgensi: urgensi || undefined,
    q: search || undefined,
    page: 1,
    limit,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bk-pengaduan", params],
    queryFn: () => fetchPengaduan(params),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000, // pengaduan bisa masuk kapan saja
  });

  const ringkasan = data?.ringkasan;
  const adaFilter = Boolean(kategori || urgensi || search || ditugaskan);

  return (
    <PageContainer title="Pengaduan Anonim" description="Pengaduan anonim siswa">
      <ParentCard title="Pengaduan Anonim Siswa">
        <Alerts error={isError && (error?.response?.data?.msg || error?.message)} />
        {pesanMasuk && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            onClose={() => navigate(`${location.pathname}${location.search}`, { replace: true, state: null })}
          >
            {pesanMasuk}
          </Alert>
        )}
        <Alert severity="info" icon={<IconShieldLock size={20} />} sx={{ mb: 2 }}>
          Identitas pelapor tidak dicatat sistem. Balasan Anda hanya dapat dibaca pelapor melalui kode tiketnya.
          {!isKoordinator && " Anda melihat pengaduan yang ditugaskan kepada Anda."}
        </Alert>
        {ringkasan?.darurat_aktif > 0 && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button color="inherit" size="small" onClick={() => setUrgensi("darurat")}>Tampilkan</Button>}
          >
            {ringkasan.darurat_aktif} pengaduan <strong>darurat</strong> belum selesai ditangani.
          </Alert>
        )}

        <Tabs value={kelompok} onChange={(_e, v) => setParam("kelompok", v === "aktif" ? "" : v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
          <Tab value="aktif" label={`Aktif${ringkasan ? ` (${ringkasan.aktif})` : ""}`} sx={{ textTransform: "none" }} />
          <Tab value="arsip" label="Selesai & Ditutup" sx={{ textTransform: "none" }} />
        </Tabs>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <SearchButton value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari isi / kode tiket" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {isKoordinator && (
              <ToggleButtonGroup
                value={ditugaskan || "semua"}
                exclusive
                size="small"
                color="primary"
                onChange={(_e, v) => v && setParam("ditugaskan", v === "semua" ? "" : v)}
                sx={{ height: 40, "& .MuiToggleButton-root": { textTransform: "none", px: 1.5 } }}
              >
                <ToggleButton value="semua">Semua</ToggleButton>
                <ToggleButton value="belum">
                  Belum ditugaskan{ringkasan?.belum_ditugaskan ? ` (${ringkasan.belum_ditugaskan})` : ""}
                </ToggleButton>
                <ToggleButton value="saya">Tugas saya</ToggleButton>
              </ToggleButtonGroup>
            )}
            <CustomSelect value={kategori} onChange={(e) => setKategori(e.target.value)} displayEmpty size="small" sx={{ minWidth: 180, height: 40 }}>
              <MenuItem value="">Semua kategori</MenuItem>
              {KATEGORI_PENGADUAN.map((k) => <MenuItem key={k.kode} value={k.kode}>{k.label}</MenuItem>)}
            </CustomSelect>
            <CustomSelect value={urgensi} onChange={(e) => setUrgensi(e.target.value)} displayEmpty size="small" sx={{ minWidth: 150, height: 40 }}>
              <MenuItem value="">Semua urgensi</MenuItem>
              {URGENSI_PENGADUAN.map((u) => <MenuItem key={u.kode} value={u.kode}>{u.label}</MenuItem>)}
            </CustomSelect>
          </Box>
        </Box>

        <PengaduanInbox
          rows={data?.list || []}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message || "Terjadi kesalahan saat memuat pengaduan"}
          emptyMessage={
            adaFilter
              ? "Tidak ada pengaduan yang cocok dengan filter"
              : kelompok === "aktif"
                ? `Tidak ada pengaduan aktif${isKoordinator ? "" : " yang ditugaskan kepada Anda"}. Pengaduan yang dikirim siswa secara anonim akan muncul di sini.`
                : "Belum ada pengaduan yang selesai atau ditutup"
          }
          onBuka={(p) => isUUID(p.id) && navigate(`/dashboard/guru-bk/pengaduan/${p.id}`)}
        />

        {data && data.total > data.list.length && (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button variant="outlined" onClick={() => setLimit((l) => l + LIMIT_AWAL)} sx={{ textTransform: "none" }}>
              Tampilkan lebih banyak ({data.list.length} dari {data.total})
            </Button>
          </Box>
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default PengaduanList;
