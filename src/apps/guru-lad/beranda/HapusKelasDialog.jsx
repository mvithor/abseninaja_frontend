import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { hapusKelas, pesanGalat } from '../api';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import {
  barisIsian, judulHapusKelas, kelasTidakDitemukan, namaCocok,
} from './hapusKelas';

/**
 * Dialog hapus kelas (desain "1b"). Dua langkah, sengaja:
 *  1. Saat dibuka, dialog memanggil DELETE tanpa konfirmasi. Server membalas 409 beserta `isian_terhapus` dan tidak
 *     menghapus apa pun, jadi guru melihat angka yang benar-benar akan hilang sebelum memutuskan.
 *  2. Tombol Hapus kelas baru aktif setelah nama kelas diketik, lalu DELETE diulang dengan konfirmasi.
 * `kelas` null = dialog tertutup. `onSelesai(kelas)` dipanggil setelah kelas terhapus; `onTidakAda(kelas)` bila server
 * tidak menemukan kelas itu (404), yang tidak boleh dibaca sebagai berhasil.
 */
export default function HapusKelasDialog({
  kelas, onTutup, onSelesai, onTidakAda,
}) {
  const w = warnaRingkasan(useTheme());
  const [isian, setIsian] = useState(null);
  const [memuat, setMemuat] = useState(false);
  const [galatMuat, setGalatMuat] = useState('');
  const [ketik, setKetik] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState('');
  const [percobaan, setPercobaan] = useState(0);

  const kelasId = kelas?.id ?? null;

  // Pratinjau isian. Bergantung pada id kelas dan penghitung percobaan; `kelas`, `onSelesai`, dan `onTidakAda` sengaja
  // tidak jadi dependensi supaya render ulang induk tidak mengirim ulang permintaan.
  useEffect(() => {
    if (kelasId === null) return undefined;
    let batal = false;
    setIsian(null);
    setGalatMuat('');
    setGalat('');
    setKetik('');
    setMemuat(true);
    hapusKelas(kelasId, false)
      .then(() => {
        // Server tidak pernah membalas 200 tanpa konfirmasi. Bila ini terjadi, kelas sudah terhapus: jangan pura-pura belum.
        if (!batal) onSelesai(kelas);
      })
      .catch((error) => {
        if (batal) return;
        const data = error?.response?.data;
        if (kelasTidakDitemukan(error)) onTidakAda(kelas);
        else if (error?.response?.status === 409 && data?.isian_terhapus) setIsian(data.isian_terhapus);
        else setGalatMuat(pesanGalat(error));
      })
      .finally(() => { if (!batal) setMemuat(false); });
    return () => { batal = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasId, percobaan]);

  if (!kelas) return null;

  const cocok = namaCocok(ketik, kelas.nama_kelas);
  const baris = isian ? barisIsian(isian) : [];

  const hapus = async () => {
    if (!cocok || sibuk) return;
    setSibuk(true);
    setGalat('');
    try {
      await hapusKelas(kelas.id, true);
      onSelesai(kelas);
    } catch (error) {
      if (kelasTidakDitemukan(error)) onTidakAda(kelas);
      else setGalat(pesanGalat(error));
    } finally {
      setSibuk(false);
    }
  };

  const tutup = () => { if (!sibuk) onTutup(); };

  return (
    <Dialog open onClose={tutup} maxWidth="sm" fullWidth aria-labelledby="judul-hapus-kelas">
      <DialogTitle id="judul-hapus-kelas">{judulHapusKelas(kelas)}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Menghapus kelas akan menghapus semua data yang sudah ada di dalamnya. Tindakan ini tidak bisa dibatalkan.
        </DialogContentText>

        {memuat && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }} role="status">
            <CircularProgress size={20} />
            <Typography sx={{ fontSize: 14, color: w.sekunder }}>Menghitung isi kelas ini</Typography>
          </Box>
        )}

        {galatMuat && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => setPercobaan((x) => x + 1)}>Coba lagi</Button>}
          >
            {`Isi kelas belum bisa dihitung: ${galatMuat}`}
          </Alert>
        )}

        {isian && (
          <>
            <Box
              component="section"
              aria-labelledby="judul-isian-terhapus"
              sx={{
                border: `1px solid ${w.garis}`, borderRadius: '8px', p: 2, mb: 2, bgcolor: w.kartu, boxShadow: 'none',
              }}
            >
              <Typography component="h3" id="judul-isian-terhapus" sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>
                Yang ikut terhapus dari kelas ini
              </Typography>
              {baris.length === 0 ? (
                <Typography sx={{ fontSize: 14 }}>Kelas ini masih kosong, tidak ada isian yang ikut terhapus.</Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {baris.map((b) => (
                    <Typography component="li" key={b.kunci} sx={{ fontSize: 15 }}>{b.teks}</Typography>
                  ))}
                </Box>
              )}
              <Typography sx={{ fontSize: 13, color: w.sekunder, mt: 1.5 }}>
                Riwayat aktivitas akun Anda tidak ikut terhapus.
              </Typography>
            </Box>

            <TextField
              autoFocus
              fullWidth
              label={`Ketik ${kelas.nama_kelas} untuk mengonfirmasi`}
              value={ketik}
              onChange={(e) => setKetik(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); hapus(); } }}
              disabled={sibuk}
              autoComplete="off"
              slotProps={{
                htmlInput: { 'aria-describedby': 'bantu-hapus-kelas' },
                formHelperText: { id: 'bantu-hapus-kelas', 'aria-live': 'polite' },
              }}
              helperText={cocok
                ? 'Nama cocok. Tombol Hapus kelas sekarang aktif.'
                : 'Tombol Hapus kelas aktif setelah nama kelas diketik dengan benar.'}
            />
          </>
        )}

        {galat && <Alert severity="error" sx={{ mt: 2 }}>{galat}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={tutup} disabled={sibuk}>Batal</Button>
        <Button color="error" variant="contained" onClick={hapus} disabled={!isian || !cocok || sibuk}>
          {sibuk ? 'Menghapus' : 'Hapus kelas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

HapusKelasDialog.propTypes = {
  kelas: PropTypes.shape({ id: PropTypes.number, nama_kelas: PropTypes.string, mapel: PropTypes.string }),
  onTutup: PropTypes.func.isRequired,
  onSelesai: PropTypes.func.isRequired,
  onTidakAda: PropTypes.func.isRequired,
};
