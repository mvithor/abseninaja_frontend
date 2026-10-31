import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATAS,
  metaStatusKantin,
  filterAdminKantin,
  validasiBuat,
  validasiUbah,
  bangunPayloadBuat,
  bangunPayloadUbah,
  adaPerubahan,
  sesiGagalDicabut,
  teksDialogStatus,
} from './kantin.js';

const ok = { nama: 'Bu Kantin', email: 'kantin@sekolah.sch.id', password: 'rahasia123' };

test('metaStatusKantin: aktif hijau, nonaktif abu-abu', () => {
  assert.equal(metaStatusKantin(true).label, 'Aktif');
  assert.equal(metaStatusKantin(true).bg, '#34C759');
  assert.equal(metaStatusKantin(false).label, 'Nonaktif');
  assert.equal(metaStatusKantin(undefined).label, 'Nonaktif');
});

test('filterAdminKantin: cari nama atau email, urutan server dipertahankan', () => {
  const d = [
    { id: 3, nama: 'Zahra', email: 'zahra@x.id' },
    { id: 2, nama: 'Ali', email: 'kantin.ali@x.id' },
    { id: 1, nama: 'Budi', email: 'budi@x.id' },
  ];
  assert.deepEqual(filterAdminKantin(d, '').map((x) => x.id), [3, 2, 1]);
  assert.deepEqual(filterAdminKantin(d, 'KANTIN').map((x) => x.id), [2]);
  assert.deepEqual(filterAdminKantin(d, 'zah').map((x) => x.id), [3]);
  assert.deepEqual(filterAdminKantin(d, 'tidak ada'), []);
  assert.deepEqual(filterAdminKantin(null, 'a'), []);
});

test('validasiBuat: lolos untuk data benar', () => {
  assert.equal(validasiBuat(ok), '');
});

test('validasiBuat: nama (kosong, pendek, panjang, hanya spasi)', () => {
  assert.equal(validasiBuat({ ...ok, nama: '' }), 'Nama wajib diisi.');
  assert.equal(validasiBuat({ ...ok, nama: '   ' }), 'Nama wajib diisi.');
  assert.match(validasiBuat({ ...ok, nama: 'ab' }), /minimal 3/);
  assert.match(validasiBuat({ ...ok, nama: 'a'.repeat(BATAS.NAMA_MAX + 1) }), /maksimal 50/);
  assert.equal(validasiBuat({ ...ok, nama: ' abc ' }), '');
});

test('validasiBuat: email', () => {
  assert.equal(validasiBuat({ ...ok, email: '' }), 'Email wajib diisi.');
  assert.equal(validasiBuat({ ...ok, email: 'bukan-email' }), 'Format email tidak valid.');
  assert.equal(validasiBuat({ ...ok, email: 'a b@x.id' }), 'Format email tidak valid.');
  assert.equal(validasiBuat({ ...ok, email: ' Kantin@Sekolah.sch.id ' }), '');
});

test('validasiBuat: password wajib, 8 sampai 72 karakter', () => {
  assert.equal(validasiBuat({ ...ok, password: '' }), 'Password wajib diisi.');
  assert.match(validasiBuat({ ...ok, password: '1234567' }), /minimal 8/);
  assert.equal(validasiBuat({ ...ok, password: '12345678' }), '');
  assert.equal(validasiBuat({ ...ok, password: 'a'.repeat(72) }), '');
  assert.match(validasiBuat({ ...ok, password: 'a'.repeat(73) }), /maksimal 72/);
});

test('validasiUbah: password boleh kosong, bila diisi harus valid', () => {
  assert.equal(validasiUbah({ ...ok, password: '' }), '');
  assert.equal(validasiUbah({ ...ok, password: undefined }), '');
  assert.match(validasiUbah({ ...ok, password: 'pendek' }), /minimal 8/);
  assert.equal(validasiUbah({ ...ok, nama: '' }), 'Nama wajib diisi.');
});

test('bangunPayloadBuat: nama dipangkas, email huruf kecil', () => {
  assert.deepEqual(bangunPayloadBuat({ nama: ' Bu Kantin ', email: ' Kantin@Sekolah.SCH.id ', password: 'rahasia123' }), {
    name: 'Bu Kantin',
    email: 'kantin@sekolah.sch.id',
    password: 'rahasia123',
  });
});

test('bangunPayloadUbah: password kosong TIDAK dikirim (agar tidak mereset sesi)', () => {
  assert.deepEqual(bangunPayloadUbah({ nama: 'Ali', email: 'A@x.id', password: '' }), { name: 'Ali', email: 'a@x.id' });
  assert.equal('password' in bangunPayloadUbah({ nama: 'Ali', email: 'a@x.id', password: undefined }), false);
  assert.equal(bangunPayloadUbah({ nama: 'Ali', email: 'a@x.id', password: 'baru12345' }).password, 'baru12345');
});

test('adaPerubahan: nama, email (tanpa membedakan huruf besar), atau password terisi', () => {
  const awal = { nama: 'Ali', email: 'ali@x.id' };
  assert.equal(adaPerubahan(awal, { nama: 'Ali', email: 'ALI@x.id', password: '' }), false);
  assert.equal(adaPerubahan(awal, { nama: ' Ali ', email: 'ali@x.id', password: '' }), false);
  assert.equal(adaPerubahan(awal, { nama: 'Ali B', email: 'ali@x.id', password: '' }), true);
  assert.equal(adaPerubahan(awal, { nama: 'Ali', email: 'baru@x.id', password: '' }), true);
  assert.equal(adaPerubahan(awal, { nama: 'Ali', email: 'ali@x.id', password: 'baru12345' }), true);
});

test('sesiGagalDicabut: hanya true bila server melaporkan gagal', () => {
  assert.equal(sesiGagalDicabut({ data: { sesi: { gagal: true } } }), true);
  assert.equal(sesiGagalDicabut({ data: { sesi: { gagal: false, dicabut: 2 } } }), false);
  assert.equal(sesiGagalDicabut({ data: {} }), false);
  assert.equal(sesiGagalDicabut(undefined), false);
});

test('teksDialogStatus: beda teks untuk menonaktifkan dan mengaktifkan', () => {
  const non = teksDialogStatus({ nama: 'Ali', is_aktif: true });
  assert.equal(non.tombol, 'Nonaktifkan');
  assert.match(non.judul, /Ali/);
  assert.match(non.isi, /sesi login/i);
  const akt = teksDialogStatus({ nama: 'Ali', is_aktif: false });
  assert.equal(akt.tombol, 'Aktifkan');
});
