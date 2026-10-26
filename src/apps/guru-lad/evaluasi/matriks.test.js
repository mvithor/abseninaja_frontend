import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODE_URUT, bagiGolongan, bulatSatuDesimal, deretKehadiran, deretP4, barisP1, pembandingUrut, ringkasKolomTp,
  siapkanKonteks, susunBaris, susunKolom, susunRincian, titikGrafikP4,
} from './matriks.js';
import { golonganSiswa, hitungGolongan, labelTabPerhatian } from './penjelasan.js';

const LM = [
  { id: 1, urutan: 1, nama: 'Bilangan', tp: [{ id: 11, urutan: 1, kode: '1.1' }, { id: 12, urutan: 2, kode: '1.2' }] },
  { id: 2, urutan: 2, nama: 'Kosong', tp: [] },
  { id: 3, urutan: 3, nama: 'Aljabar', tp: [{ id: 31, urutan: 1, kode: null }] },
];
const PROYEK = [
  { id: 101, urutan: 1, jenis: 'INDIVIDU', nama: 'Proyek 1' },
  { id: 102, urutan: 2, jenis: 'KELOMPOK', nama: 'Proyek 2' },
];
const AMBANG = { ambang_bagian: 41, kktp: 75, ambang_pengayaan: 90 };

// ------------------------------------------------------------------ pembuat data

const pola = (status, bukti) => (status === 'DITANDAI' ? { status, bukti } : { status });
function siswaEval(id, urutan, nama, tanda = {}) {
  const p = {
    P1: pola('TIDAK'), P2: pola('TIDAK'), P3: pola('TIDAK'), P4: pola('TIDAK'), P5: pola('TIDAK'),
  };
  Object.entries(tanda).forEach(([k, bukti]) => { p[k] = pola('DITANDAI', bukti); });
  const penanda = Object.keys(tanda);
  const utama = ['P2', 'P3', 'P1', 'P4', 'P5'].find((k) => penanda.includes(k)) ?? null;
  return {
    siswa_id: id, urutan, nama, pola: p, penanda, pola_utama: utama, aturan_versi: '1.1',
  };
}
const buktiP1 = (...tp) => ({ tp, tersembunyi: tp.some((t) => t.tersembunyi) });
const tp1 = (lm, tp, nilai, extra = {}) => ({
  lm, tp, nilai, rentang: 'BELUM_MENCAPAI_SEBAGIAN', remedial_terbaru: null, nr_lm: 70, tersembunyi: false, ...extra,
});

// ------------------------------------------------------------------ golongan

test('golonganSiswa: pengayaan hanya bila penandanya P5 saja; P5 bersama penanda lain tetap perhatian', () => {
  assert.equal(golonganSiswa({ penanda: [] }), 'tanpa');
  assert.equal(golonganSiswa({ penanda: ['P5'] }), 'pengayaan');
  assert.equal(golonganSiswa({ penanda: ['P5', 'P1'] }), 'perhatian');
  assert.equal(golonganSiswa({ penanda: ['P2'] }), 'perhatian');
  assert.equal(golonganSiswa({ penanda: ['P9'] }), 'perhatian', 'kode tak dikenal tidak boleh hilang dari perhatian');
  assert.equal(golonganSiswa(undefined), 'tanpa');
});

test('hitungGolongan dan labelTabPerhatian: angka tab hanya menghitung golongan perhatian', () => {
  const hasil = [
    siswaEval(1, 1, 'A', { P1: buktiP1(tp1(1, 1, 60)) }),
    siswaEval(2, 2, 'B', { P5: {} }),
    siswaEval(3, 3, 'C', { P5: {}, P1: buktiP1(tp1(1, 2, 60)) }),
    siswaEval(4, 4, 'D'),
  ];
  assert.deepEqual(hitungGolongan(hasil), { perhatian: 2, pengayaan: 1, tanpa: 1 });
  assert.equal(labelTabPerhatian({ hasil }), 'Perlu Perhatian (2)');
  assert.equal(labelTabPerhatian({ hasil: [hasil[1]] }), 'Perlu Perhatian', 'pengayaan saja tidak memunculkan angka');
});

