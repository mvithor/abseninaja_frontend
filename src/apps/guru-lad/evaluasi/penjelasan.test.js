import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KODE_POLA, URUTAN_PRIORITAS, POLA_INFO, definisiPola, dataDibutuhkan, namaLm, namaTp, uraikanBukti,
  susunSiswa, hitungRingkasan, barisKonteks, alasanBelumCukup,
} from './penjelasan.js';

const PARAMETER = {
  ambang_bagian: 41, kktp: 75, ambang_pengayaan: 90, a_min: 3, pertemuan_min: 5, turun_total: 10, turun_relatif: 10, kelas_min: 8, lm_min_p5: 2, tp_min_lm: 2,
};
const LM = [
  { urutan: 1, nama: 'Bilangan Bulat', tp: [{ urutan: 1, kode: '1.1' }, { urutan: 2, kode: '1.2' }] },
  { urutan: 2, nama: 'LM 2 Pecahan', tp: [{ urutan: 1, kode: '' }, { urutan: 2, kode: '2.2' }] },
];
const CTX = { lm: LM, parameter: PARAMETER };

// Bentuk bukti diambil dari keluaran paket aturan pada kasus A (fiktif).
const P1 = {
  tp: [
    {
      lm: 1, tp: 2, nilai: 58, rentang: 'BELUM_MENCAPAI_SEBAGIAN', remedial_terbaru: null, nr_lm: 76, tersembunyi: true,
    },
    {
      lm: 2, tp: 1, nilai: 30.5, rentang: 'BELUM_MENCAPAI_SELURUH', remedial_terbaru: 70, nr_lm: 80, tersembunyi: true,
    },
    {
      lm: 2, tp: 2, nilai: 60, rentang: 'BELUM_MENCAPAI_SEBAGIAN', remedial_terbaru: null, nr_lm: 80, tersembunyi: true,
    },
  ],
  tersembunyi: true,
};
const P2 = {
  jumlah_a: 6,
  pertemuan_a: [7, 9, 10, 12, 14, 15],
  pertemuan_tercatat: 15,
  komposisi: {
    H: 9, S: 0, I: 0, A: 6,
  },
  nr_lm: [{ lm: 1, nr: 84 }, { lm: 2, nr: 73.33 }],
};
const P3 = { proyek: [1, 2], sumatif_tinggi: false };
const P4 = {
  lm: [1, 2, 3], nr: [84, 73.33, 68], total_turun: 16, acuan_kelas: true, nr_kelas: [83.4, 83.14, 83.6], turun_kelas: -0.2, lebih_dari_kelas: 16.2,
};
const P5 = {
  nilai_tp_terendah: 95, nilai_tp_tertinggi: 98, lm: [1, 2, 3], nr: [96, 96, 97],
};

test('namaLm dan namaTp memakai struktur kelas dan tidak menggandakan nomor', () => {
  assert.equal(namaLm(1, LM), 'LM 1. Bilangan Bulat');
  assert.equal(namaLm(2, LM), 'LM 2 Pecahan');
  assert.equal(namaLm(9, LM), 'LM 9');
  assert.equal(namaLm(1, undefined), 'LM 1');
  assert.equal(namaTp(1, 2, LM), 'TP 1.2 (LM 1)');
  assert.equal(namaTp(2, 1, LM), 'TP 1 (LM 2)', 'kode kosong: pakai urutan');
  assert.equal(namaTp(5, 3, LM), 'TP 3 (LM 5)', 'LM tidak dikenal tetap menghasilkan kalimat');
});

test('P1: satu kalimat per TP dengan rentang dan keadaan remedial, plus catatan rata-rata yang menyembunyikan', () => {
  const k = uraikanBukti('P1', P1, CTX);
  assert.equal(k[0], 'TP 1.2 (LM 1): nilai 58, remedial bagian tertentu; belum ada remedial.');
  assert.equal(k[1], 'TP 1 (LM 2): nilai 30,5, remedial seluruh bagian; remedial terbaru 70 masih di bawah KKTP.');
  assert.equal(k[2], 'TP 2.2 (LM 2): nilai 60, remedial bagian tertentu; belum ada remedial.');
  assert.equal(k.length, 5, 'tiga TP + dua LM berbeda yang rata-ratanya menyembunyikan');
  assert.match(k[3], /rata-rata LM 1\. Bilangan Bulat \(76\) sudah mencapai KKTP/);
  assert.match(k[4], /rata-rata LM 2 Pecahan \(80\) sudah mencapai KKTP/);
});

