import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { buatKelas, pesanGalat } from '../api';
import { galatPerKolom } from '../galat';
import { BAWAAN_AMBANG, periksaAmbang, tampilAngka } from '../rentang';

const normal = (t) => String(t ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// Tahun ajaran berjalan: Juli ke atas dihitung tahun ajaran yang baru mulai.
function tahunAjaranSekarang() {
  const sekarang = new Date();
  const awal = sekarang.getMonth() >= 6 ? sekarang.getFullYear() : sekarang.getFullYear() - 1;
  return `${awal}/${awal + 1}`;
}

const KOSONG = () => ({
  nama_kelas: '', mapel: '', semester: 'Ganjil', tahun_ajaran: tahunAjaranSekarang(),
  salin: '', atur: false,
  ambang_bagian: tampilAngka(BAWAAN_AMBANG.ambang_bagian),
  kktp: tampilAngka(BAWAAN_AMBANG.kktp),
  ambang_pengayaan: tampilAngka(BAWAAN_AMBANG.ambang_pengayaan),
  bobot_nilai_akhir: '75', bobot_sas: '25',
});

export default function BuatKelasDialog({
  buka, kelasAda, onTutup, onSukses,
}) {
  const [f, setF] = useState(KOSONG);
  const [galat, setGalat] = useState('');
  const [galatServer, setGalatServer] = useState({});
  const ubah = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setGalatServer((g) => { if (!(k in g)) return g; const l = { ...g }; delete l[k]; return l; });
  };

  // Struktur hanya dapat disalin dari kelas NYATA dengan mapel yang sama (aturan server).
  const sumber = useMemo(
    () => kelasAda.filter((k) => k.jenis === 'NYATA' && normal(k.mapel) === normal(f.mapel)),
    [kelasAda, f.mapel],
  );

  const kelasSumber = sumber.find((k) => String(k.id) === f.salin) ?? null;
  const galatLokal = f.atur ? periksaAmbang(f) : {};
  const galatAmbang = (k) => galatLokal[k] ?? galatServer[k];

  // Saat "atur sendiri" dinyalakan, isian dimulai dari kelas sumber salinan bila ada (angka yang
  // memang akan terpakai), kalau tidak dari usulan awal.
  const aturSendiri = (aktif) => setF((s) => {
    if (!aktif) return { ...s, atur: false };
    const dasar = kelasSumber && kelasSumber.ambang_bagian !== undefined ? kelasSumber : BAWAAN_AMBANG;
    return {
      ...s,
      atur: true,
      ambang_bagian: tampilAngka(dasar.ambang_bagian),
      kktp: tampilAngka(dasar.kktp),
      ambang_pengayaan: tampilAngka(dasar.ambang_pengayaan),
    };
  });

  const simpan = useMutation({
    mutationFn: (badan) => buatKelas(badan),
    onSuccess: (hasil) => { setF(KOSONG()); setGalat(''); setGalatServer({}); onSukses(hasil); },
    onError: (error) => {
      setGalatServer(galatPerKolom(error.response?.data));
      setGalat(pesanGalat(error));
    },
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
      badan.ambang_bagian = String(f.ambang_bagian).trim().replace(',', '.');
      badan.kktp = String(f.kktp).trim().replace(',', '.');
      badan.ambang_pengayaan = String(f.ambang_pengayaan).trim().replace(',', '.');
      badan.bobot_nilai_akhir = String(f.bobot_nilai_akhir).replace(',', '.');
      badan.bobot_sas = String(f.bobot_sas).replace(',', '.');
    }
    simpan.mutate(badan);
  };

  const tutup = () => { if (!simpan.isPending) { setGalat(''); setGalatServer({}); onTutup(); } };

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
              helperText="Menyalin lingkup materi, TP, proyek, serta batas nilai dan bobot kelas sumber. Nilai dan siswa tidak ikut disalin."
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
            control={<Checkbox checked={f.atur} onChange={(e) => aturSendiri(e.target.checked)} />}
            label="Atur batas nilai (KKTP) dan bobot sendiri"
          />
          {!f.atur && (
            <Typography variant="body2" color="text.secondary">
              {kelasSumber
                ? 'Batas nilai dan bobot disalin dari kelas sumber.'
                : `Memakai usulan awal: remedial bagian tertentu mulai dari ${tampilAngka(BAWAAN_AMBANG.ambang_bagian)}, sudah mencapai (KKTP) mulai dari ${tampilAngka(BAWAAN_AMBANG.kktp)}, perlu pengayaan mulai dari ${tampilAngka(BAWAAN_AMBANG.ambang_pengayaan)}; bobot nilai akhir 75 dan SAS 25. Ini usulan dari template guru; ubah sesuai KKTP sekolah Anda.`}
            </Typography>
          )}
          {f.atur && (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Remedial bagian tertentu mulai dari"
                  value={f.ambang_bagian}
                  onChange={ubah('ambang_bagian')}
                  error={Boolean(galatAmbang('ambang_bagian'))}
                  helperText={galatAmbang('ambang_bagian') ?? 'Di bawah ini: remedial seluruh bagian'}
                  fullWidth
                />
                <TextField
                  label="Sudah mencapai (KKTP) mulai dari"
                  value={f.kktp}
                  onChange={ubah('kktp')}
                  error={Boolean(galatAmbang('kktp'))}
                  helperText={galatAmbang('kktp') ?? 'Di bawah ini: belum mencapai'}
                  fullWidth
                />
                <TextField
                  label="Perlu pengayaan mulai dari"
                  value={f.ambang_pengayaan}
                  onChange={ubah('ambang_pengayaan')}
                  error={Boolean(galatAmbang('ambang_pengayaan'))}
                  helperText={galatAmbang('ambang_pengayaan') ?? 'Di atas ini: pengayaan'}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Bobot nilai akhir (%)" value={f.bobot_nilai_akhir} onChange={ubah('bobot_nilai_akhir')} fullWidth />
                <TextField label="Bobot SAS (%)" value={f.bobot_sas} onChange={ubah('bobot_sas')} fullWidth />
              </Stack>
            </>
          )}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={tutup} disabled={simpan.isPending}>Batal</Button>
        <Button
          variant="contained"
          onClick={kirim}
          disabled={simpan.isPending || !f.nama_kelas.trim() || !f.mapel.trim() || Object.keys(galatLokal).length > 0}
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
