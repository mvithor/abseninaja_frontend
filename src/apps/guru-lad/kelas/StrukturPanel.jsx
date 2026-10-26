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
import { galatPerKolom } from '../galat';
import { BAWAAN_AMBANG, periksaAmbang, tampilAngka } from '../rentang';
import { judulLm, labelTp } from '../label';

const tampil = (x) => String(x ?? '').replace('.', ',');

function ParameterKelas({ kelas, readOnly, onBerubah }) {
  const [f, setF] = useState({
    ambang_bagian: tampil(kelas.ambang_bagian),
    kktp: tampil(kelas.kktp),
    ambang_pengayaan: tampil(kelas.ambang_pengayaan),
    nilai: tampil(kelas.bobot_nilai_akhir),
    sas: tampil(kelas.bobot_sas),
  });
  const [pesan, setPesan] = useState(null);
  const [galatServer, setGalatServer] = useState({});
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setGalatServer((g) => { if (!(k in g)) return g; const l = { ...g }; delete l[k]; return l; });
  };
  const bersih = (t) => String(t).trim().replace(',', '.');
  const galatLokal = periksaAmbang(f);
  const galatAmbang = (k) => galatLokal[k] ?? galatServer[k];
  const adaGalat = Object.keys(galatLokal).length > 0;

  const usulanAwal = () => {
    setF((s) => ({
      ...s,
      ambang_bagian: tampilAngka(BAWAAN_AMBANG.ambang_bagian),
      kktp: tampilAngka(BAWAAN_AMBANG.kktp),
      ambang_pengayaan: tampilAngka(BAWAAN_AMBANG.ambang_pengayaan),
    }));
    setGalatServer({});
  };

  const simpan = async () => {
    setSibuk(true);
    setPesan(null);
    setGalatServer({});
    try {
      await ubahKelas(kelas.id, {
        ambang_bagian: bersih(f.ambang_bagian),
        kktp: bersih(f.kktp),
        ambang_pengayaan: bersih(f.ambang_pengayaan),
        bobot_nilai_akhir: bersih(f.nilai),
        bobot_sas: bersih(f.sas),
      });
      setPesan({ jenis: 'success', teks: 'Parameter kelas disimpan.' });
      onBerubah();
    } catch (error) {
      setGalatServer(galatPerKolom(error.response?.data));
      setPesan({ jenis: 'error', teks: pesanGalat(error) });
    } finally {
      setSibuk(false);
    }
  };

  const bidangAmbang = (kunci, label, bantu) => (
    <TextField
      label={label}
      value={f[kunci]}
      onChange={ubah(kunci)}
      disabled={readOnly}
      size="small"
      error={Boolean(galatAmbang(kunci))}
      helperText={galatAmbang(kunci) ?? bantu}
      inputProps={{ inputMode: 'decimal' }}
      sx={{ minWidth: 190 }}
    />
  );

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Parameter kelas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Batas nilai TP untuk kelas ini. Nilai tepat di batas masuk ke rentang di atasnya. Mengubah batas
        mengubah ikon di tabel nilai dan hasil peringatan kelas ini.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
        {bidangAmbang('ambang_bagian', 'Remedial bagian tertentu mulai dari', 'Di bawah ini: remedial seluruh bagian')}
        {bidangAmbang('kktp', 'Sudah mencapai (KKTP) mulai dari', 'Di bawah ini: belum mencapai')}
        {bidangAmbang('ambang_pengayaan', 'Perlu pengayaan mulai dari', 'Di atas ini: pengayaan')}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} sx={{ mt: 2 }}>
        <TextField label="Bobot nilai akhir (%)" value={f.nilai} onChange={ubah('nilai')} disabled={readOnly} size="small" helperText="Bobot nilai akhir + SAS = 100" />
        <TextField label="Bobot SAS (%)" value={f.sas} onChange={ubah('sas')} disabled={readOnly} size="small" />
        {!readOnly && (
          <>
            <Button variant="outlined" onClick={simpan} disabled={sibuk || adaGalat} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {sibuk ? 'Menyimpan...' : 'Simpan parameter'}
            </Button>
            <Button variant="text" onClick={usulanAwal} disabled={sibuk} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              Kembalikan ke usulan awal ({tampilAngka(BAWAAN_AMBANG.ambang_bagian)}, {tampilAngka(BAWAAN_AMBANG.kktp)}, {tampilAngka(BAWAAN_AMBANG.ambang_pengayaan)})
            </Button>
          </>
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
      <ParameterKelas key={`${kelas.ambang_bagian}-${kelas.kktp}-${kelas.ambang_pengayaan}-${kelas.bobot_sas}`} kelas={kelas} readOnly={readOnly} onBerubah={onBerubah} />
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
                  {judulLm(m)}
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
                      {labelTp(t)}
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
