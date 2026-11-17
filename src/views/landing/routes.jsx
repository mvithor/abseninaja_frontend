import { lazy } from 'react';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';

// Rute landing baru (di bawah LandingLayout). Rute `/` tetap ke Landing.jsx lama
// sampai F1 dan tetap didaftarkan di src/routes/Router.jsx.
//
// Halaman uji visual: /landing-dev/fondasi. Hanya terdaftar saat
// import.meta.env.DEV, sehingga chunk-nya tidak ikut build produksi.
function buatRute() {
  // Penjaga Fase 0: di build produksi belum ada halaman landing baru, jadi
  // LandingLayout tidak boleh ikut menjadi chunk. HAPUS baris ini saat Fase 1
  // menambah halaman produksi, lalu pindahkan blok DEV di bawah ke dalam `if`.
  if (!import.meta.env.DEV) return [];

  const anak = [];

  // Halaman produksi ditambahkan di sini per fase (F1 dan seterusnya).

  const DevFondasi = Loadable(lazy(() => import('./pages/DevFondasi')));
  anak.push({ path: '/landing-dev/fondasi', element: <DevFondasi /> });

  const LandingLayout = Loadable(lazy(() => import('./layout/LandingLayout')));
  return [{ element: <LandingLayout />, children: anak }];
}

export const landingRoutes = buatRute();
