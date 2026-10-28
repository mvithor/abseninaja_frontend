import test from 'node:test';
import assert from 'node:assert/strict';
import { RENTANG } from '../rentang.js';
import {
  ariaSebaran, ariaTren, alasanSingkat, barisKehadiran, barisPerhatian, barisTren, butirLengkapi, cariTpId, chipPola,
  HARI_TERTINGGAL, judulKelompok, KEADAAN, kalimatSeringAlpa, kartuAngka, kelasTertinggal, keadaanKelas, labelBarisTp,
  legendaSebaran, pesanKeadaan, persenKosong, persenPerhatian, persenTeks, pisahKelas, rincianPerhatian, ringkasBeranda,
  segmenBatang, siswaPadaRentang, skalaAlpa, statusProyek, strukturDariRingkasan, susunGrafikTren, teksDiBawahKktp, teksNrKelas,
  teksUmur, urutkanKelas, hariSejak, BATAS_BARIS_LENGKAPI, lencanaPerhatian,
} from './ringkasan.js';

const AMBANG = { ambang_bagian: 41, kktp: 66, ambang_pengayaan: 86 };

const jumlah = (s, b, m, p, k) => ({
  [RENTANG.SELURUH]: s, [RENTANG.SEBAGIAN]: b, [RENTANG.MENCAPAI]: m, [RENTANG.PENGAYAAN]: p, [RENTANG.BELUM_DINILAI]: k,
});

function data(lebihan = {}) {
  return {
    kelas: { id: 7, nama_kelas: 'VII-A', mapel: 'Bahasa Arab', ...AMBANG },
    struktur_kosong: false,
    aturan_versi: '1.1',
    kartu: {
      jumlah_siswa: 32,
      perhatian: 9,
      pengayaan: 3,
      belum_cukup: 4,
      tanpa_penanda: 16,
      perhatian_per_pola_utama: { P1: 3, P2: 3, P3: 2, P4: 1 },
      kelengkapan: { terisi: 207, total: 224, kosong: 17, persen: 92 },
    },
    sebaran_tp: [
      {
        lm: 1, lm_nama: 'Bilangan', nr_kelas: 78.4, nr_dipakai: true,
        tp: [
          { tp: 1, kode: '', jumlah: jumlah(2, 4, 18, 8, 0), dinilai: 32, di_bawah_kktp: 6, persen_di_bawah_kktp: 19, terbanyak: false },
          { tp: 2, kode: 'B.2', jumlah: jumlah(3, 5, 16, 6, 2), dinilai: 30, di_bawah_kktp: 8, persen_di_bawah_kktp: 27, terbanyak: false },
        ],
      },
      {
        lm: 2, lm_nama: 'Aljabar', nr_kelas: 72.1, nr_dipakai: true,
        tp: [
          { tp: 1, kode: '', jumlah: jumlah(6, 7, 12, 3, 4), dinilai: 28, di_bawah_kktp: 13, persen_di_bawah_kktp: 46, terbanyak: true },
        ],
      },
    ],
    tren_lm: [
      { lm: 1, lm_nama: 'Bilangan', jumlah_siswa: 32, nr_rata: 78.4, dipakai: true, di_bawah_kktp: 3 },
      { lm: 2, lm_nama: 'Aljabar', jumlah_siswa: 31, nr_rata: 72.1, dipakai: true, di_bawah_kktp: 7 },
      { lm: 3, lm_nama: 'Geometri', jumlah_siswa: 5, nr_rata: 69.8, dipakai: false, di_bawah_kktp: 2 },
    ],
    kehadiran: {
      lm: [
        { lm: 1, lm_nama: 'Bilangan', pertemuan: 10, catatan: 320, hadir: 300, sakit: 9, izin: 4, alpa: 6, persen_alpa: 1.9, persen_sakit: 2.8, persen_izin: 1.3 },
        { lm: 2, lm_nama: 'Aljabar', pertemuan: 12, catatan: 384, hadir: 350, sakit: 8, izin: 6, alpa: 12, persen_alpa: 3.1, persen_sakit: 2.2, persen_izin: 1.6 },
        { lm: null, lm_nama: null, pertemuan: 2, catatan: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0, persen_alpa: null, persen_sakit: null, persen_izin: null },
      ],
      a_min: 3,
      pertemuan_min: 5,
      siswa_sering_alpa: 3,
    },
    proyek: [
      { proyek: 1, jenis: 'INDIVIDU', nama: 'Poster', bernilai: 28, nol: 2, kosong: 2 },
      { proyek: 2, jenis: 'KELOMPOK', nama: 'Drama', bernilai: 30, nol: 0, kosong: 2 },
      { proyek: 3, jenis: 'INDIVIDU', nama: null, bernilai: 21, nol: 0, kosong: 11 },
    ],
    perhatian_teratas: [],
    perlu_dilengkapi: { tp: [], proyek: [], siswa_belum_cukup: { jumlah_siswa: 0, per_pola: [] } },
    galat: [],
    ...lebihan,
  };
}

// ------------------------------------------------------------------ umum

test('persenTeks: koma desimal, tanpa nilai menjadi tanda hubung', () => {
  assert.equal(persenTeks(1.9), '1,9%');
  assert.equal(persenTeks(4), '4%');
  assert.equal(persenTeks(0), '0%');
  assert.equal(persenTeks(null), '-');
});