// ------------------------------------------------------------------ pengelompokan dan urutan

function hasilContoh() {
  return [
    siswaEval(1, 1, 'Zahra', { P4: {} }),
    siswaEval(2, 2, 'Budi'),
    siswaEval(3, 3, 'Citra', { P1: buktiP1(tp1(1, 1, 60)) }),
    siswaEval(4, 4, 'Andi', { P3: {} }),
    siswaEval(5, 5, 'Dewi', { P2: {}, P1: buktiP1(tp1(1, 2, 60)) }),
    siswaEval(6, 6, 'Eko', { P5: {} }),
    siswaEval(7, 7, 'Fani', { P1: buktiP1(tp1(1, 1, 62), tp1(1, 2, 62)) }),
  ];
}

test('bagiGolongan: urutan bawaan mengikuti prioritas PRD (P2, P3, P1, P4), lalu jumlah penanda, lalu nomor', () => {
  const b = bagiGolongan(hasilContoh());
  assert.deepEqual(b.perhatian.map((h) => h.nama), ['Dewi', 'Andi', 'Citra', 'Fani', 'Zahra']);
  assert.deepEqual(b.pengayaan.map((h) => h.nama), ['Eko']);
  assert.deepEqual(b.tanpa.map((h) => h.nama), ['Budi']);
});

test('bagiGolongan: mode nomor dan nama mengubah urutan perhatian; golongan tanpa selalu nomor atau nama', () => {
  const h = hasilContoh();
  assert.deepEqual(bagiGolongan(h, { urut: MODE_URUT.NOMOR }).perhatian.map((x) => x.urutan), [1, 3, 4, 5, 7]);
  assert.deepEqual(bagiGolongan(h, { urut: MODE_URUT.NAMA }).perhatian.map((x) => x.nama), ['Andi', 'Citra', 'Dewi', 'Fani', 'Zahra']);
  assert.deepEqual(bagiGolongan(h, { urut: 'tak-dikenal' }).perhatian.map((x) => x.nama), ['Dewi', 'Andi', 'Citra', 'Fani', 'Zahra']);
  assert.equal(pembandingUrut('tak-dikenal'), pembandingUrut(MODE_URUT.PRIORITAS));
});

test('bagiGolongan: golongan tanpa penanda menurut nomor (atau nama), bukan menurut prioritas', () => {
  const h = [
    siswaEval(9, 9, 'Yani'), siswaEval(8, 8, 'Wawan'), siswaEval(10, 10, 'Xenia'), siswaEval(7, 7, 'Zidan'),
  ];
  assert.deepEqual(bagiGolongan(h).tanpa.map((x) => x.urutan), [7, 8, 9, 10]);
  assert.deepEqual(bagiGolongan(h, { urut: MODE_URUT.NAMA }).tanpa.map((x) => x.nama), ['Wawan', 'Xenia', 'Yani', 'Zidan']);
});

test('bagiGolongan: saringan pola menyisihkan siswa tanpa penanda dan tidak mengubah data masukan', () => {
  const h = hasilContoh();
  const salinan = JSON.stringify(h);
  const b = bagiGolongan(h, { pola: ['P1'] });
  assert.deepEqual(b.perhatian.map((x) => x.nama), ['Dewi', 'Citra', 'Fani']);
  assert.equal(b.pengayaan.length, 0);
  assert.equal(b.tanpa.length, 0);
  assert.equal(JSON.stringify(h), salinan, 'urutan array masukan tidak boleh berubah');
  assert.deepEqual(bagiGolongan(h, { pola: ['P5'] }).pengayaan.map((x) => x.nama), ['Eko']);
});

test('bagiGolongan: masukan kosong atau tak ada', () => {
  assert.deepEqual(bagiGolongan([]), { perhatian: [], pengayaan: [], tanpa: [] });
  assert.deepEqual(bagiGolongan(undefined), { perhatian: [], pengayaan: [], tanpa: [] });
});

// ------------------------------------------------------------------ kolom

