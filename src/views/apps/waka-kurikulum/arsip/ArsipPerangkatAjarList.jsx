import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Typography } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import ArsipPerangkatAjarTable from "src/apps/waka-kurikulum/arsip/List/ArsipPerangkatAjarTable";
import EksporArsipButtons from "src/apps/waka-kurikulum/arsip/EksporArsipButtons";
import PdfPreviewDialog from "src/components/perangkat-ajar/PdfPreviewDialog";
import RiwayatVersiDialog from "src/components/perangkat-ajar/RiwayatVersiDialog";
import { useSemesterTerpilih, labelSemester } from "src/components/perangkat-ajar/useSemesterTerpilih";
import { useJenisPerangkat } from "src/components/perangkat-ajar/useJenisPerangkat";
import { pesanGalatFile, unduhFile } from "src/components/perangkat-ajar/perangkatAjarApi";
import {
  formatUkuranFile,
  MAX_ZIP_SIZE,
  STATUS_CONFIG,
  STATUS_PERANGKAT,
  WAKA_API,
} from "src/components/perangkat-ajar/perangkatAjarConfig";
import { useSchoolTimezone } from "src/hooks/useSchoolTimezone";
import axiosInstance from "src/utils/axiosInstance";

// Arsip berisi dokumen yang sudah diunggah; default hanya yang sudah disetujui (versi final).
const FILTER_DEFAULT = { jenis: "", status: STATUS_PERANGKAT.DISETUJUI };

const STATUS_ARSIP_OPTIONS = [
  { value: "", label: "Semua Status" },
  ...[STATUS_PERANGKAT.DISETUJUI, STATUS_PERANGKAT.MENUNGGU_VALIDASI, STATUS_PERANGKAT.PERLU_REVISI].map((value) => ({
    value,
    label: STATUS_CONFIG[value].label,
  })),
];

