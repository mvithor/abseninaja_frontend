import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TautanNav from './TautanNav';
import { colors, layout, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Panel dropdown menu desktop (Dropdown.dc.html): lebar 250, sudut 14, bayangan
// menu, butir sudut 8, butir sorot #F3F3FE dengan teks #3C3AAB.
// `statis` menampilkan panel di alur dokumen (untuk halaman uji).
const sorot = { background: colors.tintSoft, color: colors.brand700 };

const sxButir = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  minHeight: layout.targetSentuh,
  boxSizing: 'border-box',
  px: '12px',
  py: '11px',
  borderRadius: radius.menuItem,
  fontSize: '15px',
  lineHeight: 1.3,
  color: colors.ink,
  '&:hover': sorot,
  '&:focus-visible': sorot,
};

export default function DropdownPanel({ id, label, butir, onPilih, statis = false, sorotanIndeks = -1, sx }) {
  return (
    <Box
      id={id}
      role="group"
      aria-label={label}
      // Dapat difokus lewat klik (bukan lewat Tab): mengeklik padding panel atau
      // butir nonaktif memindahkan fokus ke panel, bukan keluar dari grup, sehingga
      // onBlur di Header tidak menutup panel.
      tabIndex={-1}
      sx={{
        '&:focus': { outline: 'none' },
        ...(statis
          ? { position: 'relative' }
          : { position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: layout.zHeader + 1 }),
        width: 250,
        maxWidth: 'calc(100vw - 40px)',
        boxSizing: 'border-box',
        p: '8px',
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.panelMenu,
        boxShadow: shadows.menu,
        ...sx,
      }}
    >
      <Box component="ul" role="list" sx={resetDaftar}>
        {butir.map((b, i) => (
          <Box component="li" key={b.label}>
            <TautanNav
              butir={b}
              onKlik={onPilih}
              sx={{ ...sxButir, ...(i === sorotanIndeks ? sorot : null) }}
              sxAktif={sorot}
              sxNonaktif={{ color: colors.disabled, '&:hover': { background: 'none', color: colors.disabled } }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

DropdownPanel.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  butir: PropTypes.array.isRequired,
  onPilih: PropTypes.func,
  statis: PropTypes.bool,
  sorotanIndeks: PropTypes.number,
  sx: PropTypes.object,
};
