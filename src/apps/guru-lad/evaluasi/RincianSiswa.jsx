import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Alert, Box, ButtonBase, Button, Chip, Divider, Drawer, IconButton, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import PilKode from './PilKode';
import DeretKehadiran from '../komponen/DeretKehadiran';
import { ringkasPanelP2 } from '../kehadiran/kehadiran';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { tampilAngka } from '../rentang';

const LEBAR_PANEL = 520;
// Isi panel selebar 472 px dan satu kotak kehadiran 38 px + jarak 6 px: sepuluh kotak muat satu baris. Bila pertemuan
// lebih banyak, panel hanya memuat sepuluh yang terakhir; deret lengkap per bulan ada di profil siswa.
const MAKS_KOTAK_PANEL = 10;
const DUA_BARIS = {
  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
};

function Kalimat({ baris }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, borderRadius: 0 }}>
      {baris.map((b) => <Typography key={b} component="li" variant="body1" sx={{ mb: 0.75 }}>{b}</Typography>)}
    </Box>
  );
}
Kalimat.propTypes = { baris: PropTypes.arrayOf(PropTypes.string).isRequired };

/**
 * Satu TP penanda P1: kode, LM, dan nilai di baris atas; rumusan TP di bawahnya, dipotong dua baris. Dipilih untuk
 * membaca rumusan lengkap dan kalimat buktinya (nilai, rentang, remedial). Remedial tidak dicatat dari panel ini.
 */
function KartuTp({ r, kalimat }) {
  const [buka, setBuka] = useState(false);
  return (
    <ButtonBase
      component="button"
      type="button"
      onClick={() => setBuka((v) => !v)}
      aria-expanded={buka}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.5, textAlign: 'left', width: '100%',
        border: 1, borderColor: 'divider', borderRadius: 1, px: 1.5, py: 1.25, font: 'inherit',
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1.5}>
        <Typography component="span" variant="body1" sx={{ fontWeight: 600 }}>
          {r.label}
          <Typography component="span" variant="body1" color="text.secondary">{` · LM ${r.lmNo}`}</Typography>
        </Typography>
        <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.0625rem', color: (t) => warnaRingkasan(t).galat }}>{tampilAngka(r.nilai)}</Typography>
      </Stack>
      <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: r.rumusan ? 'normal' : 'italic', ...(buka ? {} : DUA_BARIS) }}
      >
        {r.rumusan ?? 'Rumusan TP belum diisi guru.'}
      </Typography>
      {buka && <Typography component="span" variant="body2">{kalimat}</Typography>}
      {r.tersembunyi && <Chip size="small" variant="outlined" label="Tidak terlihat dari rata-rata" sx={{ alignSelf: 'flex-start', borderRadius: '6px' }} />}
    </ButtonBase>
  );
}
KartuTp.propTypes = { r: PropTypes.object.isRequired, kalimat: PropTypes.string.isRequired };

function BagianP1({ b, siswaId }) {
  return (
    <Stack spacing={1}>
      {b.baris.map((r, i) => <KartuTp key={`${siswaId}:${r.kunci}`} r={r} kalimat={b.kalimat[i]} />)}
      <Typography variant="body2" color="text.secondary">Pilih satu TP untuk membaca rumusan lengkap dan buktinya.</Typography>
      {b.catatan.length > 0 && <Kalimat baris={b.catatan} />}
    </Stack>
  );
}
BagianP1.propTypes = { b: PropTypes.object.isRequired, siswaId: PropTypes.number.isRequired };

/**
 * Bagian P2. Pertemuan sampai MAKS_KOTAK_PANEL ditampilkan semua. Lebih dari itu panel memuat rincian alpa per bulan
 * dan pertemuan terakhir saja, dengan tautan ke deret lengkap di profil, supaya panel tidak memanjang.
 */
function BagianP2({ b, siswaId, onBukaProfil }) {
  const r = useMemo(() => ringkasPanelP2(b.deret, MAKS_KOTAK_PANEL), [b.deret]);
  if (!r.dipotong) {
    return (
      <>
        <DeretKehadiran deret={r.tampil} />
        <Kalimat baris={b.kalimat} />
      </>
    );
  }
  return (
    <>
      <Kalimat baris={b.kalimat} />
      <Typography variant="body2" color="text.secondary">
        {`Alpa per bulan: ${r.perBulan.map((x) => `${x.label} ${x.alpa}`).join(', ')}`}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {`${r.tampil.length} pertemuan terakhir${r.rentang ? ` (${r.rentang})` : ''}`}
      </Typography>
      <DeretKehadiran deret={r.tampil} label={`Kehadiran ${r.tampil.length} pertemuan terakhir`} />
      {onBukaProfil && (
        <Link component="button" type="button" underline="always" onClick={() => onBukaProfil(siswaId)} sx={{ alignSelf: 'flex-start', textAlign: 'left', py: 1, font: 'inherit', fontSize: '1rem' }}>
          {`Lihat seluruh ${r.total} pertemuan di profil`}
        </Link>
      )}
    </>
  );
}
BagianP2.propTypes = { b: PropTypes.object.isRequired, siswaId: PropTypes.number.isRequired, onBukaProfil: PropTypes.func };

