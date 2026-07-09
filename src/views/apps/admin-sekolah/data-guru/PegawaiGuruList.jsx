import { useState, useMemo } from "react";
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
import PegawaiGuruTable from "src/apps/admin-sekolah/data-guru/List/PegawaiGuruTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const fetchPegawaiGuru = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/admin-sekolah/guru');
    return response.data.data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching pegawai guru:', error);
    }
    throw new Error('Terjadi kesalahan saat mengambil data guru. Silakan coba lagi');
  }
};

const getNama = (row) => (row?.User?.name || '').trim();

const PegawaiGuruList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletePegawaiGuru, setDeletePegawaiGuru] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: guru = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['pegawaiGuru'],
    queryFn: fetchPegawaiGuru,
    onError: (err) => {
      // NOTE: err di react-query biasanya Error (bukan axios error langsung)
      const msg = err?.response?.data?.msg || err?.message || "Terjadi kesalahan saat memuat data";
      setError(msg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/admin-sekolah/guru/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['pegawaiGuru']);
      setSuccess(data.msg || "Pegawai guru berhasil dihapus");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    },
    onError: (err) => {
      const errorDetails = err?.response?.data?.errors || [];
      const errorMsg = err?.response?.data?.msg || err?.message || 'Terjadi kesalahan saat menghapus data pegawai';
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
    setPage(0); // ✅ reset page saat search berubah
  };

  const filteredPegawaiGuru = useMemo(() => {
    const list = Array.isArray(guru) ? guru : [];
    const q = String(searchQuery || '').toLowerCase().trim();

    return list
      .filter((row) => {
        // ✅ aman walau AkunPegawai null
        const nama = getNama(row).toLowerCase();
        if (!q) return true;
        return nama.includes(q);
      })
      .sort((a, b) => {
        const an = getNama(a);
        const bn = getNama(b);
        return an.localeCompare(bn, 'id', { sensitivity: 'base' });
      });
  }, [guru, searchQuery]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAdd = () => {
    navigate('/dashboard/admin-sekolah/pegawai/guru/tambah-guru');
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/admin-sekolah/pegawai/guru/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deletePegawaiGuru) {
      setError("Data guru tidak ditemukan");
      return;
    }
    deleteMutation.mutate(deletePegawaiGuru);
    setConfirmDialogOpen(false);
    setDeletePegawaiGuru(null);
  };

  const handleOpenConfirmDialog = (id) => {
    setDeletePegawaiGuru(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setDeletePegawaiGuru(null);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer title="Pegawai Guru" description="Pegawai Guru">
      <ParentCard title="Pegawai Guru">
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
            placeholder="Cari Nama Guru"
          />
          <AddButton
            icon={<IconPlus size={20} color="white" />}
            onClick={handleAdd}
          >
            Tambah Guru
          </AddButton>
          <FilterButton />
        </Box>

        <PegawaiGuruTable
          guru={filteredPegawaiGuru}
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
            Apakah Anda yakin ingin menghapus data guru ?
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

export default PegawaiGuruList;
