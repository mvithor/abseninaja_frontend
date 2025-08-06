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
import JadwalMapelTable from "src/apps/admin-sekolah/jadwal-mapel/List/JadwalMapelTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchJadwalMapel = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/jadwal-mapel');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching jadwal mapel:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data jadwal mata pelajaran. Silakan coba lagi'); 
    };
};

const JadwalMapelList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteJadwalMapel, setDeleteJadwalMapel] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: jadwalMapel = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['jadwalMapel'],
        queryFn: fetchJadwalMapel,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/jadwal-mapel/${id}`);
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['jadwalMapel']);
            setSuccess(data.msg || "Jadwal Mapel berhasil dihapus"); 
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus data jadwal mapel';
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

    const filteredJadwalMapel = jadwalMapel
  .filter((mapel) =>
    mapel.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => a.kelas.localeCompare(b.kelas));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleDetail = (id) => {
        navigate(`/dashboard/admin-sekolah/jadwal-mapel/detail/${id}`)
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/jadwal-mapel/tambah-jadwal');
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/jadwal-mapel/edit/${id}`);
    };

    const handleDelete = async () => {
        if (!deleteJadwalMapel) {
            setError("Jadwal mata pelajaran tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteJadwalMapel);
        setConfirmDialogOpen(false);
        setDeleteJadwalMapel(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteJadwalMapel(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteJadwalMapel(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Jadwal Mapel" description="Jadwal Mapel">
            <ParentCard title="Jadwal Mata Pelajaran">
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
                    placeholder="Cari Mata Pelajaran"
                />
                <AddButton
                    icon={<IconPlus size={20} color="white" />} 
                    onClick={handleAdd}
                    >
                    Tambah Mapel
                </AddButton>
                <FilterButton/>
                </Box>
                <JadwalMapelTable
                    jadwalMapel={filteredJadwalMapel}
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
                    Apakah Anda yakin ingin menghapus jadwal mata pelajaran ?
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

export default JadwalMapelList;