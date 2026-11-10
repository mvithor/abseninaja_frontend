import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cekSandiBaru, validasiGantiAwal, validasiGantiBiasa, bangunPayloadGantiAwal, bangunPayloadGantiBiasa,
  PESAN_SANDI, pesanDariGalatSandi, tiketTidakBerlaku,
} from './sandi.js';

const galat = (data, status = 422) => ({ response: { status, data } });

test('cekSandiBaru: aturan sama dengan server', () => {
  assert.match(cekSandiBaru(''), /wajib/);
  assert.match(cekSandiBaru(undefined), /wajib/);
  assert.match(cekSandiBaru('abc1'), /minimal 8/);
  assert.match(cekSandiBaru('abcdefgh'), /huruf dan angka/);
  assert.match(cekSandiBaru('12345678'), /huruf dan angka/);
  assert.match(cekSandiBaru('a'.repeat(73) + '1'), /terlalu panjang/);
  assert.equal(cekSandiBaru('Rahasia123'), '');
});

test('cekSandiBaru: batas 72 BYTE, bukan 72 karakter (aksara multibita)', () => {
  // 40 huruf "é" = 80 byte meski hanya 40 karakter
  assert.match(cekSandiBaru('é'.repeat(40) + '1'), /terlalu panjang/);
  assert.equal(cekSandiBaru('é'.repeat(30) + '1'), '');
});

test('validasiGantiAwal: konfirmasi harus sama', () => {
  assert.equal(validasiGantiAwal({ sandiBaru: 'Rahasia123', konfirmasi: 'Rahasia123' }), '');
  assert.match(validasiGantiAwal({ sandiBaru: 'Rahasia123', konfirmasi: 'Rahasia124' }), /Konfirmasi/);
  assert.match(validasiGantiAwal({ sandiBaru: 'pendek1', konfirmasi: 'pendek1' }), /minimal/);
});

test('validasiGantiBiasa: sandi lama wajib dan sandi baru tidak boleh sama', () => {
  assert.match(validasiGantiBiasa({ sandiLama: '', sandiBaru: 'Rahasia123', konfirmasi: 'Rahasia123' }), /Sandi lama/);
  assert.match(validasiGantiBiasa({ sandiLama: 'Rahasia123', sandiBaru: 'Rahasia123', konfirmasi: 'Rahasia123' }), /sama dengan sandi lama/);
  assert.equal(validasiGantiBiasa({ sandiLama: 'Lama12345', sandiBaru: 'Rahasia123', konfirmasi: 'Rahasia123' }), '');
});

test('payload memakai nama bidang server dan tidak membawa konfirmasi', () => {
  assert.deepEqual(bangunPayloadGantiAwal({ tiket: 't', sandiBaru: 'x1', konfirmasi: 'x1' }), { tiket: 't', sandi_baru: 'x1' });
  assert.deepEqual(bangunPayloadGantiBiasa({ sandiLama: 'a', sandiBaru: 'b', konfirmasi: 'b' }), { sandi_lama: 'a', sandi_baru: 'b' });
});

test('pesanDariGalatSandi: kode dikenal dipetakan, kebijakan memakai msg server, sisanya cadangan', () => {
  assert.equal(pesanDariGalatSandi(galat({ kode: 'SANDI_LAMA_SALAH', msg: 'teks server' }, 401)), PESAN_SANDI.SANDI_LAMA_SALAH);
  assert.equal(pesanDariGalatSandi(galat({ kode: 'TIKET_TIDAK_VALID', msg: 'teks server' }, 401)), PESAN_SANDI.TIKET_TIDAK_VALID);
  assert.equal(pesanDariGalatSandi(galat({ kode: 'SANDI_TIDAK_MEMENUHI_SYARAT', msg: 'Sandi baru minimal 8 karakter.' })), 'Sandi baru minimal 8 karakter.');
  assert.equal(pesanDariGalatSandi(galat({ kode: 'KODE_BARU', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatSandi(galat({}, 500)), PESAN_SANDI.UMUM);
  assert.equal(pesanDariGalatSandi({ message: 'Network Error' }), PESAN_SANDI.UMUM);
});

test('pesanDariGalatSandi: kode sukses/umum atau sifat bawaan objek tidak dipakai sebagai kode galat', () => {
  assert.equal(pesanDariGalatSandi(galat({ kode: 'SUKSES_AWAL', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatSandi(galat({ kode: 'UMUM', msg: 'cadangan' })), 'cadangan');
  assert.equal(pesanDariGalatSandi(galat({ kode: 'constructor', msg: 'cadangan' })), 'cadangan');
});

test('tidak ada kalimat sandi yang memakai kata Anda', () => {
  for (const [kunci, teks] of Object.entries(PESAN_SANDI)) assert.doesNotMatch(teks, /\banda\b/i, kunci);
});

test('tiketTidakBerlaku hanya untuk TIKET_TIDAK_VALID', () => {
  assert.equal(tiketTidakBerlaku(galat({ kode: 'TIKET_TIDAK_VALID' }, 401)), true);
  assert.equal(tiketTidakBerlaku(galat({ kode: 'SANDI_TIDAK_MEMENUHI_SYARAT' })), false);
  assert.equal(tiketTidakBerlaku(undefined), false);
});
