import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import { pesanGalat } from '../api';

const NAMA_ISIAN = {
  nilai_tp: 'nilai TP',
  nilai_proyek: 'nilai proyek',
  remedial: 'nilai remedial',
  kehadiran: 'catatan kehadiran',
  pertemuan: 'pertemuan',
};

const ringkasIsian = (isian) => Object.entries(isian)
  .filter(([, n]) => n > 0)
  .map(([k, n]) => `${n} ${NAMA_ISIAN[k] ?? k.replace(/_/g, ' ')}`)
  .join(', ');

/**
 * Dialog hapus dua tahap. Tahap 1 mencoba menghapus tanpa konfirmasi; bila server membalas 409 beserta
 * isian yang akan ikut hilang, tahap 2 menampilkannya dan meminta persetujuan eksplisit.
 * `onHapus(konfirmasi)` harus mengembalikan promise dan melempar error axios apa adanya.
 */
export default function HapusDialog({
  buka, judul, uraian, onTutup, onHapus,
}) {
  const [isian, setIsian] = useState(null);
  const [galat, setGalat] = useState('');
  const [sibuk, setSibuk] = useState(false);

  const tutup = () => { setIsian(null); setGalat(''); onTutup(); };

  const jalankan = async (konfirmasi) => {
    setSibuk(true);
    setGalat('');
    try {
      await onHapus(konfirmasi);
      tutup();
    } catch (error) {
      const data = error?.response?.data;
      if (error?.response?.status === 409 && data?.isian_terhapus) setIsian(data.isian_terhapus);
      else setGalat(pesanGalat(error));
    } finally {
      setSibuk(false);
    }
  };

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : tutup} maxWidth="xs" fullWidth>
      <DialogTitle>{judul}</DialogTitle>
      <DialogContent>
        {uraian && <DialogContentText sx={{ mb: isian ? 2 : 0 }}>{uraian}</DialogContentText>}
        {isian && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Penghapusan ini juga menghapus isian yang sudah ada: {ringkasIsian(isian)}.
            Tindakan ini tidak dapat dibatalkan.
          </Alert>
        )}
        {galat && <Alert severity="error" sx={{ mt: 1 }}>{galat}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={tutup} disabled={sibuk}>Batal</Button>
        <Button color="error" variant="contained" disabled={sibuk} onClick={() => jalankan(Boolean(isian))}>
          {isian ? 'Hapus beserta isiannya' : 'Hapus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

HapusDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  judul: PropTypes.string.isRequired,
  uraian: PropTypes.string,
  onTutup: PropTypes.func.isRequired,
  onHapus: PropTypes.func.isRequired,
};
