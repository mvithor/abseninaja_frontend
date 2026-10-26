import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material';
import { pesanGalat } from '../api';
import { JENIS_PROYEK, TEKS_JENIS, periksaFormProyek } from './proyek';

/** Form tambah atau ubah proyek: nama dan jenis (individu atau kelompok). */
export default function ProyekFormDialog({
  buka, judul, awal, tombol, onSimpan, onTutup,
}) {
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState(JENIS_PROYEK.INDIVIDU);
  const [galat, setGalat] = useState('');
  const [sentuh, setSentuh] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (!buka) return;
    setNama(awal?.nama ?? '');
    setJenis(awal?.jenis ?? JENIS_PROYEK.INDIVIDU);
    setGalat('');
    setSentuh(false);
  }, [buka, awal]);

  const galatLokal = periksaFormProyek({ nama, jenis });

  const kirim = async () => {
    setSentuh(true);
    if (Object.keys(galatLokal).length > 0) return;
    setSibuk(true);
    setGalat('');
    try {
      await onSimpan({ nama: nama.trim(), jenis });
      onTutup();
    } catch (error) {
      setGalat(pesanGalat(error));
    } finally {
      setSibuk(false);
    }
  };

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
      <DialogTitle>{judul}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nama proyek"
            placeholder="mis. Poster ekosistem"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            error={sentuh && Boolean(galatLokal.nama)}
            helperText={sentuh && galatLokal.nama ? galatLokal.nama : 'Sebagaimana tertulis di blanko nilai, mis. nama Latihan Materi'}
            required
            fullWidth
          />
          <TextField
            select
            label="Jenis"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            helperText={jenis === JENIS_PROYEK.INDIVIDU
              ? 'Nilai 0 berarti tidak dikumpulkan dan menjadi dasar penanda "Proyek individu tidak dikumpulkan".'
              : 'Proyek kelompok tidak dipakai oleh penanda siswa.'}
            fullWidth
          >
            <MenuItem value={JENIS_PROYEK.INDIVIDU}>{TEKS_JENIS.INDIVIDU}</MenuItem>
            <MenuItem value={JENIS_PROYEK.KELOMPOK}>{TEKS_JENIS.KELOMPOK}</MenuItem>
          </TextField>
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onTutup} disabled={sibuk}>Batal</Button>
        <Button variant="contained" onClick={kirim} disabled={sibuk}>
          {sibuk ? 'Menyimpan...' : (tombol ?? 'Simpan')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProyekFormDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  judul: PropTypes.string.isRequired,
  awal: PropTypes.object,
  tombol: PropTypes.string,
  onSimpan: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};
