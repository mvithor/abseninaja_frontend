import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import { colors, gradients, radius, shadows } from '../theme/tokens';
import { resetTombol, resetTautan } from '../theme/sx';
import SegeraHadir from './SegeraHadir';

// Tombol landing. Varian: gradasi, garis, kuning, putih (+ garisTerang untuk
// latar gelap). Ukuran: lg (52, seluler 48) dan md (44). Sudut 12.
// Elemen yang dirender: <a> (href), RouterLink (to), atau <button>. Bila
// `nonaktif`, tombol tautan menjadi teks nonaktif (aria-disabled) yang tidak
// menavigasi.
const varianSx = {
  gradasi: {
    background: gradients.brand,
    color: colors.white,
    boxShadow: shadows.tombol,
    '&:hover': { background: gradients.brandHover },
  },
  garis: {
    background: colors.white,
    border: `1px solid ${colors.outline}`,
    color: colors.accent,
    '&:hover': { background: colors.tintSoft },
  },
  kuning: {
    background: colors.yellow,
    color: colors.yellowInk,
    '&:hover': { background: colors.yellowHover },
  },
  putih: {
    background: colors.white,
    color: colors.accent,
    '&:hover': { background: colors.tintSoft },
  },
  garisTerang: {
    border: `1px solid ${colors.garisTerang}`,
    color: colors.white,
    '&:hover': { background: colors.glassHover },
  },
};

const ukuranSx = {
  lg: {
    height: { xs: 48, md: 52 },
    px: { xs: '22px', md: '28px' },
    fontSize: { xs: '14px', md: '15px' },
  },
  md: {
    height: 44,
    px: { xs: '20px', md: '24px' },
    fontSize: '14px',
  },
};

const nonaktifSx = {
  background: colors.disabledBg,
  color: colors.disabled,
  border: 0,
  boxShadow: 'none',
  cursor: 'default',
  '&:hover': { background: colors.disabledBg },
};

export default function TombolLanding({
  varian = 'gradasi',
  ukuran = 'lg',
  to,
  href,
  external = false,
  onClick,
  type = 'button',
  nonaktif = false,
  penuh = false,
  ikonAkhir,
  children,
  sx,
  ...rest
}) {
  const adalahTautan = Boolean(to || href);
  const dasar = {
    ...resetTombol,
    ...resetTautan,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxSizing: 'border-box',
    minWidth: 44,
    borderRadius: radius.tombol,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    width: penuh ? '100%' : undefined,
    ...ukuranSx[ukuran],
    ...varianSx[varian],
    ...(nonaktif ? nonaktifSx : null),
    ...sx,
  };

  const isi = (
    <>
      {children}
      {ikonAkhir}
    </>
  );

  if (nonaktif && adalahTautan) {
    return (
      <Box component="span" role="link" aria-disabled="true" sx={dasar} {...rest}>
        {isi}
        <SegeraHadir />
      </Box>
    );
  }
  if (to) {
    return (
      <Box component={RouterLink} to={to} onClick={onClick} sx={dasar} {...rest}>
        {isi}
      </Box>
    );
  }
  if (href) {
    return (
      <Box
        component="a"
        href={href}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        sx={dasar}
        {...rest}
      >
        {isi}
      </Box>
    );
  }
  return (
    <Box component="button" type={type} onClick={onClick} disabled={nonaktif} sx={dasar} {...rest}>
      {isi}
    </Box>
  );
}

TombolLanding.propTypes = {
  varian: PropTypes.oneOf(['gradasi', 'garis', 'kuning', 'putih', 'garisTerang']),
  ukuran: PropTypes.oneOf(['lg', 'md']),
  to: PropTypes.string,
  href: PropTypes.string,
  external: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  nonaktif: PropTypes.bool,
  penuh: PropTypes.bool,
  ikonAkhir: PropTypes.node,
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};
