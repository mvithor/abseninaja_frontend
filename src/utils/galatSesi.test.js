import test from 'node:test';
import assert from 'node:assert/strict';
import { adalahGalat401Bisnis } from './galatSesi.js';

const galat = (status, data) => ({ response: { status, data } });

test('401 dengan kode bisnis ganti sandi bukan akhir sesi', () => {
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' })), true);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'TIKET_TIDAK_VALID' })), true);
});

test('401 tanpa kode, kode lain, atau status lain tetap dianggap sesi berakhir', () => {
  assert.equal(adalahGalat401Bisnis(galat(401, { msg: 'Token tidak valid' })), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'KODE_LAIN' })), false);
  assert.equal(adalahGalat401Bisnis(galat(403, { kode: 'SANDI_LAMA_SALAH' })), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: ['SANDI_LAMA_SALAH'] })), false);
  assert.equal(adalahGalat401Bisnis(undefined), false);
});
