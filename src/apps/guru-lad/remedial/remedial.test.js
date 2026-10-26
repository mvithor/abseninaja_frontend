import test from 'node:test';
import assert from 'node:assert/strict';
import {
  kunciRemedial, kelompokkanRemedial, remedialTerbaru, mencapaiKktp, catatanBatas, periksaSkor, periksaTanggal,
  tanggalLokal, cariTpId, tpUntukRemedial, barisRemedial, namaTpLengkap,
} from './remedial.js';

const LM = [
  { id: 10, urutan: 1, nama: 'Bilangan', tp: [{ id: 101, urutan: 1, kode: '1.1' }, { id: 102, urutan: 2, kode: '1.2' }] },
  { id: 20, urutan: 2, nama: 'Pecahan', tp: [{ id: 201, urutan: 1, kode: '' }, { id: 202, urutan: 2, kode: '2.2' }] },
];
const SISWA = [{ id: 1, urutan: 1, nama: 'Ani' }, { id: 2, urutan: 2, nama: 'Budi' }];

test('namaTpLengkap: kode bila ada, kalau tidak nomor urut', () => {
  assert.equal(namaTpLengkap({ kode: '1.2', urutan: 2 }, 1), 'TP 1.2 (LM 1)');
  assert.equal(namaTpLengkap({ kode: '  ', urutan: 3 }, 2), 'TP 3 (LM 2)');
  assert.equal(namaTpLengkap({ urutan: 1 }, 4), 'TP 1 (LM 4)');
});

test('kelompokkanRemedial: per siswa dan TP, terurut menaik menurut urutan walau masukan acak', () => {
  const peta = kelompokkanRemedial([
    { id: 3, siswa_id: 1, tp_id: 102, urutan: 2 },
    { id: 1, siswa_id: 1, tp_id: 102, urutan: 1 },
    { id: 2, siswa_id: 2, tp_id: 102, urutan: 1 },
  ]);
  assert.deepEqual(peta.get(kunciRemedial(1, 102)).map((r) => r.id), [1, 3]);
  assert.deepEqual(peta.get(kunciRemedial(2, 102)).map((r) => r.id), [2]);
  assert.equal(peta.size, 2);
  assert.equal(kelompokkanRemedial(undefined).size, 0);
});

test('remedialTerbaru: urutan terbesar, bukan skor terbaik (D-20); kosong menjadi null', () => {
  const daftar = [{ urutan: 1, nilai_remedial: 90 }, { urutan: 2, nilai_remedial: 60 }];
  assert.equal(remedialTerbaru(daftar).nilai_remedial, 60);
  assert.equal(remedialTerbaru([]), null);
  assert.equal(remedialTerbaru(undefined), null);
});

test('mencapaiKktp: tepat di KKTP mencapai, satu sen di bawahnya tidak, tahan galat floating point', () => {
  assert.equal(mencapaiKktp(75, 75), true);
  assert.equal(mencapaiKktp(74.99, 75), false);
  assert.equal(mencapaiKktp('75', '75.00'), true);
  assert.equal(mencapaiKktp(66, 66), true);
  assert.equal(mencapaiKktp(0.1 + 0.2, 0.3), true);
});

test('catatanBatas: hanya bila skor melebihi KKTP; tepat di KKTP tidak diberi catatan', () => {
  assert.equal(catatanBatas(75, 75), null);
  assert.equal(catatanBatas(60, 75), null);
  assert.equal(catatanBatas(null, 75), null);
  assert.match(catatanBatas(80, 75), /apa adanya.*paling tinggi sebesar KKTP \(75\)/);
  assert.match(catatanBatas(70, 66.5), /\(66,5\)/);
});

test('periksaSkor: wajib diisi, koma dan titik diterima, di luar 0 sampai 100 dan lebih dari dua desimal ditolak, 0 sah', () => {
  assert.deepEqual(periksaSkor('80,5'), { nilai: 80.5 });
  assert.deepEqual(periksaSkor(' 75 '), { nilai: 75 });
  assert.deepEqual(periksaSkor('0'), { nilai: 0 });
  assert.equal(periksaSkor('').galat, 'Skor remedial wajib diisi');
  assert.equal(periksaSkor('   ').galat, 'Skor remedial wajib diisi');
  assert.equal(periksaSkor('abc').galat, 'Isi dengan angka, mis. 80 atau 80,5');
  assert.equal(periksaSkor('100,1').galat, 'harus antara 0 dan 100');
  assert.equal(periksaSkor('80,555').galat, 'paling banyak dua angka desimal');
  assert.equal(periksaSkor('101').galat, 'harus antara 0 dan 100');
});

