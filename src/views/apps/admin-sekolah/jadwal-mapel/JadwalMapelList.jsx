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
  Typography,
  CircularProgress
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import JadwalMapelTable from "src/apps/admin-sekolah/jadwal-mapel/List/JadwalMapelTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchKelasList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/kelas");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error kelas:", e);
    return [];
  }
};

const fetchHariList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/hari");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error hari:", e);
    return [];
  }
};

const fetchMapelList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/mapel");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error mapel:", e);
    return [];
  }
};

const fetchGuruList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/guru");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error guru:", e);
    return [];
  }
};

const fetchJadwalMapelPaged = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 10));
  // sorting
  if (params.filters?.sort_by) qs.set("sort_by", params.filters.sort_by);
  if (params.filters?.sort_order) qs.set("sort_order", params.filters.sort_order);
  // q & filters
  const f = params.filters || {};
  if (f.q) qs.append("q", f.q);
  if (f.kelas_id) qs.append("kelas_id", f.kelas_id);
  if (f.hari_id) qs.append("hari_id", f.hari_id);
  if (f.guru_id) qs.append("guru_id", f.guru_id);
  // dropdown mapel = offering_id (kirim fallback mapel_id jika backend lama masih pakai)
  if (f.offering_id) {
    qs.append("offering_id", f.offering_id);
    qs.append("mapel_id", f.offering_id);
  }

  const url = `/api/v1/admin-sekolah/jadwal-mapel?${qs.toString()}`;
  const res = await axiosInstance.get(url);
  return {
    rows: Array.isArray(res.data?.data) ? res.data.data : [],
    meta: res.data?.meta || { page: 1, limit: params.limit ?? 10, total: 0, total_pages: 0 },
  };
};

const JadwalMapelList = () => {
  const [page, setPage] = useState(0);          // zero-based UI
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    kelas_id: "",
    hari_id: "",
    offering_id: "",        // ← pakai offering_id (dropdown mapel = offering)
    guru_id: "",
    sort_by: "hari",        // hari | waktu | kelas | mapel | guru | kategori
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  const [kelasOptions, setKelasOptions] = useState([]);
  const [hariOptions, setHariOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ==========================
  // Promise.all: fetch dropdowns paralel
  // ==========================
  useEffect(() => {
    (async () => {
      try {
        const [k, h, m, g] = await Promise.all([
          fetchKelasList(),
          fetchHariList(),
          fetchMapelList(),  // → bentuk { id, label }
          fetchGuruList(),
        ]);
        setKelasOptions(k);
        setHariOptions(h);
        setMapelOptions(m);
        setGuruOptions(g);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("Dropdown load failed:", e);
      }
    })();
  }, []);

  const effectiveLimit = rowsPerPage === -1 ? "all" : rowsPerPage;

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: [
      "jadwal-mapel-paged",
      {
        page: page + 1,              // server expects 1-based
        limit: effectiveLimit,
        filters,
      },
    ],
    queryFn: fetchJadwalMapelPaged,
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

  // delete
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/api/v1/admin-sekolah/jadwal-mapel/${id}`);
      return res.data;
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(["jadwal-mapel-paged"]);
      setSuccess(resp?.msg || "Jadwal Mapel berhasil dihapus");
      setTimeout(() => setSuccess(""), 2500);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg = err?.response?.data?.msg || "Terjadi kesalahan saat menghapus data jadwal mapel";
      setError(errorDetails.length ? errorDetails.join(", ") : errorMsg);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleDelete = (id) => {
    if (!id || !isUUID(id)) {
      setError("Jadwal mata pelajaran tidak ditemukan");
      return;
    }
    deleteMutation.mutate(id);
  };

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
  const handleAdd = () => navigate("/dashboard/admin-sekolah/jadwal-mapel/tambah-jadwal");
  const handleEdit = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/admin-sekolah/jadwal-mapel/edit/${id}`);
  };

  // Filter dialog
  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({
      q: filters.q,
      kelas_id: "",
      hari_id: "",
      offering_id: "",
      guru_id: "",
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
    <PageContainer title="Jadwal Mapel" description="Jadwal Mapel">
      <ParentCard title="Jadwal Mata Pelajaran">
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
            placeholder="Cari Kelas / Mapel (Offering) / Guru / Kategori / Kode Offering"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <AddButton icon={<IconPlus size={20} color="white" />} onClick={handleAdd}>
              Tambah Jadwal
            </AddButton>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <JadwalMapelTable
          jadwalMapel={rows}
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

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Jadwal Mapel</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kelas_id" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
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
              <MenuItem key={k.id} value={k.id}>{k.nama_kelas}</MenuItem>
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

          <CustomFormLabel htmlFor="offering_id" sx={{ mt: 1.85 }}>Mata Pelajaran (Offering)</CustomFormLabel>
          <CustomSelect
            id="offering_id"
            name="offering_id"
            value={draft.offering_id}
            onChange={(e) => setDraft((p) => ({ ...p, offering_id: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Mapel/Offering" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Mapel</MenuItem>
            {mapelOptions.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="guru_id" sx={{ mt: 1.85 }}>Guru</CustomFormLabel>
          <CustomSelect
            id="guru_id"
            name="guru_id"
            value={draft.guru_id}
            onChange={(e) => setDraft((p) => ({ ...p, guru_id: e.target.value }))}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Guru" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Guru</MenuItem>
            {guruOptions.map((g) => (
              <MenuItem key={g.id} value={g.id}>{g.name || g.nama || g.nama_guru}</MenuItem>
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
            <MenuItem value="waktu">Waktu</MenuItem>
            <MenuItem value="kelas">Kelas</MenuItem>
            <MenuItem value="mapel">Mapel</MenuItem>
            <MenuItem value="guru">Guru</MenuItem>
            <MenuItem value="kategori">Kategori</MenuItem>
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
            <Button onClick={clearFilter} color="secondary" variant="outlined">Reset</Button>
            <Button onClick={applyFilter} variant="contained">Terapkan</Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
    </PageContainer>
  );
};

export default JadwalMapelList;
