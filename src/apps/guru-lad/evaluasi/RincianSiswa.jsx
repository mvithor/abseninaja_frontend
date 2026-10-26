import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Alert, Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { IconX } from '@tabler/icons-react';
import { tampilAngka } from '../rentang';
import { TEKS_KODE } from '../kehadiran/kehadiran';
import PilKode from './PilKode';
import { sembunyi } from './gayaMatriks';

const LEBAR_PANEL = 440;

function Kalimat({ baris }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {baris.map((b) => <Typography key={b} component="li" variant="body2" sx={{ mb: 0.25 }}>{b}</Typography>)}
    </Box>
  );
}
Kalimat.propTypes = { baris: PropTypes.arrayOf(PropTypes.string).isRequired };

function DeretKehadiran({ deret }) {
  const theme = useTheme();
  const gaya = (kode) => {
    if (kode === 'A') {
      return { bgcolor: alpha(theme.palette.error.main, 0.3), color: theme.palette.text.primary, border: `2px solid ${theme.palette.error.main}`, fontWeight: 800 };
    }
    if (kode === null) return { border: `1px dashed ${theme.palette.text.secondary}`, color: theme.palette.text.secondary };
    if (kode === 'H') return { border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.grey[100] };
    return { border: `1px solid ${theme.palette.warning.main}`, bgcolor: alpha(theme.palette.warning.main, 0.2) };
  };
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5} role="list" aria-label="Kehadiran per pertemuan">
      {deret.map((d) => (
        <Box
          key={d.nomor}
          role="listitem"
          title={`Pertemuan ${d.nomor}: ${d.kode ? TEKS_KODE[d.kode] : 'belum dicatat'}`}
          sx={{
            width: 28, height: 28, borderRadius: 0.75, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, ...gaya(d.kode),
          }}
        >
          <span aria-hidden="true">{d.kode ?? '-'}</span>
          <Box component="span" sx={sembunyi}>{`Pertemuan ${d.nomor}: ${d.kode ? TEKS_KODE[d.kode] : 'belum dicatat'}`}</Box>
        </Box>
      ))}
    </Stack>
  );
}
DeretKehadiran.propTypes = { deret: PropTypes.array.isRequired };

function GrafikP4({ g }) {
  const theme = useTheme();
  if (!g) return null;
  const garis = (titik) => titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ');
  const tick = [g.min, g.maks];
  return (
    <Box>
      <svg viewBox={`0 0 ${g.lebar} ${g.tinggi}`} width="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
        {tick.map((v) => (
          <g key={v}>
            <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.petakY(v)} y2={g.petakY(v)} stroke={theme.palette.divider} />
            <text x={g.kiri - 6} y={g.petakY(v) + 4} textAnchor="end" fontSize="10" fill={theme.palette.text.secondary}>{v}</text>
          </g>
        ))}
        {g.yKktp !== null && (
          <line x1={g.kiri} x2={g.lebar - g.kanan} y1={g.yKktp} y2={g.yKktp} stroke={theme.palette.error.main} strokeDasharray="4 4" />
        )}
        {g.kelas && <polyline points={garis(g.kelas)} fill="none" stroke={theme.palette.grey[600]} strokeWidth="2" />}
        <polyline points={garis(g.siswa)} fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" />
        {g.siswa.map((t) => (
          <g key={t.lm}>
            <circle cx={t.x} cy={t.y} r="4" fill={theme.palette.primary.main} />
            <text x={t.x} y={t.y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill={theme.palette.text.primary}>{tampilAngka(Math.round(t.nilai * 10) / 10)}</text>
            <text x={t.x} y={g.tinggi - 6} textAnchor="middle" fontSize="10" fill={theme.palette.text.secondary}>{`LM ${t.lm}`}</text>
          </g>
        ))}
      </svg>
      <Stack direction="row" spacing={2} sx={{ mt: 0.5, fontSize: 12 }} flexWrap="wrap" useFlexGap>
        <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'primary.main', verticalAlign: 'middle', mr: 0.75 }} />Siswa</Box>
        {g.kelas && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, height: 3, bgcolor: 'grey.600', verticalAlign: 'middle', mr: 0.75 }} />Rata-rata kelas</Box>}
        {g.yKktp !== null && <Box component="span"><Box component="span" sx={{ display: 'inline-block', width: 18, borderTop: '2px dashed', borderColor: 'error.main', verticalAlign: 'middle', mr: 0.75 }} />KKTP</Box>}
      </Stack>
    </Box>
  );
}
GrafikP4.propTypes = { g: PropTypes.object };

