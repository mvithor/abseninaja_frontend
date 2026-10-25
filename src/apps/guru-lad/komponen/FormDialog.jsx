import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,
} from '@mui/material';
import { pesanGalat } from '../api';

/**
 * Dialog isian sederhana. `bidang`: [{ kunci, label, multiline?, wajib?, helper? }].
 * `onSimpan(nilai)` mengembalikan promise; error axios ditampilkan di dalam dialog.
 */
export default function FormDialog({
  buka, judul, bidang, awal, tombol, onSimpan, onTutup,
}) {
  const [nilai, setNilai] = useState({});
  const [galat, setGalat] = useState('');
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (buka) { setNilai(awal ?? {}); setGalat(''); }
  }, [buka, awal]);

  const kirim = async () => {
    setSibuk(true);
    setGalat('');
    try {
      await onSimpan(nilai);
      onTutup();
    } catch (error) {
      setGalat(pesanGalat(error));
    } finally {
      setSibuk(false);
    }
  };

  const lengkap = bidang.every((b) => !b.wajib || String(nilai[b.kunci] ?? '').trim() !== '');

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
      <DialogTitle>{judul}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {bidang.map((b) => (
            <TextField
              key={b.kunci}
              label={b.label}
              helperText={b.helper}
              value={nilai[b.kunci] ?? ''}
              onChange={(e) => setNilai((s) => ({ ...s, [b.kunci]: e.target.value }))}
              multiline={b.multiline}
              minRows={b.multiline ? 3 : undefined}
              required={b.wajib}
              fullWidth
            />
          ))}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onTutup} disabled={sibuk}>Batal</Button>
        <Button variant="contained" onClick={kirim} disabled={sibuk || !lengkap}>
          {sibuk ? 'Menyimpan...' : (tombol ?? 'Simpan')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FormDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  judul: PropTypes.string.isRequired,
  bidang: PropTypes.array.isRequired,
  awal: PropTypes.object,
  tombol: PropTypes.string,
  onSimpan: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};
