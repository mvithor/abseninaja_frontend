// Penjelasan hasil evaluasi LAD dalam bahasa guru. Fungsi murni tanpa impor selain modul murni lain
// (lihat penjelasan.test.js), supaya dapat diuji dengan `node --test` tanpa Vite.
//
// Yang berwenang atas keputusan "ditandai atau tidak" adalah server (paket aturan). Berkas ini hanya
// MENYUSUN TAMPILAN dari keluaran server: urutan, pengelompokan, dan kalimat penjelas. Ia tidak
// pernah menghitung ulang penanda, dan tidak menambah kesimpulan di luar apa yang dibuktikan bukti.

import { tampilAngka } from '../rentang.js';
import { judulLm } from '../label.js';

export const KODE_POLA = Object.freeze(['P1', 'P2', 'P3', 'P4', 'P5']);
// Urutan prioritas TAMPILAN, sama dengan server (PRD 7.2). Tidak memengaruhi apakah siswa ditandai.
export const URUTAN_PRIORITAS = Object.freeze(['P2', 'P3', 'P1', 'P4', 'P5']);

export const POLA_INFO = Object.freeze({
  P1: { judul: 'Kesulitan pada TP tertentu', jenis: 'perhatian' },
  P2: { judul: 'Sering alpa', jenis: 'perhatian' },
  P3: { judul: 'Proyek individu tidak dikumpulkan', jenis: 'perhatian' },
  P4: { judul: 'Capaian menurun', jenis: 'perhatian' },
  P5: { judul: 'Capaian sangat tinggi', jenis: 'pengayaan' },
});

const a = (x) => tampilAngka(x);

/** Aturan satu pola dalam kalimat guru, memakai parameter yang benar-benar dipakai server. */
export function definisiPola(kode, p) {
  switch (kode) {
    case 'P1':
      return `Ditandai bila ada TP yang nilainya di bawah KKTP (${a(p.kktp)}) dan belum dituntaskan lewat remedial.`;
    case 'P2':
      return `Ditandai bila siswa alpa (tanpa keterangan) pada paling sedikit ${a(p.a_min)} pertemuan, dengan syarat sudah ada ${a(p.pertemuan_min)} pertemuan tercatat. Yang dihitung jumlah alpa, bukan persentase hadir. Penyebab tidak hadir tidak diketahui sistem.`;
    case 'P3':
      return 'Ditandai bila ada proyek individu yang bernilai 0 (tidak dikumpulkan). Proyek kelompok tidak dipakai.';
    case 'P4':
      return `Ditandai bila rata-rata nilai tiga LM terakhir yang sudah terhitung turun berurutan, total turunnya paling sedikit ${a(p.turun_total)} poin, penurunan itu melebihi penurunan rata-rata kelas paling sedikit ${a(p.turun_relatif)} poin, dan nilai terakhirnya masih di bawah ${a(p.ambang_pengayaan)}. Pembanding kelas hanya dipakai bila paling sedikit ${a(p.kelas_min)} siswa terhitung pada LM pertama dan terakhir; kalau tidak, hanya penurunan siswa itu sendiri yang dilihat.`;
    case 'P5':
      return `Ditandai bila semua TP pada paling sedikit ${a(p.lm_min_p5)} LM bernilai ${a(p.ambang_pengayaan)} ke atas, tidak ada TP yang belum tuntas, dan tidak ada proyek individu bernilai 0.`;
    default:
      return '';
  }
}

/** Data apa yang dibutuhkan pola agar dapat dinilai; dipakai untuk catatan "data belum cukup". */
export function dataDibutuhkan(kode, p) {
  switch (kode) {
    case 'P1': return 'nilai TP';
    case 'P2': return `catatan kehadiran (paling sedikit ${a(p.pertemuan_min)} pertemuan)`;
    case 'P3': return 'nilai proyek individu';
    case 'P4': return 'nilai TP pada tiga lingkup materi';
    case 'P5': return `nilai TP pada ${a(p.lm_min_p5)} lingkup materi`;
    default: return '';
  }
}

const cariLm = (no, lm) => (Array.isArray(lm) ? lm.find((m) => m.urutan === no) : undefined);

/** Nama LM untuk kalimat: judul lengkap bila struktur dikenal, kalau tidak "LM n". */
export function namaLm(no, lm) {
  const m = cariLm(no, lm);
  return m ? judulLm(m) : `LM ${no}`;
}