test('P1: remedial bernilai 0 adalah remedial yang sudah ada, bukan "belum ada remedial"', () => {
  const b = { tp: [{ lm: 1, tp: 1, nilai: 50, rentang: 'BELUM_MENCAPAI_SEBAGIAN', remedial_terbaru: 0, nr_lm: 60, tersembunyi: false }], tersembunyi: false };
  const baris = uraikanBukti('P1', b, CTX);
  assert.match(baris[0], /remedial terbaru 0 masih di bawah KKTP/);
  assert.doesNotMatch(baris[0], /belum ada remedial/);
});

test('POLA_INFO: hanya P5 berjenis pengayaan, sisanya perhatian (dipakai untuk warna dan bahasa)', () => {
  assert.deepEqual(KODE_POLA.filter((k) => POLA_INFO[k].jenis === 'pengayaan'), ['P5']);
  assert.deepEqual(KODE_POLA.filter((k) => POLA_INFO[k].jenis === 'perhatian'), ['P1', 'P2', 'P3', 'P4']);
});

test('P1 tanpa tersembunyi tidak menambah catatan rata-rata', () => {
  const k = uraikanBukti('P1', { tp: [{ ...P1.tp[0], tersembunyi: false }], tersembunyi: false }, CTX);
  assert.equal(k.length, 1);
});

test('P2: jumlah alpa, daftar pertemuan, komposisi, dan rata-rata per LM; angka berkoma desimal', () => {
  const k = uraikanBukti('P2', P2, CTX);
  assert.equal(k[0], 'Alpa (A) 6 kali dari 15 pertemuan tercatat (pertemuan 7, 9, 10, 12, 14 dan 15).');
  assert.equal(k[1], 'Hadir 9, sakit 0, izin 0, alpa 6.');
  assert.equal(k[2], 'Rata-rata nilai per LM: LM 1 84; LM 2 73,33.');
  assert.equal(uraikanBukti('P2', { ...P2, nr_lm: [] }, CTX).length, 2);
});

test('P3: proyek yang tidak dikumpulkan; catatan sumatif hanya bila benar, tanpa tafsiran sebab', () => {
  assert.deepEqual(uraikanBukti('P3', P3, CTX), ['Proyek individu 1 dan 2 tidak dikumpulkan (nilai 0).']);
  assert.deepEqual(uraikanBukti('P3', { proyek: [2], sumatif_tinggi: true }, CTX), [
    'Proyek individu 2 tidak dikumpulkan (nilai 0).',
    'Rata-rata semua LM siswa ini berada pada batas pengayaan atau di atasnya.',
  ]);
});

test('P4 dengan pembanding kelas: penurunan siswa, rata-rata kelas, dan selisihnya; kelas yang naik disebut naik', () => {
  const k = uraikanBukti('P4', P4, CTX);
  assert.equal(k[0], 'Rata-rata nilai tiga LM terakhir: LM 1 84, lalu LM 2 73,33, lalu LM 3 68. Total turun 16 poin.');
  assert.equal(k[1], 'Rata-rata kelas pada LM yang sama: LM 1 83,4, LM 2 83,14, LM 3 83,6.');
  assert.equal(k[2], 'Kelas naik 0,2 poin; penurunan siswa ini 16,2 poin lebih besar daripada kelas.');
});

test('P4: kelas yang ikut turun, dan kelas yang tidak berubah', () => {
  assert.match(uraikanBukti('P4', { ...P4, turun_kelas: 4.5, lebih_dari_kelas: 11.5 }, CTX)[2], /^Kelas turun 4,5 poin; penurunan siswa ini 11,5 poin lebih besar/);
  assert.match(uraikanBukti('P4', { ...P4, turun_kelas: 0, lebih_dari_kelas: 16 }, CTX)[2], /^Kelas tidak berubah; penurunan siswa ini 16 poin/);
});

