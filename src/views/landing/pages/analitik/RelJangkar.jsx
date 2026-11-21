import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, gerak, layout, radius, shadows } from '../../theme/tokens';
import { resetDaftar, resetTautan } from '../../theme/sx';
import { MQ_REL } from './gaya';

// Rel navigasi jangkar di tepi kanan layar (1280 px ke atas): kartu putih
// vertikal berisi satu tombol ikon 44 px per bagian. Label teks tertulis di dalam
// tautan (nama aksesibel selalu ada) dan muncul ke kiri saat hover atau fokus
// keyboard. Bagian yang sedang terlihat ditandai warna aksen, latar tint, dan
// garis tebal di sisi kiri tombol (bentuk, bukan hanya warna) serta
// aria-current="location". Di bawah 1280 px rel disembunyikan (display none).
// Konten tidak tertutup: tepi dalam konten (kontainer 1200 px) selesai sebelum
// rel mulai pada layar 1280 px.
const sxTautan = (aktif) => ({
  ...resetTautan,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: layout.targetSentuh,
  height: layout.targetSentuh,
  borderRadius: radius.navItem,
  color: aktif ? colors.accent : colors.muted,
  background: aktif ? colors.tint : 'transparent',
  '&::before': aktif
    ? { content: '""', position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '3px', borderRadius: '2px', background: colors.accent }
    : undefined,
  '&:hover': { color: colors.accent, background: aktif ? colors.tint : colors.tintSoft },
  '&:hover .label, &:focus-visible .label': { opacity: 1 },
});

const sxLabel = {
  position: 'absolute',
  right: 'calc(100% + 14px)',
  top: '50%',
  transform: 'translateY(-50%)',
  px: '10px',
  py: '6px',
  borderRadius: radius.menuItem,
  background: colors.ink,
  color: colors.white,
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  opacity: 0, // disembunyikan dengan opacity (bukan visibility) agar tetap menjadi nama aksesibel tautan
  transition: `opacity ${gerak.cepat} ease`,
};

export default function RelJangkar({ tautan, label, aktif }) {
  return (
    <Box
      component="nav"
      aria-label={label}
      sx={{
        display: 'none',
        [MQ_REL]: { display: 'block' },
        position: 'fixed',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: layout.zHeader - 1, // di bawah header dan dropdown-nya, di atas konten
      }}
    >
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          p: '2px',
          borderRadius: radius.kartu,
          background: colors.white,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.menu,
        }}
      >
        {tautan.map((t) => {
          const Ikon = t.ikon;
          const on = aktif === t.id;
          return (
            <li key={t.id}>
              <Box component="a" href={`#${t.id}`} aria-current={on ? 'location' : undefined} sx={sxTautan(on)}>
                <Ikon size={22} stroke={on ? 2.2 : 1.8} aria-hidden="true" />
                <Box component="span" className="label" sx={sxLabel}>
                  {t.label}
                </Box>
              </Box>
            </li>
          );
        })}
      </Box>
    </Box>
  );
}

RelJangkar.propTypes = {
  tautan: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, label: PropTypes.string, ikon: PropTypes.elementType }),
  ).isRequired,
  label: PropTypes.string.isRequired,
  aktif: PropTypes.string,
};
