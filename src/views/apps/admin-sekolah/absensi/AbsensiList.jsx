import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  IconButton,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { IconPlus, IconLogout2 } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import ParentCard from "src/components/shared/ParentCard";
import StatistikAbsensiCard from "src/components/dashboards-admin-sekolah/StatistikAbsensiCard";
import AbsensiTable from "src/apps/admin-sekolah/absensi/List/AbsenstiTable";
import { useQuery } from "@tanstack/react-query";
import moment from "moment-timezone";
import axiosInstance from "src/utils/axiosInstance";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";

const fetchAbsensi = async ({ queryKey }) => {
  const [, filters] = queryKey;
  const params = new URLSearchParams(filters).toString();
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/absensi?${params}`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching absensi:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil pengguna absensi. Silakan coba lagi');
  }
};

const fetchKelasList = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/kelas");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching kelas list:", error);
    return [];
  }
};

const AbsensiList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // ▶️ Modal Bulk Pulang
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    tipe: "Pulang Cepat",           
    tanggal: new Date(),         
    jam_pulang: new Date(),        
    kelas_id: "",                 
    override: false,    
  });

  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    tanggal_mulai: new Date(),
    tanggal_akhir: new Date(),
    kelas_id: "",
  });
  const [kelasOptions, setKelasOptions] = useState([]);

  // Load Kelas List dari Backend
  useEffect(() => {
    const loadKelasList = async () => {
      const data = await fetchKelasList();
      setKelasOptions(data);
    };
    loadKelasList();
  }, []);

  const { data: absensi = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: [
      "absensi",
      {
        tanggal_mulai: moment(filters.tanggal_mulai).tz("Asia/Jakarta").format("YYYY-MM-DD"),
        tanggal_akhir: moment(filters.tanggal_akhir).tz("Asia/Jakarta").format("YYYY-MM-DD"),
        kelas_id: filters.kelas_id,
      },
    ],
    queryFn: fetchAbsensi,
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
    },
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

// helper: ambil timestamp terakhir (prioritas jam_pulang, fallback jam_masuk)
const lastActionMs = (row) => {
  const tgl = row.tanggal; // "DD/MM/YYYY"
  const time =
    (row.jam_pulang && row.jam_pulang !== "—" && row.jam_pulang !== "-"
      ? row.jam_pulang
      : row.jam_masuk && row.jam_masuk !== "—" && row.jam_masuk !== "-"
      ? row.jam_masuk
      : "00:00:00");

  const m = moment.tz(`${tgl} ${time}`, "DD/MM/YYYY HH:mm:ss", "Asia/Jakarta");
  return m.isValid() ? m.valueOf() : 0;
};

const filteredAbsensi = absensi
  .filter((absensi) => {
    const matchesSearchQuery = searchQuery
      ? absensi.nama.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesKelas = filters.kelas_id ? absensi.kelas_id === filters.kelas_id : true;
    return matchesSearchQuery && matchesKelas;
  })
  // urutkan terbaru -> terlama; kalau sama waktunya, urutkan nama
  .sort((a, b) => {
    const diff = lastActionMs(b) - lastActionMs(a);
    return diff !== 0 ? diff : a.nama.localeCompare(b.nama);
  });


  const handleAdd = () => {
    navigate('/dashboard/admin-sekolah/absensi-siswa/tambah');
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleEdit = (id) => navigate(`/dashboard/admin-sekolah/absensi-siswa/edit/${id}`);

  const handleFilterClick = () => setFilterOpen(true);
  const handleFilterClose = () => setFilterOpen(false);
  const handleFilterApply = () => { refetch(); handleFilterClose(); };

  // ▶️ Bulk Pulang handlers
  const openBulkModal = () => setBulkOpen(true);
  const closeBulkModal = () => setBulkOpen(false);

  const submitBulkPulang = async () => {
    try {
      setBulkLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        tipe: bulkForm.tipe, 
        tanggal: moment(bulkForm.tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD"),
        jam_pulang: bulkForm.jam_pulang
          ? moment(bulkForm.jam_pulang).tz("Asia/Jakarta").format("HH:mm:ss")
          : null,
        override: !!bulkForm.override,
      };
      if (bulkForm.kelas_id) payload.kelas_id = bulkForm.kelas_id;
      const res = await axiosInstance.post("/api/v1/admin-sekolah/absensi/bulk-pulang", payload);

      setSuccess(res.data?.msg || "Berhasil menandai pulang");
      setBulkOpen(false);
      refetch();
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Gagal menandai pulang massal";
      setError(msg);
    } finally {
      setBulkLoading(false);
      setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
    }
  };

  const timeSlotProps = { textField: { fullWidth: true, size: "medium", required: true } };
  const dateSlotProps = { textField: { fullWidth: true, size: "medium" } };

  return (
    <PageContainer title="Absensi Siswa" description="Absensi Siswa">
      <StatistikAbsensiCard />
      <Alerts error={error} success={success} />
      <ParentCard title="Absensi Siswa">
      <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            width: "100%",
            mb: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" }, 
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Siswa"
          />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <AddButton
            icon={<IconPlus size={20} color="white" />}
            onClick={handleAdd}
          >
            Tambah Absensi
          </AddButton>
          <Button
            variant="contained"
            color="secondary"
            onClick={openBulkModal}
            sx={{
              textTransform: "none",
              display: { xs: "none", sm: "inline-flex" },
            }}
          >
            Pulang Masal
          </Button>
          <Tooltip title="Tandai Pulang / Pulang Cepat">
            <IconButton
              color="secondary"
              onClick={openBulkModal}
              sx={{ display: { xs: "inline-flex", sm: "none" } }}
              size="small"
            >
              <IconLogout2 size={20} />
            </IconButton>
          </Tooltip>

          <FilterButton onClick={handleFilterClick} />
        </Box>

        </Box>

        <AbsensiTable
          absensi={filteredAbsensi}
          page={page}
          handleAdd={handleAdd}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleEdit={handleEdit}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
        />
      </ParentCard>

      {/* ===== Filter Dialog ===== */}
      <Dialog open={filterOpen} onClose={handleFilterClose}>
        <DialogTitle>Filter Absensi</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="tanggal_mulai" sx={{ mt: 1.85 }}>
            Tanggal Mulai
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.tanggal_mulai || null}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  tanggal_mulai: moment(newValue).tz("Asia/Jakarta").toDate(),
                }))
              }
              placeholder="Tanggal Mulai"
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: CustomTextField }}
              slotProps={dateSlotProps}
            />
          </LocalizationProvider>

          <CustomFormLabel htmlFor="tanggal_akhir" sx={{ mt: 1.85 }}>
            Tanggal Akhir
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.tanggal_akhir || null}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  tanggal_akhir: moment(newValue).tz("Asia/Jakarta").toDate(),
                }))
              }
              placeholder="Tanggal Akhir"
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: CustomTextField }}
              slotProps={dateSlotProps}
            />
          </LocalizationProvider>

          <CustomFormLabel htmlFor="kelas_id" sx={{ mt: 1.85 }}>
            Kelas
          </CustomFormLabel>
          <CustomSelect
            id="kelas_id"
            name="kelas_id"
            value={filters.kelas_id}
            onChange={(e) => setFilters({ ...filters, kelas_id: e.target.value })}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih Kelas" }}
          >
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((kelasOption) => (
              <MenuItem key={kelasOption.id} value={kelasOption.id}>
                {kelasOption.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>

          <Box sx={{ mt: 3, mb: -2, display: "flex", justifyItems: "flex-start", gap: 2 }}>
            <Button onClick={handleFilterClose}>Batal</Button>
            <Button onClick={handleFilterApply}>Terapkan</Button>
          </Box>
        </DialogContent>
        <DialogActions />
      </Dialog>
      <Dialog open={bulkOpen} onClose={closeBulkModal} fullWidth maxWidth="sm">
        <DialogTitle>Tandai Pulang / Pulang Cepat (Massal)</DialogTitle>
        <DialogContent>
          <CustomFormLabel htmlFor="tipe" sx={{ mt: 1.85 }}>
            Tipe Penandaan
          </CustomFormLabel>
          <CustomSelect
            id="tipe"
            name="tipe"
            value={bulkForm.tipe}
            onChange={(e) => setBulkForm((p) => ({ ...p, tipe: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="Pulang">Pulang</MenuItem>
            <MenuItem value="Pulang Cepat">Pulang Cepat</MenuItem>
          </CustomSelect>

          <CustomFormLabel htmlFor="tanggal-bulk" sx={{ mt: 1.85 }}>
            Tanggal
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={bulkForm.tanggal}
              onChange={(val) => setBulkForm((p) => ({ ...p, tanggal: val || new Date() }))}
              format="dd/MM/yyyy"
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: CustomTextField }}
              slotProps={dateSlotProps}
            />
          </LocalizationProvider>

          <CustomFormLabel htmlFor="jam_pulang-bulk" sx={{ mt: 1.85 }}>
            Jam Pulang
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              ampm={false}
              value={bulkForm.jam_pulang}
              onChange={(val) => setBulkForm((p) => ({ ...p, jam_pulang: val }))}
              disableMaskedInput
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: CustomTextField }}
              slotProps={timeSlotProps}
            />
          </LocalizationProvider>

          <CustomFormLabel htmlFor="kelas_id-bulk" sx={{ mt: 1.85 }}>
            Kelas (Opsional)
          </CustomFormLabel>
          <CustomSelect
            id="kelas_id-bulk"
            name="kelas_id-bulk"
            value={bulkForm.kelas_id}
            onChange={(e) => setBulkForm((p) => ({ ...p, kelas_id: e.target.value }))}
            fullWidth
            displayEmpty
          >
            <MenuItem value="">Semua Kelas</MenuItem>
            {kelasOptions.map((kelasOption) => (
              <MenuItem key={`bulk-${kelasOption.id}`} value={kelasOption.id}>
                {kelasOption.nama_kelas}
              </MenuItem>
            ))}
          </CustomSelect>

          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={bulkForm.override}
                onChange={(e) => setBulkForm((p) => ({ ...p, override: e.target.checked }))}
              />
            }
            label="Timpa jam pulang yang sudah ada"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkModal} disabled={bulkLoading}>Batal</Button>
          <Button onClick={submitBulkPulang} disabled={bulkLoading} variant="contained">
            {bulkLoading ? "Memproses..." : "Terapkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AbsensiList;
