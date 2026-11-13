import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { IconDownload, IconX } from '@tabler/icons-react';
import PdfViewer from './PdfViewer';
import { pesanGalatFile, unduhFile } from './perangkatAjarApi';

const PdfPreviewDialog = ({ open, onClose, fileUrl, judul, namaFile }) => {
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUnduh = async () => {
    setIsDownloading(true);
    setError('');
    try {
      await unduhFile(fileUrl, namaFile);
    } catch (err) {
      setError(await pesanGalatFile(err, 'File gagal diunduh. Silakan coba lagi.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" component="span" noWrap>{judul || 'Pratinjau Dokumen'}</Typography>
        <IconButton onClick={onClose} size="small">
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: '75vh' }}>
        <PdfViewer fileUrl={fileUrl} judul={judul} aktif={open} />
      </DialogContent>
      <DialogActions>
        {error && <Typography color="error" variant="body2" sx={{ mr: 'auto', ml: 1 }}>{error}</Typography>}
        <Button
          onClick={handleUnduh}
          startIcon={<IconDownload size={16} />}
          disabled={!fileUrl || isDownloading}
          variant="outlined"
        >
          {isDownloading ? 'Mengunduh...' : 'Unduh'}
        </Button>
        <Button onClick={onClose} variant="contained">Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

PdfPreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fileUrl: PropTypes.string,
  judul: PropTypes.string,
  namaFile: PropTypes.string,
};

export default PdfPreviewDialog;
