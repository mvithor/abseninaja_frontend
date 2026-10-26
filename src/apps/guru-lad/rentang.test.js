import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BAWAAN_AMBANG, RENTANG, bacaAmbang, periksaAmbang, rentangNilai, legendaRentang, ISI_IKON, tampilAngka, ringkasAmbang,
} from './rentang.js';

const A = BAWAAN_AMBANG;

test('bawaan mengikuti template guru: 41, 66, 86', () => {
  assert.deepEqual({ ...BAWAAN_AMBANG }, { ambang_bagian: 41, kktp: 66, ambang_pengayaan: 86 });
  assert.equal(Object.isFrozen(BAWAAN_AMBANG), true);
});

test('rentangNilai: nilai tepat di ambang masuk rentang di atasnya', () => {
  const r = (v) => rentangNilai(v, A);
  assert.equal(r(null), RENTANG.BELUM_DINILAI);
  assert.equal(r(undefined), RENTANG.BELUM_DINILAI);
  assert.equal(r(0), RENTANG.SELURUH);
  assert.equal(r(40.99), RENTANG.SELURUH);
  assert.equal(r(41), RENTANG.SEBAGIAN);
  assert.equal(r(65.99), RENTANG.SEBAGIAN);
  assert.equal(r(66), RENTANG.MENCAPAI);
  assert.equal(r(85.99), RENTANG.MENCAPAI);
  assert.equal(r(86), RENTANG.PENGAYAAN);
  assert.equal(r(100), RENTANG.PENGAYAAN);
});

test('rentangNilai: 0 adalah nilai (rentang pertama), bukan "belum dinilai"', () => {
  assert.equal(rentangNilai(0, A), RENTANG.SELURUH);
  assert.notEqual(rentangNilai(0, A), RENTANG.BELUM_DINILAI);
});

test('rentangNilai: tidak terkecoh galat floating point dan menerima ambang berupa teks dari server', () => {
  const dariServer = { ambang_bagian: '41.00', kktp: '75.00', ambang_pengayaan: '90.00' };
  assert.equal(rentangNilai(74.99, dariServer), RENTANG.SEBAGIAN);
  assert.equal(rentangNilai(75, dariServer), RENTANG.MENCAPAI);
  assert.equal(rentangNilai(89.99, dariServer), RENTANG.MENCAPAI);
  assert.equal(rentangNilai(90, dariServer), RENTANG.PENGAYAAN);
  assert.equal(rentangNilai(0.07 + 0.01, { ambang_bagian: 0.08, kktp: 50, ambang_pengayaan: 90 }), RENTANG.SEBAGIAN);
});

test('bacaAmbang: koma dan titik, paling banyak dua desimal, di antara 0 dan 100', () => {
  assert.deepEqual(bacaAmbang('66'), { centi: 6600 });
  assert.deepEqual(bacaAmbang(' 85,5 '), { centi: 8550 });
  assert.deepEqual(bacaAmbang('85.25'), { centi: 8525 });
  assert.deepEqual(bacaAmbang('100'), { centi: 10000 });
  assert.ok(bacaAmbang('').galat);
  assert.ok(bacaAmbang('abc').galat);
  assert.ok(bacaAmbang('66,123').galat);
  assert.ok(bacaAmbang('100,5').galat);
  assert.ok(bacaAmbang('101').galat);
  assert.ok(bacaAmbang('-5').galat);
});

test('periksaAmbang: urutan 0 < bagian < KKTP < pengayaan <= 100', () => {
  assert.deepEqual(periksaAmbang({ ambang_bagian: '41', kktp: '66', ambang_pengayaan: '86' }), {});
  assert.deepEqual(periksaAmbang({ ambang_bagian: '41', kktp: '75', ambang_pengayaan: '100' }), {});
  assert.ok(periksaAmbang({ ambang_bagian: '0', kktp: '66', ambang_pengayaan: '86' }).ambang_bagian);
  assert.ok(periksaAmbang({ ambang_bagian: '66', kktp: '66', ambang_pengayaan: '86' }).kktp);
  assert.ok(periksaAmbang({ ambang_bagian: '70', kktp: '66', ambang_pengayaan: '86' }).kktp);
  assert.ok(periksaAmbang({ ambang_bagian: '41', kktp: '66', ambang_pengayaan: '66' }).ambang_pengayaan);
  assert.ok(periksaAmbang({ ambang_bagian: '41', kktp: '66', ambang_pengayaan: '60' }).ambang_pengayaan);
  assert.ok(periksaAmbang({ ambang_bagian: '41', kktp: '66', ambang_pengayaan: '100,01' }).ambang_pengayaan);
});

test('periksaAmbang: isian kosong atau rusak dilaporkan per kolom tanpa menimpa galat lain', () => {
  const g = periksaAmbang({ ambang_bagian: '', kktp: 'x', ambang_pengayaan: '86' });
  assert.ok(g.ambang_bagian);
  assert.ok(g.kktp);
  assert.equal(g.ambang_pengayaan, undefined);
});

test('legendaRentang: empat baris dengan rentang angka menurut ambang kelas', () => {
  const l = legendaRentang({ ambang_bagian: '41.00', kktp: '75.00', ambang_pengayaan: '90.00' });
  assert.equal(l.length, 4);
  assert.deepEqual(l.map((x) => x.rentang), [RENTANG.SELURUH, RENTANG.SEBAGIAN, RENTANG.MENCAPAI, RENTANG.PENGAYAAN]);
  assert.equal(l[0].batas, 'di bawah 41');
  assert.equal(l[1].batas, '41 sampai di bawah 75');
  assert.equal(l[2].batas, '75 sampai di bawah 90');
  assert.equal(l[3].batas, '90 ke atas');
  assert.equal(legendaRentang({ ambang_bagian: 40.5, kktp: 66, ambang_pengayaan: 85.5 })[0].batas, 'di bawah 40,5');
});

test('ISI_IKON naik tegas menurut rentang supaya status terbaca tanpa warna', () => {
  const nilai = [RENTANG.SELURUH, RENTANG.SEBAGIAN, RENTANG.MENCAPAI, RENTANG.PENGAYAAN].map((k) => ISI_IKON[k]);
  assert.deepEqual(nilai, [0.25, 0.5, 0.75, 1]);
  assert.equal(ISI_IKON[RENTANG.BELUM_DINILAI], undefined);
});

test('tampilAngka: koma desimal', () => {
  assert.equal(tampilAngka(85.5), '85,5');
  assert.equal(tampilAngka('66.00'), '66,00');
  assert.equal(tampilAngka(null), '');
});

test('ringkasAmbang: tiga batas dengan koma desimal, menerima angka maupun teks', () => {
  assert.equal(ringkasAmbang({ ambang_bagian: 41, kktp: 66, ambang_pengayaan: 86 }), '41 / 66 / 86');
  assert.equal(ringkasAmbang({ ambang_bagian: '41.00', kktp: '75.50', ambang_pengayaan: '90.00' }), '41 / 75,5 / 90');
});