test('susunKolom: LM tanpa TP dilewati, kunci memakai nomor urut, kolom proyek menandai kelompok', () => {
  const k = susunKolom(LM, PROYEK);
  assert.deepEqual(k.kelompokLm.map((g) => g.lm), [1, 3]);
  assert.deepEqual(k.kolomTp.map((c) => c.kunci), ['1.1', '1.2', '3.1']);
  assert.deepEqual(k.kolomTp.map((c) => c.label), ['1.1', '1.2', 'TP 1'], 'TP tanpa kode jatuh ke "TP urutan"');
  assert.deepEqual(k.kolomProyek.map((p) => p.kelompok), [false, true]);
  assert.equal(k.jumlahKolom, 3 + 3 + 2 + 2);
  assert.equal(k.kelompokLm[0].judulPendek, 'LM 1');
  assert.deepEqual(susunKolom(undefined, undefined).kolomTp, []);
});

// ------------------------------------------------------------------ ringkasan kolom

test('bulatSatuDesimal: setengah ke atas dalam sen, kosong menjadi null', () => {
  assert.equal(bulatSatuDesimal(8300 + 8400 + 8400, 3), 83.7);
  assert.equal(bulatSatuDesimal(7500 + 7510, 2), 75.1, '75,05 dibulatkan ke atas');
  assert.equal(bulatSatuDesimal(0, 0), null);
});

test('ringkasKolomTp: batas KKTP tepat tidak dihitung di bawah, sel kosong tidak dihitung nol', () => {
  const kolom = susunKolom(LM, PROYEK);
  const ctx = siapkanKonteks({
    nilaiTp: [
      { siswa_id: 1, tp_id: 11, nilai: 75 },
      { siswa_id: 2, tp_id: 11, nilai: 74.99 },
      { siswa_id: 3, tp_id: 11, nilai: 91 },
      { siswa_id: 1, tp_id: 12, nilai: null },
    ],
  });
  const r = ringkasKolomTp(kolom.kolomTp, [1, 2, 3, 4], ctx, 75);
  assert.deepEqual(r.get(11), { n: 3, rata: 80.3, bawah: 1 });
  assert.deepEqual(r.get(12), { n: 0, rata: null, bawah: 0 });
  assert.deepEqual(r.get(31), { n: 0, rata: null, bawah: 0 });
});

// ------------------------------------------------------------------ baris matriks

function konteksContoh() {
  return siapkanKonteks({
    siswa: [{ id: 5, nama: 'Dewi', urutan: 5 }],
    nilaiTp: [
      { siswa_id: 5, tp_id: 11, nilai: 58 },
      { siswa_id: 5, tp_id: 12, nilai: 92 },
    ],
    nilaiProyek: [
      { siswa_id: 5, proyek_id: 101, nilai: 0 },
      { siswa_id: 5, proyek_id: 102, nilai: 0 },
    ],
    remedial: [
      { id: 1, siswa_id: 5, tp_id: 11, urutan: 1, nilai_awal: 58, nilai_remedial: 70 },
      { id: 2, siswa_id: 5, tp_id: 11, urutan: 2, nilai_awal: 58, nilai_remedial: 80 },
    ],
    pertemuan: [
      { id: 902, nomor: 2, tanggal: '2026-08-08' },
      { id: 901, nomor: 1, tanggal: '2026-08-01' },
      { id: 903, nomor: 3, tanggal: '2026-08-15' },
    ],
    kehadiran: [
      { pertemuan_id: 901, siswa_id: 5, kode: 'A' },
      { pertemuan_id: 902, siswa_id: 5, kode: 'A' },
    ],
  });
}

test('susunBaris: sel memuat nilai asli, remedial terbaru hanya catatan, kosong tetap null (bukan 0)', () => {
  const kolom = susunKolom(LM, PROYEK);
  const h = siswaEval(5, 5, 'Dewi', { P1: buktiP1(tp1(1, 1, 58)) });
  const b = susunBaris(h, kolom, konteksContoh(), AMBANG);
  assert.equal(b.sel[0].nilai, 58);
  assert.equal(b.sel[0].remedial, 80, 'remedial terbaru (urutan terbesar)');
  assert.equal(b.sel[0].ditandaiP1, true);
  assert.equal(b.sel[0].rentang, 'BELUM_MENCAPAI_SEBAGIAN');
  assert.equal(b.sel[1].nilai, 92);
  assert.equal(b.sel[1].ditandaiP1, false);
  assert.equal(b.sel[1].remedial, null);
  assert.equal(b.sel[2].nilai, null, 'belum dinilai tetap null');
  assert.equal(b.sel[2].rentang, 'BELUM_DINILAI');
});

