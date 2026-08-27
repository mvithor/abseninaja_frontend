import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SkkniUnitTable from "src/apps/kepala-jurusan/skkni-unit/List/SkkniUnitTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchSkkniUnitList = async () => {
  const res = await axiosInstance.get("/api/v1/kepala-jurusan/skkni-unit");
  return {
    list: Array.isArray(res.data?.data) ? res.data.data : [],
    msg: res.data?.msg || null,
  };
};

const KATEGORI_OPTIONS = [
  { value: "", label: "Semua Kategori" },
  { value: "kompetensi_umum", label: "Kompetensi Umum" },
  { value: "kompetensi_inti", label: "Kompetensi Inti" },
  { value: "kompetensi_pilihan", label: "Kompetensi Pilihan" },
];

const SkkniUnitList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    kategori: "",
    sort_by: "kode_unit",
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  const navigate = useNavigate();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["skkni-unit-list"],
    queryFn: fetchSkkniUnitList,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data unit SKKNI";
      setError(msg);
    },
    refetchOnWindowFocus: false,
  });


  const rawList = useMemo(() => data?.list ?? [], [data]);

  const emptyStateMessage = rawList.length === 0 ? data?.msg : null;

  const filteredList = useMemo(() => {
    let result = rawList;

    if (filters.kategori) {
      result = result.filter((u) => u.kategori === filters.kategori);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (u) =>
          (u.kode_unit || "").toLowerCase().includes(q) ||
          (u.judul_unit || "").toLowerCase().includes(q),
      );
    }

    const sorted = [...result].sort((a, b) => {
      const av = (a[filters.sort_by] || "").toString().toLowerCase();
      const bv = (b[filters.sort_by] || "").toString().toLowerCase();
      if (av < bv) return filters.sort_order === "asc" ? -1 : 1;
      if (av > bv) return filters.sort_order === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rawList, filters, search]);

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

  const handleAdd = () => navigate("/dashboard/kepala-jurusan/skkni-unit/tambah");
  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/kepala-jurusan/skkni-unit/edit/${id}`);
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({ kategori: "", sort_by: "kode_unit", sort_order: "asc" });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Unit Kompetensi (SKKNI)" description="Kurasi Unit Kompetensi SKKNI Jurusan">
      <ParentCard title="Unit Kompetensi (SKKNI)">
        <Alerts error={error || (isError && queryError?.message)} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 3,
          }}
        >
          <SearchButton
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari Kode Unit / Judul Unit"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Unit
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <SkkniUnitTable
          skkniUnitList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
          emptyMessage={emptyStateMessage}
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Unit SKKNI</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kategori" sx={{ mt: 1.85 }}>
            Kategori
          </CustomFormLabel>
          <CustomSelect
            id="kategori"
            name="kategori"
            value={draft.kategori}
            onChange={(e) => setDraft((p) => ({ ...p, kategori: e.target.value }))}
            fullWidth
            displayEmpty
          >
            {KATEGORI_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_by" sx={{ mt: 1.85 }}>
            Urutkan Berdasarkan
          </CustomFormLabel>
          <CustomSelect
            id="sort_by"
            name="sort_by"
            value={draft.sort_by}
            onChange={(e) => setDraft((p) => ({ ...p, sort_by: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="kode_unit">Kode Unit</MenuItem>
            <MenuItem value="judul_unit">Judul Unit</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Arah Urutan
          </CustomFormLabel>
          <CustomSelect
            id="sort_order"
            name="sort_order"
            value={draft.sort_order}
            onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="asc">Naik (A→Z)</MenuItem>
            <MenuItem value="desc">Turun (Z→A)</MenuItem>
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

export default SkkniUnitList;