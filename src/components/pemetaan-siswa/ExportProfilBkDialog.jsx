import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { IconDownload, IconExternalLink } from '@tabler/icons-react';
import { exportProfilBkPdf } from './profilBkExportApi';

// Opsi ekspor PDF profil siswa. Catatan rahasia default TIDAK disertakan; bila dicentang,
// server hanya menyertakan catatan rahasia yang boleh dibaca pengunduh (miliknya sendiri, atau
// milik anggota lain yang sudah memberi izin baca kepada koordinator).
const ExportProfilBkDialog = ({ siswa, onClose }) => {
  const [includeRiwayat, setIncludeRiwayat] = useState(true);
  const [includeRahasia, setIncludeRahasia] = useState(false);
  const [sedang, setSedang] = useState(null);
  const [error, setError] = useState('');

  const jalankan = async (inline) => {
    setSedang(inline ? 'pratinjau' : 'unduh');
    setError('');
    try {
      await exportProfilBkPdf(siswa.id, { includeRiwayat, includeRahasia: includeRiwayat && includeRahasia, inline, namaSiswa: siswa.nama });
      if (!inline) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSedang(null);
    }
  };

  return (
    <Dialog open={Boolean(siswa)} onClose={() => !sedang && onClose()} fullWidth maxWidth="xs">
      <DialogTitle>
        Unduh Profil Siswa
        <Typography variant="body2" color="text.secondary">{siswa?.nama} · {siswa?.kelas?.nama}</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          PDF berisi identitas, faktor perhatian, dan pemetaan 5 dimensi.
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={includeRiwayat} onChange={(e) => setIncludeRiwayat(e.target.checked)} />}
          label="Sertakan riwayat permasalahan & penanganan"
        />
        <Box sx={{ pl: 4 }}>
          <FormControlLabel
            disabled={!includeRiwayat}
            control={<Checkbox checked={includeRiwayat && includeRahasia} onChange={(e) => setIncludeRahasia(e.target.checked)} />}
            label="Sertakan isi catatan rahasia"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -0.5 }}>
            Hanya catatan rahasia yang boleh Anda baca yang ikut tercetak. Catatan rahasia lain ditulis
            &quot;(Catatan rahasia tidak disertakan)&quot;.
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ mt: 1 }}>
          Dokumen ini berisi data pribadi siswa. Bagikan hanya untuk keperluan layanan BK.
        </Alert>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={Boolean(sedang)}>Batal</Button>
        <Button
          variant="outlined"
          startIcon={sedang === 'pratinjau' ? <CircularProgress size={14} /> : <IconExternalLink size={16} />}
          onClick={() => jalankan(true)}
          disabled={Boolean(sedang)}
        >
          Pratinjau
        </Button>
        <Button
          variant="contained"
          startIcon={sedang === 'unduh' ? <CircularProgress size={14} color="inherit" /> : <IconDownload size={16} />}
          onClick={() => jalankan(false)}
          disabled={Boolean(sedang)}
        >
          Unduh PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ExportProfilBkDialog.propTypes = {
  siswa: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ExportProfilBkDialog;
