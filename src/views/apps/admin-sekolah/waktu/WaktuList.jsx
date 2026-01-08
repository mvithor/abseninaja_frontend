import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaktuTable from "src/apps/admin-sekolah/waktu/List/WaktuTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchDropdowns = async () => {
  // Promise.all: kategori waktu & hari paralel
  const [kw, h] = await Promise.all([
    axiosInstance.get("/api/v1/admin-sekolah/dropdown/kategori-waktu"),
    axiosInstance.get("/api/v1/admin-sekolah/dropdown/hari"),
  ]);
  return {
    kategori: Array.isArray(kw.data?.data) ? kw.data.data : [],
    hari: Array.isArray(h.data?.data) ? h.data.data : [],
  };
};

const fetchWaktuPaged = async ({ queryKey }) => {
  const [, params] = queryKey;

  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 10));
  if (params.filters?.sort_by) qs.set("sort_by", params.filters.sort_by);
  if (params.filters?.sort_order) qs.set("sort_order", params.filters.sort_order);

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    if (["q", "kategori_waktu_id", "hari_id"].includes(k)) {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    }
  });

  const url = `/api/v1/admin-sekolah/waktu?${qs.toString()}`;
  const res = await axiosInstance.get(url);
  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit: params.limit ?? 10, total: 0, total_pages: 0 },
  };
};

const WaktuList = () => {
  const [page, setPage] = useState(0);       
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔎 filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    kategori_waktu_id: "",
    hari_id: "",
    sort_by: "hari",         
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  const [kategoriOptions, setKategoriOptions] = useState([]);
  const [hariOptions, setHariOptions] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        const { kategori, hari } = await fetchDropdowns();
        setKategoriOptions(kategori);
        setHariOptions(hari);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("Error dropdown:", e);
      }
    })();
  }, []);

  const effectiveLimit = rowsPerPage === -1 ? "all" : rowsPerPage;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [
      "waktu-paged",
      {
        page: page + 1,     
        limit: effectiveLimit,
        filters,
      },
    ],
    queryFn: fetchWaktuPaged,
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

  // search
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

  // navigations
  const handleAdd = () => navigate('/dashboard/admin-sekolah/waktu/tambah-waktu');
  const handleEdit = (id) => {
    if (!id) return;
    navigate(`/dashboard/admin-sekolah/waktu/edit/${id}`);
  };

  // delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/waktu/${id}`);
      return response.data;
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['waktu-paged']);
      setSuccess(resp?.msg || "Waktu berhasil dihapus");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data waktu';
      setError(errorDetails.length ? errorDetails.join(', ') : errorMsg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteWaktu, setDeleteWaktu] = useState(null);
  const handleOpenConfirmDialog = (id) => { setDeleteWaktu(id); setConfirmDialogOpen(true); };
  const handleCloseConfirmDialog = () => { setConfirmDialogOpen(false); setDeleteWaktu(null); };
  const handleDelete = async () => {
    if (!deleteWaktu) { setError("Data jam tidak ditemukan"); return; }
    deleteMutation.mutate(deleteWaktu);
    setConfirmDialogOpen(false);
    setDeleteWaktu(null);
  };

  // Filter dialog controls
  const openFilter = () => { setDraft(filters); setFilterOpen(true); };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({
      q: filters.q,
      kategori_waktu_id: "",
      hari_id: "",
      sort_by: "hari",
      sort_order: "asc",
    });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Waktu" description="Waktu">
      <ParentCard title="Waktu">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2, 
            width: '100%',
            mb: 3,
          }}
        >
          <SearchButton
            value={filters.q}
            onChange={handleSearchChange}
            placeholder="Cari Kategori / Hari / Jam"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Jam
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <WaktuTable
          waktu={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}          
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          handleDelete={handleOpenConfirmDialog}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Waktu</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kategori_waktu_id" sx={{ mt: 1.85 }}>Kategori Waktu</CustomFormLabel>
          <CustomSelect
            id="kategori_waktu_id"
            name="kategori_waktu_id"
            value={draft.kategori_waktu_id}
            onChange={(e) => setDraft((p) => ({ ...p, kategori_waktu_id: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kategori Waktu" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Kategori</MenuItem>
            {kategoriOptions.map((k) => (
              <MenuItem key={k.id} value={k.id}>{k.nama_kategori}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="hari_id" sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
          <CustomSelect
            id="hari_id"
            name="hari_id"
            value={draft.hari_id}
            onChange={(e) => setDraft((p) => ({ ...p, hari_id: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Hari" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Hari</MenuItem>
            {hariOptions.map((h) => (
              <MenuItem key={h.id} value={h.id}>{h.nama_hari}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_by" sx={{ mt: 1.85 }}>Urutkan Berdasarkan</CustomFormLabel>
          <CustomSelect
            id="sort_by"
            name="sort_by"
            value={draft.sort_by}
            onChange={(e) => setDraft((p) => ({ ...p, sort_by: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kolom Urutan" }}
          >
            <MenuItem value="hari">Hari</MenuItem>
            <MenuItem value="kategori">Kategori</MenuItem>
            <MenuItem value="jam_mulai">Jam Mulai</MenuItem>
            <MenuItem value="jam_selesai">Jam Selesai</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>Arah Urutan</CustomFormLabel>
          <CustomSelect
            id="sort_order"
            name="sort_order"
            value={draft.sort_order}
            onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Arah Urutan" }}
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

      {/* Dialog Hapus */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            {deleteMutation.isLoading ? <CircularProgress size={28} /> : null}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            Apakah Anda yakin ingin menghapus data jam ?
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button
            sx={{ mr: 3 }}
            variant="outlined"
            color="secondary"
            onClick={handleCloseConfirmDialog}
            disabled={deleteMutation.isLoading}
          >
            Batal
          </Button>
          <Button
            sx={{ mr: 3, backgroundColor: "#F48C06", '&:hover': { backgroundColor: "#f7a944" } }}
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default WaktuList;
