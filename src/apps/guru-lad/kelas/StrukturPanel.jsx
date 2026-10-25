import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Divider, IconButton, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  IconArrowDown, IconArrowUp, IconPencil, IconPlus, IconTrash,
} from '@tabler/icons-react';
import {
  tambahLm, ubahLm, hapusLm, urutLm, tambahTp, ubahTp, hapusTp, ubahKelas, pesanGalat,
} from '../api';
import FormDialog from '../komponen/FormDialog';
import HapusDialog from '../komponen/HapusDialog';

const tampil = (x) => String(x ?? '').replace('.', ',');

function ParameterKelas({ kelas, readOnly, onBerubah }) {
  const [f, setF] = useState({
    kktp: tampil(kelas.kktp), nilai: tampil(kelas.bobot_nilai_akhir), sas: tampil(kelas.bobot_sas),
  });
  const [pesan, setPesan] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const bersih = (t) => String(t).trim().replace(',', '.');

  const simpan = async () => {
    setSibuk(true);
    setPesan(null);
    try {
      await ubahKelas(kelas.id, {
        kktp: bersih(f.kktp), bobot_nilai_akhir: bersih(f.nilai), bobot_sas: bersih(f.sas),
      });
      setPesan({ jenis: 'success', teks: 'Parameter kelas disimpan.' });
      onBerubah();
    } catch (error) {
      setPesan({ jenis: 'error', teks: pesanGalat(error) });
    } finally {
      setSibuk(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Parameter kelas</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
        <TextField label="KKTP" value={f.kktp} onChange={ubah('kktp')} disabled={readOnly} size="small" helperText="Batas ketercapaian tujuan pembelajaran" />
        <TextField label="Bobot nilai akhir (%)" value={f.nilai} onChange={ubah('nilai')} disabled={readOnly} size="small" helperText="Bobot nilai akhir + SAS = 100" />
        <TextField label="Bobot SAS (%)" value={f.sas} onChange={ubah('sas')} disabled={readOnly} size="small" />
        {!readOnly && (
          <Button variant="outlined" onClick={simpan} disabled={sibuk} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {sibuk ? 'Menyimpan...' : 'Simpan parameter'}
          </Button>
        )}
      </Stack>
      {pesan && <Alert severity={pesan.jenis} sx={{ mt: 1 }}>{pesan.teks}</Alert>}
    </Box>
  );
}

ParameterKelas.propTypes = {
  kelas: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onBerubah: PropTypes.func.isRequired,
};

export default function StrukturPanel({
  kelas, lm, readOnly, onBerubah,
}) {
  const kelasId = kelas.id;
  // form: { jenis: 'lm-baru' | 'lm-ubah' | 'tp-baru' | 'tp-ubah', lm?, tp? }
  const [form, setForm] = useState(null);
  const [hapus, setHapus] = useState(null);
  const [galat, setGalat] = useState('');

  const geser = async (daftar, indeks, arah, panggil) => {
    const ids = daftar.map((x) => x.id);
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= ids.length) return;
    [ids[indeks], ids[tujuan]] = [ids[tujuan], ids[indeks]];
    setGalat('');
    try {
      await panggil(ids);
      onBerubah();
    } catch (error) {
      setGalat(pesanGalat(error));
    }
  };

  const bidangLm = [{ kunci: 'nama', label: 'Nama lingkup materi', wajib: true }];
  const bidangTp = [
    { kunci: 'kode', label: 'Kode TP', helper: 'Boleh kosong, mis. 1.1' },
    { kunci: 'rumusan', label: 'Rumusan tujuan pembelajaran', multiline: true },
  ];

  const simpanForm = async (n) => {
    if (form.jenis === 'lm-baru') await tambahLm(kelasId, n.nama);
    else if (form.jenis === 'lm-ubah') await ubahLm(kelasId, form.lm.id, { nama: n.nama });
    else if (form.jenis === 'tp-baru') await tambahTp(kelasId, form.lm.id, { kode: n.kode ?? '', rumusan: n.rumusan ?? '' });
    else await ubahTp(kelasId, form.tp.id, { kode: n.kode ?? '', rumusan: n.rumusan ?? '' });
    onBerubah();
  };

  const judulForm = {
    'lm-baru': 'Tambah lingkup materi', 'lm-ubah': 'Ubah lingkup materi', 'tp-baru': 'Tambah TP', 'tp-ubah': 'Ubah TP',
  }[form?.jenis] ?? '';
  const awalForm = form && {
    'lm-ubah': { nama: form.lm?.nama },
    'tp-ubah': { kode: form.tp?.kode ?? '', rumusan: form.tp?.rumusan ?? '' },
  }[form.jenis];

  return (
    <Stack spacing={3}>
      <ParameterKelas key={`${kelas.kktp}-${kelas.bobot_sas}`} kelas={kelas} readOnly={readOnly} onBerubah={onBerubah} />
      <Divider />
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>Lingkup materi dan tujuan pembelajaran</Typography>
          {!readOnly && (
            <Button startIcon={<IconPlus size={18} />} variant="contained" size="small" onClick={() => setForm({ jenis: 'lm-baru' })}>
              Tambah lingkup materi
            </Button>
          )}
        </Stack>
        {galat && <Alert severity="error" sx={{ mb: 1 }}>{galat}</Alert>}
        {lm.length === 0 && <Alert severity="info">Belum ada lingkup materi. Tambahkan dulu, lalu isi TP-nya.</Alert>}

        <Stack spacing={2}>
          {lm.map((m, i) => (
            <Paper key={m.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={700} sx={{ flexGrow: 1 }}>
                  LM {m.urutan}. {m.nama}
                </Typography>
                {!readOnly && (
                  <>
                    <Tooltip title="Naikkan"><span><IconButton size="small" aria-label={`Naikkan LM ${m.urutan}`} disabled={i === 0} onClick={() => geser(lm, i, -1, (ids) => urutLm(kelasId, ids))}><IconArrowUp size={18} /></IconButton></span></Tooltip>
                    <Tooltip title="Turunkan"><span><IconButton size="small" aria-label={`Turunkan LM ${m.urutan}`} disabled={i === lm.length - 1} onClick={() => geser(lm, i, 1, (ids) => urutLm(kelasId, ids))}><IconArrowDown size={18} /></IconButton></span></Tooltip>
                    <Tooltip title="Ubah"><IconButton size="small" aria-label={`Ubah LM ${m.urutan}`} onClick={() => setForm({ jenis: 'lm-ubah', lm: m })}><IconPencil size={18} /></IconButton></Tooltip>
                    <Tooltip title="Hapus"><IconButton size="small" aria-label={`Hapus LM ${m.urutan}`} onClick={() => setHapus({ jenis: 'lm', lm: m })}><IconTrash size={18} /></IconButton></Tooltip>
                  </>
                )}
              </Stack>

              <Box sx={{ mt: 1 }}>
                {m.tp.length === 0 && <Typography variant="body2" color="text.secondary">Belum ada TP.</Typography>}
                {m.tp.map((t) => (
                  <Stack key={t.id} direction="row" alignItems="flex-start" spacing={1} sx={{ py: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 64 }}>
                      {t.kode || `TP ${t.urutan}`}
                    </Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{t.rumusan || <i>tanpa rumusan</i>}</Typography>
                    {!readOnly && (
                      <>
                        <Tooltip title="Ubah"><IconButton size="small" aria-label={`Ubah TP ${t.kode || t.urutan}`} onClick={() => setForm({ jenis: 'tp-ubah', lm: m, tp: t })}><IconPencil size={16} /></IconButton></Tooltip>
                        <Tooltip title="Hapus"><IconButton size="small" aria-label={`Hapus TP ${t.kode || t.urutan}`} onClick={() => setHapus({ jenis: 'tp', lm: m, tp: t })}><IconTrash size={16} /></IconButton></Tooltip>
                      </>
                    )}
                  </Stack>
                ))}
                {!readOnly && (
                  <Button size="small" startIcon={<IconPlus size={16} />} sx={{ mt: 0.5 }} onClick={() => setForm({ jenis: 'tp-baru', lm: m })}>
                    Tambah TP
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>

      <FormDialog
        buka={Boolean(form)}
        judul={judulForm}
        bidang={form?.jenis?.startsWith('lm') ? bidangLm : bidangTp}
        awal={awalForm}
        onTutup={() => setForm(null)}
        onSimpan={simpanForm}
      />
      <HapusDialog
        buka={Boolean(hapus)}
        judul={hapus?.jenis === 'lm' ? 'Hapus lingkup materi' : 'Hapus TP'}
        uraian={hapus?.jenis === 'lm'
          ? `Hapus lingkup materi "${hapus?.lm?.nama}" beserta semua TP di dalamnya?`
          : `Hapus TP ${hapus?.tp?.kode || hapus?.tp?.urutan || ''}?`}
        onTutup={() => setHapus(null)}
        onHapus={async (konfirmasi) => {
          if (hapus.jenis === 'lm') await hapusLm(kelasId, hapus.lm.id, konfirmasi);
          else await hapusTp(kelasId, hapus.tp.id, konfirmasi);
          onBerubah();
        }}
      />
    </Stack>
  );
}

StrukturPanel.propTypes = {
  kelas: PropTypes.object.isRequired,
  lm: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
  onBerubah: PropTypes.func.isRequired,
};
