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
import WaTemplateTabel from "src/apps/admin-sekolah/wa-template/List/WaTemplateTabel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchWaTemplate = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/admin-sekolah/wa-template');
        return response.data.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching wa-template:', error);
        }
        throw new Error('Terjadi kesalahan saat mengambil data template WhatsApp. Silakan coba lagi.'); 
    }
};

const highlightVariables = (text) => {
  if (!text) return '';
  return text.split(/(\{\{.*?\}\})/g).map((part, index) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <span key={index} style={{ color: '#1976d2', fontWeight: 'bold' }}>
          {part}
        </span>
      );
    }
    return part;
  });
};

const WaTemplateList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteWaTemplate, setDeleteWaTemplate] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null); 
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: template = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['template'],
        queryFn: fetchWaTemplate,
        onError: (error) => {
            const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
            setError(errorMessage);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosInstance.delete(`/api/v1/admin-sekolah/wa-template/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['template']); 
            setSuccess(data.msg || "Template WhatsApp berhasil dihapus"); 
            setTimeout(() => setSuccess(""), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menghapus template WhatsApp';
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

    const filteredWaTemplate = (template || [])
      .filter((template) => template.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.title?.localeCompare(b.title));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleAdd = () => {
        navigate('/dashboard/admin-sekolah/wa-template/tambah-wa-template');
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/admin-sekolah/wa-template/edit/${id}`);
    };

    const handleDelete = async () => {
        if (!deleteWaTemplate) {
            setError("Template WhatsApp tidak ditemukan");
            return;
        }
        deleteMutation.mutate(deleteWaTemplate);
        setConfirmDialogOpen(false);
        setDeleteWaTemplate(null);
    };

    const handleOpenConfirmDialog = (id) => {
        setDeleteWaTemplate(id);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setDeleteWaTemplate(null);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handlePreview = (id) => {
        const selectedTemplate = template.find((item) => item.id === id);
        if (selectedTemplate) {
            setPreviewData(selectedTemplate);
        }
    };

    return (
        <PageContainer title="Template WhatsApp" description="Template WhatsApp">
            <ParentCard title="Template WhatsApp">
                <Alerts error={error} success={success} />
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
                        placeholder="Cari template pesan"
                    />
                    <AddButton
                        icon={<IconPlus size={20} color="white" />}
                        onClick={handleAdd}
                    >
                        Tambah Template
                    </AddButton>
                    <FilterButton />
                </Box>

                <WaTemplateTabel
                    template={filteredWaTemplate}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleRowsPerPageChange}
                    handlePreview={handlePreview}
                    handleEdit={handleEdit}
                    handleDelete={handleOpenConfirmDialog}
                    isLoading={isLoading}
                    isError={isError}
                    errorMessage={queryError?.message || "Terjadi kesalahan saat memuat data"}
                />
            </ParentCard>

            {/* Dialog Konfirmasi Delete */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
                        Apakah Anda yakin ingin menghapus template WhatsApp?
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
            <Dialog
                open={Boolean(previewData)}
                onClose={() => setPreviewData(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="h5" align="center" sx={{ mb: 3 }}>
                        Preview Template
                    </Typography>
                    {previewData && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                <strong>Judul Template:</strong> {previewData.title}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                <strong>Kategori:</strong> {previewData.category}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                <strong>Deskripsi:</strong> {previewData.description || '-'}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                <strong>Isi Pesan:</strong>
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ background: '#f5f5f5', p: 2, borderRadius: 2, whiteSpace: 'pre-wrap' }}
                            >
                                {highlightVariables(previewData.body)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => setPreviewData(null)}>
                        Tutup
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default WaTemplateList;
