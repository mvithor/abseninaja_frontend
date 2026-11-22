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
import { IconAdjustmentsHorizontal, IconCash, IconEye, IconKey, IconLockOpen } from '@tabler/icons-react';
import Alerts from 'src/components/alerts/Alerts';
import SearchButton from 'src/components/button-group/SearchButton';
import PageContainer from 'src/components/container/PageContainer';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import useDebouncedValue from 'src/hooks/useDebouncedValue';
import usePesanAlert from 'src/hooks/usePesanAlert';
import {
  AturLimitDialog,
  AturPinDialog,
  DetailDompetDialog,
  TopupDompetDialog,
} from 'src/apps/admin-kantin/dompet/DompetAksiDialogs';
import ResetPinSekolahDialog from 'src/apps/admin-sekolah/kantin/dompet/ResetPinSekolahDialog';
import {
  ambilDetailDompetSekolah,
  cariSiswaDompetSekolah,
  prosesTopupSekolah,
  resetPinSekolah,
  simpanLimitSekolah,
  simpanPinSekolah,
} from 'src/apps/admin-sekolah/kantin/api';
import {
  KUNCI_KANTIN_SEKOLAH,
  formatRupiah,
  metaStatusDompet,
  pesanGalatKantin,
} from 'src/apps/admin-sekolah/kantin/kantinSekolah';

const KOLOM = 7;

const DompetSekolahPage = () => {
  const userId = useSelector((state) => state.user.userId);
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
    queryKey: [KUNCI_KANTIN_SEKOLAH.siswa, userId, paramsQuery],
    queryFn: () => cariSiswaDompetSekolah(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const detailDompetQuery = useQuery({
    queryKey: [KUNCI_KANTIN_SEKOLAH.dompet, userId, siswaDetailId],
    queryFn: () => ambilDetailDompetSekolah({ siswa_id: siswaDetailId }),
    enabled: Boolean(siswaDetailId),
  });

  const segarkanCache = () => {
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.siswa, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.dompet, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.transaksi, userId] });
    queryClient.invalidateQueries({ queryKey: [KUNCI_KANTIN_SEKOLAH.rekonsiliasi, userId] });
  };

  const buatMutasi = (mutationFn, fallbackMsg) => ({
    mutationFn,
    onSuccess: (res) => {
      segarkanCache();
      setErrorDialog('');
      setError('');
      setSuccess(res?.msg || fallbackMsg);
      setAksi({ jenis: null, item: null });
    },
    onError: (err) => setErrorDialog(pesanGalatKantin(err, fallbackMsg)),
  });

  const topupMutation = useMutation(buatMutasi(prosesTopupSekolah, 'Top-up saldo siswa berhasil dicatat.'));
  const pinMutation = useMutation(buatMutasi(simpanPinSekolah, 'PIN dompet siswa berhasil disimpan.'));
  const resetPinMutation = useMutation(buatMutasi(resetPinSekolah, 'PIN dompet siswa berhasil direset.'));
  const limitMutation = useMutation(buatMutasi(simpanLimitSekolah, 'Limit harian dompet berhasil diperbarui.'));

  const bukaAksi = (jenis, item) => {
    setErrorDialog('');
    setAksi({ jenis, item });
  };

  const items = siswaQuery.data?.items || [];
  const total = siswaQuery.data?.pagination?.total ?? items.length;
  const baseIndex = page * rowsPerPage;

  return (
    <PageContainer title="Dompet & Reset PIN Siswa" description="Kelola saldo dompet, limit harian, dan reset PIN siswa">
      <ParentCard title="Dompet Siswa & Pengawasan Sekolah">
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
          <CustomSelect
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
          </CustomSelect>
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
                      Siswa
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Kode QR
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Saldo
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Limit Harian
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      Status Dompet
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
                    const sudahPunyaPin = Boolean(siswa.dompet?.pin_sudah_diatur);
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
                              onClick={() => setSiswaDetailId(siswa.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<IconCash size={16} />}
                              onClick={() => bukaAksi('topup', siswa)}
                            >
                              Top-Up
                            </Button>
                            {!sudahPunyaPin ? (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<IconKey size={16} />}
                                onClick={() => bukaAksi('pin', siswa)}
                              >
                                Atur PIN
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<IconLockOpen size={16} />}
                                onClick={() => bukaAksi('resetPin', siswa)}
                              >
                                Reset PIN
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<IconAdjustmentsHorizontal size={16} />}
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

      <ResetPinSekolahDialog
        buka={aksi.jenis === 'resetPin'}
        siswa={aksi.item}
        sibuk={resetPinMutation.isPending}
        errorServer={errorDialog}
        onKirim={(payload) => resetPinMutation.mutate({ siswaId: aksi.item.id, payload })}
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
        errorMessage={
          detailDompetQuery.isError ? pesanGalatKantin(detailDompetQuery.error, 'Gagal memuat detail dompet.') : ''
        }
        onTutup={() => setSiswaDetailId(null)}
      />
    </PageContainer>
  );
};

export default DompetSekolahPage;
