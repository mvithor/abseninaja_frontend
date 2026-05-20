import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  CircularProgress,
  Typography
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import PpdbJadwalTahapanTable from "src/apps/admin-sekolah/ppdb/ppdb-jadwal-tahapan/PpdbJadwalTahapanTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const toErrorMessage = (err, fallback) => {
  const msg = err?.response?.data?.msg || err?.message;
  if (!msg) return fallback;
  if (typeof msg === "string") return msg;
  try {
    return JSON.stringify(msg);
  } catch {
    return fallback;
  }
};

const fetchJadwalPaged = async ({ queryKey }) => {
  const [, params] = queryKey;

  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 10));

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });

  const url = `/api/v1/admin-sekolah/ppdb/jadwal-tahapan?${qs.toString()}`;
  const res = await axiosInstance.get(url);

  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit: params.limit ?? 10, total_rows: 0, total_pages: 0 }
  };
};

const PpdbJadwalTahapanList = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    is_active: "",  
    sort_by: "",    
    sort_dir: "asc",
  });

  const [draft, setDraft] = useState(filters);

  const effectiveLimit = rowsPerPage === -1 ? 200 : rowsPerPage;
  const effectivePage = page + 1;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [
      "ppdb-jadwal-paged",
      {
        page: effectivePage,
        limit: effectiveLimit,
        filters: {
          q: filters.q || "",
          is_active: filters.is_active,
          sort_by: filters.sort_by || "",
          sort_dir: filters.sort_dir || "asc",
        },
      },
    ],
    queryFn: fetchJadwalPaged,
    onError: (err) => {
      const msg = toErrorMessage(err, "Terjadi kesalahan saat memuat data");
      setError(msg);
      setTimeout(() => setError(""), 3500);
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? { page: effectivePage, limit: effectiveLimit, total_rows: 0, total_pages: 0 };
  const totalCount = Number(meta?.total_rows || 0);

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      axiosInstance.patch(`/api/v1/admin-sekolah/ppdb/jadwal-tahapan/${id}/toggle-active`, { is_active }),
    onSuccess: (res) => {
      qc.invalidateQueries(["ppdb-jadwal-paged"]);
      setSuccess(res.data?.msg || "Status jadwal berhasil diubah");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      setError(toErrorMessage(err, "Gagal mengubah status jadwal"));
      setTimeout(() => setError(""), 3500);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb/jadwal-tahapan/${id}`),
    onSuccess: (res) => {
      qc.invalidateQueries(["ppdb-jadwal-paged"]);
      setSuccess(res.data?.msg || "Jadwal Tahapan berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(toErrorMessage(err, "Gagal menghapus jadwal"));
      setTimeout(() => setError(""), 3500);
    }
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, q: val }));
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const handleAdd = () => navigate("/dashboard/admin-sekolah/ppdb-jadwal-tahapan/tambah");

  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/admin-sekolah/ppdb-jadwal-tahapan/edit/${id}`);
  };

  const openDeleteConfirm = (id) => {
    if (!id || !isUUID(id)) return;
    setDeleteId(id);
    setConfirmDialogOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    closeDeleteConfirm();
  };

  const handleToggle = (id, nextActive) => {
    if (!id || !isUUID(id)) return;
    toggleMutation.mutate({ id, is_active: Boolean(nextActive) });
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };

  const closeFilter = () => setFilterOpen(false);

  const clearFilter = () => {
    setDraft({
      q: filters.q,
      is_active: "",
      sort_by: "",
      sort_dir: "asc",
    });
  };

  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Jadwal Tahapan PMB" description="Jadwal tahapan untuk PMB">
      <ParentCard title="Jadwal Tahapan PMB">
        <Alerts error={error} success={success} />

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
            value={filters.q}
            onChange={handleSearchChange}
            placeholder="Cari (title / lokasi / deskripsi / tipe)"
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Jadwal
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <PpdbJadwalTahapanTable
          rows={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          handleDelete={openDeleteConfirm}
          handleToggle={handleToggle}
          isLoading={isLoading || toggleMutation.isLoading || deleteMutation.isLoading}
          isError={isError}
          errorMessage={toErrorMessage(queryError, "Terjadi kesalahan saat memuat data")}
        />
      </ParentCard>

      {/* ===================== Filter Dialog ===================== */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Jadwal</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status
          </CustomFormLabel>
          <CustomSelect
            id="is_active"
            name="is_active"
            value={draft.is_active}
            onChange={(e) => setDraft((p) => ({ ...p, is_active: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Status" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Nonaktif</MenuItem>
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
            inputProps={{ "aria-label": "Pilih Kolom Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="start_at">Mulai</MenuItem>
            <MenuItem value="end_at">Selesai</MenuItem>
            <MenuItem value="sequence">Urutan</MenuItem>
            <MenuItem value="title">Event</MenuItem>
            <MenuItem value="is_active">Status</MenuItem>
            <MenuItem value="updated_at">Updated</MenuItem>
            <MenuItem value="created_at">Created</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_dir" sx={{ mt: 1.85 }}>
            Arah Urutan
          </CustomFormLabel>
          <CustomSelect
            id="sort_dir"
            name="sort_dir"
            value={draft.sort_dir}
            onChange={(e) => setDraft((p) => ({ ...p, sort_dir: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Arah Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="asc">Naik (ASC)</MenuItem>
            <MenuItem value="desc">Turun (DESC)</MenuItem>
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
      <Dialog
        open={confirmDialogOpen}
        onClose={closeDeleteConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus jadwal tahapan ini?
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: -1 }}>
            Jika PMB Period sudah berjalan, sebaiknya nonaktifkan saja agar jejak audit tetap aman.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button variant="outlined" onClick={closeDeleteConfirm}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeleteConfirmed}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? (
              <CircularProgress size={22} />
            ) : (
              "Hapus"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {(toggleMutation.isLoading || deleteMutation.isLoading) ? (
        <Box sx={{ position: "fixed", right: 22, bottom: 22 }}>
          <CircularProgress size={26} />
        </Box>
      ) : null}
    </PageContainer>
  );
};

export default PpdbJadwalTahapanList;
