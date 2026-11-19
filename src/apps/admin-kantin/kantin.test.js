import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATAS_KANTIN,
  KATEGORI_MENU,
  KUNCI_KANTIN,
  bacaStatusGerbangKantin,
  bangunPayloadCheckout,
  bangunPayloadLimit,
  bangunPayloadMenu,
  bangunPayloadPin,
  bangunPayloadReversal,
  bangunPayloadTopup,
  buatKunciIdempotensi,
  formatRupiah,
  formatWaktu,
  hitungRingkasanKeranjang,
  metaJenisTransaksi,
  metaKategoriMenu,
  metaStatusDompet,
  metaStatusPencairan,
  metaStatusUnit,
  pesanGalatKantin,
  rentangTanggalQuery,
  sisaLimitHarian,
  tambahItemKeranjang,
  ubahJumlahKeranjang,
  validasiCheckout,
  validasiLimitForm,
  validasiMenu,
  validasiPinForm,
  validasiReversal,
  validasiTopup,
} from './kantin.js';

test('KUNCI_KANTIN: setiap kunci bersifat unik dan konsisten untuk cache TanStack Query v5', () => {
  const nilai = Object.values(KUNCI_KANTIN);
  assert.equal(new Set(nilai).size, nilai.length);
  for (const k of nilai) {
    assert.match(k, /^kantin-/);
  }
});

test('formatRupiah dan formatWaktu menormalkan angka bulat & tanggal aman', () => {
  assert.equal(formatRupiah(15000), 'Rp 15.000');
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(NaN), 'Rp 0');
  assert.equal(formatWaktu(null), '-');
  assert.equal(formatWaktu('bukan-tanggal'), '-');
  assert.notEqual(formatWaktu('2026-11-19T05:00:00.000Z', 'Asia/Jakarta'), '-');

  const rentang = rentangTanggalQuery('2026-11-19', '2026-11-19');
  assert.ok(rentang.dari_tanggal && rentang.sampai_tanggal);
  assert.ok(new Date(rentang.dari_tanggal).getTime() < new Date(rentang.sampai_tanggal).getTime());
});

test('buatKunciIdempotensi menghasilkan kunci unik <= 100 karakter sesuai skema backend', () => {
  const a = buatKunciIdempotensi('kasir');
  const b = buatKunciIdempotensi('kasir');
  assert.notEqual(a, b);
  assert.ok(a.startsWith('kasir-'));
  assert.ok(a.length <= 100);
});

test('metadata chip status unit, kategori, jenis transaksi, dan pencairan memetakan label jelas', () => {
  assert.equal(metaStatusUnit(true).label, 'Unit Aktif');
  assert.equal(metaStatusUnit(false).label, 'Unit Nonaktif');
  assert.equal(metaKategoriMenu('minuman'), 'Minuman');
  assert.equal(KATEGORI_MENU.length, 4);
  assert.deepEqual(metaJenisTransaksi('BELANJA'), { label: 'Belanja Kasir', color: 'primary', tanda: '-' });
  assert.deepEqual(metaJenisTransaksi('TOPUP'), { label: 'Top-Up Saldo', color: 'success', tanda: '+' });
  assert.deepEqual(metaStatusPencairan('DIBATALKAN'), { label: 'Dibatalkan', color: 'error' });
});

test('metaStatusDompet membedakan belum aktif, dinonaktifkan, PIN terkunci, belum ada PIN, dan siap transaksi', () => {
  const sekarang = new Date('2026-11-19T12:00:00.000Z');
  assert.equal(metaStatusDompet(null, sekarang).bisaBelanja, false);
  assert.equal(metaStatusDompet({ is_aktif: false, punya_pin: true }, sekarang).label, 'Dinonaktifkan');
  assert.equal(
    metaStatusDompet({ is_aktif: true, punya_pin: true, terkunci_sampai: '2026-11-19T12:10:00.000Z' }, sekarang).label,
    'PIN Terkunci',
  );
  assert.equal(metaStatusDompet({ is_aktif: true, punya_pin: false }, sekarang).label, 'Belum Ada PIN');
  assert.equal(
    metaStatusDompet({ is_aktif: true, punya_pin: true, terkunci_sampai: '2026-11-19T11:50:00.000Z' }, sekarang).bisaBelanja,
    true,
  );
});

