import test from 'node:test';
import assert from 'node:assert/strict';
import { PESAN_LOGIN, pesanDariGalatLogin, pesanTanpaPortal } from './pesanLogin.js';

const galat = (data, status = 403) => ({ response: { status, data } });

test('kode yang dikenal dipetakan ke kalimat klien, bukan teks server', () => {
  for (const kode of ['SALAH_KREDENSIAL', 'TERLALU_BANYAK_PERCOBAAN', 'AKUN_BELUM_AKTIVASI', 'AKUN_NONAKTIF', 'TANPA_AKSES']) {
    const pesan = pesanDariGalatLogin(galat({ kode, msg: 'Akun Anda ... teks server yang tidak boleh tampil' }));
    assert.equal(pesan, PESAN_LOGIN[kode]);
    assert.doesNotMatch(pesan, /teks server/);
  }
});

test('tidak ada kalimat login yang memakai kata Anda', () => {
  for (const [kunci, teks] of Object.entries(PESAN_LOGIN)) {
    assert.doesNotMatch(teks, /\banda\b/i, `${kunci} memakai kata Anda`);
  }
});

test('server lama tanpa kode: jatuh ke msg server, lalu ke pesan umum', () => {
  assert.equal(pesanDariGalatLogin(galat({ msg: 'Pesan dari server lama' }, 500)), 'Pesan dari server lama');
  assert.equal(pesanDariGalatLogin(galat({}, 500)), PESAN_LOGIN.UMUM);
  assert.equal(pesanDariGalatLogin(galat({ msg: '   ' }, 500)), PESAN_LOGIN.UMUM);
  assert.equal(pesanDariGalatLogin({ message: 'Network Error' }), PESAN_LOGIN.UMUM);
  assert.equal(pesanDariGalatLogin(undefined), PESAN_LOGIN.UMUM);
});

test('kode tidak dikenal atau berbahaya jatuh ke msg server, tidak membaca sifat bawaan objek', () => {
  assert.equal(pesanDariGalatLogin(galat({ kode: 'KODE_BARU', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatLogin(galat({ kode: 'constructor', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatLogin(galat({ kode: 'UMUM', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatLogin(galat({ kode: ['TANPA_AKSES'], msg: 'cadangan' })), 'cadangan');
});

test('pesan tanpa portal: pegawai diarahkan ke admin sekolah, peran lain pengguna tidak valid', () => {
  assert.equal(pesanTanpaPortal('pegawai'), PESAN_LOGIN.TANPA_AKSES);
  assert.equal(pesanTanpaPortal('siswa'), PESAN_LOGIN.PENGGUNA_TIDAK_VALID);
  assert.equal(pesanTanpaPortal(undefined), PESAN_LOGIN.PENGGUNA_TIDAK_VALID);
});
