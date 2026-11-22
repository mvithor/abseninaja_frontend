import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';
import TombolLanding from './TombolLanding';
import { hanyaPembaca } from '../theme/sx';

// Tombol tautan keluar yang dibuka di tab baru (F8): TombolLanding `external` (target
// _blank, rel noopener noreferrer), ikon panah keluar, dan teks pembaca layar
// "(buka di tab baru)". Dipakai tombol "Selengkapnya di Prakersa" (PanelPeran) dan
// "Buka Prakersa" (StripPrakersa). `children` = label tombol.
export default function TombolLuar({ href, varian = 'garis', children, sx }) {
  return (
    <TombolLanding
      varian={varian}
      href={href}
      external
      ikonAkhir={<IconArrowUpRight size={18} stroke={2.2} aria-hidden="true" />}
      sx={sx}
    >
      {children}
      <Box component="span" sx={hanyaPembaca}>
        {' '}
        (buka di tab baru)
      </Box>
    </TombolLanding>
  );
}

TombolLuar.propTypes = {
  href: PropTypes.string.isRequired,
  varian: PropTypes.oneOf(['gradasi', 'garis', 'kuning', 'putih', 'garisTerang']),
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};
