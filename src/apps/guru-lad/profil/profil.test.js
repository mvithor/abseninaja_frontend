import test from 'node:test';
import assert from 'node:assert/strict';
import {
  capaianPerLm, kehadiranSiswa, kunciP1, proyekSiswa, rataDuaDesimal, riwayatRemedial, trenPerLm,
} from './profil.js';
import { siapkanKonteks } from '../evaluasi/matriks.js';

const AMBANG = { ambang_bagian: 41, kktp: 75, ambang_pengayaan: 90 };
const LM = [
  { id: 1, urutan: 1, nama: 'Bilangan', tp: [{ id: 11, urutan: 1, kode: '1.1' }, { id: 12, urutan: 2, kode: null }] },
  { id: 2, urutan: 2, nama: 'Kosong', tp: [] },
  { id: 3, urutan: 3, nama: 'Aljabar', tp: [{ id: 31, urutan: 1, kode: 'A' }] },
];
const PROYEK = [
  { id: 101, urutan: 1, jenis: 'INDIVIDU', nama: 'Poster' },
  { id: 102, urutan: 2, jenis: 'KELOMPOK', nama: null },
];
const nt = (siswa, tp, nilai) => ({ siswa_id: siswa, tp_id: tp, nilai });
const ctx = siapkanKonteks({
  siswa: [{ id: 1 }, { id: 2 }, { id: 3 }],
  nilaiTp: [nt(1, 11, '80'), nt(1, 12, '60'), nt(1, 31, '70.5'), nt(2, 11, '90'), nt(2, 12, '90'), nt(3, 11, null)],
  nilaiProyek: [{ siswa_id: 1, proyek_id: 101, nilai: '0' }, { siswa_id: 1, proyek_id: 102, nilai: '0' }],
  remedial: [
    {
      id: 5, siswa_id: 1, tp_id: 12, urutan: 1, nilai_awal: '60', nilai_remedial: '70', tanggal: '2026-10-01', catatan: 'a',
    },
    {
      id: 6, siswa_id: 1, tp_id: 12, urutan: 2, nilai_awal: '60', nilai_remedial: '80', tanggal: '2026-10-08', catatan: '',
    },
  ],
  pertemuan: [{ id: 1, nomor: 1 }, { id: 2, nomor: 2 }, { id: 3, nomor: 3 }, { id: 4, nomor: 4 }],
  kehadiran: [
    { siswa_id: 1, pertemuan_id: 1, kode: 'H' }, { siswa_id: 1, pertemuan_id: 2, kode: 'A' },
    { siswa_id: 1, pertemuan_id: 3, kode: 'S' },
  ],
});

test('rataDuaDesimal: setengah ke atas dalam sen, kosong diabaikan', () => {
  assert.equal(rataDuaDesimal([80, 60]), 70);
  assert.equal(rataDuaDesimal([80, null, undefined, '']), 80);
  assert.equal(rataDuaDesimal([]), null);
  assert.equal(rataDuaDesimal([null]), null);
  assert.equal(rataDuaDesimal([70, 70, 71]), 70.33);
  assert.equal(rataDuaDesimal([70, 70, 72]), 70.67);
  assert.equal(rataDuaDesimal([0.01, 0]), 0.01);
  assert.equal(rataDuaDesimal([0, 0]), 0);
  assert.equal(rataDuaDesimal([100, 100, 99.97]), 99.99);
  assert.equal(rataDuaDesimal([100, 100, 99.99]), 100);
});

test('capaianPerLm: LM tanpa TP dilewati, nilai asli, tuntas pada tepat KKTP, remedial terbaru hanya catatan', () => {
  const g = capaianPerLm(1, LM, ctx, AMBANG, new Set(['1.2']));
  assert.deepEqual(g.map((x) => x.lm), [1, 3]);
  assert.equal(g[0].rata, 70);
  assert.equal(g[1].rata, 70.5);
  const [a, b] = g[0].tp;
  assert.equal(a.label, '1.1');
  assert.equal(a.nilai, 80);
  assert.equal(a.tuntas, true);
  assert.equal(b.label, 'TP 2');
  assert.equal(b.nilai, 60);
  // Remedial terbaru (80) mencapai KKTP 75: TP tuntas lewat remedial, nilai asli tetap 60.
  assert.equal(b.tuntas, true);
  assert.equal(b.tuntasLewatRemedial, true);
  assert.equal(a.tuntasLewatRemedial, false);
  assert.equal(b.ditandaiP1, true);
  assert.equal(a.ditandaiP1, false);
  assert.equal(b.remedialTerbaru, 80);
  assert.deepEqual(b.remedial.map((r) => r.nilai), [70, 80]);
  assert.equal(a.remedialTerbaru, null);
});

