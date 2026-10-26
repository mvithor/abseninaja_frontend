import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, CircularProgress, Collapse,
  FormControlLabel, Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import { bacaEvaluasi, kunciLad, pesanGalat } from '../api';
import IkonRentang from '../komponen/IkonRentang';
import { legendaRentang } from '../rentang';
import {
  KODE_POLA, POLA_INFO, alasanBelumCukup, barisKonteks, dataDibutuhkan, definisiPola, hitungGolongan, hitungRingkasan,
} from './penjelasan';
import {
  MODE_URUT, bagiGolongan, siapkanKonteks, susunKolom, susunRincian,
} from './matriks';
import MatriksPerhatian from './MatriksPerhatian';
import RincianSiswa from './RincianSiswa';
import PilKode from './PilKode';

/**
 * Tab Perlu Perhatian: matriks siswa dan capaian dengan penanda di sampingnya, dan panel rincian satu siswa.
 * Keputusan penanda sepenuhnya dari server; panel ini hanya menyusun tampilan dari `evaluasi` dan data
 * kelas yang sudah dimuat halaman (`nilaiTp`, `proyek`, `kehadiran`, dan seterusnya).
 */
export default function EvaluasiPanel({
  kelasId, kelas, siswa, lm, nilaiTp, proyek, nilaiProyek, remedial, pertemuan, kehadiran, onCatatRemedial,
}) {
  const [tampilTanpa, setTampilTanpa] = useState(false);
  const [pola, setPola] = useState([]);
  const [urut, setUrut] = useState(MODE_URUT.PRIORITAS);
  const [terpilihId, setTerpilihId] = useState(null);
  const [legenda, setLegenda] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: kunciLad.evaluasi(kelasId),
    queryFn: () => bacaEvaluasi(kelasId),
    retry: false,
  });

  const ctx = useMemo(() => ({ lm, parameter: data?.parameter ?? {} }), [lm, data]);
  const ringkasan = useMemo(() => (data ? hitungRingkasan(data) : null), [data]);
  const golongan = useMemo(() => (data ? hitungGolongan(data.hasil) : null), [data]);
  const bagi = useMemo(() => (data ? bagiGolongan(data.hasil, { pola, urut }) : null), [data, pola, urut]);
  const konteks = useMemo(
    () => siapkanKonteks({ nilaiTp, nilaiProyek, remedial, kehadiran, pertemuan, siswa }),
    [nilaiTp, nilaiProyek, remedial, kehadiran, pertemuan, siswa],
  );
  const kolom = useMemo(() => susunKolom(lm, proyek), [lm, proyek]);
  const semuaSiswaId = useMemo(() => siswa.map((s) => s.id), [siswa]);
  const konteksKelas = useMemo(() => (data ? barisKonteks(data.konteks_kelas, lm) : []), [data, lm]);
  const legendaBaris = useMemo(() => legendaRentang(kelas), [kelas]);

  const hasilTerpilih = useMemo(
    () => (data && terpilihId !== null ? data.hasil.find((h) => h.siswa_id === terpilihId) ?? null : null),
    [data, terpilihId],
  );
  const rincian = useMemo(
    () => (hasilTerpilih ? susunRincian(hasilTerpilih, ctx, konteks, Number(kelas.kktp)) : null),
    [hasilTerpilih, ctx, konteks, kelas.kktp],
  );

  // Siswa yang sedang dibuka bisa hilang (dihapus, atau data dimuat ulang); tutup panelnya.
  useEffect(() => {
    if (data && terpilihId !== null && !hasilTerpilih) setTerpilihId(null);
  }, [data, terpilihId, hasilTerpilih]);

  const bukaSiswa = useCallback((id) => setTerpilihId(id), []);
  const tutupRincian = useCallback(() => setTerpilihId(null), []);

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={() => refetch()} disabled={isFetching}>Coba lagi</Button>}>
        {pesanGalat(error, 'Evaluasi kelas belum dapat dimuat.')}
      </Alert>
    );
  }

  const gantiPola = (kode) => setPola((prev) => (prev.includes(kode) ? prev.filter((k) => k !== kode) : [...prev, kode]));
  const belumCukup = KODE_POLA.filter((k) => ringkasan.belumCukup[k] > 0);
  const adaBaris = bagi.perhatian.length + bagi.pengayaan.length + (tampilTanpa ? bagi.tanpa.length : 0) > 0;
  const ambang = { ambang_bagian: kelas.ambang_bagian, kktp: kelas.kktp, ambang_pengayaan: kelas.ambang_pengayaan };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Penanda adalah peringatan dini dari data kelas ini, bukan diagnosis; keputusan tetap pada guru.
        Klik nama siswa untuk melihat alasan dan buktinya. Aturan versi {data.aturan_versi}, dihitung ulang setiap data berubah.
      </Typography>

      {data.struktur_kosong && (
        <Alert severity="info">Kelas ini belum memiliki lingkup materi dan TP, jadi belum ada yang dapat dievaluasi.</Alert>
      )}
      {ringkasan.jumlahGalat > 0 && (
        <Alert severity="warning">
          {`${ringkasan.jumlahGalat} siswa tidak dapat dievaluasi karena datanya bermasalah. Mereka tidak berarti aman: `}
          {data.galat.slice(0, 5).map((g) => g.nama ?? `ID ${g.siswa_id}`).join(', ')}
          {ringkasan.jumlahGalat > 5 ? ', dan lainnya.' : '.'}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Typography fontWeight={600}>
              {`${ringkasan.ditandai} dari ${ringkasan.jumlahSiswa} siswa memiliki penanda`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`${golongan.perhatian} perlu perhatian · ${golongan.pengayaan} peluang pengayaan · ${golongan.tanpa} tanpa penanda`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="group" aria-label="Saring menurut penanda">
            {KODE_POLA.map((k) => (
              <PilKode
                key={k}
                kode={k}
                panjang
                jumlah={ringkasan.perPola[k]}
                className={pola.includes(k) ? 'pilih' : undefined}
                onClick={() => gantiPola(k)}
                aria-pressed={pola.includes(k)}
              />
            ))}
            {pola.length > 0 && <Button size="small" onClick={() => setPola([])}>Hapus saringan</Button>}
          </Stack>
        </Stack>
      </Paper>

      {belumCukup.length > 0 && (
        <Alert severity="info">
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Sebagian penanda belum dapat dinilai karena datanya belum cukup. Ini bukan berarti siswa aman.
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {belumCukup.map((k) => (
              <Typography key={k} component="li" variant="body2">
                {`${k} ${POLA_INFO[k].judul}: ${ringkasan.belumCukup[k]} siswa. Dibutuhkan ${dataDibutuhkan(k, data.parameter)}.`}
                {alasanBelumCukup(data.hasil, k) ? ` Alasan tersering: ${alasanBelumCukup(data.hasil, k)}` : ''}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
        <FormControlLabel
          control={<Switch checked={tampilTanpa} onChange={(e) => setTampilTanpa(e.target.checked)} />}
          label={`Tampilkan juga ${golongan.tanpa} siswa tanpa penanda`}
        />
        <Button size="small" onClick={() => setLegenda((v) => !v)} aria-expanded={legenda} aria-controls="legenda-rentang">
          Arti ikon dan warna sel
        </Button>
      </Stack>
      <Collapse in={legenda} unmountOnExit>
        <Paper variant="outlined" sx={{ p: 2 }} id="legenda-rentang">
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {legendaBaris.map((l) => (
              <Stack key={l.rentang} direction="row" spacing={1} alignItems="center">
                <IkonRentang rentang={l.rentang} teksBaca={false} />
                <Typography variant="body2">{`${l.batas}: ${l.teks}`}</Typography>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Setiap sel adalah nilai TP yang sebenarnya, bukan nilai remedial; tanda R menunjukkan ada remedial.
            Titik tengah (·) berarti belum dinilai, bukan nol. Sel berbingkai tebal adalah TP yang menjadi bukti Kesulitan pada TP.
          </Typography>
        </Paper>
      </Collapse>

      {!adaBaris ? (
        <Alert severity="info">
          {pola.length > 0
            ? 'Tidak ada siswa dengan penanda yang dipilih.'
            : 'Tidak ada siswa yang memenuhi aturan penanda saat ini.'}
        </Alert>
      ) : (
        <MatriksPerhatian
          bagi={bagi}
          kolom={kolom}
          konteks={konteks}
          ambang={ambang}
          kktp={kelas.kktp}
          semuaSiswaId={semuaSiswaId}
          urut={urut}
          onUrut={setUrut}
          terpilihId={terpilihId}
          onBuka={bukaSiswa}
          tampilTanpa={tampilTanpa}
        />
      )}

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography fontWeight={600}>Pembanding kelas (dipakai oleh penanda Capaian menurun)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {konteksKelas.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Belum ada lingkup materi yang terhitung pada kelas ini.</Typography>
          ) : (
            <Table size="small" aria-label="Rata-rata kelas per lingkup materi">
              <TableHead>
                <TableRow>
                  <TableCell>Lingkup materi</TableCell>
                  <TableCell align="right">Siswa terhitung</TableCell>
                  <TableCell align="right">Rata-rata kelas</TableCell>
                  <TableCell>Dipakai sebagai pembanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {konteksKelas.map((r) => (
                  <TableRow key={r.lm}>
                    <TableCell>{r.nama}</TableCell>
                    <TableCell align="right">{r.jumlahSiswa}</TableCell>
                    <TableCell align="right">{r.rata}</TableCell>
                    <TableCell>{r.dipakai ? 'Ya' : `Tidak (kurang dari ${data.parameter.kelas_min} siswa)`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography fontWeight={600}>Aturan yang dipakai</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.5}>
            {KODE_POLA.map((k) => (
              <Box key={k}>
                <Typography variant="subtitle2">{`${k} ${POLA_INFO[k].judul}`}</Typography>
                <Typography variant="body2" color="text.secondary">{definisiPola(k, data.parameter)}</Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <RincianSiswa rincian={rincian} onTutup={tutupRincian} onCatatRemedial={onCatatRemedial} />
    </Stack>
  );
}

EvaluasiPanel.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  kelas: PropTypes.object.isRequired,
  siswa: PropTypes.array.isRequired,
  lm: PropTypes.array.isRequired,
  nilaiTp: PropTypes.array.isRequired,
  proyek: PropTypes.array.isRequired,
  nilaiProyek: PropTypes.array.isRequired,
  remedial: PropTypes.array.isRequired,
  pertemuan: PropTypes.array.isRequired,
  kehadiran: PropTypes.array.isRequired,
  onCatatRemedial: PropTypes.func,
};
