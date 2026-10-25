import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, Stack, TextField,
} from '@mui/material';
import { buatKelas, pesanGalat } from '../api';

const normal = (t) => String(t ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// Tahun ajaran berjalan: Juli ke atas dihitung tahun ajaran yang baru mulai.
function tahunAjaranSekarang() {
  const sekarang = new Date();
  const awal = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1;
  return `${awal}/${awal + 1}`;
}

const KOSONG = () => ({
  nama_kelas: '', mapel: '', semester: 'Ganjil', tahun_ajaran: tahunAjaranSekarang(),
  salin: '', atur: false, kktp: '75', bobot_nilai_akhir: '75', bobot_sas: '25',
});

export default function BuatKelasDialog({
  buka, kelasAda, onTutup, onSukses,
}) {
  const [f, setF] = useState(KOSONG);
  const [galat, setGalat] = useState('');
  const ubah = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  // Struktur hanya dapat disalin dari kelas NYATA dengan mapel yang sama (aturan server).
  const sumber = useMemo(
    () => kelasAda.filter((k) => k.jenis === 'NYATA' && normal(k.mapel) === normal(f.mapel)),
    [kelasAda, f.mapel],
  );

  const simpan = useMutation({
    mutationFn: (badan) => buatKelas(badan),
    onSuccess: (hasil) => { setF(KOSONG()); setGalat(''); onSukses(hasil); },
    onError: (error) => setGalat(pesanGalat(error)),
  });

  const kirim = () => {
    setGalat('');
    const badan = {
      nama_kelas: f.nama_kelas,
      mapel: f.mapel,
      semester: f.semester,
      tahun_ajaran: f.tahun_ajaran,
    };
    if (f.salin) badan.salin_struktur_dari = Number(f.salin);
    if (f.atur) {
      badan.kktp = String(f.kktp).replace(',', '.');
      badan.bobot_nilai_akhir = String(f.bobot_nilai_akhir).replace(',', '.');
      badan.bobot_sas = String(f.bobot_sas).replace(',', '.');
    }
    simpan.mutate(badan);
  };

  const tutup = () => { if (!simpan.isPending) { setGalat(''); onTutup(); } };

  return (
    <Dialog open={buka} onClose={tutup} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah Kelas</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nama kelas" placeholder="mis. 8A" value={f.nama_kelas} onChange={ubah('nama_kelas')} required fullWidth />
          <TextField label="Mata pelajaran" placeholder="mis. Matematika" value={f.mapel} onChange={ubah('mapel')} required fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Semester" value={f.semester} onChange={ubah('semester')} fullWidth>
              <MenuItem value="Ganjil">Ganjil</MenuItem>
              <MenuItem value="Genap">Genap</MenuItem>
            </TextField>
            <TextField label="Tahun ajaran" placeholder="2026/2027" value={f.tahun_ajaran} onChange={ubah('tahun_ajaran')} fullWidth />
          </Stack>

          {sumber.length > 0 && (
            <TextField
              select
              label="Salin struktur dari kelas lain (opsional)"
              helperText="Menyalin lingkup materi, TP, dan proyek. Nilai dan siswa tidak ikut disalin."
              value={f.salin}
              onChange={ubah('salin')}
              fullWidth
            >
              <MenuItem value="">Tidak, mulai dari kosong</MenuItem>
              {sumber.map((k) => (
                <MenuItem key={k.id} value={String(k.id)}>
                  {k.nama_kelas} · {k.mapel} · {k.semester} {k.tahun_ajaran}
                </MenuItem>
              ))}
            </TextField>
          )}

          <FormControlLabel
            control={<Checkbox checked={f.atur} onChange={(e) => setF((s) => ({ ...s, atur: e.target.checked }))} />}
            label="Atur KKTP dan bobot sendiri (bawaan: KKTP 75, nilai akhir 75, SAS 25)"
          />
          {f.atur && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="KKTP" value={f.kktp} onChange={ubah('kktp')} fullWidth />
              <TextField label="Bobot nilai akhir" value={f.bobot_nilai_akhir} onChange={ubah('bobot_nilai_akhir')} fullWidth />
              <TextField label="Bobot SAS" value={f.bobot_sas} onChange={ubah('bobot_sas')} fullWidth />
            </Stack>
          )}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={tutup} disabled={simpan.isPending}>Batal</Button>
        <Button
          variant="contained"
          onClick={kirim}
          disabled={simpan.isPending || !f.nama_kelas.trim() || !f.mapel.trim()}
        >
          {simpan.isPending ? 'Menyimpan...' : 'Buat Kelas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BuatKelasDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  kelasAda: PropTypes.array.isRequired,
  onTutup: PropTypes.func.isRequired,
  onSukses: PropTypes.func.isRequired,
};
