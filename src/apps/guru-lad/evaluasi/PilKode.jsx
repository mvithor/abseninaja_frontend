import PropTypes from 'prop-types';
import { Box, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { warnaRingkasan } from '../ringkasan/gayaRingkasan';
import { POLA_INFO } from './penjelasan';
import { sembunyi } from './gayaMatriks';

// Pil penanda. Warna hanya menegaskan; pembedanya tetap kode dan nama pola (NFR-06). Teks memakai warna
// teks biasa di atas latar warna lembut supaya kontrasnya aman, bukan teks warna peringatan di atas putih.
export default function PilKode({ kode, panjang = false, jumlah, ...sisa }) {
  const info = POLA_INFO[kode];
  const pengayaan = info?.jenis === 'pengayaan';
  const judul = info?.judul ?? '';
  let isi = kode;
  if (panjang) isi = jumlah === undefined ? `${kode} ${judul}` : `${kode} ${judul} (${jumlah})`;
  return (
    <Chip
      size="small"
      title={judul}
      label={panjang ? isi : (<>{kode}<Box component="span" sx={sembunyi}>{` ${judul}`}</Box></>)}
      sx={(theme) => {
        const w = warnaRingkasan(theme);
        const dasar = pengayaan ? w.pengayaan : theme.palette.warning.main;
        return {
          // Chip panjang boleh turun baris di layar sempit, supaya tidak terpotong di tepi kartu.
          ...(panjang ? { height: 'auto', maxWidth: '100%', minHeight: 26, '& .MuiChip-label': { whiteSpace: 'normal', py: '4px' } } : {}),
          borderRadius: '8px',
          fontWeight: 600,
          color: theme.palette.text.primary,
          backgroundColor: alpha(dasar, 0.22),
          '&.MuiChip-clickable:hover': { backgroundColor: alpha(dasar, 0.34) },
          // Saringan yang aktif: diisi warna primer dengan teks putih, seperti chip terpilih di desain; teks "Hapus
          // saringan" dan aria-pressed ikut menandai, bukan hanya warna.
          '&.pilih, &.pilih:hover': { backgroundColor: w.primer, color: '#fff' },
        };
      }}
      {...sisa}
    />
  );
}

PilKode.propTypes = {
  kode: PropTypes.string.isRequired,
  panjang: PropTypes.bool,
  jumlah: PropTypes.number,
};
