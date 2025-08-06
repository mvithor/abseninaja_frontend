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
import PegawaiStafTable from "src/apps/admin-sekolah/data-staf/List/PegawaiStafTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPegawaiStaf = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/staf');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching pegawai staf:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data staf. Silakan coba lagi.'); 
    };
};

const PegawaiStafList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deletePegawaiStaf, setDeletePegawaiStaf] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: staf = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['pegawaiStaf'],
        queryFn: fetchPegawaiStaf,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
          }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
          return await axiosInstance.delete(`/api/v1/admin-sekolah/staf/${id}`);
        },
        onSuccess: () => {
          queryClient.invalidateQueries(['pegawaiStaf']);
          setSuccess("pegawai staf berhasil dihapus");
          setTimeout(() => {
            setSuccess("");
          }, 3000);
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menghapus data";
          setError(errorMessage);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      });
    
      const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredPegawaiStaf = staf
        .filter((staf) => 
          staf.User.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.User.name.localeCompare(b.User.name));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/pegawai/staf/tambah-staf')
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/pegawai/staf/edit/${id}`)
    };

    const handleDelete = async () => {
        if (!deletePegawaiStaf) {
            setError("Data staf tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deletePegawaiStaf);
        setConfirmDialogOpen(false);
        setDeletePegawaiStaf(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeletePegawaiStaf(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeletePegawaiStaf(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Pegawai Staf" description="Pegawai Staf">
            <ParentCard title="Pegawai Staf">
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
                    placeholder="Cari Nama Staf"
                />
                <AddButton
                        icon={<IconPlus size={20} color="white" />}
                        onClick={handleAdd}
                    >
                        Tambah Staf
                    </AddButton>
                    <FilterButton/>
                </Box>
                <PegawaiStafTable
                    staf={filteredPegawaiStaf}
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
                    Apakah Anda yakin ingin menghapus data staf ?
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

export default PegawaiStafList;