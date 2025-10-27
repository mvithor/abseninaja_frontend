import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  MenuItem
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import DeleteButton from "src/components/button-group/DeleteButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import GuruMapelTable from "src/apps/admin-sekolah/guru-mapel/List/GuruMapelTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchGuruMapelPaged = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 10));

  if (params.filters?.sort_by) qs.set("sort_by", params.filters.sort_by);
  if (params.filters?.sort_order) qs.set("sort_order", params.filters.sort_order);

  // kirim filter sesuai prioritas BE: offering_id -> mapel_id -> mapel (nama fuzzy)
  const f = params.filters || {};
  if (f.offering_id) {
    qs.set("offering_id", f.offering_id);
  } else if (f.mapel_id) {
    qs.set("mapel_id", f.mapel_id);
  } else if (f.mapel) {
    qs.set("mapel", f.mapel);
  }

  if (f.nama) qs.set("nama", f.nama);

  const url = `/api/v1/admin-sekolah/guru-mapel?${qs.toString()}`;
  const res = await axiosInstance.get(url);
  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit: params.limit ?? 10, total: 0, total_pages: 0 },
  };
};

// Dropdown helpers
const fetchOfferingList = async () => {
  try {
    // asumsi endpoint mengembalikan {id, label} seperti contoh kamu (Mapel — Kelas)
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/mapel"); 
    const arr = Array.isArray(res.data?.data) ? res.data.data : [];
    // normalisasi ke { id, label }
    return arr.map(o => ({
      id: o.id,
      label: o.label || o.nama_mapel || o.kode_offering || "",
    })).filter(o => o.id && o.label);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error offering:", e);
    return [];
  }
};

const fetchMapelList = async () => {
  try {
    // endpoint mapel standar { id, nama_mapel }
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/mata-pelajaran");
    const arr = Array.isArray(res.data?.data) ? res.data.data : [];
    return arr.map(m => ({
      id: m.id,
      nama_mapel: m.nama_mapel || m.name || m.label || "",
    })).filter(m => m.id && m.nama_mapel);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error mapel:", e);
    return [];
  }
};

const fetchGuruList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/guru");
    const arr = Array.isArray(res.data?.data) ? res.data.data : [];
    return arr.map(g => ({
      id: g.id || g.pegawai_id || g.value || g.user_id,
      name: g.name || g.nama || g.nama_guru || "",
    })).filter(g => g.name);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error guru:", e);
    return [];
  }
};

