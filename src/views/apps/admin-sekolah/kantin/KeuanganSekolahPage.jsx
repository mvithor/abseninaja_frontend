import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconAlertTriangle, IconCheck, IconEdit, IconPlus } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import AddButton from 'src/components/button-group/AddButton';
import PageContainer from 'src/components/container/PageContainer';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import usePesanAlert from 'src/hooks/usePesanAlert';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import {
  ambilDaftarPencairanSekolah,
  ambilDaftarUnitKantin,
  ambilRekonsiliasiSekolah,
  buatPencairanSekolah,
  ubahStatusPencairanSekolah,
} from 'src/apps/admin-sekolah/kantin/api';
import {
  KUNCI_KANTIN_SEKOLAH,
  formatRupiah,
  formatWaktu,
  metaStatusPencairan,
  pesanGalatKantin,
} from 'src/apps/admin-sekolah/kantin/kantinSekolah';
import {
  BuatPencairanDialog,
  UbahStatusPencairanDialog,
} from 'src/apps/admin-sekolah/kantin/keuangan/PencairanDialogs';

const KOLOM_PENCAIRAN = 9;

const TileRekon = ({ label, nilai, keterangan }) => (
  <Box
    sx={{
      p: 2.5,
      height: '100%',
      borderRadius: 2,
      border: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h3" sx={{ mt: 1, mb: 0.5, fontWeight: 700 }}>
      {nilai}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {keterangan}
    </Typography>
  </Box>
);

TileRekon.propTypes = {
  label: PropTypes.string.isRequired,
  nilai: PropTypes.node,
  keterangan: PropTypes.string,
};

const KeuanganSekolahPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const timeZone = useSchoolTimezone();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [kantinFilter, setKantinFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorDialog, setErrorDialog] = useState('');
  const [dialogBuat, setDialogBuat] = useState({ buka: false, kantinId: null });
  const [targetStatus, setTargetStatus] = useState(null);

  const unitQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId, 'keuangan-daftar'],
    queryFn: () => ambilDaftarUnitKantin({ page: 1, limit: 100 }),
  });

  const rekonQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.rekonsiliasi, userId],
    queryFn: ambilRekonsiliasiSekolah,
  });

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(kantinFilter ? { kantin_id: Number(kantinFilter) } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const pencairanQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.pencairan, userId, paramsQuery],
    queryFn: () => ambilDaftarPencairanSekolah(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const segarkanKeuangan = () => {
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.pencairan, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.rekonsiliasi, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId] });
  };

  const buatMutation = useMutation({
    mutationFn: buatPencairanSekolah,
    onSuccess: (res) => {
      segarkanKeuangan();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Pencairan dana kantin berhasil dicatat.');
      setDialogBuat({ buka: false, kantinId: null });
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, 'Gagal mencatat pencairan dana kantin.')),
  });

  const ubahStatusMutation = useMutation({
    mutationFn: ubahStatusPencairanSekolah,
    onSuccess: (res) => {
      segarkanKeuangan();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Status pencairan berhasil diperbarui.');
      setTargetStatus(null);
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, 'Gagal memperbarui status pencairan.')),
  });

  const unitList = unitQuery.data?.items || [];
  const rekon = rekonQuery.data;
  const rincianKantin = rekon?.rincian_kantin || [];
  const items = pencairanQuery.data?.items || [];
  const total = pencairanQuery.data?.pagination?.total ?? items.length;

  return (
    <PageContainer title="Pencairan & Rekonsiliasi Kantin" description="Audit rekening penampung dan settlement pencairan kantin">
      <Box sx={{ pb: 5 }}>
        <Stack spacing={3}>
          <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

          {/* Rekonsiliasi Ledger Dana Penampung Sekolah */}
          <ParentCard title="Rekonsiliasi Dana Penampung Kantin Sekolah">
            {rekonQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : rekonQuery.isError ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => rekonQuery.refetch()}>
                    Coba lagi
                  </Button>
                }
              >
                {pesanGalatKantin(rekonQuery.error, 'Gagal memuat laporan rekonsiliasi sekolah.')}
              </Alert>
            ) : (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Persamaan penampung: Total Saldo Dompet Siswa + Total Saldo Mengendap Kantin = Total Top-Up − Total Pencairan Aktif
                  </Typography>
                  <Chip
                    icon={rekon?.seimbang ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
                    label={
                      rekon?.seimbang
                        ? 'Ledger Seimbang (0 Selisih)'
                        : `Selisih Penampung ${formatRupiah(rekon?.selisih_penampung ?? 0)}`
                    }
                    color={rekon?.seimbang ? 'success' : 'error'}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TileRekon
                      label="Dana Penampung Sekolah"
                      nilai={formatRupiah(rekon?.dana_penampung_tercatat ?? 0)}
                      keterangan={`Seharusnya: ${formatRupiah(rekon?.dana_penampung_seharusnya ?? 0)}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TileRekon
                      label="Total Saldo Dompet Siswa"
                      nilai={formatRupiah(rekon?.dompet_saldo_tercatat ?? 0)}
                      keterangan={`Total Top-Up: ${formatRupiah(rekon?.total_topup ?? 0)}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TileRekon
                      label="Saldo Mengendap Kantin"
                      nilai={formatRupiah(rekon?.kantin_saldo_mengendap_tercatat ?? 0)}
                      keterangan={`Belanja Netto: ${formatRupiah((rekon?.total_belanja ?? 0) - (rekon?.total_reversal ?? 0))}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TileRekon
                      label="Total Pencairan Aktif"
                      nilai={formatRupiah(rekon?.total_pencairan_aktif ?? 0)}
                      keterangan={`Menunggu: ${formatRupiah(rekon?.total_pencairan_menunggu ?? 0)}`}
                    />
                  </Grid>
                </Grid>

                {/* Rincian Saldo Mengendap per Unit Kantin */}
                {rincianKantin.length > 0 && (
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Unit Kantin
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Belanja Netto
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Dicairkan
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Mengendap Tercatat
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                Selisih
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
                          {rincianKantin.map((row) => (
                            <TableRow key={row.kantin_id} hover>
                              <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {row.nama_kantin}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {formatRupiah((row.total_belanja ?? 0) - (row.total_reversal ?? 0))}
                              </TableCell>
                              <TableCell align="right">{formatRupiah(row.total_pencairan_aktif ?? 0)}</TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                  {formatRupiah(row.saldo_mengendap_tercatat ?? 0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  size="small"
                                  label={formatRupiah(row.selisih ?? 0)}
                                  color={Number(row.selisih ?? 0) === 0 ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={(row.saldo_mengendap_tercatat ?? 0) <= 0}
                                  onClick={() => {
                                    setErrorDialog('');
                                    setDialogBuat({ buka: true, kantinId: row.kantin_id });
                                  }}
                                >
                                  Cairkan
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Stack>
            )}
          </ParentCard>

          {/* Daftar Riwayat Pencairan */}
          <ParentCard title="Riwayat Pencairan Dana Kantin">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <CustomSelect
                  size="small"
                  displayEmpty
                  value={kantinFilter}
                  onChange={(e) => {
                    setKantinFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="">Semua Unit Kantin</MenuItem>
                  {unitList.map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {u.nama_kantin}
                    </MenuItem>
                  ))}
                </CustomSelect>

                <CustomSelect
                  size="small"
                  displayEmpty
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="">Semua Status</MenuItem>
                  <MenuItem value="MENUNGGU">Menunggu</MenuItem>
                  <MenuItem value="SELESAI">Selesai</MenuItem>
                  <MenuItem value="DIBATALKAN">Dibatalkan</MenuItem>
                </CustomSelect>
              </Box>

              <AddButton
                icon={<IconPlus size={20} color="white" />}
                onClick={() => {
                  setErrorDialog('');
                  setDialogBuat({ buka: true, kantinId: null });
                }}
              >
                Buat Pencairan
              </AddButton>
            </Box>

            <Paper variant="outlined">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Waktu
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Kode Pencairan
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Unit Kantin
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Metode
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Nominal
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Saldo Sesudah
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                          Catatan / Ref
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
                    {pencairanQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={KOLOM_PENCAIRAN} align="center" sx={{ py: 5 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : pencairanQuery.isError ? (
                      <TableRow>
                        <TableCell colSpan={KOLOM_PENCAIRAN} align="center" sx={{ py: 4 }}>
                          <Typography color="error">
                            {pesanGalatKantin(pencairanQuery.error, 'Gagal memuat riwayat pencairan.')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={KOLOM_PENCAIRAN} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">Belum ada riwayat pencairan dana kantin.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => {
                        const st = metaStatusPencairan(item.status);
                        return (
                          <TableRow key={item.id} hover>
                            <TableCell>{formatWaktu(item.dibuat_pada, timeZone)}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.kode_pencairan}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.kantin?.nama_kantin || '-'}</TableCell>
                            <TableCell align="center">
                              <Chip size="small" label={item.metode_pencairan} variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700}>
                                {formatRupiah(item.nominal)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{formatRupiah(item.saldo_sesudah)}</TableCell>
                            <TableCell align="center">
                              <Chip size="small" label={st.label} color={st.color} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{item.referensi_eksternal || item.catatan || '-'}</Typography>
                              {item.referensi_eksternal && item.catatan && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.catatan}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {item.status === 'MENUNGGU' ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<IconEdit size={16} />}
                                  onClick={() => {
                                    setErrorDialog('');
                                    setTargetStatus(item);
                                  }}
                                >
                                  Proses
                                </Button>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Final
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[10, 20, 50]}
                        colSpan={KOLOM_PENCAIRAN}
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
        </Stack>
      </Box>

      <BuatPencairanDialog
        buka={dialogBuat.buka}
        unitList={unitList}
        kantinAwalId={dialogBuat.kantinId}
        sibuk={buatMutation.isPending}
        errorServer={errorDialog}
        onKirim={(arg) => buatMutation.mutate(arg)}
        onTutup={() => setDialogBuat({ buka: false, kantinId: null })}
      />

      <UbahStatusPencairanDialog
        buka={Boolean(targetStatus)}
        pencairan={targetStatus}
        sibuk={ubahStatusMutation.isPending}
        errorServer={errorDialog}
        onKirim={(payload) => ubahStatusMutation.mutate({ id: targetStatus.id, payload })}
        onTutup={() => setTargetStatus(null)}
      />
    </PageContainer>
  );
};

export default KeuanganSekolahPage;
