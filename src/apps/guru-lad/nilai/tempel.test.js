// Uji fungsi murni input grid LAD. Jalankan: node --test src/apps/guru-lad/nilai/tempel.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  uraiTempel, bacaNilaiSel, tampilNilai, terapkanTempel, uraiDaftarSiswa, potong, pisahDuplikat, kePayloadSiswa,
} from './tempel.js';

test('uraiTempel: baris baru penutup Excel tidak menjadi baris data, sel kosong dipertahankan', () => {
  assert.deepEqual(uraiTempel('80\t75,5\r\n\t90\r\n'), [['80', '75,5'], ['', '90']]);
  assert.deepEqual(uraiTempel('80'), [['80']]);
  assert.deepEqual(uraiTempel(''), []);
  assert.deepEqual(uraiTempel(null), []);
  assert.deepEqual(uraiTempel('a\n\nb'), [['a'], [''], ['b']], 'baris kosong di tengah tetap ada');
});

test('bacaNilaiSel: koma dan titik sah, kosong berarti belum dinilai, nol adalah nilai', () => {
  assert.deepEqual(bacaNilaiSel('74,5'), { nilai: 74.5, centi: 7450 });
  assert.deepEqual(bacaNilaiSel('74.5'), { nilai: 74.5, centi: 7450 });
  assert.deepEqual(bacaNilaiSel(' 80 '), { nilai: 80, centi: 8000 });
  assert.deepEqual(bacaNilaiSel('0'), { nilai: 0, centi: 0 });
  assert.deepEqual(bacaNilaiSel('100'), { nilai: 100, centi: 10000 });
  assert.deepEqual(bacaNilaiSel('100,00'), { nilai: 100, centi: 10000 });
  assert.deepEqual(bacaNilaiSel('0,07'), { nilai: 0.07, centi: 7 });
  assert.deepEqual(bacaNilaiSel(''), { nilai: null });
  assert.deepEqual(bacaNilaiSel('   '), { nilai: null });
  assert.deepEqual(bacaNilaiSel(undefined), { nilai: null });
});

test('bacaNilaiSel: lebih dari dua desimal, di luar rentang, dan bukan bilangan ditolak, tidak dibulatkan', () => {
  const buruk = ['74,995', '74.999999', '100,01', '101', '1000', '-1', 'abc', '7a', '1e2', '75%', '1,2,3', '.5', '5.', '1 000'];
  for (const x of buruk) {
    assert.ok(bacaNilaiSel(x).galat, `${JSON.stringify(x)} harus ditolak`);
  }
});

test('tampilNilai: titik menjadi koma, null menjadi teks kosong', () => {
  assert.equal(tampilNilai(74.5), '74,5');
  assert.equal(tampilNilai(80), '80');
  assert.equal(tampilNilai(0), '0');
  assert.equal(tampilNilai(null), '');
  assert.equal(tampilNilai(undefined), '');
});

test('terapkanTempel: mengisi mulai dari sel aktif dan memotong yang keluar dari grid', () => {
  const data = uraiTempel('1\t2\t3\n4\t5\t6');
  const h = terapkanTempel({
    data, mulaiBaris: 1, mulaiKolom: 1, jumlahBaris: 3, jumlahKolom: 3,
  });
  assert.deepEqual(h.perubahan.map((p) => [p.baris, p.kolom, p.teks]), [[1, 1, '1'], [1, 2, '2'], [2, 1, '4'], [2, 2, '5']]);
  assert.equal(h.terpotong, 2);
  const semua = terapkanTempel({
    data, mulaiBaris: 0, mulaiKolom: 0, jumlahBaris: 9, jumlahKolom: 9,
  });
  assert.equal(semua.perubahan.length, 6);
  assert.equal(semua.terpotong, 0);
});

test('terapkanTempel: sel kosong hasil tempel ikut menjadi perubahan (mengosongkan nilai)', () => {
  const h = terapkanTempel({
    data: uraiTempel('\t5'), mulaiBaris: 0, mulaiKolom: 0, jumlahBaris: 1, jumlahKolom: 2,
  });
  assert.deepEqual(h.perubahan.map((p) => p.teks), ['', '5']);
});

