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
import StatusKehadiranTable from "src/apps/admin-sekolah/status-kehadiran/List/StatusKehadiranTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchStatusKehadiran = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/status-kehadiran');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori waktu:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data status kehadiran. Silakan coba lagi.');
    }
};

const StatusKehadiranList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteStatusKehadiran, setDeleteStatusKehadiran] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();

    const { data: statusKehadiran = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['statusKehadiran'],
        queryFn: fetchStatusKehadiran,
        onError: (error) => {
          const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
          setError(errorMessage);
        }
      });
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/status-kehadiran/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['statusKehadiran']);
            setSuccess(data.msg || "Status kehadiran berhasil dihapus");
            setTimeout(() => {
              setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus status kehadiran';
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
    
      const filteredStatusKehadiran = statusKehadiran
      .filter((statusKehadiran) =>
        statusKehadiran.nama_status.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (a.is_global !== b.is_global) {
          return Number(a.is_global) - Number(b.is_global);
        }
        return a.nama_status.localeCompare(b.nama_status);
      });
    
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/status-kehadiran/tambah')
    }

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/status-kehadiran/edit/${id}`)
    }

    const handleDelete = async () => {
        if (!deleteStatusKehadiran) {
          setError("Status kehadiran tidak ditemukan");
        return;
        }
        deleteMutation.mutate(deleteStatusKehadiran);
        setConfirmDialogOpen(false);
        setDeleteStatusKehadiran(null);
    };
    
    const handleOpenConfirmDialog = (id) => {
        setDeleteStatusKehadiran(id);
        setConfirmDialogOpen(true);
    };
    
    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteStatusKehadiran(null);
    };
    
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Status Kehadiran" description="Status Kehadiran">
            <ParentCard title="Status Kehadiran">
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
                        placeholder="Cari Status Kehadiran"
                    />
                    <AddButton
                        icon={<IconPlus size={20} color="white" />}
                        onClick={handleAdd}
                    >
                        Tambah Status
                    </AddButton>
                    <FilterButton/>
                </Box>
                <StatusKehadiranTable
                    statusKehadiran={filteredStatusKehadiran}
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
                    Apakah Anda yakin ingin menghapus status kehadiran ?
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

export default StatusKehadiranList;