/** Nama TP untuk kalimat: "TP 1.2 (LM 1)" bila ada kode, kalau tidak "TP 2 (LM 1)". */
export function namaTp(lmNo, tpNo, lm) {
  const m = cariLm(lmNo, lm);
  const t = m && Array.isArray(m.tp) ? m.tp.find((x) => x.urutan === tpNo) : undefined;
  const kode = t && typeof t.kode === 'string' ? t.kode.trim() : '';
  return `TP ${kode || tpNo} (LM ${lmNo})`;
}

const daftarKata = (daftar, penghubung = 'dan') => {
  const x = daftar.map(String);
  if (x.length <= 1) return x.join('');
  return `${x.slice(0, -1).join(', ')} ${penghubung} ${x[x.length - 1]}`;
};

const RENTANG_TEKS = Object.freeze({
  BELUM_MENCAPAI_SELURUH: 'remedial seluruh bagian',
  BELUM_MENCAPAI_SEBAGIAN: 'remedial bagian tertentu',
});

function bukti1(b, ctx) {
  const baris = b.tp.map((t) => {
    const rem = t.remedial_terbaru === null || t.remedial_terbaru === undefined
      ? 'belum ada remedial'
      : `remedial terbaru ${a(t.remedial_terbaru)} masih di bawah KKTP`;
    const rentang = RENTANG_TEKS[t.rentang] ? `, ${RENTANG_TEKS[t.rentang]}` : '';
    return `${namaTp(t.lm, t.tp, ctx.lm)}: nilai ${a(t.nilai)}${rentang}; ${rem}.`;
  });
  if (b.tersembunyi) {
    const dilihat = new Set();
    b.tp.filter((t) => t.tersembunyi).forEach((t) => {
      if (dilihat.has(t.lm)) return;
      dilihat.add(t.lm);
      baris.push(`Tidak terlihat dari rata-rata: rata-rata ${namaLm(t.lm, ctx.lm)} (${a(t.nr_lm)}) sudah mencapai KKTP.`);
    });
  }
  return baris;
}

function bukti2(b) {
  const k = b.komposisi || {};
  const baris = [
    `Alpa (tanpa keterangan) ${b.jumlah_a} kali dari ${b.pertemuan_tercatat} pertemuan tercatat (pertemuan ${daftarKata(b.pertemuan_a)}).`,
    `Hadir ${k.H ?? 0}, sakit ${k.S ?? 0}, izin ${k.I ?? 0}, alpa ${k.A ?? 0}.`,
  ];
  if (Array.isArray(b.nr_lm) && b.nr_lm.length > 0) {
    baris.push(`Rata-rata nilai per LM: ${b.nr_lm.map((x) => `LM ${x.lm} ${a(x.nr)}`).join('; ')}.`);
  }
  return baris;
}

function bukti3(b) {
  const baris = [`Proyek individu ${daftarKata(b.proyek)} tidak dikumpulkan (nilai 0).`];
  if (b.sumatif_tinggi) baris.push('Rata-rata semua LM siswa ini berada pada batas pengayaan atau di atasnya.');
  return baris;
}

function bukti4(b, ctx) {
  const urut = b.lm.map((no, i) => `LM ${no} ${a(b.nr[i])}`).join(', lalu ');
  const baris = [`Rata-rata nilai tiga LM terakhir: ${urut}. Total turun ${a(b.total_turun)} poin.`];
  if (b.acuan_kelas) {
    const kelas = b.lm.map((no, i) => `LM ${no} ${a(b.nr_kelas[i])}`).join(', ');
    baris.push(`Rata-rata kelas pada LM yang sama: ${kelas}.`);
    const tk = Number(b.turun_kelas);
    let arah;
    if (tk > 0) arah = `turun ${a(tk)} poin`;
    else if (tk < 0) arah = `naik ${a(-tk)} poin`;
    else arah = 'tidak berubah';
    baris.push(`Kelas ${arah}; penurunan siswa ini ${a(b.lebih_dari_kelas)} poin lebih besar daripada kelas.`);
  } else {
    baris.push(`Pembanding kelas tidak dipakai karena kurang dari ${a(ctx.parameter.kelas_min)} siswa yang nilainya terhitung pada LM pertama atau terakhir; keputusan hanya melihat penurunan siswa ini sendiri.`);
  }
  return baris;
}

function bukti5(b) {
  return [
    `Semua TP bernilai ${a(b.nilai_tp_terendah)} sampai ${a(b.nilai_tp_tertinggi)} pada LM ${daftarKata(b.lm)}.`,
    `Rata-rata per LM: ${b.lm.map((no, i) => `LM ${no} ${a(b.nr[i])}`).join('; ')}.`,
  ];
}

