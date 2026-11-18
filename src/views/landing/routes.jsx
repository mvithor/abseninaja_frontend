import { lazy } from 'react';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import { REGISTRI_RUTE } from './data/nav';

// Rute landing (di bawah LandingLayout, sudah didaftarkan di src/routes/Router.jsx).
// Halaman produksi ditambahkan di `anak` per fase. Landing.jsx lama tetap ada di
// disk sebagai cadangan rollback, tetapi tidak lagi terdaftar.
//
// Hanya saat import.meta.env.DEV (chunk-nya tidak ikut build produksi):
//  - /landing-dev/fondasi : halaman uji visual komponen fondasi
//  - HalamanSegera untuk setiap rute di REGISTRI_RUTE yang `tersedia: false`,
//    supaya tombol pratinjau (flags.pratinjauTombolAktif) punya tujuan.
function buatRute() {
  const Beranda = Loadable(lazy(() => import('./pages/Beranda')));
  const anak = [{ path: '/', element: <Beranda /> }];

  if (import.meta.env.DEV) {
    const DevFondasi = Loadable(lazy(() => import('./pages/DevFondasi')));
    anak.push({ path: '/landing-dev/fondasi', element: <DevFondasi /> });

    const HalamanSegera = Loadable(lazy(() => import('./pages/HalamanSegera')));
    Object.values(REGISTRI_RUTE)
      .filter((r) => !r.tersedia)
      .forEach((r) => anak.push({ path: r.to, element: <HalamanSegera /> }));
  }

  const LandingLayout = Loadable(lazy(() => import('./layout/LandingLayout')));
  return [{ element: <LandingLayout />, children: anak }];
}

export const landingRoutes = buatRute();
