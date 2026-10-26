import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress, FormControlLabel,
  Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import { bacaEvaluasi, kunciLad, pesanGalat } from '../api';
import {
  KODE_POLA, POLA_INFO, alasanBelumCukup, barisKonteks, dataDibutuhkan, definisiPola, hitungRingkasan,
  namaTp, susunSiswa, uraikanBukti,
} from './penjelasan';
import { cariTpId } from '../remedial/remedial';

const WARNA_POLA = { perhatian: 'warning', pengayaan: 'info' };

function ChipPola({ kode, jumlah, ...sisa }) {
  const info = POLA_INFO[kode];
  return (
    <Chip
      size="small"
      color={WARNA_POLA[info.jenis]}
      label={jumlah === undefined ? `${kode} ${info.judul}` : `${kode} ${info.judul} (${jumlah})`}
      {...sisa}
    />
  );
}
ChipPola.propTypes = { kode: PropTypes.string.isRequired, jumlah: PropTypes.number };

function DaftarBukti({ baris }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {baris.map((b) => (
        <Typography key={b} component="li" variant="body2" sx={{ mb: 0.25 }}>{b}</Typography>
      ))}
    </Box>
  );
}
DaftarBukti.propTypes = { baris: PropTypes.arrayOf(PropTypes.string).isRequired };

function BarisSiswa({
  h, ctx, ambilBelumCukup, onCatatRemedial,
}) {
  const belum = KODE_POLA.filter((k) => h.pola[k].status === 'BELUM_CUKUP');
  return (
    <Accordion disableGutters variant="outlined" slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary expandIcon={<IconChevronDown size={18} />} aria-label={`Rincian ${h.nama}`}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 28, textAlign: 'right' }}>{h.urutan}</Typography>
          <Typography fontWeight={600} sx={{ minWidth: 180 }}>{h.nama}</Typography>
          {h.penanda.length === 0
            ? <Typography variant="body2" color="text.secondary">Tidak ada penanda</Typography>
            : h.penanda.map((k) => <ChipPola key={k} kode={k} />)}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {h.penanda.map((k) => (
            <Box key={k}>
              <Typography variant="subtitle2" gutterBottom>{`${k} ${POLA_INFO[k].judul}`}</Typography>
              <DaftarBukti baris={uraikanBukti(k, h.pola[k].bukti, ctx)} />
              {k === 'P1' && onCatatRemedial && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {(h.pola.P1.bukti?.tp ?? []).map((t) => {
                    const tpId = cariTpId(ctx.lm, t.lm, t.tp);
                    if (tpId === null) return null;
                    return (
                      <Button
                        key={`${t.lm}.${t.tp}`}
                        size="small"
                        variant="outlined"
                        onClick={() => onCatatRemedial({ siswaId: h.siswa_id, tpId })}
                        aria-label={`Catat remedial ${h.nama}, ${namaTp(t.lm, t.tp, ctx.lm)}`}
                      >
                        {`Catat remedial ${namaTp(t.lm, t.tp, ctx.lm)}`}
                      </Button>
                    );
                  })}
                </Stack>
              )}
            </Box>
          ))}
          {belum.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Belum dapat dinilai</Typography>
              <DaftarBukti baris={belum.map((k) => `${k} ${POLA_INFO[k].judul}: ${h.pola[k].alasan || `butuh ${ambilBelumCukup(k)}`}`)} />
            </Box>
          )}
          {h.penanda.length === 0 && belum.length === 0 && (
            <Typography variant="body2" color="text.secondary">Semua aturan sudah dinilai dan tidak ada yang memicu penanda.</Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
BarisSiswa.propTypes = {
  h: PropTypes.object.isRequired,
  ctx: PropTypes.object.isRequired,
  ambilBelumCukup: PropTypes.func.isRequired,
  onCatatRemedial: PropTypes.func,
};

export default function EvaluasiPanel({ kelasId, lm, onCatatRemedial }) {
  const [hanyaDitandai, setHanyaDitandai] = useState(true);
  const [pola, setPola] = useState([]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: kunciLad.evaluasi(kelasId),
    queryFn: () => bacaEvaluasi(kelasId),
    retry: false,
  });

  const ctx = useMemo(() => ({ lm, parameter: data?.parameter ?? {} }), [lm, data]);
  const ringkasan = useMemo(() => (data ? hitungRingkasan(data) : null), [data]);
  const daftar = useMemo(() => (data ? susunSiswa(data.hasil, { hanyaDitandai, pola }) : []), [data, hanyaDitandai, pola]);
  const konteks = useMemo(() => (data ? barisKonteks(data.konteks_kelas, lm) : []), [data, lm]);

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

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Penanda adalah peringatan dini yang dihitung dari data kelas ini, bukan diagnosis. Keputusan tetap pada guru.
        Hasil dihitung ulang setiap kali data berubah. Aturan versi {data.aturan_versi}.
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
        <Typography fontWeight={600} gutterBottom>
          {`${ringkasan.ditandai} dari ${ringkasan.jumlahSiswa} siswa memiliki penanda`}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="group" aria-label="Saring menurut penanda">
          {KODE_POLA.map((k) => (
            <ChipPola
              key={k}
              kode={k}
              jumlah={ringkasan.perPola[k]}
              variant={pola.includes(k) ? 'filled' : 'outlined'}
              onClick={() => gantiPola(k)}
              aria-pressed={pola.includes(k)}
            />
          ))}
          {pola.length > 0 && <Button size="small" onClick={() => setPola([])}>Hapus saringan</Button>}
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

      <FormControlLabel
        control={<Switch checked={!hanyaDitandai} onChange={(e) => setHanyaDitandai(!e.target.checked)} />}
        label="Tampilkan juga siswa tanpa penanda"
      />

      {daftar.length === 0 ? (
        <Alert severity="info">
          {pola.length > 0
            ? 'Tidak ada siswa dengan penanda yang dipilih.'
            : 'Tidak ada siswa yang memenuhi aturan penanda saat ini.'}
        </Alert>
      ) : (
        <Stack spacing={1} aria-label="Daftar siswa" role="list">
          {daftar.map((h) => (
            <Box key={h.siswa_id} role="listitem">
              <BarisSiswa h={h} ctx={ctx} ambilBelumCukup={(k) => dataDibutuhkan(k, data.parameter)} onCatatRemedial={onCatatRemedial} />
            </Box>
          ))}
        </Stack>
      )}

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
          <Typography fontWeight={600}>Pembanding kelas (dipakai oleh penanda Capaian menurun)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {konteks.length === 0 ? (
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
                {konteks.map((r) => (
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
    </Stack>
  );
}

EvaluasiPanel.propTypes = {
  kelasId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  lm: PropTypes.array.isRequired,
  onCatatRemedial: PropTypes.func,
};
