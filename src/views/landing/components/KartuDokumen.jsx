import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';
import KotakIkon from './KotakIkon';
import PenandaVerifikasi from './PenandaVerifikasi';
import { colors, radius, shadows } from '../theme/tokens';
import { resetTautan } from '../theme/sx';

// Kartu dokumen legalitas (desain Keamanan dan Legalitas): kotak ikon, nama
// dokumen, nomor, dan panah di kanan. Dipakai di dalam <li>. Bila `to` ada,
// seluruh kartu menjadi tautan; bila tidak, kartu statis (panah tetap tampil
// sesuai desain tetapi tidak menavigasi, dan disembunyikan dari pembaca layar).
// Panah pada kartu tanpa tautan bersifat sementara: ia ada mengikuti desain
// sampai dokumennya tersedia dan kartu bisa ditautkan.
export default function KartuDokumen({ ikon, judul, nomor, to, verifikasi }) {
  const tautan = Boolean(to);
  return (
    <Box
      component={tautan ? RouterLink : 'div'}
      to={tautan ? to : undefined}
      sx={{
        ...resetTautan,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: 44,
        p: '20px 22px',
        borderRadius: radius.kartu,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
        ...(tautan ? { '&:hover': { background: colors.tintSoft } } : null),
      }}
    >
      <KotakIkon ikon={ikon} ukuran={48} ikonUkuran={22} sudut="14px" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{judul}</Box>
        <Box sx={{ mt: '2px', fontSize: '13px', color: colors.muted }}>{nomor}</Box>
        <PenandaVerifikasi verifikasi={verifikasi} sx={{ mt: '8px' }} />
      </Box>
      <Box aria-hidden="true" component="span" sx={{ display: 'inline-flex', color: colors.accent }}>
        <IconArrowUpRight size={18} stroke={2.2} />
      </Box>
    </Box>
  );
}

KartuDokumen.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  judul: PropTypes.string.isRequired,
  nomor: PropTypes.string.isRequired,
  to: PropTypes.string,
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