/**
 * Kalimat bukti untuk satu pola yang DITANDAI.
 * @param {'P1'|'P2'|'P3'|'P4'|'P5'} kode
 * @param {object} bukti bukti dari server
 * @param {{lm?: object[], parameter: object}} ctx struktur kelas (untuk nama LM dan TP) dan parameter server
 * @returns {string[]}
 */
export function uraikanBukti(kode, bukti, ctx) {
  if (bukti === null || typeof bukti !== 'object') return [];
  switch (kode) {
    case 'P1': return bukti1(bukti, ctx);
    case 'P2': return bukti2(bukti);
    case 'P3': return bukti3(bukti, ctx);
    case 'P4': return bukti4(bukti, ctx);
    case 'P5': return bukti5(bukti, ctx);
    default: return [];
  }
}

/**
 * Susun daftar siswa untuk tampilan. Yang ditandai lebih dulu menurut prioritas pola utama, lalu yang
 * punya lebih banyak penanda, lalu nomor urut. Siswa tanpa penanda mengikuti menurut nomor urut.
 * @param {object[]} hasil `hasil` dari server
 * @param {{hanyaDitandai?: boolean, pola?: string[]}} opsi `pola` kosong berarti semua pola
 */
export function susunSiswa(hasil, { hanyaDitandai = true, pola = [] } = {}) {
  const terpilih = new Set(pola);
  const lolos = hasil.filter((h) => {
    if (hanyaDitandai && h.penanda.length === 0) return false;
    if (terpilih.size > 0 && !h.penanda.some((k) => terpilih.has(k))) return false;
    return true;
  });
  const peringkat = (h) => (h.pola_utama ? URUTAN_PRIORITAS.indexOf(h.pola_utama) : URUTAN_PRIORITAS.length);
  return [...lolos].sort((x, y) => {
    const dp = peringkat(x) - peringkat(y);
    if (dp !== 0) return dp;
    const dj = y.penanda.length - x.penanda.length;
    if (dj !== 0) return dj;
    return (x.urutan ?? 0) - (y.urutan ?? 0) || String(x.siswa_id).localeCompare(String(y.siswa_id), 'en', { numeric: true });
  });
}

/** Hitungan untuk ringkasan: ditandai per pola, dan siswa yang pola itu BELUM_CUKUP datanya. */
export function hitungRingkasan(data) {
  const perPola = {};
  const belumCukup = {};
  KODE_POLA.forEach((k) => { perPola[k] = 0; belumCukup[k] = 0; });
  let ditandai = 0;
  data.hasil.forEach((h) => {
    if (h.penanda.length > 0) ditandai += 1;
    KODE_POLA.forEach((k) => {
      const s = h.pola[k] && h.pola[k].status;
      if (s === 'DITANDAI') perPola[k] += 1;
      else if (s === 'BELUM_CUKUP') belumCukup[k] += 1;
    });
  });
  return {
    jumlahSiswa: data.hasil.length,
    ditandai,
    perPola,
    belumCukup,
    jumlahGalat: Array.isArray(data.galat) ? data.galat.length : 0,
  };
}

/**
 * Label tab: jumlah siswa bertanda hanya ditampilkan bila lebih dari nol. Angka 0 tidak ditampilkan karena
 * dapat terbaca "aman", padahal bisa juga berarti data belum cukup untuk menandai siapa pun.
 */
export function labelTabPerhatian(data) {
  const dasar = 'Perlu Perhatian';
  if (!data || !Array.isArray(data.hasil)) return dasar;
  const n = hitungRingkasan(data).ditandai;
  return n > 0 ? `${dasar} (${n})` : dasar;
}

/** Baris pembanding kelas: rata-rata NR kelas per LM, dan apakah dipakai sebagai pembanding. */
export function barisKonteks(konteks, lm) {
  if (!Array.isArray(konteks)) return [];
  return konteks.map((k) => ({
    lm: k.lm,
    nama: namaLm(k.lm, lm),
    jumlahSiswa: k.jumlah_siswa,
    rata: k.nr_rata === null || k.nr_rata === undefined ? '-' : a(k.nr_rata),
    dipakai: Boolean(k.dipakai),
  }));
}

/** Alasan BELUM_CUKUP paling sering untuk satu pola (alasan dari server sudah berbahasa guru). */
export function alasanBelumCukup(hasil, kode) {
  const hitung = new Map();
  hasil.forEach((h) => {
    const p = h.pola[kode];
    if (p && p.status === 'BELUM_CUKUP' && p.alasan) hitung.set(p.alasan, (hitung.get(p.alasan) || 0) + 1);
  });
  let terbaik = null;
  hitung.forEach((n, alasan) => { if (terbaik === null || n > terbaik.n) terbaik = { alasan, n }; });
  return terbaik ? terbaik.alasan : null;
}
