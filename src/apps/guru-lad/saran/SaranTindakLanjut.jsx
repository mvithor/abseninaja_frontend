import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import {
  IconBan, IconCheck, IconChevronDown, IconPencil,
} from '@tabler/icons-react';
import {
  abaikanSaran, bukaKembaliSaran, kunciLad, pakaiSaran, pesanGalat,
} from '../api';
import { POLA_INFO, URUTAN_PRIORITAS, definisiPola, uraikanBukti } from '../evaluasi/penjelasan';
import { barisP1 } from '../evaluasi/matriks';
import {
  KEADAAN, KOLOM_SARAN, LABEL_KEADAAN, MAKS_ALASAN, MAKS_KOLOM, adaPerubahan, isianAwal, isianDraf, isianSama,
  keadaanSaran, kolomDihilangkan, pesanKonflikSaran, periksaAlasan, periksaIsian, tanggalSimpan, urutkanSaran,
} from './saran';

const IKON_KEADAAN = {
  [KEADAAN.DRAF]: null,
  [KEADAAN.DIPAKAI]: <IconCheck size={14} />,
  [KEADAAN.DIPAKAI_DIUBAH]: <IconPencil size={14} />,
  [KEADAAN.DIABAIKAN]: <IconBan size={14} />,
};

const pesanSimpan = (error) => pesanKonflikSaran(error?.response?.status) ?? pesanGalat(error, 'Keputusan belum tersimpan. Coba lagi.');

