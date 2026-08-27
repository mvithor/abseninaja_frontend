import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Switch, FormControlLabel,
  CircularProgress, Alert, IconButton, Divider,
} from '@mui/material';
import { IconDownload, IconX, IconCalendar } from '@tabler/icons-react';
import axiosInstance from 'src/utils/axiosInstance';

const today = () => new Date().toISOString().slice(0, 10);

const awalBulanIni = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const ExportLaporanKehadiranDialog = ({ open, onClose }) => {
  const [tanggalMulai, setTanggalMulai] = useState(awalBulanIni);
  const [tanggalAkhir, setTanggalAkhir] = useState(today);
  const [withPrev, setWithPrev] = useState(false);
  const [prevMulai, setPrevMulai] = useState('');
  const [prevAkhir, setPrevAkhir] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setError('');

    if (!tanggalMulai || !tanggalAkhir) {
      setError('Tanggal mulai dan tanggal akhir wajib diisi.');
      return;
    }
    if (tanggalMulai > tanggalAkhir) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
      return;
    }
    if (withPrev && (!prevMulai || !prevAkhir)) {
      setError('Isi kedua tanggal periode pembanding atau nonaktifkan perbandingan.');
      return;
    }

    setLoading(true);
    try {
      const params = { tanggal_mulai: tanggalMulai, tanggal_akhir: tanggalAkhir };
      if (withPrev && prevMulai && prevAkhir) {
        params.tanggal_mulai_prev = prevMulai;
        params.tanggal_akhir_prev = prevAkhir;
      }

      const res = await axiosInstance.get(
        '/api/v1/admin-sekolah/download/laporan-kehadiran-gerbang',
        { params, responseType: 'blob' },
      );

      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Kehadiran_Gerbang_${tanggalMulai}_${tanggalAkhir}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      // Jika backend kirim blob error (JSON dalam blob), coba parse pesannya
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          setError(json.msg || 'Gagal mengunduh laporan.');
        } catch {
          setError('Gagal mengunduh laporan.');
        }
      } else {
        setError(err.response?.data?.msg || 'Gagal mengunduh laporan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Export Laporan Kehadiran Gerbang
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PDF digenerate langsung dari server · format resmi AbseniNaja
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={loading} sx={{ mt: -0.5 }}>
            <IconX size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Periode Laporan */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <IconCalendar size={16} color="#6366F1" />
          <Typography variant="subtitle2" fontWeight={700}>
            Periode Laporan
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            label="Tanggal Mulai"
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <TextField
            label="Tanggal Akhir"
            type="date"
            value={tanggalAkhir}
            onChange={(e) => setTanggalAkhir(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Toggle perbandingan */}
        <FormControlLabel
          control={
            <Switch
              checked={withPrev}
              onChange={(e) => setWithPrev(e.target.checked)}
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Sertakan perbandingan periode sebelumnya
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Menambahkan seksi tren &amp; grafik perbandingan di PDF
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', mb: withPrev ? 2 : 0 }}
        />

        {withPrev && (
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <TextField
              label="Mulai Pembanding"
              type="date"
              value={prevMulai}
              onChange={(e) => setPrevMulai(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
            <TextField
              label="Akhir Pembanding"
              type="date"
              value={prevAkhir}
              onChange={(e) => setPrevAkhir(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Batal
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={
            loading
              ? <CircularProgress size={13} color="inherit" />
              : <IconDownload size={15} />
          }
          onClick={handleDownload}
          disabled={loading || !tanggalMulai || !tanggalAkhir}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            minWidth: 130,
          }}
        >
          {loading ? 'Mengunduh...' : 'Download PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportLaporanKehadiranDialog;
