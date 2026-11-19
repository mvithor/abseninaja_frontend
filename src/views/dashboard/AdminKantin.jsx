import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconCheck,
  IconAlertTriangle,
  IconReceipt,
  IconShoppingCart,
  IconToolsKitchen2,
  IconWallet,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import { useSchoolTimezone } from 'src/hooks/useSchoolTimezone';
import KpiKantinRow from 'src/apps/admin-kantin/dashboard/KpiKantinRow';
import StrukTransaksiDialog from 'src/apps/admin-kantin/transaksi/StrukTransaksiDialog';
import { ambilDaftarTransaksi, ambilDetailTransaksi, ambilRekonsiliasiKantin } from 'src/apps/admin-kantin/api';
import {
  KUNCI_KANTIN,
  formatRupiah,
  formatWaktu,
  metaJenisTransaksi,
  metaStatusUnit,
  pesanGalatKantin,
} from 'src/apps/admin-kantin/kantin';
import { useKonteksKantin } from 'src/apps/admin-kantin/useKonteksKantin';

const DashboardAdminKantin = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const timeZone = useSchoolTimezone();
  const konteksOutlet = useOutletContext();
  const fallbackProfilQuery = useKonteksKantin({ enabled: !konteksOutlet?.profil });
  const profil = konteksOutlet?.profil || fallbackProfilQuery.data;
  const unitAktif = konteksOutlet ? konteksOutlet.unitAktif : Boolean(profil?.kantin?.is_aktif);
  const userId = user?.userId;

  const [trxDipilihId, setTrxDipilihId] = useState(null);

  const rekonQuery = useQuery({
    queryKey: [KUNCI_KANTIN.rekonsiliasi, userId, 'ringkas'],
    queryFn: ambilRekonsiliasiKantin,
    enabled: Boolean(profil?.kantin?.id),
  });

  const transaksiTerbaruQuery = useQuery({
    queryKey: [KUNCI_KANTIN.transaksi, userId, { page: 1, limit: 5 }],
    queryFn: () => ambilDaftarTransaksi({ page: 1, limit: 5 }),
    enabled: Boolean(profil?.kantin?.id),
  });

  const detailTrxQuery = useQuery({
    queryKey: [KUNCI_KANTIN.detailTransaksi, userId, trxDipilihId],
    queryFn: () => ambilDetailTransaksi(trxDipilihId),
    enabled: Boolean(trxDipilihId),
  });

  const kantin = profil?.kantin;
  const statusUnit = metaStatusUnit(kantin?.is_aktif);
  const transaksiTerbaru = transaksiTerbaruQuery.data?.items || [];
  const rekon = rekonQuery.data;

  return (
    <PageContainer title="Dashboard Admin Kantin" description="Ringkasan operasional dan keuangan kantin cashless">
      <Stack spacing={3}>
        {/* Header Identitas Unit Kantin */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4">{kantin?.nama_kantin || 'Dashboard Admin Kantin'}</Typography>
              <Chip size="small" label={statusUnit.label} color={statusUnit.color} />
              {rekon && (
                <Chip
                  size="small"
                  icon={rekon.seimbang ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />}
                  label={rekon.seimbang ? 'Ledger Seimbang' : 'Selisih Terdeteksi'}
                  color={rekon.seimbang ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Pengelola: {user?.name || kantin?.admin_pengelola?.nama || 'Admin Kantin'}
              {kantin?.lokasi ? ` · Lokasi: ${kantin.lokasi}` : ''}
              {kantin?.penanggung_jawab ? ` · PJ: ${kantin.penanggung_jawab}` : ''}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<IconShoppingCart size={18} />}
              disabled={!unitAktif}
              onClick={() => navigate('/dashboard/admin-kantin/kasir')}
            >
              Buka Kasir POS
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconWallet size={18} />}
              disabled={!unitAktif}
              onClick={() => navigate('/dashboard/admin-kantin/dompet')}
            >
              Dompet & Top-Up
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<IconToolsKitchen2 size={18} />}
              disabled={!unitAktif}
              onClick={() => navigate('/dashboard/admin-kantin/menu')}
            >
              Kelola Menu
            </Button>
          </Stack>
        </Box>

        {/* Kartu KPI Utama */}
        {rekonQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => rekonQuery.refetch()}>
                Coba lagi
              </Button>
            }
          >
            {pesanGalatKantin(rekonQuery.error, 'Gagal memuat ringkasan keuangan kantin.')}
          </Alert>
        ) : (
          <KpiKantinRow
            saldoMengendap={kantin?.saldo_mengendap ?? 0}
            rekonsiliasi={rekon}
            isLoading={rekonQuery.isLoading}
            onBukaPencairan={() => navigate('/dashboard/admin-kantin/pencairan')}
            onBukaTransaksi={() => navigate('/dashboard/admin-kantin/transaksi')}
          />
        )}

        {/* Transaksi Terbaru */}
        <Box sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
            <Grid size="auto">
              <Typography variant="h6">Transaksi Terbaru</Typography>
              <Typography variant="caption" color="text.secondary">
                5 mutasi terakhir pada unit kantin ini
              </Typography>
            </Grid>
            <Grid size="auto">
              <Button
                size="small"
                variant="text"
                startIcon={<IconReceipt size={16} />}
                onClick={() => navigate('/dashboard/admin-kantin/transaksi')}
              >
                Lihat Semua Transaksi
              </Button>
            </Grid>
          </Grid>

          <Paper variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Waktu</TableCell>
                    <TableCell>Kode Transaksi</TableCell>
                    <TableCell>Jenis</TableCell>
                    <TableCell>Siswa</TableCell>
                    <TableCell align="right">Nominal</TableCell>
                    <TableCell align="center">Detail</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transaksiTerbaruQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : transaksiTerbaruQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Alert severity="error">
                          {pesanGalatKantin(transaksiTerbaruQuery.error, 'Gagal memuat transaksi terbaru.')}
                        </Alert>
                      </TableCell>
                    </TableRow>
                  ) : transaksiTerbaru.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Belum ada transaksi pada unit kantin ini.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transaksiTerbaru.map((trx) => {
                      const jenis = metaJenisTransaksi(trx.jenis_transaksi);
                      return (
                        <TableRow key={trx.id} hover>
                          <TableCell>{formatWaktu(trx.dibuat_pada, timeZone)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {trx.kode_transaksi}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={jenis.label} color={jenis.color} variant="outlined" />
                          </TableCell>
                          <TableCell>{trx.siswa?.nama || '-'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {jenis.tanda}
                              {formatRupiah(trx.nominal)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" onClick={() => setTrxDipilihId(trx.id)}>
                              Struk
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Stack>

      <StrukTransaksiDialog
        buka={Boolean(trxDipilihId)}
        transaksi={detailTrxQuery.data}
        isLoading={detailTrxQuery.isLoading}
        timeZone={timeZone}
        onTutup={() => setTrxDipilihId(null)}
      />
    </PageContainer>
  );
};

export default DashboardAdminKantin;
