import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { IconListDetails, IconX } from '@tabler/icons-react';
import TombolLanding from '../../components/TombolLanding';
import { propsAksi } from '../../data/aksi';
import { colors, gradients, layout, radius, shadows } from '../../theme/tokens';
import { resetDaftar, resetTautan, resetTombol } from '../../theme/sx';
import { MQ_REL } from './gaya';

// Tombol bulat navigasi jangkar (di bawah 1280 px, termasuk seluler dan tablet).
// Lingkaran 52 px di kiri bawah (di atas bar tab bawah di bawah md), jadi tidak
// bertabrakan dengan tombol ke atas di kanan. Klik membuka panel kecil di
// atasnya: lima tautan jangkar dan tombol "Minta Akun". Bukan dialog modal:
// tidak ada jebakan fokus dan halaman tetap bisa digulir. Panel menutup saat
// memilih tautan, Esc (fokus kembali ke tombol), klik di luar, fokus berpindah
// ke luar, atau klik tombol lagi. Animasi masuk hanya bila tidak prefers-reduced-motion.
// Di 1280 px ke atas komponen ini display none (yang tampil rel).
const masuk = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const sxTautan = (aktif) => ({
  ...resetTautan,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  minHeight: layout.targetSentuh,
  boxSizing: 'border-box',
  px: '14px',
  py: '10px',
  borderRadius: radius.navItem,
  fontSize: '14px',
  fontWeight: aktif ? 600 : 500,
  color: aktif ? colors.accent : colors.ink,
  background: aktif ? colors.tint : 'transparent',
  '&::before': aktif
    ? { content: '""', position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '3px', borderRadius: '2px', background: colors.accent }
    : undefined,
  '&:hover': { background: aktif ? colors.tint : colors.tintSoft },
});

export default function FabJangkar({ tautan, label, labelTombol, aksi, aktif }) {
  const idPanel = useId();
  const [buka, setBuka] = useState(false);
  const wadah = useRef(null);
  const tombol = useRef(null);

  useEffect(() => {
    if (!buka) return undefined;
    const onPointerDown = (e) => {
      if (!wadah.current?.contains(e.target)) setBuka(false);
    };
    const onFocusIn = (e) => {
      if (!wadah.current?.contains(e.target)) setBuka(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setBuka(false);
        tombol.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKey);
    };
  }, [buka]);

  const Ikon = buka ? IconX : IconListDetails;

  return (
    <Box
      ref={wadah}
      sx={{
        display: 'block',
        [MQ_REL]: { display: 'none' },
        position: 'fixed',
        left: { xs: '16px', md: '28px' },
        bottom: { xs: `calc(${layout.tinggiBarTab} + 16px)`, md: '16px' },
        zIndex: layout.zHeader - 1, // di atas konten, di bawah header dan lembar Lainnya
      }}
    >
      <Box
        ref={tombol}
        component="button"
        type="button"
        aria-label={labelTombol}
        aria-expanded={buka}
        aria-controls={buka ? idPanel : undefined}
        onClick={() => setBuka((b) => !b)}
        sx={{
          ...resetTombol,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: gradients.brand,
          color: colors.white,
          boxShadow: shadows.keAtas,
          '&:hover': { background: gradients.brandHover },
        }}
      >
        <Ikon size={24} stroke={2.2} aria-hidden="true" />
      </Box>
      {buka && (
        <Box
          component="nav"
          id={idPanel}
          aria-label={label}
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 'calc(100% + 12px)',
            width: 'min(260px, calc(100vw - 32px))',
            boxSizing: 'border-box',
            p: '8px',
            borderRadius: radius.kartu,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.menu,
            '@media (prefers-reduced-motion: no-preference)': { animation: `${masuk} 160ms ease-out` },
          }}
        >
          <Box component="ul" role="list" sx={{ ...resetDaftar, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tautan.map((t) => {
              const on = aktif === t.id;
              return (
                <li key={t.id}>
                  <Box
                    component="a"
                    href={`#${t.id}`}
                    aria-current={on ? 'location' : undefined}
                    onClick={() => setBuka(false)}
                    sx={sxTautan(on)}
                  >
                    {t.label}
                  </Box>
                </li>
              );
            })}
          </Box>
          <Box sx={{ mt: '8px', pt: '8px', borderTop: `1px solid ${colors.borderSoft}` }}>
            <TombolLanding varian="gradasi" ukuran="md" penuh {...propsAksi(aksi.rute)} onClick={() => setBuka(false)}>
              {aksi.label}
            </TombolLanding>
          </Box>
        </Box>
      )}
    </Box>
  );
}

FabJangkar.propTypes = {
  tautan: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })).isRequired,
  label: PropTypes.string.isRequired,
  labelTombol: PropTypes.string.isRequired,
  aksi: PropTypes.shape({ label: PropTypes.string, rute: PropTypes.string }).isRequired,
  aktif: PropTypes.string,
};
