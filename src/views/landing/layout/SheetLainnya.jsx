import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import TautanNav from './TautanNav';
import TombolLanding from '../components/TombolLanding';
import { AKSI_MASUK, MENU, MENU_TAMBAHAN } from '../data/nav';
import { colors, gerak, layout, radius, shadows } from '../theme/tokens';
import { resetDaftar, resetTombol } from '../theme/sx';

// Lembar bawah "Lainnya" (seluler). Berisi seluruh menu: grup Produk, Bukti,
// Tentang Kami (akordeon), Blog, butir tambahan, dan Masuk. Duduk tepat di atas
// bar tab. Ditutup dengan: geser ke bawah pada gagang, ketuk di luar, tombol
// tutup, atau Esc. Gerak 260 ms, tanpa animasi bila prefers-reduced-motion
// (aturan global di LandingLayout).
const BATAS_GESER = 80;
const SELEKTOR_FOKUS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const sxBaris = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 52,
  px: '12px',
  borderRadius: radius.tombol,
  fontSize: '16px',
  fontWeight: 500,
  color: colors.ink,
};
const sxBarisAktif = { color: colors.accent, fontWeight: 600 };
const sxNonaktif = { color: colors.disabled };

export default function SheetLainnya({ id, terbuka, onTutup }) {
  const lembar = useRef(null);
  const tombolTutup = useRef(null);
  const geser = useRef({ awal: null, dy: 0 });
  const [grupBuka, setGrupBuka] = useState('produk');

  // Perilaku dialog modal selama terbuka: fokus pindah ke tombol Tutup, Tab
  // berputar di dalam lembar, Esc menutup, main dan footer di-inert, dan gulir
  // halaman dikunci. Semuanya dipulihkan saat ditutup (fokus dikembalikan ke
  // tombol Lainnya oleh BottomTabBar lewat onTutup(true)).
  useEffect(() => {
    if (!terbuka) return undefined;
    const el = lembar.current;
    tombolTutup.current?.focus({ preventScroll: true });

    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Hanya main dan footer milik landing (saudara lembar di akar layout).
    const luar = Array.from(el?.parentElement?.querySelectorAll('main, footer') ?? []);
    luar.forEach((n) => n.setAttribute('inert', ''));

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onTutup(true);
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const bisaFokus = Array.from(el.querySelectorAll(SELEKTOR_FOKUS));
      if (bisaFokus.length === 0) {
        e.preventDefault();
        return;
      }
      const pertama = bisaFokus[0];
      const terakhir = bisaFokus[bisaFokus.length - 1];
      const diDalam = el.contains(document.activeElement);
      if (e.shiftKey && (!diDalam || document.activeElement === pertama)) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && (!diDalam || document.activeElement === terakhir)) {
        e.preventDefault();
        pertama.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = sebelumnya;
      luar.forEach((n) => n.removeAttribute('inert'));
      document.removeEventListener('keydown', onKey);
    };
  }, [terbuka, onTutup]);

  const mulaiGeser = (e) => {
    geser.current = { awal: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const gerakGeser = (e) => {
    if (geser.current.awal === null) return;
    const dy = Math.max(0, e.clientY - geser.current.awal);
    geser.current.dy = dy;
    if (lembar.current) lembar.current.style.transform = `translateY(${dy}px)`;
  };
  const selesaiGeser = () => {
    if (geser.current.awal === null) return;
    const lewat = geser.current.dy > BATAS_GESER;
    geser.current = { awal: null, dy: 0 };
    if (lembar.current) lembar.current.style.transform = '';
    if (lewat) onTutup(true);
  };

  const tutupTanpaFokus = () => onTutup(false);
  const grupMenu = MENU.filter((m) => m.anak);
  const barisLain = [...MENU.filter((m) => !m.anak && m.key !== 'beranda'), ...MENU_TAMBAHAN];

  return (
    <>
      <Box
        aria-hidden="true"
        onClick={() => onTutup(true)}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          inset: 0,
          zIndex: layout.zScrim,
          background: colors.scrim,
          opacity: terbuka ? 1 : 0,
          visibility: terbuka ? 'visible' : 'hidden',
          transition: `opacity ${gerak.lembar} ease, visibility 0s linear ${terbuka ? '0s' : gerak.lembar}`,
        }}
      />
      <Box
        ref={lembar}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Menu lainnya"
        aria-hidden={!terbuka}
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: layout.tinggiBarTab,
          zIndex: layout.zLembar,
          maxHeight: `calc(100dvh - ${layout.tinggiBarTab} - 24px)`,
          boxSizing: 'border-box',
          px: '20px',
          pt: '10px',
          pb: '18px',
          background: colors.white,
          borderRadius: radius.lembar,
          boxShadow: shadows.lembar,
          transform: terbuka ? 'translateY(0)' : 'translateY(100%)',
          visibility: terbuka ? 'visible' : 'hidden',
          transition: `transform ${gerak.lembar} ${gerak.ease}, visibility 0s linear ${terbuka ? '0s' : gerak.lembar}`,
        }}
      >
        <Box
          onPointerDown={mulaiGeser}
          onPointerMove={gerakGeser}
          onPointerUp={selesaiGeser}
          onPointerCancel={selesaiGeser}
          sx={{ touchAction: 'none', cursor: 'grab' }}
        >
          <Box aria-hidden="true" sx={{ width: 40, height: 5, borderRadius: '3px', background: colors.outline, mx: 'auto', mb: '12px' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
            <Box component="p" sx={{ m: 0, fontSize: '18px', fontWeight: 600, color: colors.ink }}>
              Lainnya
            </Box>
            <Box
              ref={tombolTutup}
              component="button"
              type="button"
              aria-label="Tutup menu lainnya"
              onClick={() => onTutup(true)}
              onPointerDown={(e) => e.stopPropagation()}
              sx={{
                ...resetTombol,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                color: colors.muted,
              }}
            >
              <IconX size={22} stroke={2} />
            </Box>
          </Box>
        </Box>

        <Box component="nav" aria-label="Menu lainnya" sx={{ overflowY: 'auto', overscrollBehavior: 'contain', minHeight: 0 }}>
          <Box component="ul" sx={resetDaftar}>
            {grupMenu.map((g) => {
              const buka = grupBuka === g.key;
              const idSub = `${id}-${g.key}`;
              return (
                <Box component="li" key={g.key} sx={{ borderTop: `1px solid ${colors.borderSoft}` }}>
                  <Box
                    component="button"
                    type="button"
                    aria-expanded={buka}
                    aria-controls={buka ? idSub : undefined}
                    onClick={() => setGrupBuka(buka ? null : g.key)}
                    sx={{ ...resetTombol, ...sxBaris }}
                  >
                    {g.label}
                    <Box
                      component="span"
                      aria-hidden="true"
                      sx={{
                        display: 'inline-flex',
                        transform: buka ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: `transform ${gerak.cepat} ease`,
                      }}
                    >
                      <IconChevronDown size={20} stroke={2} />
                    </Box>
                  </Box>
                  {buka && (
                    <Box
                      component="ul"
                      id={idSub}
                      sx={{ ...resetDaftar, ml: '12px', pb: '10px', borderLeft: `2px solid ${colors.brand100}` }}
                    >
                      {g.anak.map((a) => (
                        <li key={a.label}>
                          <TautanNav
                            butir={a}
                            onKlik={tutupTanpaFokus}
                            sx={{ ...sxBaris, minHeight: 46, fontSize: '16px', fontWeight: 400, color: colors.body, borderRadius: radius.navItem }}
                            sxAktif={sxBarisAktif}
                            sxNonaktif={sxNonaktif}
                          />
                        </li>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
            {barisLain.map((b) => (
              <Box component="li" key={b.label} sx={{ borderTop: `1px solid ${colors.borderSoft}` }}>
                <TautanNav butir={b} onKlik={tutupTanpaFokus} sx={sxBaris} sxAktif={sxBarisAktif} sxNonaktif={sxNonaktif} />
              </Box>
            ))}
          </Box>
          <Box sx={{ pt: '16px' }}>
            <TombolLanding
              varian="garis"
              to={AKSI_MASUK.to}
              nonaktif={!AKSI_MASUK.tersedia}
              penuh
              onClick={tutupTanpaFokus}
            >
              {AKSI_MASUK.label}
            </TombolLanding>
          </Box>
        </Box>
      </Box>
    </>
  );
}

SheetLainnya.propTypes = {
  id: PropTypes.string.isRequired,
  terbuka: PropTypes.bool.isRequired,
  onTutup: PropTypes.func.isRequired, // (kembalikanFokus: boolean) => void
};
