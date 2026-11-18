// Tes hitung mundur promo (lib/hitungMundur.js).
// Jalankan: node --test src/views/landing/lib/
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { duaDigit, hitungSisa } from './hitungMundur.js';
import { AKHIR_PROMO, AKHIR_PROMO_MS } from '../data/promo.js';

const DETIK = 1000;
const MENIT = 60 * DETIK;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
const AKHIR = Date.parse('2027-01-31T23:59:59+07:00');

describe('konstanta AKHIR_PROMO', () => {
  it('31 Januari 2027 akhir hari WIB (+07:00)', () => {
    assert.equal(AKHIR_PROMO, '2027-01-31T23:59:59+07:00');
    assert.equal(AKHIR_PROMO_MS, AKHIR);
    assert.equal(new Date(AKHIR_PROMO_MS).toISOString(), '2027-01-31T16:59:59.000Z');
  });
});

describe('hitungSisa', () => {
  it('batas tepat: sisa 0 = berakhir; 1 ms sebelumnya belum berakhir', () => {
    assert.deepEqual(hitungSisa(AKHIR, AKHIR), { berakhir: true, hari: 0, jam: 0, menit: 0 });
    assert.deepEqual(hitungSisa(AKHIR - 1, AKHIR), { berakhir: false, hari: 0, jam: 0, menit: 0 });
  });

  it('sudah lewat: berakhir dengan nol semua', () => {
    for (const lewat of [1, DETIK, HARI, 400 * HARI]) {
      assert.deepEqual(hitungSisa(AKHIR + lewat, AKHIR), { berakhir: true, hari: 0, jam: 0, menit: 0 });
    }
  });

  it('menghitung hari, jam, menit (dibulatkan ke bawah)', () => {
    const sekarang = AKHIR - (14 * HARI + 8 * JAM + 36 * MENIT + 30 * DETIK);
    assert.deepEqual(hitungSisa(sekarang, AKHIR), { berakhir: false, hari: 14, jam: 8, menit: 36 });
  });

  it('tepat satu menit, satu jam, satu hari', () => {
    assert.deepEqual(hitungSisa(AKHIR - MENIT, AKHIR), { berakhir: false, hari: 0, jam: 0, menit: 1 });
    assert.deepEqual(hitungSisa(AKHIR - JAM, AKHIR), { berakhir: false, hari: 0, jam: 1, menit: 0 });
    assert.deepEqual(hitungSisa(AKHIR - HARI, AKHIR), { berakhir: false, hari: 1, jam: 0, menit: 0 });
  });

  it('59 detik tersisa: 0 menit tetapi belum berakhir', () => {
    assert.deepEqual(hitungSisa(AKHIR - 59 * DETIK, AKHIR), { berakhir: false, hari: 0, jam: 0, menit: 0 });
  });

  it('melintasi bulan dan tahun: dari 1 Januari 2027 (WIB) tersisa 30 hari 23 jam 59 menit', () => {
    const sekarang = Date.parse('2027-01-01T00:00:00+07:00');
    assert.deepEqual(hitungSisa(sekarang, AKHIR), { berakhir: false, hari: 30, jam: 23, menit: 59 });
    const desember = Date.parse('2026-12-31T00:00:00+07:00');
    assert.deepEqual(hitungSisa(desember, AKHIR), { berakhir: false, hari: 31, jam: 23, menit: 59 });
  });

  it('zona waktu: 31 Januari 2027 17:00 UTC sudah lewat akhir hari WIB', () => {
    assert.equal(hitungSisa(Date.parse('2027-01-31T17:00:00Z'), AKHIR).berakhir, true);
    assert.equal(hitungSisa(Date.parse('2027-01-31T16:59:00Z'), AKHIR).berakhir, false);
  });

  it('masukan bukan angka terhingga dianggap berakhir (aman, tidak melempar)', () => {
    for (const buruk of [NaN, Infinity, -Infinity, undefined, null, '1', {}]) {
      assert.deepEqual(hitungSisa(buruk, AKHIR), { berakhir: true, hari: 0, jam: 0, menit: 0 }, String(buruk));
      assert.deepEqual(hitungSisa(AKHIR - HARI, buruk), { berakhir: true, hari: 0, jam: 0, menit: 0 }, String(buruk));
    }
  });
});

describe('duaDigit', () => {
  it('menambah nol di depan sampai dua digit', () => {
    assert.equal(duaDigit(0), '00');
    assert.equal(duaDigit(5), '05');
    assert.equal(duaDigit(36), '36');
    assert.equal(duaDigit(100), '100');
  });

  it('negatif atau pecahan dirapikan', () => {
    assert.equal(duaDigit(-3), '00');
    assert.equal(duaDigit(7.9), '07');
  });
});
