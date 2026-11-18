// Props tombol untuk rute internal dari REGISTRI_RUTE (data/nav.js).
// Rute yang belum dibangun (tersedia: false) tampil nonaktif. Di DEV
// (flags.pratinjauTombolAktif) tombol tetap aktif dan menuju HalamanSegera,
// supaya tata letak dan alur klik bisa dicoba sebelum halamannya ada.
import { REGISTRI_RUTE } from './nav';
import { flags } from '../theme/tokens';

export function propsAksi(kunci) {
  const rute = REGISTRI_RUTE[kunci];
  if (!rute) throw new Error(`Rute landing tidak dikenal: ${kunci}`);
  return { to: rute.to, nonaktif: !(rute.tersedia || flags.pratinjauTombolAktif) };
}
