import { lazy } from 'react';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import { REGISTRI_RUTE } from './data/nav';

// Rute landing (di bawah LandingLayout, sudah didaftarkan di src/routes/Router.jsx).
// Halaman produksi ditambahkan di `anak` per fase; tiap halaman menjadi chunk
// lazy sendiri. Landing.jsx lama tetap ada di disk sebagai cadangan rollback,
// tetapi tidak lagi terdaftar. Rute di REGISTRI_RUTE (data/nav.js) dengan
// `tersedia: true` wajib punya halaman di sini.
//
// Hanya saat import.meta.env.DEV (chunk-nya tidak ikut build produksi):
//  - /landing-dev/fondasi : halaman uji visual komponen fondasi
//  - HalamanSegera untuk setiap rute di REGISTRI_RUTE yang `tersedia: false`,
//    supaya tombol pratinjau (flags.pratinjauTombolAktif) punya tujuan.
function buatRute() {
  const Beranda = Loadable(lazy(() => import('./pages/Beranda')));
  const Fitur = Loadable(lazy(() => import('./pages/Fitur')));
  const UntukSekolah = Loadable(lazy(() => import('./pages/UntukSekolah')));
  const Pendampingan = Loadable(lazy(() => import('./pages/Pendampingan')));
  const Paket = Loadable(lazy(() => import('./pages/Paket')));
  const Promo = Loadable(lazy(() => import('./pages/Promo')));
  const JadwalkanDemo = Loadable(lazy(() => import('./pages/JadwalkanDemo')));
  const GuruMandiri = Loadable(lazy(() => import('./pages/GuruMandiri')));
  // Path ditulis langsung (bukan dari REGISTRI_RUTE) supaya data/nav.js tetap
  // di luar chunk entry. Harus sama dengan REGISTRI_RUTE di data/nav.js.
  const anak = [
    { path: '/', element: <Beranda /> },
    { path: '/produk/fitur', element: <Fitur /> },
    { path: '/produk/untuk-sekolah', element: <UntukSekolah /> },
    { path: '/produk/pendampingan', element: <Pendampingan /> },
    { path: '/produk/paket', element: <Paket /> },
    { path: '/produk/promo', element: <Promo /> },
    { path: '/jadwalkan-demo', element: <JadwalkanDemo /> },
    { path: '/akun-guru-mandiri', element: <GuruMandiri /> },
  ];

  if (import.meta.env.DEV) {
    const DevFondasi = Loadable(lazy(() => import('./pages/DevFondasi')));
    anak.push({ path: '/landing-dev/fondasi', element: <DevFondasi /> });

    const HalamanSegera = Loadable(lazy(() => import('./pages/HalamanSegera')));
    // Penjaga sinkron (hanya DEV): rute `tersedia: true` di REGISTRI_RUTE harus
    // punya halaman di `anak`. Path di atas ditulis literal, jadi salah ketik
    // tidak terlihat sampai menu menaut ke 404. /login dan /privacy-policy
    // dilayani Router.jsx, bukan landing.
    const DILAYANI_ROUTER = ['/login', '/privacy-policy'];
    const terdaftar = new Set(anak.map((a) => a.path));
    Object.entries(REGISTRI_RUTE).forEach(([kunci, r]) => {
      if (r.tersedia && !DILAYANI_ROUTER.includes(r.to) && !terdaftar.has(r.to)) {
        console.error(`[landing] REGISTRI_RUTE.${kunci} ditandai tersedia tetapi ${r.to} belum terdaftar di routes.jsx`);
      }
    });
    Object.values(REGISTRI_RUTE)
      .filter((r) => !r.tersedia)
      .forEach((r) => anak.push({ path: r.to, element: <HalamanSegera /> }));
  }

  const LandingLayout = Loadable(lazy(() => import('./layout/LandingLayout')));
  return [{ element: <LandingLayout />, children: anak }];
}

export const landingRoutes = buatRute();