test('operasi keranjang POS menambah, menambah kuantitas, menghapus jika <= 0, dan menghitung total bulat', () => {
  let k = [];
  k = tambahItemKeranjang(k, { id: 1, nama_menu: 'Soto', harga: 10000 });
  k = tambahItemKeranjang(k, { id: 1, nama_menu: 'Soto', harga: 10000 });
  k = tambahItemKeranjang(k, { id: 2, nama_menu: 'Es Teh', harga: 3000 });
  assert.deepEqual(hitungRingkasanKeranjang(k), { jumlahItem: 2, jumlahQty: 3, totalNominal: 23000 });

  k = ubahJumlahKeranjang(k, 2, -1);
  assert.deepEqual(hitungRingkasanKeranjang(k), { jumlahItem: 1, jumlahQty: 2, totalNominal: 20000 });
});

test('validasiMenu dan bangunPayloadMenu mengikuti Joi skema.js (harga integer >= 0, url opsional)', () => {
  const ok = { nama_menu: '  Nasi Goreng  ', kategori: 'makanan', harga: 12000, is_tersedia: true, foto_url: '' };
  assert.equal(validasiMenu(ok), '');
  assert.deepEqual(bangunPayloadMenu(ok), {
    nama_menu: 'Nasi Goreng',
    kategori: 'makanan',
    harga: 12000,
    is_tersedia: true,
    foto_url: null,
  });

  assert.match(validasiMenu({ ...ok, nama_menu: 'A' }), /minimal 2/);
  assert.match(validasiMenu({ ...ok, nama_menu: 'a'.repeat(BATAS_KANTIN.NAMA_MENU_MAX + 1) }), /maksimal 150/);
  assert.match(validasiMenu({ ...ok, harga: -100 }), /minimal 0/);
  assert.match(validasiMenu({ ...ok, harga: 12.5 }), /bilangan bulat/);
  assert.match(validasiMenu({ ...ok, foto_url: 'ftp://contoh.id/a.png' }), /http/);
});

test('validasiPinForm & bangunPayloadPin mewajibkan 6 digit dan menyertakan pin_lama hanya saat ubah PIN', () => {
  assert.equal(validasiPinForm({ pin_baru: '012345', punyaPin: false }), '');
  assert.deepEqual(bangunPayloadPin({ pin_baru: '012345', punyaPin: false }), { pin_baru: '012345' });
  assert.match(validasiPinForm({ pin_baru: '12345', punyaPin: false }), /6 digit/);
  assert.match(validasiPinForm({ pin_baru: '123456', pin_lama: '', punyaPin: true }), /PIN lama wajib/);
  assert.deepEqual(bangunPayloadPin({ pin_baru: '654321', pin_lama: '012345', punyaPin: true }), {
    pin_lama: '012345',
    pin_baru: '654321',
  });
});

test('validasiLimitForm & bangunPayloadLimit mendukung null untuk Tanpa Batas', () => {
  assert.equal(validasiLimitForm({ tanpaBatas: true, limit_harian: '' }), '');
  assert.deepEqual(bangunPayloadLimit({ tanpaBatas: true, limit_harian: 10000 }), { limit_harian: null });
  assert.equal(validasiLimitForm({ tanpaBatas: false, limit_harian: 25000 }), '');
  assert.deepEqual(bangunPayloadLimit({ tanpaBatas: false, limit_harian: 25000 }), { limit_harian: 25000 });
  assert.match(validasiLimitForm({ tanpaBatas: false, limit_harian: -1 }), /non-negatif/);
});

test('validasiTopup & bangunPayloadTopup menolak nominal <= 0 dan memangkas catatan', () => {
  const siswa = { id: '550e8400-e29b-41d4-a716-446655440001' };
  assert.match(validasiTopup({ siswa: null, nominal: 10000 }), /Pilih siswa/);
  assert.match(validasiTopup({ siswa, nominal: 0 }), /lebih dari 0/);
  assert.equal(validasiTopup({ siswa, nominal: 50000, catatan: ' Titipan wali ' }), '');
  assert.deepEqual(
    bangunPayloadTopup({ siswaId: siswa.id, nominal: 50000, idempotencyKey: 'top-1', catatan: ' Titipan wali ' }),
    { siswa_id: siswa.id, nominal: 50000, idempotency_key: 'top-1', catatan: 'Titipan wali' },
  );
});

