import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import DeretKehadiran from './DeretKehadiran';
import { kelompokBulan } from '../kehadiran/kehadiran';

const LEBAR_LABEL = 150;

/**
 * Deret kehadiran satu siswa yang dikelompokkan per bulan: satu baris per bulan, label bulan di kiri. Deret tidak
 * digeser ke samping dan tidak direset tiap bulan; bulan baru menambah satu baris di bawah dan baris lama tidak
 * berubah. Pengelompokan hanya cara membaca. Hitungan penanda tetap atas seluruh pertemuan tercatat.
 * Bila tidak ada satu pun tanggal nyata, deret ditampilkan datar seperti biasa.
 */
export default function DeretKehadiranBulan({ deret }) {
  const kelompok = useMemo(() => kelompokBulan(deret), [deret]);
  if (kelompok.length === 0 || (kelompok.length === 1 && kelompok[0].kunci === '')) return <DeretKehadiran deret={deret} />;

  return (
    <Stack spacing={1.5} role="group" aria-label="Kehadiran per pertemuan, dikelompokkan per bulan">
      {kelompok.map((g, i) => {
        const ringkas = g.tercatat === g.jumlah ? `${g.alpa} alpa dari ${g.jumlah}` : `${g.alpa} alpa dari ${g.tercatat} tercatat`;
        return (
          <Stack
            key={g.kunci || 'tanpa-tanggal'}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.75, sm: 2 }}
            alignItems={{ sm: 'center' }}
            sx={i > 0 ? { borderTop: 1, borderColor: 'divider', pt: 1.5 } : undefined}
          >
            <Box sx={{ flex: 'none', width: { sm: LEBAR_LABEL }, borderRadius: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{g.label}</Typography>
              <Typography variant="body2" color="text.secondary">{ringkas}</Typography>
            </Box>
            <DeretKehadiran deret={g.deret} label={`Kehadiran ${g.label}, ${ringkas}`} />
          </Stack>
        );
      })}
    </Stack>
  );
}

DeretKehadiranBulan.propTypes = { deret: PropTypes.array.isRequired };
