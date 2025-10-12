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
import SearchButton from "src/components/button-group/SearchButton";
import FilterButton from "src/components/button-group/FilterButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import UserAdminTable from "src/apps/admin-sekolah/user-admin/List/UserAdminTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserAdmin = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/users/admin');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user admin:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil pengguna admin. Silakan coba lagi'); 
    }
};

const UserAdminList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteUserAdmin, setDeleteUserAdmin] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userAdmin = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['userAdmin'],
        queryFn: fetchUserAdmin,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }) => {
            console.log('Mutasi delete dengan parameter:');
            console.log('id:', id, 'type:', type);
    
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/users/${id}`, {
                params: { type },
            });
    
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Penghapusan berhasil dengan respons:', data);
            queryClient.invalidateQueries(['userAdmin']);
            setSuccess(data.msg || 'Pengguna berhasil dihapus');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error) => {
            console.error('Kesalahan saat menghapus pengguna:', error.response || error.message);
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus pengguna';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        },
    });
    
    
    

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredUserAdmin = userAdmin
        .filter((userAdmin) => 
          userAdmin.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/user-admin/tambah')
    }

    const handleEdit = (id) => {
        navigate(`#`)
    }

    const handleDelete = (user_id, type = 'admin sekolah') => {
        console.log('Menghapus admin sekolah dengan data berikut:');
        console.log('user_id:', user_id, 'type:', type);
    
        if (!user_id || typeof user_id !== 'number') {
            console.error('Kesalahan sistem. ID pengguna tidak valid:', user_id);
            setError('ID pengguna tidak valid.');
            return;
        }
    
        // Mutasi untuk menghapus
        deleteMutation.mutate({ id: user_id, type });
        setConfirmDialogOpen(false);
    };
    
    
    

    const handleOpenConfirmDialog = (id) => {
        setDeleteUserAdmin(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteUserAdmin(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Pengguna Administrator" description="Pengguna Administrator">
            <ParentCard title="Pengguna Administrator">
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
                    placeholder="Cari Nama Admin"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />}
                    onClick={handleAdd}
                    >
                    Tambah Admin
                </AddButton>
                <FilterButton/>
                </Box>
                <UserAdminTable
                    userAdmin={filteredUserAdmin}
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
                    Apakah Anda yakin ingin menghapus pengguna admin ?
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
                        onClick={() => handleDelete(deleteUserAdmin, 'admin sekolah')}
                        disabled={deleteMutation.isLoading}
                    >
                        {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default UserAdminList;