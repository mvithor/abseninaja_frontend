import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KEADAAN, KOLOM_SARAN, MAKS_ALASAN, MAKS_KOLOM, adaPerubahan, isianAwal, isianSama, keadaanSaran, kolomDihilangkan,
  isianDraf, pesanKonflikSaran, periksaAlasan, periksaIsian, ringkasKeputusan, tanggalSimpan, teksKeputusan, urutkanSaran,
} from './saran.js';

const DRAF = {
  koneksi: 'Hana tampak aktif di kelas.', tujuan: 'Tujuan X.', posisi: 'Hana tidak hadir 6 kali.', langkah: 'Bicara dengan Hana.',
};
const entri = (tersimpan = null, draf = DRAF, dihilangkan = []) => ({ pola: 'P2', draf, dihilangkan, tersimpan });
const tersimpan = (o = {}) => ({
  status: 'DIPAKAI', akhir: DRAF, draf_tersimpan: DRAF, diubah_guru: false, alasan_abai: null, data_berubah: false, ...o,
});

test('empat kolom berurutan sesuai kerangka Hattie dan Timperley', () => {
  assert.deepEqual(KOLOM_SARAN.map((k) => k.kunci), ['koneksi', 'tujuan', 'posisi', 'langkah']);
  assert.deepEqual(KOLOM_SARAN.map((k) => k.label), [
    'Mulai dari koneksi', 'Ke mana tujuannya?', 'Sudah sampai mana?', 'Langkah berikutnya?',
  ]);
});

test('keadaanSaran: draf, dipakai, dipakai diubah, diabaikan', () => {
  assert.equal(keadaanSaran(entri()), KEADAAN.DRAF);
  assert.equal(keadaanSaran(entri(tersimpan())), KEADAAN.DIPAKAI);
  assert.equal(keadaanSaran(entri(tersimpan({ diubah_guru: true }))), KEADAAN.DIPAKAI_DIUBAH);
  assert.equal(keadaanSaran(entri(tersimpan({ status: 'DIABAIKAN', akhir: null, alasan_abai: 'x' }))), KEADAAN.DIABAIKAN);
  assert.equal(keadaanSaran(null), KEADAAN.DRAF);
});

test('isianAwal: draf bila belum diputuskan atau diabaikan, versi guru bila dipakai, null jadi kosong', () => {
  assert.deepEqual(isianAwal(entri()), DRAF);
  const akhir = { ...DRAF, langkah: 'Versi guru.' };
  assert.deepEqual(isianAwal(entri(tersimpan({ akhir, diubah_guru: true }))), akhir);
  assert.deepEqual(isianAwal(entri(tersimpan({ status: 'DIABAIKAN', akhir: null }))), DRAF);
  assert.deepEqual(isianAwal(entri(null, { koneksi: null, tujuan: null, posisi: 'p', langkah: 'l' })), {
    koneksi: '', tujuan: '', posisi: 'p', langkah: 'l',
  });
});

test('isianSama meniru server: spasi dirapikan, null sama dengan kosong', () => {
  assert.equal(isianSama(DRAF, { ...DRAF, langkah: '  Bicara   dengan\nHana. ' }), true);
  assert.equal(isianSama({ ...DRAF, koneksi: null }, { ...DRAF, koneksi: '' }), true);
  assert.equal(isianSama(DRAF, { ...DRAF, langkah: 'lain' }), false);
  assert.equal(adaPerubahan(DRAF, DRAF), false);
  assert.equal(adaPerubahan({ ...DRAF, tujuan: 'Tujuan Y.' }, DRAF), true);
});

test('kolomDihilangkan: hanya kolom yang dilaporkan server, urut menurut kolom', () => {
  const e = entri(null, DRAF, [{ kolom: 'posisi', alasan: 'a' }, { kolom: 'koneksi', alasan: 'b' }]);
  assert.deepEqual(kolomDihilangkan(e), [
    { kunci: 'koneksi', label: 'Mulai dari koneksi', alasan: 'b' },
    { kunci: 'posisi', label: 'Sudah sampai mana?', alasan: 'a' },
  ]);
  assert.deepEqual(kolomDihilangkan(entri()), []);
});

test('periksaIsian: langkah wajib, batas panjang, hasil dirapikan', () => {
  assert.deepEqual(periksaIsian(DRAF).galat, {});
  assert.deepEqual(periksaIsian({ ...DRAF, langkah: '   ' }).galat, { langkah: 'Langkah berikutnya wajib diisi' });
  assert.deepEqual(periksaIsian({ ...DRAF, koneksi: 'x'.repeat(MAKS_KOLOM) }).galat, {});
  assert.deepEqual(periksaIsian({ ...DRAF, koneksi: 'x'.repeat(MAKS_KOLOM + 1) }).galat, { koneksi: `Paling banyak ${MAKS_KOLOM} karakter` });
  assert.equal(periksaIsian({ ...DRAF, tujuan: '  Tujuan.  ' }).bersih.tujuan, 'Tujuan.');
  assert.deepEqual(periksaIsian({}).galat, { langkah: 'Langkah berikutnya wajib diisi' });
});

