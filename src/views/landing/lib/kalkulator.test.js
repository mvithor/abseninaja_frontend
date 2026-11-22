// Tes logika murni Kalkulator Digitalisasi (lib/kalkulator.js) dan keutuhan data
// contoh (data/kalkulator.js). Jalankan: node --test "src/views/landing/lib/*.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ID_TINGKAT,
  JEDA_JAWAB_MS,
  NILAI_MAKS,
  adaJawabanLengkap,
  bolehMenjawab,
  buatJawabanKosong,
  hitungSkor,
  keadaanAwal,
  langkahHasil,
  reduksi,
  terapkanJawaban,
  terbilang,
  tingkat,
} from './kalkulator.js';
import { AMBANG, BERIKUTNYA, CTA, HASIL, HERO, INTRO, JUMLAH_SOAL, KUIS, META, OPSI, SOAL, TINGKAT } from '../data/kalkulator.js';

const N = 7;
const semua = (nilai, jumlah = N) => Array(jumlah).fill(nilai);

describe('hitungSkor', () => {
  it('semua jawaban tertinggi = 100, lengkap', () => {
    assert.deepEqual(hitungSkor(semua(2), N), { persen: 100, total: 14, terjawab: 7, lengkap: true });
  });

  it('semua jawaban terendah = 0, tetap lengkap (0 adalah jawaban sah)', () => {
    assert.deepEqual(hitungSkor(semua(0), N), { persen: 0, total: 0, terjawab: 7, lengkap: true });
  });

  it('jawaban belum diisi dihitung 0 tetapi tidak lengkap', () => {
    const r = hitungSkor([2, 2, null, null, null, null, null], N);
    assert.equal(r.total, 4);
    assert.equal(r.terjawab, 2);
    assert.equal(r.lengkap, false);
    assert.equal(r.persen, 29);
    assert.equal(hitungSkor([], N).lengkap, false);
    assert.equal(hitungSkor(buatJawabanKosong(N), N).persen, 0);
  });

  it('pembulatan ke persen terdekat (tujuh soal)', () => {
    const persen = Array.from({ length: 15 }, (_, t) => hitungSkor(distribusi(t), N).persen);
    assert.deepEqual(persen, [0, 7, 14, 21, 29, 36, 43, 50, 57, 64, 71, 79, 86, 93, 100]);
  });

  it('pembulatan tepat di .5: 23/40 = 58, 46 dari 40 soal = 58, 29 dari 100 soal = 15', () => {
    const dengan = (total, jumlah) => {
      const larik = [];
      let sisa = total;
      for (let i = 0; i < jumlah; i += 1) {
        const n = Math.min(2, sisa);
        larik.push(n);
        sisa -= n;
      }
      return larik;
    };
    assert.equal(hitungSkor(dengan(23, 20), 20).persen, 58);
    assert.equal(hitungSkor(dengan(46, 40), 40).persen, 58);
    assert.equal(hitungSkor(dengan(29, 100), 100).persen, 15);
    assert.equal(hitungSkor(dengan(1, 100), 100).persen, 1);
  });

  it('sama dengan pembanding bilangan bulat floor((200t + 2n) / (4n)) untuk n 1 sampai 60 dan t 0 sampai 2n', () => {
    for (let n = 1; n <= 60; n += 1) {
      for (let t = 0; t <= 2 * n; t += 1) {
        const larik = [];
        let sisa = t;
        for (let i = 0; i < n; i += 1) {
          const v = Math.min(2, sisa);
          larik.push(v);
          sisa -= v;
        }
        const r = hitungSkor(larik, n);
        assert.equal(r.total, t);
        assert.equal(r.persen, Math.floor((200 * t + 2 * n) / (4 * n)), `n=${n} t=${t}`);
      }
    }
  });

  it('contoh desain: [2,1,1,0,2,1,1] = 8 dari 14 = 57', () => {
    assert.equal(hitungSkor([2, 1, 1, 0, 2, 1, 1], N).persen, 57);
  });

  it('batas 35 dan 70 persis dengan 20 soal (14/40 dan 28/40)', () => {
    assert.equal(hitungSkor([...Array(14).fill(1), ...Array(6).fill(0)], 20).persen, 35);
    assert.equal(hitungSkor([...Array(13).fill(1), ...Array(7).fill(0)], 20).persen, 33);
    assert.equal(hitungSkor([...Array(14).fill(2), ...Array(6).fill(0)], 20).persen, 70);
    assert.equal(hitungSkor([...Array(13).fill(2), 1, ...Array(6).fill(0)], 20).persen, 68);
  });

  it('nilai asing dihitung 0 dan tidak merusak skor', () => {
    const asing = [NaN, '2', null, undefined, -1, 3, 1.5, Infinity, -Infinity, {}, [], true, '', 'x'];
    asing.forEach((x) => {
      const r = hitungSkor([x, 2, 2, 2, 2, 2, 2], N);
      assert.equal(r.total, 12, String(x));
      assert.equal(r.terjawab, 6, String(x));
      assert.equal(r.lengkap, false);
      assert.ok(Number.isInteger(r.persen) && r.persen >= 0 && r.persen <= 100);
    });
  });

  it('nilai besar atau negatif tidak mendorong skor di luar 0 sampai 100', () => {
    assert.equal(hitungSkor(semua(999), N).persen, 0);
    assert.equal(hitungSkor(semua(-5), N).persen, 0);
    assert.equal(hitungSkor(semua(Number.MAX_SAFE_INTEGER), N).persen, 0);
    assert.equal(hitungSkor(semua(3), N).persen, 0);
  });

  it('butir lebih dari jumlah soal tidak ikut dihitung', () => {
    assert.deepEqual(hitungSkor([...semua(2), 2, 2, 2], N), { persen: 100, total: 14, terjawab: 7, lengkap: true });
  });

  it('masukan bukan larik dan jumlah soal tidak sah -> nol dan tidak lengkap', () => {
    [null, undefined, 'abc', 5, {}, { 0: 2, length: 7 }].forEach((x) => assert.deepEqual(hitungSkor(x, N), { persen: 0, total: 0, terjawab: 0, lengkap: false }));
    [0, -1, 1.5, NaN, Infinity, '7', null, undefined].forEach((n) => assert.deepEqual(hitungSkor(semua(2), n), { persen: 0, total: 0, terjawab: 0, lengkap: false }));
  });

  it('larik jarang (sparse) aman', () => {
    // eslint-disable-next-line no-sparse-arrays
    const jarang = [2, , 2, , 2, , 2];
    const r = hitungSkor(jarang, N);
    assert.equal(r.total, 8);
    assert.equal(r.terjawab, 4);
    assert.equal(r.lengkap, false);
  });

  it('satu soal: 0, 50, 100', () => {
    assert.equal(hitungSkor([0], 1).persen, 0);
    assert.equal(hitungSkor([1], 1).persen, 50);
    assert.equal(hitungSkor([2], 1).persen, 100);
  });

  it('acak: persen sama dengan pembanding bilangan bulat untuk masukan campuran', () => {
    const kumpulan = [0, 1, 2, 3, -1, 1.5, NaN, null, undefined, '1', Infinity, {}, []];
    const sah = (x) => Number.isInteger(x) && x >= 0 && x <= 2;
    let benih = 12345;
    const acak = () => {
      benih = (benih * 1103515245 + 12345) % 2147483648;
      return benih / 2147483648;
    };
    for (let k = 0; k < 2000; k += 1) {
      const panjang = Math.floor(acak() * 12);
      const larik = Array.from({ length: panjang }, () => kumpulan[Math.floor(acak() * kumpulan.length)]);
      const jumlah = 1 + Math.floor(acak() * 10);
      const r = hitungSkor(larik, jumlah);
      const dipakai = larik.slice(0, jumlah).filter(sah);
      const total = dipakai.reduce((a, b) => a + b, 0);
      assert.equal(r.total, total);
      assert.equal(r.terjawab, dipakai.length);
      assert.equal(r.persen, Math.floor((200 * total + 2 * jumlah) / (4 * jumlah)));
      assert.equal(r.lengkap, dipakai.length === jumlah);
    }
  });
});

