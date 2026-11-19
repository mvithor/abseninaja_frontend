import { useState } from 'react';
import { useSelector } from 'react-redux';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
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
import Grid from '@mui/material/Grid';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import TablePaginationActions from 'src/components/table-pagination-actions/TablePaginationActions';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import { ambilDaftarPencairan, ambilRekonsiliasiKantin } from 'src/apps/admin-kantin/api';
import {
  KUNCI_KANTIN,
  formatRupiah,
  formatWaktu,
  metaStatusPencairan,
  pesanGalatKantin,
} from 'src/apps/admin-kantin/kantin';

const KOLOM = 7;

const PencairanKantinPage = () => {
  const userId = useSelector((state) => state.user.userId);
  const timeZone = useSchoolTimezone();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  const paramsQuery = {
    page: page + 1,
    limit: rowsPerPage,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const rekonQuery = useQuery({
    queryKey: [KUNCI_KANTIN.rekonsiliasi, userId, 'pencairan-halaman'],
    queryFn: ambilRekonsiliasiKantin,
  });

  const pencairanQuery = useQuery({
    queryKey: [KUNCI_KANTIN.pencairan, userId, paramsQuery],
    queryFn: () => ambilDaftarPencairan(paramsQuery),
    placeholderData: keepPreviousData,
  });

  const rekon = rekonQuery.data;
  const rincian = rekon?.rincian_kantin?.[0] || null;
  const items = pencairanQuery.data?.items || [];
  const total = pencairanQuery.data?.pagination?.total ?? items.length;

  return (
    <PageContainer title="Pencairan & Rekonsiliasi Kantin" description="Riwayat pencairan saldo mengendap dan status rekonsiliasi">
      <Stack spacing={3}>
        {/* Panel Audit Rekonsiliasi Ledger Unit Kantin */}
        <ParentCard title="Rekonsiliasi Ledger Kantin">
          {rekonQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : rekonQuery.isError ? (
            <Alert severity="error">{pesanGalatKantin(rekonQuery.error, 'Gagal memuat laporan rekonsiliasi.')}</Alert>
          ) : (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Rumus audit: Total Belanja − Total Reversal − Total Pencairan Aktif = Saldo Mengendap Seharusnya
                </Typography>
                <Chip
                  icon={rekon?.seimbang ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
                  label={rekon?.seimbang ? 'Ledger Seimbang (0 Selisih)' : `Selisih ${formatRupiah(rekon?.selisih_kantin ?? 0)}`}
                  color={rekon?.seimbang ? 'success' : 'error'}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Saldo Mengendap Tercatat
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                      {formatRupiah(rincian?.saldo_mengendap_tercatat ?? rekon?.kantin_saldo_mengendap_tercatat ?? 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Saldo Mengendap Seharusnya
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {formatRupiah(rincian?.saldo_mengendap_seharusnya ?? rekon?.kantin_saldo_mengendap_seharusnya ?? 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Belanja Netto (Belanja − Reversal)
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {formatRupiah((rekon?.total_belanja ?? 0) - (rekon?.total_reversal ?? 0))}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Pencairan Aktif
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {formatRupiah(rekon?.total_pencairan_aktif ?? 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Menunggu: {formatRupiah(rekon?.total_pencairan_menunggu ?? 0)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}
        </ParentCard>

        {/* Tabel Riwayat Pencairan */}
        <ParentCard title="Riwayat Pencairan Dana Kantin">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Pencairan saldo mengendap dicatat dan disetujui oleh Bendahara / Admin Sekolah.
            </Typography>
            <Select
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
            </Select>
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Waktu</TableCell>
                    <TableCell>Kode Pencairan</TableCell>
                    <TableCell align="center">Metode</TableCell>
                    <TableCell align="right">Nominal</TableCell>
                    <TableCell align="right">Saldo Sesudah</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Catatan / Ref</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pencairanQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : pencairanQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                        <Typography color="error">
                          {pesanGalatKantin(pencairanQuery.error, 'Gagal memuat riwayat pencairan.')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={KOLOM} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Belum ada riwayat pencairan dana.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((p) => {
                      const st = metaStatusPencairan(p.status);
                      return (
                        <TableRow key={p.id} hover>
                          <TableCell>{formatWaktu(p.dibuat_pada, timeZone)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {p.kode_pencairan}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={p.metode_pencairan} variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700}>
                              {formatRupiah(p.nominal)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatRupiah(p.saldo_sesudah)}</TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={st.label} color={st.color} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{p.catatan || '-'}</Typography>
                            {p.referensi_eksternal && (
                              <Typography variant="caption" color="text.secondary">
                                Ref: {p.referensi_eksternal}
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
      </Stack>
    </PageContainer>
  );
};

export default PencairanKantinPage;
