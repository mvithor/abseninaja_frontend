import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JENIS_PROYEK, TEKS_JENIS, MAKS_NAMA_PROYEK, labelProyek, periksaFormProyek, tidakDikumpulkan, hitungJenis,
} from './proyek.js';

test('labelProyek: nama dipangkas; nama kosong jatuh ke "Proyek n"', () => {
  assert.equal(labelProyek({ nama: '  Poster Ekosistem ', urutan: 2 }), 'Poster Ekosistem');
  assert.equal(labelProyek({ nama: '   ', urutan: 3 }), 'Proyek 3');
  assert.equal(labelProyek({ urutan: 1 }), 'Proyek 1');
});

test('periksaFormProyek: nama wajib dan paling panjang 200, jenis harus individu atau kelompok', () => {
  assert.deepEqual(periksaFormProyek({ nama: 'Poster', jenis: 'INDIVIDU' }), {});
  assert.deepEqual(periksaFormProyek({ nama: 'Poster', jenis: 'KELOMPOK' }), {});
  assert.equal(periksaFormProyek({ nama: '   ', jenis: 'INDIVIDU' }).nama, 'Nama proyek wajib diisi');
  assert.equal(periksaFormProyek({ jenis: 'INDIVIDU' }).nama, 'Nama proyek wajib diisi');
  assert.deepEqual(periksaFormProyek({ nama: 'x'.repeat(MAKS_NAMA_PROYEK), jenis: 'INDIVIDU' }), {});
  assert.match(periksaFormProyek({ nama: 'x'.repeat(MAKS_NAMA_PROYEK + 1), jenis: 'INDIVIDU' }).nama, /200/);
  assert.equal(periksaFormProyek({ nama: 'a', jenis: 'individu' }).jenis, 'Pilih individu atau kelompok');
  assert.equal(periksaFormProyek({ nama: 'a' }).jenis, 'Pilih individu atau kelompok');
  assert.deepEqual(Object.keys(periksaFormProyek({})).sort(), ['jenis', 'nama']);
});

test('tidakDikumpulkan: hanya nol pada proyek INDIVIDU; kosong, nol kelompok, dan nilai lain bukan', () => {
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, 0), true);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, null), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, undefined), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, 0.5), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, 80), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.KELOMPOK, 0), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, ''), false, 'teks kosong bukan nol');
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, false), false);
  assert.equal(tidakDikumpulkan(JENIS_PROYEK.INDIVIDU, '0'), false, 'hanya bilangan 0, bukan teks');
});

test('hitungJenis dan TEKS_JENIS', () => {
  assert.deepEqual(hitungJenis([{ jenis: 'INDIVIDU' }, { jenis: 'INDIVIDU' }, { jenis: 'KELOMPOK' }]), { individu: 2, kelompok: 1 });
  assert.deepEqual(hitungJenis(undefined), { individu: 0, kelompok: 0 });
  assert.equal(TEKS_JENIS.INDIVIDU, 'Individu');
  assert.equal(TEKS_JENIS.KELOMPOK, 'Kelompok');
});