test('rincianPerhatian: urutan prioritas pola, pola 0 dibuang, versi pendek untuk tabel', () => {
  const kartu = { perhatian_per_pola_utama: { P1: 3, P2: 3, P3: 2, P4: 1 } };
  assert.equal(rincianPerhatian(kartu), 'Sering alpa 3 · Proyek individu tidak dikumpulkan 2 · Kesulitan pada TP tertentu 3 · Capaian menurun 1');
  assert.equal(rincianPerhatian(kartu, { pendek: true }), 'Alpa 3 · Proyek 2 · TP 3 · Menurun 1');
  assert.equal(rincianPerhatian({ perhatian_per_pola_utama: { P1: 0, P2: 4, P3: 0, P4: 0 } }, { pendek: true }), 'Alpa 4');
  assert.equal(rincianPerhatian({ perhatian_per_pola_utama: { P1: 0, P2: 0, P3: 0, P4: 0 } }), '');
  assert.equal(rincianPerhatian(null), '');
});

test('lencanaPerhatian: nol dan data kosong tidak ditampilkan sebagai angka', () => {
  assert.equal(lencanaPerhatian(data()), 9);
  assert.equal(lencanaPerhatian({ kartu: { perhatian: 0 } }), null);
  assert.equal(lencanaPerhatian(null), null);
  assert.equal(lencanaPerhatian({}), null);
});

// ------------------------------------------------------------------ sebaran

test('legendaSebaran: lima baris, rentang angka tertulis tepat (tanpa "sampai 65")', () => {
  const l = legendaSebaran(AMBANG);
  assert.deepEqual(l.map((x) => x.rentang), [
    RENTANG.SELURUH, RENTANG.SEBAGIAN, RENTANG.MENCAPAI, RENTANG.PENGAYAAN, RENTANG.BELUM_DINILAI,
  ]);
  assert.equal(l[0].batas, 'di bawah 41');
  assert.equal(l[1].batas, '41 sampai di bawah 66');
  assert.equal(l[3].batas, '86 ke atas');
  assert.equal(l[4].batas, '');
  assert.equal(legendaSebaran({ ambang_bagian: '40.5', kktp: '65.5', ambang_pengayaan: '85.5' })[1].batas, '40,5 sampai di bawah 65,5');
});

test('segmenBatang: urutan tetap, lebar sebanding, segmen 0 tidak ditampilkan', () => {
  const s = segmenBatang(jumlah(2, 4, 18, 8, 0));
  assert.deepEqual(s.map((x) => x.n), [2, 4, 18, 8, 0]);
  assert.deepEqual(s.map((x) => x.tampil), [true, true, true, true, false]);
  assert.equal(s[2].lebar, (18 * 100) / 32);
  assert.equal(Math.round(s.reduce((t, x) => t + x.lebar, 0)), 100);
  const kosong = segmenBatang(jumlah(0, 0, 0, 0, 0));
  assert.ok(kosong.every((x) => x.lebar === 0 && !x.tampil));
  assert.deepEqual(segmenBatang(null).map((x) => x.n), [0, 0, 0, 0, 0]);
});

test('ariaSebaran menyebut semua segmen termasuk yang nol', () => {
  const s = segmenBatang(jumlah(2, 4, 18, 8, 0));
  assert.equal(
    ariaSebaran('LM 1 TP 1', s),
    'LM 1 TP 1: 2 belum mencapai seluruh, 4 belum mencapai sebagian, 18 mencapai, 8 mencapai pengayaan, 0 belum dinilai',
  );
});

test('teksDiBawahKktp: "n dari m (p%)", dan jujur bila belum ada nilai', () => {
  assert.equal(teksDiBawahKktp({ dinilai: 28, di_bawah_kktp: 13, persen_di_bawah_kktp: 46 }), '13 dari 28 (46%)');
  assert.equal(teksDiBawahKktp({ dinilai: 28, di_bawah_kktp: 0, persen_di_bawah_kktp: 0 }), '0 dari 28 (0%)');
  assert.equal(teksDiBawahKktp({ dinilai: 0, di_bawah_kktp: 0, persen_di_bawah_kktp: null }), 'Belum ada nilai');
  // persen dihitung bila server tidak mengirimnya
  assert.equal(teksDiBawahKktp({ dinilai: 8, di_bawah_kktp: 2 }), '2 dari 8 (25%)');
});

test('labelBarisTp, judulKelompok, teksNrKelas', () => {
  assert.equal(labelBarisTp(1, { tp: 1, kode: '' }), '1.1');
  assert.equal(labelBarisTp(1, { tp: 2, kode: ' B.2 ' }), 'B.2');
  assert.equal(labelBarisTp(2, { tp: 1, kode: null }), '2.1');
  assert.equal(judulKelompok({ lm: 2, lm_nama: 'Aljabar' }), 'LM 2. Aljabar');
  assert.equal(judulKelompok({ lm: 2, lm_nama: 'LM 2 Aljabar' }), 'LM 2 Aljabar');
  assert.equal(judulKelompok({ lm: 2, lm_nama: null }), 'LM 2');
  assert.equal(teksNrKelas({ nr_kelas: 78.4 }), 'NR kelas 78,4');
  assert.equal(teksNrKelas({ nr_kelas: 65.96 }), 'NR kelas 65,96');
  assert.equal(teksNrKelas({ nr_kelas: null }), 'NR kelas belum ada');
});

