import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { IconReceipt, IconRotateClockwise } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import usePesanAlert from 'src/hooks/usePesanAlert';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import {
  ambilDaftarTransaksi,
  ambilDetailTransaksi,
  prosesReversalTransaksi,
} from 'src/apps/admin-kantin/api';
import {
  KUNCI_KANTIN,
  formatRupiah,
  formatWaktu,
  metaJenisTransaksi,
  pesanGalatKantin,
  rentangTanggalQuery,
} from 'src/apps/admin-kantin/kantin';
import ReversalDialog from 'src/apps/admin-kantin/transaksi/ReversalDialog';
import StrukTransaksiDialog from 'src/apps/admin-kantin/transaksi/StrukTransaksiDialog';

const KOLOM = 7;

const TransaksiKantinPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const { unitAktif = true } = useOutletContext() || {};
  const timeZone = useSchoolTimezone();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [jenisTransaksi, setJenisTransaksi] = useState('');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');

  const [trxDetailId, setTrxDetailId] = useState(null);
  const [targetReversal, setTargetReversal] = useState(null);
  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorReversal, setErrorReversal] = useState('');

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(jenisTransaksi ? { jenis_transaksi: jenisTransaksi } : {}),
    ...rentangTanggalQuery(dariTanggal, sampaiTanggal),
  };

  const transaksiQuery = useQuery({
    queryKey: [KUNCI_KANTIN.transaksi, userId, paramsQuery],
    queryFn: () => ambilDaftarTransaksi(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const detailTrxQuery = useQuery({
    queryKey: [KUNCI_KANTIN.detailTransaksi, userId, trxDetailId],
    queryFn: () => ambilDetailTransaksi(trxDetailId),
    enabled: Boolean(trxDetailId),
  });

  const reversalMutation = useMutation({
    mutationFn: prosesReversalTransaksi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.transaksi, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.detailTransaksi, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.profil, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.dompet, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.siswa, userId] });
      queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.rekonsiliasi, userId] });

      setErrorReversal('');
      setError('');
      setSuccess(res?.msg || 'Reversal transaksi berhasil diproses.');
      setTargetReversal(null);
      setTrxDetailId(null);
    },
    onError: (err) => setErrorReversal(pesanGalatKantin(err, 'Gagal memproses reversal transaksi.')),
  });

  const items = transaksiQuery.data?.items || [];
  const total = transaksiQuery.data?.pagination?.total ?? items.length;
  const detailData = detailTrxQuery.data;

  const bolehReversalDetail =
    unitAktif && detailData?.jenis_transaksi === 'BELANJA' && !detailData?.reversal;

  return (
    <PageContainer title="Riwayat Transaksi Kantin" description="Daftar buku besar transaksi kantin dan reversal">
      <ParentCard title="Riwayat Transaksi Kantin">
        <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Select
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
          </Select>

          <TextField
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

          <TextField
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

          {(jenisTransaksi || dariTanggal || sampaiTanggal) && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
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
                  <TableCell>Waktu</TableCell>
                  <TableCell>Kode Transaksi</TableCell>
                  <TableCell align="center">Jenis</TableCell>
                  <TableCell>Siswa</TableCell>
                  <TableCell align="right">Nominal</TableCell>
                  <TableCell align="right">Saldo Sesudah</TableCell>
                  <TableCell align="center">Aksi</TableCell>
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
                      <Typography color="text.secondary">Tidak ada riwayat transaksi yang cocok.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((trx) => {
                    const jenis = metaJenisTransaksi(trx.jenis_transaksi);
                    return (
                      <TableRow key={trx.id} hover>
                        <TableCell>{formatWaktu(trx.dibuat_pada, timeZone)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {trx.kode_transaksi}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={jenis.label} color={jenis.color} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{trx.siswa?.nama || '-'}</Typography>
                          {trx.siswa?.nis && (
                            <Typography variant="caption" color="text.secondary">
                              NIS: {trx.siswa.nis}
                            </Typography>
                          )}
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
                    SelectProps={{ inputProps: { 'aria-label': 'baris per halaman' }, native: true }}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    ActionsComponent={TablePaginationActions}
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
              color="warning"
              variant="outlined"
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

export default TransaksiKantinPage;
