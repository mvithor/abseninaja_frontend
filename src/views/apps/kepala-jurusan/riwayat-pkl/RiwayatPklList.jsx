import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem } from "@mui/material";
import { validate as isUUID } from "uuid";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import RiwayatPklTable from "src/apps/kepala-jurusan/riwayat-pkl/List/RiwayatPklTable";
import { useQuery } from "@tanstack/react-query";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { fetchRiwayatSemesters, fetchRiwayatPenempatan } from "../penempatan-pkl/penempatanPklApi";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

const RiwayatPklList = () => {
  const [semesterId, setSemesterId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({ kelas: "", status: "", sort_by: "nama", sort_order: "asc" });
  const [draft, setDraft] = useState(filters);
  const [draftSemesterId, setDraftSemesterId] = useState(null);

  const navigate = useNavigate();

  const semestersQuery = useQuery({
    queryKey: ["pkl-riwayat-semesters"],
    queryFn: fetchRiwayatSemesters,
    staleTime: 5 * 60_000,
  });
  const semesters = useMemo(() => semestersQuery.data ?? [], [semestersQuery.data]);

  // Default ke semester berdata paling baru (indeks 0, sudah diurutkan
  // server terbaru dulu).
  useEffect(() => {
    if (semesterId == null && semesters.length) setSemesterId(semesters[0].id);
  }, [semesters, semesterId]);

  const rosterQuery = useQuery({
    queryKey: ["pkl-riwayat", semesterId],
    queryFn: () => fetchRiwayatPenempatan(semesterId),
    enabled: semesterId != null,
    refetchOnWindowFocus: false,
  });

  const rawList = useMemo(() => rosterQuery.data?.students ?? [], [rosterQuery.data]);
  const kelasOptions = useMemo(() => {
    const set = new Set(rawList.map((r) => r.kelas).filter(Boolean));
    return Array.from(set).sort();
  }, [rawList]);

  const filteredList = useMemo(() => {
    let result = rawList;
    if (filters.kelas) result = result.filter((r) => r.kelas === filters.kelas);
    if (filters.status) result = result.filter((r) => r.status === filters.status);

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) => (r.nama || "").toLowerCase().includes(q) || (r.mitra?.nama || "").toLowerCase().includes(q),
      );
    }

    return [...result].sort((a, b) => {
      const av = (a[filters.sort_by] || "").toString().toLowerCase();
      const bv = (b[filters.sort_by] || "").toString().toLowerCase();
      if (av < bv) return filters.sort_order === "asc" ? -1 : 1;
      if (av > bv) return filters.sort_order === "asc" ? 1 : -1;
      return 0;
    });
  }, [rawList, filters, search]);

  const totalCount = filteredList.length;
  const pagedList = useMemo(() => {
    if (rowsPerPage === -1) return filteredList;
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const handleLihatDetail = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/kepala-jurusan/profil-siswa/detail/${id}`);
  };

  const openFilter = () => {
    setDraft(filters);
    setDraftSemesterId(semesterId);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  // Reset cuma kembalikan kelas/status/urutan — semester TIDAK ikut
  // direset, dia bukan filter yang bisa "dikosongkan", selalu harus
  // menunjuk ke salah satu semester berdata.
  const clearFilter = () => setDraft({ kelas: "", status: "", sort_by: "nama", sort_order: "asc" });
  const applyFilter = () => {
    setFilters(draft);
    if (draftSemesterId) setSemesterId(draftSemesterId);
    setPage(0);
    setFilterOpen(false);
  };

  const selectedSemesterLabel = semesters.find((s) => s.id === semesterId)?.label || "";


  const belumPernahAdaRiwayat = !semestersQuery.isPending && !semestersQuery.isError && semesters.length === 0;
  const tableIsLoading = semestersQuery.isPending || (semesterId != null && rosterQuery.isPending);
  const tableIsError = semestersQuery.isError || rosterQuery.isError;
  const tableErrorMessage = semestersQuery.isError
    ? (semestersQuery.error?.message || "Terjadi kesalahan saat memuat daftar semester")
    : (rosterQuery.error?.message || "Terjadi kesalahan saat memuat data");
  const tableEmptyMessage = belumPernahAdaRiwayat
    ? "Jurusan ini belum pernah menempatkan siswa PKL sama sekali"
    : `Tidak ada riwayat pada ${selectedSemesterLabel || "semester ini"}`;

  return (
    <PageContainer title="Riwayat PKL" description="Arsip Penempatan PKL Lintas Semester">
      <ParentCard title="Riwayat PKL">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, width: "100%", mb: 3 }}>
          <SearchButton value={search} onChange={handleSearchChange} placeholder="Cari Nama Siswa / Mitra" />
          <Box sx={{ display: "flex", gap: 1 }}>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <RiwayatPklTable
          rosterList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          onLihatDetail={handleLihatDetail}
          isLoading={tableIsLoading}
          isError={tableIsError}
          errorMessage={tableErrorMessage}
          emptyMessage={tableEmptyMessage}
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Riwayat PKL</DialogTitle>
        <DialogContent>
          {/* [BARU] Semester dipindah ke dalam dialog filter, dari baris
              terpisah di atas tabel sebelumnya. */}
          <CustomFormLabel htmlFor="semester" sx={{ mt: 1.85 }}>Semester</CustomFormLabel>
          <CustomSelect
            id="semester"
            value={draftSemesterId || ""}
            onChange={(e) => setDraftSemesterId(e.target.value)}
            fullWidth
            displayEmpty
            disabled={semesters.length === 0}
          >
            {semesters.length === 0 && <MenuItem value="">Belum ada riwayat</MenuItem>}
            {semesters.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}{s.isAktif ? " (Aktif)" : ""}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="kelas" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
          <CustomSelect id="kelas" value={draft.kelas} onChange={(e) => setDraft((p) => ({ ...p, kelas: e.target.value }))} fullWidth displayEmpty>
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </CustomSelect>

          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>Status Penempatan</CustomFormLabel>
          <CustomSelect id="status" value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))} fullWidth displayEmpty>
            {STATUS_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_by" sx={{ mt: 1.85 }}>Urutkan Berdasarkan</CustomFormLabel>
          <CustomSelect id="sort_by" value={draft.sort_by} onChange={(e) => setDraft((p) => ({ ...p, sort_by: e.target.value }))} fullWidth displayEmpty>
            <MenuItem value="nama">Nama</MenuItem>
            <MenuItem value="kelas">Kelas</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>Arah Urutan</CustomFormLabel>
          <CustomSelect id="sort_order" value={draft.sort_order} onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))} fullWidth displayEmpty>
            <MenuItem value="asc">Naik (A→Z)</MenuItem>
            <MenuItem value="desc">Turun (Z→A)</MenuItem>
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1 }}>
            <Button onClick={closeFilter}>Batal</Button>
            <Button onClick={clearFilter} color="secondary" variant="outlined">Reset</Button>
            <Button onClick={applyFilter} variant="contained">Terapkan</Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </PageContainer>
  );
};

export default RiwayatPklList;