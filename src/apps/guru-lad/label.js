// Label tampilan struktur LAD. Fungsi murni tanpa impor (lihat label.test.js).

// Guru sering menamai LM dengan awalan sendiri ("LM 1 Bilangan", "Lingkup Materi 2: Aljabar").
// Menambahkan "LM 1." di depannya menghasilkan judul ganda ("LM 1. LM 1 Bilangan").
const SUDAH_BERNOMOR = /^\s*(?:LM|Lingkup\s+Materi)\s*\d+/i;

/** Judul LM untuk tampilan: "LM 2. Aljabar", dan tidak digandakan bila nama sudah memuat nomor LM. */
export function judulLm(lm) {
  const nama = String(lm?.nama ?? '').trim();
  if (SUDAH_BERNOMOR.test(nama)) return nama;
  return nama ? `LM ${lm.urutan}. ${nama}` : `LM ${lm.urutan}`;
}

/** Label pendek TP: kodenya bila ada, kalau tidak "TP <urutan>". */
export function labelTp(tp) {
  const kode = String(tp?.kode ?? '').trim();
  return kode || `TP ${tp?.urutan}`;
}
