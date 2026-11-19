import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatRupiah, formatWaktu, metaJenisTransaksi } from '../kantin';

const BarisInfo = ({ label, nilai }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right' }}>
      {nilai}
    </Typography>
  </Box>
);

BarisInfo.propTypes = {
  label: PropTypes.string.isRequired,
  nilai: PropTypes.node,
};

const StrukTransaksiDialog = ({
  buka,
  transaksi,
  isLoading = false,
  judul = 'Detail Struk Transaksi',
  timeZone = 'Asia/Jakarta',
  aksiTambahan = null,
  onTutup,
}) => {
  const jenis = metaJenisTransaksi(transaksi?.jenis_transaksi);
  const items = Array.isArray(transaksi?.items) ? transaksi.items : [];

  return (
    <Dialog open={buka} onClose={onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-struk-kantin">
      <DialogTitle id="judul-struk-kantin">{judul}</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : !transaksi ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
            Data transaksi tidak tersedia.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {transaksi.kode_transaksi}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatWaktu(transaksi.dibuat_pada, timeZone)}
                </Typography>
              </Box>
              <Chip label={jenis.label} color={jenis.color} size="small" />
            </Box>

            {transaksi.reversal && (
              <Alert severity="warning">
                Transaksi ini telah dibatalkan (reversal): <strong>{transaksi.reversal.kode_transaksi}</strong> pada{' '}
                {formatWaktu(transaksi.reversal.dibuat_pada, timeZone)}.
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2 }}>
              {transaksi.siswa && (
                <>
                  <BarisInfo
                    label="Siswa"
                    nilai={`${transaksi.siswa.nama || '-'}${transaksi.siswa.nis ? ` (NIS ${transaksi.siswa.nis})` : ''}`}
                  />
                  {transaksi.siswa.kode_qr && <BarisInfo label="Kode QR" nilai={transaksi.siswa.kode_qr} />}
                </>
              )}
              {transaksi.kantin?.nama_kantin && (
                <BarisInfo label="Unit Kantin" nilai={transaksi.kantin.nama_kantin} />
              )}
              <BarisInfo label="Nominal" nilai={`${jenis.tanda}${formatRupiah(transaksi.nominal)}`} />
              <BarisInfo label="Saldo Sebelum" nilai={formatRupiah(transaksi.saldo_sebelum)} />
              <BarisInfo label="Saldo Sesudah" nilai={formatRupiah(transaksi.saldo_sesudah)} />
              {transaksi.catatan && <BarisInfo label="Catatan" nilai={transaksi.catatan} />}
            </Paper>

            {items.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Rincian Pesanan ({items.length} item)
                </Typography>
                <Paper variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Menu</TableCell>
                        <TableCell align="right">Harga</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((it) => (
                        <TableRow key={it.id || `${it.menu_id}-${it.nama_menu_snapshot}`}>
                          <TableCell>{it.nama_menu_snapshot}</TableCell>
                          <TableCell align="right">{formatRupiah(it.harga_satuan)}</TableCell>
                          <TableCell align="center">{it.jumlah}</TableCell>
                          <TableCell align="right">{formatRupiah(it.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Total Belanja
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={700}>
                            {formatRupiah(transaksi.nominal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            <Divider />
            <Typography variant="caption" color="text.secondary">
              Idempotency Key: {transaksi.idempotency_key}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        {aksiTambahan}
        <Button onClick={onTutup} variant="contained">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

StrukTransaksiDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  transaksi: PropTypes.object,
  isLoading: PropTypes.bool,
  judul: PropTypes.string,
  timeZone: PropTypes.string,
  aksiTambahan: PropTypes.node,
  onTutup: PropTypes.func.isRequired,
};

export default StrukTransaksiDialog;
