import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import Alerts from "src/components/alerts/Alerts";
import AddButton from "src/components/button-group/AddButton";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import DeleteButton from "src/components/button-group/DeleteButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import WaliKelasTable from "src/apps/admin-sekolah/wali-kelas/List/WaliKelasTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchWaliKelas = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/wali-kelas');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching wali kelas:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data wali kelas. Silakan coba lagi.'); 
    }
};


const WaliKelasList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteWaliKelas, setDeleteWaliKelas] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: wali = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['waliKelas'],
        queryFn: fetchWaliKelas,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        },
        select: (data) => Array.isArray(data) ? data : [], // Validasi data sebagai array
    });
    
    

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/wali-kelas/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['waliKelas']); 
            setSuccess(data.msg || "Wali kelas berhasil dihapus"); 
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data pegawai';
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

    const filteredWaliKelas = (wali || [])
    .filter((wali) => wali.nama_wali_kelas?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama_wali_kelas?.localeCompare(b.nama_wali_kelas));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/wali-kelas/tambah-wali-kelas')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/wali-kelas/edit/${id}`);
    };

    const handleDelete = async () => {
        if (!deleteWaliKelas) {
            setError("Wali kelas tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteWaliKelas);
        setConfirmDialogOpen(false);
        setDeleteWaliKelas(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteWaliKelas(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteWaliKelas(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Wali kelas" description="Wali kelas">
            <ParentCard title="Wali kelas">
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
                    placeholder="Cari wali kelas"
                />
                 <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Wali
                </AddButton>
                <FilterButton/>
                </Box>
                <WaliKelasTable
                    waliKelas={filteredWaliKelas}
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
                    Apakah Anda yakin ingin menghapus data wali kelas ?
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
                <DeleteButton
                    onClick={handleDelete}
                    isLoading={deleteMutation.isLoading}
                >
                    Hapus
                </DeleteButton>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default WaliKelasList;
