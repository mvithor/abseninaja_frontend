import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Tooltip, Typography } from '@mui/material';
import { IconCheck, IconCopy } from '@tabler/icons-react';

/**
 * Sandi awal guru mandiri. Tampil SEKALI: server tidak menyimpannya dalam bentuk terbaca dan tidak bisa
 * menampilkannya lagi (hanya reset yang membuat sandi baru). Dialog tidak bisa ditutup dengan klik di luar atau Esc,
 * supaya sandi tidak hilang tanpa sengaja; hanya tombol "Sudah disalin" yang menutupnya.
 */
const SandiAwalDialog = ({ buka, nama, email, sandi, judul = 'Sandi Awal Guru Mandiri', peringatan = '', onTutup }) => {
  const [tersalin, setTersalin] = useState(false);
  const [galatSalin, setGalatSalin] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (buka) {
      setTersalin(false);
      setGalatSalin(false);
    }
    return () => clearTimeout(timer.current);
  }, [buka, sandi]);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(sandi);
      setGalatSalin(false);
      setTersalin(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTersalin(false), 3000);
    } catch {
      // Izin papan klip ditolak atau konteks tidak aman: sandi tetap bisa disalin manual dari kotak.
      setGalatSalin(true);
    }
  };

  return (
    <Dialog open={buka} onClose={(_, alasan) => { if (alasan !== 'backdropClick' && alasan !== 'escapeKeyDown') onTutup(); }} maxWidth="sm" fullWidth aria-labelledby="judul-sandi-awal">
      <DialogContent>
        <Typography id="judul-sandi-awal" variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>{judul}</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {nama ? `${nama}${email ? ` (${email})` : ''}` : email}
        </Typography>

        {peringatan && <Alert severity="error" sx={{ mb: 2 }}>{peringatan}</Alert>}
        <Alert severity="warning" sx={{ mb: 2 }}>
          Sandi ini hanya tampil sekali. Salin dan berikan kepada guru. Guru wajib menggantinya saat masuk pertama.
        </Alert>

        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
            border: '1px dashed', borderColor: 'divider', borderRadius: 2, px: 2, py: 1.5, bgcolor: 'action.hover',
          }}
        >
          {/* user-select: all supaya satu klik memilih seluruh sandi bila tombol salin tidak berfungsi */}
          <Typography
            component="code"
            sx={{ fontFamily: 'monospace', fontSize: '1.25rem', letterSpacing: 1, userSelect: 'all', wordBreak: 'break-all' }}
          >
            {sandi}
          </Typography>
          <Tooltip title={tersalin ? 'Tersalin' : 'Salin sandi'}>
            <IconButton onClick={salin} aria-label="Salin sandi awal" color={tersalin ? 'success' : 'default'}>
              {tersalin ? <IconCheck size={20} /> : <IconCopy size={20} />}
            </IconButton>
          </Tooltip>
        </Box>
        {galatSalin && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            Salin otomatis tidak berhasil. Pilih sandi di atas lalu salin manual.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
        <Button variant="contained" onClick={onTutup} sx={{ backgroundColor: '#5E5CE6', '&:hover': { backgroundColor: '#4B49CF' } }}>
          Sudah disalin
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SandiAwalDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  nama: PropTypes.string,
  email: PropTypes.string,
  sandi: PropTypes.string,
  judul: PropTypes.string,
  peringatan: PropTypes.string,
  onTutup: PropTypes.func.isRequired,
};

export default SandiAwalDialog;
