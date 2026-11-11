import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { formatTanggalWaktu } from 'src/components/perangkat-ajar/perangkatAjarConfig';
import { formatTanggalPendek, STATUS_AKSES } from './jurnalConfig';
import { useAksesRahasiaMutations, useDaftarAksesRahasia } from './useAksesRahasia';

// Pemberitahuan untuk penulis: ada permintaan izin baca catatan rahasia dari koordinator.
// Tidak tampil bila tidak ada permintaan yang menunggu.
const PermintaanAksesBanner = ({ timezone, onLihatCatatan }) => {
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState(null);
  const { data } = useDaftarAksesRahasia();
  const { putuskan, isPending } = useAksesRahasiaMutations({
    onSuccess: (msg) => setPesan({ tipe: 'success', teks: msg }),
    onError: (msg) => setPesan({ tipe: 'error', teks: msg }),
  });

  const masuk = data?.masuk || [];
  if (masuk.length === 0 && !buka) return null;

  return (
    <>
      {masuk.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => { setPesan(null); setBuka(true); }}>
              Tinjau
            </Button>
          }
        >
          Koordinator BK meminta izin membaca {masuk.length} catatan rahasia Anda.
        </Alert>
      )}

      <Dialog open={buka} onClose={() => setBuka(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Permintaan Izin Baca Catatan Rahasia
          <Typography variant="body2" color="text.secondary">
            Koordinator hanya dapat membaca catatan yang Anda setujui. Izin bisa dicabut kapan saja dari detail catatan.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {pesan && <Alert severity={pesan.tipe} sx={{ mb: 2 }}>{pesan.teks}</Alert>}
          {masuk.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>Semua permintaan sudah diputuskan.</Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={2}>
              {masuk.map((e) => (
                <Box key={e.id}>
                  <Typography variant="subtitle1" fontWeight={600}>{e.judul}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTanggalPendek(e.tanggal)} · {e.siswa.map((s) => s.nama).join(', ')} · {e.kategori?.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Alasan:</strong> {e.akses_koordinator?.alasan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Diminta {formatTanggalWaktu(e.akses_koordinator?.diminta_pada, timezone)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={isPending}
                      onClick={() => putuskan.mutate({ id: e.id, keputusan: STATUS_AKSES.DISETUJUI })}
                    >
                      Setujui
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      disabled={isPending}
                      onClick={() => putuskan.mutate({ id: e.id, keputusan: STATUS_AKSES.DITOLAK })}
                    >
                      Tolak
                    </Button>
                    {onLihatCatatan && (
                      <Button size="small" onClick={() => { setBuka(false); onLihatCatatan(e); }}>
                        Lihat catatan
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setBuka(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

PermintaanAksesBanner.propTypes = {
  timezone: PropTypes.string,
  onLihatCatatan: PropTypes.func,
};

export default PermintaanAksesBanner;
