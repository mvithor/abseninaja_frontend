import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  MenuItem,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import DeleteButton from "src/components/button-group/DeleteButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaliSiswaTable from "src/apps/admin-sekolah/data-wali-siswa/List/WaliSiswaTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchKelasList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/kelas");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Err kelas:", e);
    return [];
  }
};

const fetchWaliSiswaFilter = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();

  const isAll =
    String(params.limit).toLowerCase() === "all" ||
    String(params.limit) === "-1";
  qs.set("page", String(isAll ? 1 : (params.page ?? 1)));
  qs.set("limit", isAll ? "all" : String(params.limit ?? 10));

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (k === "has_nomor_telepon") {
      qs.append(k, String(v).toLowerCase() === "true" ? "true" : "false");
    } else {
      qs.append(k, v);
    }
  });

  const url = `/api/v1/admin-sekolah/wali-siswa?${qs.toString()}`;

  try {
    const res = await axiosInstance.get(url);
    return {
      rows: Array.isArray(res.data?.data) ? res.data.data : [],
      meta:
        res.data?.meta || {
          page: Number(qs.get("page")) || 1,
          limit: isAll ? "all" : Number(qs.get("limit")) || 10,
          total: 0,
          total_pages: 0,
        },
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching wali siswa(filter):", err);
    }
    throw err;
  }
};

const WaliSiswaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteWaliSiswa, setDeleteWaliSiswa] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [resendLoadingIds, setResendLoadingIds] = useState(new Set());
  const [resendSentIds, setResendSentIds] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",               
    kelas_id: "",     
    hubungan: "",        
    status_akun: "",     
    has_nomor_telepon: "",
    sort_by: "nama_siswa",
    sort_order: "asc", 
  });

  const [draftFilters, setDraftFilters] = useState(filters);
  const [kelasOptions, setKelasOptions] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      const data = await fetchKelasList();
      setKelasOptions(data);
    };
    load();
  }, []);

  const limitParam = useMemo(
    () => (rowsPerPage === -1 ? "all" : rowsPerPage),
    [rowsPerPage]
  );

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: [
      "waliSiswa-filter",
      {
        page: page + 1,         
        limit: limitParam,     
        filters,
      },
    ],
    queryFn: fetchWaliSiswaFilter,
    onError: (err) => {
      const errorMessage = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? { page: 1, limit: limitParam, total: 0, total_pages: 0 };
  const totalCount = typeof meta.total === "number" ? meta.total : rows.length;

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/wali-siswa/${id}`);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["waliSiswa-filter"]);
      setSuccess(res?.msg || "Wali siswa berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      const details = err?.response?.data?.errors || [];
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat menghapus data wali siswa";
      setError(details.length ? details.join(", ") : msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  // Resend
  const resendMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(`/api/v1/admin-sekolah/wali-siswa/${id}/resend`);
      return res.data;
    },
    onSuccess: (res, id) => {
      setResendSentIds((prev) => new Set(prev).add(id));
      setSuccess(res?.msg || "Info akun berhasil dikirim ulang");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Gagal mengirim ulang info akun";
      setError(msg);
      setTimeout(() => setError(""), 3000);
    },
    onSettled: (_d, _e, id) => {
      setResendLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const handleResend = (id) => {
    setResendLoadingIds((prev) => new Set(prev).add(id));
    resendMutation.mutate(id);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, q: val }));
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (e) => {
    const next = parseInt(e.target.value, 10); 
    setRowsPerPage(next);
    setPage(0); 
  };

  const handleAdd = () => navigate("/dashboard/admin-sekolah/wali-siswa/tambah");
  const handleEdit = (id) => navigate(`/dashboard/admin-sekolah/wali-siswa/edit/${id}`);

  const handleDelete = () => {
    if (!deleteWaliSiswa) {
      setError("Wali siswa tidak ditemukan");
      return;
    }
    deleteMutation.mutate(deleteWaliSiswa);
    setConfirmDialogOpen(false);
    setDeleteWaliSiswa(null);
  };

  const handleOpenConfirmDialog = (id) => {
    setDeleteWaliSiswa(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDeleteWaliSiswa(null);
  };

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const applyFilter = () => {
    setFilters(draftFilters);
    setPage(0);
    setFilterOpen(false);
  };
  const clearFilter = () => {
    setDraftFilters({
      q: filters.q,        
      kelas_id: "",
      hubungan: "",
      status_akun: "",
      has_nomor_telepon: "",
      sort_by: "nama_siswa",
      sort_order: "asc",
    });
  };

  return (
    <PageContainer title="Wali Siswa" description="Wali Siswa">
      <ParentCard title="Wali Siswa">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 2,
          }}
        >
          <SearchButton
            value={filters.q}
            onChange={handleSearchChange}
            placeholder="Cari nama wali / siswa"
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Wali
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <WaliSiswaTable
          waliSiswa={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}                
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          handleEdit={handleEdit}
          handleDelete={handleOpenConfirmDialog}
          handleResend={handleResend}
          resendLoadingIds={resendLoadingIds}
          resendSentIds={resendSentIds}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Wali Siswa</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kelas_id" sx={{ mt: 1.85 }}>
            Kelas
          </CustomFormLabel>
          <CustomSelect
            id="kelas_id"
            name="kelas_id"
            value={draftFilters.kelas_id}
            onChange={(e) => setDraftFilters((p) => ({ ...p, kelas_id: e.target.value }))}
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
          <CustomFormLabel htmlFor="hubungan" sx={{ mt: 1.85 }}>
            Hubungan
          </CustomFormLabel>
          <CustomSelect
            id="hubungan"
            name="hubungan"
            value={draftFilters.hubungan}
            onChange={(e) => setDraftFilters((p) => ({ ...p, hubungan: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Hubungan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="Ayah">Ayah</MenuItem>
            <MenuItem value="Ibu">Ibu</MenuItem>
            <MenuItem value="Kakak">Kakak</MenuItem>
            <MenuItem value="Paman">Paman</MenuItem>
            <MenuItem value="Bibi">Bibi</MenuItem>
            <MenuItem value="wali_lainnya">Wali Lainnya</MenuItem>
          </CustomSelect>
          <CustomFormLabel htmlFor="status_akun" sx={{ mt: 1.85 }}>
            Status Akun
          </CustomFormLabel>
          <CustomSelect
            id="status_akun"
            name="status_akun"
            value={draftFilters.status_akun}
            onChange={(e) => setDraftFilters((p) => ({ ...p, status_akun: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Status Akun" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="aktif">Aktif</MenuItem>
            <MenuItem value="nonaktif">Belum Aktif</MenuItem>
          </CustomSelect>
          <CustomFormLabel htmlFor="has_nomor_telepon" sx={{ mt: 1.85 }}>
            Nomor Telepon
          </CustomFormLabel>
          <CustomSelect
            id="has_nomor_telepon"
            name="has_nomor_telepon"
            value={draftFilters.has_nomor_telepon}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, has_nomor_telepon: e.target.value }))
            }
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Filter Nomor Telepon" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua</MenuItem>
            <MenuItem value="true">Hanya yang ada nomor</MenuItem>
            <MenuItem value="false">Tanpa nomor / kosong</MenuItem>
          </CustomSelect>
          <CustomFormLabel htmlFor="sort_by" sx={{ mt: 1.85 }}>
            Urutkan Berdasarkan
          </CustomFormLabel>
          <CustomSelect
            id="sort_by"
            name="sort_by"
            value={draftFilters.sort_by}
            onChange={(e) => setDraftFilters((p) => ({ ...p, sort_by: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kolom Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="nama_siswa">Nama Siswa</MenuItem>
            <MenuItem value="nama_wali">Nama Wali</MenuItem>
            <MenuItem value="kelas">Kelas</MenuItem>
          </CustomSelect>
          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Arah Urutan
          </CustomFormLabel>
          <CustomSelect
            id="sort_order"
            name="sort_order"
            value={draftFilters.sort_order}
            onChange={(e) => setDraftFilters((p) => ({ ...p, sort_order: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Arah Urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="asc">A → Z / Terlama</MenuItem>
            <MenuItem value="desc">Z → A / Terbaru</MenuItem>
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
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus data wali siswa?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <Button
            sx={{ mr: 3 }}
            variant="outlined"
            color="secondary"
            onClick={handleCloseConfirmDialog}
          >
            Batal
          </Button>
          <DeleteButton onClick={handleDelete} isLoading={deleteMutation.isLoading}>
            Hapus
          </DeleteButton>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default WaliSiswaList;
