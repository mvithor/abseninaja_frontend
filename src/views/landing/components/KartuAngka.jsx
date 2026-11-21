import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, huruf, radius, shadows } from '../theme/tokens';

// Kartu angka halaman Bukti: angka besar berupa teks, di bawahnya label. Dipakai
// di dalam <li>. Varian (`varian`):
//  kaca   : di latar gelap (ringkasan Dampak); ada ruang penanda verifikasi di
//           bawah label (sesuai desain, kosong bila penanda mati)
//  terang : kartu putih di latar terang (hero Sekolah Mitra)
export default function KartuAngka({ angka, label, varian = 'kaca', verifikasi }) {
  const kaca = varian === 'kaca';
  return (
    <Box
      sx={{
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'left',
        ...(kaca
          ? {
              p: { xs: '26px 20px', md: '28px 26px' },
              borderRadius: radius.kartuBesar,
              background: colors.glass,
              border: `1px solid ${colors.glassLine}`,
            }
          : {
              p: '22px 24px',
              borderRadius: radius.kartuSedang,
              background: colors.white,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.kartu,
            }),
      }}
    >
      <Box sx={{ color: kaca ? colors.white : colors.ink, ...(kaca ? huruf.angkaRingkasan : huruf.angkaMitra) }}>{angka}</Box>
      <Box
        sx={{
          mt: kaca ? '8px' : '6px',
          fontSize: kaca ? '14px' : '13px',
          color: kaca ? colors.onDarkSoft : colors.muted,
        }}
      >
        {label}
      </Box>
      {kaca ? (
        <Box sx={{ mt: '12px' }}>
          <PenandaVerifikasi verifikasi={verifikasi} />
        </Box>
      ) : (
        <PenandaVerifikasi verifikasi={verifikasi} sx={{ mt: '8px' }} />
      )}
    </Box>
  );
}

KartuAngka.propTypes = {
  angka: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  varian: PropTypes.oneOf(['kaca', 'terang']),
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
