import PropTypes from 'prop-types';
import { Box, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { POLA_INFO } from './penjelasan';
import { sembunyi } from './gayaMatriks';

// Pil penanda. Warna hanya menegaskan; pembedanya tetap kode dan nama pola (NFR-06). Teks memakai warna
// teks biasa di atas latar warna lembut supaya kontrasnya aman, bukan teks warna peringatan di atas putih.
export default function PilKode({ kode, panjang = false, jumlah, ...sisa }) {
  const info = POLA_INFO[kode];
  const warna = info?.jenis === 'pengayaan' ? 'info' : 'warning';
  const judul = info?.judul ?? '';
  let isi = kode;
  if (panjang) isi = jumlah === undefined ? `${kode} ${judul}` : `${kode} ${judul} (${jumlah})`;
  return (
    <Chip
      size="small"
      title={judul}
      label={panjang ? isi : (<>{kode}<Box component="span" sx={sembunyi}>{` ${judul}`}</Box></>)}
      sx={(theme) => ({
        fontWeight: 600,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette[warna].main}`,
        backgroundColor: alpha(theme.palette[warna].main, 0.2),
        '&.MuiChip-clickable:hover': { backgroundColor: alpha(theme.palette[warna].main, 0.32) },
        '&.pilih': { backgroundColor: alpha(theme.palette[warna].main, 0.55) },
      })}
      {...sisa}
    />
  );
}

PilKode.propTypes = {
  kode: PropTypes.string.isRequired,
  panjang: PropTypes.bool,
  jumlah: PropTypes.number,
};
