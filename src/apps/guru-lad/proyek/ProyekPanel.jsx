import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,
  Stack, Tooltip, Typography,
} from '@mui/material';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  simpanNilaiProyek, tambahProyek, ubahProyek, hapusProyek, pesanGalat,
} from '../api';
import {
  bacaNilaiSel, tampilNilai, uraiTempel, terapkanTempel, hitungPengosongan,
} from '../nilai/tempel';
import { gayaGrid } from '../nilai/gayaGrid';
import HapusDialog from '../komponen/HapusDialog';
import ProyekFormDialog from './ProyekFormDialog';
import {
  labelProyek, TEKS_JENIS, tidakDikumpulkan, hitungJenis,
} from './proyek';

const kunci = (siswaId, proyekId) => `${siswaId}:${proyekId}`;

export default function ProyekPanel({
  kelasId, siswa, proyek, nilaiProyek, readOnly, onBerubah,
}) {
  const server = useMemo(() => {
    const peta = new Map();
    nilaiProyek.forEach((n) => peta.set(kunci(n.siswa_id, n.proyek_id), n.nilai));
    return peta;
  }, [nilaiProyek]);

  const [edit, setEdit] = useState({});
  const [galatServer, setGalatServer] = useState({});
  const [pesan, setPesan] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [konfirmasiKosong, setKonfirmasiKosong] = useState(0);
  const [form, setForm] = useState(null); // { baru: true } | { proyek }
  const [hapus, setHapus] = useState(null);
  const wadah = useRef(null);

  const jumlahKotor = Object.keys(edit).length;
  const jenisProyek = useMemo(() => hitungJenis(proyek), [proyek]);

  useEffect(() => {
    if (jumlahKotor === 0) return undefined;
    const tahan = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', tahan);
    return () => window.removeEventListener('beforeunload', tahan);
  }, [jumlahKotor]);

  const terapkanSel = (prev, k, teks) => {
    const dasar = server.get(k) ?? null;
    const baca = bacaNilaiSel(teks);
    const sama = !baca.galat && baca.nilai === dasar;
    const lanjut = { ...prev };
    if (sama) delete lanjut[k]; else lanjut[k] = teks;
    return lanjut;
  };

  const ubahSel = (k, teks) => {
    setEdit((prev) => terapkanSel(prev, k, teks));
    setGalatServer((prev) => {
      if (!(k in prev)) return prev;
      const lanjut = { ...prev };
      delete lanjut[k];
      return lanjut;
    });
  };

  const fokus = (baris, kolom) => {
    const el = wadah.current?.querySelector(`input[data-r="${baris}"][data-c="${kolom}"]`);
    if (el) { el.focus(); el.select(); }
  };

  const tempel = (e, r, c) => {
    const data = uraiTempel(e.clipboardData.getData('text'));
    if (data.length === 0 || (data.length === 1 && data[0].length === 1)) return;
    e.preventDefault();
    const { perubahan, terpotong } = terapkanTempel({
      data, mulaiBaris: r, mulaiKolom: c, jumlahBaris: siswa.length, jumlahKolom: proyek.length,
    });
    setEdit((prev) => perubahan.reduce(
      (acc, p) => terapkanSel(acc, kunci(siswa[p.baris].id, proyek[p.kolom].id), p.teks),
      prev,
    ));
    setGalatServer({});
    setPesan(terpotong > 0
      ? { jenis: 'warning', teks: `${perubahan.length} sel ditempel. ${terpotong} sel di luar tabel diabaikan.` }
      : { jenis: 'info', teks: `${perubahan.length} sel ditempel. Periksa lalu klik Simpan.` });
  };

  const tombol = (e, r, c) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); fokus(r + (e.shiftKey ? -1 : 1), c); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); fokus(r - 1, c); }
  };

  const adaGalatLokal = Object.values(edit).some((t) => bacaNilaiSel(t).galat);

  const mintaSimpan = () => {
    const kosong = hitungPengosongan(edit, server);
    if (kosong > 0) setKonfirmasiKosong(kosong); else simpan();
  };

  const simpan = async () => {
    setKonfirmasiKosong(0);
    const sel = Object.entries(edit).map(([k, teks]) => {
      const [siswaId, proyekId] = k.split(':').map(Number);
      return { siswa_id: siswaId, proyek_id: proyekId, nilai: bacaNilaiSel(teks).nilai };
    });
    setSibuk(true);
    setPesan(null);
    setGalatServer({});
    try {
      const { ringkasan } = await simpanNilaiProyek(kelasId, sel);
      setEdit({});
      setPesan({
        jenis: 'success',
        teks: `Tersimpan: ${ringkasan.disimpan} sel diubah, ${ringkasan.dikosongkan} dikosongkan, ${ringkasan.tidak_berubah} tidak berubah.`,
      });
      onBerubah();
    } catch (error) {
      const sudah = new Set((error.tersimpan ?? []).map((s) => kunci(s.siswa_id, s.proyek_id)));
      if (sudah.size > 0) {
        setEdit((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !sudah.has(k))));
        onBerubah();
      }
      const peta = {};
      (error.response?.data?.galat ?? []).forEach((g) => {
        const s = typeof g.indeks === 'number' ? error.potonganGagal?.[g.indeks] : null;
        if (s) peta[kunci(s.siswa_id, s.proyek_id)] = g.pesan;
      });
      setGalatServer(peta);
      setPesan({ jenis: 'error', teks: pesanGalat(error, 'Nilai belum tersimpan. Coba lagi.') });
    } finally {
      setSibuk(false);
    }
  };

  const buang = () => { setEdit({}); setGalatServer({}); setPesan(null); };

  const simpanForm = async (n) => {
    if (form.proyek) await ubahProyek(kelasId, form.proyek.id, n);
    else await tambahProyek(kelasId, n);
    onBerubah();
  };

  const dialogForm = !readOnly && (
    <ProyekFormDialog
      buka={Boolean(form)}
      judul={form?.proyek ? 'Ubah proyek' : 'Tambah proyek'}
      awal={form?.proyek ? { nama: form.proyek.nama, jenis: form.proyek.jenis } : undefined}
      onSimpan={simpanForm}
      onTutup={() => setForm(null)}
    />
  );
  const dialogHapus = !readOnly && (
    <HapusDialog
      buka={Boolean(hapus)}
      judul="Hapus proyek"
      uraian={`Hapus proyek "${hapus ? labelProyek(hapus) : ''}"?`}
      onTutup={() => setHapus(null)}
      onHapus={async (konfirmasi) => {
        await hapusProyek(kelasId, hapus.id, konfirmasi);
        onBerubah();
      }}
    />
  );

  if (siswa.length === 0 || proyek.length === 0) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="info" sx={{ alignSelf: 'stretch' }}>
          {siswa.length === 0 ? 'Isi daftar siswa dulu di tab Siswa. ' : ''}
          {proyek.length === 0
            ? (readOnly ? 'Kelas ini belum memiliki proyek.' : 'Belum ada proyek. Tambahkan proyek (Latihan Materi) untuk mulai mengisi nilainya.')
            : ''}
        </Alert>
        {!readOnly && (
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setForm({ baru: true })}>
            Tambah proyek
          </Button>
        )}
        {dialogForm}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Nilai proyek (Latihan Materi): {jenisProyek.individu} individu, {jenisProyek.kelompok} kelompok.
        Sel kosong berarti belum dinilai. Pada proyek <b>individu</b>, nilai <b>0</b> berarti tidak dikumpulkan dan
        menjadi dasar penanda &quot;Proyek individu tidak dikumpulkan&quot;. Proyek kelompok tidak dipakai penanda.
      </Typography>
      {!readOnly && (
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<IconPlus size={18} />} onClick={() => setForm({ baru: true })}>
            Tambah proyek
          </Button>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" aria-live="polite" sx={{ whiteSpace: 'nowrap' }}>
              {jumlahKotor > 0 ? `${jumlahKotor} sel belum disimpan` : 'Semua tersimpan'}
            </Typography>
            <Button variant="outlined" onClick={buang} disabled={jumlahKotor === 0 || sibuk} sx={{ whiteSpace: 'nowrap' }}>
              Batalkan
            </Button>
            <Button variant="contained" onClick={mintaSimpan} disabled={jumlahKotor === 0 || adaGalatLokal || sibuk} sx={{ whiteSpace: 'nowrap' }}>
              {sibuk ? 'Menyimpan...' : 'Simpan nilai'}
            </Button>
          </Stack>
        </Stack>
      )}

      {pesan && <Alert severity={pesan.jenis} onClose={() => setPesan(null)}>{pesan.teks}</Alert>}
      {adaGalatLokal && !pesan && (
        <Alert severity="warning">Ada sel dengan isian tidak sah (ditandai !). Perbaiki dulu sebelum menyimpan.</Alert>
      )}

      <Box ref={wadah} sx={gayaGrid} role="region" aria-label="Tabel nilai proyek" tabIndex={-1}>
        <table>
          <thead>
            <tr>
              <th className="no">No</th>
              <th className="nama">Nama siswa</th>
              {proyek.map((p) => (
                <th key={p.id} style={{ minWidth: 120, height: 'auto', padding: '4px 6px' }}>
                  <Stack alignItems="center" spacing={0.25}>
                    <span title={labelProyek(p)}>{labelProyek(p).length > 22 ? `${labelProyek(p).slice(0, 21)}…` : labelProyek(p)}</span>
                    <Chip size="small" variant="outlined" label={TEKS_JENIS[p.jenis] ?? p.jenis} />
                    {!readOnly && (
                      <Stack direction="row">
                        <Tooltip title="Ubah"><IconButton size="small" aria-label={`Ubah proyek ${labelProyek(p)}`} onClick={() => setForm({ proyek: p })}><IconPencil size={16} /></IconButton></Tooltip>
                        <Tooltip title="Hapus"><IconButton size="small" aria-label={`Hapus proyek ${labelProyek(p)}`} onClick={() => setHapus(p)}><IconTrash size={16} /></IconButton></Tooltip>
                      </Stack>
                    )}
                  </Stack>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siswa.map((s, r) => (
              <tr key={s.id}>
                <td className="no">{s.urutan}</td>
                <td className="nama" title={s.nama}>{s.nama}</td>
                {proyek.map((p, c) => {
                  const k = kunci(s.id, p.id);
                  const diEdit = k in edit;
                  const teks = diEdit ? edit[k] : tampilNilai(server.get(k));
                  const baca = bacaNilaiSel(teks);
                  const galat = (diEdit && baca.galat) || galatServer[k];
                  const nol = !galat && tidakDikumpulkan(p.jenis, baca.nilai);
                  let kelasSel = 'sel';
                  if (galat) kelasSel += ' salah'; else if (diEdit) kelasSel += ' kotor';
                  let judulSel;
                  if (galat) judulSel = galat; else if (diEdit) judulSel = 'Belum disimpan'; else if (nol) judulSel = 'Tidak dikumpulkan (nilai 0)';
                  return (
                    <td key={p.id} className={kelasSel} title={judulSel}>
                      <div className="isi">
                        <input
                          value={teks}
                          data-r={r}
                          data-c={c}
                          inputMode="decimal"
                          readOnly={readOnly}
                          aria-label={`Nilai ${s.nama}, ${labelProyek(p)}${nol ? ' (tidak dikumpulkan)' : ''}`}
                          aria-invalid={galat ? 'true' : undefined}
                          onChange={(e) => ubahSel(k, e.target.value)}
                          onPaste={(e) => !readOnly && tempel(e, r, c)}
                          onKeyDown={(e) => tombol(e, r, c)}
                        />
                        <span className="tanda">
                          {galat && <span aria-hidden="true">!</span>}
                          {!galat && nol && <span aria-hidden="true" title="Tidak dikumpulkan">⊘</span>}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Dialog open={konfirmasiKosong > 0} onClose={() => setKonfirmasiKosong(0)} aria-labelledby="judul-kosongkan-proyek">
        <DialogTitle id="judul-kosongkan-proyek">Kosongkan nilai yang sudah tersimpan?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {konfirmasiKosong} nilai yang sudah tersimpan akan dikosongkan (menjadi belum dinilai). Nilai yang
            dikosongkan tidak bisa dikembalikan dari sini. Lanjutkan?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKonfirmasiKosong(0)} autoFocus>Kembali</Button>
          <Button onClick={simpan} color="error" variant="contained">Kosongkan dan simpan</Button>
        </DialogActions>
      </Dialog>
      {dialogForm}
      {dialogHapus}
    </Stack>
  );
}

ProyekPanel.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  siswa: PropTypes.array.isRequired,
  proyek: PropTypes.array.isRequired,
  nilaiProyek: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
  onBerubah: PropTypes.func.isRequired,
};