test('uraiDaftarSiswa: nama saja, nama dan NIS dengan tab atau titik koma, baris kosong dilewati', () => {
  const h = uraiDaftarSiswa('Ahmad  Fauzi\t12345\nSiti Aminah\n\nBudi;777\n\t999\n');
  assert.deepEqual(h.siswa, [{ nama: 'Ahmad Fauzi', nis: '12345' }, { nama: 'Siti Aminah' }, { nama: 'Budi', nis: '777' }]);
  assert.deepEqual(h.galat, [{ baris: 5, pesan: 'nama kosong' }]);
});

test('potong: membagi daftar menjadi potongan berukuran tetap', () => {
  assert.deepEqual(potong([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(potong([], 3), []);
});

test('uraiDaftarSiswa: rincian membawa nomor baris asli (mulai 1) dan melewati baris kosong', () => {
  const h = uraiDaftarSiswa('Ahmad\t1\n\nSiti\n');
  assert.deepEqual(h.rincian, [{ baris: 1, nama: 'Ahmad', nis: '1' }, { baris: 3, nama: 'Siti', nis: '' }]);
});

const r = (baris, nama, nis = '') => ({ baris, nama, nis });

test('pisahDuplikat: baris identik dengan siswa yang ada dilewati, sisanya ditambah', () => {
  const ada = [{ nama: 'Aldi Prasetyo', nis: '24001' }, { nama: 'Bella', nis: '24002' }];
  const h = pisahDuplikat([r(1, 'Aldi Prasetyo', '24001'), r(2, 'BELLA', '24002'), r(3, 'Candra', '24003')], ada);
  assert.deepEqual(h.dilewati.map((x) => x.baris), [1, 2]);
  assert.deepEqual(h.tambah.map((x) => x.baris), [3]);
  assert.deepEqual(h.bentrok, []);
});

test('pisahDuplikat: NIS sama dengan nama berbeda menjadi bentrok, bukan dilewati', () => {
  const h = pisahDuplikat([r(3, 'Candra Wijaya', '24003')], [{ nama: 'Dewi', nis: '24003' }]);
  assert.equal(h.bentrok.length, 1);
  assert.equal(h.bentrok[0].baris, 3);
  assert.equal(h.bentrok[0].dipakaiOleh, 'Dewi');
  assert.equal(h.bentrok[0].asal, 'daftar');
  assert.deepEqual(h.tambah, []);
  assert.deepEqual(h.dilewati, []);
});

test('pisahDuplikat: duplikat di dalam tempelan itu sendiri (identik dilewati, nama beda bentrok)', () => {
  const h = pisahDuplikat([r(1, 'Aldi', '1'), r(2, 'Aldi', '1'), r(3, 'Budi', '1')], []);
  assert.deepEqual(h.tambah.map((x) => x.baris), [1]);
  assert.deepEqual(h.dilewati.map((x) => x.baris), [2]);
  assert.deepEqual(h.bentrok.map((x) => [x.baris, x.asal]), [[3, 'tempelan']]);
});

test('pisahDuplikat: tanpa NIS, nama sama dianggap identik; nama sama dengan NIS berbeda tetap ditambah', () => {
  const ada = [{ nama: 'Siti Aminah', nis: null }, { nama: 'Ahmad', nis: '10' }];
  const h = pisahDuplikat([r(1, 'siti  aminah'), r(2, 'Ahmad', '11'), r(3, 'Ahmad')], ada);
  assert.deepEqual(h.dilewati.map((x) => x.baris), [1]);
  assert.deepEqual(h.tambah.map((x) => x.baris), [2, 3]);
  assert.deepEqual(h.bentrok, []);
});

test('pisahDuplikat: NIS dibandingkan persis, awalan nol tidak diabaikan', () => {
  const h = pisahDuplikat([r(1, 'Aldi', '024001')], [{ nama: 'Budi', nis: '24001' }]);
  assert.deepEqual(h.tambah.map((x) => x.baris), [1]);
});

test('kePayloadSiswa: NIS kosong tidak dikirim dan nomor baris tidak ikut', () => {
  assert.deepEqual(kePayloadSiswa([r(4, 'A', '1'), r(5, 'B')]), [{ nama: 'A', nis: '1' }, { nama: 'B' }]);
});
