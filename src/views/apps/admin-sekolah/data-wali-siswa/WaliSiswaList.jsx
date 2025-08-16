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
import WaliSiswaTable from "src/apps/admin-sekolah/data-wali-siswa/List/WaliSiswaTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchWaliSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/wali-siswa');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching wali siswa:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data wali siswa. Silakan coba lagi.'); 
    }
};

const WaliSiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteWaliSiswa, setDeleteWaliSiswa] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: wali = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['waliSiswa'],
        queryFn: fetchWaliSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        },
        select: (data) => Array.isArray(data) ? data : [], 
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/wali-siswa/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['waliSiswa']); 
            setSuccess(data.msg || "Wali siswa berhasil dihapus"); 
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data wali siswa';
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

    const filteredWaliSiswa = (wali || [])
    .filter((wali) => wali.nama_wali?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama_wali?.localeCompare(b.nama_wali));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/wali-siswa/tambah');
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/wali-siswa/edit/${id}`)
    };

    const handleDelete = async () => {
        if (!deleteWaliSiswa) {
            setError("Wali kelas tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteWaliSiswa);
        setConfirmDialogOpen(false);
        setDeleteWaliSiswa(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteWaliSiswa(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteWaliSiswa(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Wali Siswa" description="Wali Siswa">
            <ParentCard title="Wali Siswa">
                <Alerts error={error} success={success}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 2,
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari wali Siswa"
                />
                 <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Wali
                </AddButton>
                <FilterButton/>
                </Box>
                <WaliSiswaTable
                    waliSiswa={filteredWaliSiswa}
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
                    Apakah Anda yakin ingin menghapus data wali siswa ?
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

export default WaliSiswaList;