function BagianP1({ b, namaSiswa, onCatatRemedial }) {
  return (
    <Stack spacing={1}>
      {b.baris.map((r, i) => (
        <Stack
          key={r.kunci}
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2">{b.kalimat[i]}</Typography>
            {r.tersembunyi && <Chip size="small" variant="outlined" label="Tidak terlihat dari rata-rata" sx={{ mt: 0.5 }} />}
          </Box>
          {onCatatRemedial && r.tpId !== null && (
            <Button
              size="small"
              variant="outlined"
              sx={{ flex: 'none' }}
              onClick={() => onCatatRemedial({ siswaId: b.siswaId, tpId: r.tpId })}
              aria-label={`Catat remedial ${namaSiswa}, ${r.nama}`}
            >
              Catat remedial
            </Button>
          )}
        </Stack>
      ))}
      {b.catatan.length > 0 && <Kalimat baris={b.catatan} />}
    </Stack>
  );
}
BagianP1.propTypes = { b: PropTypes.object.isRequired, namaSiswa: PropTypes.string.isRequired, onCatatRemedial: PropTypes.func };

/**
 * Panel rincian satu siswa. Panel geser dari kanan yang TIDAK mendorong matriks dan tidak menggelapkan layar,
 * jadi guru tetap dapat membaca matriks dan berpindah siswa dengan satu klik. Esc menutup; fokus pindah ke
 * judul saat dibuka dan kembali ke nama siswa saat ditutup.
 */
export default function RincianSiswa({ rincian, onTutup, onCatatRemedial }) {
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
          'aria-label': rincian ? `Rincian ${rincian.nama}` : 'Rincian siswa',
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
        <Box sx={{ overflowY: 'auto', height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ p: 2.5, pb: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">{`No absen ${rincian.urutan}`}</Typography>
              <Typography variant="h5" component="h2" ref={judulRef} tabIndex={-1} sx={{ outline: 'none' }}>{rincian.nama}</Typography>
            </Box>
            <IconButton aria-label="Tutup rincian" onClick={tutup} size="small"><IconX size={18} /></IconButton>
          </Stack>

          <Box sx={{ px: 2.5, pb: 2 }}>
            {rincian.bagian.length > 0 && (
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 1 }}>
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
              <Stack spacing={1.25} sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>{`${b.kode} ${b.judul}`}</Typography>
                {b.kode === 'P2' && <DeretKehadiran deret={b.deret} />}
                {b.kode === 'P1'
                  ? <BagianP1 b={{ ...b, siswaId: rincian.siswaId }} namaSiswa={rincian.nama} onCatatRemedial={onCatatRemedial} />
                  : <Kalimat baris={b.kalimat} />}
                {b.kode === 'P4' && <GrafikP4 g={b.grafik} />}
              </Stack>
            </Box>
          ))}

          {rincian.belumCukup.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Alert severity="info" icon={false}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>Belum dapat dinilai. Ini bukan berarti siswa aman.</Typography>
                  <Kalimat baris={rincian.belumCukup.map((x) => `${x.kode} ${x.judul}: ${x.alasan || `butuh ${x.butuh}`}`)} />
                </Alert>
              </Box>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
}

RincianSiswa.propTypes = {
  rincian: PropTypes.object,
  onTutup: PropTypes.func.isRequired,
  onCatatRemedial: PropTypes.func,
};