test('periksaTanggal: kalender nyata saja; 30 Februari dan format lain ditolak, tahun kabisat benar', () => {
  assert.deepEqual(periksaTanggal('2026-10-01'), { tanggal: '2026-10-01' });
  assert.deepEqual(periksaTanggal('2028-02-29'), { tanggal: '2028-02-29' });
  assert.equal(periksaTanggal('2027-02-29').galat, 'Tanggal tidak ada di kalender');
  assert.equal(periksaTanggal('2026-02-30').galat, 'Tanggal tidak ada di kalender');
  assert.equal(periksaTanggal('2026-13-01').galat, 'Tanggal tidak ada di kalender');
  assert.equal(periksaTanggal('01/10/2026').galat, 'Tanggal wajib diisi');
  assert.equal(periksaTanggal('').galat, 'Tanggal wajib diisi');
  assert.equal(periksaTanggal(undefined).galat, 'Tanggal wajib diisi');
});

test('tanggalLokal: memakai tanggal lokal perangkat dengan nol di depan', () => {
  assert.equal(tanggalLokal(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(tanggalLokal(new Date(2026, 11, 31)), '2026-12-31');
});

test('cariTpId: dari nomor LM dan nomor TP; tidak ada menjadi null', () => {
  assert.equal(cariTpId(LM, 1, 2), 102);
  assert.equal(cariTpId(LM, 2, 1), 201);
  assert.equal(cariTpId(LM, 3, 1), null);
  assert.equal(cariTpId(LM, 1, 9), null);
  assert.equal(cariTpId(undefined, 1, 1), null);
});

test('tpUntukRemedial: hanya TP yang sudah bernilai untuk siswa itu, urut LM lalu TP, bawahKktp menurut KKTP', () => {
  const nilai = new Map([
    [kunciRemedial(1, 101), 80], [kunciRemedial(1, 102), 58], [kunciRemedial(1, 202), 75],
    [kunciRemedial(1, 201), null], [kunciRemedial(2, 101), 40],
  ]);
  const hasil = tpUntukRemedial(1, LM, nilai, 75);
  assert.deepEqual(hasil.map((x) => x.id), [101, 102, 202]);
  assert.deepEqual(hasil.map((x) => x.bawahKktp), [false, true, false]);
  assert.equal(hasil[1].label, 'TP 1.2 (LM 1)');
  assert.deepEqual(tpUntukRemedial(3, LM, nilai, 75), []);
});

test('barisRemedial: urut siswa, TP, lalu urutan remedial; hanya remedial terbaru per sel yang bertanda terbaru', () => {
  const r = [
    { id: 5, siswa_id: 2, tp_id: 101, urutan: 1, nilai_awal: 40, nilai_remedial: 70, tanggal: '2026-10-02', catatan: null },
    { id: 4, siswa_id: 1, tp_id: 202, urutan: 1, nilai_awal: 50, nilai_remedial: 76, tanggal: '2026-10-03', catatan: 'ok' },
    { id: 2, siswa_id: 1, tp_id: 102, urutan: 2, nilai_awal: 58, nilai_remedial: 80, tanggal: '2026-10-05', catatan: '' },
    { id: 1, siswa_id: 1, tp_id: 102, urutan: 1, nilai_awal: 58, nilai_remedial: 60, tanggal: '2026-10-01', catatan: '' },
  ];
  const baris = barisRemedial({ remedial: r, siswa: SISWA, lm: LM });
  assert.deepEqual(baris.map((b) => b.id), [1, 2, 4, 5]);
  assert.deepEqual(baris.map((b) => b.terbaru), [false, true, true, true]);
  assert.equal(baris[0].nama, 'Ani');
  assert.equal(baris[0].labelTp, 'TP 1.2 (LM 1)');
  assert.equal(baris[3].catatan, '');
  assert.equal(baris[2].catatan, 'ok');
});

test('barisRemedial: siswa atau TP yang tidak dikenal tetap tampil di akhir, tidak melempar galat', () => {
  const baris = barisRemedial({ remedial: [{ id: 9, siswa_id: 99, tp_id: 999, urutan: 1, nilai_awal: 1, nilai_remedial: 2, tanggal: '2026-10-01' }], siswa: SISWA, lm: LM });
  assert.equal(baris.length, 1);
  assert.equal(baris[0].nama, 'Siswa 99');
  assert.equal(baris[0].labelTp, 'TP 999');
  assert.deepEqual(barisRemedial({ remedial: undefined, siswa: SISWA, lm: LM }), []);
});