test('strukturDariRingkasan: nama LM dan kode TP untuk kalimat bukti', () => {
  const s = strukturDariRingkasan(data());
  assert.deepEqual(s.map((m) => m.urutan), [1, 2, 3]);
  assert.equal(s[0].nama, 'Bilangan');
  assert.deepEqual(s[0].tp, [{ urutan: 1, kode: '' }, { urutan: 2, kode: 'B.2' }]);
  assert.deepEqual(s[2].tp, []);
});

// ------------------------------------------------------------------ tren

test('susunGrafikTren: sumbu memuat garis KKTP, posisi LM tetap walau ada yang kosong', () => {
  const g = susunGrafikTren(data().tren_lm, 66);
  assert.equal(g.min, 60);
  assert.equal(g.maks, 90);
  assert.deepEqual(g.ticks.map((t) => t.nilai), [60, 70, 80, 90]);
  assert.equal(g.kktp, 66);
  // KKTP berada di dalam sumbu: y KKTP antara y 60 dan y 70
  assert.ok(g.yKktp < g.ticks[0].y && g.yKktp > g.ticks[1].y);
  // nilai makin tinggi, y makin kecil (ke atas)
  assert.ok(g.titik[0].y < g.titik[1].y && g.titik[1].y < g.titik[2].y);
  assert.deepEqual(g.titik.map((t) => t.kosong), [false, false, true]);
  assert.equal(g.labelX.length, 3);
  assert.ok(g.titik[0].x < g.titik[1].x && g.titik[1].x < g.titik[2].x);

  const tengahKosong = susunGrafikTren([
    { lm: 1, jumlah_siswa: 20, nr_rata: 70, dipakai: true },
    { lm: 2, jumlah_siswa: 0, nr_rata: null, dipakai: false },
    { lm: 3, jumlah_siswa: 20, nr_rata: 72, dipakai: true },
  ], 66);
  assert.equal(tengahKosong.titik.length, 2);
  assert.equal(tengahKosong.labelX.length, 3);
  assert.equal(tengahKosong.titik[1].x, tengahKosong.labelX[2].x);
});

test('susunGrafikTren: tanpa nilai sama sekali tidak menggambar apa pun; KKTP boleh tidak ada', () => {
  assert.equal(susunGrafikTren([], 66), null);
  assert.equal(susunGrafikTren(null, 66), null);
  assert.equal(susunGrafikTren([{ lm: 1, nr_rata: null, jumlah_siswa: 0, dipakai: false }], 66), null);
  const g = susunGrafikTren([{ lm: 1, nr_rata: 70, jumlah_siswa: 9, dipakai: true }], null);
  assert.equal(g.yKktp, null);
  assert.equal(g.titik.length, 1);
});

test('susunGrafikTren: rentang lebar memakai langkah 20 dan tidak keluar dari 0 sampai 100', () => {
  const g = susunGrafikTren([
    { lm: 1, nr_rata: 12, jumlah_siswa: 10, dipakai: true },
    { lm: 2, nr_rata: 98, jumlah_siswa: 10, dipakai: true },
  ], 66);
  assert.equal(g.min, 0);
  assert.equal(g.maks, 100);
  assert.deepEqual(g.ticks.map((t) => t.nilai), [0, 20, 40, 60, 80, 100]);
});

test('susunGrafikTren: nilai tepat di KKTP tetap terlihat di atas garisnya (tanpa pembulatan)', () => {
  const g = susunGrafikTren([{ lm: 1, nr_rata: 65.96, jumlah_siswa: 10, dipakai: true }, { lm: 2, nr_rata: 66, jumlah_siswa: 10, dipakai: true }], 66);
  assert.ok(g.titik[0].y > g.yKktp, '65,96 harus berada di bawah garis KKTP');
  assert.equal(g.titik[1].y, g.yKktp);
});

test('ariaTren dan barisTren', () => {
  assert.equal(
    ariaTren(data().tren_lm, 66),
    'Rata-rata nilai per lingkup materi: LM 1 78,4 (32 siswa dihitung); LM 2 72,1 (31 siswa dihitung); LM 3 69,8 (5 siswa dihitung). KKTP 66.',
  );
  assert.match(ariaTren([{ lm: 1, nr_rata: null, jumlah_siswa: 0 }], null), /LM 1 belum ada rata-rata/);
  const b = barisTren(data().tren_lm);
  assert.deepEqual(b[0], {
    lm: 1, nama: 'LM 1. Bilangan', siswa: '32', nr: '78,4', bawah: '3 siswa', kosong: false,
  });
  assert.equal(b[2].kosong, true);
  assert.deepEqual(barisTren([{ lm: 4, lm_nama: null, jumlah_siswa: 0, nr_rata: null, dipakai: false, di_bawah_kktp: 0 }])[0], {
    lm: 4, nama: 'LM 4', siswa: '-', nr: 'Belum ada', bawah: '-', kosong: false,
  });
});

// ------------------------------------------------------------------ kehadiran

test('skalaAlpa: 10% bila cukup, naik kelipatan 5 bila ada LM yang melewati', () => {
  assert.equal(skalaAlpa([{ persen_alpa: 4.3 }, { persen_alpa: null }]), 10);
  assert.equal(skalaAlpa([{ persen_alpa: 10 }]), 10);
  assert.equal(skalaAlpa([{ persen_alpa: 10.1 }]), 15);
  assert.equal(skalaAlpa([{ persen_alpa: 22 }]), 25);
  assert.equal(skalaAlpa([]), 10);
});