test('susunBaris: nol pada proyek individu = tidak dikumpulkan, nol pada proyek kelompok tidak', () => {
  const kolom = susunKolom(LM, PROYEK);
  const b = susunBaris(siswaEval(5, 5, 'Dewi'), kolom, konteksContoh(), AMBANG);
  assert.deepEqual(b.proyek.map((p) => p.tidakDikumpulkan), [true, false]);
  assert.deepEqual(b.proyek.map((p) => p.nilai), [0, 0]);
});

test('susunBaris: rekap hadir dihitung dari catatan; alpa disorot hanya bila SERVER menandai P2', () => {
  const kolom = susunKolom(LM, PROYEK);
  const tanpaTanda = susunBaris(siswaEval(5, 5, 'Dewi'), kolom, konteksContoh(), AMBANG);
  assert.deepEqual(tanpaTanda.hadir, { hadir: 0, tercatat: 2, alpa: 2, alpaDitandai: false });
  const ditandai = susunBaris(siswaEval(5, 5, 'Dewi', { P2: {} }), kolom, konteksContoh(), AMBANG);
  assert.equal(ditandai.hadir.alpaDitandai, true);
});

test('susunBaris: penanda diurutkan menurut prioritas tampilan', () => {
  const kolom = susunKolom(LM, PROYEK);
  const h = siswaEval(5, 5, 'Dewi', { P4: {}, P1: buktiP1(tp1(1, 1, 58)), P2: {} });
  assert.deepEqual(susunBaris(h, kolom, konteksContoh(), AMBANG).penanda, ['P2', 'P1', 'P4']);
});

test('deretKehadiran: urut menurut nomor pertemuan, pertemuan tanpa catatan null (bukan alpa)', () => {
  assert.deepEqual(deretKehadiran(5, konteksContoh()), [
    { nomor: 1, kode: 'A' }, { nomor: 2, kode: 'A' }, { nomor: 3, kode: null },
  ]);
});

// ------------------------------------------------------------------ rincian

test('barisP1: id TP dicari dari struktur kelas; TP yang tidak dikenal mendapat tpId null', () => {
  const b = barisP1(buktiP1(tp1(1, 2, 66, { tersembunyi: true, remedial_terbaru: 70 }), tp1(9, 9, 50)), LM);
  assert.equal(b[0].tpId, 12);
  assert.equal(b[0].tersembunyi, true);
  assert.equal(b[0].remedialTerbaru, 70);
  assert.equal(b[0].nama, 'TP 1.2 (LM 1)');
  assert.equal(b[1].tpId, null);
  assert.deepEqual(barisP1(null, LM), []);
});

test('deretP4: pembanding kelas hanya bila server memakainya', () => {
  const pakai = deretP4({ lm: [1, 2, 3], nr: [84, 73.33, 68], acuan_kelas: true, nr_kelas: [83.4, 83.14, 83.6] });
  assert.deepEqual(pakai.map((d) => d.kelas), [83.4, 83.14, 83.6]);
  const tidak = deretP4({ lm: [1, 2, 3], nr: [84, 73.33, 68], acuan_kelas: false, nr_kelas: [83.4, 83.14, 83.6] });
  assert.deepEqual(tidak.map((d) => d.kelas), [null, null, null]);
  assert.deepEqual(deretP4(null), []);
});

