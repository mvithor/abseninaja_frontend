import test from 'node:test';
import assert from 'node:assert/strict';
import { gabungMenuLad } from './menuLad.js';

const portal = [{ id: 'a' }];
const lad = [{ id: 'lad' }];

test('portal guru-lad sudah menyediakan menu: probe tidak menambah (tidak ada menu ganda)', () => {
  assert.deepEqual(gabungMenuLad([{ id: 'a' }, { id: 'lad' }], lad, { bolehLad: true, adaPortalLad: true }), [{ id: 'a' }, { id: 'lad' }]);
});

test('tanpa portal guru-lad, probe berhasil menambahkan menu LAD seperti perilaku lama', () => {
  assert.deepEqual(gabungMenuLad(portal, lad, { bolehLad: true, adaPortalLad: false }), [{ id: 'a' }, { id: 'lad' }]);
});

test('tanpa portal dan probe gagal: tidak ada menu LAD', () => {
  assert.deepEqual(gabungMenuLad(portal, lad, { bolehLad: false, adaPortalLad: false }), portal);
});

test('tidak mengubah masukan (kembalian baru saat menambah, sama persis saat tidak)', () => {
  const awal = [{ id: 'a' }];
  const hasil = gabungMenuLad(awal, lad, { bolehLad: true, adaPortalLad: false });
  assert.equal(awal.length, 1);
  assert.notEqual(hasil, awal);
});
