import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import PerangkatAjarGuruTable from "src/apps/waka-kurikulum/perangkat-ajar/List/PerangkatAjarGuruTable";
import PemilihSemester from "src/components/perangkat-ajar/PemilihSemester";
import FilterVerifikasi from "src/components/perangkat-ajar/FilterVerifikasi";
import { useSemesterTerpilih } from "src/components/perangkat-ajar/useSemesterTerpilih";
import { useJenisPerangkat } from "src/components/perangkat-ajar/useJenisPerangkat";
import { isIdAngka, STATUS_FILTER_OPTIONS, VERIFIKASI, WAKA_API } from "src/components/perangkat-ajar/perangkatAjarConfig";
import axiosInstance from "src/utils/axiosInstance";

const FILTER_DEFAULT = { status: "", sort: "nama" };

// Pagination, pencarian, dan filter diproses server karena jumlah guru bisa banyak.
// verifikasi: "terverifikasi" = semua dokumen guru sudah disetujui, "belum" = masih ada yang belum.
const fetchPerangkatAjarGuru = async ({ semesterId, page, rowsPerPage, search, verifikasi, filters }) => {
  const res = await axiosInstance.get(`${WAKA_API}/perangkat-ajar/guru`, {
    params: {
      semester_ajaran_id: semesterId,
      page: rowsPerPage === -1 ? 1 : page + 1,
      limit: rowsPerPage === -1 ? undefined : rowsPerPage,
      q: search || undefined,
      verifikasi: verifikasi || undefined,
      status: filters.status || undefined,
      sort: filters.sort,
    },
  });
  return {
    list: Array.isArray(res.data?.data) ? res.data.data : [],
    total: res.data?.meta?.total ?? 0,
  };
};

const PerangkatAjarGuruList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [verifikasi, setVerifikasi] = useState(VERIFIKASI.SEMUA);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(FILTER_DEFAULT);
  const [draft, setDraft] = useState(FILTER_DEFAULT);

  const { options: semesterOptions, semesterId, setSemesterId, isLoading: isSemesterLoading } =
    useSemesterTerpilih(WAKA_API);
  const { data: jenisList = [] } = useJenisPerangkat(WAKA_API);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["waka-perangkat-guru-list", { semesterId, page, rowsPerPage, search, verifikasi, filters }],
    queryFn: () => fetchPerangkatAjarGuru({ semesterId, page, rowsPerPage, search, verifikasi, filters }),
    enabled: !!semesterId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Debounce agar request ke server tidak terkirim di setiap ketukan tombol.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSemesterChange = (id) => {
    setSemesterId(id);
    setPage(0);
  };

  const handleSearchChange = (e) => setSearchInput(e.target.value);

  const handleVerifikasiChange = (value) => {
    setVerifikasi(value);
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDetail = (guruId) => {
    if (!isIdAngka(guruId)) return;
    const query = semesterId ? `?semester=${semesterId}` : "";
    navigate(`/dashboard/waka-kurikulum/perangkat-ajar/guru/${guruId}${query}`);
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => setDraft(FILTER_DEFAULT);
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Perangkat Ajar Guru" description="Monitoring Perangkat Ajar Guru">
      <ParentCard title="Daftar Guru dan Perangkat Ajar">
        <Alerts error={isError && queryError?.message} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            width: "100%",
            mb: 3,
          }}
        >
          <SearchButton value={searchInput} onChange={handleSearchChange} placeholder="Cari Nama Guru / NIP" />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <FilterVerifikasi value={verifikasi} onChange={handleVerifikasiChange} />
            <PemilihSemester
              options={semesterOptions}
              value={semesterId}
              onChange={handleSemesterChange}
              isLoading={isSemesterLoading}
            />
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <PerangkatAjarGuruTable
          guruList={data?.list || []}
          jenisList={jenisList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data?.total || 0}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleDetail={handleDetail}
          isLoading={isLoading || isSemesterLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
          emptyMessage={
            !semesterId
              ? "Belum ada semester ajaran"
              : search || verifikasi || filters.status
                ? "Tidak ada guru yang cocok dengan pencarian atau filter"
                : undefined
          }
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Perangkat Ajar</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>
            Status Dokumen
          </CustomFormLabel>
          <CustomSelect
            id="status"
            name="status"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            fullWidth
            displayEmpty
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort" sx={{ mt: 1.85 }}>
            Urutkan Berdasarkan
          </CustomFormLabel>
          <CustomSelect
            id="sort"
            name="sort"
            value={draft.sort}
            onChange={(e) => setDraft((p) => ({ ...p, sort: e.target.value }))}
            fullWidth
          >
            <MenuItem value="nama">Nama Guru (A→Z)</MenuItem>
            <MenuItem value="kelengkapan_asc">Kelengkapan Terendah</MenuItem>
            <MenuItem value="kelengkapan_desc">Kelengkapan Tertinggi</MenuItem>
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1 }}>
            <Button onClick={closeFilter}>Batal</Button>
            <Button onClick={clearFilter} color="secondary" variant="outlined">
              Reset
            </Button>
            <Button onClick={applyFilter} variant="contained">
              Terapkan
            </Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </PageContainer>
  );
};

export default PerangkatAjarGuruList;
