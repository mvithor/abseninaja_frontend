import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KUNCI_KANTIN_SEKOLAH,
  bangunPayloadPencairanSekolah,
  bangunPayloadResetPinSekolah,
  bangunPayloadUbahStatusPencairan,
  bangunPayloadUnitKantin,
  petakanOpsiAdminKantin,
  validasiPencairanSekolah,
  validasiResetPinSekolah,
  validasiUbahStatusPencairan,
  validasiUnitKantin,
} from './kantinSekolah.js';

test('KUNCI_KANTIN_SEKOLAH memiliki prefix unik dan terpisah dari portal kasir', () => {
  const vals = Object.values(KUNCI_KANTIN_SEKOLAH);
  assert.equal(new Set(vals).size, vals.length);
  for (const v of vals) {
    assert.ok(v.startsWith('admin-sekolah-kantin-'));
  }
});

test('validasiUnitKantin dan bangunPayloadUnitKantin menangani buat/ubah dan admin_kantin_id nullable', () => {
  assert.match(validasiUnitKantin({ nama_kantin: '  ' }), /wajib diisi/i);
  assert.match(validasiUnitKantin({ nama_kantin: 'AB' }), /minimal 3/i);
  assert.equal(
    validasiUnitKantin({ nama_kantin: 'Kantin Sehat', penanggung_jawab: 'Bu Sari', lokasi: 'Lt. 1' }),
    '',
  );

  const pBuat = bangunPayloadUnitKantin({
    mode: 'buat',
    form: { nama_kantin: '  Kantin Barat ', admin_kantin_id: '', penanggung_jawab: '  Pak Budi ', lokasi: '  ' },
  });
  assert.deepEqual(pBuat, {
    nama_kantin: 'Kantin Barat',
    admin_kantin_id: null,
    penanggung_jawab: 'Pak Budi',
    lokasi: null,
  });
  assert.equal('is_aktif' in pBuat, false);

  const pUbah = bangunPayloadUnitKantin({
    mode: 'ubah',
    form: { nama_kantin: 'Kantin Timur', admin_kantin_id: '7', is_aktif: false },
  });
  assert.deepEqual(pUbah, {
    nama_kantin: 'Kantin Timur',
    admin_kantin_id: 7,
    penanggung_jawab: null,
    lokasi: null,
    is_aktif: false,
  });
});

test('petakanOpsiAdminKantin menandai akun nonaktif atau yang tertaut unit kantin lain', () => {
  const opsi = petakanOpsiAdminKantin({
    akunList: [
      { id: 1, nama: 'Akun A', is_aktif: true },
      { id: 2, nama: 'Akun B', is_aktif: true },
      { id: 3, nama: 'Akun C', is_aktif: false },
    ],
    kantinList: [
      { id: 10, nama_kantin: 'Kantin 1', admin_kantin_id: 1 },
      { id: 11, nama_kantin: 'Kantin 2', admin_kantin_id: 2 },
    ],
    kantinDieditId: 10,
  });

  assert.equal(opsi[0].bisaDipilih, true);
  assert.equal(opsi[0].tertautKeLain, false);
  assert.equal(opsi[1].bisaDipilih, false);
  assert.equal(opsi[1].tertautKeLain, true);
  assert.equal(opsi[1].tertautKeUnit, 'Kantin 2');
  assert.equal(opsi[2].bisaDipilih, false);
});

test('validasiResetPinSekolah mewajibkan 6 digit dan alasan minimal 5 karakter', () => {
  assert.match(validasiResetPinSekolah({ pin_baru: '123', alasan: 'Lupa PIN' }), /6 digit/i);
  assert.match(validasiResetPinSekolah({ pin_baru: '012345', alasan: 'abc' }), /minimal 5/i);
  assert.equal(validasiResetPinSekolah({ pin_baru: '012345', alasan: 'Siswa lupa PIN kartu' }), '');

  assert.deepEqual(bangunPayloadResetPinSekolah({ pin_baru: '012345', alasan: '  Lupa PIN  ' }), {
    pin_baru: '012345',
    alasan: 'Lupa PIN',
  });
});

test('validasiPencairanSekolah dan bangunPayloadPencairanSekolah menolak nominal > saldo mengendap', () => {
  assert.match(
    validasiPencairanSekolah({
      kantin_id: 1,
      nominal: 50000,
      metode_pencairan: 'MANUAL',
      status: 'SELESAI',
      saldoMengendap: 30000,
    }),
    /melebihi saldo mengendap/i,
  );
  assert.match(
    validasiPencairanSekolah({
      kantin_id: 1,
      nominal: 10000.5,
      metode_pencairan: 'MANUAL',
      status: 'SELESAI',
      saldoMengendap: 30000,
    }),
    /bilangan bulat/i,
  );
  assert.equal(
    validasiPencairanSekolah({
      kantin_id: 1,
      nominal: 20000,
      metode_pencairan: 'TRANSFER_BANK',
      status: 'MENUNGGU',
      referensi_eksternal: 'TRF-01',
      saldoMengendap: 30000,
    }),
    '',
  );

  assert.deepEqual(
    bangunPayloadPencairanSekolah({
      form: {
        nominal: 20000,
        metode_pencairan: 'TRANSFER_BANK',
        status: 'MENUNGGU',
        referensi_eksternal: '  TRF-01 ',
        catatan: '',
      },
      idempotencyKey: 'cair-uuid',
    }),
    {
      nominal: 20000,
      metode_pencairan: 'TRANSFER_BANK',
      status: 'MENUNGGU',
      idempotency_key: 'cair-uuid',
      referensi_eksternal: 'TRF-01',
    },
  );
});

test('validasiUbahStatusPencairan dan bangunPayloadUbahStatusPencairan hanya menerima SELESAI atau DIBATALKAN', () => {
  assert.match(validasiUbahStatusPencairan({ status: 'MENUNGGU' }), /SELESAI atau DIBATALKAN/);
  assert.equal(validasiUbahStatusPencairan({ status: 'DIBATALKAN', catatan: 'Rekening salah' }), '');
  assert.deepEqual(
    bangunPayloadUbahStatusPencairan({ status: 'SELESAI', referensi_eksternal: ' OK-9 ', catatan: '  ' }),
    { status: 'SELESAI', referensi_eksternal: 'OK-9' },
  );
});
