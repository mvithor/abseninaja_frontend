import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, TextField } from "@mui/material";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SiswaPklTable from "src/apps/kepala-jurusan/siswa-pkl/List/SiswaPklTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { fetchSiswaPklAktif, cancelPlacement } from "../penempatan-pkl/penempatanPklApi";

const DRIFT_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "MEMBURUK", label: "Memburuk (perlu perhatian)" },
  { value: "MEMBAIK", label: "Membaik" },
  { value: "BERUBAH", label: "Berubah" },
  { value: "SAMA", label: "Tidak berubah" },
];

const SiswaPklList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [filters, setFilters] = useState({ kelas: "", drift: "", sort_by: "nama", sort_order: "asc" });
  const [draft, setDraft] = useState(filters);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pkl-siswa-aktif"],
    queryFn: fetchSiswaPklAktif,
    refetchOnWindowFocus: false,
  });

  const rawList = useMemo(() => query.data?.students ?? [], [query.data]);
  const semesterLabel = query.data?.semester?.label || "";

  const kelasOptions = useMemo(() => {
    const set = new Set(rawList.map((r) => r.kelas).filter(Boolean));
    return Array.from(set).sort();
  }, [rawList]);

  const filteredList = useMemo(() => {
    let result = rawList;
    if (filters.kelas) result = result.filter((r) => r.kelas === filters.kelas);
    if (filters.drift) result = result.filter((r) => r.drift === filters.drift);

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) => (r.nama || "").toLowerCase().includes(q) || (r.mitra?.nama || "").toLowerCase().includes(q),
      );
    }

    const numericFields = ["matchScoreSaatItu"];
    return [...result].sort((a, b) => {
      const av = a[filters.sort_by];
      const bv = b[filters.sort_by];
      if (numericFields.includes(filters.sort_by)) {
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return filters.sort_order === "asc" ? av - bv : bv - av;
      }
      const avStr = (av || "").toString().toLowerCase();
      const bvStr = (bv || "").toString().toLowerCase();
      if (avStr < bvStr) return filters.sort_order === "asc" ? -1 : 1;
      if (avStr > bvStr) return filters.sort_order === "asc" ? 1 : -1;
      return 0;
    });
  }, [rawList, filters, search]);

  const totalCount = filteredList.length;
  const pagedList = useMemo(() => {
    if (rowsPerPage === -1) return filteredList;
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const cancelMutation = useMutation({
    mutationFn: ({ placementId, reason }) => cancelPlacement(placementId, reason),
    onSuccess: () => {
      setSuccess("Penempatan dibatalkan. Slot dikembalikan. Siswa ini sekarang muncul di Riwayat PKL.");
      setCancelDialog(null);
      setCancelReason("");
      queryClient.invalidateQueries({ queryKey: ["pkl-siswa-aktif"] });
      setTimeout(() => setSuccess(""), 4000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || "Gagal membatalkan penempatan");
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const handleLihatDetail = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/kepala-jurusan/profil-siswa/detail/${id}`);
  };

  const openCancelDialog = (row) => { setCancelReason(""); setCancelDialog({ row }); };
  const commitCancel = () => {
    if (!cancelDialog || !cancelReason.trim()) return;
    cancelMutation.mutate({ placementId: cancelDialog.row.placementId, reason: cancelReason.trim() });
  };

  const openFilter = () => { setDraft(filters); setFilterOpen(true); };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => setDraft({ kelas: "", drift: "", sort_by: "nama", sort_order: "asc" });
  const applyFilter = () => { setFilters(draft); setPage(0); setFilterOpen(false); };

  return (
    <PageContainer title="Siswa PKL" description="Siswa yang sedang menjalani PKL semester ini">
      <ParentCard title={`Siswa PKL${semesterLabel ? ` — ${semesterLabel}` : ''}`}>
        <Alerts error={error} success={success} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, width: "100%", mb: 3 }}>
          <SearchButton value={search} onChange={handleSearchChange} placeholder="Cari Nama Siswa / Mitra" />
          <Box sx={{ display: "flex", gap: 1 }}>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <SiswaPklTable
          rosterList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          onBatalkan={openCancelDialog}
          onLihatDetail={handleLihatDetail}
          isLoading={query.isPending}
          isError={query.isError}
          errorMessage={query.error?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Siswa PKL</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kelas" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
          <CustomSelect id="kelas" value={draft.kelas} onChange={(e) => setDraft((p) => ({ ...p, kelas: e.target.value }))} fullWidth displayEmpty>
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </CustomSelect>

          <CustomFormLabel htmlFor="drift" sx={{ mt: 1.85 }}>Perubahan Kuadran</CustomFormLabel>
          <CustomSelect id="drift" value={draft.drift} onChange={(e) => setDraft((p) => ({ ...p, drift: e.target.value }))} fullWidth displayEmpty>
            {DRIFT_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_by" sx={{ mt: 1.85 }}>Urutkan Berdasarkan</CustomFormLabel>
          <CustomSelect id="sort_by" value={draft.sort_by} onChange={(e) => setDraft((p) => ({ ...p, sort_by: e.target.value }))} fullWidth displayEmpty>
            <MenuItem value="nama">Nama</MenuItem>
            <MenuItem value="kelas">Kelas</MenuItem>
            <MenuItem value="keputusanPada">Tanggal Keputusan</MenuItem>
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

      <Dialog open={Boolean(cancelDialog)} onClose={() => !cancelMutation.isPending && setCancelDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Batalkan Penempatan</DialogTitle>
        <DialogContent>
          {cancelDialog && (
            <>
              <Box sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                Batalkan penempatan <b>{cancelDialog.row.nama}</b> di <b>{cancelDialog.row.mitra?.nama}</b>? Slot industri akan dikembalikan.
              </Box>
              <TextField
                fullWidth multiline minRows={2} size="small"
                label="Alasan pembatalan"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog(null)} disabled={cancelMutation.isPending}>Tidak</Button>
          <Button onClick={commitCancel} disabled={cancelMutation.isPending || !cancelReason.trim()} variant="contained" color="error">
            {cancelMutation.isPending ? 'Membatalkan...' : 'Ya, Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default SiswaPklList;