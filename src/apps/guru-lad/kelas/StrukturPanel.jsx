import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconArrowDown, IconArrowUp, IconPencil, IconPlus, IconTrash,
} from '@tabler/icons-react';
import {
  tambahLm, ubahLm, hapusLm, urutLm, tambahTp, ubahTp, hapusTp, ubahKelas, pesanGalat,
} from '../api';
import FormDialog from '../komponen/FormDialog';
import HapusDialog from '../komponen/HapusDialog';
import JudulTab from '../komponen/JudulTab';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { galatPerKolom } from '../galat';
import { BAWAAN_AMBANG, periksaAmbang, tampilAngka } from '../rentang';
import { judulLm, labelTp } from '../label';

const tampil = (x) => String(x ?? '').replace('.', ',');

function ParameterKelas({ kelas, readOnly, onBerubah }) {
  const w = warnaRingkasan(useTheme());
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
      error={Boolean(galatAmbang(kunci))}
      helperText={galatAmbang(kunci) ?? bantu}
      inputProps={{ inputMode: 'decimal' }}
      sx={{ flex: { sm: '1 1 220px' }, minWidth: { sm: 220 } }}
    />
  );

  return (
    <Box sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ borderRadius: 0 }}>
        <Typography component="h3" sx={{ fontSize: '1.1875rem', fontWeight: 700, lineHeight: '1.75rem', color: w.ink }}>Parameter kelas</Typography>
        <Typography sx={{ fontSize: '1rem', lineHeight: '1.5rem', color: w.sekunder, mt: 0.5, maxWidth: '75ch' }}>
          {readOnly
            ? 'Batas nilai TP kelas ini. Nilai tepat di batas masuk ke rentang di atasnya.'
            : 'Batas nilai TP untuk kelas ini. Nilai tepat di batas masuk ke rentang di atasnya. Mengubah batas mengubah ikon di tabel nilai dan hasil peringatan kelas ini.'}
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
        {bidangAmbang('ambang_bagian', 'Remedial bagian tertentu mulai dari', 'Di bawah ini: remedial seluruh bagian')}
        {bidangAmbang('kktp', 'Sudah mencapai (KKTP) mulai dari', 'Di bawah ini: belum mencapai')}
        {bidangAmbang('ambang_pengayaan', 'Perlu pengayaan mulai dari', 'Di atas ini: pengayaan')}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
        <TextField label="Bobot nilai akhir (%)" value={f.nilai} onChange={ubah('nilai')} disabled={readOnly} helperText="Bobot nilai akhir + SAS = 100" sx={{ flex: { sm: '0 1 240px' } }} />
        <TextField label="Bobot SAS (%)" value={f.sas} onChange={ubah('sas')} disabled={readOnly} sx={{ flex: { sm: '0 1 240px' } }} />
      </Stack>
      {!readOnly && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Button variant="contained" onClick={simpan} disabled={sibuk || adaGalat} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {sibuk ? 'Menyimpan...' : 'Simpan parameter'}
          </Button>
          <Button variant="outlined" onClick={usulanAwal} disabled={sibuk} sx={{ whiteSpace: 'normal', textAlign: 'left' }}>
            Kembalikan ke usulan awal ({tampilAngka(BAWAAN_AMBANG.ambang_bagian)}, {tampilAngka(BAWAAN_AMBANG.kktp)}, {tampilAngka(BAWAAN_AMBANG.ambang_pengayaan)})
          </Button>
        </Stack>
      )}
      {pesan && <Alert severity={pesan.jenis}>{pesan.teks}</Alert>}
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
  const w = warnaRingkasan(useTheme());
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
      <JudulTab
        judul="Struktur kelas"
        keterangan="Batas nilai, lingkup materi, dan tujuan pembelajaran (TP) kelas ini. Nilai dan penanda dihitung dari struktur ini."
      />
      <ParameterKelas key={`${kelas.ambang_bagian}-${kelas.kktp}-${kelas.ambang_pengayaan}-${kelas.bobot_sas}`} kelas={kelas} readOnly={readOnly} onBerubah={onBerubah} />

      <Box sx={{ ...gayaKartu(w), p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
          <Typography component="h3" sx={{ fontSize: '1.1875rem', fontWeight: 700, lineHeight: '1.75rem', color: w.ink }}>Lingkup materi dan tujuan pembelajaran</Typography>
          {!readOnly && (
            <Button startIcon={<IconPlus size={20} />} variant="contained" onClick={() => setForm({ jenis: 'lm-baru' })}>
              Tambah lingkup materi
            </Button>
          )}
        </Stack>
        {galat && <Alert severity="error">{galat}</Alert>}
        {lm.length === 0 && <Alert severity="info">Belum ada lingkup materi. Tambahkan dulu, lalu isi TP-nya.</Alert>}

        <Stack spacing={2.5}>
          {lm.map((m, i) => (
            <Box key={m.id} sx={{ border: `1px solid ${w.garis}`, borderRadius: '8px', overflow: 'hidden', boxShadow: 'none' }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ bgcolor: w.latar, borderBottom: `1px solid ${w.ink}`, borderRadius: 0, px: { xs: 1.5, md: 2 }, py: 0.75, minHeight: 56 }}
              >
                <Typography sx={{ flexGrow: 1, fontSize: '1.0625rem', fontWeight: 700, lineHeight: '1.5rem', color: w.ink }}>
                  {judulLm(m)}
                </Typography>
                {!readOnly && (
                  <>
                    <Tooltip title="Naikkan"><span><IconButton size="small" aria-label={`Naikkan LM ${m.urutan}`} disabled={i === 0} onClick={() => geser(lm, i, -1, (ids) => urutLm(kelasId, ids))}><IconArrowUp size={20} /></IconButton></span></Tooltip>
                    <Tooltip title="Turunkan"><span><IconButton size="small" aria-label={`Turunkan LM ${m.urutan}`} disabled={i === lm.length - 1} onClick={() => geser(lm, i, 1, (ids) => urutLm(kelasId, ids))}><IconArrowDown size={20} /></IconButton></span></Tooltip>
                    <Tooltip title="Ubah"><IconButton size="small" aria-label={`Ubah LM ${m.urutan}`} onClick={() => setForm({ jenis: 'lm-ubah', lm: m })}><IconPencil size={20} /></IconButton></Tooltip>
                    <Tooltip title="Hapus"><IconButton size="small" aria-label={`Hapus LM ${m.urutan}`} onClick={() => setHapus({ jenis: 'lm', lm: m })}><IconTrash size={20} /></IconButton></Tooltip>
                  </>
                )}
              </Stack>

              <Box sx={{ borderRadius: 0 }}>
                {m.tp.length === 0 && (
                  <Typography sx={{ fontSize: '1rem', color: w.sekunder, px: { xs: 1.5, md: 2 }, py: 1.5 }}>Belum ada TP.</Typography>
                )}
                {m.tp.map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '80px minmax(0, 1fr) auto' },
                      columnGap: { xs: 1, md: 2 },
                      alignItems: 'start',
                      px: { xs: 1.5, md: 2 },
                      py: 1.25,
                      borderBottom: `1px solid ${w.garisLembut}`,
                      borderRadius: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: '1.5rem', pt: { xs: 0.5, md: 0.25 }, color: w.ink }}>
                      {labelTp(t)}
                    </Typography>
                    {!readOnly && (
                      <Box sx={{ display: 'flex', borderRadius: 0, gridColumn: { xs: 2, md: 3 }, gridRow: 1 }}>
                        <Tooltip title="Ubah"><IconButton size="small" aria-label={`Ubah TP ${t.kode || t.urutan}`} onClick={() => setForm({ jenis: 'tp-ubah', lm: m, tp: t })}><IconPencil size={18} /></IconButton></Tooltip>
                        <Tooltip title="Hapus"><IconButton size="small" aria-label={`Hapus TP ${t.kode || t.urutan}`} onClick={() => setHapus({ jenis: 'tp', lm: m, tp: t })}><IconTrash size={18} /></IconButton></Tooltip>
                      </Box>
                    )}
                    {/* Di ponsel rumusan turun ke baris sendiri selebar kartu; di layar lebar duduk di kolom tengah. */}
                    <Typography
                      sx={{
                        gridColumn: { xs: '1 / -1', md: 2 },
                        gridRow: { xs: 2, md: 1 },
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                        color: w.ink,
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        pt: { md: 0.25 },
                      }}
                    >
                      {t.rumusan || (readOnly ? null : <i>tanpa rumusan</i>)}
                    </Typography>
                  </Box>
                ))}
                {!readOnly && (
                  <Box sx={{ px: { xs: 1, md: 1.5 }, py: 1, borderRadius: 0 }}>
                    <Button startIcon={<IconPlus size={18} />} onClick={() => setForm({ jenis: 'tp-baru', lm: m })}>
                      Tambah TP
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
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
