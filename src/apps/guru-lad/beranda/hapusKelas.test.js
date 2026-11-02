import test from 'node:test';
import assert from 'node:assert/strict';
import {
  barisIsian, judulHapusKelas, kelasTidakDitemukan, namaCocok, pesanKelasDihapus, pesanKelasTidakDitemukan, polaMuncul,
} from './hapusKelas.js';

const ISIAN_CANVAS = {
  siswa: 24,
  lingkup_materi: 3,
  tp: 7,
  proyek: 2,
  nilai_tp: 154,
  nilai_proyek: 40,
  pertemuan: 12,
  kehadiran: 253,
  remedial: 3,
  keputusan_saran: 0,
};

test('barisIsian: urutan dan kalimat sama dengan desain dialog hapus kelas', () => {
  assert.deepEqual(barisIsian(ISIAN_CANVAS).map((b) => b.teks), [
    '24 siswa',
    '3 lingkup materi dan 7 TP',
    '154 nilai TP',
    '2 proyek beserta nilainya',
    '12 pertemuan dan 253 catatan kehadiran',
    '3 catatan remedial',
  ]);
});

test('barisIsian: keputusan saran disebut bila ada, karena ikut terhapus di server', () => {
  const baris = barisIsian({ ...ISIAN_CANVAS, keputusan_saran: 5 });
  assert.equal(baris.at(-1).kunci, 'saran');
  assert.equal(baris.at(-1).teks, '5 keputusan saran tindak lanjut');
});

test('barisIsian: baris yang semua angkanya 0 dibuang, kelas kosong tidak punya baris', () => {
  assert.deepEqual(barisIsian({
    siswa: 5, lingkup_materi: 0, tp: 0, proyek: 0, nilai_tp: 0, nilai_proyek: 0, pertemuan: 0, kehadiran: 0, remedial: 0, keputusan_saran: 0,
  }).map((b) => b.kunci), ['siswa']);
  assert.deepEqual(barisIsian({}), []);
  assert.deepEqual(barisIsian(null), []);
});

test('barisIsian: baris gabungan tetap tampil bila hanya salah satu angkanya lebih dari 0', () => {
  const baris = barisIsian({ lingkup_materi: 2, tp: 0, pertemuan: 0, kehadiran: 4 });
  assert.deepEqual(baris.map((b) => b.teks), ['2 lingkup materi dan 0 TP', '0 pertemuan dan 4 catatan kehadiran']);
});

test('namaCocok: spasi tepi dan besar-kecil huruf tidak dipersoalkan, kosong tidak pernah cocok', () => {
  assert.equal(namaCocok('8A', '8A'), true);
  assert.equal(namaCocok('  8a ', '8A'), true);
  assert.equal(namaCocok('8', '8A'), false);
  assert.equal(namaCocok('8B', '8A'), false);
  assert.equal(namaCocok('', ''), false);
  assert.equal(namaCocok(undefined, '8A'), false);
});

test('judul dan pesan memakai nama kelas serta mapel', () => {
  const k = { nama_kelas: '8A', mapel: 'Bahasa Arab' };
  assert.equal(judulHapusKelas(k), 'Hapus kelas 8A · Bahasa Arab?');
  assert.equal(pesanKelasDihapus(k), 'Kelas 8A · Bahasa Arab dihapus.');
});

test('pesanKelasTidakDitemukan tidak mengklaim kelas berhasil dihapus', () => {
  const teks = pesanKelasTidakDitemukan({ nama_kelas: '8A', mapel: 'Bahasa Arab' });
  assert.match(teks, /tidak ditemukan/);
  assert.doesNotMatch(teks, /dihapus\./);
});

test('kelasTidakDitemukan: hanya 404 yang dianggap kelas tidak ada', () => {
  assert.equal(kelasTidakDitemukan({ response: { status: 404 } }), true);
  assert.equal(kelasTidakDitemukan({ response: { status: 409 } }), false);
  assert.equal(kelasTidakDitemukan({ response: { status: 500 } }), false);
  assert.equal(kelasTidakDitemukan(new Error('Network Error')), false);
  assert.equal(kelasTidakDitemukan(null), false);
});

test('polaMuncul: urutan prioritas, nama pendek di Beranda, pola 0 dan pengayaan dibuang', () => {
  const kartu = { perhatian_per_pola_utama: { P1: 3, P2: 2, P3: 2, P4: 2, P5: 4 } };
  assert.deepEqual(polaMuncul(kartu), [
    { kode: 'P2', teks: 'Sering alpa', jumlah: 2 },
    { kode: 'P3', teks: 'Proyek tidak dikumpulkan', jumlah: 2 },
    { kode: 'P1', teks: 'Kesulitan pada TP', jumlah: 3 },
    { kode: 'P4', teks: 'Capaian menurun', jumlah: 2 },
  ]);
  assert.deepEqual(polaMuncul({ perhatian_per_pola_utama: { P1: 0, P2: 0, P3: 0, P4: 0 } }), []);
  assert.deepEqual(polaMuncul(null), []);
});

test('polaMuncul: jumlah semua chip sama dengan angka perhatian kelas contoh di desain (8A: 2+2+3+2 = 9)', () => {
  const kartu = { perhatian: 9, perhatian_per_pola_utama: { P2: 2, P3: 2, P1: 3, P4: 2 } };
  assert.equal(polaMuncul(kartu).reduce((s, p) => s + p.jumlah, 0), kartu.perhatian);
});
