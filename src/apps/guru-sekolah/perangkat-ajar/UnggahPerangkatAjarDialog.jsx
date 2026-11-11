import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';
import { IconFileTypePdf, IconUpload } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import {
  formatUkuranFile,
  GURU_API,
  labelPenugasan,
  MAX_PDF_SIZE_LABEL,
  isKonflik,
  pesanGalat,
  STATUS_PERANGKAT,
  validasiFilePdf,
} from 'src/components/perangkat-ajar/perangkatAjarConfig';

// `target` = { penugasan, dokumen } yang akan diunggah. Dialog dirender ulang (key) per target
// oleh induknya, jadi state file/progres selalu mulai bersih.
const UnggahPerangkatAjarDialog = ({ target, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const { penugasan, dokumen } = target;
  const isRevisi = dokumen?.status === STATUS_PERANGKAT.PERLU_REVISI;

  const mutation = useMutation({
    mutationKey: ['unggahPerangkatAjar'],
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('penugasan_id', penugasan.id);
      formData.append('jenis', dokumen.jenis?.kode);
      formData.append('file', file);
      // Content-Type tidak diatur manual: browser yang mengisi boundary multipart.
      const res = await axiosInstance.post(`${GURU_API}/perangkat-ajar/unggah`, formData, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guru-perangkat-saya'] });
      queryClient.invalidateQueries({ queryKey: ['perangkat-ajar-riwayat'] });
      onSuccess(data?.msg || `${dokumen.jenis?.label || 'Perangkat ajar'} berhasil diunggah dan menunggu validasi`);
    },
    onError: (err) => {
      setProgress(0);
      // 409 (sudah menunggu validasi, terkunci, atau semester diarsipkan): status di halaman usang.
      if (isKonflik(err)) queryClient.invalidateQueries({ queryKey: ['guru-perangkat-saya'] });
      setError(pesanGalat(err, 'Terjadi kesalahan saat mengunggah perangkat ajar'));
    },
  });

  const handleFileChange = (event) => {
    const terpilih = event.target.files?.[0] || null;
    // Reset value supaya memilih file yang sama lagi tetap memicu onChange
    event.target.value = '';
    if (!terpilih) return;
    const pesan = validasiFilePdf(terpilih);
    setError(pesan);
    setFile(pesan ? null : terpilih);
  };

  const handleUnggah = () => {
    const pesan = validasiFilePdf(file);
    if (pesan) {
      setError(pesan);
      return;
    }
    setError('');
    setProgress(0);
    mutation.mutate();
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose();
  };

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isRevisi ? 'Unggah Ulang' : 'Unggah'} {dokumen.jenis?.label || 'Perangkat Ajar'}
        <Typography variant="body2" color="text.secondary">{labelPenugasan(penugasan)}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {isRevisi && dokumen.feedback_terakhir?.catatan && (
          <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
            <strong>Catatan revisi Waka Kurikulum:</strong>
            <br />
            {dokumen.feedback_terakhir.catatan}
          </Alert>
        )}

        <Box
          onClick={() => !mutation.isPending && inputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: file ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: mutation.isPending ? 'default' : 'pointer',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={handleFileChange} />
          {file ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <IconFileTypePdf size={32} color="#E53935" />
              <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatUkuranFile(file.size)} · klik untuk ganti file</Typography>
              </Box>
            </Box>
          ) : (
            <>
              <IconUpload size={32} />
              <Typography variant="subtitle1" sx={{ mt: 1 }}>Klik untuk memilih file</Typography>
              <Typography variant="caption" color="text.secondary">Hanya PDF, maksimal {MAX_PDF_SIZE_LABEL}</Typography>
            </>
          )}
        </Box>

        {mutation.isPending && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary">Mengunggah... {progress}%</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Setelah diunggah, dokumen menunggu validasi Waka Kurikulum. Anda baru bisa mengunggah ulang
          bila Waka Kurikulum meminta revisi.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={mutation.isPending}>Batal</Button>
        <Button
          onClick={handleUnggah}
          variant="contained"
          startIcon={<IconUpload size={16} />}
          disabled={!file || mutation.isPending}
        >
          {mutation.isPending ? 'Mengunggah...' : 'Unggah'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UnggahPerangkatAjarDialog.propTypes = {
  target: PropTypes.shape({
    penugasan: PropTypes.object.isRequired,
    dokumen: PropTypes.object.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default UnggahPerangkatAjarDialog;
