import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cekNip, cekNama, validasiProfil, formDariProfil, bangunPayload, labelSumber, bantuanKolom, BATAS,
} from './profilLaporan.js';

test('cekNip: kosong sah; angka dan spasi minimal 8 angka; huruf ditolak', () => {
  assert.equal(cekNip(''), '');
  assert.equal(cekNip('   '), '');
  assert.equal(cekNip('1987 0101 2010'), '');
  assert.match(cekNip('1234567'), /Minimal 8/);
  assert.match(cekNip('1987abc01'), /angka dan spasi/);
  assert.match(cekNip('1'.repeat(BATAS.NIP_MAKS + 1)), /Paling banyak/);
});

test('cekNama: kosong sah, di atas batas ditolak', () => {
  assert.equal(cekNama(''), '');
  assert.equal(cekNama('Dra. Siti'), '');
  assert.match(cekNama('a'.repeat(BATAS.NAMA_MAKS + 1)), /Paling banyak/);
});

test('validasiProfil: hanya kolom bermasalah yang masuk peta', () => {
  assert.deepEqual(validasiProfil({ nip_guru: '', nama_kepsek: '', nip_kepsek: '' }), {});
  assert.deepEqual(Object.keys(validasiProfil({ nip_guru: '12', nama_kepsek: 'ok', nip_kepsek: 'x' })), ['nip_guru', 'nip_kepsek']);
});

test('formDariProfil: null menjadi string kosong (kolom terkendali)', () => {
  assert.deepEqual(formDariProfil({ nip_guru: null, nama_kepsek: 'Pak A', nip_kepsek: undefined }), { nip_guru: '', nama_kepsek: 'Pak A', nip_kepsek: '' });
  assert.deepEqual(formDariProfil(undefined), { nip_guru: '', nama_kepsek: '', nip_kepsek: '' });
});

test('bangunPayload: hanya yang berubah; dikosongkan menjadi null; spasi dirapikan', () => {
  const awal = { nip_guru: '19870101', nama_kepsek: 'Pak A', nip_kepsek: '' };
  assert.deepEqual(bangunPayload(awal, { ...awal }), {});
  assert.deepEqual(bangunPayload(awal, { nip_guru: '', nama_kepsek: 'Pak A', nip_kepsek: '' }), { nip_guru: null });
  assert.deepEqual(bangunPayload(awal, { nip_guru: '19870101', nama_kepsek: ' Pak B ', nip_kepsek: '19650505 1990' }), { nama_kepsek: 'Pak B', nip_kepsek: '19650505 1990' });
  assert.deepEqual(bangunPayload(awal, { nip_guru: ' 19870101 ', nama_kepsek: 'Pak A', nip_kepsek: '' }), {});
});

test('labelSumber dan bantuanKolom: asal nilai di laporan; sifat bawaan objek tidak bocor', () => {
  assert.equal(labelSumber('ISIAN_GURU'), 'Dari isian di sini');
  assert.equal(labelSumber('DATA_SEKOLAH'), 'Dari data sekolah');
  assert.equal(labelSumber(null), 'Belum diisi');
  assert.equal(labelSumber('constructor'), 'Belum diisi');
  assert.match(bantuanKolom('nama_kepsek', { nama_kepsek: null }, {}), /Belum diisi/);
  assert.equal(
    bantuanKolom('nama_kepsek', { nama_kepsek: 'Pak A' }, { nama_kepsek: 'DATA_SEKOLAH' }),
    'Di laporan: Pak A (dari data sekolah).',
  );
  assert.doesNotMatch(bantuanKolom('nip_guru', { nip_guru: '1' }, { nip_guru: 'ISIAN_GURU' }), /\banda\b/i);
});