test('barisKehadiran: lebar batang mengikuti skala, LM tanpa catatan tidak diberi angka 0%', () => {
  const { skala, baris } = barisKehadiran(data().kehadiran);
  assert.equal(skala, 10);
  assert.equal(baris[0].judul, 'LM 1. Bilangan');
  assert.equal(baris[0].alpa, '1,9%');
  assert.equal(baris[0].lebar, 19);
  assert.equal(baris[0].sakitIzin, 'Sakit 2,8% · Izin 1,3%');
  assert.equal(baris[1].lebar, 31);
  assert.equal(baris[2].judul, 'Belum dikaitkan ke LM');
  assert.equal(baris[2].alpa, 'Belum ada catatan');
  assert.equal(baris[2].lebar, 0);
  const lewat = barisKehadiran({ lm: [{ lm: 1, pertemuan: 3, catatan: 30, alpa: 6, persen_alpa: 20, persen_sakit: 0, persen_izin: 0 }] });
  assert.equal(lewat.skala, 20);
  assert.equal(lewat.baris[0].lebar, 100);
});

test('kalimatSeringAlpa: tiga keadaan yang berbeda', () => {
  assert.equal(kalimatSeringAlpa(data().kehadiran).teks, '3 siswa mencapai 3 alpa atau lebih.');
  assert.equal(kalimatSeringAlpa({ ...data().kehadiran, siswa_sering_alpa: 1 }).teks, '1 siswa mencapai 3 alpa atau lebih.');
  assert.equal(kalimatSeringAlpa({ ...data().kehadiran, siswa_sering_alpa: 0 }).teks, 'Belum ada siswa dengan 3 alpa atau lebih.');
  const sedikit = kalimatSeringAlpa({
    lm: [{ lm: 1, pertemuan: 3 }], a_min: 3, pertemuan_min: 5, siswa_sering_alpa: 0,
  });
  assert.match(sedikit.teks, /belum bisa dinilai/);
  assert.match(sedikit.teks, /baru 3 pertemuan/);
  assert.equal(kalimatSeringAlpa({ lm: [], a_min: 3, pertemuan_min: 5, siswa_sering_alpa: 0 }).teks, 'Belum ada pertemuan tercatat.');
});

// ------------------------------------------------------------------ proyek

test('statusProyek: hanya proyek individu, nama cadangan, ringkasan tertulis', () => {
  const p = statusProyek(data().proyek);
  assert.deepEqual(p.map((x) => x.nama), ['Poster', 'Proyek 3']);
  assert.equal(p[0].ket, '28 dinilai · 2 bernilai 0 · 2 belum diisi');
  assert.equal(p[0].aria, 'Poster: 28 dinilai · 2 bernilai 0 · 2 belum diisi');
  assert.deepEqual(p[0].segmen.map((s) => s.n), [28, 2, 2]);
  assert.deepEqual(p[1].segmen.map((s) => s.tampil), [true, false, true]);
  assert.equal(Math.round(p[1].segmen.reduce((t, s) => t + s.lebar, 0)), 100);
  assert.deepEqual(statusProyek([]), []);
  assert.deepEqual(statusProyek(null), []);
});

// ------------------------------------------------------------------ siswa teratas

const lmStruktur = [
  { urutan: 1, nama: 'Bilangan', tp: [{ urutan: 1, kode: '' }, { urutan: 2, kode: '1.2' }] },
  { urutan: 2, nama: 'Aljabar', tp: [{ urutan: 1, kode: '' }, { urutan: 2, kode: '' }] },
];
const ctx = { lm: lmStruktur, parameter: { kktp: 66, a_min: 3 }, proyek: [{ proyek: 1, nama: 'Poster' }, { proyek: 2, nama: null }] };

test('alasanSingkat P2: jumlah alpa, pertemuan tercatat, dan batas', () => {
  const x = { pola_utama: 'P2', pola: { P2: { bukti: { jumlah_a: 4, pertemuan_tercatat: 24, pertemuan_a: [1, 2, 3, 4] } } } };
  assert.equal(alasanSingkat(x, ctx), '4 alpa dari 24 pertemuan tercatat. Batasnya 3 alpa.');
});

test('alasanSingkat P3: nama proyek, satu atau banyak', () => {
  const satu = { pola_utama: 'P3', pola: { P3: { bukti: { proyek: [1] } } } };
  assert.equal(alasanSingkat(satu, ctx), 'Poster bernilai 0 (tidak dikumpulkan).');
  const dua = { pola_utama: 'P3', pola: { P3: { bukti: { proyek: [1, 2] } } } };
  assert.equal(alasanSingkat(dua, ctx), 'Poster dan Proyek 2 bernilai 0 (tidak dikumpulkan).');
  const tiga = { pola_utama: 'P3', pola: { P3: { bukti: { proyek: [1, 2, 9] } } } };
  assert.equal(alasanSingkat(tiga, ctx), 'Poster, Proyek 2, dan Proyek 9 bernilai 0 (tidak dikumpulkan).');
});

