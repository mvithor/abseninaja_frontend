import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack, Typography, MenuItem,
} from '@mui/material';
import KolomIsian from 'src/apps/guru-lad/komponen/KolomIsian';
import {
  ALASAN_NONAKTIF, BATAS_CATATAN, adaYangPerluPengganti, bangunPayloadNonaktif, peringatanTanggungJawab, validasiNonaktif,
} from './status';

/**
 * Dialog Nonaktifkan pegawai: alasan (dropdown), catatan, dan peringatan tanggung jawab yang masih dipegang
 * (peringatan tidak memblokir). Dipakai admin sekolah dan super admin (guru mandiri); pemanggil menyuplai
 * `tanggungJawab` (null bila tidak dimuat), `memuatTanggungJawab`, dan `onKonfirmasi(payload)`.
 *
 * Isian dikosongkan setiap dialog dibuka untuk pegawai lain, supaya alasan pegawai sebelumnya tidak terbawa.
 */
const DialogNonaktif = ({ buka, nama, tanggungJawab, memuatTanggungJawab, galatTanggungJawab, sibuk, onKonfirmasi, onTutup }) => {
  const [alasanKode, setAlasanKode] = useState('');
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (buka) {
      setAlasanKode('');
      setCatatan('');
      setGalat('');
    }
  }, [buka, nama]);

  const peringatan = peringatanTanggungJawab(tanggungJawab);
  const perluPengganti = adaYangPerluPengganti(tanggungJawab);

  const kirim = () => {
    const pesan = validasiNonaktif({ alasanKode, catatan });
    if (pesan) {
      setGalat(pesan);
      return;
    }
    setGalat('');
    onKonfirmasi(bangunPayloadNonaktif({ alasanKode, catatan }));
  };

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" align="center" sx={{ mt: 2, mb: 1 }}>
          Nonaktifkan {nama || 'pegawai'}?
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          Akun langsung keluar dari semua perangkat dan tidak bisa masuk lagi. Riwayat tetap tersimpan, dan akun dapat
          diaktifkan kembali.
        </Typography>

        <Stack spacing={2}>
          {memuatTanggungJawab && (
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">Memeriksa tanggung jawab yang masih dipegang...</Typography>
            </Stack>
          )}
          {galatTanggungJawab && !memuatTanggungJawab && (
            <Alert severity="info">Tanggung jawab yang masih dipegang belum bisa diperiksa. Nonaktifkan tetap bisa dilanjutkan.</Alert>
          )}
          {peringatan.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Masih memegang:</Typography>
              <Stack component="ul" spacing={0.25} sx={{ m: 0, pl: 2.5 }}>
                {peringatan.map((teks) => <li key={teks}>{teks}</li>)}
              </Stack>
              {perluPengganti && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tugas ini tidak dipindahkan otomatis. Setelah dinonaktifkan, tugas muncul di daftar &quot;Perlu pengganti&quot;
                  sampai diganti.
                </Typography>
              )}
            </Alert>
          )}

          <KolomIsian
            id="alasan-nonaktif"
            label="Alasan"
            pilih
            wajib
            value={alasanKode}
            onChange={(e) => setAlasanKode(e.target.value)}
            disabled={sibuk}
          >
            <MenuItem value="" disabled>Pilih alasan</MenuItem>
            {ALASAN_NONAKTIF.map((a) => <MenuItem key={a.kode} value={a.kode}>{a.label}</MenuItem>)}
          </KolomIsian>
          <KolomIsian
            id="catatan-nonaktif"
            label="Catatan"
            wajib={alasanKode === 'LAINNYA'}
            multiline
            minRows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            inputProps={{ maxLength: BATAS_CATATAN }}
            bantuan={`Opsional, maksimal ${BATAS_CATATAN} karakter.`}
            disabled={sibuk}
          />
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
        <Button sx={{ mr: 3 }} variant="outlined" color="secondary" onClick={onTutup} disabled={sibuk}>
          Batal
        </Button>
        <Button
          sx={{ mr: 3, backgroundColor: '#F48C06', '&:hover': { backgroundColor: '#f7a944' } }}
          variant="contained"
          onClick={kirim}
          disabled={sibuk}
        >
          {sibuk ? <CircularProgress size={24} /> : 'Nonaktifkan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogNonaktif.propTypes = {
  buka: PropTypes.bool.isRequired,
  nama: PropTypes.string,
  tanggungJawab: PropTypes.object,
  memuatTanggungJawab: PropTypes.bool,
  galatTanggungJawab: PropTypes.bool,
  sibuk: PropTypes.bool,
  onKonfirmasi: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default DialogNonaktif;