test('capaianPerLm: nilai tepat KKTP tuntas, satu sen di bawah belum; belum dinilai bukan nol', () => {
  const c = siapkanKonteks({ siswa: [], nilaiTp: [nt(1, 11, '75'), nt(1, 12, '74.99')], remedial: [] });
  const [lm1] = capaianPerLm(1, LM, c, AMBANG);
  assert.equal(lm1.tp[0].tuntas, true);
  assert.equal(lm1.tp[1].tuntas, false);
  const [kosong] = capaianPerLm(3, LM, c, AMBANG);
  assert.equal(kosong.tp[0].nilai, null);
  assert.equal(kosong.tp[0].tuntas, null);
  assert.equal(kosong.rata, null);
});

test('kunciP1 hanya dari penanda P1 yang DITANDAI', () => {
  const h = { pola: { P1: { status: 'DITANDAI', bukti: { tp: [{ lm: 1, tp: 2 }, { lm: 3, tp: 1 }] } } } };
  assert.deepEqual([...kunciP1(h)], ['1.2', '3.1']);
  assert.equal(kunciP1({ pola: { P1: { status: 'TIDAK' } } }).size, 0);
  assert.equal(kunciP1({ pola: { P1: { status: 'BELUM_CUKUP' } } }).size, 0);
  assert.equal(kunciP1(undefined).size, 0);
});

test('trenPerLm: rata-rata siswa dan kelas per LM, LM tanpa TP dilewati', () => {
  const t = trenPerLm(1, LM, [1, 2, 3], ctx);
  assert.deepEqual(t.map((x) => x.lm), [1, 3]);
  // LM 1: siswa 1 = 70, siswa 2 = 90, siswa 3 tanpa nilai -> kelas 80 dari 2 siswa
  assert.deepEqual(t[0], {
    lm: 1, siswa: 70, kelas: 80, jumlahKelas: 2,
  });
  assert.deepEqual(t[1], {
    lm: 3, siswa: 70.5, kelas: 70.5, jumlahKelas: 1,
  });
  assert.equal(trenPerLm(3, LM, [1, 2, 3], ctx)[0].siswa, null);
});

test('proyekSiswa: nol pada proyek individu = tidak dikumpulkan, nol pada kelompok tidak diberi arti', () => {
  const p = proyekSiswa(1, PROYEK, ctx);
  assert.equal(p[0].tidakDikumpulkan, true);
  assert.equal(p[0].kelompok, false);
  assert.equal(p[1].tidakDikumpulkan, false);
  assert.equal(p[1].kelompok, true);
  assert.equal(p[1].label, 'Proyek 2');
  const lain = proyekSiswa(2, PROYEK, ctx);
  assert.equal(lain[0].nilai, null);
  assert.equal(lain[0].tidakDikumpulkan, false);
});

test('kehadiranSiswa: kosong = belum dicatat, bukan alpa', () => {
  const k = kehadiranSiswa(1, ctx);
  assert.deepEqual(k.jumlah, {
    H: 1, S: 1, I: 0, A: 1,
  });
  assert.equal(k.tercatat, 3);
  assert.equal(k.pertemuan, 4);
  assert.equal(k.belumDicatat, 1);
  assert.deepEqual(k.deret.map((d) => d.kode), ['H', 'A', 'S', null]);
  const kosong = kehadiranSiswa(2, ctx);
  assert.equal(kosong.tercatat, 0);
  assert.equal(kosong.jumlah.A, 0);
});

