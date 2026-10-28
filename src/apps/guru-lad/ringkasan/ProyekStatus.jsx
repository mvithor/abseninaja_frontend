import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KartuBagian from './KartuBagian';
import BatangSegmen from './BatangSegmen';
import { gayaTautan, isianProyek, warnaRingkasan } from './gayaRingkasan';
import { statusProyek } from './ringkasan';

function Legenda() {
  const w = warnaRingkasan(useTheme());
  return (
    <Box component="ul" aria-label="Keterangan pola batang proyek" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 12 }}>
      {[['dinilai', 'Dinilai'], ['nol', 'Bernilai 0'], ['kosong', 'Belum diisi']].map(([kunci, nama]) => (
        <Box component="li" key={kunci} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: w.ink }}>
          <Box component="span" aria-hidden="true" sx={{ width: 22, height: 12, borderRadius: '2px', ...isianProyek(w, kunci) }} />
          {nama}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Status proyek individu: dinilai, bernilai 0 (tidak dikumpulkan), dan belum diisi. Sel kosong BUKAN nol; hanya
 * nilai 0 yang dihitung tidak dikumpulkan, sama dengan aturan pola Proyek tidak dikumpulkan.
 */
export default function ProyekStatus({ data, onBukaProyek }) {
  const w = warnaRingkasan(useTheme());
  const daftar = useMemo(() => statusProyek(data.proyek), [data.proyek]);
  return (
    <KartuBagian id="proyek-individu" judul="Proyek individu" keterangan="Nilai 0 dihitung sebagai tidak dikumpulkan.">
      {daftar.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: w.sekunder }}>
          Belum ada proyek individu. Pola Proyek tidak dikumpulkan baru bisa dinilai setelah ada.
        </Typography>
      ) : (
        <>
          {daftar.map((p) => (
            <Box key={p.proyek} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: w.ink }}>{p.nama}</Typography>
              <BatangSegmen segmen={p.segmen} isian={(s) => isianProyek(w, s.kunci)} tinggi={26} label={p.aria} />
              <Typography sx={{ fontSize: 13, color: w.sekunder }}>{p.ket}</Typography>
            </Box>
          ))}
          <Legenda />
        </>
      )}
      <Box component="button" type="button" onClick={onBukaProyek} sx={gayaTautan(w)}>Buka proyek</Box>
    </KartuBagian>
  );
}

ProyekStatus.propTypes = { data: PropTypes.object.isRequired, onBukaProyek: PropTypes.func.isRequired };
