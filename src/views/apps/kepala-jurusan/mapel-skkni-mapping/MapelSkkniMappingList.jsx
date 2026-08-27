import { useState, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import MapelSkkniMappingTable from "src/apps/kepala-jurusan/mapel-skkni-mapping/List/MapelSkkniMappingTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

// ASUMSI: path ini mengikuti konvensi endpoint kepala-jurusan yang sudah ada
// (/api/v1/kepala-jurusan/mitra-industri). Cek router.js, sesuaikan kalau beda.
const MAPPING_ENDPOINT = "/api/v1/kepala-jurusan/mapel-skkni-mapping";
const SKKNI_UNIT_ENDPOINT = "/api/v1/kepala-jurusan/skkni-unit";

const fetchMappingList = async () => {
  const res = await axiosInstance.get(MAPPING_ENDPOINT);
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const fetchSkkniUnitOptions = async () => {
  const res = await axiosInstance.get(SKKNI_UNIT_ENDPOINT);
  const list = Array.isArray(res.data?.data) ? res.data.data : [];
  // Cuma unit aktif yang boleh dipilih — konsisten dengan validasi
  // is_aktif: true di setMapelSkkniMapping controller.
  return list.filter((u) => u.is_aktif !== false);
};

const MAPPING_STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "sudah", label: "Sudah di-mapping" },
  { value: "belum", label: "Belum di-mapping" },
];

const MapelSkkniMappingList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [onlyRelevan, setOnlyRelevan] = useState(true);

  const [filters, setFilters] = useState({ status: "" });
  const [draft, setDraft] = useState(filters);

  const [editTarget, setEditTarget] = useState(null); // { mata_pelajaran_id, nama_mapel, skkni_unit }
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["mapel-skkni-mapping-list"],
    queryFn: fetchMappingList,
    refetchOnWindowFocus: false,
  });

  const { data: unitOptions = [] } = useQuery({
    queryKey: ["skkni-unit-options"],
    queryFn: fetchSkkniUnitOptions,
    refetchOnWindowFocus: false,
    enabled: !!editTarget, // fetch on-demand pas dialog dibuka, bukan di awal load halaman
  });

  const saveMapping = useMutation({
    mutationFn: ({ mata_pelajaran_id, skkni_unit_id }) =>
      axiosInstance.put(`${MAPPING_ENDPOINT}/${mata_pelajaran_id}`, { skkni_unit_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mapel-skkni-mapping-list"] });
      setEditTarget(null);
    },
  });

  const rawList = useMemo(() => data ?? [], [data]);

  const hasAnyRelevanData = useMemo(
    () => rawList.some((m) => m.relevan_di_jurusan),
    [rawList],
  );

  const filteredList = useMemo(() => {
    let result = rawList;

    if (onlyRelevan && hasAnyRelevanData) {
      result = result.filter((m) => m.relevan_di_jurusan);
    }

    if (filters.status === "sudah") {
      result = result.filter((m) => !!m.skkni_unit);
    } else if (filters.status === "belum") {
      result = result.filter((m) => !m.skkni_unit);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (m) =>
          (m.nama_mapel || "").toLowerCase().includes(q) ||
          (m.kode_mapel || "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [rawList, onlyRelevan, hasAnyRelevanData, filters, search]);

  const totalCount = filteredList.length;
  const pagedList = useMemo(() => {
    if (rowsPerPage === -1) return filteredList;
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const handleEdit = (mapel) => {
    setEditTarget(mapel);
    setSelectedUnitId(mapel.skkni_unit?.id || "");
  };
  const closeEdit = () => {
    setEditTarget(null);
    saveMapping.reset();
  };

  const handleSaveMapping = () => {
    saveMapping.mutate({
      mata_pelajaran_id: editTarget.mata_pelajaran_id,
      skkni_unit_id: selectedUnitId || null,
    });
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => setDraft({ status: "" });
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Pemetaan Mapel-SKKNI" description="Pemetaan Mata Pelajaran ke Unit SKKNI">
      <ParentCard title="Pemetaan Mapel-SKKNI">
        <Alerts error={isError && (queryError?.message || "Terjadi kesalahan saat memuat data")} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <SearchButton
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari Kode / Nama Mapel"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyRelevan}
                  onChange={(e) => { setOnlyRelevan(e.target.checked); setPage(0); }}
                  disabled={!hasAnyRelevanData}
                />
              }
              label="Hanya mapel jurusan saya"
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <MapelSkkniMappingTable
          mappingList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      {/* Dialog Filter */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Pemetaan Mapel-SKKNI</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>
            Status Mapping
          </CustomFormLabel>
          <CustomSelect
            id="status"
            name="status"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            fullWidth
            displayEmpty
          >
            {MAPPING_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
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

      {/* Dialog Set/Ubah Unit SKKNI */}
      <Dialog open={!!editTarget} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Set Unit SKKNI — {editTarget?.nama_mapel}</DialogTitle>
        <DialogContent>
          {saveMapping.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveMapping.error?.response?.data?.msg || "Gagal menyimpan mapping"}
            </Alert>
          )}

          <CustomFormLabel htmlFor="skkni_unit_id" sx={{ mt: 1 }}>
            Unit SKKNI
          </CustomFormLabel>
          <CustomSelect
            id="skkni_unit_id"
            name="skkni_unit_id"
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">— Tidak ada / Hapus mapping —</MenuItem>
            {unitOptions.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.kode_unit} — {unit.judul_unit}
              </MenuItem>
            ))}
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={closeEdit}>Batal</Button>
            <Button
              onClick={handleSaveMapping}
              variant="contained"
              disabled={saveMapping.isPending}
            >
              {saveMapping.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </PageContainer>
  );
};

export default MapelSkkniMappingList;