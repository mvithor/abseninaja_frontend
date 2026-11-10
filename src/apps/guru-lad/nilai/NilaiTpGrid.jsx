import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { simpanNilaiTp, pesanGalat } from '../api';
import {
  bacaNilaiSel, tampilNilai, uraiTempel, terapkanTempel, hitungPengosongan,
} from './tempel';
import { rentangNilai, RENTANG } from '../rentang';
import { judulLm, labelTp } from '../label';
import IkonRentang from '../komponen/IkonRentang';
import JudulTab from '../komponen/JudulTab';
import PetunjukTab from '../komponen/PetunjukTab';
import BilahSimpan from '../komponen/BilahSimpan';
import { gayaKartu, warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { gayaGrid } from './gayaGrid';
import { cariTpId, labelTpRingkas, legendaSebaran } from '../ringkasan/ringkasan';
import AlertOtomatis from 'src/components/alerts/AlertOtomatis';
import { KEPASTIAN, kepastianSimpan, pesanSimpanGagal } from '../kepastian';

const kunci = (siswaId, tpId) => `${siswaId}:${tpId}`;
const potongJudul = (teks) => (teks.length > 28 ? `${teks.slice(0, 27)}…` : teks);

export default function NilaiTpGrid({
  kelasId, kelas, siswa, lm, nilaiTp, readOnly, onTersimpan, sorot, onHapusSorot,
}) {
  const tpList = useMemo(
    () => lm.flatMap((m) => m.tp.map((t) => ({ ...t, lmId: m.id }))),
    [lm],
  );
  // TP pertama tiap lingkup materi: diberi garis tegak tebal di kirinya.
  const awalLm = useMemo(() => new Set(tpList.filter((t, i) => i === 0 || tpList[i - 1].lmId !== t.lmId).map((t) => t.id)), [tpList]);
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
  const w = warnaRingkasan(useTheme());

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
  const legenda = useMemo(() => legendaSebaran(ambang), [ambang]);

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
      setPesan(pesanSimpanGagal(error, { teksPasti: pesanGalat(error, 'Nilai belum tersimpan. Coba lagi.'), objek: 'nilai' }));
      // Belum pasti tersimpan: muat ulang dari server supaya tampilan mengikuti yang sebenarnya tersimpan.
      if (sudah.size === 0 && kepastianSimpan(error) === KEPASTIAN.TIDAK_PASTI) onTersimpan();
    } finally {
      setSibuk(false);
    }
  };

  const buang = () => { setEdit({}); setGalatServer({}); setPesan(null); };

  if (siswa.length === 0 || tpList.length === 0) {
    return (
      <Alert severity="info">
        {siswa.length === 0 ? 'Isi daftar murid dulu di tab Murid. ' : ''}
        {tpList.length === 0 ? 'Tambahkan lingkup materi dan TP dulu di tab Struktur.' : ''}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <JudulTab
        judul="Nilai tujuan pembelajaran"
        keterangan="Isi nilai tiap murid per TP. Perubahan baru tersimpan setelah tombol Simpan nilai ditekan."
      />
      <PetunjukTab
        butir={[
          'Ketik langsung, atau salin blok nilai dari Excel lalu tempel (Ctrl+V) di sel awal.',
          <>Sel kosong berarti belum dinilai; <b>0</b> adalah nilai nol.</>,
          'Ikon di samping nilai menunjukkan rentang pencapaian menurut batas kelas ini.',
        ]}
      />
      <Box component="section" role="group" aria-label="Keterangan ikon rentang nilai" sx={{ ...gayaKartu(w), px: 3, py: 2.5 }}>
        <Box
          component="ul"
          aria-label="Keterangan ikon"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: '10px 28px', borderRadius: 0 }}
        >
          {legenda.map((l) => (
            <Box key={l.rentang} component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 0, fontSize: 14 }}>
              <IkonRentang rentang={l.rentang} teksBaca={false} ukuran={22} />
              <span>
                {l.nama}
                {l.batas && <Box component="small" sx={{ fontSize: 13, color: w.sekunder }}>{` ${l.batas}`}</Box>}
              </span>
            </Box>
          ))}
        </Box>
      </Box>
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
      {pesan && <AlertOtomatis severity={pesan.jenis} pemicu={pesan} tombolTutup onTutup={() => setPesan(null)}>{pesan.teks}</AlertOtomatis>}
      {adaGalatLokal && !pesan && (
        <Alert severity="warning">Ada sel dengan isian tidak sah (ditandai !). Perbaiki dulu sebelum menyimpan.</Alert>
      )}

      <Box ref={wadah} sx={gayaGrid} role="region" aria-label="Tabel nilai tujuan pembelajaran" tabIndex={-1}>
        <table>
          <thead>
            <tr>
              <th className="no" rowSpan={2}>No</th>
              <th className="nama" rowSpan={2}>Nama murid</th>
              {lm.filter((m) => m.tp.length > 0).map((m, i) => (
                <th key={m.id} colSpan={m.tp.length} className={i > 0 ? 'awal-lm' : undefined} title={judulLm(m)}>{potongJudul(judulLm(m))}</th>
              ))}
            </tr>
            <tr>
              {tpList.map((t) => (
                <th key={t.id} data-tp={t.id} className={[t.id === tpSorot && 'sorot', awalLm.has(t.id) && 'awal-lm'].filter(Boolean).join(' ') || undefined} title={t.rumusan || undefined}>{labelTp(t)}</th>
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
                  let kelasSel = awalLm.has(t.id) ? 'sel awal-lm' : 'sel';
                  if (t.id === tpSorot) kelasSel += ' sorot';
                  if (galat) kelasSel += ' salah'; else if (diEdit) kelasSel += ' kotor';
                  return (
                    <td key={t.id} className={kelasSel} title={galat || (diEdit ? 'Belum disimpan' : undefined)}>
                      <div className="isi">
                        <span className="tanda">
                          {galat ? <span aria-hidden="true">!</span> : <IkonRentang rentang={rentang} />}
                        </span>
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
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {!readOnly && (
        <BilahSimpan
          jumlahKotor={jumlahKotor}
          sibuk={sibuk}
          adaGalat={adaGalatLokal}
          onBuang={buang}
          onSimpan={mintaSimpan}
          labelSimpan="Simpan nilai"
        />
      )}

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