/** Empat kotak saran + keputusan guru untuk satu penanda. */
function KotakSaran({
  kelasId, siswaId, namaSiswa, entri, templatVersi, readOnly, hasilPola, ctxPenjelasan, onCatatRemedial,
}) {
  const qc = useQueryClient();
  const keadaan = keadaanSaran(entri);
  const awal = useMemo(() => isianAwal(entri), [entri]);
  const draf = useMemo(() => isianDraf(entri), [entri]);
  const [isian, setIsian] = useState(awal);
  const [dasar, setDasar] = useState(awal);
  const [sunting, setSunting] = useState(keadaan === KEADAAN.DRAF);
  const [modeAbaikan, setModeAbaikan] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [galatKolom, setGalatKolom] = useState({});
  const [galatAlasan, setGalatAlasan] = useState('');
  const [pesan, setPesan] = useState(null);

  // Data kelas berubah: draf dari server ikut berubah. Isian yang belum disentuh guru langsung mengikuti;
  // isian yang sudah diubah guru tidak ditimpa diam-diam, melainkan ditawarkan draf terbaru.
  useEffect(() => {
    if (isianSama(awal, dasar)) return;
    // Yang di layar sudah sama dengan yang di server (mis. baru saja disimpan): tidak ada yang perlu dipilih.
    if (isianSama(isian, awal) || !adaPerubahan(isian, dasar)) { setIsian(awal); setDasar(awal); }
  }, [awal, dasar, isian]);
  // Keputusan berubah (dipakai, diabaikan, dibuka kembali): layar mengikuti apa yang sekarang ada di server.
  useEffect(() => {
    setSunting(keadaan === KEADAAN.DRAF);
    setModeAbaikan(false);
    setIsian(awal);
    setDasar(awal);
    // Hanya bereaksi pada perubahan keadaan; `awal` yang dibaca adalah yang terbaru pada saat itu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keadaan]);

  const drafBerubahDiBawah = !isianSama(awal, dasar) && adaPerubahan(isian, dasar);
  const diubahDariDraf = adaPerubahan(isian, draf);

  const segarkan = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: kunciLad.saranSiswa(kelasId, siswaId) }),
      qc.invalidateQueries({ queryKey: kunciLad.saranKelas(kelasId) }),
    ]);
  };
  const sesudah = (teks) => async () => {
    setPesan({ jenis: 'success', teks });
    setGalatKolom({});
    setGalatAlasan('');
    setModeAbaikan(false);
    setAlasan('');
    await segarkan();
  };
  const gagal = (error) => setPesan({ jenis: 'error', teks: pesanSimpan(error) });

  const pakai = useMutation({ mutationFn: (akhir) => pakaiSaran(kelasId, siswaId, entri.pola, akhir), onSuccess: sesudah('Saran dipakai dan tersimpan.'), onError: gagal });
  const abaikan = useMutation({ mutationFn: (teks) => abaikanSaran(kelasId, siswaId, entri.pola, teks), onSuccess: sesudah('Saran diabaikan dan alasannya tersimpan.'), onError: gagal });
  const bukaKembali = useMutation({ mutationFn: () => bukaKembaliSaran(kelasId, siswaId, entri.pola), onSuccess: sesudah('Keputusan dibuka kembali. Draf sistem ditampilkan lagi.'), onError: gagal });
  const sibuk = pakai.isPending || abaikan.isPending || bukaKembali.isPending;

  const kirimPakai = () => {
    const { galat, bersih } = periksaIsian(isian);
    setGalatKolom(galat);
    if (Object.keys(galat).length > 0) return;
    setPesan(null);
    pakai.mutate(bersih);
  };
  const kirimAbaikan = () => {
    const h = periksaAlasan(alasan);
    setGalatAlasan(h.galat ?? '');
    if (h.galat) return;
    setPesan(null);
    abaikan.mutate(h.alasan);
  };

  const t = entri.tersimpan;
  const dihilangkan = kolomDihilangkan(entri);
  const alasanHilang = new Map(dihilangkan.map((d) => [d.kunci, d.alasan]));
  const bolehUbah = !readOnly && sunting && keadaan !== KEADAAN.DIABAIKAN;
  const bukti = hasilPola?.status === 'DITANDAI' ? hasilPola.bukti : null;
  const kalimatBukti = bukti ? uraikanBukti(entri.pola, bukti, ctxPenjelasan) : [];
  const baris1 = entri.pola === 'P1' && bukti ? barisP1(bukti, ctxPenjelasan.lm).filter((b) => b.tpId !== null) : [];

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          variant={keadaan === KEADAAN.DRAF ? 'outlined' : 'filled'}
          color={keadaan === KEADAAN.DIABAIKAN ? 'default' : 'primary'}
          icon={IKON_KEADAAN[keadaan] ?? undefined}
          label={LABEL_KEADAAN[keadaan]}
        />
        {keadaan === KEADAAN.DRAF && (
          <Typography variant="body2" color="text.secondary">
            {`Draf dari sistem (templat ${templatVersi}). ${readOnly ? '' : 'Setiap kalimat dapat diubah. '}LAD tidak mengirim saran ke siapa pun.`}
          </Typography>
        )}
        {t && <Typography variant="body2" color="text.secondary">{`Disimpan ${tanggalSimpan(t.disimpan_pada)}`}</Typography>}
      </Stack>

      {pesan && <Alert severity={pesan.jenis} role={pesan.jenis === 'error' ? 'alert' : 'status'} onClose={() => setPesan(null)}>{pesan.teks}</Alert>}
      {readOnly && <Alert severity="info">Kelas kasus hanya dapat dilihat, jadi keputusan tidak dapat disimpan.</Alert>}
      {t && t.data_berubah && (
        <Alert severity="warning">
          Data kelas berubah sejak keputusan ini disimpan, sehingga draf sistem sekarang berbeda. Versi yang tersimpan tidak ikut berubah.
        </Alert>
      )}
      {drafBerubahDiBawah && (
        <Alert
          severity="warning"
          action={<Button size="small" color="inherit" onClick={() => { setIsian(awal); setDasar(awal); }}>Muat draf terbaru</Button>}
        >
          Data kelas berubah dan draf sistem ikut berubah. Isian Anda belum diganti.
        </Alert>
      )}

      {keadaan === KEADAAN.DIABAIKAN ? (
        <Box>
          <Typography variant="body2" fontWeight={600}>Alasan mengabaikan</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{t.alasan_abai}</Typography>
        </Box>
      ) : null}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {KOLOM_SARAN.map((k) => (
          <TextField
            key={k.kunci}
            label={k.label}
            value={isian[k.kunci]}
            onChange={(e) => { setIsian((v) => ({ ...v, [k.kunci]: e.target.value })); setGalatKolom((g) => ({ ...g, [k.kunci]: undefined })); }}
            multiline
            minRows={3}
            fullWidth
            required={k.kunci === 'langkah'}
            disabled={keadaan === KEADAAN.DIABAIKAN}
            sx={!bolehUbah ? { '& .MuiInputBase-root': { bgcolor: 'action.hover' }, '& .MuiOutlinedInput-notchedOutline': { borderStyle: 'dashed' } } : undefined}
            slotProps={{
              htmlInput: { maxLength: MAKS_KOLOM, readOnly: !bolehUbah },
              inputLabel: { shrink: true },
            }}
            error={Boolean(galatKolom[k.kunci])}
            helperText={galatKolom[k.kunci]
              || (alasanHilang.has(k.kunci) ? `Kalimat tidak dibuat: ${alasanHilang.get(k.kunci)}` : k.petunjuk)}
          />
        ))}
      </Box>

      {entri.pola === 'P1' && !readOnly && (
        <Alert severity="info" icon={false}>
          <Typography variant="body2" sx={{ mb: baris1.length ? 1 : 0 }}>
            Setelah TP dinilai ulang, catat hasilnya. Nilai remedial tersimpan apa adanya; pembatasan di KKTP hanya berlaku di rapor.
          </Typography>
          {baris1.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {baris1.map((b) => (
                <Button
                  key={b.kunci}
                  variant="outlined"
                  onClick={() => onCatatRemedial({ siswaId, tpId: b.tpId })}
                  aria-label={`Catat remedial ${namaSiswa}, ${b.nama}`}
                >
                  {`Catat remedial ${b.nama}`}
                </Button>
              ))}
            </Stack>
          )}
        </Alert>
      )}

      {modeAbaikan && keadaan !== KEADAAN.DIABAIKAN && (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
          <TextField
            label="Alasan singkat"
            value={alasan}
            onChange={(e) => { setAlasan(e.target.value); setGalatAlasan(''); }}
            multiline
            minRows={2}
            fullWidth
            autoFocus
            required
            error={Boolean(galatAlasan)}
            helperText={galatAlasan || 'Wajib diisi. Tulis singkat mengapa saran ini tidak dipakai.'}
            slotProps={{ htmlInput: { maxLength: MAKS_ALASAN } }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button variant="contained" color="inherit" onClick={kirimAbaikan} disabled={sibuk}>Abaikan saran ini</Button>
            <Button onClick={() => { setModeAbaikan(false); setGalatAlasan(''); }} disabled={sibuk}>Batal</Button>
          </Stack>
        </Box>
      )}

      {bolehUbah && !modeAbaikan && (
        <Typography variant="body2" color="text.secondary">
          {keadaan === KEADAAN.DRAF
            ? 'Isi kotak di atas dapat diubah. Belum ada yang tersimpan: tombol "Pakai saran ini" atau "Pakai versi saya" menyimpan isian ini sebagai keputusan Anda.'
            : 'Tombol "Pakai versi saya" menyimpan perubahan ini sebagai keputusan Anda.'}
        </Typography>
      )}

      {!readOnly && !modeAbaikan && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {keadaan === KEADAAN.DIABAIKAN && (
            <Button variant="outlined" onClick={() => bukaKembali.mutate()} disabled={sibuk}>Buka kembali</Button>
          )}
          {keadaan !== KEADAAN.DIABAIKAN && sunting && (
            <>
              <Button variant="contained" onClick={kirimPakai} disabled={sibuk}>
                {diubahDariDraf || keadaan !== KEADAAN.DRAF ? 'Pakai versi saya' : 'Pakai saran ini'}
              </Button>
              {diubahDariDraf && (
                <Button variant="text" onClick={() => { setIsian(draf); setGalatKolom({}); }} disabled={sibuk}>Kembalikan ke draf</Button>
              )}
              {keadaan === KEADAAN.DRAF && (
                <Button variant="outlined" color="inherit" onClick={() => { setModeAbaikan(true); setPesan(null); }} disabled={sibuk}>Abaikan saran</Button>
              )}
              {keadaan !== KEADAAN.DRAF && (
                <Button onClick={() => { setSunting(false); setIsian(awal); setDasar(awal); setGalatKolom({}); }} disabled={sibuk}>Batal</Button>
              )}
            </>
          )}
          {keadaan !== KEADAAN.DIABAIKAN && !sunting && keadaan !== KEADAAN.DRAF && (
            <>
              <Button variant="outlined" onClick={() => { setSunting(true); setPesan(null); }}>Ubah lagi</Button>
              <Button variant="text" color="inherit" onClick={() => bukaKembali.mutate()} disabled={sibuk}>Buka kembali</Button>
            </>
          )}
        </Stack>
      )}

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography fontWeight={600}>Mengapa saran ini muncul?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography variant="body2">{`${entri.pola} ${POLA_INFO[entri.pola]?.judul ?? ''}. ${definisiPola(entri.pola, ctxPenjelasan.parameter)}`}</Typography>
            {kalimatBukti.length > 0 && (
              <>
                <Typography variant="body2" fontWeight={600}>Bukti dari data kelas ini</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {kalimatBukti.map((b) => <Typography key={b} component="li" variant="body2">{b}</Typography>)}
                </Box>
              </>
            )}
            <Typography variant="body2" color="text.secondary">
              {`Draf disusun otomatis dari bukti di atas memakai templat ${templatVersi}. Kalimat yang buktinya tidak ada tidak dibuat, dan kolomnya dibiarkan kosong. Penanda adalah peringatan dini, bukan diagnosis; sistem tidak mengetahui penyebabnya.`}
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {t && t.data_berubah && (
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
            <Typography fontWeight={600}>Draf sistem saat ini</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {KOLOM_SARAN.map((k) => (
                <Box key={k.kunci}>
                  <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                  <Typography variant="body2">{draf[k.kunci] || 'Tidak dibuat'}</Typography>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
}

KotakSaran.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  siswaId: PropTypes.number.isRequired,
  namaSiswa: PropTypes.string.isRequired,
  entri: PropTypes.object.isRequired,
  templatVersi: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
  hasilPola: PropTypes.object,
  ctxPenjelasan: PropTypes.object.isRequired,
  onCatatRemedial: PropTypes.func,
};

/**
 * Bagian "Saran tindak lanjut" pada profil siswa: satu tab per penanda yang aktif, empat kotak per tab.
 * Draf selalu dari server; yang disimpan hanyalah keputusan guru (dipakai atau diabaikan).
 */
export default function SaranTindakLanjut({
  kelasId, siswa, data, hasil, ctxPenjelasan, readOnly, onCatatRemedial,
}) {
  const daftar = useMemo(() => urutkanSaran(data.saran, URUTAN_PRIORITAS), [data.saran]);
  const [pilih, setPilih] = useState(null);
  const aktif = daftar.find((e) => e.pola === pilih) ?? daftar[0] ?? null;

  if (daftar.length === 0 && data.tidak_aktif.length === 0) {
    return (
      <Alert severity="info">
        Tidak ada penanda aktif untuk siswa ini, jadi sistem tidak menyusun saran. Ini bukan berarti siswa tidak butuh perhatian; sebagian penanda mungkin belum dapat dinilai karena datanya belum cukup.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {daftar.length > 0 && (
        <>
          <Tabs value={aktif.pola} onChange={(_, v) => setPilih(v)} variant="scrollable" scrollButtons="auto" aria-label="Saran per penanda">
            {daftar.map((e) => {
              const k = keadaanSaran(e);
              return (
                <Tab
                  key={e.pola}
                  value={e.pola}
                  id={`tab-saran-${e.pola}`}
                  aria-controls={`panel-saran-${e.pola}`}
                  sx={{ textTransform: 'none', alignItems: 'flex-start' }}
                  label={(
                    <Box sx={{ textAlign: 'left' }}>
                      <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>{`${e.pola} ${POLA_INFO[e.pola]?.judul ?? ''}`}</Box>
                      <Box component="span" sx={{ display: 'block', fontSize: 13 }}>{k === KEADAAN.DRAF ? 'Draf, belum dipakai' : LABEL_KEADAAN[k]}</Box>
                    </Box>
                  )}
                />
              );
            })}
          </Tabs>
          <Box role="tabpanel" id={`panel-saran-${aktif.pola}`} aria-labelledby={`tab-saran-${aktif.pola}`}>
            <KotakSaran
              key={aktif.pola}
              kelasId={kelasId}
              siswaId={siswa.id}
              namaSiswa={siswa.nama}
              entri={aktif}
              templatVersi={data.templat_versi}
              readOnly={readOnly}
              hasilPola={hasil?.pola?.[aktif.pola]}
              ctxPenjelasan={ctxPenjelasan}
              onCatatRemedial={onCatatRemedial}
            />
          </Box>
        </>
      )}

      {data.tidak_aktif.length > 0 && (
        <Alert severity="info" icon={false}>
          <Typography variant="body2" fontWeight={600} gutterBottom>Keputusan lama untuk penanda yang kini tidak aktif</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Data kelas berubah sehingga penanda berikut tidak lagi memenuhi aturan. Keputusan Anda tetap tersimpan dan tidak dibuang.
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {data.tidak_aktif.map((x) => (
              <Typography key={x.pola} component="li" variant="body2">
                {`${x.pola} ${POLA_INFO[x.pola]?.judul ?? ''}: ${x.tersimpan.status === 'DIABAIKAN' ? `diabaikan (${x.tersimpan.alasan_abai})` : `dipakai, langkah: ${x.tersimpan.akhir?.langkah ?? ''}`}`}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}
    </Stack>
  );
}

SaranTindakLanjut.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  siswa: PropTypes.shape({ id: PropTypes.number.isRequired, nama: PropTypes.string.isRequired }).isRequired,
  data: PropTypes.object.isRequired,
  hasil: PropTypes.object,
  ctxPenjelasan: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onCatatRemedial: PropTypes.func,
};
