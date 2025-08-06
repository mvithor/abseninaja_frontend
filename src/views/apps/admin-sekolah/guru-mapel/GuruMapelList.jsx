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
import GuruMapelTable from "src/apps/admin-sekolah/guru-mapel/List/GuruMapelTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchGuruMapel = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/guru-mapel');
        return response.data.data
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching guru mata pelajaran:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil guru mata pelajaran. Silakan coba lagi.'); 
    }
};

const GuruMapelList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteGuruMapel, setDeleteGuruMapel] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: guruMapel = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['guruMapel'],
        queryFn: fetchGuruMapel,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        },
        select: (data) => Array.isArray(data) ? data : [], 
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/guru-mapel/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['guruMapel']);
            setSuccess(data.msg || "Guru mata pelajaran berhasil dihapus");
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

    const filteredGuruMapel = (guruMapel || [])
    .filter((guruMataPelajaran) => guruMataPelajaran.nama_guru?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nama_guru?.localeCompare(b.nama_guru));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/guru-mapel/tambah-guru-mapel')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/guru-mapel/edit/${id}`)
    };

    const handleDelete = async () => {
        if (!deleteGuruMapel) {
            setError("Guru mata pelajaran tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteGuruMapel);
        setConfirmDialogOpen(false);
        setDeleteGuruMapel(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteGuruMapel(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteGuruMapel(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Guru Mata Pelajaran" description="Guru Mata Pelajaran">
            <ParentCard title="Guru Mata Pelajaran">
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
                    placeholder="Cari Guru Mata Pelajaran"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Guru
                </AddButton>
                <FilterButton/>
                </Box>
                <GuruMapelTable
                    guruMapel={filteredGuruMapel}
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
                    Apakah Anda yakin ingin menghapus guru mata pelajaran ?
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

export default GuruMapelList;