// Larik berjumlah total t dengan nilai 0 sampai 2 (tujuh soal).
function distribusi(t) {
  const hasil = [];
  let sisa = t;
  for (let i = 0; i < N; i += 1) {
    const n = Math.min(2, sisa);
    hasil.push(n);
    sisa -= n;
  }
  return hasil;
}

describe('adaJawabanLengkap', () => {
  it('lengkap hanya bila semua soal punya nilai sah', () => {
    assert.equal(adaJawabanLengkap(semua(1), N), true);
    assert.equal(adaJawabanLengkap([...semua(1, 6), null], N), false);
    assert.equal(adaJawabanLengkap([...semua(1, 6), NaN], N), false);
    assert.equal(adaJawabanLengkap([...semua(1, 6), '1'], N), false);
    assert.equal(adaJawabanLengkap(semua(1, 6), N), false);
    assert.equal(adaJawabanLengkap(null, N), false);
  });
});

describe('tingkat', () => {
  it('batas bawah inklusif: 34 awal, 35 berkembang, 69 berkembang, 70 terintegrasi', () => {
    assert.equal(tingkat(34, AMBANG), 'awal');
    assert.equal(tingkat(35, AMBANG), 'berkembang');
    assert.equal(tingkat(69, AMBANG), 'berkembang');
    assert.equal(tingkat(70, AMBANG), 'terintegrasi');
  });

  it('ujung 0 dan 100', () => {
    assert.equal(tingkat(0, AMBANG), 'awal');
    assert.equal(tingkat(100, AMBANG), 'terintegrasi');
  });

  it('ambang dibandingkan dengan persen BULAT yang tampil: pecahan dibulatkan dulu', () => {
    assert.equal(tingkat(34.49, AMBANG), 'awal');
    assert.equal(tingkat(34.5, AMBANG), 'berkembang');
    assert.equal(tingkat(34.99, AMBANG), 'berkembang');
    assert.equal(tingkat(69.49, AMBANG), 'berkembang');
    assert.equal(tingkat(69.5, AMBANG), 'terintegrasi');
  });

  it('angka tampil dan tingkat tidak pernah bertentangan: 13 soal total 9 = 35 -> Berkembang', () => {
    const larik = [...Array(4).fill(2), 1, ...Array(8).fill(0)];
    const { persen } = hitungSkor(larik, 13);
    assert.equal(persen, 35);
    assert.equal(tingkat(persen, AMBANG), 'berkembang');
    assert.equal(TINGKAT[tingkat(persen, AMBANG)].label, 'Berkembang');
  });

  it('untuk semua jumlah soal 1 sampai 40 dan semua total, tingkat konsisten dengan persen tampil', () => {
    for (let n = 1; n <= 40; n += 1) {
      for (let t = 0; t <= 2 * n; t += 1) {
        const larik = [];
        let sisa = t;
        for (let i = 0; i < n; i += 1) {
          const v = Math.min(2, sisa);
          larik.push(v);
          sisa -= v;
        }
        const { persen } = hitungSkor(larik, n);
        const harapan = persen < AMBANG.berkembang ? 'awal' : persen < AMBANG.terintegrasi ? 'berkembang' : 'terintegrasi';
        assert.equal(tingkat(persen, AMBANG), harapan, `n=${n} t=${t} persen=${persen}`);
      }
    }
  });

  it('di luar rentang dijepit; bukan angka dihitung 0', () => {
    assert.equal(tingkat(150, AMBANG), 'terintegrasi');
    assert.equal(tingkat(Infinity, AMBANG), 'terintegrasi');
    assert.equal(tingkat(-20, AMBANG), 'awal');
    assert.equal(tingkat(-Infinity, AMBANG), 'awal');
    [NaN, '80', null, undefined, {}, []].forEach((x) => assert.equal(tingkat(x, AMBANG), 'awal'));
  });

  it('ambang tidak sah melempar TypeError', () => {
    [undefined, null, {}, { berkembang: 70, terintegrasi: 35 }, { berkembang: 35, terintegrasi: 35 }, { berkembang: '35', terintegrasi: 70 }, { berkembang: NaN, terintegrasi: 70 }].forEach((a) =>
      assert.throws(() => tingkat(50, a), TypeError),
    );
  });

  it('tiap skor yang mungkin (tujuh soal) jatuh ke tingkat yang konsisten dan menaik', () => {
    const urutan = Array.from({ length: 15 }, (_, t) => ID_TINGKAT.indexOf(tingkat(hitungSkor(distribusi(t), N).persen, AMBANG)));
    urutan.forEach((u) => assert.ok(u >= 0));
    assert.deepEqual(urutan, [...urutan].sort((x, y) => x - y));
    assert.deepEqual(urutan, [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
  });

  it('jalur penuh dengan 20 soal: tepat 35 dan tepat 70', () => {
    assert.equal(tingkat(hitungSkor([...Array(14).fill(1), ...Array(6).fill(0)], 20).persen, AMBANG), 'berkembang');
    assert.equal(tingkat(hitungSkor([...Array(13).fill(1), ...Array(7).fill(0)], 20).persen, AMBANG), 'awal');
    assert.equal(tingkat(hitungSkor([...Array(14).fill(2), ...Array(6).fill(0)], 20).persen, AMBANG), 'terintegrasi');
    assert.equal(tingkat(hitungSkor([...Array(13).fill(2), 1, ...Array(6).fill(0)], 20).persen, AMBANG), 'berkembang');
  });
});

describe('terapkanJawaban', () => {
  it('mengembalikan larik baru dan tidak mengubah yang asli', () => {
    const asli = buatJawabanKosong(N);
    const beku = Object.freeze([...asli]);
    const baru = terapkanJawaban(beku, 2, 1, N);
    assert.notEqual(baru, beku);
    assert.deepEqual(baru, [null, null, 1, null, null, null, null]);
    assert.deepEqual(beku, asli);
  });

  it('menimpa jawaban lama', () => {
    const a1 = terapkanJawaban(buatJawabanKosong(N), 0, 2, N);
    const a2 = terapkanJawaban(a1, 0, 0, N);
    assert.equal(a1[0], 2);
    assert.equal(a2[0], 0);
  });

  it('menolak indeks di luar rentang atau bukan bilangan bulat (rujukan sama dikembalikan)', () => {
    const asli = buatJawabanKosong(N);
    [-1, N, N + 5, 1.5, NaN, Infinity, '1', null, undefined].forEach((i) => assert.equal(terapkanJawaban(asli, i, 1, N), asli, String(i)));
  });

  it('menolak nilai di luar rentang atau bukan bilangan bulat (rujukan sama dikembalikan)', () => {
    const asli = buatJawabanKosong(N);
    [NaN, '1', null, undefined, -1, 3, 2.5, 0.5, Infinity, -Infinity, {}, [], true].forEach((v) => assert.equal(terapkanJawaban(asli, 0, v, N), asli, String(v)));
  });

  it('nilai batas 0 dan NILAI_MAKS diterima; -0 menjadi 0', () => {
    assert.deepEqual(terapkanJawaban(buatJawabanKosong(2), 0, 0, 2), [0, null]);
    assert.deepEqual(terapkanJawaban(buatJawabanKosong(2), 1, NILAI_MAKS, 2), [null, NILAI_MAKS]);
    assert.ok(Object.is(terapkanJawaban(buatJawabanKosong(1), 0, -0, 1)[0], 0));
  });

  it('jumlah soal tidak sah menolak', () => {
    const asli = [];
    [0, -1, 1.5, NaN, undefined].forEach((n) => assert.equal(terapkanJawaban(asli, 0, 1, n), asli));
  });

  it('masukan bukan larik dengan indeks dan nilai sah mulai dari larik kosong', () => {
    assert.deepEqual(terapkanJawaban(null, 1, 2, 3), [null, 2, null]);
    assert.deepEqual(terapkanJawaban(undefined, 0, 1, 2), [1, null]);
  });

  it('objek mirip larik bukan larik: mulai dari larik kosong', () => {
    assert.deepEqual(terapkanJawaban({ 0: 2, 1: 2, length: 3 }, 2, 1, 3), [null, null, 1]);
    assert.deepEqual(terapkanJawaban('abc', 0, 1, 2), [1, null]);
  });

  it('butir rusak di larik lama dinormalkan menjadi null; panjang mengikuti jumlah soal', () => {
    assert.deepEqual(terapkanJawaban(['x', 2, 9, NaN], 1, 0, 3), [null, 0, null]);
    assert.deepEqual(terapkanJawaban([1], 2, 2, 4), [1, null, 2, null]);
  });
});

describe('buatJawabanKosong', () => {
  it('jumlah sah menghasilkan larik null sepanjang jumlah', () => {
    assert.deepEqual(buatJawabanKosong(3), [null, null, null]);
    assert.deepEqual(buatJawabanKosong(1), [null]);
  });

  it('jumlah tidak sah menghasilkan larik kosong, tidak melempar', () => {
    [0, -1, 1.5, NaN, undefined, null, '3', Infinity].forEach((n) => assert.deepEqual(buatJawabanKosong(n), [], String(n)));
  });
});

describe('bolehMenjawab (jeda penolakan klik ganda)', () => {
  it('menolak jawaban yang datang sebelum jeda berlalu', () => {
    assert.equal(bolehMenjawab(1000, 1000), false);
    assert.equal(bolehMenjawab(1100, 1000), false);
    assert.equal(bolehMenjawab(1000 + JEDA_JAWAB_MS - 1, 1000), false);
  });

  it('menerima tepat pada jeda dan sesudahnya', () => {
    assert.equal(bolehMenjawab(1000 + JEDA_JAWAB_MS, 1000), true);
    assert.equal(bolehMenjawab(5000, 1000), true);
  });

  it('jeda bawaan sekitar 350 ms: cukup untuk klik ganda, tidak terasa bagi pengguna yang membaca soal', () => {
    assert.equal(JEDA_JAWAB_MS, 350);
  });

  it('jeda bisa diberikan; waktu pasang belum tercatat atau masukan aneh tidak menahan pengguna', () => {
    assert.equal(bolehMenjawab(1100, 1000, 50), true);
    assert.equal(bolehMenjawab(1010, 1000, 50), false);
    [null, undefined, NaN, Infinity, '1000'].forEach((x) => assert.equal(bolehMenjawab(2000, x), true, String(x)));
    [null, undefined, NaN, Infinity, '2000'].forEach((x) => assert.equal(bolehMenjawab(x, 1000), true, String(x)));
    assert.equal(bolehMenjawab(2000, 1000, NaN), true);
  });

  it('selisih negatif (jam bergeser) tidak menahan pengguna', () => {
    assert.equal(bolehMenjawab(500, 1000), true);
  });

  it('dua jawaban beruntun pada pergantian soal: yang kedua ditolak, yang wajar diterima', () => {
    let soalDipasang = 10_000;
    const jawabKe = (waktu) => bolehMenjawab(waktu, soalDipasang);
    assert.equal(jawabKe(10_120), false); // klik pertama terlalu dekat dengan pemasangan
    assert.equal(jawabKe(10_900), true); // pengguna membaca lalu menjawab
    soalDipasang = 10_900; // soal berikutnya dipasang
    assert.equal(jawabKe(10_900 + 140), false); // klik kedua pada klik ganda
    assert.equal(jawabKe(10_900 + 2000), true);
  });
});

describe('terbilang', () => {
  it('nol sampai sepuluh dalam kata, selebihnya angka', () => {
    assert.equal(terbilang(7), 'tujuh');
    assert.equal(terbilang(0), 'nol');
    assert.equal(terbilang(10), 'sepuluh');
    assert.equal(terbilang(11), '11');
  });

  it('bukan bilangan bulat tidak negatif -> kosong', () => {
    [-1, 1.5, NaN, '7', null, undefined].forEach((x) => assert.equal(terbilang(x), ''));
  });
});

describe('mesin keadaan (reduksi)', () => {
  const jalankan = (aksi, awal = keadaanAwal(N)) => aksi.reduce((s, a) => reduksi(s, a, N), awal);
  const jawab = (nilai) => ({ type: 'jawab', nilai });

  it('keadaan awal: intro, jawaban kosong, belum bergerak', () => {
    assert.deepEqual(keadaanAwal(N), { langkah: 0, jawaban: buatJawabanKosong(N), bergerak: false });
  });

  it('jawab semua 2 -> hasil dengan skor 100', () => {
    const s = jalankan([{ type: 'mulai' }, ...Array(N).fill(jawab(2))]);
    assert.equal(s.langkah, langkahHasil(N));
    assert.deepEqual(hitungSkor(s.jawaban, N), { persen: 100, total: 14, terjawab: 7, lengkap: true });
    assert.equal(tingkat(100, AMBANG), 'terintegrasi');
  });

  it('jawab semua 0 -> hasil dengan skor 0', () => {
    const s = jalankan([{ type: 'mulai' }, ...Array(N).fill(jawab(0))]);
    assert.equal(s.langkah, langkahHasil(N));
    assert.equal(hitungSkor(s.jawaban, N).persen, 0);
    assert.equal(tingkat(0, AMBANG), 'awal');
  });

  it('jawaban campuran contoh desain menghasilkan 57 (berkembang)', () => {
    const s = jalankan([{ type: 'mulai' }, ...[2, 1, 1, 0, 2, 1, 1].map(jawab)]);
    const { persen } = hitungSkor(s.jawaban, N);
    assert.equal(persen, 57);
    assert.equal(tingkat(persen, AMBANG), 'berkembang');
  });

  it('mulai hanya berlaku dari intro', () => {
    const s1 = jalankan([{ type: 'mulai' }]);
    assert.equal(s1.langkah, 1);
    assert.equal(s1.bergerak, true);
    assert.equal(reduksi(s1, { type: 'mulai' }, N), s1);
  });

  it('jawab dari intro atau dari hasil diabaikan (keadaan sama)', () => {
    const awal = keadaanAwal(N);
    assert.equal(reduksi(awal, jawab(1), N), awal);
    const hasil = jalankan([{ type: 'mulai' }, ...Array(N).fill(jawab(1))]);
    assert.equal(reduksi(hasil, jawab(2), N), hasil);
  });

  it('jawab dengan nilai tidak sah tidak maju dan tidak mengubah jawaban', () => {
    const s = jalankan([{ type: 'mulai' }]);
    [NaN, '1', null, undefined, -1, 3, 1.5].forEach((v) => assert.equal(reduksi(s, jawab(v), N), s));
    assert.equal(reduksi(s, { type: 'jawab' }, N), s);
  });

  it('kembali dari soal 1 ke intro', () => {
    const s = jalankan([{ type: 'mulai' }, { type: 'kembali' }]);
    assert.equal(s.langkah, 0);
  });

  it('kembali mundur satu soal tanpa kehilangan jawaban', () => {
    const s = jalankan([{ type: 'mulai' }, jawab(2), jawab(1), jawab(0)]);
    assert.equal(s.langkah, 4);
    const mundur = reduksi(reduksi(s, { type: 'kembali' }, N), { type: 'kembali' }, N);
    assert.equal(mundur.langkah, 2);
    assert.deepEqual(mundur.jawaban.slice(0, 3), [2, 1, 0]);
  });

  it('menjawab ulang soal yang dimundurkan menimpa nilainya dan maju lagi', () => {
    const s = jalankan([{ type: 'mulai' }, jawab(2), { type: 'kembali' }, jawab(0)]);
    assert.equal(s.langkah, 2);
    assert.equal(s.jawaban[0], 0);
  });

  it('kembali dari intro dan dari hasil diabaikan', () => {
    const awal = keadaanAwal(N);
    assert.equal(reduksi(awal, { type: 'kembali' }, N), awal);
    const hasil = jalankan([{ type: 'mulai' }, ...Array(N).fill(jawab(1))]);
    assert.equal(reduksi(hasil, { type: 'kembali' }, N), hasil);
  });

  it('kembali ke intro lalu mulai lagi mempertahankan jawaban', () => {
    const s = jalankan([{ type: 'mulai' }, jawab(2), { type: 'kembali' }, { type: 'kembali' }, { type: 'mulai' }]);
    assert.equal(s.langkah, 1);
    assert.equal(s.jawaban[0], 2);
  });

  it('ulangi mengosongkan jawaban dan kembali ke intro dari mana pun', () => {
    const hasil = jalankan([{ type: 'mulai' }, ...Array(N).fill(jawab(2))]);
    const ulang = reduksi(hasil, { type: 'ulangi' }, N);
    assert.equal(ulang.langkah, 0);
    assert.deepEqual(ulang.jawaban, buatJawabanKosong(N));
    assert.equal(hitungSkor(ulang.jawaban, N).persen, 0);
    const tengah = jalankan([{ type: 'mulai' }, jawab(2), { type: 'ulangi' }]);
    assert.equal(tengah.langkah, 0);
    assert.deepEqual(tengah.jawaban, buatJawabanKosong(N));
  });

  it('reduksi tidak mengubah keadaan lama (tidak ada mutasi bersama)', () => {
    const s0 = jalankan([{ type: 'mulai' }, jawab(1)]);
    const beku = JSON.stringify(s0);
    reduksi(s0, jawab(2), N);
    reduksi(s0, { type: 'kembali' }, N);
    reduksi(s0, { type: 'ulangi' }, N);
    assert.equal(JSON.stringify(s0), beku);
  });

  it('aksi tidak dikenal atau kosong mengembalikan keadaan yang sama', () => {
    const s = keadaanAwal(N);
    [undefined, null, {}, { type: 'terbang' }, 'mulai', 5].forEach((a) => assert.equal(reduksi(s, a, N), s));
  });

  it('kembali dari soal terakhir (langkah 7) menuju soal 6 dengan jawaban utuh', () => {
    const s = jalankan([{ type: 'mulai' }, ...Array(N - 1).fill(jawab(1))]);
    assert.equal(s.langkah, N);
    const mundur = reduksi(s, { type: 'kembali' }, N);
    assert.equal(mundur.langkah, N - 1);
    assert.deepEqual(mundur.jawaban.slice(0, N - 1), Array(N - 1).fill(1));
  });

  it('ulangi dan muat menandai bergerak: true (kontrak UI untuk fokus dan pengumuman)', () => {
    assert.equal(reduksi(keadaanAwal(N), { type: 'ulangi' }, N).bergerak, true);
    assert.equal(reduksi(keadaanAwal(N), { type: 'muat', langkah: 2, jawaban: [] }, N).bergerak, true);
    assert.equal(reduksi(keadaanAwal(N), { type: 'mulai' }, N).bergerak, true);
    assert.equal(keadaanAwal(N).bergerak, false);
  });

  it('jumlah soal tidak sah: keadaan tidak berubah untuk semua aksi, tidak melempar', () => {
    const s = keadaanAwal(N);
    [NaN, undefined, null, 0, -3, 7.5, '7', Infinity].forEach((jumlah) => {
      [{ type: 'mulai' }, { type: 'jawab', nilai: 1 }, { type: 'kembali' }, { type: 'ulangi' }, { type: 'muat', langkah: 999, jawaban: [1] }, { type: 'muat', langkah: 0, jawaban: [] }].forEach((a) => {
        assert.equal(reduksi(s, a, jumlah), s, `${String(jumlah)} ${a.type}`);
      });
    });
  });

  it('keadaan rusak dipulihkan ke keadaan awal tanpa melempar', () => {
    [null, undefined, 5, 'x', {}, { langkah: 'a', jawaban: [] }, { langkah: 1, jawaban: null }, { langkah: 1.5, jawaban: [] }].forEach((rusak) => {
      assert.deepEqual(reduksi(rusak, { type: 'mulai' }, N), keadaanAwal(N));
    });
  });

  it('muat menolak langkah di luar 0 sampai jumlahSoal+1 (termasuk 999) dan langkah bukan bilangan bulat', () => {
    const s = keadaanAwal(N);
    [999, N + 2, -1, 1.5, NaN, Infinity, '3', null, undefined].forEach((l) => assert.equal(reduksi(s, { type: 'muat', langkah: l, jawaban: [] }, N), s, String(l)));
    assert.equal(reduksi(s, { type: 'muat', langkah: N + 1, jawaban: [] }, N).langkah, N + 1);
    assert.equal(reduksi(s, { type: 'muat', langkah: 0, jawaban: [] }, N).langkah, 0);
  });

  it('muat dengan jawaban hilang atau bukan larik tidak melempar dan memberi jawaban kosong', () => {
    const s = keadaanAwal(N);
    [undefined, null, 'abc', 5, {}, { 0: 2, length: 3 }].forEach((j) => {
      const r = reduksi(s, { type: 'muat', langkah: 2, jawaban: j }, N);
      assert.equal(r.langkah, 2);
      assert.deepEqual(r.jawaban, buatJawabanKosong(N));
    });
    assert.deepEqual(reduksi(s, { type: 'muat', langkah: 2 }, N).jawaban, buatJawabanKosong(N));
  });

  it('muat ke langkah 0 dari keadaan bukan awal: jawaban hanya dari aksi, jawaban lama tidak ikut', () => {
    const tengah = jalankan([{ type: 'mulai' }, jawab(2), jawab(2), jawab(2)]);
    const r = reduksi(tengah, { type: 'muat', langkah: 0, jawaban: [] }, N);
    assert.equal(r.langkah, 0);
    assert.deepEqual(r.jawaban, buatJawabanKosong(N));
    const r2 = reduksi(tengah, { type: 'muat', langkah: 0, jawaban: [1] }, N);
    assert.deepEqual(r2.jawaban, [1, null, null, null, null, null, null]);
  });

  it('muat (pratinjau DEV) menormalkan jawaban dan menolak langkah tidak sah', () => {
    const s = reduksi(keadaanAwal(N), { type: 'muat', langkah: 3, jawaban: [2, 1, 'x', 9] }, N);
    assert.equal(s.langkah, 3);
    assert.deepEqual(s.jawaban, [2, 1, null, null, null, null, null]);
    const awal = keadaanAwal(N);
    [-1, N + 2, 1.5, NaN, '3', undefined].forEach((l) => assert.equal(reduksi(awal, { type: 'muat', langkah: l, jawaban: [] }, N), awal));
  });

  it('keadaan pratinjau desain valid: Awal, Soal (langkah 3, dua jawaban), Hasil (lengkap)', () => {
    // Nilai sama dengan PRATINJAU di pages/kalkulator/PemilihPratinjau.jsx.
    const pratinjau = [
      { langkah: 0, jawaban: [] },
      { langkah: 3, jawaban: [2, 1] },
      { langkah: langkahHasil(N), jawaban: [2, 1, 1, 0, 2, 1, 1] },
    ];
    const [awal, soal, hasil] = pratinjau.map((k) => reduksi(keadaanAwal(N), { type: 'muat', langkah: k.langkah, jawaban: k.jawaban }, N));
    assert.equal(awal.langkah, 0);
    assert.equal(soal.langkah, 3);
    assert.deepEqual(soal.jawaban.slice(0, 2), [2, 1]);
    assert.equal(hasil.langkah, langkahHasil(N));
    assert.equal(adaJawabanLengkap(hasil.jawaban, N), true);
  });

  it('alur sama berlaku untuk jumlah soal lain', () => {
    const s = [{ type: 'mulai' }, jawab(2), jawab(2)].reduce((x, a) => reduksi(x, a, 2), keadaanAwal(2));
    assert.equal(s.langkah, langkahHasil(2));
    assert.equal(hitungSkor(s.jawaban, 2).persen, 100);
  });
});

// Keutuhan data contoh terhadap desain Kalkulator.dc.html.
describe('data kalkulator', () => {
  it('tujuh pertanyaan persis desain', () => {
    assert.equal(JUMLAH_SOAL, 7);
    assert.deepEqual(SOAL, [
      'Bagaimana penerimaan murid baru dikelola di sekolah Anda?',
      'Bagaimana absensi murid dan guru dicatat?',
      'Bagaimana jadwal pelajaran disusun dan dibagikan?',
      'Bagaimana tagihan SPP dan pembayaran dicatat?',
      'Bagaimana nilai dan rapor murid dikelola?',
      'Bagaimana kabar sekolah disampaikan ke wali murid?',
      'Bagaimana laporan untuk kepala sekolah disiapkan?',
    ]);
  });

  it('tiga opsi: Belum ada = 0, Sebagian = 1, Sudah berjalan = 2', () => {
    assert.deepEqual(OPSI, [
      { label: 'Belum ada', nilai: 0 },
      { label: 'Sebagian', nilai: 1 },
      { label: 'Sudah berjalan', nilai: 2 },
    ]);
    assert.equal(Math.max(...OPSI.map((o) => o.nilai)), NILAI_MAKS);
    OPSI.forEach((o) => assert.ok(Number.isInteger(o.nilai) && o.nilai >= 0 && o.nilai <= NILAI_MAKS));
  });

  it('ambang 35 dan 70 dan tiga tingkat persis desain', () => {
    assert.deepEqual(AMBANG, { berkembang: 35, terintegrasi: 70 });
    assert.deepEqual(Object.keys(TINGKAT), ID_TINGKAT);
    assert.deepEqual(
      ID_TINGKAT.map((id) => [TINGKAT[id].label, TINGKAT[id].saran]),
      [
        ['Tahap awal', 'Mulai dari satu proses yang paling memakan waktu, misalnya absensi.'],
        ['Berkembang', 'Sebagian proses sudah digital. Hubungkan yang tersisa agar data tidak terpisah.'],
        ['Terintegrasi', 'Sebagian besar proses sudah digital. Fokus pada analitik dan komunikasi.'],
      ],
    );
  });

  it('teks tingkat, saran, dan penjelasan skor tidak memuat angka atau klaim berbasis angka', () => {
    const teks = [
      ...ID_TINGKAT.flatMap((id) => [TINGKAT[id].label, TINGKAT[id].saran]),
      ...BERIKUTNYA.butir.flatMap((b) => [b.judul, typeof b.deskripsi === 'string' ? b.deskripsi : `${b.deskripsi.web} ${b.deskripsi.mobile}`]),
    ].join(' ');
    assert.doesNotMatch(teks, /\d/);
    assert.doesNotMatch(teks, /%|persen|peringkat|ranking|rata-rata|sekolah lain|dibanding|terbukti|dijamin|pasti|menghemat/i);
  });

  it('pengumuman hasil hanya memuat skor yang dihitung (nama tingkat dibacakan lewat fokus ke judul)', () => {
    assert.equal(HASIL.pengumuman(57), 'Skor Anda 57 dari 100.');
    assert.doesNotMatch(HASIL.pengumuman(57), /Tahap awal|Berkembang|Terintegrasi/);
    assert.equal(KUIS.labelPertanyaan(3, 7), 'Pertanyaan 3 dari 7');
  });

  it('kata jumlah dan angka jumlah di teks mengikuti jumlah soal', () => {
    assert.equal(HERO.sub.web, 'Jawab tujuh pertanyaan singkat untuk mendapatkan skor dan saran.');
    assert.equal(HERO.sub.mobile, 'Jawab tujuh soal, dapatkan skor dan saran.');
    assert.equal(META.description, HERO.sub.web);
    assert.equal(HERO.fakta[0].label, '7 pertanyaan');
    assert.equal(INTRO.butir[0].teks, '7 pertanyaan tentang kondisi sekolah');
  });

  it('empat kartu fakta dan tiga langkah berikutnya persis desain', () => {
    assert.deepEqual(HERO.fakta.map((f) => f.label), ['7 pertanyaan', 'Skor kesiapan', 'Saran langkah', 'Bahas bersama tim']);
    assert.deepEqual(BERIKUTNYA.butir.map((b) => b.judul), ['Baca skor', 'Pilih modul', 'Jadwalkan demo']);
    assert.equal(CTA.judul, 'Mau membahas hasilnya?');
  });

  it('klaim yang perlu diverifikasi bertanda verifikasi', () => {
    assert.ok(BERIKUTNYA.butir[0].verifikasi);
    assert.ok(BERIKUTNYA.butir[1].verifikasi);
    assert.ok(INTRO.verifikasi);
    assert.ok(HASIL.verifikasi);
  });

  it('tanpa penanda sementara yang terlihat', () => {
    const semuaTeks = [
      ...SOAL,
      ...OPSI.map((o) => o.label),
      ...ID_TINGKAT.flatMap((id) => [TINGKAT[id].label, TINGKAT[id].saran]),
      HERO.eyebrow,
      HERO.judul,
      HERO.sub.web,
      HERO.sub.mobile,
      ...HERO.fakta.map((f) => f.label),
      ...INTRO.butir.map((b) => b.teks),
    ].join(' ');
    assert.doesNotMatch(semuaTeks, /lorem|todo|\[|\]/i);
  });
});
