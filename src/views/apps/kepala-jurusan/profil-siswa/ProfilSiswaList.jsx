import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem } from "@mui/material";
import { validate as isUUID } from "uuid";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import ProfilSiswaTable from "src/apps/kepala-jurusan/profil-siswa/List/ProfilSiswaTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

// [KONTEKS] Response endpoint ini bentuknya OBJEK ({ total_siswa,
// kelas_options, semua_siswa }), BUKAN array langsung seperti Mitra
// Industri — jadi fetch function return res.data.data apa adanya, dipecah
// di komponen. `data: null` (kasus tidak ada semester aktif) otomatis
// tertangani lewat optional chaining di bawah, tidak perlu percabangan
// terpisah.
const fetchProfilSiswaList = async () => {
  const res = await axiosInstance.get("/api/v1/kepala-jurusan/profile-siswa/list");
  return res.data?.data ?? null;
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "SIAP_PENUH", label: "Siap Penuh" },
  { value: "RISIKO_BEHAVIOR", label: "Risiko Behavior" },
  { value: "RISIKO_COMPETENCY", label: "Risiko Kompetensi" },
  { value: "RISIKO_GANDA", label: "Risiko Ganda" },
  { value: "PARSIAL_BEHAVIOR_SAJA", label: "Parsial (Behavior)" },
  { value: "PARSIAL_COMPETENCY_SAJA", label: "Parsial (Kompetensi)" },
  { value: "DATA_BELUM_CUKUP", label: "Data Belum Cukup" },
];

const ProfilSiswaList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // kelas kosong string = "Semua Kelas", sesuai pola status di Mitra
  // Industri — dibandingkan langsung ke nama_kelas (string), bukan id,
  // karena field 'kelas' di semua_siswa memang string nama kelas.
  const [filters, setFilters] = useState({
    kelas: "",
    status: "",
    sort_by: "nama",
    sort_order: "asc",
  });
  const [draft, setDraft] = useState(filters);

  const navigate = useNavigate();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["profil-siswa-list"],
    queryFn: fetchProfilSiswaList,
    onError: (err) => {
      const msg = err?.response?.data?.msg || "Terjadi kesalahan saat memuat data profil siswa";
      setError(msg);
    },
    refetchOnWindowFocus: false,
  });

  const rawList = useMemo(() => data?.semua_siswa ?? [], [data]);
  // [DINAMIS] Opsi filter kelas diambil dari response API (kelas_options),
  // BUKAN hardcode — beda dari STATUS_OPTIONS di Mitra Industri yang
  // memang cuma 2 nilai tetap. Kalau struktur kelas jurusan berubah, filter
  // ini otomatis ikut, tidak perlu disunting manual di FE.
  const kelasOptionsFromApi = useMemo(() => data?.kelas_options ?? [], [data]);

  const filteredList = useMemo(() => {
    let result = rawList;

    if (filters.kelas) {
      result = result.filter((s) => s.kelas === filters.kelas);
    }
    if (filters.status) {
      result = result.filter((s) => s.profil_status === filters.status);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s.nama || "").toLowerCase().includes(q) ||
          (s.nis || "").toLowerCase().includes(q),
      );
    }

    // Sort null-safe untuk kolom numerik (behavior_score/competency_score
    // bisa null untuk siswa DATA_BELUM_CUKUP) — didorong ke akhir, apa pun
    // arah urutannya, bukan ikut terbandingkan sebagai 0.
    const numericFields = ["behavior_score", "competency_score"];
    const sorted = [...result].sort((a, b) => {
      const av = a[filters.sort_by];
      const bv = b[filters.sort_by];

      if (numericFields.includes(filters.sort_by)) {
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return filters.sort_order === "asc" ? av - bv : bv - av;
      }

      const avStr = (av || "").toString().toLowerCase();
      const bvStr = (bv || "").toString().toLowerCase();
      if (avStr < bvStr) return filters.sort_order === "asc" ? -1 : 1;
      if (avStr > bvStr) return filters.sort_order === "asc" ? 1 : -1;
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

  // [ASUMSI — TOLONG KONFIRMASI] Path route detail ditebak dari pola
  // handleEdit Mitra Industri. Sesuaikan kalau nama route sungguhannya beda.
  const handleLihatDetail = (id) => {
    if (!id || !isUUID(id)) return;
    navigate(`/dashboard/kepala-jurusan/profil-siswa/detail/${id}`);
  };

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const closeFilter = () => setFilterOpen(false);
  const clearFilter = () => {
    setDraft({ kelas: "", status: "", sort_by: "nama", sort_order: "asc" });
  };
  const applyFilter = () => {
    setFilters(draft);
    setPage(0);
    setFilterOpen(false);
  };

  return (
    <PageContainer title="Profil Siswa" description="Profil Kesiapan PKL Siswa">
      <ParentCard title="Profil Siswa">
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
            placeholder="Cari Nama Siswa / NIS"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <FilterButton onClick={openFilter} />
          </Box>
        </Box>

        <ProfilSiswaTable
          profilSiswaList={pagedList}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleLihatDetail={handleLihatDetail}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      <Dialog open={filterOpen} onClose={closeFilter} fullWidth maxWidth="sm">
        <DialogTitle>Filter Profil Siswa</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="kelas" sx={{ mt: 1.85 }}>
            Kelas
          </CustomFormLabel>
          <CustomSelect
            id="kelas"
            name="kelas"
            value={draft.kelas}
            onChange={(e) => setDraft((p) => ({ ...p, kelas: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptionsFromApi.map((k) => (
              <MenuItem key={k.id} value={k.nama_kelas}>
                {k.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>

          <CustomFormLabel htmlFor="status" sx={{ mt: 1.85 }}>
            Status Profil
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
            <MenuItem value="nama">Nama</MenuItem>
            <MenuItem value="behavior_score">Behavior Score</MenuItem>
            <MenuItem value="competency_score">Skor Kompetensi</MenuItem>
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
            <MenuItem value="asc">Naik (A→Z / Rendah→Tinggi)</MenuItem>
            <MenuItem value="desc">Turun (Z→A / Tinggi→Rendah)</MenuItem>
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

export default ProfilSiswaList;