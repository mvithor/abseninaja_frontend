import test from 'node:test';
import assert from 'node:assert/strict';
import { adalahGalat401Bisnis } from './galatSesi.js';

const galat = (status, data, url = '/api/v1/auth/ganti-sandi') => ({ config: { url }, response: { status, data } });

test('401 SANDI_LAMA_SALAH dari endpoint ganti sandi bukan akhir sesi', () => {
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' })), true);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' }, '/api/v1/auth/ganti-sandi?x=1')), true);
});

test('kode yang sama dari endpoint lain tetap dianggap sesi berakhir', () => {
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' }, '/api/v1/lad/kelas')), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' }, '/api/v1/auth/ganti-sandi-awal')), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'SANDI_LAMA_SALAH' }, null)), false);
});

test('401 tanpa kode, kode lain, atau status lain tetap dianggap sesi berakhir', () => {
  assert.equal(adalahGalat401Bisnis(galat(401, { msg: 'Token tidak valid' })), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: 'TIKET_TIDAK_VALID' })), false);
  assert.equal(adalahGalat401Bisnis(galat(403, { kode: 'SANDI_LAMA_SALAH' })), false);
  assert.equal(adalahGalat401Bisnis(galat(401, { kode: ['SANDI_LAMA_SALAH'] })), false);
  assert.equal(adalahGalat401Bisnis(undefined), false);
});