test('P4 tanpa pembanding kelas: menjelaskan bahwa keputusan hanya melihat penurunan siswa itu dan menyebut kelas_min', () => {
  const k = uraikanBukti('P4', {
    lm: [1, 2, 3], nr: [90, 80, 70], total_turun: 20, acuan_kelas: false, nr_kelas: [null, null, null], turun_kelas: null, lebih_dari_kelas: null,
  }, CTX);
  assert.equal(k.length, 2);
  assert.match(k[1], /^Pembanding kelas tidak dipakai karena kurang dari 8 siswa/);
  assert.ok(!k.join(' ').includes('null'));
});

test('P5: rentang nilai TP dan rata-rata per LM', () => {
  const k = uraikanBukti('P5', P5, CTX);
  assert.equal(k[0], 'Semua TP bernilai 95 sampai 98 pada LM 1, 2 dan 3.');
  assert.equal(k[1], 'Rata-rata per LM: LM 1 96; LM 2 96; LM 3 97.');
});

test('uraikanBukti: kode atau bukti yang tidak dikenal menghasilkan daftar kosong, bukan galat', () => {
  assert.deepEqual(uraikanBukti('P9', {}, CTX), []);
  assert.deepEqual(uraikanBukti('P1', null, CTX), []);
  assert.deepEqual(uraikanBukti('P1', undefined, CTX), []);
});

