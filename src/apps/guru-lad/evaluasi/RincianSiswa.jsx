import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  Alert, Box, Button, Chip, Divider, Drawer, IconButton, Stack, Typography,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import PilKode from './PilKode';
import DeretKehadiran from '../komponen/DeretKehadiran';
import GrafikTren from '../komponen/GrafikTren';

const LEBAR_PANEL = 440;

function Kalimat({ baris }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {baris.map((b) => <Typography key={b} component="li" variant="body2" sx={{ mb: 0.25 }}>{b}</Typography>)}
    </Box>
  );
}
Kalimat.propTypes = { baris: PropTypes.arrayOf(PropTypes.string).isRequired };

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
export default function RincianSiswa({ rincian, onTutup, onCatatRemedial, onBukaProfil }) {
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
            {onBukaProfil && (
              <Button variant="contained" size="small" sx={{ mb: 1.5 }} onClick={() => onBukaProfil(rincian.siswaId)}>
                Buka profil dan saran tindak lanjut
              </Button>
            )}
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
                {b.kode === 'P4' && <GrafikTren deret={b.deret} kktp={b.kktp} />}
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
  onBukaProfil: PropTypes.func,
};