/** P4 di panel: angka siswa dan kelas per LM dalam tabel. Garis tren lengkap ada di profil siswa. */
function TabelP4({ deret }) {
  const adaKelas = deret.some((d) => d.kelas !== null);
  return (
    <Table size="small" aria-label="Nilai rata-rata per LM, murid dan kelas">
      <TableHead>
        <TableRow>
          <TableCell><span aria-hidden="true">&nbsp;</span></TableCell>
          {deret.map((d) => <TableCell key={d.lm} align="center">{`LM ${d.lm}`}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>Murid ini</TableCell>
          {deret.map((d, i) => (
            <TableCell key={d.lm} align="center" sx={i === deret.length - 1 ? { fontWeight: 700, color: (t) => warnaRingkasan(t).galat } : undefined}>{tampilAngka(d.siswa)}</TableCell>
          ))}
        </TableRow>
        {adaKelas && (
          <TableRow>
            <TableCell color="text.secondary">Rata-rata kelas</TableCell>
            {deret.map((d) => <TableCell key={d.lm} align="center">{d.kelas === null ? '-' : tampilAngka(d.kelas)}</TableCell>)}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
TabelP4.propTypes = { deret: PropTypes.array.isRequired };

/**
 * Panel rincian satu siswa. Panel geser dari kanan yang TIDAK mendorong matriks dan tidak menggelapkan layar,
 * jadi guru tetap dapat membaca matriks dan berpindah siswa dengan satu klik. Esc menutup; fokus pindah ke
 * judul saat dibuka dan kembali ke nama siswa saat ditutup.
 */
export default function RincianSiswa({ rincian, onTutup, onBukaProfil }) {
  const tinggiTopbar = useSelector((s) => s.customizer?.TopbarHeight) ?? 70;
  const judulRef = useRef(null);
  const siswaId = rincian ? rincian.siswaId : null;
  const terakhirRef = useRef(null);

  useEffect(() => {
    if (siswaId === null) return;
    terakhirRef.current = siswaId;
    judulRef.current?.focus();
  }, [siswaId]);

  const tutup = () => {
    const id = terakhirRef.current;
    onTutup();
    // Setelah panel tertutup, kembalikan fokus ke nama siswa yang tadi dibuka.
    setTimeout(() => document.getElementById(`nama-siswa-${id}`)?.focus(), 0);
  };

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={rincian !== null}
      slotProps={{
        paper: {
          id: 'panel-rincian',
          role: 'region',
          'aria-label': rincian ? `Rincian ${rincian.nama}` : 'Rincian murid',
          onKeyDown: (e) => { if (e.key === 'Escape') { e.stopPropagation(); tutup(); } },
        },
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: LEBAR_PANEL },
          top: tinggiTopbar,
          height: `calc(100% - ${tinggiTopbar}px)`,
          boxShadow: (t) => t.shadows[8],
        },
      }}
    >
      {rincian && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ p: 3, pb: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">{`No absen ${rincian.urutan}`}</Typography>
                <Typography variant="h5" component="h2" ref={judulRef} tabIndex={-1} sx={{ outline: 'none', fontSize: '1.375rem', lineHeight: '1.875rem', fontWeight: 700 }}>{rincian.nama}</Typography>
              </Box>
              <IconButton aria-label="Tutup rincian" onClick={tutup}><IconX size={22} /></IconButton>
            </Stack>

            <Box sx={{ px: 3, pb: 2.5 }}>
              {rincian.bagian.length > 0 && (
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1.5 }}>
                  {rincian.bagian.map((b) => <PilKode key={b.kode} kode={b.kode} panjang />)}
                </Stack>
              )}
              {rincian.bagian.length > 1 && (
                <Typography variant="body2" color="text.secondary">
                  Beberapa penanda muncul bersamaan. Sistem tidak menyimpulkan hubungan di antaranya; keterkaitannya dinilai guru.
                </Typography>
              )}
              {rincian.bagian.length === 0 && rincian.belumCukup.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Semua aturan sudah dinilai dan tidak ada yang memicu penanda.
                </Typography>
              )}
            </Box>

            {rincian.bagian.map((b) => (
              <Box key={b.kode}>
                <Divider />
                <Stack spacing={1.5} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{`${b.kode} ${b.judul}`}</Typography>
                  {b.kode === 'P2' && <BagianP2 b={b} siswaId={rincian.siswaId} onBukaProfil={onBukaProfil} />}
                  {b.kode === 'P1' && <BagianP1 b={b} siswaId={rincian.siswaId} />}
                  {b.kode !== 'P1' && b.kode !== 'P2' && <Kalimat baris={b.kalimat} />}
                  {b.kode === 'P4' && b.deret.length > 0 && <TabelP4 deret={b.deret} />}
                </Stack>
              </Box>
            ))}

            {rincian.belumCukup.length > 0 && (
              <>
                <Divider />
                <Box sx={{ p: 3 }}>
                  <Alert severity="info">
                    <Typography variant="body2" fontWeight={600} gutterBottom>Belum dapat dinilai. Ini bukan berarti murid aman.</Typography>
                    <Kalimat baris={rincian.belumCukup.map((x) => `${x.kode} ${x.judul}: ${x.alasan || `butuh ${x.butuh}`}`)} />
                  </Alert>
                </Box>
              </>
            )}
          </Box>

          {onBukaProfil && (
            <Stack spacing={1} sx={{ flex: 'none', borderTop: 1, borderColor: 'divider', bgcolor: 'action.hover', px: 3, py: 2 }}>
              <Button variant="contained" fullWidth onClick={() => onBukaProfil(rincian.siswaId)}>
                {`Buka profil ${rincian.nama}`}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Panel hanya membaca data. Catat remedial dilakukan di profil, pada saran P1.
              </Typography>
            </Stack>
          )}
        </Box>
      )}
    </Drawer>
  );
}

RincianSiswa.propTypes = {
  rincian: PropTypes.object,
  onTutup: PropTypes.func.isRequired,
  onBukaProfil: PropTypes.func,
};