test('sisaLimitHarian dan validasiCheckout melindungi saldo kurang, limit harian, unit nonaktif, dan format PIN', () => {
  const sekarang = new Date('2026-11-19T12:00:00.000Z');
  const siswa = { id: '550e8400-e29b-41d4-a716-446655440001' };
  const dompet = { is_aktif: true, punya_pin: true, saldo: 50000, limit_harian: 25000, terkunci_sampai: null };
  const keranjang = [{ menu_id: 1, nama_menu: 'Nasi', harga: 15000, jumlah: 1 }];

  assert.equal(sisaLimitHarian(dompet, 12000), 13000);
  assert.equal(sisaLimitHarian({ limit_harian: null }, 99999), null);

  assert.match(
    validasiCheckout({ siswa, dompet, pemakaianHariIni: 0, keranjang, pin: '012345', unitAktif: false, now: sekarang }),
    /Unit kantin sedang dinonaktifkan/,
  );
  assert.match(
    validasiCheckout({ siswa, dompet, pemakaianHariIni: 15000, keranjang, pin: '012345', unitAktif: true, now: sekarang }),
    /sisa limit harian/,
  );
  assert.match(
    validasiCheckout({ siswa, dompet: { ...dompet, saldo: 10000 }, pemakaianHariIni: 0, keranjang, pin: '012345', unitAktif: true, now: sekarang }),
    /tidak mencukupi/,
  );
  assert.equal(
    validasiCheckout({ siswa, dompet, pemakaianHariIni: 5000, keranjang, pin: '012345', unitAktif: true, now: sekarang }),
    '',
  );

  assert.deepEqual(
    bangunPayloadCheckout({ siswaId: siswa.id, pin: '012345', keranjang, idempotencyKey: 'kasir-1', catatan: '' }),
    {
      siswa_id: siswa.id,
      pin: '012345',
      items: [{ menu_id: 1, jumlah: 1 }],
      idempotency_key: 'kasir-1',
    },
  );
});

test('validasiReversal hanya mengizinkan BELANJA yang belum direversal dengan alasan >= 5 karakter', () => {
  assert.match(validasiReversal({ transaksi: { id: 1, jenis_transaksi: 'TOPUP' }, alasan: 'Salah' }), /Hanya transaksi BELANJA/);
  assert.match(validasiReversal({ transaksi: { id: 1, jenis_transaksi: 'BELANJA', reversal: { id: 2 } }, alasan: 'Salah' }), /sudah pernah/);
  assert.match(validasiReversal({ transaksi: { id: 1, jenis_transaksi: 'BELANJA' }, alasan: 'abc' }), /minimal 5/);
  assert.equal(validasiReversal({ transaksi: { id: 1, jenis_transaksi: 'BELANJA' }, alasan: 'Salah input item' }), '');
  assert.deepEqual(bangunPayloadReversal({ alasan: '  Salah input item  ', idempotencyKey: 'rev-1' }), {
    alasan: 'Salah input item',
    idempotency_key: 'rev-1',
  });
});

test('bacaStatusGerbangKantin membedakan 404 tautan belum ada, 403 nonaktif, dan unit kantin nonaktif', () => {
  assert.equal(
    bacaStatusGerbangKantin({ isError: true, error: { response: { status: 404, data: { kode: 'KANTIN_TIDAK_DITEMUKAN' } } } }).status,
    'tautan_belum_ada',
  );
  assert.equal(
    bacaStatusGerbangKantin({ isError: true, error: { response: { status: 403 } } }).status,
    'terlarang',
  );
  const okNonaktif = bacaStatusGerbangKantin({ isError: false, profilData: { kantin: { is_aktif: false } } });
  assert.equal(okNonaktif.status, 'ok');
  assert.equal(okNonaktif.unitAktif, false);
  assert.equal(
    pesanGalatKantin({ response: { data: { errors: ['A wajib', 'B salah'] } } }, 'fallback'),
    'A wajib, B salah',
  );
});
