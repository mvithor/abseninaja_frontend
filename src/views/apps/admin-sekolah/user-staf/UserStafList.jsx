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
import UserStafTable from "src/apps/admin-sekolah/user-staf/List/UserStafTable";
import NotificationPrefsDrawer from "src/apps/admin-sekolah/user-staf/prefs/NotificationPrefsDrawer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchUserStaf = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/users/staf');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching user staf:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil pengguna staf. Silakan coba lagi'); 
    }
};

const UserStafList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteUserStaf, setDeleteUserStaf] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    // state drawer prefs
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [prefsUser, setPrefsUser] = useState({ id: null, name: '' });

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userStaf = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['userStaf'],
        queryFn: fetchUserStaf,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/users/${id}`, {
                params: { type }
            })
            return response.data; 
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['userStaf']); 
            setSuccess(data.msg || "Pengguna staf berhasil dihapus"); 
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus pengguna staf';
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
    
    const filteredUserStaf = (userStaf || [])
        .filter((u) => (u?.User?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
        .sort((a, b) => (a?.User?.name || '').localeCompare(b?.User?.name || ''));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/user/staf/edit/${id}`);
    };

    const handleDelete = (user_id, type = 'pegawai') => {
        if (!user_id || typeof user_id !== 'number') {
            console.error('Kesalahan sistem. ID pengguna tidak valid:', user_id);
            setError('Akun staf tidak valid');
            return;
        }
        deleteMutation.mutate({ id: user_id, type });
        setConfirmDialogOpen(false);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteUserStaf(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteUserStaf(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // prefs flow
    const handleOpenPrefs = (userId, name) => {
        setPrefsUser({ id: userId, name: name || '' });
        setPrefsOpen(true);
    };
    const handleClosePrefs = () => setPrefsOpen(false);

    return (
        <PageContainer title="Pengguna Staf" description="Pengguna Staf">
            <ParentCard title="Pengguna Staf">
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
                    placeholder="Cari Nama Staf"
                />
                <FilterButton/>
                </Box>
                <UserStafTable
                    userStaf={filteredUserStaf}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handleEdit={handleEdit}
                    handleDelete={handleOpenConfirmDialog}
                    handleOpenPrefs={handleOpenPrefs}
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
                    Apakah Anda yakin ingin menghapus pengguna staf ?
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
                        onClick={() => handleDelete(deleteUserStaf, 'pegawai')}
                        disabled={deleteMutation.isLoading}
                    >
                        {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Hapus'}
                    </Button>
                </DialogActions>
            </Dialog>

            <NotificationPrefsDrawer
                open={prefsOpen}
                onClose={handleClosePrefs}
                userId={prefsUser.id}
                userName={prefsUser.name}
                onSaved={() => {
                    setSuccess('Preferensi notifikasi disimpan');
                    setTimeout(() => setSuccess(''), 2500);
                }}
            />
        </PageContainer>
    );
};

export default UserStafList;
