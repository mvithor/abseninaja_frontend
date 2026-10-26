import test from 'node:test';
import assert from 'node:assert/strict';
import { labelKolom, pesanDariRespons, galatPerKolom } from './galat.js';

test('labelKolom: indeks server (dari 0) menjadi nomor baris guru (dari 1), kolom teknis menjadi label', () => {
  assert.equal(labelKolom('siswa[0].nis'), 'Baris 1, NIS');
  assert.equal(labelKolom('siswa[23].nama'), 'Baris 24, Nama');
  assert.equal(labelKolom('sel[2]'), 'Sel 3');
  assert.equal(labelKolom('nama'), 'Nama');
  assert.equal(labelKolom('bobot_sas'), 'Bobot sas');
  assert.equal(labelKolom('-'), '');
  assert.equal(labelKolom(undefined), '');
});

test('pesanDariRespons: galat penambahan siswa tidak lagi membocorkan nama kolom teknis', () => {
  const data = {
    msg: 'Data tidak sah',
    galat: [0, 1].map((i) => ({ kolom: `siswa[${i}].nis`, pesan: 'NIS sudah dipakai siswa lain di kelas ini', indeks: i })),
  };
  const p = pesanDariRespons(data);
  assert.equal(p, 'Data tidak sah: Baris 1, NIS: NIS sudah dipakai siswa lain di kelas ini; Baris 2, NIS: NIS sudah dipakai siswa lain di kelas ini');
  assert.ok(!/siswa\[/.test(p));
});

test('pesanDariRespons: dibatasi lima rincian dengan penanda sisanya', () => {
  const galat = Array.from({ length: 8 }, (_, i) => ({ kolom: `siswa[${i}].nis`, pesan: 'x' }));
  const p = pesanDariRespons({ msg: 'Data tidak sah', galat });
  assert.ok(p.endsWith('dan 3 galat lainnya'));
  assert.ok(p.includes('Baris 5, NIS: x'));
  assert.ok(!p.includes('Baris 6'));
});

test('pesanDariRespons: tanpa rincian, tanpa pesan, dan kolom "-"', () => {
  assert.equal(pesanDariRespons({ msg: 'Kelas tidak ditemukan' }), 'Kelas tidak ditemukan');
  assert.equal(pesanDariRespons({}, 'cadangan'), 'cadangan');
  assert.equal(pesanDariRespons({ galat: [{ kolom: '-', pesan: 'Terlalu banyak' }] }), 'Terlalu banyak');
  assert.equal(pesanDariRespons(undefined, 'cadangan'), 'cadangan');
});

test('label ambang rentang memakai bahasa guru, bukan nama kolom teknis', () => {
  assert.equal(labelKolom('ambang_bagian'), 'Batas remedial bagian tertentu');
  assert.equal(labelKolom('ambang_pengayaan'), 'Batas pengayaan');
  assert.equal(labelKolom('kktp'), 'KKTP');
  const p = pesanDariRespons({
    msg: 'Ambang rentang KKTP tidak sah menurut aturan',
    galat: [{ kolom: 'ambang_pengayaan', pesan: 'harus lebih besar dari kktp' }],
  });
  assert.equal(p, 'Ambang rentang KKTP tidak sah menurut aturan: Batas pengayaan: harus lebih besar dari kktp');
});

test('galatPerKolom: peta kolom ke pesan, kolom pertama menang, "-" dan tanpa kolom diabaikan', () => {
  const peta = galatPerKolom({
    galat: [
      { kolom: 'kktp', pesan: 'a' }, { kolom: 'kktp', pesan: 'b' }, { kolom: '-', pesan: 'c' }, { pesan: 'd' },
      { kolom: 'ambang_bagian', pesan: 'e' },
    ],
  });
  assert.deepEqual(peta, { kktp: 'a', ambang_bagian: 'e' });
  assert.deepEqual(galatPerKolom(undefined), {});
  assert.deepEqual(galatPerKolom({ galat: 'bukan daftar' }), {});
});
