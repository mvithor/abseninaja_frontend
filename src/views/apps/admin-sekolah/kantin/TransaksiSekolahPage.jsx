import { useState } from 'react';
import { useSelector } from 'react-redux';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
import { IconReceipt, IconRotateClockwise } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import usePesanAlert from 'src/hooks/usePesanAlert';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import ReversalDialog from 'src/apps/admin-kantin/transaksi/ReversalDialog';
import StrukTransaksiDialog from 'src/apps/admin-kantin/transaksi/StrukTransaksiDialog';
import {
  ambilDaftarTransaksiSekolah,
  ambilDaftarUnitKantin,
  ambilDetailTransaksiSekolah,
  prosesReversalSekolah,
} from 'src/apps/admin-sekolah/kantin/api';
import {
  KUNCI_KANTIN_SEKOLAH,
  formatRupiah,
  formatWaktu,
  metaJenisTransaksi,
  pesanGalatKantin,
  rentangTanggalQuery,
} from 'src/apps/admin-sekolah/kantin/kantinSekolah';

const KOLOM = 8;

const TransaksiSekolahPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const timeZone = useSchoolTimezone();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [kantinFilter, setKantinFilter] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState('');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');

  const [trxDetailId, setTrxDetailId] = useState(null);
  const [targetReversal, setTargetReversal] = useState(null);
  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorReversal, setErrorReversal] = useState('');

  const unitQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId, 'filter-transaksi'],
    queryFn: () => ambilDaftarUnitKantin({ page: 1, limit: 100 }),
  });

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(kantinFilter ? { kantin_id: Number(kantinFilter) } : {}),
    ...(jenisTransaksi ? { jenis_transaksi: jenisTransaksi } : {}),
    ...rentangTanggalQuery(dariTanggal, sampaiTanggal),
  };

  const transaksiQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.transaksi, userId, paramsQuery],
    queryFn: () => ambilDaftarTransaksiSekolah(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const detailTrxQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.detailTransaksi, userId, trxDetailId],
    queryFn: () => ambilDetailTransaksiSekolah(trxDetailId),
    enabled: Boolean(trxDetailId),
  });

  const reversalMutation = useMutation({
    mutationFn: prosesReversalSekolah,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.transaksi, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.detailTransaksi, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.unit, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.siswa, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.dompet, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.rekonsiliasi, userId] });

      setErrorReversal('');
      setError('');
      setSuccess(res?.msg || 'Reversal transaksi berhasil diproses.');
      setTargetReversal(null);
      setTrxDetailId(null);
    },
    onError: (err) => {
      setErrorReversal(pesanGalatKantin(err, 'Gagal memproses reversal transaksi.'));
    },
  });

  const unitList = unitQuery.data?.items || [];
  const items = transaksiQuery.data?.items || [];
  const total = transaksiQuery.data?.pagination?.total ?? items.length;
  const detailData = detailTrxQuery.data;
  const bolehReversalDetail = detailData?.jenis_transaksi === 'BELANJA' && !detailData?.reversal;

  return (
    <PageContainer title="Transaksi Kantin Sekolah" description="Pengawasan ledger transaksi seluruh unit kantin sekolah">
      <ParentCard title="Pengawasan Transaksi Kantin Sekolah">
        <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
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
            value={jenisTransaksi}
            onChange={(e) => {
              setJenisTransaksi(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Semua Jenis Transaksi</MenuItem>
            <MenuItem value="BELANJA">Belanja Kasir</MenuItem>
            <MenuItem value="TOPUP">Top-Up Saldo</MenuItem>
            <MenuItem value="REVERSAL">Reversal / Refund</MenuItem>
          </CustomSelect>

          <CustomTextField
            size="small"
            type="date"
            label="Dari Tanggal"
            InputLabelProps={{ shrink: true }}
            value={dariTanggal}
            onChange={(e) => {
              setDariTanggal(e.target.value);
              setPage(0);
            }}
          />

          <CustomTextField
            size="small"
            type="date"
            label="Sampai Tanggal"
            InputLabelProps={{ shrink: true }}
            value={sampaiTanggal}
            onChange={(e) => {
              setSampaiTanggal(e.target.value);
              setPage(0);
            }}
          />

          {(kantinFilter || jenisTransaksi || dariTanggal || sampaiTanggal) && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setKantinFilter('');
                setJenisTransaksi('');
                setDariTanggal('');
                setSampaiTanggal('');
                setPage(0);
              }}
            >
              Reset Filter
            </Button>
          )}
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
                      Kode Transaksi
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Unit Kantin
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Jenis
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Siswa
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
                      Aksi
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaksiQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : transaksiQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        {pesanGalatKantin(transaksiQuery.error, 'Gagal memuat riwayat transaksi.')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Belum ada transaksi kantin pada filter ini.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((trx) => {
                    const jenis = metaJenisTransaksi(trx.jenis_transaksi);
                    const bisaReversal = trx.jenis_transaksi === 'BELANJA' && !trx.reversal;
                    return (
                      <TableRow key={trx.id} hover>
                        <TableCell>{formatWaktu(trx.dibuat_pada, timeZone)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {trx.kode_transaksi}
                          </Typography>
                          {trx.reversal && (
                            <Typography variant="caption" color="warning.main">
                              Sudah dibatalkan ({trx.reversal.kode_transaksi})
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{trx.kantin?.nama_kantin || (trx.jenis_transaksi === 'TOPUP' ? 'Loket Sekolah' : '-')}</TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={jenis.label} color={jenis.color} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {trx.siswa?.nama || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            NIS: {trx.siswa?.nis || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {jenis.tanda}
                            {formatRupiah(trx.nominal)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatRupiah(trx.saldo_sesudah)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<IconReceipt size={16} />}
                              onClick={() => setTrxDetailId(trx.id)}
                            >
                              Struk
                            </Button>
                            {bisaReversal && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<IconRotateClockwise size={16} />}
                                onClick={() => {
                                  setErrorReversal('');
                                  setTargetReversal(trx);
                                }}
                              >
                                Reversal
                              </Button>
                            )}
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
                    rowsPerPageOptions={[10, 20, 50]}
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

      <StrukTransaksiDialog
        buka={Boolean(trxDetailId)}
        transaksi={detailData}
        isLoading={detailTrxQuery.isLoading}
        timeZone={timeZone}
        aksiTambahan={
          bolehReversalDetail ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<IconRotateClockwise size={18} />}
              onClick={() => {
                setErrorReversal('');
                setTargetReversal(detailData);
              }}
            >
              Reversal Transaksi
            </Button>
          ) : null
        }
        onTutup={() => setTrxDetailId(null)}
      />

      <ReversalDialog
        buka={Boolean(targetReversal)}
        transaksi={targetReversal}
        sibuk={reversalMutation.isPending}
        errorServer={errorReversal}
        onKirim={(payload) => reversalMutation.mutate({ id: targetReversal.id, payload })}
        onTutup={() => setTargetReversal(null)}
      />
    </PageContainer>
  );
};

export default TransaksiSekolahPage;