test('tidak ada keluaran yang memuat undefined, NaN, null, [object, atau tanda pisah panjang', () => {
  const semua = [
    ...uraikanBukti('P1', P1, CTX), ...uraikanBukti('P2', P2, CTX), ...uraikanBukti('P3', P3, CTX),
    ...uraikanBukti('P4', P4, CTX), ...uraikanBukti('P5', P5, CTX), ...uraikanBukti('P1', P1, { lm: undefined, parameter: PARAMETER }),
    ...KODE_POLA.map((k) => definisiPola(k, PARAMETER)), ...KODE_POLA.map((k) => dataDibutuhkan(k, PARAMETER)),
    ...Object.values(POLA_INFO).map((x) => x.judul),
  ];
  semua.forEach((t) => assert.ok(!/undefined|NaN|null|\[object|—|–/.test(t), t));
});

test('definisiPola memakai parameter yang dikirim server, bukan angka yang tertanam', () => {
  const p = { ...PARAMETER, a_min: 4, kktp: 66, turun_total: 12, turun_relatif: 7, kelas_min: 5, lm_min_p5: 3, ambang_pengayaan: 86, pertemuan_min: 6 };
  assert.match(definisiPola('P1', p), /KKTP \(66\)/);
  assert.match(definisiPola('P2', p), /paling sedikit 4 pertemuan.*6 pertemuan tercatat/);
  assert.match(definisiPola('P4', p), /paling sedikit 12 poin.*paling sedikit 7 poin.*di bawah 86.*paling sedikit 5 siswa/);
  assert.match(definisiPola('P5', p), /paling sedikit 3 LM bernilai 86 ke atas/);
  assert.equal(definisiPola('PX', p), '');
  assert.match(dataDibutuhkan('P2', p), /6 pertemuan/);
});

const siswa = (id, urutan, penanda, poolUtama, extra = {}) => ({
  siswa_id: id,
  nama: `Siswa ${urutan}`,
  urutan,
  penanda,
  pola_utama: poolUtama,
  pola: Object.fromEntries(KODE_POLA.map((k) => [k, { status: penanda.includes(k) ? 'DITANDAI' : 'TIDAK' }])),
  ...extra,
});

test('susunSiswa: ditandai dulu menurut prioritas pola utama, lalu jumlah penanda, lalu nomor urut', () => {
  const hasil = [
    siswa('a', 1, [], null),
    siswa('b', 2, ['P5'], 'P5'),
    siswa('c', 3, ['P1'], 'P1'),
    siswa('d', 8, ['P2', 'P1'], 'P2'),
    siswa('e', 5, ['P2'], 'P2'),
    siswa('f', 6, ['P4'], 'P4'),
    siswa('g', 7, ['P3'], 'P3'),
  ];
  const urut = susunSiswa(hasil).map((h) => h.siswa_id);
  assert.deepEqual(urut, ['d', 'e', 'g', 'c', 'f', 'b'], 'P2 (dua penanda lebih dulu), P3, P1, P4, P5; tanpa penanda tidak ikut');
  assert.deepEqual(susunSiswa(hasil, { hanyaDitandai: false }).map((h) => h.siswa_id), ['d', 'e', 'g', 'c', 'f', 'b', 'a']);
  assert.deepEqual(URUTAN_PRIORITAS, ['P2', 'P3', 'P1', 'P4', 'P5']);
});

test('susunSiswa: saringan pola memilih siswa yang punya pola itu di antara penandanya, dan tidak mengubah masukan', () => {
  const hasil = [siswa('a', 1, ['P1'], 'P1'), siswa('b', 2, ['P2', 'P1'], 'P2'), siswa('c', 3, ['P4'], 'P4')];
  const salinan = JSON.stringify(hasil);
  assert.deepEqual(susunSiswa(hasil, { pola: ['P1'] }).map((h) => h.siswa_id), ['b', 'a']);
  assert.deepEqual(susunSiswa(hasil, { pola: ['P1', 'P4'] }).map((h) => h.siswa_id), ['b', 'a', 'c']);
  assert.deepEqual(susunSiswa(hasil, { pola: ['P5'] }), []);
  assert.equal(JSON.stringify(hasil), salinan);
});

test('susunSiswa: urutan imbang bersifat tetap (nomor urut, lalu ID numerik alami)', () => {
  const hasil = [siswa('A-10', 5, ['P1'], 'P1'), siswa('A-02', 5, ['P1'], 'P1'), siswa('A-1', 2, ['P1'], 'P1')];
  assert.deepEqual(susunSiswa(hasil).map((h) => h.siswa_id), ['A-1', 'A-02', 'A-10']);
});

test('hitungRingkasan: ditandai per pola, data belum cukup per pola, dan galat tidak dianggap aman', () => {
  const hasil = [
    siswa('a', 1, ['P1'], 'P1', { pola: { ...siswa('a', 1, ['P1'], 'P1').pola, P2: { status: 'BELUM_CUKUP', alasan: 'Baru 3 pertemuan tercatat; dibutuhkan paling sedikit 5.' } } }),
    siswa('b', 2, ['P1', 'P4'], 'P1', { pola: { ...siswa('b', 2, ['P1', 'P4'], 'P1').pola, P2: { status: 'BELUM_CUKUP', alasan: 'Baru 3 pertemuan tercatat; dibutuhkan paling sedikit 5.' } } }),
    siswa('c', 3, [], null),
  ];
  const r = hitungRingkasan({ hasil, galat: [{ siswa_id: 9 }] });
  assert.equal(r.jumlahSiswa, 3);
  assert.equal(r.ditandai, 2);
  assert.deepEqual(r.perPola, { P1: 2, P2: 0, P3: 0, P4: 1, P5: 0 });
  assert.deepEqual(r.belumCukup, { P1: 0, P2: 2, P3: 0, P4: 0, P5: 0 });
  assert.equal(r.jumlahGalat, 1);
  assert.equal(hitungRingkasan({ hasil: [], galat: undefined }).jumlahGalat, 0);
  assert.equal(alasanBelumCukup(hasil, 'P2'), 'Baru 3 pertemuan tercatat; dibutuhkan paling sedikit 5.');
  assert.equal(alasanBelumCukup(hasil, 'P1'), null);
});

test('alasanBelumCukup: memilih alasan yang paling sering muncul', () => {
  const mk = (alasan) => siswa('x', 1, [], null, { pola: { P3: { status: 'BELUM_CUKUP', alasan } } });
  assert.equal(alasanBelumCukup([mk('a'), mk('b'), mk('b')], 'P3'), 'b');
});

test('barisKonteks: rata-rata kelas per LM dengan nama LM, koma desimal, dan penanda dipakai atau tidak', () => {
  const b = barisKonteks([
    { lm: 1, jumlah_siswa: 30, nr_rata: 83.4, dipakai: true },
    { lm: 2, jumlah_siswa: 6, nr_rata: 70, dipakai: false },
    { lm: 3, jumlah_siswa: 0, nr_rata: null, dipakai: false },
  ], LM);
  assert.deepEqual(b[0], { lm: 1, nama: 'LM 1. Bilangan Bulat', jumlahSiswa: 30, rata: '83,4', dipakai: true });
  assert.equal(b[1].dipakai, false);
  assert.equal(b[2].rata, '-');
  assert.deepEqual(barisKonteks(undefined, LM), []);
});
