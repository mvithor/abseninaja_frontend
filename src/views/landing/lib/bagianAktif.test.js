// Tes pemilihan bagian aktif navigasi jangkar (lib/bagianAktif.js).
// Jalankan: node --test src/views/landing/lib/
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pilihBagianAktif } from './bagianAktif.js';

const URUTAN = ['a', 'b', 'c'];

describe('pilihBagianAktif', () => {
  it('satu bagian memotong garis baca: itu yang aktif', () => {
    assert.equal(pilihBagianAktif({ skor: { a: 0, b: 12, c: 0 }, urutan: URUTAN }), 'b');
  });

  it('dua bagian memotong: skor tertinggi menang', () => {
    assert.equal(pilihBagianAktif({ skor: { a: 9, b: 3 }, urutan: URUTAN }), 'a');
  });

  it('skor seri: bagian yang lebih bawah menang', () => {
    assert.equal(pilihBagianAktif({ skor: { a: 5, b: 5 }, urutan: URUTAN }), 'b');
  });

  it('tidak ada yang memotong: bagian sebelumnya bertahan', () => {
    assert.equal(pilihBagianAktif({ skor: { a: 0, b: 0, c: 0 }, urutan: URUTAN, sebelumnya: 'b' }), 'b');
  });

  it('tidak ada yang memotong dan masih di atas bagian pertama: null', () => {
    assert.equal(
      pilihBagianAktif({ skor: {}, urutan: URUTAN, sebelumnya: 'b', diAtasBagianPertama: true }),
      null,
    );
  });

  it('tanpa data sama sekali: null', () => {
    assert.equal(pilihBagianAktif({ skor: {}, urutan: URUTAN }), null);
  });

  it('id yang tidak ada di urutan diabaikan', () => {
    assert.equal(pilihBagianAktif({ skor: { z: 99, c: 1 }, urutan: URUTAN }), 'c');
  });
});
