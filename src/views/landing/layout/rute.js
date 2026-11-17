import { matchPath } from 'react-router-dom';

// Status aktif rute untuk menu, bar tab, dan header. Memakai matchPath supaya
// anak rute (/blog/judul-artikel) dan garis miring akhir (/blog/) tetap
// menyorot induknya. `end` hanya untuk '/', agar Beranda tidak aktif di mana-mana.
export function ruteAktif(to, pathname) {
  if (!to) return false;
  return matchPath({ path: to, end: to === '/' }, pathname) !== null;
}

export function adaRuteAktif(daftarTo, pathname) {
  return daftarTo.some((to) => ruteAktif(to, pathname));
}
