import test from 'node:test';
import assert from 'node:assert/strict';
import { judulLm, labelTp } from './label.js';

test('judulLm: menambahkan nomor LM bila nama belum memuatnya', () => {
  assert.equal(judulLm({ urutan: 2, nama: 'Aljabar' }), 'LM 2. Aljabar');
});

test('judulLm: tidak menggandakan bila guru sudah menulis LM atau Lingkup Materi dengan nomor', () => {
  assert.equal(judulLm({ urutan: 1, nama: 'LM 1 Bilangan' }), 'LM 1 Bilangan');
  assert.equal(judulLm({ urutan: 1, nama: 'lm1: Bilangan' }), 'lm1: Bilangan');
  assert.equal(judulLm({ urutan: 2, nama: 'Lingkup Materi 2 - Aljabar' }), 'Lingkup Materi 2 - Aljabar');
});

test('judulLm: nama yang kebetulan berawalan "Bab 1" tetap diberi nomor LM, dan nama kosong aman', () => {
  assert.equal(judulLm({ urutan: 1, nama: 'Bab 1' }), 'LM 1. Bab 1');
  assert.equal(judulLm({ urutan: 3, nama: '  ' }), 'LM 3');
  assert.equal(judulLm({ urutan: 3 }), 'LM 3');
});

test('labelTp: kode bila ada, kalau tidak TP urutan', () => {
  assert.equal(labelTp({ urutan: 2, kode: '1.2' }), '1.2');
  assert.equal(labelTp({ urutan: 2, kode: ' ' }), 'TP 2');
  assert.equal(labelTp({ urutan: 4 }), 'TP 4');
});
