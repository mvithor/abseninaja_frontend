import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,
  Stack, Tooltip, Typography,
} from '@mui/material';
import {
  IconChecks, IconPencil, IconPlus, IconSortAscending, IconTrash,
} from '@tabler/icons-react';
import {
  simpanKehadiranBanyak, tambahPertemuan, ubahPertemuan, hapusPertemuan, urutPertemuan, pesanGalat,
} from '../api';
import { uraiTempel, terapkanTempel } from '../nilai/tempel';
import { gayaGrid } from '../nilai/gayaGrid';
import HapusDialog from '../komponen/HapusDialog';
import JudulTab from '../komponen/JudulTab';
import PetunjukTab from '../komponen/PetunjukTab';
import BilahSimpan from '../komponen/BilahSimpan';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import PertemuanFormDialog from './PertemuanFormDialog';
import {
  KODE_HADIR, TEKS_KODE, bacaKodeSel, kunciSel, petaKehadiran, kodeEfektif, rekapSiswa, rekapPertemuan,
  selUntukSemuaHadir, terapkanIsian, hitungPengosonganKode, susunMuatanSimpan, tanggalPanjang, tanggalPendek,
  namaZona, idKronologis, perluUrutKronologis, labelLm,
} from './kehadiran';

// Tambahan gaya khusus tab ini di atas gayaGrid: sel satu huruf dan kolom rekap.
const gayaKehadiran = [
  gayaGrid,
  (theme) => {
    const w = warnaRingkasan(theme);
    return {
      '& .sel': { minWidth: 112 },
      '& .sel input': { width: 52, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase' },
      '& .sel.alpa input': { color: theme.palette.error.main },
      '& .rekap': { minWidth: 48, textAlign: 'center', color: w.sekunder },
      '& .rekap.alpa': { color: theme.palette.error.main, fontWeight: 700 },
    };
  },
];

export default function KehadiranPanel({
  kelasId, siswa, pertemuan, lm, kehadiran, waktuSekolah, readOnly, onBerubah,
}) {
  const server = useMemo(() => petaKehadiran(kehadiran), [kehadiran]);
  const hariIni = waktuSekolah?.hari_ini;
  const zona = waktuSekolah?.zona;

  const [edit, setEdit] = useState({});
  const [galatServer, setGalatServer] = useState({});
  const [pesan, setPesan] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [konfirmasiKosong, setKonfirmasiKosong] = useState(0);
  const [form, setForm] = useState(null); // { baru: true } | { pertemuan }
  const [hapus, setHapus] = useState(null);
  const wadah = useRef(null);

  const urut = useMemo(() => [...pertemuan].sort((a, b) => a.nomor - b.nomor), [pertemuan]);
  const jumlahKotor = Object.keys(edit).length;
  const perluUrut = useMemo(() => perluUrutKronologis(pertemuan), [pertemuan]);

  // Isian untuk siswa atau pertemuan yang sudah tidak ada (dihapus) tidak boleh tertinggal sebagai "belum disimpan".
  useEffect(() => {
    const idP = new Set(pertemuan.map((p) => p.id));
    const idS = new Set(siswa.map((s) => s.id));
    setEdit((prev) => {
      const sisa = Object.entries(prev).filter(([k]) => {
        const [s, p] = k.split(':').map(Number);
        return idS.has(s) && idP.has(p);
      });
      return sisa.length === Object.keys(prev).length ? prev : Object.fromEntries(sisa);
    });
  }, [pertemuan, siswa]);

  useEffect(() => {
    if (jumlahKotor === 0) return undefined;
    const tahan = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', tahan);
    return () => window.removeEventListener('beforeunload', tahan);
  }, [jumlahKotor]);

  const bersihkanGalat = (k) => setGalatServer((prev) => {
    if (!(k in prev)) return prev;
    const lanjut = { ...prev };
    delete lanjut[k];
    return lanjut;
  });

  const fokus = (baris, kolom) => {
    const el = wadah.current?.querySelector(`input[data-r="${baris}"][data-c="${kolom}"]`);
    if (el) { el.focus(); el.select(); }
  };

  const ubahSel = (k, teks, r, c) => {
    setEdit((prev) => terapkanIsian(prev, k, teks, server));
    bersihkanGalat(k);
    setPesan(null); // pesan hasil aksi sebelumnya sudah basi begitu guru mengubah sel lagi
    // Satu huruf sah: kursor turun ke siswa berikutnya, supaya satu kolom bisa diisi tanpa menyentuh mouse.
    if (teks.trim().length === 1 && !bacaKodeSel(teks).galat) setTimeout(() => fokus(r + 1, c), 0);
  };

  const rapikanSel = (k, teks) => {
    // Kata penuh ("Sakit", "TK") dijadikan kode baku saat sel ditinggalkan.
    const b = bacaKodeSel(teks);
    if (!b.galat && b.kode !== null && teks !== b.kode) setEdit((prev) => terapkanIsian(prev, k, b.kode, server));
  };

  const tempel = (e, r, c) => {
    const data = uraiTempel(e.clipboardData.getData('text'));
    if (data.length === 0 || (data.length === 1 && data[0].length === 1)) return;
    e.preventDefault();
    const { perubahan, terpotong } = terapkanTempel({
      data, mulaiBaris: r, mulaiKolom: c, jumlahBaris: siswa.length, jumlahKolom: urut.length,
    });
    // Nama status Absenin ("Hadir", "TK", "alpa") dibakukan menjadi kode saat ditempel; yang tidak dikenal tetap
    // apa adanya supaya terlihat salah dan harus diperbaiki.
    const baku = (teks) => { const b = bacaKodeSel(teks); return b.galat ? teks : (b.kode ?? ''); };
    setEdit((prev) => perubahan.reduce(
      (acc, p) => terapkanIsian(acc, kunciSel(siswa[p.baris].id, urut[p.kolom].id), baku(p.teks), server),
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
    else if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) { e.preventDefault(); fokus(r, c + 1); }
    else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) { e.preventDefault(); fokus(r, c - 1); }
  };

  const semuaHadir = (pertemuanId) => {
    const kunci = selUntukSemuaHadir(pertemuanId, siswa, edit, server);
    if (kunci.length === 0) {
      setPesan({ jenis: 'info', teks: 'Semua siswa pada pertemuan ini sudah punya catatan; tidak ada yang diubah.' });
      return;
    }
    setEdit((prev) => kunci.reduce((acc, k) => terapkanIsian(acc, k, 'H', server), prev));
    setPesan({ jenis: 'info', teks: `${kunci.length} sel kosong diisi H. Ubah yang tidak hadir, lalu klik Simpan.` });
  };

  const adaGalatLokal = Object.values(edit).some((t) => bacaKodeSel(t).galat);

  const mintaSimpan = () => {
    const kosong = hitungPengosonganKode(edit, server);
    if (kosong > 0) setKonfirmasiKosong(kosong); else simpan();
  };

  const simpan = async () => {
    setKonfirmasiKosong(0);
    const muatan = susunMuatanSimpan(edit);
    setSibuk(true);
    setPesan(null);
    setGalatServer({});
    try {
      const { ringkasan } = await simpanKehadiranBanyak(kelasId, muatan);
      setEdit({});
      setPesan({
        jenis: 'success',
        teks: `Tersimpan: ${ringkasan.disimpan} diubah, ${ringkasan.dihapus} dikosongkan, ${ringkasan.tidak_berubah} tidak berubah.`,
      });
      onBerubah();
    } catch (error) {
      const sudah = new Set((error.berhasil ?? []).map((x) => kunciSel(x.siswa_id, x.pertemuan_id)));
      if (sudah.size > 0) {
        setEdit((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !sudah.has(k))));
        onBerubah();
      }
      const peta = {};
      (error.response?.data?.galat ?? []).forEach((g) => {
        const c = typeof g.indeks === 'number' ? error.catatanGagal?.[g.indeks] : null;
        if (c) peta[kunciSel(c.siswa_id, error.pertemuanGagal)] = g.pesan;
      });
      setGalatServer(peta);
      setPesan({ jenis: 'error', teks: pesanGalat(error, 'Kehadiran belum tersimpan. Coba lagi.') });
    } finally {
      setSibuk(false);
    }
  };

  const buang = () => { setEdit({}); setGalatServer({}); setPesan(null); };

  const urutkan = async () => {
    setSibuk(true);
    setPesan(null);
    try {
      await urutPertemuan(kelasId, idKronologis(pertemuan));
      onBerubah();
      setPesan({ jenis: 'success', teks: 'Pertemuan diurutkan menurut tanggal.' });
    } catch (error) {
      setPesan({ jenis: 'error', teks: pesanGalat(error, 'Urutan belum tersimpan. Coba lagi.') });
    } finally {
      setSibuk(false);
    }
  };

  const simpanForm = async (n) => {
    if (form.pertemuan) await ubahPertemuan(kelasId, form.pertemuan.id, n);
    else await tambahPertemuan(kelasId, n);
    onBerubah();
  };

  const dialogForm = !readOnly && (
    <PertemuanFormDialog
      buka={Boolean(form)}
      judul={form?.pertemuan ? `Ubah pertemuan P${form.pertemuan.nomor}` : 'Tambah pertemuan'}
      awal={form?.pertemuan ? { tanggal: form.pertemuan.tanggal, lingkup_materi_id: form.pertemuan.lingkup_materi_id } : undefined}
      hariIni={hariIni}
      zona={zona}
      pertemuan={pertemuan}
      kecualiId={form?.pertemuan?.id}
      lm={lm}
      onSimpan={simpanForm}
      onTutup={() => setForm(null)}
    />
  );
  const dialogHapus = !readOnly && (
    <HapusDialog
      buka={Boolean(hapus)}
      judul="Hapus pertemuan"
      uraian={hapus ? `Hapus pertemuan P${hapus.nomor} (${tanggalPanjang(hapus.tanggal)})? Nomor pertemuan sesudahnya bergeser satu.` : ''}
      onTutup={() => setHapus(null)}
      onHapus={async (konfirmasi) => {
        await hapusPertemuan(kelasId, hapus.id, konfirmasi);
        onBerubah();
      }}
    />
  );

  const infoWaktu = hariIni && (
    <>Tanggal pertemuan mengikuti zona waktu sekolah{zona ? ` (${namaZona(zona)})` : ''}. Hari ini: <b>{tanggalPanjang(hariIni)}</b>.</>
  );
  const peringatanZona = waktuSekolah?.zona_bawaan && (
    <Alert severity="warning">
      Zona waktu sekolah belum diisi dengan benar di data sekolah, jadi dipakai WIB. Bila sekolah Anda di WITA atau WIT,
      tanggal &quot;hari ini&quot; bisa meleset satu hari; minta admin sekolah memperbaikinya.
    </Alert>
  );

  if (siswa.length === 0 || pertemuan.length === 0) {
    return (
      <Stack spacing={2.5} alignItems="flex-start">
        <JudulTab judul="Kehadiran siswa" keterangan={infoWaktu} />
        {peringatanZona}
        <Alert severity="info" sx={{ alignSelf: 'stretch' }}>
          {siswa.length === 0 ? 'Isi daftar siswa dulu di tab Siswa. ' : ''}
          {pertemuan.length === 0
            ? (readOnly ? 'Kelas ini belum memiliki pertemuan.' : 'Belum ada pertemuan. Tambahkan pertemuan pada tanggal berlangsungnya, lalu catat kehadiran siswa.')
            : ''}
        </Alert>
        {!readOnly && (
          <Button variant="contained" startIcon={<IconPlus size={20} />} onClick={() => setForm({ baru: true })}>
            Tambah pertemuan
          </Button>
        )}
        {dialogForm}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <JudulTab judul="Kehadiran siswa" keterangan={infoWaktu} />
      {peringatanZona}
      <PetunjukTab
        butir={[
          <>Ketik <b>H</b> (hadir), <b>S</b> (sakit), <b>I</b> (izin), atau <b>A</b> (alpa, tanpa keterangan); kursor turun sendiri.</>,
          <>Sel <b>kosong berarti belum dicatat</b>, bukan alpa, dan tidak dihitung.</>,
          'Tombol "Semua hadir" di kepala kolom hanya mengisi sel yang kosong.',
          'Kolom H S I A di kiri menghitung dari isian yang tampil.',
        ]}
      />
      {!readOnly && (
        <BilahSimpan
          jumlahKotor={jumlahKotor}
          sibuk={sibuk}
          adaGalat={adaGalatLokal}
          onBuang={buang}
          onSimpan={mintaSimpan}
          labelSimpan="Simpan kehadiran"
          kiri={(
            <>
              <Button variant="outlined" startIcon={<IconPlus size={20} />} onClick={() => setForm({ baru: true })}>
                Tambah pertemuan
              </Button>
              {perluUrut && (
                <Button variant="outlined" startIcon={<IconSortAscending size={20} />} onClick={urutkan} disabled={sibuk}>
                  Urutkan menurut tanggal
                </Button>
              )}
            </>
          )}
        />
      )}

      {pesan && <Alert severity={pesan.jenis} onClose={() => setPesan(null)}>{pesan.teks}</Alert>}
      {adaGalatLokal && !pesan && (
        <Alert severity="warning">Ada sel dengan isian tidak sah (ditandai !). Perbaiki dulu sebelum menyimpan.</Alert>
      )}

      <Box ref={wadah} sx={gayaKehadiran} role="region" aria-label="Tabel kehadiran siswa" tabIndex={-1}>
        <table>
          <thead>
            <tr>
              <th className="no">No</th>
              <th className="nama">Nama siswa</th>
              {KODE_HADIR.map((kode) => (
                <th key={kode} className="rekap" title={TEKS_KODE[kode]} style={{ padding: '4px 2px' }}>{kode}</th>
              ))}
              {urut.map((p) => {
                const rp = rekapPertemuan(p.id, siswa, edit, server);
                const lmLabel = labelLm(lm, p.lingkup_materi_id);
                return (
                  <th key={p.id} style={{ minWidth: 112, height: 'auto', padding: '10px 6px' }}>
                    <Stack alignItems="center" spacing={0.5}>
                      <span title={`Pertemuan ke-${p.nomor}, ${tanggalPanjang(p.tanggal)}`}>{`P${p.nomor}`}</span>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{tanggalPendek(p.tanggal)}</Typography>
                      {lmLabel && <Chip size="small" variant="outlined" label={lmLabel} />}
                      <Typography variant="caption" color={rp.belum > 0 ? 'text.primary' : 'text.secondary'} sx={{ lineHeight: 1.2, whiteSpace: 'nowrap', fontWeight: rp.belum > 0 ? 700 : 400 }}>
                        {rp.belum > 0 ? `${rp.belum} kosong` : 'lengkap'}
                      </Typography>
                      {!readOnly && (
                        <Stack direction="row">
                          <Tooltip title="Semua hadir (hanya sel kosong)"><IconButton size="small" sx={{ p: 1 }} aria-label={`Semua hadir pada pertemuan ${p.nomor}`} onClick={() => semuaHadir(p.id)}><IconChecks size={18} /></IconButton></Tooltip>
                          <Tooltip title="Ubah"><IconButton size="small" sx={{ p: 1 }} aria-label={`Ubah pertemuan ${p.nomor}`} onClick={() => setForm({ pertemuan: p })}><IconPencil size={18} /></IconButton></Tooltip>
                          <Tooltip title="Hapus"><IconButton size="small" sx={{ p: 1 }} aria-label={`Hapus pertemuan ${p.nomor}`} onClick={() => setHapus(p)}><IconTrash size={18} /></IconButton></Tooltip>
                        </Stack>
                      )}
                    </Stack>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {siswa.map((s, r) => {
              const rs = rekapSiswa(s.id, urut, edit, server);
              return (
                <tr key={s.id}>
                  <td className="no">{s.urutan}</td>
                  <td className="nama" title={s.nama}>{s.nama}</td>
                  {KODE_HADIR.map((kode) => (
                    <td key={kode} className={`rekap${kode === 'A' && rs.A > 0 ? ' alpa' : ''}`} aria-label={`${TEKS_KODE[kode]}: ${rs[kode]} dari ${rs.tercatat} tercatat`}>
                      {rs[kode]}
                    </td>
                  ))}
                  {urut.map((p, c) => {
                    const k = kunciSel(s.id, p.id);
                    const diEdit = k in edit;
                    const teks = diEdit ? edit[k] : (server.get(k) ?? '');
                    const { kode, galat: galatLokal } = kodeEfektif(k, edit, server);
                    const galat = galatLokal || galatServer[k];
                    let kelasSel = 'sel';
                    if (galat) kelasSel += ' salah'; else if (diEdit) kelasSel += ' kotor';
                    if (!galat && kode === 'A') kelasSel += ' alpa';
                    let judulSel = kode ? TEKS_KODE[kode] : 'Belum dicatat';
                    if (galat) judulSel = galat; else if (diEdit) judulSel = `${judulSel} (belum disimpan)`;
                    return (
                      <td key={p.id} className={kelasSel} title={judulSel}>
                        <div className="isi">
                          <input
                            value={teks}
                            data-r={r}
                            data-c={c}
                            readOnly={readOnly}
                            autoComplete="off"
                            aria-label={`Kehadiran ${s.nama}, pertemuan ${p.nomor}, ${tanggalPanjang(p.tanggal)}${kode ? `: ${TEKS_KODE[kode]}` : ': belum dicatat'}`}
                            aria-invalid={galat ? 'true' : undefined}
                            onChange={(e) => ubahSel(k, e.target.value, r, c)}
                            onBlur={(e) => rapikanSel(k, e.target.value)}
                            onPaste={(e) => !readOnly && tempel(e, r, c)}
                            onKeyDown={(e) => tombol(e, r, c)}
                          />
                          <span className="tanda">{galat && <span aria-hidden="true">!</span>}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      <Dialog open={konfirmasiKosong > 0} onClose={() => setKonfirmasiKosong(0)} aria-labelledby="judul-kosongkan-kehadiran">
        <DialogTitle id="judul-kosongkan-kehadiran">Kosongkan catatan yang sudah tersimpan?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {konfirmasiKosong} catatan kehadiran yang sudah tersimpan akan dikosongkan (menjadi belum dicatat, bukan alpa).
            Catatan yang dikosongkan tidak bisa dikembalikan dari sini. Lanjutkan?
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

KehadiranPanel.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  siswa: PropTypes.array.isRequired,
  pertemuan: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  kehadiran: PropTypes.array.isRequired,
  waktuSekolah: PropTypes.shape({
    zona: PropTypes.string,
    hari_ini: PropTypes.string,
    zona_bawaan: PropTypes.bool,
  }),
  readOnly: PropTypes.bool,
  onBerubah: PropTypes.func.isRequired,
};
