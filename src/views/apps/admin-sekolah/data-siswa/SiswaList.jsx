import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Typography, CircularProgress } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import SiswaTable from "src/apps/admin-sekolah/data-siswa/List/SiswaTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";

const fetchKelasList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/kelas");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error kelas:", e);
    return [];
  }
};

const fetchSiswaPaged = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));       
  qs.set("limit", String(params.limit ?? 10));

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const url = `/api/v1/admin-sekolah/siswa?${qs.toString()}`;
  const res = await axiosInstance.get(url);
  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit: params.limit ?? 10, total: 0, total_pages: 0 },
  };
};

const SiswaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [filters, setFilters] = useState({
    q: "",       
    kelas_id: "",  
    nama_kelas: "", 
    nis: "",     
    sort_by: "created_at",  
    sort_order: "desc",    
  });

  // draft di dialog
  const [draft, setDraft] = useState(filters);
  const [kelasOptions, setKelasOptions] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // dropdown kelas
  useEffect(() => {
    const load = async () => setKelasOptions(await fetchKelasList());
    load();
  }, []);

  const effectiveLimit = rowsPerPage === -1 ? "all" : rowsPerPage;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [
      "siswa-paged",
      {
        page: page + 1,
        limit: effectiveLimit,
        filters,
      },
    ],
    queryFn: fetchSiswaPaged,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? { page: 1, limit: effectiveLimit, total: 0, total_pages: 0 };
  const totalCount = meta.total ?? rows.length;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, q: val }));
    setPage(0);
  };

  // pagination handlers
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const handleAdd = () => navigate("/dashboard/admin-sekolah/siswa/tambah");

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/siswa/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['siswa-paged'] });
      setSuccess(data.msg || 'Data siswa berhasil dihapus');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      const msg = err.response?.data?.msg || 'Terjadi kesalahan saat menghapus data siswa';
      setError(msg);
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    },
  });

  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/admin-sekolah/siswa/edit/${id}`);
  };

  const handleDelete = (id) => {
    if (!id || !isUUID(id)) return;
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Filter dialog controls
  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({
      q: filters.q,     
      kelas_id: "",
      nama_kelas: "",
      nis: "",
      sort_by: "created_at",
      sort_order: "desc",
    });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Data Siswa" description="Data Siswa">
      <ParentCard title="Data Siswa">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 3,
            mt: -2,
          }}
        >
          <SearchButton
            value={filters.q}
            onChange={handleSearchChange}
            placeholder="Cari Nama Siswa"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Siswa
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <SiswaTable
          siswa={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus data siswa ini?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCancelDelete} sx={{ mr: 2 }}>
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isLoading}
            sx={{
              backgroundColor: '#F48C06',
              '&:hover': { backgroundColor: '#f7a944' },
            }}
          >
            {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Filter */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Siswa</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kelas_id" sx={{ mt: 1.85 }}>
            Kelas
          </CustomFormLabel>
          <CustomSelect
            id="kelas_id"
            name="kelas_id"
            value={draft.kelas_id}
            onChange={(e) => setDraft((p) => ({ ...p, kelas_id: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kelas" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>
          <CustomFormLabel htmlFor="nis" sx={{ mt: 1.85 }}>
            NIS
          </CustomFormLabel>
          <CustomTextField
            id="nis"
            name="nis"
            value={draft.nis}
            onChange={(e) => setDraft((p) => ({ ...p, nis: e.target.value }))}
            fullWidth
            placeholder="Masukkan NIS"
          />
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
            inputProps={{ "aria-label": "Pilih Kolom Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="nama">Nama</MenuItem>
            <MenuItem value="kelas">Kelas</MenuItem>
            <MenuItem value="nis">NIS</MenuItem>
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
            inputProps={{ "aria-label": "Pilih Arah Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="asc">Naik (A→Z/Terlama)</MenuItem>
            <MenuItem value="desc">Turun (Z→A/Terbaru)</MenuItem>
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

export default SiswaList;