test('periksaAlasan: wajib, dipangkas, batas panjang', () => {
  assert.ok(periksaAlasan('').galat);
  assert.ok(periksaAlasan('   ').galat);
  assert.ok(periksaAlasan(null).galat);
  assert.deepEqual(periksaAlasan('  Sudah dibicarakan.  '), { alasan: 'Sudah dibicarakan.' });
  assert.deepEqual(periksaAlasan('x'.repeat(MAKS_ALASAN)), { alasan: 'x'.repeat(MAKS_ALASAN) });
  assert.ok(periksaAlasan('x'.repeat(MAKS_ALASAN + 1)).galat);
});

test('ringkasKeputusan dan teksKeputusan', () => {
  const r = ringkasKeputusan([
    { siswa_id: 1, pola: 'P1', status: 'DIPAKAI' },
    { siswa_id: 1, pola: 'P2', status: 'DIABAIKAN' },
    { siswa_id: 1, pola: 'P3', status: 'DIPAKAI' },
    { siswa_id: 2, pola: 'P2', status: 'DIABAIKAN' },
  ]);
  assert.deepEqual(r.get(1), { dipakai: 2, diabaikan: 1, pola: { P1: 'DIPAKAI', P2: 'DIABAIKAN', P3: 'DIPAKAI' } });
  assert.equal(teksKeputusan(r.get(1)), '2 saran dipakai, 1 diabaikan');
  assert.equal(teksKeputusan(r.get(2)), '1 diabaikan');
  assert.equal(teksKeputusan(r.get(3)), null);
  assert.equal(ringkasKeputusan(undefined).size, 0);
});

test('isianDraf selalu dari draf sistem, bukan dari versi guru', () => {
  const akhir = { ...DRAF, langkah: 'Versi guru.' };
  assert.deepEqual(isianDraf(entri(tersimpan({ akhir, diubah_guru: true }))), DRAF);
  assert.deepEqual(isianDraf(entri(null, { koneksi: null, tujuan: 't', posisi: null, langkah: 'l' })), {
    koneksi: '', tujuan: 't', posisi: '', langkah: 'l',
  });
});

test('urutkanSaran mengikuti prioritas tampilan, pola tak dikenal di akhir, tanpa mengubah masukan', () => {
  const urutan = ['P2', 'P3', 'P1', 'P4', 'P5'];
  const masuk = [{ pola: 'P5' }, { pola: 'P1' }, { pola: 'PX' }, { pola: 'P2' }];
  assert.deepEqual(urutkanSaran(masuk, urutan).map((x) => x.pola), ['P2', 'P1', 'P5', 'PX']);
  assert.deepEqual(masuk.map((x) => x.pola), ['P5', 'P1', 'PX', 'P2']);
  assert.deepEqual(urutkanSaran(undefined, urutan), []);
});

test('tanggalSimpan: tanggal sah diformat Indonesia, selain itu kosong', () => {
  assert.match(tanggalSimpan('2026-10-26T05:00:00.000Z'), /Oktober 2026/);
  assert.equal(tanggalSimpan('bukan tanggal'), '');
  assert.equal(tanggalSimpan(null), '');
  assert.equal(tanggalSimpan(undefined), '');
});

test('batas panjang sesuai server: kolom 2000, alasan 1000 (angka literal)', () => {
  assert.equal(MAKS_KOLOM, 2000);
  assert.equal(MAKS_ALASAN, 1000);
  assert.deepEqual(periksaAlasan('x'.repeat(1001)).galat !== undefined, true);
  assert.deepEqual(periksaIsian({ ...DRAF, tujuan: 'x'.repeat(2001) }).galat.tujuan !== undefined, true);
  assert.deepEqual(periksaIsian({ ...DRAF, tujuan: 'x'.repeat(2000) }).galat, {});
});

test('teksKeputusan: ringkasan tanpa keputusan menghasilkan null, bukan teks kosong', () => {
  assert.equal(teksKeputusan({ dipakai: 0, diabaikan: 0, pola: {} }), null);
  assert.equal(teksKeputusan({ dipakai: 1, diabaikan: 0, pola: {} }), '1 saran dipakai');
});

test('pesanKonflikSaran: hanya 409 punya pesan khusus', () => {
  assert.match(pesanKonflikSaran(409), /Muat ulang/);
  assert.equal(pesanKonflikSaran(422), null);
  assert.equal(pesanKonflikSaran(500), null);
  assert.equal(pesanKonflikSaran(undefined), null);
});
