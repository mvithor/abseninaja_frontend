// Tes fungsi murni tombol geser bar tab (lib/geserTab.js).
// Jalankan: node --test "src/views/landing/lib/*.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { panahNonaktif, tabTetangga } from './geserTab.js';

const tab = ['a', 'b', 'c', 'd'].map((id) => ({ id }));

describe('tabTetangga', () => {
  it('tab di kiri dan kanan tab aktif', () => {
    assert.equal(tabTetangga(tab, 'b', -1), 'a');
    assert.equal(tabTetangga(tab, 'b', 1), 'c');
    assert.equal(tabTetangga(tab, 'c', 1), 'd');
    assert.equal(tabTetangga(tab, 'c', -1), 'b');
  });

  it('di ujung tidak berputar: null', () => {
    assert.equal(tabTetangga(tab, 'a', -1), null);
    assert.equal(tabTetangga(tab, 'd', 1), null);
  });

  it('aktif yang tidak ada dianggap tab pertama', () => {
    assert.equal(tabTetangga(tab, 'zzz', 1), 'b');
    assert.equal(tabTetangga(tab, 'zzz', -1), null);
    assert.equal(tabTetangga(tab, undefined, 1), 'b');
  });

  it('arah selain -1 dan 1 -> null', () => {
    [0, 2, -2, 0.5, '1', null, undefined, NaN].forEach((arah) => assert.equal(tabTetangga(tab, 'b', arah), null, String(arah)));
  });

  it('daftar kosong atau bukan array -> null', () => {
    assert.equal(tabTetangga([], 'a', 1), null);
    assert.equal(tabTetangga(undefined, 'a', 1), null);
    assert.equal(tabTetangga(null, 'a', -1), null);
    assert.equal(tabTetangga('abc', 'a', 1), null);
  });

  it('satu tab: tidak ada tetangga', () => {
    assert.equal(tabTetangga([{ id: 'a' }], 'a', 1), null);
    assert.equal(tabTetangga([{ id: 'a' }], 'a', -1), null);
  });

  it('butir tanpa id sah dilewati, bukan menghentikan geser', () => {
    const campur = [{ id: 'a' }, null, {}, { id: '' }, { id: 5 }, { id: 'c' }, undefined, { id: 'd' }];
    assert.equal(tabTetangga(campur, 'a', 1), 'c');
    assert.equal(tabTetangga(campur, 'c', -1), 'a');
    assert.equal(tabTetangga(campur, 'c', 1), 'd');
    assert.equal(tabTetangga(campur, 'd', 1), null);
    assert.equal(tabTetangga(campur, 'a', -1), null);
  });

  it('id undefined tidak cocok dengan butir tanpa id', () => {
    const campur = [{}, { id: 'a' }, { id: 'b' }];
    // aktif tidak ada: dianggap tab sah pertama ('a'), bukan butir tanpa id.
    assert.equal(tabTetangga(campur, undefined, 1), 'b');
    assert.equal(tabTetangga(campur, undefined, -1), null);
  });

  it('semua butir tanpa id sah: tidak ada tetangga', () => {
    assert.equal(tabTetangga([null, {}, { id: '' }], 'a', 1), null);
    assert.deepEqual(panahNonaktif([null, {}], 'a'), { kiri: true, kanan: true });
  });

  it('menelusuri seluruh daftar dari kiri ke kanan dan kembali', () => {
    const maju = [];
    let id = 'a';
    while (id !== null) { maju.push(id); id = tabTetangga(tab, id, 1); }
    assert.deepEqual(maju, ['a', 'b', 'c', 'd']);
    const mundur = [];
    id = 'd';
    while (id !== null) { mundur.push(id); id = tabTetangga(tab, id, -1); }
    assert.deepEqual(mundur, ['d', 'c', 'b', 'a']);
  });
});

describe('panahNonaktif', () => {
  it('kiri nonaktif di tab pertama, kanan nonaktif di tab terakhir', () => {
    assert.deepEqual(panahNonaktif(tab, 'a'), { kiri: true, kanan: false });
    assert.deepEqual(panahNonaktif(tab, 'd'), { kiri: false, kanan: true });
    assert.deepEqual(panahNonaktif(tab, 'b'), { kiri: false, kanan: false });
  });

  it('satu tab atau daftar kosong: keduanya nonaktif', () => {
    assert.deepEqual(panahNonaktif([{ id: 'a' }], 'a'), { kiri: true, kanan: true });
    assert.deepEqual(panahNonaktif([], 'a'), { kiri: true, kanan: true });
    assert.deepEqual(panahNonaktif(undefined, 'a'), { kiri: true, kanan: true });
  });

  it('aktif tidak dikenal diperlakukan sebagai tab pertama', () => {
    assert.deepEqual(panahNonaktif(tab, 'zzz'), { kiri: true, kanan: false });
  });
});
