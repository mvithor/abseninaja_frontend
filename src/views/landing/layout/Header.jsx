import { useEffect, useId, useRef, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import DropdownPanel from './DropdownPanel';
import TautanNav from './TautanNav';
import LogoMerek from '../components/LogoMerek';
import TombolLanding from '../components/TombolLanding';
import { AKSI_DEMO, AKSI_MASUK, MENU } from '../data/nav';
import { colors, flags, gerak, layout, radius } from '../theme/tokens';
import { resetTautan, resetTombol } from '../theme/sx';
import { adaRuteAktif } from './rute';

// Header: logo, menu (Beranda, Produk, Bukti, Tentang Kami, Blog) dan aksi
// Masuk + Demo Gratis. Menu desktop hanya dari md ke atas. Di bawah md header
// hanya memuat logo; Demo ada di slot tengah bar tab bawah dan Masuk di lembar Lainnya.
const sxItemNav = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minHeight: layout.targetSentuh,
  boxSizing: 'border-box',
  px: '14px',
  py: '10px',
  borderRadius: radius.navItem,
  fontSize: '14px',
  fontWeight: 500,
  color: colors.ink,
  '&:hover': { background: colors.tintSoft },
};

const sxItemAktif = { color: colors.accent, fontWeight: 600 };

function GrupDropdown({ grup, terbuka, onToggle, onTutup, fokusPertama, onFokusPertamaSelesai }) {
  const idPanel = useId();
  const pembungkus = useRef(null);
  const tombol = useRef(null);
  const { pathname } = useLocation();
  const adaAktif = adaRuteAktif(grup.anak.map((a) => a.to), pathname);

  const daftarTautan = () => Array.from(pembungkus.current?.querySelectorAll('a[href]') ?? []);

  useEffect(() => {
    if (terbuka && fokusPertama) {
      Array.from(pembungkus.current?.querySelectorAll('a[href]') ?? [])[0]?.focus();
      onFokusPertamaSelesai();
    }
  }, [terbuka, fokusPertama, onFokusPertamaSelesai]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && terbuka) {
      e.stopPropagation();
      onTutup();
      tombol.current?.focus();
      return;
    }
    if (e.target === tombol.current) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onToggle({ fokusPertama: true, paksaBuka: true });
      }
      return;
    }
    const tautan = daftarTautan();
    const i = tautan.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); tautan[(i + 1) % tautan.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i <= 0 ? tombol.current : tautan[i - 1])?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); tautan[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); tautan[tautan.length - 1]?.focus(); }
  };

  return (
    <Box
      ref={pembungkus}
      component="li"
      sx={{ position: 'relative' }}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (terbuka && !e.currentTarget.contains(e.relatedTarget)) onTutup();
      }}
    >
      <Box
        ref={tombol}
        component="button"
        type="button"
        aria-expanded={terbuka}
        aria-controls={terbuka ? idPanel : undefined}
        onClick={() => onToggle({})}
        sx={{
          ...resetTombol,
          ...sxItemNav,
          ...(adaAktif ? sxItemAktif : null),
          ...(terbuka ? { background: colors.tintSoft } : null),
        }}
      >
        {grup.label}
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            transform: terbuka ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${gerak.cepat} ease`,
          }}
        >
          <IconChevronDown size={14} stroke={2.4} />
        </Box>
      </Box>
      {terbuka && <DropdownPanel id={idPanel} label={grup.label} butir={grup.anak} onPilih={onTutup} />}
    </Box>
  );
}

export default function Header() {
  const [terbukaKey, setTerbukaKey] = useState(null);
  const [fokusPertama, setFokusPertama] = useState(false);
  const navRef = useRef(null);

  // Tutup saat klik di luar menu atau tekan Esc (Esc dari luar panel).
  useEffect(() => {
    if (!terbukaKey) return undefined;
    const onPointerDown = (e) => {
      if (!navRef.current?.contains(e.target)) setTerbukaKey(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setTerbukaKey(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [terbukaKey]);

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        zIndex: layout.zHeader,
        background: colors.white,
        borderBottom: `1px solid ${colors.borderSoft}`,
      }}
    >
      <Box
        sx={{
          maxWidth: layout.lebarKonten,
          mx: 'auto',
          px: layout.padX,
          boxSizing: 'border-box',
          height: layout.tinggiHeader,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          aria-label="Absenin Aja, beranda"
          sx={{ ...resetTautan, display: 'inline-flex', alignItems: 'center', minHeight: layout.targetSentuh, flex: 'none' }}
        >
          <LogoMerek />
        </Box>

        <Box
          component="nav"
          ref={navRef}
          aria-label="Navigasi utama"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {MENU.map((m) =>
              m.anak ? (
                <GrupDropdown
                  key={m.key}
                  grup={m}
                  terbuka={terbukaKey === m.key}
                  onToggle={({ fokusPertama: fp = false, paksaBuka = false }) => {
                    setFokusPertama(fp);
                    setTerbukaKey((k) => (k === m.key && !paksaBuka ? null : m.key));
                  }}
                  onTutup={() => setTerbukaKey(null)}
                  fokusPertama={fokusPertama}
                  onFokusPertamaSelesai={() => setFokusPertama(false)}
                />
              ) : (
                <li key={m.key}>
                  <TautanNav butir={m} sx={sxItemNav} sxAktif={sxItemAktif} sxNonaktif={{ color: colors.disabled, '&:hover': { background: 'none' } }} />
                </li>
              ),
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 'none' }}>
          <TombolLanding
            varian="garis"
            ukuran="md"
            to={AKSI_MASUK.to}
            nonaktif={!AKSI_MASUK.tersedia}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            {AKSI_MASUK.label}
          </TombolLanding>
          <TombolLanding
            varian="gradasi"
            ukuran="md"
            to={AKSI_DEMO.to}
            nonaktif={!(AKSI_DEMO.tersedia || flags.pratinjauTombolAktif)}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            {AKSI_DEMO.label}
          </TombolLanding>
        </Box>
      </Box>
    </Box>
  );
}
