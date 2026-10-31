import test from 'node:test';
import assert from 'node:assert/strict';
import {
  metaStatus,
  bisaDicabut,
  filterPenugasan,
  formatWaktu,
  petunjukPersona,
  validasiBeri,
  bangunPayloadBeri,
  pesanGalat,
} from './penugasan.js';

const katalog = {
  persona: [
    { kode: 'kepala_sekolah', label: 'Kepala Sekolah', perlu_tahun_ajaran: false, unik_per_sekolah: true },
    { kode: 'waka_kurikulum', label: 'Waka Kurikulum', perlu_tahun_ajaran: true, unik_per_sekolah: false },
    { kode: 'guru_bk', label: 'Guru BK', perlu_tahun_ajaran: false, unik_per_sekolah: false },
  ],
  tahun_ajaran_aktif: { id: 'ta-1', label: '2026/2027' },
};

test('metaStatus: tiga status dikenal dan status asing tidak merusak tampilan', () => {
  assert.equal(metaStatus('aktif').label, 'Aktif');
  assert.equal(metaStatus('tidak_berlaku_saat_ini').label, 'Tidak berlaku saat ini');
  assert.equal(metaStatus('dicabut').label, 'Dicabut');
  assert.equal(metaStatus('aneh').label, 'aneh');
  assert.equal(metaStatus(undefined).label, '-');
});

test('bisaDicabut: hanya yang belum dicabut', () => {
  assert.equal(bisaDicabut({ status: 'aktif' }), true);
  assert.equal(bisaDicabut({ status: 'tidak_berlaku_saat_ini' }), true);
  assert.equal(bisaDicabut({ status: 'dicabut' }), false);
  assert.equal(bisaDicabut(null), false);
});

test('filterPenugasan: cari nama, NIP, persona; urutan server dipertahankan', () => {
  const daftar = [
    { id: 1, label: 'Guru BK', pegawai: { nama: 'Zainal', nip: '1980' } },
    { id: 2, label: 'Waka Kurikulum', pegawai: { nama: 'Ani', nip: null } },
    { id: 3, label: 'Guru BK', pegawai: { nama: 'Budi', nip: '1975' } },
  ];
  assert.deepEqual(filterPenugasan(daftar, '').map((d) => d.id), [1, 2, 3]);
  assert.deepEqual(filterPenugasan(daftar, 'guru bk').map((d) => d.id), [1, 3]);
  assert.deepEqual(filterPenugasan(daftar, 'ANI').map((d) => d.id), [2]);
  assert.deepEqual(filterPenugasan(daftar, '1975').map((d) => d.id), [3]);
  assert.deepEqual(filterPenugasan(daftar, 'tidak ada'), []);
  assert.deepEqual(filterPenugasan(undefined, 'a'), []);
});

test('formatWaktu: kosong dan rusak menjadi "-", zona waktu sekolah dipakai', () => {
  assert.equal(formatWaktu(null), '-');
  assert.equal(formatWaktu('bukan tanggal'), '-');
  const jakarta = formatWaktu('2026-11-01T17:30:00Z', 'Asia/Jakarta'); // 00:30 tanggal 2
  const utc = formatWaktu('2026-11-01T17:30:00Z', 'UTC');
  assert.notEqual(jakarta, utc);
  assert.match(jakarta, /2026/);
});

test('petunjukPersona: waka butuh tahun ajaran aktif; tanpa itu pemberian ditahan', () => {
  const waka = katalog.persona[1];
  const ok = petunjukPersona(waka, katalog.tahun_ajaran_aktif);
  assert.equal(ok.tahan, false);
  assert.match(ok.catatan[0], /2026\/2027/);
  const tanpa = petunjukPersona(waka, null);
  assert.equal(tanpa.tahan, true);
  assert.match(tanpa.alasanTahan, /tahun ajaran aktif/i);
});

test('petunjukPersona: kepala sekolah unik per sekolah, tidak butuh tahun ajaran', () => {
  const hasil = petunjukPersona(katalog.persona[0], null);
  assert.equal(hasil.tahan, false);
  assert.equal(hasil.catatan.length, 1);
  assert.match(hasil.catatan[0], /satu Kepala Sekolah/);
  assert.deepEqual(petunjukPersona(katalog.persona[2], null), { catatan: [], tahan: false, alasanTahan: '' });
  assert.deepEqual(petunjukPersona(undefined, null), { catatan: [], tahan: false, alasanTahan: '' });
});

test('validasiBeri: urutan pesan dan kasus lolos', () => {
  assert.equal(validasiBeri({ pegawaiId: 5, kode: '', katalog }), 'Persona wajib dipilih.');
  assert.equal(validasiBeri({ pegawaiId: 5, kode: 'x', katalog }), 'Persona tidak dikenal.');
  assert.equal(validasiBeri({ pegawaiId: '', kode: 'guru_bk', katalog }), 'Pegawai wajib dipilih.');
  assert.equal(validasiBeri({ pegawaiId: 5, kode: 'guru_bk', katalog }), '');
  assert.equal(validasiBeri({ pegawaiId: 5, kode: 'waka_kurikulum', katalog }), '');
  assert.match(
    validasiBeri({ pegawaiId: 5, kode: 'waka_kurikulum', katalog: { ...katalog, tahun_ajaran_aktif: null } }),
    /tahun ajaran aktif/i,
  );
});

test('bangunPayloadBeri: angka, catatan dipangkas, catatan kosong dibuang, tanpa tahun ajaran', () => {
  assert.deepEqual(bangunPayloadBeri({ pegawaiId: '7', kode: 'guru_bk', catatan: '  ' }), {
    pegawai_id: 7,
    kode_persona: 'guru_bk',
  });
  assert.deepEqual(bangunPayloadBeri({ pegawaiId: 7, kode: 'guru_bk', catatan: ' SK 12/2026 ' }), {
    pegawai_id: 7,
    kode_persona: 'guru_bk',
    catatan: 'SK 12/2026',
  });
  assert.equal('tahun_ajaran_id' in bangunPayloadBeri({ pegawaiId: 7, kode: 'waka_kurikulum' }), false);
});

test('pesanGalat: errors[] lebih dulu, lalu msg, lalu fallback', () => {
  assert.equal(pesanGalat({ response: { data: { errors: ['a', 'b'], msg: 'c' } } }, 'f'), 'a, b');
  assert.equal(pesanGalat({ response: { data: { msg: 'Sudah ada Kepala Sekolah aktif' } } }, 'f'), 'Sudah ada Kepala Sekolah aktif');
  assert.equal(pesanGalat({ response: { data: {} } }, 'f'), 'f');
  assert.equal(pesanGalat(new Error('x'), 'f'), 'f');
  assert.equal(pesanGalat(undefined, 'f'), 'f');
});
