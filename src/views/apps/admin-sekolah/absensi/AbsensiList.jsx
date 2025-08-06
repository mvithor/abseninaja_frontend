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
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import ParentCard from "src/components/shared/ParentCard";
import StatistikAbsensiCard from "src/components/dashboards-admin-sekolah/StatistikAbsensiCard";
import AbsensiTable from "src/apps/admin-sekolah/absensi/List/AbsenstiTable";
import { useQuery } from "@tanstack/react-query";
import moment from "moment-timezone";
import axiosInstance from "src/utils/axiosInstance";

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
  const [filterOpen, setFilterOpen] = useState(false);
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

  const filteredAbsensi = absensi
  .filter((absensi) => {
    const matchesSearchQuery = searchQuery
      ? absensi.nama.toLowerCase().includes(searchQuery.toLowerCase())
      : true; // Jika tidak ada query, semua data diterima

    const matchesKelas = filters.kelas_id
      ? absensi.kelas_id === filters.kelas_id
      : true; // Jika tidak ada filter kelas, semua data diterima

    return matchesSearchQuery && matchesKelas;
  })
  .sort((a, b) => a.nama.localeCompare(b.nama));

  const handleAdd = () => {
    navigate('/dashboard/admin-sekolah/absensi-siswa/tambah')

  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/admin-sekolah/absensi-siswa/edit/${id}`)
};

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const handleFilterClose = () => {
    setFilterOpen(false);
  };

  const handleFilterApply = () => {
    refetch();
    handleFilterClose();
  };

  return (
    <PageContainer title="Absensi Siswa" description="Absensi Siswa">
      <StatistikAbsensiCard />
      <Alerts error={error} />
      <ParentCard title="Absensi Siswa">
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
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari Siswa"
          />
          <AddButton
                icon={<IconPlus size={20} color="white" />} 
                onClick={handleAdd}
                >
                Tambah Absensi
            </AddButton>
          <FilterButton onClick={handleFilterClick} />
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
                    setFilters((prevFilters) => ({
                    ...prevFilters,
                    tanggal_mulai: moment(newValue).tz("Asia/Jakarta").toDate(),
                    }))
                }
                placeholder="Tanggal Mulai"
                slotProps={{
                    textField: {
                    fullWidth: true,
                    size: "medium",
                    InputProps: {
                        sx: {
                        height: "46px",
                        paddingHorizontal: 0,
                        },
                    },
                    },
                }}
            />
          </LocalizationProvider>
          <CustomFormLabel htmlFor="tanggal_akhir" sx={{ mt: 1.85 }}>
            Tanggal Akhir
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
                value={filters.tanggal_akhir || null}
                onChange={(newValue) =>
                    setFilters((prevFilters) => ({
                    ...prevFilters,
                    tanggal_akhir: moment(newValue).tz("Asia/Jakarta").toDate(),
                    }))
                }
                placeholder="Tanggal Akhir"
                slotProps={{
                    textField: {
                    fullWidth: true,
                    size: "medium",
                    InputProps: {
                        sx: {
                        height: "46px",
                        paddingHorizontal: 0,
                        },
                    },
                    },
                }}
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
            <MenuItem value="" disabled>
              Pilih Kelas
            </MenuItem>
            {kelasOptions.map((kelasOption) => (
              <MenuItem key={kelasOption.id} value={kelasOption.id}>
                {kelasOption.nama_kelas}
              </MenuItem>
            ))}
            
          </CustomSelect>
          <Box 
                sx={{
                    mt: 3,
                    mb: -2,
                    display: 'flex', 
                    justifyItems: 'flex-start', 
                    gap: 2, 
                  }}
            >
                <Button onClick={handleFilterClose}>Batal</Button>
                <Button onClick={handleFilterApply}>Terapkan</Button>
            </Box>
        </DialogContent>
        <DialogActions>
        </DialogActions>
       
          
      </Dialog>
    </PageContainer>
  );
};

export default AbsensiList;
