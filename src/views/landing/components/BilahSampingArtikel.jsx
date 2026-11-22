import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TombolLanding from './TombolLanding';
import { colors, gradients, huruf, radius, shadows } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Bilah samping Blog (daftar dan artikel): kartu ajakan demo bergradasi dan satu
// kartu daftar putih (`children`, biasanya KartuBilah). `ajakanDi` menentukan
// urutan: "awal" (daftar Blog: ajakan dulu, lalu kategori) atau "akhir" (artikel:
// daftar isi dulu, lalu ajakan). Elemen <aside> dengan nama lewat `label`.
// `ajakan`: { judul, sub, aksi } dengan `aksi` berisi props TombolLanding
// ({ label, to, nonaktif }). Judul ajakan bukan heading (hanya penegas kartu).
export default function BilahSampingArtikel({ label, ajakan, ajakanDi = 'akhir', children }) {
  const kartuAjakan = (
    <Box
      sx={{
        boxSizing: 'border-box',
        p: '26px',
        borderRadius: radius.kartuBesar,
        background: gradients.brand,
        color: colors.white,
        textAlign: 'left',
      }}
    >
      <Box component="p" sx={{ m: 0, color: colors.white, ...huruf.judulAjakanBilah }}>
        {ajakan.judul}
      </Box>
      <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', lineHeight: 1.65, color: colors.white }}>
        {ajakan.sub}
      </Box>
      <TombolLanding varian="kuning" {...ajakan.aksi} penuh sx={{ mt: '16px' }}>
        {ajakan.aksi.label}
      </TombolLanding>
    </Box>
  );
  return (
    <Box component="aside" aria-label={label} sx={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {ajakanDi === 'awal' && kartuAjakan}
      {children}
      {ajakanDi !== 'awal' && kartuAjakan}
    </Box>
  );
}

BilahSampingArtikel.propTypes = {
  label: PropTypes.string.isRequired,
  ajakan: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    sub: PropTypes.node.isRequired,
    aksi: PropTypes.shape({ label: PropTypes.string.isRequired }).isRequired,
  }).isRequired,
  ajakanDi: PropTypes.oneOf(['awal', 'akhir']),
  children: PropTypes.node,
};

// Kartu daftar putih di bilah samping: judul (h2, id untuk aria-labelledby) dan
// daftar butir. `children` berisi butir <li> yang dibuat pemanggil lewat
// ButirBilah (garis pemisah di atas tiap butir).
export function KartuBilah({ id, judul, children }) {
  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{
        boxSizing: 'border-box',
        p: '22px 24px',
        borderRadius: radius.kartuBesar,
        background: colors.white,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.kartu,
        textAlign: 'left',
      }}
    >
      <Box component="h2" id={id} sx={{ m: '0 0 10px', color: colors.ink, ...huruf.judulBilah }}>
        {judul}
      </Box>
      <Box component="ul" role="list" sx={{ ...resetDaftar }}>
        {children}
      </Box>
    </Box>
  );
}

KartuBilah.propTypes = {
  id: PropTypes.string.isRequired,
  judul: PropTypes.string.isRequired,
  children: PropTypes.node,
};

// Satu butir daftar bilah: baris dengan garis di atas. `kanan` (opsional) di
// ujung kanan.
export function ButirBilah({ children, kanan }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        minHeight: 44,
        borderTop: `1px solid ${colors.borderSoft}`,
        fontSize: '14px',
        color: colors.body,
      }}
    >
      {children}
      {kanan}
    </Box>
  );
}

ButirBilah.propTypes = { children: PropTypes.node, kanan: PropTypes.node };
