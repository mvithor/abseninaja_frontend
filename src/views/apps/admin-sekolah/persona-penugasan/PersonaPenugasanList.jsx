import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import CustomCheckbox from 'src/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import PersonaPenugasanTable from 'src/apps/admin-sekolah/persona-penugasan/List/PersonaPenugasanTable';
import { filterPenugasan, pesanGalat } from 'src/apps/admin-sekolah/persona-penugasan/penugasan';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import axiosInstance from 'src/utils/axiosInstance';

const URL_API = '/api/v1/admin-sekolah/persona-penugasan';
const KUNCI = 'personaPenugasan';

const fetchPenugasan = async (semua) => {
  const response = await axiosInstance.get(URL_API, { params: { semua } });
  return response.data.data;
};

const PersonaPenugasanList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [semua, setSemua] = useState(false);
  const location = useLocation();
  // Pesan sukses dari halaman Tambah dikirim lewat state navigasi.
  const [success, setSuccess] = useState(location.state?.pesan || '');
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [catatan, setCatatan] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timeZone = useSchoolTimezone();

  const { data: penugasan = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: [KUNCI, semua],
    queryFn: () => fetchPenugasan(semua),
  });

  // Pesan hilang sendiri; satu timer per pesan dan dibersihkan saat berubah atau keluar halaman.
  useEffect(() => {
    if (!success && !error) return undefined;
    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const cabutMutation = useMutation({
    mutationFn: async ({ id, catatan: alasan }) => {
      const body = alasan.trim() ? { catatan: alasan.trim() } : {};
      const response = await axiosInstance.patch(`${URL_API}/${id}/cabut`, body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI] });
      setError('');
      setSuccess(data.msg || 'Penugasan berhasil dicabut.');
      tutupDialog();
    },
    onError: (err) => {
      setSuccess('');
      setError(pesanGalat(err, 'Terjadi kesalahan saat mencabut penugasan.'));
      tutupDialog();
    },
  });

  const tutupDialog = () => {
    setTarget(null);
    setCatatan('');
  };

  const daftar = filterPenugasan(penugasan, searchQuery);

  return (
    <PageContainer title="Penugasan Persona" description="Penugasan Persona">
      <ParentCard title="Penugasan Persona">
        <Alerts error={error} success={success} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
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
            placeholder="Cari Pegawai"
          />
          <FormControlLabel
            control={
              <CustomCheckbox
                checked={semua}
                onChange={(e) => {
                  setSemua(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label="Tampilkan riwayat (dicabut)"
          />
          <AddButton
            icon={<IconPlus size={20} color="white" />}
            onClick={() => navigate('/dashboard/admin-sekolah/persona-penugasan/tambah')}
          >
            Beri Persona
          </AddButton>
        </Box>
        <PersonaPenugasanTable
          penugasan={daftar}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={(_, newPage) => setPage(newPage)}
          handleChangeRowsPerPage={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          handleCabut={setTarget}
          timeZone={timeZone}
          isLoading={isLoading}
          isError={isError}
          errorMessage={pesanGalat(queryError, 'Terjadi kesalahan saat memuat data penugasan.')}
        />
      </ParentCard>

      <Dialog open={Boolean(target)} onClose={cabutMutation.isPending ? undefined : tutupDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h5" align="center" sx={{ mt: 2, mb: 2 }}>
            Cabut persona {target?.label} dari {target?.pegawai?.nama}?
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Pegawai kehilangan akses portal ini dalam waktu sekitar satu menit. Riwayat penugasan tetap tersimpan.
          </Typography>
          <CustomTextField
            id="catatan-cabut"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Alasan pencabutan (opsional)"
            multiline
            minRows={2}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={tutupDialog} disabled={cabutMutation.isPending}>
            Batal
          </Button>
          <Button
            sx={{
              mr: 3,
              backgroundColor: '#F48C06',
              '&:hover': { backgroundColor: '#f7a944' },
            }}
            variant="contained"
            onClick={() => cabutMutation.mutate({ id: target.id, catatan })}
            disabled={cabutMutation.isPending}
          >
            {cabutMutation.isPending ? <CircularProgress size={24} /> : 'Cabut'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default PersonaPenugasanList;
