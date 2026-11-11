import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { IconNotebook } from '@tabler/icons-react';
import PenangananItem from 'src/components/jurnal-bk/PenangananItem';
import { formatTanggalPanjang } from 'src/components/jurnal-bk/jurnalConfig';

// Daftar catatan penanganan dikelompokkan per tanggal (urutan dari server: terbaru dulu).
const JurnalHarianList = ({ entriList, hariIni, isLoading, isError, errorMessage, emptyMessage, onDetail, onUbah, onHapus, onTambah }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) {
    return <Typography color="error" variant="h6" align="center" sx={{ py: 6 }}>{errorMessage}</Typography>;
  }
  if (entriList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <IconNotebook size={44} color="#94A3B8" />
        <Typography variant="h6" sx={{ mt: 1 }}>{emptyMessage}</Typography>
        {onTambah && (
          <Button variant="outlined" sx={{ mt: 2, textTransform: 'none' }} onClick={onTambah}>
            Catat penanganan
          </Button>
        )}
      </Box>
    );
  }

  const grup = entriList.reduce((acc, e) => {
    (acc[e.tanggal] = acc[e.tanggal] || []).push(e);
    return acc;
  }, {});

  return (
    <Stack spacing={3}>
      {Object.entries(grup).map(([tanggal, entri]) => (
        <Box key={tanggal}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h6">{formatTanggalPanjang(tanggal)}</Typography>
            {tanggal === hariIni && <Typography variant="caption" color="primary">Hari ini</Typography>}
            <Typography variant="body2" color="text.secondary">· {entri.length} penanganan</Typography>
          </Box>
          <Stack spacing={1}>
            {entri.map((e) => (
              <PenangananItem key={e.id} entri={e} hariIni={hariIni} onDetail={onDetail} onUbah={onUbah} onHapus={onHapus} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

JurnalHarianList.propTypes = {
  entriList: PropTypes.array.isRequired,
  hariIni: PropTypes.string,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  errorMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
  onDetail: PropTypes.func.isRequired,
  onUbah: PropTypes.func,
  onHapus: PropTypes.func,
  onTambah: PropTypes.func,
};

export default JurnalHarianList;