test('riwayatRemedial: terurut, memuat nama TP lengkap', () => {
  const r = riwayatRemedial(1, LM, ctx);
  assert.equal(r.length, 2);
  assert.equal(r[0].tp, 'TP 2 (LM 1)');
  assert.deepEqual(r.map((x) => x.urutan), [1, 2]);
  assert.equal(r[0].nilaiAwal, 60);
  assert.equal(r[1].nilai, 80);
  assert.equal(r[0].catatan, 'a');
  assert.deepEqual(riwayatRemedial(2, LM, ctx), []);
});

test('capaianPerLm: remedial terbaru di bawah KKTP tidak menuntaskan; tepat KKTP menuntaskan; hanya yang TERBARU dihitung', () => {
  const dasar = { siswa_id: 1, tp_id: 12, nilai_awal: '60', tanggal: '2026-10-01', catatan: '' };
  const buat = (...skor) => siapkanKonteks({
    siswa: [],
    nilaiTp: [nt(1, 12, '60')],
    remedial: skor.map((v, i) => ({ ...dasar, id: i + 1, urutan: i + 1, nilai_remedial: v })),
  });
  const tp = (c) => capaianPerLm(1, LM, c, AMBANG)[0].tp[1];
  assert.equal(tp(buat('70')).tuntas, false);
  assert.equal(tp(buat('75')).tuntas, true);
  assert.equal(tp(buat('74.99')).tuntas, false);
  // remedial pertama mencapai tetapi yang terbaru tidak: tidak tuntas
  assert.equal(tp(buat('80', '70')).tuntas, false);
  assert.equal(tp(buat('70', '80')).tuntas, true);
  assert.equal(tp(buat()).tuntas, false);
});

test('tuntasLewatRemedial hanya bila nilai asli di bawah KKTP', () => {
  const c = siapkanKonteks({
    siswa: [],
    nilaiTp: [nt(1, 11, '80'), nt(1, 12, '60')],
    remedial: [
      { id: 1, siswa_id: 1, tp_id: 11, urutan: 1, nilai_awal: '80', nilai_remedial: '90', tanggal: '2026-10-01' },
      { id: 2, siswa_id: 1, tp_id: 12, urutan: 1, nilai_awal: '60', nilai_remedial: '90', tanggal: '2026-10-01' },
    ],
  });
  const [lm1] = capaianPerLm(1, LM, c, AMBANG);
  assert.equal(lm1.tp[0].tuntas, true);
  assert.equal(lm1.tp[0].tuntasLewatRemedial, false);
  assert.equal(lm1.tp[1].tuntasLewatRemedial, true);
});

test('kunciP1 mengabaikan bukti bila statusnya bukan DITANDAI', () => {
  const bukti = { tp: [{ lm: 1, tp: 1 }] };
  assert.equal(kunciP1({ pola: { P1: { status: 'TIDAK', bukti } } }).size, 0);
  assert.equal(kunciP1({ pola: { P1: { status: 'BELUM_CUKUP', bukti } } }).size, 0);
  assert.equal(kunciP1({ pola: { P1: { status: 'DITANDAI', bukti } } }).size, 1);
});

test('riwayatRemedial terurut menurut LM, TP, lalu urutan walau datanya masuk acak; nilai awal kosong tetap null', () => {
  const dasar = { siswa_id: 1, nilai_awal: '50', tanggal: '2026-10-01', catatan: '' };
  const c = siapkanKonteks({
    siswa: [],
    nilaiTp: [],
    remedial: [
      { ...dasar, id: 1, tp_id: 31, urutan: 1, nilai_remedial: '70' },
      { ...dasar, id: 2, tp_id: 12, urutan: 2, nilai_remedial: '71' },
      { ...dasar, id: 3, tp_id: 11, urutan: 1, nilai_remedial: '72', nilai_awal: null },
      { ...dasar, id: 4, tp_id: 12, urutan: 1, nilai_remedial: '73' },
    ],
  });
  const r = riwayatRemedial(1, LM, c);
  assert.deepEqual(r.map((x) => x.id), [3, 4, 2, 1]);
  assert.equal(r[0].nilaiAwal, null);
  assert.equal(r[1].nilaiAwal, 50);
  // struktur LM yang datang tidak berurutan tetap menghasilkan riwayat berurutan
  assert.deepEqual(riwayatRemedial(1, [...LM].reverse(), c).map((x) => x.id), [3, 4, 2, 1]);
});
