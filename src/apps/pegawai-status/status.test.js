import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALASAN_NONAKTIF, BATAS_CATATAN, labelAlasan, metaStatusPegawai, validasiNonaktif, bangunPayloadNonaktif,
  peringatanTanggungJawab, adaYangPerluPengganti, adaEfekGagal, pesanHasilNonaktif,
} from './status.js';

test('delapan alasan, kode sama dengan server, LAINNYA terakhir', () => {
  assert.deepEqual(
    ALASAN_NONAKTIF.map((a) => a.kode),
    ['MUTASI', 'MENGUNDURKAN_DIRI', 'PENSIUN', 'KONTRAK_BERAKHIR', 'DIBERHENTIKAN', 'MENINGGAL', 'CUTI_PANJANG', 'LAINNYA'],
  );
});

test('labelAlasan: tanpa penanda "catatan wajib", dan kode asing/sifat bawaan jadi "-"', () => {
  assert.equal(labelAlasan('LAINNYA'), 'Lainnya');
  assert.equal(labelAlasan('PENSIUN'), 'Pensiun');
  assert.equal(labelAlasan('constructor'), '-');
  assert.equal(labelAlasan(undefined), '-');
});

test('validasiNonaktif: alasan wajib dan sah; LAINNYA wajib catatan; catatan dibatasi', () => {
  assert.match(validasiNonaktif({ alasanKode: '' }), /wajib dipilih/);
  assert.match(validasiNonaktif({ alasanKode: 'KARANGAN' }), /tidak valid/);
  assert.match(validasiNonaktif({ alasanKode: 'LAINNYA', catatan: '   ' }), /Catatan wajib/);
  assert.equal(validasiNonaktif({ alasanKode: 'LAINNYA', catatan: 'pindah kota' }), '');
  assert.equal(validasiNonaktif({ alasanKode: 'PENSIUN' }), '');
  assert.match(validasiNonaktif({ alasanKode: 'PENSIUN', catatan: 'x'.repeat(BATAS_CATATAN + 1) }), /maksimal/);
  assert.equal(validasiNonaktif({ alasanKode: 'PENSIUN', catatan: 'x'.repeat(BATAS_CATATAN) }), '');
});

test('bangunPayloadNonaktif: catatan hanya dikirim bila ada, dan dirapikan', () => {
  assert.deepEqual(bangunPayloadNonaktif({ alasanKode: 'PENSIUN', catatan: '  ' }), { alasan_kode: 'PENSIUN' });
  assert.deepEqual(bangunPayloadNonaktif({ alasanKode: 'LAINNYA', catatan: ' sakit ' }), { alasan_kode: 'LAINNYA', catatan: 'sakit' });
});

test('peringatanTanggungJawab: hanya yang > 0, nol dan data rusak diabaikan', () => {
  assert.deepEqual(peringatanTanggungJawab(null), []);
  assert.deepEqual(peringatanTanggungJawab({ guru_mapel: 0, jadwal: 0 }), []);
  const kalimat = peringatanTanggungJawab({ guru_mapel: 2, jadwal: 7, wali_kelas: 1, ekskul: 0, penugasan_peran: 'x', kelas_lad: 3 });
  assert.deepEqual(kalimat, [
    'Guru mata pelajaran di 2 kelas', '7 slot jadwal pelajaran', 'Wali kelas di 1 kelas', '3 kelas di Analitik Pembelajaran',
  ]);
  for (const k of kalimat) assert.doesNotMatch(k, /\banda\b/i);
});

test('adaYangPerluPengganti: penugasan peran dan kelas LAD saja tidak perlu pengganti', () => {
  assert.equal(adaYangPerluPengganti({ penugasan_peran: 2, kelas_lad: 4 }), false);
  assert.equal(adaYangPerluPengganti({ wali_kelas: 1 }), true);
  assert.equal(adaYangPerluPengganti(undefined), false);
});

test('adaEfekGagal / pesanHasilNonaktif: efek gagal menjadi peringatan, bukan sukses polos', () => {
  assert.equal(adaEfekGagal({ data: { efek: { sesi_gagal: false } } }), false);
  assert.equal(adaEfekGagal({ data: { efek: { sesi_gagal: true } } }), true);
  assert.equal(adaEfekGagal({ data: { efek: { fcm_gagal: true } } }), true);
  assert.equal(adaEfekGagal({ peringatan: 'sesi belum dicabut' }), true);
  assert.deepEqual(pesanHasilNonaktif({ msg: 'Pegawai berhasil dinonaktifkan.', data: { efek: {} } }), { galat: '', sukses: 'Pegawai berhasil dinonaktifkan.' });
  assert.equal(pesanHasilNonaktif({ msg: 'ok', peringatan: 'sesi belum dicabut' }).galat, 'sesi belum dicabut');
  assert.match(pesanHasilNonaktif({ msg: 'ok', data: { efek: { cache_gagal: true } } }).galat, /Ulangi Nonaktifkan/);
});

test('metaStatusPegawai', () => {
  assert.equal(metaStatusPegawai('nonaktif').label, 'Nonaktif');
  assert.equal(metaStatusPegawai('aktif').label, 'Aktif');
  assert.equal(metaStatusPegawai(undefined).label, 'Aktif');
});
