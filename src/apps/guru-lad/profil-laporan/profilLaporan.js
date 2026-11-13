// Logika murni halaman Profil Laporan LAD (tanpa React). Aturan mencerminkan abseninaja_backend/src/lad/data/profil-guru.js;
// server tetap yang memutuskan. Semua isian OPSIONAL. Teks tanpa kata "Anda".

export const BATAS = Object.freeze({ NIP_MAKS: 32, NIP_MIN_ANGKA: 8, NAMA_MAKS: 255 });

export const KUNCI_ISIAN = Object.freeze(['nip_guru', 'nama_kepsek', 'nip_kepsek']);

/** Pesan galat NIP/NUPTK (angka dengan spasi, minimal 8 angka), atau '' bila kosong atau sah. */
export const cekNip = (nilai) => {
  const t = String(nilai ?? '').trim();
  if (!t) return '';
  if (t.length > BATAS.NIP_MAKS) return `Paling banyak ${BATAS.NIP_MAKS} karakter.`;
  if (!/^[0-9 ]+$/.test(t)) return 'Hanya boleh berisi angka dan spasi.';
  if (t.replace(/ /g, '').length < BATAS.NIP_MIN_ANGKA) return `Minimal ${BATAS.NIP_MIN_ANGKA} angka.`;
  return '';
};

export const cekNama = (nilai) => {
  const t = String(nilai ?? '').trim();
  return t.length > BATAS.NAMA_MAKS ? `Paling banyak ${BATAS.NAMA_MAKS} karakter.` : '';
};

/** { nip_guru, nama_kepsek, nip_kepsek } -> peta galat per kolom (hanya yang bermasalah). */
export const validasiProfil = (form) => {
  const galat = {};
  const nipGuru = cekNip(form.nip_guru);
  const namaKepsek = cekNama(form.nama_kepsek);
  const nipKepsek = cekNip(form.nip_kepsek);
  if (nipGuru) galat.nip_guru = nipGuru;
  if (namaKepsek) galat.nama_kepsek = namaKepsek;
  if (nipKepsek) galat.nip_kepsek = nipKepsek;
  return galat;
};

const rapikan = (v) => String(v ?? '').trim();

/** Bentuk awal form dari respons server: isian guru saja (bukan nilai cadangan dari data sekolah). */
export const formDariProfil = (profil) => ({
  nip_guru: profil?.nip_guru ?? '',
  nama_kepsek: profil?.nama_kepsek ?? '',
  nip_kepsek: profil?.nip_kepsek ?? '',
});

/** Hanya isian yang berubah; isian yang dikosongkan dikirim null (menghapus isian guru, kembali ke data sekolah). */
export const bangunPayload = (awal, form) => {
  const payload = {};
  KUNCI_ISIAN.forEach((k) => {
    const sebelum = rapikan(awal?.[k]);
    const sesudah = rapikan(form?.[k]);
    if (sebelum !== sesudah) payload[k] = sesudah === '' ? null : sesudah;
  });
  return payload;
};

const SUMBER = Object.freeze({
  ISIAN_GURU: 'Dari isian di sini',
  DATA_SEKOLAH: 'Dari data sekolah',
});

export const labelSumber = (sumber) => (Object.prototype.hasOwnProperty.call(SUMBER, sumber) ? SUMBER[sumber] : 'Belum diisi');

/**
 * Teks bantuan di bawah kolom: nilai yang kini dipakai laporan dan asalnya. Bila isian guru kosong dan ada nilai dari
 * data sekolah, nilai itu yang tampil di laporan.
 */
export const bantuanKolom = (kunci, laporan, sumber) => {
  const nilai = laporan?.[kunci];
  const asal = sumber?.[kunci];
  if (!nilai) return 'Belum diisi. Kolom ini kosong di laporan.';
  return `Di laporan: ${nilai} (${labelSumber(asal).toLowerCase()}).`;
};