test('alasanSingkat P1: TP terendah, status remedial, dan sisa TP', () => {
  const bukti = {
    tp: [
      { lm: 1, tp: 2, nilai: 60, remedial_terbaru: null },
      { lm: 2, tp: 2, nilai: 52, remedial_terbaru: null },
    ],
  };
  const x = { pola_utama: 'P1', pola: { P1: { bukti } } };
  assert.equal(alasanSingkat(x, ctx), 'TP 2 (LM 2) bernilai 52, di bawah KKTP 66. Belum ada remedial. Dan 1 TP lain.');
  const satu = { pola_utama: 'P1', pola: { P1: { bukti: { tp: [{ lm: 1, tp: 2, nilai: 60, remedial_terbaru: 63.5 }] } } } };
  assert.equal(alasanSingkat(satu, ctx), 'TP 1.2 (LM 1) bernilai 60, di bawah KKTP 66. Remedial terbaru 63,5 masih di bawah KKTP.');
  const seri = { pola_utama: 'P1', pola: { P1: { bukti: { tp: [{ lm: 2, tp: 1, nilai: 50 }, { lm: 1, tp: 1, nilai: 50 }] } } } };
  assert.match(alasanSingkat(seri, ctx), /^TP 1 \(LM 2\) bernilai 50/);
});

test('alasanSingkat P4: tiga NR dan pembanding kelas bila dipakai', () => {
  const dengan = { pola_utama: 'P4', pola: { P4: { bukti: { nr: [84, 76, 69], acuan_kelas: true, nr_kelas: [78.4, 74, 69.8] } } } };
  assert.equal(alasanSingkat(dengan, ctx), 'NR LM turun 84 ke 76 ke 69. Kelas 78,4 ke 69,8.');
  const tanpa = { pola_utama: 'P4', pola: { P4: { bukti: { nr: [80, 72, 63], acuan_kelas: false, nr_kelas: null } } } };
  assert.equal(alasanSingkat(tanpa, ctx), 'NR LM turun 80 ke 72 ke 63.');
});

test('alasanSingkat: tanpa bukti jatuh ke judul pola, tidak mengarang', () => {
  assert.equal(alasanSingkat({ pola_utama: 'P2', pola: { P2: { bukti: null } } }, ctx), 'Sering alpa');
  assert.equal(alasanSingkat({ pola_utama: 'P1', pola: {} }, ctx), 'Kesulitan pada TP tertentu');
  assert.equal(alasanSingkat({ pola_utama: 'P1', pola: { P1: { bukti: { tp: [] } } } }, ctx), 'Kesulitan pada TP tertentu');
});

test('chipPola: urutan prioritas dan hanya pola utama yang diisi penuh', () => {
  const c = chipPola({ penanda: ['P4', 'P1'], pola_utama: 'P1' });
  assert.deepEqual(c, [
    { kode: 'P1', teks: 'Kesulitan pada TP tertentu', utama: true },
    { kode: 'P4', teks: 'Capaian menurun', utama: false },
  ]);
  assert.deepEqual(chipPola({ penanda: [], pola_utama: null }), []);
});

test('barisPerhatian: nama, alasan, chip; nama cadangan dari nomor urut', () => {
  const d = data({
    perhatian_teratas: [
      {
        siswa_id: 5, nama: 'Rafi A.', urutan: 3, penanda: ['P2'], pola_utama: 'P2',
        pola: { P2: { status: 'DITANDAI', bukti: { jumlah_a: 4, pertemuan_tercatat: 24 } } },
      },
      {
        siswa_id: 6, nama: null, urutan: 8, penanda: ['P3'], pola_utama: 'P3',
        pola: { P3: { status: 'DITANDAI', bukti: { proyek: [1] } } },
      },
      {
        siswa_id: 9, nama: null, urutan: null, penanda: ['P3'], pola_utama: 'P3',
        pola: { P3: { status: 'DITANDAI', bukti: { proyek: [1] } } },
      },
    ],
  });
  const b = barisPerhatian(d);
  assert.equal(b[0].nama, 'Rafi A.');
  assert.equal(b[0].alasan, '4 alpa dari 24 pertemuan tercatat. Batasnya 3 alpa.');
  assert.deepEqual(b[0].chip, [{ kode: 'P2', teks: 'Sering alpa', utama: true }]);
  assert.equal(b[1].nama, 'Siswa nomor 8');
  assert.equal(b[1].alasan, 'Poster bernilai 0 (tidak dikumpulkan).');
  assert.equal(b[2].nama, 'Siswa 9');
});

// ------------------------------------------------------------------ yang perlu dilengkapi

test('butirLengkapi: urutan TP, proyek, lalu siswa; tujuan tab dan sorotan TP', () => {
  const d = data({
    perlu_dilengkapi: {
      tp: [{ lm: 3, tp: 2, kode: '', jumlah_siswa: 5, lm_nama: 'Geometri' }, { lm: 2, tp: 2, kode: 'C', jumlah_siswa: 4, lm_nama: 'Aljabar' }],
      proyek: [{ proyek: 2, nama: null, jenis: 'INDIVIDU', jumlah_siswa: 11 }],
      siswa_belum_cukup: {
        jumlah_siswa: 4,
        per_pola: [{ pola: 'P2', jumlah_siswa: 4, alasan: 'Kurang dari 5 pertemuan tercatat.' }, { pola: 'P3', jumlah_siswa: 2, alasan: null }],
      },
    },
  });
  const b = butirLengkapi(d);
  assert.deepEqual(b.map((x) => x.kunci), ['tp-3-2', 'tp-2-2', 'proyek-2', 'siswa']);
  assert.equal(b[0].teks, 'LM 3 · TP 2: 5 siswa belum punya nilai');
  assert.equal(b[1].teks, 'LM 2 · TP C: 4 siswa belum punya nilai');
  assert.deepEqual(b[0].sorot, { lm: 3, tp: 2 });
  assert.equal(b[0].tab, 'nilai');
  assert.equal(b[2].teks, 'Proyek 2: 11 siswa belum dinilai');
  assert.equal(b[2].tab, 'proyek');
  assert.equal(b[3].teks, '4 siswa berstatus data belum cukup');
  assert.deepEqual(b[3].rinci, ['Sering alpa: 4 siswa. Kurang dari 5 pertemuan tercatat.', 'Proyek individu tidak dikumpulkan: 2 siswa']);
  assert.equal(b[3].tab, 'perhatian');
});

