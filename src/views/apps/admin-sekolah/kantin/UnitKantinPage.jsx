import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { IconEdit, IconPlus, IconToolsKitchen2, IconUsers } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import usePesanAlert from 'src/hooks/usePesanAlert';
import {
  ambilDaftarAkunAdminKantin,
  ambilDaftarUnitKantin,
  buatUnitKantin,
  ubahUnitKantin,
} from 'src/apps/admin-sekolah/kantin/api';
import {
  KUNCI_KANTIN_SEKOLAH,
  formatRupiah,
  metaStatusUnit,
  pesanGalatKantin,
  petakanOpsiAdminKantin,
} from 'src/apps/admin-sekolah/kantin/kantinSekolah';
import MenuUnitDialog from 'src/apps/admin-sekolah/kantin/unit/MenuUnitDialog';
import UnitKantinFormDialog from 'src/apps/admin-sekolah/kantin/unit/UnitKantinFormDialog';

const KOLOM = 7;

const UnitKantinPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qDebounced = useDebouncedValue(searchQuery, 300);

  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorDialog, setErrorDialog] = useState('');
  const [dialogForm, setDialogForm] = useState({ buka: false, mode: 'buat', awal: null });
  const [unitLihatMenu, setUnitLihatMenu] = useState(null);

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(qDebounced.trim() ? { q: qDebounced.trim() } : {}),
    ...(statusFilter !== '' ? { is_aktif: statusFilter === 'aktif' } : {}),
  };

  const unitQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId, paramsQuery],
    queryFn: () => ambilDaftarUnitKantin(paramsQuery),
    placeholderData: keepPreviousData,
  });

  // Muat daftar unit tanpa filter untuk pemetaan penautan akun admin kantin secara akurat.
  const semuaUnitQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId, 'semua-tautan'],
    queryFn: () => ambilDaftarUnitKantin({ page: 1, limit: 100 }),
  });

  const akunQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.akunAdmin, userId],
    queryFn: ambilDaftarAkunAdminKantin,
  });

  const simpanMutation = useMutation({
    mutationFn: (payload) =>
      dialogForm.mode === 'ubah' && dialogForm.awal
        ? ubahUnitKantin({ id: dialogForm.awal.id, payload })
        : buatUnitKantin(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.rekonsiliasi, userId] });
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Data unit kantin berhasil disimpan.');
      setDialogForm({ buka: false, mode: 'buat', awal: null });
    },
    onError: (err) => {
      setErrorDialog(pesanGalatKantin(err, 'Gagal menyimpan data unit kantin.'));
    },
  });

  const items = unitQuery.data?.items || [];
  const total = unitQuery.data?.pagination?.total ?? items.length;
  const baseIndex = page * rowsPerPage;

  const opsiAdmin = petakanOpsiAdminKantin({
    akunList: akunQuery.data || [],
    kantinList: semuaUnitQuery.data?.items || items,
    kantinDieditId: dialogForm.mode === 'ubah' ? dialogForm.awal?.id : null,
  });

  return (
    <PageContainer title="Unit Kantin Sekolah" description="Kelola unit kantin dan penautan akun pengelola">
      <ParentCard title="Unit Kantin Sekolah">
        <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <SearchButton
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Cari nama unit kantin..."
            />
            <CustomSelect
              size="small"
              displayEmpty
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Semua Status</MenuItem>
              <MenuItem value="aktif">Unit Aktif</MenuItem>
              <MenuItem value="nonaktif">Unit Nonaktif</MenuItem>
            </CustomSelect>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<IconUsers size={18} />}
              onClick={() => navigate('/dashboard/admin-sekolah/admin-kantin')}
            >
              Kelola Akun Admin Kantin
            </Button>
            <AddButton
              icon={<IconPlus size={20} color="white" />}
              onClick={() => {
                setErrorDialog('');
                setDialogForm({ buka: true, mode: 'buat', awal: null });
              }}
            >
              Tambah Unit Kantin
            </AddButton>
          </Stack>
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      No
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Unit Kantin
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Admin Pengelola
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Penanggung Jawab
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Saldo Mengendap
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Status
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Aksi
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unitQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : unitQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        {pesanGalatKantin(unitQuery.error, 'Gagal memuat daftar unit kantin.')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Belum ada unit kantin terdaftar. Klik &ldquo;Tambah Unit Kantin&rdquo; untuk memulai.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((unit, idx) => {
                    const status = metaStatusUnit(unit.is_aktif);
                    const pengelola = unit.admin_pengelola;
                    return (
                      <TableRow key={unit.id} hover>
                        <TableCell>{baseIndex + idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {unit.nama_kantin}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {unit.lokasi || 'Lokasi belum diisi'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {pengelola ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {pengelola.nama || '-'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {pengelola.email || '-'}
                                {!pengelola.is_aktif ? ' (Akun nonaktif)' : ''}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip size="small" label="Belum tertaut" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>{unit.penanggung_jawab || '-'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                            {formatRupiah(unit.saldo_mengendap)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={status.label} color={status.color} />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Lihat Katalog Menu Unit">
                              <IconButton
                                size="small"
                                color="info"
                                aria-label="lihat menu unit"
                                onClick={() => setUnitLihatMenu(unit)}
                              >
                                <IconToolsKitchen2 size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Unit & Tautan Akun">
                              <IconButton
                                size="small"
                                color="primary"
                                aria-label="edit unit kantin"
                                onClick={() => {
                                  setErrorDialog('');
                                  setDialogForm({ buka: true, mode: 'ubah', awal: unit });
                                }}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    colSpan={KOLOM}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    ActionsComponent={TablePaginationActions}
                    labelRowsPerPage="Baris per halaman:"
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </ParentCard>

      <UnitKantinFormDialog
        buka={dialogForm.buka}
        mode={dialogForm.mode}
        awal={dialogForm.awal}
        opsiAdmin={opsiAdmin}
        sibuk={simpanMutation.isPending}
        errorServer={errorDialog}
        onSimpan={(payload) => simpanMutation.mutate(payload)}
        onTutup={() => setDialogForm({ buka: false, mode: 'buat', awal: null })}
      />

      <MenuUnitDialog
        buka={Boolean(unitLihatMenu)}
        kantin={unitLihatMenu}
        onTutup={() => setUnitLihatMenu(null)}
      />
    </PageContainer>
  );
};

export default UnitKantinPage;