const GuruMapelList = () => {
  const [page, setPage] = useState(0);       // zero-based UI
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // filter state (tanpa kelas; gunakan offering_id/mapel_id/mapel + nama)
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    nama: "",          // User.name (fuzzy)
    offering_id: "",   // SubjectOffering.id (paling spesifik)
    mapel_id: "",      // MataPelajaran.id (exact)
    mapel: "",         // fallback nama mapel (fuzzy) jika mapel_id kosong
    sort_by: "mapel",
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  // dropdown options
  const [offeringOptions, setOfferingOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);

  // load dropdown paralel
  useEffect(() => {
    (async () => {
      const [offering, mapel, guru] = await Promise.all([
        fetchOfferingList(),
        fetchMapelList(),
        fetchGuruList(),
      ]);
      setOfferingOptions(offering);
      setMapelOptions(mapel);
      setGuruOptions(guru);
    })();
  }, []);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const effectiveLimit = rowsPerPage === -1 ? "all" : rowsPerPage;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [
      "guru-mapel-paged",
      {
        page: page + 1,       // server expects 1-based
        limit: effectiveLimit,
        filters,
      },
    ],
    queryFn: fetchGuruMapelPaged,
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

  // search bar diarahkan ke nama (opsional)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, nama: val }));
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
  const handleAdd = () => navigate('/dashboard/admin-sekolah/guru-mapel/tambah-guru-mapel');
  const handleEdit = (id) => navigate(`/dashboard/admin-sekolah/guru-mapel/edit/${id}`);

  // delete flow
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/guru-mapel/${id}`);
      return response.data;
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['guru-mapel-paged']);
      setSuccess(resp?.msg || "Guru mata pelajaran berhasil dihapus");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (error) => {
      const details = error.response?.data?.errors || [];
      const msg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data pegawai';
      setError(details.length ? details.join(', ') : msg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const handleOpenConfirmDialog = (id) => { setDeleteId(id); setConfirmDialogOpen(true); };
  const handleCloseConfirmDialog = () => { setConfirmDialogOpen(false); setDeleteId(null); };
  const handleDelete = async () => {
    if (!deleteId) { setError("Guru mata pelajaran tidak ditemukan"); return; }
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  // Filter dialog controls
  const openFilter = () => { setDraft(filters); setFilterOpen(true); };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({
      nama: "",
      offering_id: "",
      mapel_id: "",
      mapel: "",
      sort_by: "mapel",
      sort_order: "asc",
    });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  // helper: saat pilih offering → kosongkan mapel_id & mapel (biar prioritas offering_id)
  const onSelectOffering = (val) => {
    setDraft((p) => ({ ...p, offering_id: val, mapel_id: "", mapel: "" }));
  };
  // saat pilih mapel_id → kosongkan offering_id & mapel (nama)
  const onSelectMapelId = (val) => {
    setDraft((p) => ({ ...p, mapel_id: val, offering_id: "", mapel: "" }));
  };

  return (
    <PageContainer title="Guru Mata Pelajaran" description="Guru Mata Pelajaran">
      <ParentCard title="Guru Mata Pelajaran">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
            mb: 3,
            mt: -2
          }}
        >
          <SearchButton
            value={filters.nama}
            onChange={handleSearchChange}
            placeholder="Cari Nama Guru"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Guru
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <GuruMapelTable
          guruMapel={rows}
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

      {/* Filter Dialog: Nama + Offering (Mapel—Kelas) + Mapel (ID). Tanpa kelas. */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Guru Mata Pelajaran</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>Nama Guru</CustomFormLabel>
          <CustomSelect
            id="nama"
            name="nama"
            value={draft.nama}
            onChange={(e) => setDraft((p) => ({ ...p, nama: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Nama Guru" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Guru</MenuItem>
            {guruOptions.map((g) => (
              <MenuItem key={g.id} value={g.name}>{g.name}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="offering_id" sx={{ mt: 1.85 }}>Offering (Mapel — Kelas)</CustomFormLabel>
          <CustomSelect
            id="offering_id"
            name="offering_id"
            value={draft.offering_id}
            onChange={(e) => onSelectOffering(e.target.value)}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Offering" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Offering</MenuItem>
            {offeringOptions.map((o) => (
              <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>
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
          >
            <MenuItem value="nama">Nama Guru</MenuItem>
            <MenuItem value="mapel">Mata Pelajaran</MenuItem>
            <MenuItem value="kode_offering">Kode Mapel</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>Arah Urutan</CustomFormLabel>
          <CustomSelect
            id="sort_order"
            name="sort_order"
            value={draft.sort_order}
            onChange={(e) => setDraft((p) => ({ ...p, sort_order: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="asc">Naik (A→Z/Terlama)</MenuItem>
            <MenuItem value="desc">Turun (Z→A/Terbaru)</MenuItem>
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", gap: 1 }}>
            <Button onClick={closeFilter}>Batal</Button>
            <Button onClick={clearFilter} color="secondary" variant="outlined">Reset</Button>
            <Button onClick={applyFilter} variant="contained">Terapkan</Button>
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
            Apakah Anda yakin ingin menghapus guru mata pelajaran ?
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
          <DeleteButton onClick={handleDelete} isLoading={deleteMutation.isLoading}>
            Hapus
          </DeleteButton>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default GuruMapelList;