test('butirLengkapi: baris dibatasi, sisanya diringkas dengan jumlah isian yang benar', () => {
  const tp = Array.from({ length: 6 }, (_, i) => ({ lm: 1, tp: i + 1, kode: '', jumlah_siswa: i + 1 }));
  const b = butirLengkapi(data({ perlu_dilengkapi: { tp, proyek: [], siswa_belum_cukup: { jumlah_siswa: 0, per_pola: [] } } }));
  assert.equal(b.length, BATAS_BARIS_LENGKAPI + 1);
  const lain = b[b.length - 1];
  assert.equal(lain.kunci, 'tp-lain');
  assert.equal(lain.teks, '3 TP lain juga belum lengkap (15 isian)');
  assert.equal(lain.sorot, null);
});

test('butirLengkapi: kosong bila semuanya lengkap', () => {
  assert.deepEqual(butirLengkapi(data()), []);
});

// ------------------------------------------------------------------ kartu angka

test('kartuAngka: teks keempat kartu, tidak ada kata "aman" yang menyesatkan', () => {
  const k = kartuAngka(data());
  assert.equal(k.perhatian.angka, 9);
  assert.equal(k.perhatian.satuan, 'dari 32 siswa');
  assert.equal(k.perhatian.rinci, 'Sering alpa 3 · Proyek individu tidak dikumpulkan 2 · Kesulitan pada TP tertentu 3 · Capaian menurun 1');
  assert.equal(k.pengayaan.angka, 3);
  assert.match(k.pengayaan.rinci, /batas pengayaan 86/);
  assert.equal(k.belumCukup.angka, 4);
  assert.equal(k.belumCukup.rinci, 'Belum bisa dinilai. Ini bukan berarti aman.');
  assert.equal(k.kelengkapan.angka, '92%');
  assert.equal(k.kelengkapan.persen, 92);
  assert.equal(k.kelengkapan.rinci, '207 dari 224 isian terisi. 17 belum.');
});

test('kartuAngka: nol perhatian tidak ditulis sebagai kabar baik; tanpa isian TP', () => {
  const d = data();
  d.kartu = {
    ...d.kartu, perhatian: 0, perhatian_per_pola_utama: { P1: 0, P2: 0, P3: 0, P4: 0 }, kelengkapan: { terisi: 0, total: 0, kosong: 0, persen: null },
  };
  const k = kartuAngka(d);
  assert.match(k.perhatian.rinci, /Lihat juga kartu Data belum cukup/);
  assert.doesNotMatch(k.perhatian.rinci, /aman/);
  assert.equal(k.kelengkapan.angka, '-');
  assert.equal(k.kelengkapan.persen, 0);
  assert.equal(k.kelengkapan.rinci, 'Belum ada isian TP.');
});

// ------------------------------------------------------------------ drill-down

const siswaMasukan = [
  { id: 11, nama: 'Ani', urutan: 1 },
  { id: 12, nama: 'Budi', urutan: 2 },
  { id: 13, nama: 'Cici', urutan: 3 },
  { id: 14, nama: 'Dedi', urutan: 4 },
];
const nilaiTp = [
  { siswa_id: 11, tp_id: 101, nilai: '30.00' },
  { siswa_id: 12, tp_id: 101, nilai: '65.99' },
  { siswa_id: 13, tp_id: 101, nilai: '66' },
  { siswa_id: 11, tp_id: 102, nilai: 90 },
];

test('siswaPadaRentang: batas tepat masuk rentang atas, belum dinilai memuat sel kosong, urut nomor', () => {
  const ambil = (rentang) => siswaPadaRentang({
    siswa: siswaMasukan, nilaiTp, tpId: 101, rentang, ambang: AMBANG,
  }).map((s) => s.nama);
  assert.deepEqual(ambil(RENTANG.SELURUH), ['Ani']);
  assert.deepEqual(ambil(RENTANG.SEBAGIAN), ['Budi']);
  assert.deepEqual(ambil(RENTANG.MENCAPAI), ['Cici']);
  assert.deepEqual(ambil(RENTANG.PENGAYAAN), []);
  assert.deepEqual(ambil(RENTANG.BELUM_DINILAI), ['Dedi']);
  const nilai = siswaPadaRentang({
    siswa: siswaMasukan, nilaiTp, tpId: 101, rentang: RENTANG.SEBAGIAN, ambang: AMBANG,
  });
  assert.equal(nilai[0].nilai, 65.99);
  assert.deepEqual(
    siswaPadaRentang({ siswa: siswaMasukan, nilaiTp, tpId: 102, rentang: RENTANG.PENGAYAAN, ambang: AMBANG }).map((s) => s.nama),
    ['Ani'],
  );
  assert.deepEqual(siswaPadaRentang({ siswa: null, nilaiTp: null, tpId: 1, rentang: RENTANG.SELURUH, ambang: AMBANG }), []);
});

