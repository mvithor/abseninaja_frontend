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
import MitraIndustriTable from "src/apps/kepala-jurusan/mitra-industri/List/MitraIndustriTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchMitraIndustriList = async () => {
  const res = await axiosInstance.get("/api/v1/kepala-jurusan/mitra-industri");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

const MitraIndustriList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    sort_by: "nama_industri",
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  const navigate = useNavigate();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["mitra-industri-list"],
    queryFn: fetchMitraIndustriList,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data mitra industri";
      setError(msg);
    },
    refetchOnWindowFocus: false,
  });

  const rawList = useMemo(() => data ?? [], [data]);

  const filteredList = useMemo(() => {
    let result = rawList;

    if (filters.status === "aktif") {
      result = result.filter((m) => m.status_aktif === true);
    } else if (filters.status === "nonaktif") {
      result = result.filter((m) => m.status_aktif === false);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (m) =>
          (m.nama_industri || "").toLowerCase().includes(q) ||
          (m.nama_kontak || "").toLowerCase().includes(q) ||
          (m.telepon_kontak || "").toLowerCase().includes(q),
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

  const handleAdd = () => navigate("/dashboard/kepala-jurusan/mitra-industri/tambah");
  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/kepala-jurusan/mitra-industri/edit/${id}`);
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({ status: "", sort_by: "nama_industri", sort_order: "asc" });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Mitra Industri" description="Kelola Mitra Industri PKL">
      <ParentCard title="Mitra Industri">
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
            placeholder="Cari Nama Industri / Kontak"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Mitra
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <MitraIndustriTable
          mitraIndustriList={pagedList}
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

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Mitra Industri</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>
            Status
          </CustomFormLabel>
          <CustomSelect
            id="status"
            name="status"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            fullWidth
            displayEmpty
          >
            {STATUS_OPTIONS.map((opt) => (
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
            <MenuItem value="nama_industri">Nama Industri</MenuItem>
            <MenuItem value="tanggal_mulai_kemitraan">Tanggal Mulai Kemitraan</MenuItem>
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

export default MitraIndustriList;