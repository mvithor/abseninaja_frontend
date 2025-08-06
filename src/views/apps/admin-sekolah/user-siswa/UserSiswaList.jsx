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
import UserSiswaTable from "src/apps/admin-sekolah/user-siswa/list/UserSiswaTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserSiswa = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/users/siswa');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user siswa:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil pengguna siswa. Silakan coba lagi'); 
    }
};

const UserSiswaList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteUserSiswa, setDeleteUserSiswa] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userSiswa = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['userSiswa'],
        queryFn: fetchUserSiswa,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/users/${id}`, {
                params: { type },
            });

            return response.data; 
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['userSiswa']);
            setSuccess(data.msg || "Pengguna berhasil dihapus");
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus pengguna';
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

    const filteredUserSiswa = userSiswa
        .filter((userSiswa) => userSiswa?.name?.toLowerCase().includes(searchQuery.toLowerCase() || ''))
        .sort((a, b) => a?.name?.localeCompare(b?.name || ''));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = () => {
        navigate(`#`);
    };

    const handleOpenConfirmDialog = (userId) => {
        console.log("User ID yang akan dihapus:", userId);  // Pastikan userId sesuai
        setDeleteUserSiswa(userId);
        setConfirmDialogOpen(true);
    };
    
    
    
    const handleDelete = async () => {
        console.log("User ID yang akan dihapus:", deleteUserSiswa);  // Log user_id
        if (!deleteUserSiswa) {
            setError("Data tidak ditemukan");
            return;
        }
        deleteMutation.mutate({ id: deleteUserSiswa, type: 'siswa' });
        setConfirmDialogOpen(false);
        setDeleteUserSiswa(null);
    };
    
    

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteUserSiswa(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Pengguna Siswa" description="Pengguna Siswa">
            <ParentCard title="Pengguna Siswa">
                <Alerts error={error} success={success} />
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
                        placeholder="Cari Nama Siswa"
                    />
                    <FilterButton />
                </Box>
                <UserSiswaTable
                    userSiswa={filteredUserSiswa}
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
                        Apakah Anda yakin ingin menghapus pengguna siswa ?
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

export default UserSiswaList;