test('cariTpId: menurut nomor LM dan TP', () => {
  const lm = [{ urutan: 1, tp: [{ urutan: 1, id: 101 }, { urutan: 2, id: 102 }] }, { urutan: 2, tp: [{ urutan: 1, id: 201 }] }];
  assert.equal(cariTpId(lm, 1, 2), 102);
  assert.equal(cariTpId(lm, 2, 1), 201);
  assert.equal(cariTpId(lm, 3, 1), null);
  assert.equal(cariTpId(lm, 2, 2), null);
  assert.equal(cariTpId(null, 1, 1), null);
});

// ------------------------------------------------------------------ Beranda

const SEKARANG = new Date('2026-10-28T05:00:00Z');
const hariLalu = (n) => new Date(SEKARANG.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

function kelas(id, nama, { siswa = 30, perhatian = 3, belum = 0, kosong = 0, total = 100, hari = 1, jenis = 'NYATA', pola, struktur = false, galat = false } = {}) {
  return {
    id,
    nama_kelas: nama,
    mapel: 'Bahasa Arab',
    semester: 'Ganjil',
    tahun_ajaran: '2026/2027',
    jenis,
    kasus_kode: jenis === 'NYATA' ? null : 'A',
    jumlah_siswa: siswa,
    terakhir_diubah: hariLalu(hari),
    ringkasan: galat
      ? { aturan_versi: null, struktur_kosong: null, kartu: null, galat: ['batas tidak sah'] }
      : {
        aturan_versi: '1.1',
        struktur_kosong: struktur,
        galat: null,
        kartu: {
          jumlah_siswa: siswa,
          perhatian,
          pengayaan: 1,
          belum_cukup: belum,
          perhatian_per_pola_utama: pola ?? { P1: perhatian, P2: 0, P3: 0, P4: 0 },
          kelengkapan: { terisi: total - kosong, total, kosong, persen: total ? Math.round(((total - kosong) * 100) / total) : null },
        },
      },
  };
}

test('hariSejak dan teksUmur', () => {
  assert.equal(hariSejak(hariLalu(0), SEKARANG), 0);
  assert.equal(hariSejak(hariLalu(14), SEKARANG), 14);
  assert.equal(hariSejak(new Date(SEKARANG.getTime() - (14 * 24 * 60 * 60 * 1000 - 1000)).toISOString(), SEKARANG), 13);
  assert.equal(hariSejak(hariLalu(-3), SEKARANG), 0, 'waktu di masa depan (jam server beda) tidak jadi negatif');
  assert.equal(hariSejak(null, SEKARANG), null);
  assert.equal(hariSejak('bukan tanggal', SEKARANG), null);
  assert.equal(teksUmur(hariLalu(0), SEKARANG), 'Hari ini');
  assert.equal(teksUmur(hariLalu(1), SEKARANG), '1 hari lalu');
  assert.equal(teksUmur(hariLalu(14), SEKARANG), '14 hari lalu');
  assert.equal(teksUmur(hariLalu(59), SEKARANG), '59 hari lalu');
  assert.equal(teksUmur(hariLalu(95), SEKARANG), '3 bulan lalu');
  assert.equal(teksUmur(null, SEKARANG), '-');
});

test('keadaanKelas: galat, tanpa siswa, tanpa struktur, dan normal', () => {
  assert.equal(keadaanKelas(kelas(1, 'A', { galat: true })), KEADAAN.GALAT);
  assert.equal(keadaanKelas({ ...kelas(1, 'A'), ringkasan: undefined }), KEADAAN.TANPA_RINGKASAN);
  assert.match(pesanKeadaan(KEADAAN.TANPA_RINGKASAN), /belum dapat dimuat/);
  assert.equal(keadaanKelas(kelas(1, 'A', { siswa: 0 })), KEADAAN.TANPA_SISWA);
  assert.equal(keadaanKelas(kelas(1, 'A', { struktur: true })), KEADAAN.TANPA_STRUKTUR);
  assert.equal(keadaanKelas(kelas(1, 'A')), KEADAAN.ADA);
  assert.match(pesanKeadaan(KEADAAN.GALAT), /Struktur/);
  assert.match(pesanKeadaan(KEADAAN.TANPA_SISWA), /daftar siswa/);
  assert.match(pesanKeadaan(KEADAAN.TANPA_STRUKTUR), /belum diisi/);
  assert.equal(pesanKeadaan(KEADAAN.ADA), '');
});

test('persenPerhatian dan persenKosong', () => {
  assert.equal(persenPerhatian(kelas(1, 'A', { siswa: 34, perhatian: 12 })), 35);
  assert.equal(persenPerhatian(kelas(1, 'A', { siswa: 0 })), null);
  assert.equal(persenPerhatian(kelas(1, 'A', { galat: true })), null);
  assert.equal(persenKosong(kelas(1, 'A', { total: 224, kosong: 17 })), 8);
  assert.equal(persenKosong(kelas(1, 'A', { total: 0 })), null);
  assert.equal(persenKosong(kelas(1, 'A', { galat: true })), null);
});

test('urutkanKelas: persentase perhatian tertinggi dulu, kelas yang tak terbaca di bawah', () => {
  const daftar = [
    kelas(1, 'VII-B', { siswa: 30, perhatian: 5 }),
    kelas(2, 'VIII-A', { siswa: 34, perhatian: 12 }),
    kelas(3, 'IX-A', { galat: true }),
    kelas(4, 'VII-A', { siswa: 32, perhatian: 9 }),
    kelas(5, 'IX-B', { siswa: 0 }),
    kelas(6, 'VIII-B', { siswa: 33, perhatian: 4 }),
  ];
  assert.deepEqual(urutkanKelas(daftar).map((k) => k.nama_kelas), ['VIII-A', 'VII-A', 'VII-B', 'VIII-B', 'IX-A', 'IX-B']);
  assert.deepEqual(daftar.map((k) => k.id), [1, 2, 3, 4, 5, 6], 'daftar asal tidak diubah');
});

test('urutkanKelas: persen sama diurutkan menurut jumlah, lalu data belum cukup, lalu nama', () => {
  const daftar = [
    kelas(1, 'B', { siswa: 10, perhatian: 2 }),
    kelas(2, 'A', { siswa: 20, perhatian: 4, belum: 1 }),
    kelas(3, 'C', { siswa: 20, perhatian: 4, belum: 5 }),
    kelas(4, 'D', { siswa: 20, perhatian: 4, belum: 5 }),
  ];
  assert.deepEqual(urutkanKelas(daftar).map((k) => k.nama_kelas), ['C', 'D', 'A', 'B']);
});

test('urutkanKelas: tidak seri karena pembulatan persen', () => {
  const a = kelas(1, 'A', { siswa: 200, perhatian: 41 }); // 20,5 persen
  const b = kelas(2, 'B', { siswa: 200, perhatian: 40 }); // 20 persen
  assert.deepEqual(urutkanKelas([b, a]).map((k) => k.nama_kelas), ['A', 'B']);
});

test('pisahKelas: kelas nyata terurut, kasus latihan terpisah', () => {
  const p = pisahKelas([
    kelas(1, 'Kasus B', { jenis: 'KASUS' }),
    kelas(2, 'VII-A', { perhatian: 9, siswa: 32 }),
    kelas(3, 'Kasus A', { jenis: 'KASUS' }),
  ]);
  assert.deepEqual(p.nyata.map((k) => k.nama_kelas), ['VII-A']);
  assert.deepEqual(p.kasus.map((k) => k.nama_kelas), ['Kasus A', 'Kasus B']);
  assert.deepEqual(pisahKelas(null), { nyata: [], kasus: [] });
});

test('ringkasBeranda: jumlah kelas, siswa, perhatian, semester tunggal', () => {
  const nyata = [kelas(1, 'A', { siswa: 34, perhatian: 12 }), kelas(2, 'B', { siswa: 32, perhatian: 9 })];
  assert.equal(ringkasBeranda(nyata), '2 kelas · 66 siswa · 21 siswa perlu perhatian · Ganjil 2026/2027');
  assert.equal(ringkasBeranda([kelas(1, 'A', { siswa: 1, perhatian: 1 })]), '1 kelas · 1 siswa · 1 siswa perlu perhatian · Ganjil 2026/2027');
  assert.equal(ringkasBeranda([]), '');
  const campur = [kelas(1, 'A'), { ...kelas(2, 'B'), semester: 'Genap' }];
  assert.doesNotMatch(ringkasBeranda(campur), /Ganjil|Genap/);
});

test('ringkasBeranda: kelas yang tak terbaca tidak dihitung nol, disebut terpisah', () => {
  const s = ringkasBeranda([kelas(1, 'A', { siswa: 30, perhatian: 6 }), kelas(2, 'B', { galat: true, siswa: 10 })]);
  assert.match(s, /40 siswa/);
  assert.match(s, /6 siswa perlu perhatian/);
  assert.match(s, /1 kelas belum bisa dibaca angkanya/);
  const semua = ringkasBeranda([kelas(2, 'B', { galat: true })]);
  assert.doesNotMatch(semua, /perlu perhatian/);
});

test('kelasTertinggal: butuh lama tidak berubah DAN isian kosong, batas tepat', () => {
  const batas = HARI_TERTINGGAL;
  const daftar = [
    kelas(1, 'VIII-A', { hari: 14, kosong: 29, total: 100 }),
    kelas(2, 'lama-lengkap', { hari: 40, kosong: 0, total: 100 }),
    kelas(3, 'baru-kosong', { hari: 1, kosong: 50, total: 100 }),
    kelas(4, 'tepat-batas', { hari: batas, kosong: 10, total: 100 }),
    kelas(5, 'kurang-sehari', { hari: batas - 1, kosong: 50, total: 100 }),
    kelas(6, 'kurang-persen', { hari: 30, kosong: 9, total: 100 }),
    kelas(7, 'galat', { galat: true, hari: 30 }),
    kelas(8, 'tanpa-isian', { hari: 30, total: 0 }),
  ];
  const t = kelasTertinggal(daftar, SEKARANG);
  assert.deepEqual(t.map((x) => x.nama), ['VIII-A', 'tepat-batas']);
  assert.equal(t[0].kalimat, 'nilai terakhir diubah 14 hari lalu dan 29% isian TP masih kosong. Ringkasannya kurang bisa dipercaya sampai data dilengkapi.');
  assert.equal(t[0].id, 1);
  assert.deepEqual(kelasTertinggal(null, SEKARANG), []);
});

test('kelasTertinggal: yang paling kosong lebih dulu', () => {
  const t = kelasTertinggal([
    kelas(1, 'A', { hari: 20, kosong: 15, total: 100 }),
    kelas(2, 'B', { hari: 15, kosong: 60, total: 100 }),
  ], SEKARANG);
  assert.deepEqual(t.map((x) => x.nama), ['B', 'A']);
});
