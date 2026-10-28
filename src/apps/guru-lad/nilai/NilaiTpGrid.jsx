import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography,
} from '@mui/material';
import { simpanNilaiTp, pesanGalat } from '../api';
import {
  bacaNilaiSel, tampilNilai, uraiTempel, terapkanTempel, hitungPengosongan,
} from './tempel';
import { legendaRentang, rentangNilai, RENTANG } from '../rentang';
import { judulLm, labelTp } from '../label';
import IkonRentang from '../komponen/IkonRentang';
import { gayaGrid } from './gayaGrid';
import { cariTpId, labelTpRingkas } from '../ringkasan/ringkasan';

const kunci = (siswaId, tpId) => `${siswaId}:${tpId}`;
const potongJudul = (teks) => (teks.length > 28 ? `${teks.slice(0, 27)}…` : teks);

export default function NilaiTpGrid({
  kelasId, kelas, siswa, lm, nilaiTp, readOnly, onTersimpan, sorot, onHapusSorot,
}) {
  const tpList = useMemo(
    () => lm.flatMap((m) => m.tp.map((t) => ({ ...t, lmId: m.id }))),
    [lm],
  );
  const server = useMemo(() => {
    const peta = new Map();
    nilaiTp.forEach((n) => peta.set(kunci(n.siswa_id, n.tp_id), n.nilai));
    return peta;
  }, [nilaiTp]);

  const [edit, setEdit] = useState({});
  const [galatServer, setGalatServer] = useState({});
  const [pesan, setPesan] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [konfirmasiKosong, setKonfirmasiKosong] = useState(0);
  const wadah = useRef(null);

  const jumlahKotor = Object.keys(edit).length;

  // Sorotan dari Ringkasan: satu kolom TP diberi penanda dan digulir ke tampilan. Tidak mengubah data atau isian.
  const tpSorot = sorot ? cariTpId(lm, sorot.lm, sorot.tp) : null;
  const labelSorot = sorot ? labelTpRingkas({ lm: sorot.lm, tp: sorot.tp, kode: tpList.find((t) => t.id === tpSorot)?.kode }) : '';
  useEffect(() => {
    if (tpSorot === null) return;
    const el = wadah.current?.querySelector(`th[data-tp="${tpSorot}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [tpSorot]);

  // Peringatan bila halaman ditutup saat masih ada isian belum tersimpan.
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
    if (data.length === 0 || (data.length === 1 && data[0].length === 1)) return; // satu nilai: biarkan bawaan
    e.preventDefault();
    const { perubahan, terpotong } = terapkanTempel({
      data, mulaiBaris: r, mulaiKolom: c, jumlahBaris: siswa.length, jumlahKolom: tpList.length,
    });
    setEdit((prev) => perubahan.reduce(
      (acc, p) => terapkanSel(acc, kunci(siswa[p.baris].id, tpList[p.kolom].id), p.teks),
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

  const ambang = useMemo(
    () => ({ ambang_bagian: kelas.ambang_bagian, kktp: kelas.kktp, ambang_pengayaan: kelas.ambang_pengayaan }),
    [kelas.ambang_bagian, kelas.kktp, kelas.ambang_pengayaan],
  );
  const legenda = useMemo(() => legendaRentang(ambang), [ambang]);

  // Mengosongkan nilai yang sudah tersimpan tidak bisa dibatalkan, jadi diminta konfirmasi dulu.
  const mintaSimpan = () => {
    const kosong = hitungPengosongan(edit, server);
    if (kosong > 0) setKonfirmasiKosong(kosong); else simpan();
  };

  const simpan = async () => {
    setKonfirmasiKosong(0);
    const sel = Object.entries(edit).map(([k, teks]) => {
      const [siswaId, tpId] = k.split(':').map(Number);
      return { siswa_id: siswaId, tp_id: tpId, nilai: bacaNilaiSel(teks).nilai };
    });
    setSibuk(true);
    setPesan(null);
    setGalatServer({});
    try {
      const { ringkasan } = await simpanNilaiTp(kelasId, sel);
      setEdit({});
      setPesan({
        jenis: 'success',
        teks: `Tersimpan: ${ringkasan.disimpan} sel diubah, ${ringkasan.dikosongkan} dikosongkan, ${ringkasan.tidak_berubah} tidak berubah.`,
      });
      onTersimpan();
    } catch (error) {
      const sudah = new Set((error.tersimpan ?? []).map((s) => kunci(s.siswa_id, s.tp_id)));
      if (sudah.size > 0) {
        setEdit((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !sudah.has(k))));
        onTersimpan();
      }
      const peta = {};
      (error.response?.data?.galat ?? []).forEach((g) => {
        const s = typeof g.indeks === 'number' ? error.potonganGagal?.[g.indeks] : null;
        if (s) peta[kunci(s.siswa_id, s.tp_id)] = g.pesan;
      });
      setGalatServer(peta);
      setPesan({ jenis: 'error', teks: pesanGalat(error, 'Nilai belum tersimpan. Coba lagi.') });
    } finally {
      setSibuk(false);
    }
  };

  const buang = () => { setEdit({}); setGalatServer({}); setPesan(null); };

  if (siswa.length === 0 || tpList.length === 0) {
    return (
      <Alert severity="info">
        {siswa.length === 0 ? 'Isi daftar siswa dulu di tab Siswa. ' : ''}
        {tpList.length === 0 ? 'Tambahkan lingkup materi dan TP dulu di tab Struktur.' : ''}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Ketik langsung, atau salin blok nilai dari Excel lalu tempel (Ctrl+V) di sel awal.
        Sel kosong berarti belum dinilai; <b>0</b> adalah nilai nol. Ikon di samping nilai menunjukkan rentang
        pencapaian menurut batas kelas ini.
      </Typography>
      <Stack
        direction="row"
        spacing={2.5}
        flexWrap="wrap"
        useFlexGap
        component="ul"
        aria-label="Keterangan ikon rentang nilai"
        sx={{ listStyle: 'none', m: 0, p: 0, rowGap: 0.5 }}
      >
        {legenda.map((l) => (
          <Stack key={l.rentang} component="li" direction="row" spacing={0.75} alignItems="center">
            <IkonRentang rentang={l.rentang} teksBaca={false} />
            <Typography variant="caption" color="text.secondary">
              <b>{l.batas}</b>
              {': '}
              {l.teks}
            </Typography>
          </Stack>
        ))}
      </Stack>
      {!readOnly && (
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" flexWrap="wrap" useFlexGap>
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
      )}

      {sorot && (
        <Alert
          severity="info"
          action={onHapusSorot && <Button color="inherit" onClick={onHapusSorot}>Hapus sorotan</Button>}
        >
          {tpSorot === null
            ? 'TP yang disorot dari Ringkasan tidak ditemukan lagi di struktur kelas ini.'
            : `Menyorot ${labelSorot} dari Ringkasan. Kolomnya diberi garis tebal.`}
        </Alert>
      )}
      {pesan && <Alert severity={pesan.jenis} onClose={() => setPesan(null)}>{pesan.teks}</Alert>}
      {adaGalatLokal && !pesan && (
        <Alert severity="warning">Ada sel dengan isian tidak sah (ditandai !). Perbaiki dulu sebelum menyimpan.</Alert>
      )}

      <Box ref={wadah} sx={gayaGrid} role="region" aria-label="Tabel nilai tujuan pembelajaran" tabIndex={-1}>
        <table>
          <thead>
            <tr>
              <th className="no" rowSpan={2}>No</th>
              <th className="nama" rowSpan={2}>Nama siswa</th>
              {lm.filter((m) => m.tp.length > 0).map((m) => (
                <th key={m.id} colSpan={m.tp.length} title={judulLm(m)}>{potongJudul(judulLm(m))}</th>
              ))}
            </tr>
            <tr>
              {tpList.map((t) => (
                <th key={t.id} data-tp={t.id} className={t.id === tpSorot ? 'sorot' : undefined} title={t.rumusan || undefined}>{labelTp(t)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siswa.map((s, r) => (
              <tr key={s.id}>
                <td className="no">{s.urutan}</td>
                <td className="nama" title={s.nama}>{s.nama}</td>
                {tpList.map((t, c) => {
                  const k = kunci(s.id, t.id);
                  const diEdit = k in edit;
                  const teks = diEdit ? edit[k] : tampilNilai(server.get(k));
                  const baca = bacaNilaiSel(teks);
                  const galat = (diEdit && baca.galat) || galatServer[k];
                  const efektif = galat ? null : baca.nilai;
                  const rentang = galat ? RENTANG.BELUM_DINILAI : rentangNilai(efektif, ambang);
                  let kelasSel = 'sel';
                  if (t.id === tpSorot) kelasSel += ' sorot';
                  if (galat) kelasSel += ' salah'; else if (diEdit) kelasSel += ' kotor';
                  return (
                    <td key={t.id} className={kelasSel} title={galat || (diEdit ? 'Belum disimpan' : undefined)}>
                      <div className="isi">
                        <input
                          value={teks}
                          data-r={r}
                          data-c={c}
                          inputMode="decimal"
                          readOnly={readOnly}
                          aria-label={`Nilai ${s.nama}, ${labelTp(t)}`}
                          aria-invalid={galat ? 'true' : undefined}
                          onChange={(e) => ubahSel(k, e.target.value)}
                          onPaste={(e) => !readOnly && tempel(e, r, c)}
                          onKeyDown={(e) => tombol(e, r, c)}
                        />
                        <span className="tanda">
                          {galat ? <span aria-hidden="true">!</span> : <IkonRentang rentang={rentang} />}
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

      <Dialog open={konfirmasiKosong > 0} onClose={() => setKonfirmasiKosong(0)} aria-labelledby="judul-kosongkan">
        <DialogTitle id="judul-kosongkan">Kosongkan nilai yang sudah tersimpan?</DialogTitle>
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
    </Stack>
  );
}

NilaiTpGrid.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  kelas: PropTypes.object.isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  nilaiTp: PropTypes.array.isRequired,
  readOnly: PropTypes.bool,
  onTersimpan: PropTypes.func.isRequired,
  sorot: PropTypes.shape({ lm: PropTypes.number, tp: PropTypes.number }),
  onHapusSorot: PropTypes.func,
};
