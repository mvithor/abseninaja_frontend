import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAKS_BERKAS, MAKS_BYTE, tahunAjaranSekarang, periksaPilihan, butirBaru, susunMeta, tandaPermintaan,
  statusBerkas, isiDariLaporan, barisGalat, ringkasHasilSimpan,
} from './impor.js';

const berkas = (name, size = 1000, lastModified = 1) => ({ name, size, lastModified });

test('tahunAjaranSekarang: Juli ke atas tahun ajaran baru, sebelum Juli masih tahun ajaran lama', () => {
  assert.equal(tahunAjaranSekarang(new Date(2026, 9, 27)), '2026/2027');
  assert.equal(tahunAjaranSekarang(new Date(2026, 6, 1)), '2026/2027');
  assert.equal(tahunAjaranSekarang(new Date(2026, 5, 30)), '2025/2026');
  assert.equal(tahunAjaranSekarang(new Date(2027, 0, 5)), '2026/2027');
});

test('periksaPilihan: hanya .xlsx, tidak kosong, tidak lebih dari 2 MB, tanpa duplikat, paling banyak 10', () => {
  const { diterima, ditolak } = periksaPilihan([
    berkas('a.xlsx'), berkas('B.XLSX', 5), berkas('c.xls'), berkas('d.csv'), berkas('kosong.xlsx', 0),
    berkas('besar.xlsx', MAKS_BYTE + 1), berkas('a.xlsx'), berkas('pas.xlsx', MAKS_BYTE),
  ]);
  assert.deepEqual(diterima.map((f) => f.name), ['a.xlsx', 'B.XLSX', 'pas.xlsx']);
  assert.deepEqual(ditolak.map((x) => x.nama), ['c.xls', 'd.csv', 'kosong.xlsx', 'besar.xlsx', 'a.xlsx']);
  assert.match(ditolak[0].alasan, /\.xlsx/);
  assert.equal(ditolak[4].alasan, 'sudah dipilih');
});

test('periksaPilihan: berkas yang sudah dipilih sebelumnya ikut dihitung terhadap batas dan duplikat', () => {
  const ada = Array.from({ length: MAKS_BERKAS - 1 }, (_, i) => berkas(`x${i}.xlsx`));
  const r = periksaPilihan([berkas('x0.xlsx'), berkas('baru.xlsx'), berkas('lagi.xlsx')], ada);
  assert.deepEqual(r.diterima.map((f) => f.name), ['baru.xlsx']);
  assert.equal(r.ditolak.find((x) => x.nama === 'x0.xlsx').alasan, 'sudah dipilih');
  assert.match(r.ditolak.find((x) => x.nama === 'lagi.xlsx').alasan, /paling banyak 10/);
});

test('susunMeta: yang kosong tidak dikirim; mapel berkas menang atas mapel bersama; jenis kosong tetap dikirim sebagai ""', () => {
  const a = butirBaru(berkas('a.xlsx'), 1);
  const b = { ...butirBaru(berkas('b.xlsx'), 2), nama_kelas: ' VIII B ', mapel: 'IPA', jenis: ['INDIVIDU', '', 'KELOMPOK'] };
  const meta = susunMeta([a, b], { semester: 'Ganjil', tahun_ajaran: '2026/2027', mapel: 'Bahasa Arab' });
  assert.deepEqual(meta[0], { semester: 'Ganjil', tahun_ajaran: '2026/2027', mapel: 'Bahasa Arab' });
  assert.deepEqual(meta[1], {
    semester: 'Ganjil', tahun_ajaran: '2026/2027', mapel: 'IPA', nama_kelas: 'VIII B', jenis_proyek: ['INDIVIDU', '', 'KELOMPOK'],
  });
  assert.deepEqual(susunMeta([a], { semester: '', tahun_ajaran: ' ', mapel: '' }), [{}], 'tidak ada tebakan bawaan');
});

test('tandaPermintaan: berubah bila isian atau berkas berubah, sama bila tidak', () => {
  const bersama = { semester: 'Ganjil', tahun_ajaran: '2026/2027', mapel: '' };
  const a = butirBaru(berkas('a.xlsx'), 1);
  const t1 = tandaPermintaan([a], bersama);
  assert.equal(tandaPermintaan([{ ...a }], { ...bersama }), t1);
  assert.notEqual(tandaPermintaan([a], { ...bersama, semester: 'Genap' }), t1);
  assert.notEqual(tandaPermintaan([{ ...a, jenis: ['INDIVIDU'] }], bersama), t1);
  assert.notEqual(tandaPermintaan([{ ...a, file: berkas('a.xlsx', 2000) }], bersama), t1);
});

test('statusBerkas: bentrok > galat > keputusan > siap', () => {
  const dasar = { galat: [], jumlah_galat: 0, perlu_keputusan: [], bentrok: false };
  assert.equal(statusBerkas(dasar), 'siap');
  assert.equal(statusBerkas({ ...dasar, perlu_keputusan: [{ kolom: 'semester' }] }), 'keputusan');
  assert.equal(statusBerkas({ ...dasar, jumlah_galat: 3, perlu_keputusan: [{ kolom: 'semester' }] }), 'galat');
  assert.equal(statusBerkas({ ...dasar, galat: [{ pesan: 'x' }], jumlah_galat: 1, bentrok: true }), 'bentrok');
});

test('isiDariLaporan: nama kelas terbaca jadi isian awal, jenis proyek disiapkan; ubahan guru tidak ditimpa', () => {
  const laporan = [{
    kelas: { nama_kelas: 'VII. A' },
    struktur: { proyek: [{ nama: 'LM1', jenis: null }, { nama: 'LM2', jenis: null }] },
  }];
  const [hasil] = isiDariLaporan([butirBaru(berkas('a.xlsx'), 1)], laporan);
  assert.equal(hasil.nama_kelas, 'VII. A');
  assert.deepEqual(hasil.jenis, ['', '']);
  const ubahan = { ...hasil, nama_kelas: '7A', jenis: ['KELOMPOK', ''] };
  const [lagi] = isiDariLaporan([ubahan], laporan);
  assert.equal(lagi.nama_kelas, '7A');
  assert.deepEqual(lagi.jenis, ['KELOMPOK', '']);
  assert.deepEqual(isiDariLaporan([ubahan], []), [ubahan], 'tanpa laporan tidak berubah');
});

test('barisGalat dan ringkasHasilSimpan', () => {
  assert.equal(barisGalat({ sel: 'D12', pesan: 'bukan bilangan' }), 'D12: bukan bilangan');
  assert.equal(barisGalat({ sel: null, pesan: 'Kelas sudah ada' }), 'Kelas sudah ada');
  assert.equal(
    ringkasHasilSimpan({ kelas: [{ jumlah_siswa: 42, jumlah_nilai: 7 }, { jumlah_siswa: 30, jumlah_nilai: 0 }] }),
    '2 kelas dibuat: 72 siswa dan 7 nilai tersimpan.',
  );
  assert.equal(ringkasHasilSimpan({ kelas: [] }), '');
});
