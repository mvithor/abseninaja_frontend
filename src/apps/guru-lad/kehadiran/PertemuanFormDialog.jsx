import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack,
} from '@mui/material';
import { pesanGalat } from '../api';
import KolomIsian from '../komponen/KolomIsian';
import { namaZona, periksaTanggalPertemuan, tanggalPanjang } from './kehadiran';
import AlertOtomatis from 'src/components/alerts/AlertOtomatis';

/**
 * Form tambah atau ubah pertemuan: tanggal dan (opsional) lingkup materi. `hariIni` adalah tanggal hari ini
 * MENURUT SEKOLAH dari server, dipakai sebagai tanggal bawaan dan batas atas; jam peramban tidak dipakai.
 */
export default function PertemuanFormDialog({
  buka, judul, awal, hariIni, zona, pertemuan, kecualiId, lm, onSimpan, onTutup,
}) {
  const [tanggal, setTanggal] = useState('');
  const [lmId, setLmId] = useState('');
  const [galat, setGalat] = useState('');
  const [sentuh, setSentuh] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (!buka) return;
    setTanggal(awal?.tanggal ?? hariIni ?? '');
    setLmId(awal?.lingkup_materi_id ?? '');
    setGalat('');
    setSentuh(false);
  }, [buka, awal, hariIni]);

  const hasil = periksaTanggalPertemuan(tanggal, hariIni, pertemuan, kecualiId);

  const kirim = async () => {
    setSentuh(true);
    if (hasil.galat) return;
    setSibuk(true);
    setGalat('');
    try {
      await onSimpan({ tanggal, lingkup_materi_id: lmId === '' ? null : lmId });
      onTutup();
    } catch (error) {
      setGalat(pesanGalat(error));
    } finally {
      setSibuk(false);
    }
  };

  let bantuan = hariIni
    ? `Hari ini menurut zona waktu sekolah: ${tanggalPanjang(hariIni)} (${namaZona(zona)}).`
    : '';
  if (hasil.peringatan) bantuan = hasil.peringatan;
  const tampilGalat = Boolean(hasil.galat) && (sentuh || tanggal !== '');
  const peringatanSaja = Boolean(hasil.peringatan) && !hasil.galat;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
      <DialogTitle>{judul}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <KolomIsian
            id="pertemuan-tanggal"
            tipe="date"
            label="Tanggal pertemuan"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            inputProps={{ max: hariIni || undefined }}
            galat={tampilGalat ? hasil.galat : undefined}
            bantuan={peringatanSaja
              ? <Box component="span" sx={{ color: 'warning.dark' }}>{bantuan}</Box>
              : bantuan}
            wajib
          />
          <KolomIsian
            id="pertemuan-lingkup-materi"
            pilih
            label="Lingkup materi (opsional)"
            value={lmId}
            onChange={(e) => setLmId(e.target.value)}
            bantuan="Menautkan pertemuan ke lingkup materi yang diajarkan pada hari itu."
          >
            <MenuItem value="">Tanpa tautan</MenuItem>
            {lm.map((m) => <MenuItem key={m.id} value={m.id}>{`LM ${m.urutan}: ${m.nama}`}</MenuItem>)}
          </KolomIsian>
          {galat && <AlertOtomatis severity="error" onTutup={() => setGalat('')}>{galat}</AlertOtomatis>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onTutup} disabled={sibuk}>Batal</Button>
        <Button variant="contained" onClick={kirim} disabled={sibuk}>
          {sibuk ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PertemuanFormDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  judul: PropTypes.string.isRequired,
  awal: PropTypes.object,
  hariIni: PropTypes.string,
  zona: PropTypes.string,
  pertemuan: PropTypes.array.isRequired,
  kecualiId: PropTypes.number,
  lm: PropTypes.array.isRequired,
  onSimpan: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};