test('titikGrafikP4: sumbu Y terbalik benar, tetap dalam 0 sampai 100, garis KKTP selalu di dalam rentang', () => {
  const deret = deretP4({ lm: [1, 2, 3], nr: [84, 73.33, 68], acuan_kelas: true, nr_kelas: [83.4, 83.14, 83.6] });
  const g = titikGrafikP4(deret, 75);
  assert.ok(g.min >= 0 && g.maks <= 100 && g.min < 68 && g.maks > 84);
  assert.ok(g.siswa[0].y < g.siswa[2].y, 'nilai lebih tinggi harus berada lebih atas (y lebih kecil)');
  assert.equal(g.siswa.length, 3);
  assert.equal(g.kelas.length, 3);
  assert.notEqual(g.yKktp, null);
  assert.ok(g.yKktp >= 0 && g.yKktp <= g.tinggi, 'garis KKTP di dalam bidang gambar');
  assert.ok(g.siswa[0].x < g.siswa[1].x && g.siswa[1].x < g.siswa[2].x);
  const jauh = titikGrafikP4(deretP4({ lm: [1, 2, 3], nr: [99, 98, 97], acuan_kelas: false }), 60);
  assert.ok(jauh.maks <= 100);
  assert.ok(jauh.yKktp >= 0 && jauh.yKktp <= jauh.tinggi, 'KKTP jauh di bawah data tetap tergambar');
  assert.equal(titikGrafikP4(deret, null).yKktp, null);
  assert.equal(jauh.kelas, null);
  assert.equal(titikGrafikP4([], 75), null);
  const satu = titikGrafikP4([{ lm: 1, siswa: 80, kelas: null }], 75);
  assert.equal(satu.siswa.length, 1);
  assert.ok(Number.isFinite(satu.siswa[0].x) && Number.isFinite(satu.siswa[0].y));
});

test('susunRincian: bagian menurut prioritas, hanya pola yang ditandai, setiap bagian punya kalimat bukti', () => {
  const h = siswaEval(5, 5, 'Dewi', {
    P4: { lm: [1, 2, 3], nr: [84, 73.33, 68], total_turun: 16, acuan_kelas: true, nr_kelas: [83.4, 83.14, 83.6], turun_kelas: -0.2, lebih_dari_kelas: 16.2 },
    P1: buktiP1(tp1(1, 1, 58), tp1(1, 2, 66, { tersembunyi: true })),
    P2: {
      jumlah_a: 2, pertemuan_tercatat: 2, pertemuan_a: [1, 2], komposisi: { H: 0, S: 0, I: 0, A: 2 },
    },
  });
  const r = susunRincian(h, { lm: LM, parameter: { kelas_min: 8 } }, konteksContoh(), 75);
  assert.deepEqual(r.bagian.map((b) => b.kode), ['P2', 'P1', 'P4']);
  r.bagian.forEach((b) => assert.ok(b.kalimat.length > 0, `${b.kode} tanpa kalimat bukti`));
  assert.equal(r.bagian[0].deret.length, 3);
  assert.equal(r.bagian[1].baris.length, 2);
  assert.equal(r.bagian[1].catatan.length, 1, 'tersembunyi dijelaskan');
  assert.ok(r.bagian[2].grafik);
  assert.equal(r.nama, 'Dewi');
});

test('susunRincian: siswa tanpa penanda menghasilkan panel tanpa bagian', () => {
  const r = susunRincian(siswaEval(7, 7, 'Fani'), { lm: LM, parameter: {} }, konteksContoh(), 75);
  assert.deepEqual(r.bagian, []);
  assert.deepEqual(r.belumCukup, []);
});

test('susunRincian: pola BELUM_CUKUP dicatat terpisah beserta alasan dan data yang dibutuhkan', () => {
  const h = siswaEval(7, 7, 'Fani');
  h.pola.P2 = { status: 'BELUM_CUKUP', alasan: 'baru 3 pertemuan tercatat' };
  h.pola.P4 = { status: 'BELUM_CUKUP' };
  const r = susunRincian(h, { lm: LM, parameter: { pertemuan_min: 5 } }, konteksContoh(), 75);
  assert.deepEqual(r.belumCukup.map((b) => b.kode), ['P2', 'P4']);
  assert.equal(r.belumCukup[0].alasan, 'baru 3 pertemuan tercatat');
  assert.equal(r.belumCukup[1].alasan, null);
  assert.match(r.belumCukup[0].butuh, /paling sedikit 5 pertemuan/);
  assert.deepEqual(r.bagian, [], 'belum cukup bukan penanda');
});
