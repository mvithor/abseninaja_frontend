import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { IconDownload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { pesanGalatFile, unduhFile } from './perangkatAjarApi';
import { formatTanggalWaktu, formatUkuranFile, STATUS_CONFIG } from './perangkatAjarConfig';

// Riwayat semua versi satu dokumen beserta keputusan validasinya (bukti supervisi, PRD poin h).
// `apiBase` = WAKA_API atau GURU_API: guru hanya bisa membaca riwayat dokumennya sendiri.
const RiwayatVersiDialog = ({ open, onClose, apiBase, dokumenId, judul, timezone }) => {
  const [unduhVersi, setUnduhVersi] = useState(null);
  const [error, setError] = useState('');

  const { data: riwayat = [], isLoading, isError } = useQuery({
    queryKey: ['perangkat-ajar-riwayat', apiBase, dokumenId],
    queryFn: async () => {
      const res = await axiosInstance.get(`${apiBase}/perangkat-ajar/dokumen/${dokumenId}/riwayat`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    enabled: open && !!dokumenId,
  });

  // Terbaru di atas
  const urut = [...riwayat].sort((a, b) => b.versi - a.versi);

  const handleUnduh = async (item) => {
    setUnduhVersi(item.versi);
    setError('');
    try {
      await unduhFile(`${apiBase}/perangkat-ajar/dokumen/${dokumenId}/file?versi=${item.versi}`, item.nama_file);
    } catch (err) {
      setError(await pesanGalatFile(err, 'File gagal diunduh. Silakan coba lagi.'));
    } finally {
      setUnduhVersi(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Riwayat Versi
        <Typography variant="body2" color="text.secondary">{judul}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography>}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center" sx={{ py: 4 }}>Riwayat gagal dimuat. Silakan coba lagi.</Typography>
        ) : urut.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>Belum ada versi yang diunggah</Typography>
        ) : (
          <Timeline sx={{ p: 0, m: 0, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }}>
            {urut.map((item, i) => {
              const keputusan = item.keputusan;
              const status = keputusan ? STATUS_CONFIG[keputusan.status] : STATUS_CONFIG.menunggu_validasi;
              return (
                <TimelineItem key={item.versi}>
                  <TimelineSeparator>
                    <TimelineDot color={status.color === 'default' ? 'grey' : status.color} />
                    {i < urut.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight={600}>Versi {item.versi}</Typography>
                      <Chip label={status.label} color={status.color} size="small" />
                      {item.terlambat && <Chip label="Terlambat" color="error" variant="outlined" size="small" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Diunggah {formatTanggalWaktu(item.diunggah_pada, timezone)} · {item.nama_file || '-'} ({formatUkuranFile(item.ukuran)})
                    </Typography>

                    {keputusan?.catatan && (
                      <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'grey.100', borderLeft: 3, borderColor: `${status.color === 'default' ? 'grey' : status.color}.main` }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{keputusan.catatan}</Typography>
                      </Box>
                    )}
                    {keputusan && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Divalidasi oleh {keputusan.oleh || '-'} · {formatTanggalWaktu(keputusan.pada, timezone)}
                      </Typography>
                    )}

                    <Button
                      size="small"
                      startIcon={<IconDownload size={14} />}
                      onClick={() => handleUnduh(item)}
                      disabled={unduhVersi === item.versi}
                      sx={{ mt: 0.5, px: 0, textTransform: 'none' }}
                    >
                      {unduhVersi === item.versi ? 'Mengunduh...' : 'Unduh versi ini'}
                    </Button>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

RiwayatVersiDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  apiBase: PropTypes.string.isRequired,
  dokumenId: PropTypes.string,
  judul: PropTypes.string,
  timezone: PropTypes.string,
};

export default RiwayatVersiDialog;
