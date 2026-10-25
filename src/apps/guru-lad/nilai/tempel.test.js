// Uji fungsi murni input grid LAD. Jalankan: node --test src/apps/guru-lad/nilai/tempel.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  uraiTempel, bacaNilaiSel, tampilNilai, terapkanTempel, uraiDaftarSiswa, potong,
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
