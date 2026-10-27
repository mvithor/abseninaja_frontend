import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography, useMediaQuery,
} from '@mui/material';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { pesanGalat, pratinjauImpor, simpanImpor } from '../api';
import KartuBerkasImpor from './KartuBerkasImpor';
import {
  butirBaru, isiDariLaporan, periksaPilihan, susunMeta, tahunAjaranSekarang, tandaPermintaan,
} from './impor';

const BERSAMA_AWAL = () => ({ semester: '', tahun_ajaran: tahunAjaranSekarang(), mapel: '' });

/**
 * Impor blanko nilai semester. Satu berkas Excel = satu kelas baru; berkas tidak pernah menimpa kelas yang ada.
 * Alur: pilih berkas, periksa (server membaca dan melaporkan, tanpa menyimpan), lalu simpan. Simpan hanya
 * dapat dilakukan bila pemeriksaan terakhir bersih dan tidak ada isian yang berubah sesudahnya.
 */
export default function ImporBlankoDialog({ buka, onTutup, onSukses }) {
  const layarKecil = useMediaQuery((tema) => tema.breakpoints.down('sm'));
  const [butir, setButir] = useState([]);
  const [bersama, setBersama] = useState(BERSAMA_AWAL);
  const [laporan, setLaporan] = useState(null); // daftar laporan per berkas dari server
  const [dapatDisimpan, setDapatDisimpan] = useState(false);
  const [tandaPeriksa, setTandaPeriksa] = useState(null);
  const [ditolak, setDitolak] = useState([]);
  const [galat, setGalat] = useState('');
  const nomor = useRef(0);
  const inputBerkas = useRef(null);

  const tandaSekarang = butir.length > 0 ? tandaPermintaan(butir, bersama) : null;
  const sudahDiperiksa = laporan !== null && tandaPeriksa === tandaSekarang;
  const basi = laporan !== null && !sudahDiperiksa;

  const bersihkanHasil = () => { setLaporan(null); setDapatDisimpan(false); setTandaPeriksa(null); setGalat(''); };
  const atur = (k) => (e) => setBersama((s) => ({ ...s, [k]: e.target.value }));

  const terimaLaporan = (data, tanda, dariButir) => {
    setLaporan(data.berkas);
    setDapatDisimpan(Boolean(data.dapat_disimpan));
    setButir(isiDariLaporan(dariButir, data.berkas));
    // Tanda dihitung dari butir SESUDAH diisi dari laporan, supaya pengisian awal tidak dianggap perubahan guru.
    setTandaPeriksa(tanda);
  };

  const periksa = useMutation({
    mutationFn: ({ daftar, meta }) => pratinjauImpor(daftar.map((b) => b.file), meta),
    onSuccess: (data, { daftar }) => {
      const sesudah = isiDariLaporan(daftar, data.berkas);
      terimaLaporan(data, tandaPermintaan(sesudah, bersama), daftar);
      setGalat('');
    },
    onError: (error) => { bersihkanHasil(); setGalat(pesanGalat(error)); },
  });

  const simpan = useMutation({
    mutationFn: ({ daftar, meta }) => simpanImpor(daftar.map((b) => b.file), meta),
    onSuccess: (hasil) => { kosongkan(); onSukses(hasil); },
    onError: (error, { daftar }) => {
      const data = error.response?.data;
      if (Array.isArray(data?.berkas)) {
        // Server menolak seluruh impor dan melaporkan sebabnya per berkas: tampilkan di kartu masing-masing.
        const sesudah = isiDariLaporan(daftar, data.berkas);
        terimaLaporan({ berkas: data.berkas, dapat_disimpan: false }, tandaPermintaan(sesudah, bersama), daftar);
      }
      setGalat(pesanGalat(error));
    },
  });

  const sibuk = periksa.isPending || simpan.isPending;

  function kosongkan() {
    setButir([]); setBersama(BERSAMA_AWAL()); setLaporan(null); setDapatDisimpan(false);
    setTandaPeriksa(null); setDitolak([]); setGalat('');
  }

  const pilih = (e) => {
    const { diterima, ditolak: tolak } = periksaPilihan(e.target.files, butir.map((b) => b.file));
    e.target.value = ''; // supaya berkas yang sama dapat dipilih lagi setelah diperbaiki di Excel
    setDitolak(tolak);
    if (diterima.length === 0) return;
    setButir((b) => [...b, ...diterima.map((f) => { nomor.current += 1; return butirBaru(f, nomor.current); })]);
    bersihkanHasil();
  };

  const ubahButir = (id, perubahan) => setButir((b) => b.map((x) => (x.id === id ? { ...x, ...perubahan } : x)));
  const hapusButir = (id) => { setButir((b) => b.filter((x) => x.id !== id)); bersihkanHasil(); };

  const kirim = (mutasi) => () => {
    setGalat('');
    mutasi.mutate({ daftar: butir, meta: susunMeta(butir, bersama) });
  };

  const tutup = () => { if (!sibuk) { kosongkan(); onTutup(); } };
  const bolehSimpan = sudahDiperiksa && dapatDisimpan && !sibuk;

  return (
    <Dialog open={buka} onClose={tutup} maxWidth="md" fullWidth fullScreen={layarKecil}>
      <DialogTitle>Impor dari Blanko Nilai</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Satu berkas Excel (.xlsx) menjadi satu kelas baru lengkap dengan lingkup materi, TP, proyek, daftar siswa, dan
            nilai yang sudah terisi. Berkas tidak pernah menimpa kelas yang sudah ada. Kolom jumlah, rata-rata, dan nilai
            rapor di blanko diabaikan karena dihitung sendiri oleh aplikasi. Bila ada satu saja sel yang salah, tidak ada
            kelas yang dibuat.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Semester"
              value={bersama.semester}
              onChange={atur('semester')}
              disabled={sibuk}
              helperText="Berlaku untuk semua berkas"
              fullWidth
            >
              <MenuItem value="">Pilih semester</MenuItem>
              <MenuItem value="Ganjil">Ganjil</MenuItem>
              <MenuItem value="Genap">Genap</MenuItem>
            </TextField>
            <TextField
              label="Tahun ajaran"
              placeholder="2026/2027"
              value={bersama.tahun_ajaran}
              onChange={atur('tahun_ajaran')}
              disabled={sibuk}
              fullWidth
            />
            <TextField
              label="Mata pelajaran"
              placeholder="mis. Bahasa Arab"
              value={bersama.mapel}
              onChange={atur('mapel')}
              disabled={sibuk}
              helperText="Blanko biasanya tidak mengisinya"
              fullWidth
            />
          </Stack>

          <input
            ref={inputBerkas}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            hidden
            onChange={pilih}
          />
          <Button
            variant="outlined"
            startIcon={<IconFileSpreadsheet size={18} />}
            onClick={() => inputBerkas.current?.click()}
            disabled={sibuk}
            sx={{ alignSelf: 'flex-start' }}
          >
            {butir.length === 0 ? 'Pilih berkas blanko' : 'Tambah berkas'}
          </Button>

          {ditolak.length > 0 && (
            <Alert severity="warning" onClose={() => setDitolak([])}>
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {ditolak.map((x, i) => <li key={`${x.nama}-${i}`}>{x.nama}: {x.alasan}</li>)}
              </Stack>
            </Alert>
          )}

          {butir.map((b, i) => (
            <KartuBerkasImpor
              key={b.id}
              butir={b}
              laporan={laporan ? laporan[i] : null}
              placeholderMapel={bersama.mapel}
              terkunci={sibuk}
              onUbah={(p) => ubahButir(b.id, p)}
              onHapus={() => hapusButir(b.id)}
            />
          ))}

          {basi && (
            <Alert severity="info">Ada isian yang berubah sesudah pemeriksaan terakhir. Periksa ulang sebelum menyimpan.</Alert>
          )}
          {sudahDiperiksa && dapatDisimpan && (
            <Alert severity="success">
              Semua berkas lolos pemeriksaan. Simpan akan membuat {butir.length} kelas baru.
            </Alert>
          )}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, pb: 2, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
        <Button onClick={tutup} disabled={sibuk}>Batal</Button>
        <Button variant="outlined" onClick={kirim(periksa)} disabled={sibuk || butir.length === 0}>
          {periksa.isPending ? 'Memeriksa...' : (laporan ? 'Periksa ulang' : 'Periksa berkas')}
        </Button>
        <Button variant="contained" onClick={kirim(simpan)} disabled={!bolehSimpan}>
          {simpan.isPending ? 'Menyimpan...' : 'Simpan semua kelas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ImporBlankoDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  onTutup: PropTypes.func.isRequired,
  onSukses: PropTypes.func.isRequired,
};
