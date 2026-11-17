import { useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, gradients, radius, shadows } from '../theme/tokens';
import { resetTombol, tanpaScrollbar } from '../theme/sx';
import { idTab } from './idTab';

// Bar tab gradasi (tablist). Aktif: kotak putih bertulisan merek. Di seluler
// bar bisa digeser ke samping. Navigasi papan ketik: panah kiri dan kanan,
// Home, End (roving tabindex). Id tab = `${idDasar}-tab-${id}`; bila panel perlu
// aria-labelledby, berikan idDasar dari luar (useId) dan pakai idTab().
export default function BarTabGradasi({ tab, aktif, onUbah, label, idPanel, idDasar, sx }) {
  const refs = useRef([]);
  const idSendiri = useId();
  const dasar = idDasar ?? idSendiri;
  // Bila `aktif` tidak ada di daftar, tab pertama tetap bisa dicapai dengan Tab.
  const adaAktif = tab.some((t) => t.id === aktif);

  const pindah = (indeks) => {
    const n = (indeks + tab.length) % tab.length;
    onUbah(tab[n].id);
    refs.current[n]?.focus();
  };

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); pindah(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pindah(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); pindah(0); }
    else if (e.key === 'End') { e.preventDefault(); pindah(tab.length - 1); }
  };

  return (
    <Box
      role="tablist"
      aria-label={label}
      sx={{
        display: 'flex',
        gap: '6px',
        p: '8px',
        overflowX: 'auto',
        background: gradients.brand,
        borderRadius: radius.barTab,
        boxShadow: shadows.tabGradasi,
        ...tanpaScrollbar,
        ...sx,
      }}
    >
      {tab.map((t, i) => {
        const on = t.id === aktif;
        return (
          <Box
            key={t.id}
            component="button"
            type="button"
            role="tab"
            id={idTab(dasar, t.id)}
            aria-selected={on}
            aria-controls={idPanel}
            tabIndex={on || (!adaAktif && i === 0) ? 0 : -1}
            ref={(el) => { refs.current[i] = el; }}
            onClick={() => onUbah(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            sx={{
              ...resetTombol,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flex: { xs: 'none', md: 1 },
              height: 48,
              px: '20px',
              borderRadius: radius.tombol,
              background: on ? colors.white : 'transparent',
              color: on ? colors.accent : colors.white,
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              '&:hover': { background: on ? colors.white : colors.tabGelapHover },
            }}
          >
            {t.label}
            {t.jumlah !== undefined && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  height: 22,
                  px: '8px',
                  borderRadius: radius.tag,
                  background: on ? colors.tint : colors.tabGelapJumlah,
                  color: on ? colors.accent : colors.white,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {t.jumlah}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

BarTabGradasi.propTypes = {
  tab: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      jumlah: PropTypes.number,
    }),
  ).isRequired,
  aktif: PropTypes.string.isRequired,
  onUbah: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  idPanel: PropTypes.string,
  idDasar: PropTypes.string,
  sx: PropTypes.object,
};
