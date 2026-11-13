import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATAS, validasiBuat, bangunPayloadBuat, validasiUbah, bangunPayloadUbah, metaStatusGuruMandiri,
  ambilSandiAwal, teksDialogAksi, BENTUK_PENDIDIKAN, ZONA_WAKTU,
} from './guruMandiri.js';

const sah = { nama: 'Budi Santoso', email: 'budi@example.com', namaSekolah: '', bentuk: '', zona: 'Asia/Jakarta' };

test('validasiBuat: nama, email, sekolah opsional, bentuk dan zona', () => {
  assert.equal(validasiBuat(sah), '');
  assert.match(validasiBuat({ ...sah, nama: '' }), /Nama wajib/);
  assert.match(validasiBuat({ ...sah, nama: 'ab' }), /minimal 3/);
  assert.match(validasiBuat({ ...sah, nama: 'a'.repeat(BATAS.NAMA_MAX + 1) }), /maksimal/);
  assert.match(validasiBuat({ ...sah, email: '' }), /Email wajib/);
  assert.match(validasiBuat({ ...sah, email: 'bukan-email' }), /Format email/);
  assert.match(validasiBuat({ ...sah, namaSekolah: 'ab' }), /Nama sekolah minimal/);
  assert.equal(validasiBuat({ ...sah, namaSekolah: 'SD Harapan' }), '');
  assert.match(validasiBuat({ ...sah, bentuk: 'UNIVERSITAS' }), /Bentuk pendidikan/);
  assert.match(validasiBuat({ ...sah, zona: 'UTC' }), /Zona waktu/);
});

test('bentuk dan zona sama dengan daftar server', () => {
  assert.deepEqual([...BENTUK_PENDIDIKAN], ['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'MAK']);
  assert.deepEqual(ZONA_WAKTU.map((z) => z.kode), ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']);
});

test('bangunPayloadBuat: email huruf kecil, bidang opsional hanya bila diisi', () => {
  assert.deepEqual(bangunPayloadBuat({ ...sah, nama: '  Budi  ', email: ' BUDI@Example.com ' }), {
    nama: 'Budi', email: 'budi@example.com', timezone_sekolah: 'Asia/Jakarta',
  });
  assert.deepEqual(bangunPayloadBuat({ ...sah, namaSekolah: ' SD Harapan ', bentuk: 'SD', zona: 'Asia/Makassar' }), {
    nama: 'Budi Santoso', email: 'budi@example.com', timezone_sekolah: 'Asia/Makassar',
    nama_sekolah: 'SD Harapan', bentuk_pendidikan_kode: 'SD',
  });
});

test('validasiUbah dan bangunPayloadUbah: hanya bidang yang berubah', () => {
  const awal = { nama: 'Budi', nama_sekolah: 'SD Harapan' };
  assert.match(validasiUbah({ nama: 'Budi', namaSekolah: '' }), /Nama sekolah wajib/);
  assert.equal(validasiUbah({ nama: 'Budi', namaSekolah: 'SD Harapan' }), '');
  assert.deepEqual(bangunPayloadUbah(awal, { nama: 'Budi', namaSekolah: 'SD Harapan' }), {});
  assert.deepEqual(bangunPayloadUbah(awal, { nama: ' Budi S ', namaSekolah: 'SD Harapan' }), { nama: 'Budi S' });
  assert.deepEqual(bangunPayloadUbah(awal, { nama: 'Budi', namaSekolah: 'SD Baru' }), { nama_sekolah: 'SD Baru' });
});

test('metaStatusGuruMandiri: nonaktif mengalahkan menunggu ganti sandi', () => {
  assert.equal(metaStatusGuruMandiri({ status: 'nonaktif', wajib_ganti_sandi: true }).label, 'Nonaktif');
  assert.equal(metaStatusGuruMandiri({ status: 'aktif', wajib_ganti_sandi: true }).label, 'Belum ganti sandi');
  assert.equal(metaStatusGuruMandiri({ status: 'aktif', wajib_ganti_sandi: false }).label, 'Aktif');
});

test('ambilSandiAwal: hanya string', () => {
  assert.equal(ambilSandiAwal({ data: { sandi_awal: 'Abc12345xyz9' } }), 'Abc12345xyz9');
  assert.equal(ambilSandiAwal({ data: { sandi_awal: 12345 } }), '');
  assert.equal(ambilSandiAwal(undefined), '');
});

test('teksDialogAksi tanpa kata Anda', () => {
  for (const aksi of ['aktifkan', 'reset']) {
    const t = teksDialogAksi(aksi, { nama: 'Budi' });
    assert.ok(t.judul && t.isi && t.tombol);
    assert.doesNotMatch(`${t.judul} ${t.isi}`, /\banda\b/i);
  }
});
