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
  Typography,
} from '@mui/material';
import { IconAdjustmentsHorizontal, IconCash, IconEye, IconKey } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import usePesanAlert from 'src/hooks/usePesanAlert';
import {
  ambilDetailDompet,
  cariSiswaDompet,
  prosesTopupSaldo,
  simpanLimitHarian,
  simpanPinDompet,
} from 'src/apps/admin-kantin/api';
import {
  AturLimitDialog,
  AturPinDialog,
  DetailDompetDialog,
  TopupDompetDialog,
} from 'src/apps/admin-kantin/dompet/DompetAksiDialogs';
import { KUNCI_KANTIN, formatRupiah, metaStatusDompet, pesanGalatKantin } from 'src/apps/admin-kantin/kantin';

const KOLOM = 7;

const DompetSiswaPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const { unitAktif = true } = useOutletContext() || {};
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusSiswa, setStatusSiswa] = useState('aktif');
  const qDebounced = useDebouncedValue(searchQuery, 300);

  const [success, setSuccess, kunciSukses] = usePesanAlert('');
  const [error, setError, kunciError] = usePesanAlert('');
  const [errorDialog, setErrorDialog] = useState('');
  const [aksi, setAksi] = useState({ jenis: null, item: null });
  const [siswaDetailId, setSiswaDetailId] = useState(null);

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(qDebounced.trim() ? { q: qDebounced.trim() } : {}),
    ...(statusSiswa ? { status: statusSiswa } : {}),
  };

  const siswaQuery = useQuery({
    queryKey: [KUNCI_KANTIN.siswa, userId, paramsQuery],
    queryFn: () => cariSiswaDompet(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const detailDompetQuery = useQuery({
    queryKey: [KUNCI_KANTIN.dompet, userId, siswaDetailId],
    queryFn: () => ambilDetailDompet({ siswa_id: siswaDetailId }),
    enabled: Boolean(siswaDetailId),
  });

  const segarkanCacheDompet = () => {
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.siswa, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.dompet, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.transaksi, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN.rekonsiliasi, userId] });
  };

  const topupMutation = useMutation({
    mutationFn: prosesTopupSaldo,
    onSuccess: (res) => {
      segarkanCacheDompet();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Top-up saldo siswa berhasil dicatat.');
      setAksi({ jenis: null, item: null });
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, 'Gagal memproses top-up saldo siswa.')),
  });

  const pinMutation = useMutation({
    mutationFn: simpanPinDompet,
    onSuccess: (res) => {
      segarkanCacheDompet();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'PIN dompet siswa berhasil disimpan.');
      setAksi({ jenis: null, item: null });
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, 'Gagal menyimpan PIN dompet siswa.')),
  });

  const limitMutation = useMutation({
    mutationFn: simpanLimitHarian,
    onSuccess: (res) => {
      segarkanCacheDompet();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || 'Limit belanja harian berhasil diperbarui.');
      setAksi({ jenis: null, item: null });
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, 'Gagal menyimpan limit belanja harian.')),
  });

  const items = siswaQuery.data?.items || [];
  const total = siswaQuery.data?.pagination?.total ?? items.length;
  const baseIndex = page * rowsPerPage;

  const bukaAksi = (jenis, item) => {
    setErrorDialog('');
    setAksi({ jenis, item });
  };

  return (
    <PageContainer title="Dompet Siswa & Top-Up" description="Kelola saldo, top-up loket, PIN, dan limit harian siswa">
      <ParentCard title="Dompet Siswa & Top-Up Loket">
        <Alerts key={`${kunciSukses}-${kunciError}`} error={error} success={success} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <SearchButton
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Cari nama, NIS, atau kode QR..."
          />
          <Select
            size="small"
            displayEmpty
            value={statusSiswa}
            onChange={(e) => {
              setStatusSiswa(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Semua Status</MenuItem>
            <MenuItem value="aktif">Siswa Aktif</MenuItem>
            <MenuItem value="nonaktif">Nonaktif</MenuItem>
            <MenuItem value="lulus">Lulus</MenuItem>
          </Select>
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Siswa</TableCell>
                  <TableCell>Kode QR</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="right">Limit Harian</TableCell>
                  <TableCell align="center">Status Dompet</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {siswaQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : siswaQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        {pesanGalatKantin(siswaQuery.error, 'Gagal memuat daftar siswa.')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Siswa tidak ditemukan.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((siswa, idx) => {
                    const statusDompet = metaStatusDompet(siswa.dompet);
                    const punyaLimit =
                      siswa.dompet?.limit_harian !== null && siswa.dompet?.limit_harian !== undefined;
                    return (
                      <TableRow key={siswa.id} hover>
                        <TableCell>{baseIndex + idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {siswa.nama || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            NIS: {siswa.nis || '-'} {siswa.kelas ? `· ${siswa.kelas}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>{siswa.kode_qr || '-'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {formatRupiah(siswa.dompet?.saldo ?? 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {punyaLimit ? formatRupiah(siswa.dompet.limit_harian) : 'Tanpa Batas'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={statusDompet.label} color={statusDompet.color} />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<IconEye size={16} />}
                              disabled={!unitAktif}
                              onClick={() => setSiswaDetailId(siswa.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<IconCash size={16} />}
                              disabled={!unitAktif}
                              onClick={() => bukaAksi('topup', siswa)}
                            >
                              Top-Up
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<IconKey size={16} />}
                              disabled={!unitAktif}
                              onClick={() => bukaAksi('pin', siswa)}
                            >
                              PIN
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<IconAdjustmentsHorizontal size={16} />}
                              disabled={!unitAktif}
                              onClick={() => bukaAksi('limit', siswa)}
                            >
                              Limit
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
                    rowsPerPageOptions={[10, 25, 50]}
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

      <TopupDompetDialog
        buka={aksi.jenis === 'topup'}
        siswa={aksi.item}
        dompet={aksi.item?.dompet}
        sibuk={topupMutation.isPending}
        errorServer={errorDialog}
        onKirim={(payload) => topupMutation.mutate(payload)}
        onTutup={() => setAksi({ jenis: null, item: null })}
      />

      <AturPinDialog
        buka={aksi.jenis === 'pin'}
        siswa={aksi.item}
        dompet={aksi.item?.dompet}
        sibuk={pinMutation.isPending}
        errorServer={errorDialog}
        onKirim={(payload) => pinMutation.mutate({ siswaId: aksi.item.id, payload })}
        onTutup={() => setAksi({ jenis: null, item: null })}
      />

      <AturLimitDialog
        buka={aksi.jenis === 'limit'}
        siswa={aksi.item}
        dompet={aksi.item?.dompet}
        sibuk={limitMutation.isPending}
        errorServer={errorDialog}
        onKirim={(payload) => limitMutation.mutate({ siswaId: aksi.item.id, payload })}
        onTutup={() => setAksi({ jenis: null, item: null })}
      />

      <DetailDompetDialog
        buka={Boolean(siswaDetailId)}
        detail={detailDompetQuery.data}
        isLoading={detailDompetQuery.isLoading}
        onTutup={() => setSiswaDetailId(null)}
      />
    </PageContainer>
  );
};

export default DompetSiswaPage;
