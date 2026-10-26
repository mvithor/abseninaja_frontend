// Skala rentang KKTP untuk tampilan guru LAD. Fungsi murni tanpa impor supaya dapat diuji dengan
// `node --test` (lihat rentang.test.js).
//
// Aturan MENCERMINKAN backend (src/lad/rules/pola.js, rentangTp; kendala lad_kelas_mapel_ambang_urut)
// hanya sebagai umpan balik cepat dan penanda di grid. Yang berwenang tetap server: ia menolak ambang
// yang tidak sah (422) dan tidak pernah menerima kelas dengan ambang rusak.
//
// Tiga ambang adalah BATAS BAWAH rentang: nilai tepat di ambang masuk rentang di atasnya.

export const BAWAAN_AMBANG = Object.freeze({ ambang_bagian: 41, kktp: 66, ambang_pengayaan: 86 });

// Nama rentang sama dengan yang dikirim backend pada bukti P1 (RENTANG di rules/pola.js).
export const RENTANG = Object.freeze({
  BELUM_DINILAI: 'BELUM_DINILAI',
  SELURUH: 'BELUM_MENCAPAI_SELURUH',
  SEBAGIAN: 'BELUM_MENCAPAI_SEBAGIAN',
  MENCAPAI: 'MENCAPAI',
  PENGAYAAN: 'MENCAPAI_PENGAYAAN',
});

const KUNCI_AMBANG = ['ambang_bagian', 'kktp', 'ambang_pengayaan'];

/** Angka bergaya Indonesia: 66 menjadi "66", 85.5 menjadi "85,5". */
export const tampilAngka = (x) => String(x ?? '').replace('.', ',');

/**
 * Baca teks ambang yang diketik guru. Koma dan titik sama-sama diterima; paling banyak dua desimal.
 * Mengembalikan { centi } atau { galat }.
 */
export function bacaAmbang(teks) {
  const t = String(teks ?? '').trim();
  if (t === '') return { galat: 'Wajib diisi' };
  const m = /^(\d{1,3})(?:[.,](\d{1,2}))?$/.exec(t);
  if (!m) return { galat: 'Isi dengan angka, paling banyak dua desimal' };
  const centi = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || '0');
  if (centi > 10000) return { galat: 'Harus antara 0 dan 100' };
  return { centi };
}

/**
 * Periksa ketiga ambang (teks isian) terhadap aturan urutan 0 < bagian < KKTP < pengayaan <= 100.
 * Mengembalikan peta { ambang_bagian?, kktp?, ambang_pengayaan? } berisi pesan; kosong berarti sah.
 */
export function periksaAmbang(isian) {
  const galat = {};
  const centi = {};
  KUNCI_AMBANG.forEach((k) => {
    const h = bacaAmbang(isian?.[k]);
    if (h.galat) galat[k] = h.galat; else centi[k] = h.centi;
  });
  if (centi.ambang_bagian !== undefined && centi.ambang_bagian <= 0) {
    galat.ambang_bagian = 'Harus lebih dari 0';
  }
  if (!galat.kktp && !galat.ambang_bagian && centi.kktp <= centi.ambang_bagian) {
    galat.kktp = 'Harus lebih besar dari batas remedial bagian';
  }
  if (!galat.ambang_pengayaan && !galat.kktp && centi.ambang_pengayaan <= centi.kktp) {
    galat.ambang_pengayaan = 'Harus lebih besar dari KKTP';
  }
  return galat;
}

const keCenti = (x) => Math.round(Number(x) * 100);

/**
 * Rentang satu nilai TP (angka, atau null bila belum dinilai) menurut ambang kelas
 * ({ ambang_bagian, kktp, ambang_pengayaan }, boleh berupa teks dari server).
 */
export function rentangNilai(nilai, ambang) {
  if (nilai === null || nilai === undefined || Number.isNaN(Number(nilai))) return RENTANG.BELUM_DINILAI;
  const c = keCenti(nilai);
  if (c < keCenti(ambang.ambang_bagian)) return RENTANG.SELURUH;
  if (c < keCenti(ambang.kktp)) return RENTANG.SEBAGIAN;
  if (c < keCenti(ambang.ambang_pengayaan)) return RENTANG.MENCAPAI;
  return RENTANG.PENGAYAAN;
}

/** Kalimat pendek untuk pembaca layar dan tooltip. */
export const KETERANGAN_RENTANG = Object.freeze({
  [RENTANG.SELURUH]: 'Belum mencapai: remedial seluruh bagian',
  [RENTANG.SEBAGIAN]: 'Belum mencapai: remedial bagian tertentu',
  [RENTANG.MENCAPAI]: 'Sudah mencapai',
  [RENTANG.PENGAYAAN]: 'Sudah mencapai: perlu pengayaan',
});

/** Empat baris legenda lengkap dengan rentang angkanya menurut ambang kelas. */
export function legendaRentang(ambang) {
  const b = tampilAngka(Number(ambang.ambang_bagian));
  const k = tampilAngka(Number(ambang.kktp));
  const p = tampilAngka(Number(ambang.ambang_pengayaan));
  return [
    { rentang: RENTANG.SELURUH, batas: `di bawah ${b}`, teks: KETERANGAN_RENTANG[RENTANG.SELURUH] },
    { rentang: RENTANG.SEBAGIAN, batas: `${b} sampai di bawah ${k}`, teks: KETERANGAN_RENTANG[RENTANG.SEBAGIAN] },
    { rentang: RENTANG.MENCAPAI, batas: `${k} sampai di bawah ${p}`, teks: KETERANGAN_RENTANG[RENTANG.MENCAPAI] },
    { rentang: RENTANG.PENGAYAAN, batas: `${p} ke atas`, teks: KETERANGAN_RENTANG[RENTANG.PENGAYAAN] },
  ];
}

/** Bagian lingkaran yang terisi pada ikon: makin tinggi rentang, makin penuh (bentuk, bukan hanya warna). */
export const ISI_IKON = Object.freeze({
  [RENTANG.SELURUH]: 0.25,
  [RENTANG.SEBAGIAN]: 0.5,
  [RENTANG.MENCAPAI]: 0.75,
  [RENTANG.PENGAYAAN]: 1,
});

/** Ringkasan tiga batas untuk tabel: "41 / 66 / 86" (remedial bagian / KKTP / pengayaan). */
export function ringkasAmbang(kelas) {
  return [kelas.ambang_bagian, kelas.kktp, kelas.ambang_pengayaan]
    .map((x) => tampilAngka(Number(x)))
    .join(' / ');
}
