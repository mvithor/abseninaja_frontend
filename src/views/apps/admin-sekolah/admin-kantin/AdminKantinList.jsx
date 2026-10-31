import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Dialog, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import AdminKantinTable from 'src/apps/admin-sekolah/admin-kantin/List/AdminKantinTable';
import { filterAdminKantin, sesiGagalDicabut, teksDialogStatus } from 'src/apps/admin-sekolah/admin-kantin/kantin';
import { pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import axiosInstance from 'src/utils/axiosInstance';

const URL_ADMIN_KANTIN = '/api/v1/admin-sekolah/admin-kantin';
const KUNCI_ADMIN_KANTIN = 'adminKantin';

const fetchAdminKantin = async () => (await axiosInstance.get(URL_ADMIN_KANTIN)).data.data;

const AdminKantinList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  // Hasil dari halaman Tambah/Edit dikirim lewat state navigasi. Peringatan (sesi lama gagal
  // dicabut) ditampilkan sebagai galat supaya tidak terbaca seperti sukses polos.
  const [success, setSuccess] = useState(location.state?.pesan && !location.state?.peringatan ? location.state.pesan : '');
  const [error, setError] = useState(location.state?.pesan && location.state?.peringatan ? location.state.pesan : '');
  const [target, setTarget] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timeZone = useSchoolTimezone();

  const { data: adminKantin = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: [KUNCI_ADMIN_KANTIN],
    queryFn: fetchAdminKantin,
  });

  // Peringatan sesi gagal dicabut dibiarkan lebih lama, karena admin perlu membacanya.
  useEffect(() => {
    if (!success && !error) return undefined;
    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, error ? 10000 : 4000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, aktif }) =>
      (await axiosInstance.patch(`${URL_ADMIN_KANTIN}/${id}/status`, { is_aktif: aktif })).data,
    onSuccess: (respons) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_ADMIN_KANTIN] });
      if (sesiGagalDicabut(respons)) {
        setSuccess('');
        setError(respons.msg);
      } else {
        setError('');
        setSuccess(respons.msg);
      }
      setTarget(null);
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanGalat(err, 'Terjadi kesalahan saat mengubah status akun.'));
      setTarget(null);
    },
  });

  const daftar = filterAdminKantin(adminKantin, searchQuery);
  const dialog = teksDialogStatus(target);

  return (
    <PageContainer title="Admin Kantin" description="Admin Kantin">
      <ParentCard title="Admin Kantin">
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Cari Nama atau Email"
          />
          <AddButton
            icon={<IconPlus size={20} color="white" />}
            onClick={() => navigate('/dashboard/admin-sekolah/admin-kantin/tambah')}
          >
            Tambah Admin Kantin
          </AddButton>
        </Box>
        <AdminKantinTable
          adminKantin={daftar}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={(_, newPage) => setPage(newPage)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleEdit={(id) => navigate(`/dashboard/admin-sekolah/admin-kantin/edit/${id}`)}
          handleStatus={setTarget}
          timeZone={timeZone}
          isLoading={isLoading}
          isError={isError}
          errorMessage={pesanGalat(queryError, 'Terjadi kesalahan saat memuat data admin kantin.')}
        />
      </ParentCard>

      <Dialog open={Boolean(target)} onClose={statusMutation.isPending ? undefined : () => setTarget(null)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            {dialog.judul}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {dialog.isi}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={() => setTarget(null)} disabled={statusMutation.isPending}>
            Batal
          </Button>
          <Button
            sx={{
              mr: 3,
              backgroundColor: '#F48C06',
              '&:hover': { backgroundColor: '#f7a944' },
            }}
            variant="contained"
            onClick={() => statusMutation.mutate({ id: target.id, aktif: !target.is_aktif })}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending ? <CircularProgress size={24} /> : dialog.tombol}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AdminKantinList;
