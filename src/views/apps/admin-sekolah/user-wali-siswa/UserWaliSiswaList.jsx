import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
} from "@mui/material";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import UserWaliSiswaTable from "src/apps/admin-sekolah/user-wali-siswa/list/UserWaliSiswaTable";
import NotificationPrefsDrawer from "src/apps/admin-sekolah/user-wali-siswa/prefs/NotificationPrefsDrawer";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const fetchKelasList = async () => {
  try {
    const res = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/kelas");
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("Error kelas list:", e);
    return [];
  }
};

const fetchUserWaliSiswa = async ({ queryKey }) => {
  const [, params] = queryKey;
  const qs = new URLSearchParams();

  const isAll =
    String(params.limit) === "-1" ||
    String(params.limit).toLowerCase() === "all";


  qs.set("page", String(isAll ? 1 : (params.page ?? 1)));
  qs.set("limit", isAll ? "-1" : String(params.limit ?? 10));

  Object.entries(params.filters || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });

  const url = `/api/v1/admin-sekolah/users/wali-siswa?${qs.toString()}`;

  try {
    const res = await axiosInstance.get(url);
    return {
      rows: Array.isArray(res.data?.data) ? res.data.data : [],
      meta:
        res.data?.meta || {
          page: Number(qs.get("page")) || 1,
          limit: qs.get("limit") || 10,
          total: 0,
          total_pages: 0,
        },
    };
  } catch (err) {
    if (process.env.NODE_ENV !== "production")
      console.error("Error fetchUserWaliSiswa:", err);
    throw err;
  }
};

const UserWaliSiswaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsUser, setPrefsUser] = useState({ id: null, name: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    kelas_id: "",
    nama_kelas: "",
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const [draftFilters, setDraftFilters] = useState(filters);
  const [kelasOptions, setKelasOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const list = await fetchKelasList();
      setKelasOptions(list);
    };
    load();
  }, []);

  const limitParam = useMemo(
    () => (rowsPerPage === -1 ? -1 : rowsPerPage),
    [rowsPerPage]
  );

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: [
      "userWaliSiswa",
      {
        page: page + 1,     
        limit: limitParam,  
        filters,
      },
    ],
    queryFn: fetchUserWaliSiswa,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(msg);
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? { page: 1, limit: limitParam, total: 0, total_pages: 0 };
  const totalCount = typeof meta.total === "number" ? meta.total : rows.length;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, q: val }));
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    const next = parseInt(e.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const handleEdit = () => {
    navigate(`#`);
  };

  const handleOpenPrefs = (userId, name) => {
    setPrefsUser({ id: userId, name: name || "" });
    setPrefsOpen(true);
  };
  const handleClosePrefs = () => setPrefsOpen(false);

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraftFilters({
      q: filters.q,
      kelas_id: "",
      nama_kelas: "",
      sort_by: "updated_at",
      sort_order: "desc",
    });
  };
  const applyFilter = () => {
    setFilters(draftFilters);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Pengguna Wali Siswa" description="Pengguna Wali Siswa">
      <ParentCard title="Pengguna Wali Siswa">
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
            placeholder="Cari nama/email wali"
          />
          <FilterButton onClick={openFilter} />
        </Box>

        <UserWaliSiswaTable
          userWaliSiswa={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEdit={handleEdit}
          handleOpenPrefs={handleOpenPrefs}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>
      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Pengguna Wali</DialogTitle>
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
              PaperProps: { style: { maxHeight: 200, overflowY: "auto" } },
            }}
          >
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((k) => (
              <MenuItem key={k.id} value={k.id}>
                {k.nama_kelas}
              </MenuItem>
            ))}
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
            inputProps={{ "aria-label": "Pilih kolom urutan" }}
            MenuProps={{
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
              PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
            }}
          >
            <MenuItem value="updated_at">Terakhir Diperbarui</MenuItem>
            <MenuItem value="name">Nama</MenuItem>
            <MenuItem value="email">Email</MenuItem>
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
            inputProps={{ "aria-label": "Pilih arah urutan" }}
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
      <NotificationPrefsDrawer
        open={prefsOpen}
        onClose={handleClosePrefs}
        userId={prefsUser.id}
        userName={prefsUser.name}
        onSaved={() => {
          setSuccess("Preferensi notifikasi disimpan");
          setTimeout(() => setSuccess(""), 2500);
        }}
      />
    </PageContainer>
  );
};

export default UserWaliSiswaList;
