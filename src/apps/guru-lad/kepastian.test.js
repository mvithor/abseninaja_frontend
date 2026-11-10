import test from 'node:test';
import assert from 'node:assert/strict';
import { KEPASTIAN, kepastianSimpan, pesanSimpanGagal, teksTidakPasti } from './kepastian.js';

const axiosTanpaJawaban = (code) => Object.assign(new Error('x'), { isAxiosError: true, code });
const dengan = (status) => Object.assign(new Error('x'), { isAxiosError: true, response: { status, data: {} } });

test('batas waktu dan jaringan putus tidak pasti: server mungkin sudah menyimpan', () => {
  assert.equal(kepastianSimpan(axiosTanpaJawaban('ECONNABORTED')), KEPASTIAN.TIDAK_PASTI);
  assert.equal(kepastianSimpan(axiosTanpaJawaban('ERR_NETWORK')), KEPASTIAN.TIDAK_PASTI);
  assert.equal(kepastianSimpan(axiosTanpaJawaban(undefined)), KEPASTIAN.TIDAK_PASTI);
  assert.equal(kepastianSimpan(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' })), KEPASTIAN.TIDAK_PASTI);
});

test('perantara yang gagal menjawab (408, 502, 503, 504) tidak pasti', () => {
  for (const s of [408, 502, 503, 504]) assert.equal(kepastianSimpan(dengan(s)), KEPASTIAN.TIDAK_PASTI, `status ${s}`);
});

test('server menjawab dan menolak: pasti belum tersimpan', () => {
  for (const s of [400, 401, 403, 404, 409, 413, 422, 429, 500]) assert.equal(kepastianSimpan(dengan(s)), KEPASTIAN.PASTI_GAGAL, `status ${s}`);
});

test('galat program (bukan axios, tanpa jawaban) tidak dianggap mungkin tersimpan', () => {
  assert.equal(kepastianSimpan(new TypeError('x is undefined')), KEPASTIAN.PASTI_GAGAL);
  assert.equal(kepastianSimpan(undefined), KEPASTIAN.PASTI_GAGAL);
  assert.equal(kepastianSimpan(null), KEPASTIAN.PASTI_GAGAL);
});

test('pesan tidak pasti memakai peringatan yang tidak hilang sendiri, menyebut objek, dan menjanjikan simpan ulang aman', () => {
  const p = pesanSimpanGagal(axiosTanpaJawaban('ECONNABORTED'), { teksPasti: 'tidak dipakai', objek: 'nilai' });
  assert.equal(p.jenis, 'warning');
  assert.equal(p.tidakPasti, true);
  assert.match(p.teks, /belum pasti apakah nilai sudah tersimpan/);
  assert.match(p.teks, /Menyimpan ulang aman/);
  assert.doesNotMatch(p.teks, /\bAnda\b/);
  assert.doesNotMatch(p.teks, /belum tersimpan\. Coba lagi/, 'tidak boleh menyatakan pasti gagal');
});

test('pesan pasti gagal memakai teks dari server dan severity error', () => {
  const p = pesanSimpanGagal(dengan(422), { teksPasti: 'Baris 3: nilai harus 0 sampai 100', objek: 'nilai' });
  assert.deepEqual(p, { jenis: 'error', teks: 'Baris 3: nilai harus 0 sampai 100' });
});

test('kalimat tidak pasti dibangun dari objek yang diberikan', () => {
  assert.match(teksTidakPasti('kehadiran'), /apakah kehadiran sudah tersimpan/);
});
