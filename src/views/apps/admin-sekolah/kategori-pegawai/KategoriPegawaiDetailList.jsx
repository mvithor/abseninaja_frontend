import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Alerts from "src/components/alerts/Alerts";
import FilterButton from "src/components/button-group/FilterButton";
import SearchButton from "src/components/button-group/SearchButton";
import AddButton from "src/components/button-group/AddButton";
import PageContainer from "src/components/container/PageContainer";
import ParentCard from "src/components/shared/ParentCard";
import KategoriPegawaiTableDetail from "src/apps/admin-sekolah/kategori-pegawai/Detail/KategoriPegawaiTableDetail";

const fetchSubKategoriByKategori = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin-sekolah/kategori-pegawai/${id}/subkategori`);
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching sub kategori pegawai:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil data sub kategori pegawai. Silakan coba lagi.');
  }
};

const KategoriPegawaiDetailList = () => {
  const { id } = useParams();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteSubKategori, setDeleteSubKategori] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subKategoriPegawai = [], isError, error: queryError } = useQuery({
    queryKey: ['subKategoriPegawai', id],
    queryFn: () => fetchSubKategoriByKategori(id),
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat memuat data";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    }
  });

  // Mutation untuk menghapus data sub-kategori pegawai
  const deleteMutation = useMutation({
    mutationFn: async (subKategoriId) => {
      return await axiosInstance.delete(`/api/v1/admin-sekolah/kategori-pegawai/${id}/subkategori/${subKategoriId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subKategoriPegawai', id]);
      setSuccess("Subkategori pegawai berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan saat menghapus sub kategori pegawai";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    }
  });

  const handleAdd = () => {
    navigate(`/dashboard/admin-sekolah/kategori-pegawai/${id}/tambah-sub-kategori`);
  };

  const handleEdit = (subKategoriId) => {
    navigate(`/dashboard/admin-sekolah/kategori-pegawai/${id}/edit-sub-kategori/${subKategoriId}`);
  };

  const handleDelete = () => {
    if (!deleteSubKategori) {
      setError("Subkategori pegawai tidak ditemukan");
      return;
    }
    deleteMutation.mutate(deleteSubKategori);
    setConfirmDialogOpen(false);
    setDeleteSubKategori(null); 
  };

  const handleOpenConfirmDialog = (subKategoriId) => {
    setDeleteSubKategori(subKategoriId);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDeleteSubKategori(null); 
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredSubKategoriPegawai = subKategoriPegawai.filter((pegawai) => 
    pegawai.nama_subkategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Detail Kategori" description="Detail Kategori">
      <ParentCard title="Detail Kategori">
        <Alerts error={error || (isError && queryError?.message)} success={success} />
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2, 
                width: '100%',
                mb: 2,
                mt:-2
            }}
            >
          <SearchButton
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari sub"
          />
         <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={handleAdd}
              >
              Tambah Sub
          </AddButton>
          <FilterButton/>
        </Box>
        <KategoriPegawaiTableDetail
          subKategoriPegawai={filteredSubKategoriPegawai}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={setPage}
          handleChangeRowsPerPage={handleRowsPerPageChange}
          handleEdit={handleEdit}
          handleDelete={handleOpenConfirmDialog}
          isError={isError}
          isLoading={deleteMutation.isLoading || isError}
          errorMessage={queryError?.message}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 3 }}>
          <Button
            sx={{
              backgroundColor: "#2F327D",
              '&:hover': { backgroundColor: "#280274" }
            }}
            variant="contained"
            color="secondary"
            type="button"
            onClick={handleCancel}
          >
            Kembali
          </Button>
        </Box>
      </ParentCard>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus Subkategori pegawai?
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

export default KategoriPegawaiDetailList;

