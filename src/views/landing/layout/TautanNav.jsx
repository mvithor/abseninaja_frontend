import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { IconArrowUpRight } from '@tabler/icons-react';
import SegeraHadir from '../components/SegeraHadir';
import { hanyaPembaca, resetTautan } from '../theme/sx';
import { ruteAktif } from './rute';

// Satu butir menu dalam tiga keadaan:
//  - tersedia: false  -> teks nonaktif (role=link, aria-disabled), tidak menavigasi
//  - href/external    -> <a> biasa (tab baru bila external)
//  - to               -> RouterLink, aria-current="page" bila rute sedang aktif
// `sx` berlaku untuk semua keadaan, `sxAktif` untuk rute aktif, `sxNonaktif`
// untuk butir tidak tersedia.
export default function TautanNav({ butir, onKlik, sx, sxAktif, sxNonaktif, tanpaIkonLuar = false, children, ...rest }) {
  const { pathname } = useLocation();
  const isi = children ?? butir.label;

  if (!butir.tersedia) {
    return (
      <Box component="span" role="link" aria-disabled="true" sx={{ ...resetTautan, cursor: 'default', ...sx, ...sxNonaktif }} {...rest}>
        {isi}
        <SegeraHadir />
      </Box>
    );
  }

  if (butir.href) {
    return (
      <Box
        component="a"
        href={butir.href}
        onClick={onKlik}
        {...(butir.external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        sx={{ ...resetTautan, ...sx }}
        {...rest}
      >
        {isi}
        {butir.external && !tanpaIkonLuar && (
          <>
            <IconArrowUpRight size={16} stroke={2} aria-hidden="true" style={{ flex: 'none' }} />
            <Box component="span" sx={hanyaPembaca}>
              (buka di tab baru)
            </Box>
          </>
        )}
      </Box>
    );
  }

  const aktif = ruteAktif(butir.to, pathname);
  return (
    <Box
      component={RouterLink}
      to={butir.to}
      onClick={onKlik}
      aria-current={aktif ? 'page' : undefined}
      sx={{ ...resetTautan, ...sx, ...(aktif ? sxAktif : null) }}
      {...rest}
    >
      {isi}
    </Box>
  );
}

TautanNav.propTypes = {
  butir: PropTypes.shape({
    label: PropTypes.string,
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    tersedia: PropTypes.bool,
  }).isRequired,
  onKlik: PropTypes.func,
  sx: PropTypes.object,
  sxAktif: PropTypes.object,
  sxNonaktif: PropTypes.object,
  tanpaIkonLuar: PropTypes.bool,
  children: PropTypes.node,
};
