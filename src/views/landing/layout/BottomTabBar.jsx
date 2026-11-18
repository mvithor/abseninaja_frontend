import { useCallback, useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import {
  IconCalendarEvent,
  IconDots,
  IconHome,
  IconLayoutGrid,
  IconSchool,
} from '@tabler/icons-react';
import SheetLainnya from './SheetLainnya';
import { RUTE_LAINNYA, SLOT_BAR_TAB } from '../data/nav';
import { colors, flags, gerak, layout, radius, shadows, gradients } from '../theme/tokens';
import { resetTautan, resetTombol } from '../theme/sx';
import SegeraHadir from '../components/SegeraHadir';
import { adaRuteAktif, ruteAktif } from './rute';

// Bar tab bawah seluler (di bawah md). Lima slot sama lebar: Beranda, Fitur,
// Demo (kotak gradasi terangkat di tengah), Sekolah, Lainnya (membuka lembar).
// Tinggi 84 termasuk area aman. Slot aktif mengikuti rute (aria-current).
const IKON = {
  beranda: IconHome,
  fitur: IconLayoutGrid,
  demo: IconCalendarEvent,
  sekolah: IconSchool,
  lainnya: IconDots,
};

// Bar disembunyikan saat papan ketik muncul (visualViewport mengecil).
function useKeyboardTerbuka() {
  const [terbuka, setTerbuka] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const cek = () => setTerbuka(vv.scale <= 1.01 && window.innerHeight - vv.height > 150);
    vv.addEventListener('resize', cek);
    return () => vv.removeEventListener('resize', cek);
  }, []);
  return terbuka;
}

function IsiSlot({ slot, aktif }) {
  const Ikon = IKON[slot.key];
  const demo = slot.key === 'demo';
  return (
    <>
      {demo ? (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            mt: '-14px',
            borderRadius: radius.barTab,
            background: gradients.brand,
            color: colors.white,
            boxShadow: shadows.demoTab,
          }}
        >
          <Ikon size={22} stroke={2} />
        </Box>
      ) : (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 32,
            borderRadius: radius.tabItem,
            background: aktif ? colors.tint : 'transparent',
            transition: `background ${gerak.cepat} ease`,
          }}
        >
          <Ikon size={22} stroke={aktif ? 2.2 : 1.8} />
        </Box>
      )}
      {slot.label}
    </>
  );
}

IsiSlot.propTypes = {
  slot: PropTypes.shape({ key: PropTypes.string, label: PropTypes.string }).isRequired,
  aktif: PropTypes.bool,
};

export default function BottomTabBar() {
  const { pathname } = useLocation();
  const idLembar = useId();
  const tombolLainnya = useRef(null);
  const desktop = useMediaQuery((t) => t.breakpoints.up('md'));
  const keyboard = useKeyboardTerbuka();
  const [bukaLembar, setBukaLembar] = useState(false);
  const lembarTerbuka = bukaLembar && !desktop;

  // Tutup lembar saat rute berubah (tombol Kembali peramban) dan saat layar
  // menjadi desktop, supaya bukaLembar tidak tersisa true dan muncul lagi ketika
  // layar diputar kembali ke lebar seluler.
  useEffect(() => {
    setBukaLembar(false);
  }, [pathname, desktop]);

  const tutupLembar = useCallback((kembalikanFokus) => {
    setBukaLembar(false);
    if (kembalikanFokus) tombolLainnya.current?.focus();
  }, []);

  const sxSlot = (aktif, nonaktif) => ({
    ...resetTombol,
    ...resetTautan,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '2px',
    minHeight: 48,
    fontSize: '12px',
    fontWeight: aktif ? 600 : 500,
    lineHeight: 1.3,
    textAlign: 'center',
    color: nonaktif ? colors.disabled : aktif ? colors.accent : colors.muted,
    cursor: nonaktif ? 'default' : 'pointer',
  });

  return (
    <>
      <SheetLainnya id={idLembar} terbuka={lembarTerbuka} onTutup={tutupLembar} />
      <Box
        component="nav"
        aria-label="Navigasi utama"
        sx={{
          display: { xs: 'grid', md: 'none' },
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          alignItems: 'start',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: layout.zBarTab,
          height: layout.tinggiBarTab,
          boxSizing: 'border-box',
          pt: '8px',
          px: '8px',
          pb: 'env(safe-area-inset-bottom, 0px)',
          background: colors.white,
          borderTop: `1px solid ${colors.border}`,
          boxShadow: shadows.barTab,
          transform: keyboard ? 'translateY(100%)' : 'translateY(0)',
          visibility: keyboard ? 'hidden' : 'visible',
          transition: `transform ${gerak.lembar} ${gerak.ease}`,
        }}
      >
        {SLOT_BAR_TAB.map((slot) => {
          if (slot.key === 'lainnya') {
            const ruteDiLainnya = adaRuteAktif(RUTE_LAINNYA, pathname);
            const aktif = lembarTerbuka || ruteDiLainnya;
            return (
              <Box
                key={slot.key}
                ref={tombolLainnya}
                component="button"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={lembarTerbuka}
                aria-controls={idLembar}
                aria-current={ruteDiLainnya ? 'page' : undefined}
                onClick={() => (lembarTerbuka ? tutupLembar(true) : setBukaLembar(true))}
                sx={sxSlot(aktif, false)}
              >
                <IsiSlot slot={slot} aktif={aktif} />
              </Box>
            );
          }
          const aktif = !lembarTerbuka && ruteAktif(slot.to, pathname);
          // Di DEV (pratinjau) slot ber-`to` yang belum tersedia tetap aktif menuju HalamanSegera.
          if (!(slot.tersedia || (flags.pratinjauTombolAktif && slot.to))) {
            return (
              <Box key={slot.key} component="span" role="link" aria-disabled="true" sx={sxSlot(false, true)}>
                <IsiSlot slot={slot} aktif={false} />
                <SegeraHadir />
              </Box>
            );
          }
          return (
            <Box
              key={slot.key}
              component={RouterLink}
              to={slot.to}
              aria-current={aktif ? 'page' : undefined}
              onClick={() => setBukaLembar(false)}
              sx={sxSlot(aktif, false)}
            >
              <IsiSlot slot={slot} aktif={aktif} />
            </Box>
          );
        })}
      </Box>
    </>
  );
}
