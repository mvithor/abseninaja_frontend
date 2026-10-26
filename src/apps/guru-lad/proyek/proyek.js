// Fungsi murni untuk tab Proyek. Tanpa impor selain modul murni lain (lihat proyek.test.js).
//
// Proyek di sini adalah "Latihan Materi" berbentuk proyek pada blanko guru: ada yang individu, ada yang
// kelompok, dinilai terpisah dari TP sumatif. Nilai 0 pada proyek INDIVIDU berarti tidak dikumpulkan
// (ASM-05) dan menjadi bukti penanda P3; kosong berarti belum dinilai; proyek kelompok tidak dipakai P3.

export const JENIS_PROYEK = Object.freeze({ INDIVIDU: 'INDIVIDU', KELOMPOK: 'KELOMPOK' });
export const TEKS_JENIS = Object.freeze({ INDIVIDU: 'Individu', KELOMPOK: 'Kelompok' });
export const MAKS_NAMA_PROYEK = 200;

/** Nama proyek untuk tampilan; nama kosong (tidak seharusnya terjadi) jatuh ke "Proyek n". */
export const labelProyek = (p) => {
  const nama = typeof p?.nama === 'string' ? p.nama.trim() : '';
  return nama !== '' ? nama : `Proyek ${p?.urutan ?? ''}`.trim();
};

/**
 * Periksa isian form proyek. Mengembalikan peta { nama?, jenis? } berisi pesan; kosong berarti sah.
 * Aturan mencerminkan server (nama wajib dan paling panjang 200 karakter; jenis INDIVIDU atau KELOMPOK).
 */
export function periksaFormProyek({ nama, jenis } = {}) {
  const galat = {};
  const n = String(nama ?? '').trim();
  if (n === '') galat.nama = 'Nama proyek wajib diisi';
  else if (n.length > MAKS_NAMA_PROYEK) galat.nama = `Paling panjang ${MAKS_NAMA_PROYEK} karakter`;
  if (jenis !== JENIS_PROYEK.INDIVIDU && jenis !== JENIS_PROYEK.KELOMPOK) galat.jenis = 'Pilih individu atau kelompok';
  return galat;
}

/** Sel dengan nilai 0 pada proyek individu: tidak dikumpulkan. Nol pada proyek kelompok tidak diberi arti. */
export const tidakDikumpulkan = (jenis, nilai) => jenis === JENIS_PROYEK.INDIVIDU && nilai === 0;

/** Jumlah proyek per jenis, untuk keterangan di atas tabel. */
export function hitungJenis(proyek) {
  const hasil = { individu: 0, kelompok: 0 };
  (proyek ?? []).forEach((p) => {
    if (p.jenis === JENIS_PROYEK.INDIVIDU) hasil.individu += 1;
    else if (p.jenis === JENIS_PROYEK.KELOMPOK) hasil.kelompok += 1;
  });
  return hasil;
}
