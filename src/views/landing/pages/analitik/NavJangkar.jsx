import { GlobalStyles } from '@mui/material';
import RelJangkar from './RelJangkar';
import FabJangkar from './FabJangkar';
import useBagianAktif from './useBagianAktif';
import { NAV_JANGKAR as D } from '../../data/analitik';

// Navigasi jangkar di dalam halaman (Cara kerja, Fitur, Penanda, Jalur akun,
// FAQ). Di desain menu ini ada di header; header milik LandingLayout, jadi
// navigasi dibuat melayang di samping: rel ikon di tepi kanan layar (1280 px ke
// atas) atau tombol bulat dengan panel (di bawahnya). Hanya satu yang tampil
// (satunya display none lewat CSS). Tautan memakai hash biasa sehingga berfungsi
// tanpa JS; bagian aktif ditandai scrollspy. Gulir mulus hanya bila pengguna
// tidak meminta gerak berkurang, dan hanya selama halaman ini terpasang.
const URUTAN = D.tautan.map((t) => t.id);
const gayaGulir = { html: { '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' } } };

export default function NavJangkar() {
  const aktif = useBagianAktif(URUTAN);
  return (
    <>
      <GlobalStyles styles={gayaGulir} />
      <RelJangkar tautan={D.tautan} label={D.labelNav} aktif={aktif} />
      <FabJangkar tautan={D.tautan} label={D.labelNav} labelTombol={D.labelTombol} aksi={D.aksi} aktif={aktif} />
    </>
  );
}
