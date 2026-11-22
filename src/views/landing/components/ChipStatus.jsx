import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconClock, IconFlask } from '@tabler/icons-react';
import { DAFTAR_CHIP, labelChip } from '../lib/fitur.js';
import { chipStatus, radius } from '../theme/tokens';

// Chip status fitur: hanya dua, Uji terbatas dan Segera. Fitur yang sudah berjalan
// tampil tanpa chip, jadi tidak ada status "berjalan". Kedua status dibedakan lewat
// kecerahan (isi biru tua vs amber terang), ikon (labu vs jam), dan teks, bukan
// warna saja. Sudut 6, tinggi 26.
//  varian="gelap" : untuk blok gelap. Hanya berpengaruh pada Uji terbatas, yang
//                   memakai isi transparan dengan tepi putih (Segera tetap amber).
// Nilai warna ada di theme/tokens.js (chipStatus), label di lib/fitur.js (STATUS_CHIP).
const IKON = { 'uji-terbatas': IconFlask, segera: IconClock };

export default function ChipStatus({ status, varian = 'terang', sx }) {
  const label = labelChip(status);
  if (label === '') return null;
  const kunci = varian === 'gelap' && status === 'uji-terbatas' ? 'uji-terbatas-gelap' : status;
  const gaya = chipStatus[kunci];
  const Ikon = IKON[status];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: chipStatus.tinggi,
        px: '10px',
        boxSizing: 'border-box',
        borderRadius: radius.tag,
        background: gaya.bg,
        border: `1px solid ${gaya.garis}`,
        color: gaya.ink,
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      <Ikon size={14} stroke={2.2} aria-hidden="true" style={{ flex: 'none' }} />
      {label}
    </Box>
  );
}

ChipStatus.propTypes = {
  status: PropTypes.oneOf(DAFTAR_CHIP).isRequired,
  varian: PropTypes.oneOf(['terang', 'gelap']),
  sx: PropTypes.object,
};
