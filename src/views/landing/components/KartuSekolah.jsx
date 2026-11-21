import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconSchool } from '@tabler/icons-react';
import { colors, radius } from '../theme/tokens';

// Butir kisi sekolah mitra (desain Sekolah Mitra, di latar gelap): kotak ikon
// peraga (bukan logo sekolah sungguhan), nama sekolah, dan jenjang serta
// wilayah. Dipakai di dalam <li>. `peraga` (bawaan true) memberi garis putus
// seperti desain sebagai tanda logo dan izin tampil belum ada; setel false
// (garis penuh) saat data nyata dan izin sekolah sudah lengkap.
export default function KartuSekolah({ nama, jenjang, wilayah, peraga = true }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxSizing: 'border-box',
        height: '100%',
        textAlign: 'left',
        p: '16px 18px',
        borderRadius: radius.kartu,
        background: colors.glass,
        border: `1px ${peraga ? 'dashed' : 'solid'} ${peraga ? colors.garisPutusKaca : colors.glassLine}`,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 46,
          height: 46,
          flex: 'none',
          borderRadius: '14px',
          background: colors.glassKotak,
          color: colors.white,
        }}
      >
        <IconSchool size={22} stroke={1.9} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: '14px', fontWeight: 600, color: colors.white }}>{nama}</Box>
        <Box sx={{ mt: '2px', fontSize: '12px', color: colors.onDark }}>
          {jenjang} · {wilayah}
        </Box>
      </Box>
    </Box>
  );
}

KartuSekolah.propTypes = {
  nama: PropTypes.string.isRequired,
  jenjang: PropTypes.string.isRequired,
  wilayah: PropTypes.string.isRequired,
  peraga: PropTypes.bool,
};
