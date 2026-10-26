import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { tambahRemedial, ubahRemedial, hapusRemedial, pesanGalat } from '../api';
import { tampilNilai } from '../nilai/tempel';
import { tampilAngka } from '../rentang';
import {
  kunciRemedial, kelompokkanRemedial, mencapaiKktp, catatanBatas, periksaSkor, periksaTanggal, tanggalLokal,
  tpUntukRemedial,
} from './remedial';

/**
 * Catat, ubah, atau hapus remedial untuk satu siswa pada satu TP. Remedial tidak menimpa nilai asli TP;
 * yang dipakai penanda adalah remedial TERBARU (urutan terbesar). Dibuka dari tab Remedial maupun dari
 * bukti penanda "Kesulitan pada TP tertentu".
 */
export default function RemedialDialog({
  buka, awal, kelasId, kelas, siswa, lm, nilaiTp, remedial, hariIni, onBerubah, onTutup,
}) {
  // Tanggal bawaan = hari ini MENURUT SEKOLAH (dari server); jam perangkat hanya cadangan bila server tidak mengirimnya.
  const tanggalBawaan = () => hariIni || tanggalLokal();
  const [siswaId, setSiswaId] = useState('');
  const [tpId, setTpId] = useState('');
  const [skor, setSkor] = useState('');
  const [tanggal, setTanggal] = useState(tanggalBawaan());
  const [catatan, setCatatan] = useState('');
  const [editId, setEditId] = useState(null);
  const [hapusId, setHapusId] = useState(null);
  const [sentuh, setSentuh] = useState(false);
  const [galat, setGalat] = useState('');
  const [info, setInfo] = useState(null);
  const [sibuk, setSibuk] = useState(false);

  const bersihkanForm = () => {
    setSkor('');
    setTanggal(tanggalBawaan());
    setCatatan('');
    setEditId(null);
    setSentuh(false);
  };

  useEffect(() => {
    if (!buka) return;
    setSiswaId(awal?.siswaId ?? '');
    setTpId(awal?.tpId ?? '');
    bersihkanForm();
    setHapusId(null);
    setGalat('');
    setInfo(null);
    // Sengaja hanya bereaksi pada buka/awal: formulir direset saat dialog dibuka, bukan setiap hariIni berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buka, awal]);

  const nilaiPeta = useMemo(() => {
    const peta = new Map();
    nilaiTp.forEach((n) => peta.set(kunciRemedial(n.siswa_id, n.tp_id), n.nilai));
    return peta;
  }, [nilaiTp]);
  const kelompok = useMemo(() => kelompokkanRemedial(remedial), [remedial]);

  const daftarTp = useMemo(
    () => (siswaId === '' ? [] : tpUntukRemedial(siswaId, lm, nilaiPeta, kelas.kktp)),
    [siswaId, lm, nilaiPeta, kelas.kktp],
  );
  const tpTerpilih = daftarTp.find((t) => t.id === tpId) ?? null;
  const riwayat = siswaId !== '' && tpId !== '' ? (kelompok.get(kunciRemedial(siswaId, tpId)) ?? []) : [];
  const kktpTeks = tampilAngka(Number(kelas.kktp));

  const hasilSkor = periksaSkor(skor);
  const hasilTanggal = periksaTanggal(tanggal);
  const catatanSkor = hasilSkor.nilai !== undefined ? catatanBatas(hasilSkor.nilai, kelas.kktp) : null;
  const siap = siswaId !== '' && tpId !== '' && !hasilSkor.galat && !hasilTanggal.galat;

  const ubahSiswa = (v) => { setSiswaId(v); setTpId(''); bersihkanForm(); setInfo(null); setGalat(''); };
  const ubahTp = (v) => { setTpId(v); bersihkanForm(); setInfo(null); setGalat(''); };

  const mulaiUbah = (r) => {
    setEditId(r.id);
    setSkor(tampilNilai(r.nilai_remedial));
    setTanggal(r.tanggal);
    setCatatan(r.catatan ?? '');
    setSentuh(false);
    setInfo(null);
    setGalat('');
  };

  const simpan = async () => {
    setSentuh(true);
    if (!siap) return;
    setSibuk(true);
    setGalat('');
    setInfo(null);
    try {
      if (editId === null) {
        const hasil = await tambahRemedial(kelasId, {
          siswa_id: siswaId, tp_id: tpId, nilai_remedial: hasilSkor.nilai, tanggal: hasilTanggal.tanggal, catatan: catatan.trim() || null,
        });
        const tuntas = mencapaiKktp(hasilSkor.nilai, kelas.kktp);
        const teks = tuntas
          ? `Remedial tersimpan. Skor ${tampilAngka(hasilSkor.nilai)} mencapai KKTP (${kktpTeks}), jadi TP ini dianggap tuntas dan tidak lagi memicu penanda.`
          : `Remedial tersimpan, tetapi skor ${tampilAngka(hasilSkor.nilai)} masih di bawah KKTP (${kktpTeks}). TP ini tetap ditandai sampai ada remedial yang mencapai KKTP.`;
        setInfo({ jenis: tuntas ? 'success' : 'warning', teks, peringatan: (hasil.peringatan ?? []).map((p) => p.pesan) });
      } else {
        await ubahRemedial(kelasId, editId, {
          nilai_remedial: hasilSkor.nilai, tanggal: hasilTanggal.tanggal, catatan: catatan.trim() || null,
        });
        setInfo({ jenis: 'success', teks: 'Perubahan remedial tersimpan.', peringatan: [] });
      }
      bersihkanForm();
      onBerubah();
    } catch (error) {
      setGalat(pesanGalat(error, 'Remedial belum tersimpan. Coba lagi.'));
    } finally {
      setSibuk(false);
    }
  };

  const hapus = async (id) => {
    setSibuk(true);
    setGalat('');
    setInfo(null);
    try {
      await hapusRemedial(kelasId, id);
      setHapusId(null);
      if (editId === id) bersihkanForm();
      setInfo({ jenis: 'success', teks: 'Catatan remedial dihapus.', peringatan: [] });
      onBerubah();
    } catch (error) {
      setGalat(pesanGalat(error, 'Catatan belum terhapus. Coba lagi.'));
    } finally {
      setSibuk(false);
    }
  };

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-remedial">
      <DialogTitle id="judul-remedial">Catat remedial</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Remedial tidak mengubah nilai asli TP. Yang menentukan penanda adalah remedial terbaru: bila skornya
            mencapai KKTP ({kktpTeks}), TP itu dianggap tuntas.
          </Typography>
          <TextField
            select
            label="Siswa"
            value={siswaId}
            onChange={(e) => ubahSiswa(e.target.value)}
            disabled={editId !== null || sibuk}
            fullWidth
          >
            {siswa.map((s) => <MenuItem key={s.id} value={s.id}>{`${s.urutan}. ${s.nama}`}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="TP"
            value={tpTerpilih ? tpId : ''}
            onChange={(e) => ubahTp(e.target.value)}
            disabled={siswaId === '' || editId !== null || sibuk}
            error={siswaId !== '' && daftarTp.length === 0}
            helperText={siswaId !== '' && daftarTp.length === 0
              ? 'Siswa ini belum punya nilai TP. Isi nilai TP dulu di tab Nilai TP.'
              : 'Hanya TP yang sudah bernilai untuk siswa ini.'}
            fullWidth
          >
            {daftarTp.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {`${t.label}, nilai ${tampilNilai(t.nilai)}${t.bawahKktp ? ', di bawah KKTP' : ''}`}
              </MenuItem>
            ))}
          </TextField>

          {tpTerpilih && (
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Nilai asli {tampilNilai(tpTerpilih.nilai)} (KKTP {kktpTeks}).
                {riwayat.length === 0 ? ' Belum ada remedial.' : ` Sudah ${riwayat.length} kali remedial.`}
              </Typography>
              {riwayat.length > 0 && (
                <Stack spacing={0.75} component="ul" aria-label="Riwayat remedial" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {riwayat.map((r, i) => (
                    <Stack key={r.id} component="li" direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" sx={{ minWidth: 150 }}>
                        {`Ke-${r.urutan}: ${tampilNilai(r.nilai_remedial)} pada ${r.tanggal}`}
                      </Typography>
                      {i === riwayat.length - 1 && (
                        <Chip size="small" label={mencapaiKktp(r.nilai_remedial, kelas.kktp) ? 'Terbaru, mencapai KKTP' : 'Terbaru, di bawah KKTP'} />
                      )}
                      {r.catatan && <Typography variant="caption" color="text.secondary">{r.catatan}</Typography>}
                      {hapusId === r.id ? (
                        <>
                          <Button size="small" color="error" disabled={sibuk} onClick={() => hapus(r.id)} aria-label={`Ya, hapus remedial ke-${r.urutan}`}>Ya, hapus</Button>
                          <Button size="small" disabled={sibuk} onClick={() => setHapusId(null)}>Batal</Button>
                        </>
                      ) : (
                        <>
                          <Button size="small" disabled={sibuk} onClick={() => mulaiUbah(r)} aria-label={`Ubah remedial ke-${r.urutan}`}>Ubah</Button>
                          <Button size="small" color="error" disabled={sibuk} onClick={() => setHapusId(r.id)} aria-label={`Hapus remedial ke-${r.urutan}`}>Hapus</Button>
                        </>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {tpTerpilih && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">{editId === null ? 'Remedial baru' : `Ubah remedial ke-${riwayat.find((r) => r.id === editId)?.urutan ?? ''}`}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Skor remedial"
                  value={skor}
                  onChange={(e) => setSkor(e.target.value)}
                  inputProps={{ inputMode: 'decimal' }}
                  error={sentuh && Boolean(hasilSkor.galat)}
                  helperText={(sentuh && hasilSkor.galat) || catatanSkor || 'mis. 80 atau 80,5'}
                  required
                  fullWidth
                />
                <TextField
                  label="Tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={sentuh && Boolean(hasilTanggal.galat)}
                  helperText={sentuh && hasilTanggal.galat ? hasilTanggal.galat : ' '}
                  required
                  fullWidth
                />
              </Stack>
              <TextField label="Catatan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} multiline minRows={2} inputProps={{ maxLength: 2000 }} fullWidth />
            </Stack>
          )}

          {info && (
            <Alert severity={info.jenis} onClose={() => setInfo(null)}>
              {info.teks}
              {info.peringatan.map((p) => <Box key={p} component="span" sx={{ display: 'block' }}>{p}</Box>)}
            </Alert>
          )}
          {galat && <Alert severity="error">{galat}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        {editId !== null && <Button onClick={bersihkanForm} disabled={sibuk}>Batal ubah</Button>}
        <Button onClick={onTutup} disabled={sibuk}>Selesai</Button>
        {tpTerpilih && (
          <Button variant="contained" onClick={simpan} disabled={sibuk}>
            {sibuk ? 'Menyimpan...' : (editId === null ? 'Simpan remedial' : 'Simpan perubahan')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

RemedialDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  awal: PropTypes.shape({ siswaId: PropTypes.number, tpId: PropTypes.number }),
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  kelas: PropTypes.object.isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  nilaiTp: PropTypes.array.isRequired,
  remedial: PropTypes.array.isRequired,
  hariIni: PropTypes.string,
  onBerubah: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};
