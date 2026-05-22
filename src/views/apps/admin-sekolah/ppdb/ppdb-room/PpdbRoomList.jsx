import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import FilterButton from 'src/components/button-group/FilterButton';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import PpdbRoomTable from 'src/apps/admin-sekolah/ppdb/ppdb-room/PpdbRoomTable';

const fetchPpdbRooms = async ({ q, isActive }) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (isActive === true) params.set('is_active', 'true');
  if (isActive === false) params.set('is_active', 'false');

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await axiosInstance.get(`/api/v1/admin-sekolah/ppdb-room${query}`);

  return Array.isArray(res.data?.data) ? res.data.data : [];
};

const safeText = (val) => {
  const s = String(val ?? '').trim();
  return s.length > 0 ? s : '';
};

const PpdbRoomList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlIsActive = searchParams.get('is_active');
  const initialIsActive =
    urlIsActive === 'true' ? true :
    urlIsActive === 'false' ? false :
    null;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchQuery, setSearchQuery] = useState('');
  const [isActiveFilter] = useState(initialIsActive);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const queryKey = useMemo(
    () => ['ppdb-test-rooms', isActiveFilter === null ? '-' : String(isActiveFilter)],
    [isActiveFilter]
  );

  const {
    data: rooms = [],
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey,
    queryFn: () => fetchPpdbRooms({ q: '', isActive: isActiveFilter }),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: (prev) => prev ?? [],
    onError: (err) => {
      setError(err?.response?.data?.msg || 'Gagal memuat ruang tes');
      setTimeout(() => setError(''), 3000);
    }
  });

  useEffect(() => {
    setPage(0);
  }, [rooms.length]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin-sekolah/ppdb-room/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['ppdb-test-rooms'] });
      setSuccess(res.data?.msg || 'Ruang tes berhasil dihapus');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.msg || 'Gagal menghapus ruang tes');
      setTimeout(() => setError(''), 3000);
    }
  });

  const filteredRows = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return rooms;

    return rooms.filter((r) => {
      const code = safeText(r?.code).toLowerCase();
      const nama = safeText(r?.nama).toLowerCase();
      const lokasi = safeText(r?.lokasi).toLowerCase();
      const capacity = String(r?.capacity ?? '').toLowerCase();
      const isActive = String(r?.is_active);

      return (
        code.includes(q) ||
        nama.includes(q) ||
        lokasi.includes(q) ||
        capacity.includes(q) ||
        isActive.includes(q)
      );
    });
  }, [rooms, searchQuery]);

  const pagedRows = useMemo(() => {
    if (rowsPerPage === -1) return filteredRows;
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setConfirmDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <PageContainer title="Ruang Tes PMB" description="Ruang Tes PMB">
      <ParentCard title="Ruang Tes PMB">
        <Alerts
          error={
            error ||
            (isError && (queryError?.response?.data?.msg || queryError?.message || 'Gagal memuat data'))
          }
          success={success}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            width: '100%',
            mb: 2
          }}
        >
          <SearchButton
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Cari Code / Nama / Lokasi / Capacity / Aktif"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() => navigate('/dashboard/admin-sekolah/ppdb-room/tambah')}
            >
              Tambah Ruang
            </AddButton>
            <FilterButton />
          </Box>
        </Box>

        <PpdbRoomTable
          rows={pagedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          handleChangePage={(_, p) => setPage(p)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/ppdb-room/edit/${id}`)}
          handleDelete={(id) => {
            setDeleteId(id);
            setConfirmDialogOpen(true);
          }}
          isLoading={isLoading}
          isError={isError}
          errorMessage={queryError?.response?.data?.msg || queryError?.message}
        />
      </ParentCard>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Apakah Anda yakin ingin menghapus ruang ini?
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            Catatan: ruang tidak bisa dihapus jika sudah dipakai pada session-room / peserta.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? <CircularProgress size={22} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PpdbRoomList;