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
import Alerts from "src/components/alerts/Alerts";
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import UserGuruTable from "src/apps/admin-sekolah/user-guru/list/UserGuruTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserGuru = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/users/guru');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user guru:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil pengguna guru. Silakan coba lagi'); 
    }
};

const UserGuruList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteUserGuru, setDeleteUserGuru] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userGuru = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['userGuru'],
        queryFn: fetchUserGuru,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ id , type}) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/users/${id}`, {
                params: { type }
            });
            return response.data; 
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['userGuru']); 
            setSuccess(data.msg || "Pengguna guru berhasil dihapus"); 
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus pengguna guru';
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
    
    const filteredUserGuru = userGuru
        .filter((userGuru) => 
          userGuru.User.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.User.name.localeCompare(b.User.name));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = () => {
        navigate(`#`);
    };

    const handleDelete = (user_id, type = 'pegawai') => {
        if (!user_id || typeof user_id !== 'number') {
            setError('User tidak valid');
            return;
        }
    
        // Mutasi untuk menghapus
        deleteMutation.mutate({ id: user_id, type });
        setConfirmDialogOpen(false);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteUserGuru(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteUserGuru(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Pengguna Guru" description="Pengguna Guru">
            <ParentCard title="Pengguna Guru">
                <Alerts error={error} success={success}/>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2, 
                        width: '100%',
                        mb: 3,
                    }}
                    >
                <SearchButton
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari Nama Guru"
                />
                <FilterButton/>
                </Box>
                <UserGuruTable
                    userGuru={filteredUserGuru}
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
                    Apakah Anda yakin ingin menghapus pengguna guru ?
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
                        onClick={() => handleDelete(deleteUserGuru, 'pegawai')}
                        disabled={deleteMutation.isLoading}
                    >
                        {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default UserGuruList;