import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import TingkatTable from "src/apps/admin-sekolah/tingkat/List/TingkatTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchTingkat = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/tingkat')
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching tingkat:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data tingkat kelas. Silakan coba lagi.');
    }
};

const TingkatList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTingkat, setDeleteTingkat] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: tingkat = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['tingkatKelas'],
    queryFn: fetchTingkat,
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
    }
  });
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/tingkat/${id}`);
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tingkatKelas']);
      setSuccess(data.msg || "Tingkat kelas berhasil dihapus");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    },
    onError: (error) => {
        const errorDetails = error.response?.data?.errors || []; 
        const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus mata pelajaran';
        if (errorDetails.length > 0) {
            setError(errorDetails.join(', '));
        } else {
            setError(errorMsg);
        }
        setSuccess('');
        setTimeout(() => setError(''), 3000); 
    }
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTingkat = tingkat
    .filter((tingkat) => 
      tingkat.nama_tingkat.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
        // Jika nama_tingkat berupa angka
        const numA = parseInt(a.nama_tingkat, 10);
        const numB = parseInt(b.nama_tingkat, 10);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB; // Sorting berdasarkan angka
        }

        // Jika nama_tingkat berupa string (misal "VII", "VIII")
        const romanToInt = (roman) => {
            const romanMap = { I: 1, V: 5, X: 10 };
            let value = 0;

            for (let i = 0; i < roman.length; i++) {
                const current = romanMap[roman[i]];
                const next = romanMap[roman[i + 1]];

                if (next > current) {
                    value += next - current;
                    i++;
                } else {
                    value += current;
                }
            }
            return value;
        };

        const intA = romanToInt(a.nama_tingkat.toUpperCase());
        const intB = romanToInt(b.nama_tingkat.toUpperCase());
        return intA - intB; // Sorting berdasarkan nilai angka dari roman numeral
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/dashboard/admin-sekolah/tingkat/tambah-tingkat')
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/admin-sekolah/tingkat/edit/${id}`)
  };

  const handleDelete = () => {
    if(!deleteTingkat) {
        setError("Tingkat kelas tidak ditemukan");
    return;
    }
    deleteMutation.mutate(deleteTingkat);
    setConfirmDialogOpen(false);
    setDeleteTingkat(null);
  };

  const handleOpenConfirmDialog = (id) => {
    setDeleteTingkat(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDeleteTingkat(null);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer title="Tingkat Kelas" description="Tingkat Kelas">
        <ParentCard title="Tingkat Kelas">
            <Alerts error={error} success={success}/>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2, 
                    width: '100%',
                    mb: 2,
                    mt: -1
                    }}
                >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Tingkat Kelas"
                />
                <AddButton
                  icon={<IconPlus size={20} color="white" />} 
                  onClick={handleAdd}
                  >
                  Tambah Tingkat
                </AddButton>
                <FilterButton/>
                
            </Box>
            <TingkatTable
                tingkat={filteredTingkat}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleRowsPerPageChange}
                handleEdit={handleEdit}
                handleDelete={handleOpenConfirmDialog}
                isLoading={isLoading}
                isError={isError}
                errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"} 
            />
        </ParentCard>
        <Dialog
            open={confirmDialogOpen}
            onClose={handleCloseConfirmDialog}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
            <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
                Apakah Anda yakin ingin menghapus tingkat kelas ?
            </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
            <Button
                sx={{ mr: 3 }}
                variant="outlined"
                color="secondary"
                onClick={handleCloseConfirmDialog}
            >
                Batal
            </Button>
            <Button
                sx={{
                mr: 3,
                backgroundColor: "#F48C06",
                '&:hover': { backgroundColor: "#f7a944" }
                }}
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

export default TingkatList;