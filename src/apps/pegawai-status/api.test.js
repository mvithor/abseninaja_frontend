import test from 'node:test';
import assert from 'node:assert/strict';
import { KUNCI, KUNCI_TERDAMPAK, urlPegawai } from './api.js';

test('dua dropdown pegawai memakai kunci cache berbeda', () => {
  assert.notEqual(KUNCI.dropdownGuru, KUNCI.dropdownPegawai);
});

test('perubahan status meng-invalidate daftar, dropdown, dan halaman nonaktif', () => {
  for (const k of [KUNCI.nonaktif, KUNCI.perluPengganti, KUNCI.guru, KUNCI.staf, KUNCI.dropdownGuru, KUNCI.dropdownPegawai]) {
    assert.ok(KUNCI_TERDAMPAK.includes(k), k);
  }
});

test('urlPegawai', () => {
  assert.equal(urlPegawai(7, 'nonaktifkan'), '/api/v1/admin-sekolah/pegawai/7/nonaktifkan');
});
