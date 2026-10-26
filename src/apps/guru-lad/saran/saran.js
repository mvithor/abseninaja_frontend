// Fungsi murni untuk saran tindak lanjut. Tanpa impor selain modul murni lain (lihat saran.test.js).
//
// Draf disusun SERVER dari bukti penanda (templat versi 1.1) dan tidak pernah dihitung ulang di sini. Berkas
// ini hanya mengurus apa yang tampil: kolom, keadaan keputusan guru, nilai awal isian, dan pemeriksaan cepat
// sebelum dikirim. Pemeriksaan yang berwenang tetap di server (kolom "langkah" wajib, batas panjang).

export const KOLOM_SARAN = Object.freeze([
  { kunci: 'koneksi', label: 'Mulai dari koneksi', petunjuk: 'Hubungan dengan siswa atau kondisi yang sudah diketahui guru.' },
  { kunci: 'tujuan', label: 'Ke mana tujuannya?', petunjuk: 'Tujuan belajar yang ingin dicapai siswa.' },
  { kunci: 'posisi', label: 'Sudah sampai mana?', petunjuk: 'Posisi siswa saat ini menurut data kelas.' },
  { kunci: 'langkah', label: 'Langkah berikutnya?', petunjuk: 'Tindakan yang akan guru lakukan. Wajib diisi.' },
]);

export const MAKS_KOLOM = 2000;
export const MAKS_ALASAN = 1000;

export const KEADAAN = Object.freeze({
  DRAF: 'DRAF',
  DIPAKAI: 'DIPAKAI',
  DIPAKAI_DIUBAH: 'DIPAKAI_DIUBAH',
  DIABAIKAN: 'DIABAIKAN',
});

const rapikan = (teks) => String(teks ?? '').replace(/\s+/g, ' ').trim();

/** Sama dengan drafSama di server: dua isian dianggap sama bila spasi dirapikan menghasilkan teks yang sama. */
export function isianSama(a, b) {
  return KOLOM_SARAN.every((k) => rapikan(a?.[k.kunci]) === rapikan(b?.[k.kunci]));
}

/** Keadaan keputusan satu saran: belum diputuskan (draf), dipakai, dipakai dengan perubahan guru, atau diabaikan. */
export function keadaanSaran(entri) {
  const t = entri?.tersimpan;
  if (!t) return KEADAAN.DRAF;
  if (t.status === 'DIABAIKAN') return KEADAAN.DIABAIKAN;
  return t.diubah_guru ? KEADAAN.DIPAKAI_DIUBAH : KEADAAN.DIPAKAI;
}

export const LABEL_KEADAAN = Object.freeze({
  DRAF: 'Draf dari sistem, belum dipakai',
  DIPAKAI: 'Dipakai',
  DIPAKAI_DIUBAH: 'Dipakai, diubah dari draf',
  DIABAIKAN: 'Diabaikan',
});

/** Isian awal keempat kolom: versi akhir guru bila sudah dipakai, kalau tidak draf (kolom tanpa bukti = kosong). */
export function isianAwal(entri) {
  const sumber = keadaanSaran(entri) === KEADAAN.DRAF || keadaanSaran(entri) === KEADAAN.DIABAIKAN
    ? entri?.draf
    : entri.tersimpan.akhir;
  return Object.fromEntries(KOLOM_SARAN.map((k) => [k.kunci, sumber?.[k.kunci] ?? '']));
}

/** Kolom yang tidak dibuat sistem karena buktinya tidak ada, beserta alasannya (dari server). */
export function kolomDihilangkan(entri) {
  const peta = new Map((entri?.dihilangkan ?? []).map((d) => [d.kolom, d.alasan]));
  return KOLOM_SARAN.filter((k) => peta.has(k.kunci)).map((k) => ({ kunci: k.kunci, label: k.label, alasan: peta.get(k.kunci) }));
}

/** Periksa isian sebelum dikirim. Mengembalikan { galat: {kolom: pesan} } (kosong bila sah) dan isian yang dirapikan. */
export function periksaIsian(isian) {
  const galat = {};
  const bersih = {};
  KOLOM_SARAN.forEach((k) => {
    const teks = String(isian?.[k.kunci] ?? '').trim();
    bersih[k.kunci] = teks;
    if (teks.length > MAKS_KOLOM) galat[k.kunci] = `Paling banyak ${MAKS_KOLOM} karakter`;
  });
  if (bersih.langkah === '') galat.langkah = 'Langkah berikutnya wajib diisi';
  return { galat, bersih };
}

/** Alasan mengabaikan wajib diisi dan singkat. */
export function periksaAlasan(teks) {
  const t = String(teks ?? '').trim();
  if (t === '') return { galat: 'Alasan wajib diisi, agar guru lain tahu mengapa saran ini tidak dipakai' };
  if (t.length > MAKS_ALASAN) return { galat: `Paling banyak ${MAKS_ALASAN} karakter` };
  return { alasan: t };
}

/** Apakah isian di layar berbeda dari yang tersimpan/draf awal (untuk tombol dan peringatan keluar). */
export function adaPerubahan(isian, awal) {
  return !isianSama(isian, awal);
}

/**
 * Ringkasan keputusan per siswa dari GET /saran kelas: { siswaId -> { dipakai, diabaikan, pola: {P1: 'DIPAKAI'} } }.
 * Dipakai untuk penanda kecil di matriks. Hanya menghitung keputusan yang sudah dibuat guru.
 */
export function ringkasKeputusan(daftar) {
  const peta = new Map();
  (daftar ?? []).forEach((s) => {
    if (!peta.has(s.siswa_id)) peta.set(s.siswa_id, { dipakai: 0, diabaikan: 0, pola: {} });
    const r = peta.get(s.siswa_id);
    if (s.status === 'DIABAIKAN') r.diabaikan += 1;
    else r.dipakai += 1;
    r.pola[s.pola] = s.status;
  });
  return peta;
}

/** Teks ringkas keputusan untuk satu siswa (dibaca pembaca layar juga), atau null bila belum ada keputusan. */
export function teksKeputusan(ringkas) {
  if (!ringkas) return null;
  const bagian = [];
  if (ringkas.dipakai > 0) bagian.push(`${ringkas.dipakai} saran dipakai`);
  if (ringkas.diabaikan > 0) bagian.push(`${ringkas.diabaikan} diabaikan`);
  return bagian.length > 0 ? bagian.join(', ') : null;
}

/** Pesan untuk galat 409/422 khusus saran; null bila bukan galat yang dikenal. */
export function pesanKonflikSaran(status) {
  if (status === 409) return 'Data kelas berubah atau kelas ini hanya-baca. Muat ulang halaman, lalu coba lagi.';
  return null;
}

/** Tanggal simpan untuk tampilan ("26 Oktober 2026"); kosong bila bukan tanggal yang sah. */
export function tanggalSimpan(iso) {
  const d = new Date(iso);
  if (iso === null || iso === undefined || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Isian dari draf sistem saat ini (kolom tanpa bukti menjadi kosong). */
export function isianDraf(entri) {
  return Object.fromEntries(KOLOM_SARAN.map((k) => [k.kunci, entri?.draf?.[k.kunci] ?? '']));
}

/** Urutkan saran menurut prioritas tampilan penanda (P2, P3, P1, P4, P5). */
export function urutkanSaran(daftar, urutan) {
  const idx = (pola) => { const i = urutan.indexOf(pola); return i === -1 ? urutan.length : i; };
  return [...(daftar ?? [])].sort((a, b) => idx(a.pola) - idx(b.pola));
}
