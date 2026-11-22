// Tujuan satu artikel Blog (/blog/:slug), dibangun dari REGISTRI_RUTE.blog supaya
// tidak ada literal rute baru. Berkas terpisah dari data/aksi.js dan data/blog.js
// agar tetap di chunk F7 (tidak ikut build produksi saat ALAT_DIRILIS mati) dan
// data/blog.js tetap bisa dimuat tes tanpa data/nav.js.
import { REGISTRI_RUTE } from './nav';
import { gabungPath } from '../lib/blog.js';

export function tujuanArtikel(slug) {
  return gabungPath(REGISTRI_RUTE.blog.to, slug);
}
