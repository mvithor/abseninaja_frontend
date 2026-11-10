import test from 'node:test';
import assert from 'node:assert/strict';
import { adalahKategoriBawaan, judulAksiKategori, PESAN_KATEGORI_BAWAAN } from './kategori.js';

test('kategori bawaan dikenali dari kode_sistem, bukan dari nama', () => {
  assert.equal(adalahKategoriBawaan({ nama_kategori: 'Guru', kode_sistem: 'GURU' }), true);
  assert.equal(adalahKategoriBawaan({ nama_kategori: 'Staf', kode_sistem: 'STAF' }), true);
  assert.equal(adalahKategoriBawaan({ nama_kategori: 'Guru', kode_sistem: null }), false);
  assert.equal(adalahKategoriBawaan({ nama_kategori: 'Guru' }), false);
  assert.equal(adalahKategoriBawaan({ kode_sistem: '' }), false);
  assert.equal(adalahKategoriBawaan(undefined), false);
});

test('judul aksi: bawaan memberi alasan terkunci, biasa memberi nama aksi', () => {
  assert.equal(judulAksiKategori({ kode_sistem: 'GURU' }, 'hapus'), PESAN_KATEGORI_BAWAAN);
  assert.equal(judulAksiKategori({ kode_sistem: 'GURU' }, 'edit'), PESAN_KATEGORI_BAWAAN);
  assert.equal(judulAksiKategori({ kode_sistem: null }, 'hapus'), 'Hapus');
  assert.equal(judulAksiKategori({ kode_sistem: null }, 'edit'), 'Edit');
});
