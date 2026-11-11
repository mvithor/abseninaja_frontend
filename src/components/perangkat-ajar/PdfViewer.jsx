import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import { usePdfObjectUrl } from './usePdfObjectUrl';

// Area tampilan PDF (tanpa dialog). Dipakai PdfPreviewDialog dan dialog validasi Waka.
const PdfViewer = ({ fileUrl, judul, aktif = true, sx }) => {
  const { objectUrl, isLoading, error } = usePdfObjectUrl(fileUrl, aktif);

  const pusat = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' };

  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.100', ...sx }}>
      {isLoading ? (
        <Box sx={pusat}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={pusat}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : objectUrl ? (
        <Box component="iframe" src={objectUrl} title={judul || 'Pratinjau PDF'} sx={{ border: 0, width: '100%', height: '100%' }} />
      ) : null}
    </Box>
  );
};

PdfViewer.propTypes = {
  fileUrl: PropTypes.string,
  judul: PropTypes.string,
  aktif: PropTypes.bool,
  sx: PropTypes.object,
};

export default PdfViewer;
