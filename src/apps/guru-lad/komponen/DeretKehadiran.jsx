import PropTypes from 'prop-types';
import { Box, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { TEKS_KODE } from '../kehadiran/kehadiran';
import { sembunyi } from '../evaluasi/gayaMatriks';

// Deret kehadiran satu siswa per pertemuan. Kode huruf menjadi pembeda utama (NFR-06); warna hanya menegaskan.
// Kotak putus-putus "-" berarti belum dicatat, bukan alpa.
export default function DeretKehadiran({ deret }) {
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
