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
import KategoriTemplateTable from "src/apps/admin-sekolah/kategori-template/List/KategoriTemplateTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchKategoriTemplate = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/template-kategori');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching kategori template:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data kategori template. Silakan coba lagi.');
    }
};

const KategoriTemplateList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteKategoriTemplate, setDeleteKategoriTemplate] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: kategoriTemplate = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['kategoriTemplate'],
        queryFn: fetchKategoriTemplate,
        onError: (error) => {
          const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
          setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/template-kategori/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['kategoriTemplate']);
            setSuccess(data.msg || "Kategori template berhasil dihapus");
            setTimeout(() => {
              setSuccess("");
            }, 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus kategori template';
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
    
    const filteredKategoriTemplate = kategoriTemplate
        .filter((kategoriTemplate) => 
          kategoriTemplate.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori));
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/kategori-template/tambah-template');
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/kategori-template/edit/${id}`)
    };

    const handleDelete = async () => {
        if (!deleteKategoriTemplate) {
          setError("Kategori waktu tidak ditemukan");
        return;
        }
        deleteMutation.mutate(deleteKategoriTemplate);
        setConfirmDialogOpen(false);
        setDeleteKategoriTemplate(null);
    };
    
    const handleOpenConfirmDialog = (id) => {
        setDeleteKategoriTemplate(id);
        setConfirmDialogOpen(true);
    };
    
    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteKategoriTemplate(null);
    };
    
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Kategori Template" description="Kategori Template">
            <ParentCard title="Kategori Template">
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
                    placeholder="Cari Kategori Template"
                />
                <AddButton
                  icon={<IconPlus size={20} color="white" />} 
                  onClick={handleAdd}
                  >
                  Tambah Kategori
                </AddButton>
                <FilterButton/>
                
            </Box>
                <KategoriTemplateTable
                    kategoriTemplate={filteredKategoriTemplate}
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
                    Apakah Anda yakin ingin menghapus kategori template ?
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

export default KategoriTemplateList;