const fetchTahunAjaran = async () => {
  const res = await axiosInstance.get(`${WAKA_API}/referensi/tahun-ajaran`);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchArsip = async (params) => {
  const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/arsip`, { params });
  return {
    list: Array.isArray(res.data?.data) ? res.data.data : [],
    total: res.data?.meta?.total ?? 0,
    ringkasan: res.data?.meta?.ringkasan || null,
  };
};

const ArsipPerangkatAjarList = () => {
  const timezone = useSchoolTimezone();
  const [error, setError] = useState("");
  const [tahunId, setTahunId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(FILTER_DEFAULT);
  const [draft, setDraft] = useState(FILTER_DEFAULT);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pratinjau, setPratinjau] = useState(null);
  const [riwayat, setRiwayat] = useState(null);
  const [unduhSedangId, setUnduhSedangId] = useState(null);

  const { options: semesterOptions } = useSemesterTerpilih(WAKA_API);
  const { data: jenisList = [] } = useJenisPerangkat(WAKA_API);
  const { data: tahunOptions = [], isLoading: isTahunLoading } = useQuery({
    queryKey: ["waka-tahun-ajaran-options"],
    queryFn: fetchTahunAjaran,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  // Default: tahun ajaran dari semester aktif.
  const tahunAktifId = semesterOptions.find((s) => s.is_aktif)?.tahun_ajaran?.id || tahunOptions[0]?.id || "";
  const tahunTerpilih = tahunId || tahunAktifId;
  const semesterDalamTahun = useMemo(
    () => semesterOptions.filter((s) => !s.tahun_ajaran?.id || s.tahun_ajaran.id === tahunTerpilih),
    [semesterOptions, tahunTerpilih],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Parameter filter dipakai bersama tabel dan tombol ekspor, supaya isi ekspor = yang terlihat.
  const filterParams = useMemo(
    () => ({
      tahun_ajaran_id: tahunTerpilih || undefined,
      semester_ajaran_id: semesterId || undefined,
      jenis: filters.jenis || undefined,
      status: filters.status || undefined,
      q: search || undefined,
    }),
    [tahunTerpilih, semesterId, filters, search],
  );

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["waka-arsip", { ...filterParams, page, rowsPerPage }],
    queryFn: () =>
      fetchArsip({
        ...filterParams,
        page: rowsPerPage === -1 ? 1 : page + 1,
        limit: rowsPerPage === -1 ? undefined : rowsPerPage,
      }),
    enabled: !!tahunTerpilih,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const handleTahunChange = (e) => {
    setTahunId(e.target.value);
    setSemesterId("");
    setPage(0);
  };

  const handleSemesterChange = (e) => {
    setSemesterId(e.target.value);
    setPage(0);
  };

  const urlFile = (item) => `${WAKA_API}/perangkat-ajar/dokumen/${item.dokumen_id}/file`;
  const judulItem = (item) =>
    `${item.jenis?.label || "Dokumen"} · ${item.guru?.nama || "-"} · ${item.mapel?.nama || "-"} ${item.kelas?.nama || ""}`.trim();

  const handleUnduh = async (item) => {
    setUnduhSedangId(item.dokumen_id);
    try {
      await unduhFile(urlFile(item), item.file?.nama);
    } catch (err) {
      setError(await pesanGalatFile(err, "File gagal diunduh. Silakan coba lagi."));
      setTimeout(() => setError(""), 3000);
    } finally {
      setUnduhSedangId(null);
    }
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  const ringkasan = data?.ringkasan;
  const labelStatusAktif = STATUS_ARSIP_OPTIONS.find((o) => o.value === filters.status)?.label;
  const labelJenisAktif = jenisList.find((j) => j.kode === filters.jenis)?.label;

  return (
    <PageContainer title="Arsip Perangkat Ajar" description="Arsip Perangkat Ajar per Semester / Tahun Ajaran">
      <ParentCard title="Arsip Perangkat Ajar">
        <Alerts error={error || (isError && queryError?.message)} />

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <CustomSelect
              value={tahunTerpilih}
              onChange={handleTahunChange}
              displayEmpty
              size="small"
              disabled={isTahunLoading}
              sx={{ minWidth: 200, height: 40 }}
            >
              <MenuItem value="" disabled>{isTahunLoading ? "Memuat..." : "Pilih Tahun Ajaran"}</MenuItem>
              {tahunOptions.map((t) => (
                <MenuItem key={t.id} value={t.id}>Tahun Ajaran {t.nama}</MenuItem>
              ))}
            </CustomSelect>
            <CustomSelect
              value={semesterId}
              onChange={handleSemesterChange}
              displayEmpty
              size="small"
              sx={{ minWidth: 200, height: 40 }}
            >
              <MenuItem value="">Semua Semester</MenuItem>
              {semesterDalamTahun.map((s) => (
                <MenuItem key={s.id} value={s.id}>{labelSemester(s)}</MenuItem>
              ))}
            </CustomSelect>
          </Box>
          <EksporArsipButtons
            filterParams={filterParams}
            disabled={!tahunTerpilih || !data?.total}
            // Server menolak ZIP > 500MB (409); cegah klik sia-sia dan arahkan untuk mempersempit filter.
            zipTerlaluBesar={(ringkasan?.ukuran_total || 0) > MAX_ZIP_SIZE}
            setError={setError}
          />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <SearchButton
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari guru / mapel / kelas / file"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {labelJenisAktif && <Chip size="small" label={labelJenisAktif} onDelete={() => setFilters((f) => ({ ...f, jenis: "" }))} />}
            <Chip size="small" color={filters.status ? "primary" : "default"} variant="outlined" label={labelStatusAktif} />
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        {ringkasan && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {data.total} dokumen · {ringkasan.jumlah_guru} guru · {ringkasan.disetujui} disetujui · total{" "}
            {formatUkuranFile(ringkasan.ukuran_total)}
          </Typography>
        )}

        <ArsipPerangkatAjarTable
          arsipList={data?.list || []}
          timezone={timezone}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.total || 0}
          handleChangePage={(_e, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onPratinjau={(item) => setPratinjau({ fileUrl: urlFile(item), judul: judulItem(item), namaFile: item.file?.nama })}
          onUnduh={handleUnduh}
          onRiwayat={(item) => setRiwayat({ dokumenId: item.dokumen_id, judul: judulItem(item) })}
          unduhSedangId={unduhSedangId}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat arsip"}
          emptyMessage={
            search || filters.jenis ? "Tidak ada dokumen yang cocok dengan pencarian atau filter" : undefined
          }
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Filter Arsip</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="jenis" sx={{ mt: 1.85 }}>Jenis Perangkat Ajar</CustomFormLabel>
          <CustomSelect
            id="jenis"
            value={draft.jenis}
            onChange={(e) => setDraft((p) => ({ ...p, jenis: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">Semua Jenis</MenuItem>
            {jenisList.map((j) => (
              <MenuItem key={j.kode} value={j.kode}>{j.label}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>Status Dokumen</CustomFormLabel>
          <CustomSelect
            id="status"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            fullWidth
            displayEmpty
          >
            {STATUS_ARSIP_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "semua"} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1 }}>
            <Button onClick={() => setFilterOpen(false)}>Batal</Button>
            <Button onClick={() => setDraft(FILTER_DEFAULT)} color="secondary" variant="outlined">Reset</Button>
            <Button onClick={applyFilter} variant="contained">Terapkan</Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>

      <PdfPreviewDialog
        open={Boolean(pratinjau)}
        onClose={() => setPratinjau(null)}
        fileUrl={pratinjau?.fileUrl}
        judul={pratinjau?.judul}
        namaFile={pratinjau?.namaFile}
      />

      <RiwayatVersiDialog
        open={Boolean(riwayat)}
        onClose={() => setRiwayat(null)}
        apiBase={WAKA_API}
        dokumenId={riwayat?.dokumenId}
        judul={riwayat?.judul}
        timezone={timezone}
      />
    </PageContainer>
  );
};

export default ArsipPerangkatAjarList;
