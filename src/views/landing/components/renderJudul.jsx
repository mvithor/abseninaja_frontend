import { Fragment } from 'react';
import { Box } from '@mui/material';
import { colors } from '../theme/tokens';

// Pecah teks judul: bagian yang diapit tanda bintang menjadi kata berwarna.
// Contoh: 'Semua tercatat di *satu sistem*'. Warna kata mengikuti aksen
// (#4B49CF di latar terang, kuning di latar gelap). Selain string dikembalikan apa adanya.
export function renderJudul(teks, gelap = false) {
  if (typeof teks !== 'string') return teks;
  return teks.split(/(\*[^*]+\*)/g).map((bagian, i) => {
    if (bagian.startsWith('*') && bagian.endsWith('*') && bagian.length > 2) {
      return (
        <Box key={i} component="em" sx={{ fontStyle: 'normal', color: gelap ? colors.yellow : colors.accent }}>
          {bagian.slice(1, -1)}
        </Box>
      );
    }
    return <Fragment key={i}>{bagian}</Fragment>;
  });
}
