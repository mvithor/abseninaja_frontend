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
import KelasTable from "src/apps/admin-sekolah/kelas/List/KelasTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchKelas = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/kelas');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kelas:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data kelas. Silakan coba lagi.');
    }
};

const KelasList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteKelas, setDeleteKelas] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();

    const { data: kelas = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['kelas'],
        queryFn: fetchKelas,
        onError: (error) => {
          const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
          setError(errorMessage);
        }
      });
      const queryClient = useQueryClient();

      const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/kelas/${id}`);
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['kelas']);
            setSuccess(data.msg || "Kelas berhasil dihapus");
            setTimeout(() => {
              setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus kelas';
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

    const normalizeNamaKelas = (nama) => {
        return nama
            .toUpperCase()
            .replace(/\s+/g, ' ') 
            .replace(/(\d+)([A-Za-z]+)/, '$1 $2') 
            .trim(); 
    };
    
    const filteredKelas = kelas
    .map((k) => ({
        ...k,
        normalizedNamaKelas: normalizeNamaKelas(k.nama_kelas) 
    }))
    .filter((k) =>
        k.normalizedNamaKelas.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
        const romanToInt = (roman) => {
            const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100 };
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

        const intA = romanToInt(a.normalizedNamaKelas.split(' ')[0]) || 0; 
        const intB = romanToInt(b.normalizedNamaKelas.split(' ')[0]) || 0;

        if (intA !== intB) {
            return intA - intB; 
        }

        return a.normalizedNamaKelas.localeCompare(b.normalizedNamaKelas); 
    });


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/kelas/tambah-kelas')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/kelas/edit/${id}`)
    };

    const handleDetail = (id) => {
        navigate(`/dashboard/admin-sekolah/kelas/detail/${id}`)
    }

    const handleDelete = () => {
        if(!deleteKelas) {
            setError("Kelas tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteKelas);
        setConfirmDialogOpen(false);
        setDeleteKelas(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteKelas(id);
        setConfirmDialogOpen(true);
    };
    
    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteKelas(null);
    };
    
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Kelas" description="Data Kelas">
            <ParentCard title="Kelas">
                <Alerts error={error} success={success}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 2,
                        mt: -2
                        }}
                    >
                    <SearchButton
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Cari Kelas"
                    />
                   <AddButton
                    icon={<IconPlus size={20} color="white" />}
                    onClick={handleAdd}
                    >
                        Tambah Kelas
                    </AddButton>
                    <FilterButton/>
                </Box>
                <KelasTable
                    kelas={filteredKelas}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleDetail={handleDetail}
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
                    Apakah Anda yakin ingin menghapus kelas ?
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

export default KelasList;