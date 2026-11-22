// Tes fungsi murni halaman Fitur Lengkap per peran (lib/fitur.js) dengan data sintetis.
// Tes yang memakai data asli (golden, koreksi klaim) ada di lib/fiturData.test.js.
// Jalankan: node --test "src/views/landing/lib/*.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BATAS_KATA,
  DAFTAR_CHIP,
  KUNCI_DILEWATI,
  LABEL_PERAN_ADMIN,
  LABEL_PERAN_MURID,
  LABEL_PERAN_WALI,
  STATUS_CHIP,
  TATA_SAH,
  alihkanGrup,
  bolehKata,
  bolehTagihan,
  bolehUjian,
  buatTabPeran,
  cariPeran,
  chipSah,
  hitungKata,
  idGrup,
  idTabPeran,
  jumlahKartu,
  kartuMelampauiBatas,
  kunciGrup,
  kataTerlarang,
  kelompokkanPerGrup,
  kumpulkanTeks,
  labelChip,
  normalisasiTeks,
  susunPanel,
  terbukaAwal,
  terbukaGrup,
  tingkatJudulSub,
  tingkatTurunan,
  validasiPeran,
} from './fitur.js';

const k = (grup, judul, ekstra = {}) => ({
  grup,
  ikon: () => null,
  judul,
  deskripsi: { web: 'Satu dua tiga.', mobile: 'Satu dua.' },
  tag: ['A'],
  ...ekstra,
});
const peranSah = (sub, ekstra = {}) => ({
  label: { web: 'Peran', mobile: 'Peran' },
  judul: 'Judul peran.',
  deskripsi: { web: 'Deskripsi.', mobile: 'Deskripsi.' },
  tata: 'penuh',
  sub,
  ...ekstra,
});
const tampung = (daftar) => validasiPeran(daftar).join('\n');
// Karakter tak terlihat dibangun dari kode (bukan diketik) supaya tidak hilang di penyunting.
const huruf = (...kode) => kode.map((c) => String.fromCharCode(c)).join('');

describe('chip status', () => {
  it('hanya dua status: uji-terbatas dan segera', () => {
    assert.deepEqual(DAFTAR_CHIP, ['uji-terbatas', 'segera']);
    assert.deepEqual(STATUS_CHIP, { 'uji-terbatas': 'Uji terbatas', segera: 'Segera' });
  });

  it('chipSah menerima undefined dan dua status', () => {
    assert.equal(chipSah(undefined), true);
    assert.equal(chipSah('uji-terbatas'), true);
    assert.equal(chipSah('segera'), true);
  });

  it('chipSah menolak chip tidak dikenal, termasuk "berjalan"', () => {
    ['berjalan', 'Berjalan', 'Segera', 'uji terbatas', '', null, 0, false, {}, [], 'toString', 'constructor', '__proto__', 'hasOwnProperty'].forEach((c) => {
      assert.equal(chipSah(c), false, `chip ${String(c)} harus ditolak`);
    });
  });

  it('labelChip memberi label tampil, "" untuk selain dua status', () => {
    assert.equal(labelChip('segera'), 'Segera');
    assert.equal(labelChip('uji-terbatas'), 'Uji terbatas');
    assert.equal(labelChip(undefined), '');
    assert.equal(labelChip('berjalan'), '');
    assert.equal(labelChip('toString'), '');
    assert.equal(labelChip(null), '');
  });
});

describe('id tab dan pemilihan peran', () => {
  it('id tab berbasis indeks, aman untuk label berspasi', () => {
    assert.equal(idTabPeran(0), 'peran-0');
    assert.equal(idTabPeran(5), 'peran-5');
    assert.ok(/^[A-Za-z0-9-]+$/.test(idTabPeran(3)));
  });

  it('buatTabPeran: satu tab per peran, id unik, label dibawa apa adanya', () => {
    const daftar = [
      peranSah([], { label: { web: 'Waka kurikulum dan Guru BK', mobile: 'Waka dan BK' } }),
      peranSah([]),
      peranSah([]),
    ];
    const tab = buatTabPeran(daftar);
    assert.equal(tab.length, 3);
    assert.equal(new Set(tab.map((t) => t.id)).size, 3);
    assert.deepEqual(tab[0].label, { web: 'Waka kurikulum dan Guru BK', mobile: 'Waka dan BK' });
    assert.deepEqual(tab.map((t) => t.id), ['peran-0', 'peran-1', 'peran-2']);
  });

  it('buatTabPeran bukan array -> []', () => {
    assert.deepEqual(buatTabPeran(undefined), []);
    assert.deepEqual(buatTabPeran(null), []);
    assert.deepEqual(buatTabPeran('x'), []);
    assert.deepEqual(buatTabPeran([]), []);
  });

  it('cariPeran: id sah, id tak dikenal jatuh ke peran pertama, daftar kosong -> null', () => {
    const daftar = [{ judul: 'a' }, { judul: 'b' }, { judul: 'c' }];
    assert.equal(cariPeran(daftar, 'peran-1').peran.judul, 'b');
    assert.equal(cariPeran(daftar, 'peran-1').indeks, 1);
    assert.equal(cariPeran(daftar, 'peran-9').indeks, 0);
    assert.equal(cariPeran(daftar, undefined).peran.judul, 'a');
    assert.equal(cariPeran(daftar, 'peran-9').id, 'peran-0');
    assert.equal(cariPeran([], 'peran-0'), null);
    assert.equal(cariPeran(undefined, 'peran-0'), null);
  });
});

describe('kelompokkanPerGrup', () => {
  it('urutan grup mengikuti kemunculan pertama, urutan kartu dalam grup stabil', () => {
    const hasil = kelompokkanPerGrup([k('A', '1'), k('B', '2'), k('A', '3'), k('C', '4'), k('B', '5')]);
    assert.deepEqual(hasil.map((g) => g.nama), ['A', 'B', 'C']);
    assert.deepEqual(hasil[0].kartu.map((x) => x.judul), ['1', '3']);
    assert.deepEqual(hasil[1].kartu.map((x) => x.judul), ['2', '5']);
    assert.deepEqual(hasil[2].kartu.map((x) => x.judul), ['4']);
  });

  it('grup berulang tidak berurutan tetap menjadi satu grup', () => {
    const hasil = kelompokkanPerGrup([k('Data induk', 'a'), k('Akademik', 'b'), k('Data induk', 'c')]);
    assert.equal(hasil.length, 2);
    assert.deepEqual(hasil[0].kartu.map((x) => x.judul), ['a', 'c']);
  });

  it('semua kartu terbawa, tidak ada yang hilang atau ganda', () => {
    const masuk = [k('A', '1'), k('B', '2'), k('A', '3'), k('C', '4'), k('B', '5'), k('A', '6')];
    const keluar = kelompokkanPerGrup(masuk).flatMap((g) => g.kartu);
    assert.equal(keluar.length, masuk.length);
    assert.deepEqual([...keluar.map((x) => x.judul)].sort(), masuk.map((x) => x.judul).sort());
  });

  it('input tidak diubah dan deterministik', () => {
    const masuk = [k('A', '1'), k('B', '2'), k('A', '3')];
    const salinan = JSON.stringify(masuk.map((x) => ({ ...x, ikon: 0 })));
    const a = kelompokkanPerGrup(masuk);
    const b = kelompokkanPerGrup(masuk);
    assert.equal(JSON.stringify(masuk.map((x) => ({ ...x, ikon: 0 }))), salinan);
    assert.deepEqual(a.map((g) => g.nama), b.map((g) => g.nama));
  });

  it('daftar kosong atau bukan array -> []', () => {
    assert.deepEqual(kelompokkanPerGrup([]), []);
    assert.deepEqual(kelompokkanPerGrup(undefined), []);
    assert.deepEqual(kelompokkanPerGrup(null), []);
    assert.deepEqual(kelompokkanPerGrup('x'), []);
    assert.deepEqual(kelompokkanPerGrup({}), []);
  });

  it('butir bukan objek dibuang, kartu tanpa grup masuk grup "" di tempat kemunculannya', () => {
    const hasil = kelompokkanPerGrup([null, 'x', 5, k('A', '1'), { judul: 'tanpa grup' }, k('A', '2'), undefined, { judul: 'lagi', grup: 7 }]);
    assert.deepEqual(hasil.map((g) => g.nama), ['A', '']);
    assert.deepEqual(hasil[1].kartu.map((x) => x.judul), ['tanpa grup', 'lagi']);
  });

  it('nama grup nama bawaan objek (constructor, __proto__) tidak merusak', () => {
    const hasil = kelompokkanPerGrup([k('constructor', '1'), k('__proto__', '2'), k('toString', '3')]);
    assert.deepEqual(hasil.map((g) => g.nama), ['constructor', '__proto__', 'toString']);
    assert.equal(hasil.flatMap((g) => g.kartu).length, 3);
  });
});

describe('susunPanel, jumlahKartu, tingkatJudulSub, idGrup', () => {
  it('peran tanpa sub (array kosong) -> panel kosong, nol kartu', () => {
    assert.deepEqual(susunPanel(peranSah([])), []);
    assert.equal(jumlahKartu(peranSah([])), 0);
  });

  it('input rusak -> aman', () => {
    assert.deepEqual(susunPanel(undefined), []);
    assert.deepEqual(susunPanel({}), []);
    assert.deepEqual(susunPanel({ sub: 'x' }), []);
    assert.equal(jumlahKartu(undefined), 0);
    assert.equal(jumlahKartu({ sub: [null, {}, { kartu: 'x' }] }), 0);
  });

  it('susunPanel membawa judul sub dan mengelompokkan per sub', () => {
    const panel = susunPanel(peranSah([{ judul: 'Satu', kartu: [k('A', '1'), k('B', '2')] }, { kartu: [k('C', '3')] }]));
    assert.equal(panel.length, 2);
    assert.equal(panel[0].judul, 'Satu');
    assert.equal(panel[1].judul, '');
    assert.deepEqual(panel[0].grup.map((g) => g.nama), ['A', 'B']);
  });

  it('jumlahKartu menjumlah seluruh sub', () => {
    assert.equal(jumlahKartu(peranSah([{ kartu: [k('A', '1'), k('A', '2')] }, { judul: 'x', kartu: [k('B', '3')] }])), 3);
  });

  it('tingkat judul kartu per sub: h4 di bawah subjudul h3, h3 tanpa subjudul', () => {
    assert.equal(tingkatJudulSub({ kartu: [k('A', '1')] }), 'h3');
    assert.equal(tingkatJudulSub({ judul: 'Waka', kartu: [k('A', '1')] }), 'h4');
    assert.equal(tingkatJudulSub({ judul: '', kartu: [] }), 'h3');
    assert.equal(tingkatJudulSub({ judul: '   ', kartu: [] }), 'h3');
    assert.equal(tingkatJudulSub({ judul: 5 }), 'h3');
    assert.equal(tingkatJudulSub(undefined), 'h3');
    assert.equal(tingkatJudulSub(null), 'h3');
  });

  it('panel campuran: sub bertajuk h4, sub tanpa tajuk h3, tidak saling mempengaruhi', () => {
    const panel = susunPanel(peranSah([{ kartu: [k('A', '1')] }, { judul: 'Guru BK', kartu: [k('B', '2')] }, { kartu: [k('C', '3')] }]));
    assert.deepEqual(panel.map((s) => s.tingkat), ['h3', 'h4', 'h3']);
    // Urutan judul tidak melompat: h2 panel, lalu h3 kartu langsung, lalu h3 subjudul dengan h4 kartu.
    const urutan = panel.flatMap((s) => (s.judul ? [3, 4] : [3]));
    let sebelum = 2;
    urutan.forEach((t) => {
      assert.ok(t <= sebelum + 1, `judul h${t} setelah h${sebelum}`);
      sebelum = t;
    });
  });

  it('idGrup unik untuk tiap sub dan grup', () => {
    const ids = new Set();
    for (let i = 0; i < 3; i += 1) for (let j = 0; j < 4; j += 1) ids.add(idGrup(':r1:-panel', i, j));
    assert.equal(ids.size, 12);
    assert.equal(idGrup('p', 2, 5), 'p-grup-2-5');
  });
});

describe('hitungKata dan batas deskripsi', () => {
  it('hitungKata', () => {
    assert.equal(hitungKata('satu dua  tiga\nempat'), 4);
    assert.equal(hitungKata('  '), 0);
    assert.equal(hitungKata(''), 0);
    assert.equal(hitungKata(undefined), 0);
    assert.equal(hitungKata(5), 0);
    assert.equal(hitungKata('Web + HP'), 3);
  });

  it('hitungKata: spasi ganda, tab, dan baris baru memisahkan kata (bukan membuat kata kosong)', () => {
    assert.equal(hitungKata('a  b'), 2);
    assert.equal(hitungKata('a\tb'), 2);
    assert.equal(hitungKata('a\nb'), 2);
    assert.equal(hitungKata('a \t\n b'), 2);
    assert.equal(hitungKata('\ta b\n'), 2);
  });

  it('kartuMelampauiBatas: tepat di batas lolos, satu kata lebih ditandai', () => {
    const web14 = Array(14).fill('a').join(' ');
    const mob8 = Array(8).fill('a').join(' ');
    const sah = k('A', 'sah', { deskripsi: { web: web14, mobile: mob8 } });
    const lebihWeb = k('A', 'lebihWeb', { deskripsi: { web: `${web14} a`, mobile: mob8 } });
    const lebihMob = k('A', 'lebihMob', { deskripsi: { web: web14, mobile: `${mob8} a` } });
    const hasil = kartuMelampauiBatas([peranSah([{ kartu: [sah, lebihWeb, lebihMob] }])]);
    assert.deepEqual(hasil, [
      { peran: 0, judul: 'lebihWeb', versi: 'web', kata: 15 },
      { peran: 0, judul: 'lebihMob', versi: 'mobile', kata: 9 },
    ]);
    assert.deepEqual(BATAS_KATA, { web: 14, mobile: 8 });
  });

  it('batas sebagian tetap memeriksa kedua sisi (sisi yang tidak diberikan memakai bawaan)', () => {
    const mob9 = Array(9).fill('a').join(' ');
    const kartu = k('A', 'x', { deskripsi: { web: 'a b c', mobile: mob9 } });
    // Hanya web yang diberikan: seluler tetap diperiksa terhadap bawaan 8.
    assert.deepEqual(kartuMelampauiBatas([peranSah([{ kartu: [kartu] }])], { web: 20 }), [{ peran: 0, judul: 'x', versi: 'mobile', kata: 9 }]);
    // Hanya seluler yang diberikan: web diperiksa terhadap bawaan 14.
    const web15 = Array(15).fill('a').join(' ');
    const kartu2 = k('A', 'y', { deskripsi: { web: web15, mobile: 'a' } });
    assert.deepEqual(kartuMelampauiBatas([peranSah([{ kartu: [kartu2] }])], { mobile: 99 }), [{ peran: 0, judul: 'y', versi: 'web', kata: 15 }]);
    // Batas eksplisit lebih ketat berlaku.
    assert.equal(kartuMelampauiBatas([peranSah([{ kartu: [k('A', 'z')] }])], { web: 2, mobile: 1 }).length, 2);
  });

  it('batas yang tidak sah melempar TypeError jelas', () => {
    const daftar = [peranSah([{ kartu: [k('A', 'x')] }])];
    [{ web: undefined }, { mobile: NaN }, { web: -1 }, { mobile: Infinity }, { web: '14' }, { mobile: null }].forEach((batas) => {
      assert.throws(() => kartuMelampauiBatas(daftar, batas), TypeError, JSON.stringify(batas));
    });
  });

  it('input rusak -> []', () => {
    assert.deepEqual(kartuMelampauiBatas(undefined), []);
    assert.deepEqual(kartuMelampauiBatas([null, {}, { sub: [null, {}] }]), []);
  });
});

describe('kataTerlarang', () => {
  it('menandai kata terlarang tanpa peka huruf besar', () => {
    assert.deepEqual(kataTerlarang('Kabar lewat WhatsApp'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('Tagihan SPP'), ['tagihan']);
    assert.deepEqual(kataTerlarang('jadwal ujian'), ['ujian']);
    assert.deepEqual(kataTerlarang('sekolah Anda'), ['anda']);
    assert.deepEqual(kataTerlarang('demo   GRATIS dan WHATSAPP'), ['whatsapp', 'demo gratis', 'gratis']);
  });

  it('turunan kata tertangkap: tagihannya, WhatsAppnya, jadwal ujiannya', () => {
    assert.deepEqual(kataTerlarang('Tagihannya terkirim.'), ['tagihan']);
    assert.deepEqual(kataTerlarang('lewat WhatsAppnya sekolah'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('Jadwal ujiannya disusun.'), ['ujian']);
    assert.deepEqual(kataTerlarang('tagihan-tagihan'), ['tagihan']);
  });

  it('"anda" tetap ketat: Ananda, mandala, andai lolos', () => {
    assert.deepEqual(kataTerlarang('Ananda Rizky tercatat hadir'), []);
    assert.deepEqual(kataTerlarang('mandala andai pandai'), []);
    assert.deepEqual(kataTerlarang('Anda,'), ['anda']);
    assert.deepEqual(kataTerlarang('(anda)'), ['anda']);
  });

  it('"ujian" dilarang sepenuhnya, juga pada kalimat "tanpa" atau "bukan"', () => {
    assert.deepEqual(kataTerlarang('Tanpa jadwal ujian.'), ['ujian']);
    assert.deepEqual(kataTerlarang('Ini bukan ujian.'), ['ujian']);
    assert.deepEqual(kataTerlarang('Kelas, mapel, dan ujian.'), ['ujian']);
  });

  it('pola tambahan khusus halaman Fitur: gratis, tanpa komitmen, mitra psikologi, enkripsi, PSE, UU PDP, sertifikasi', () => {
    assert.deepEqual(kataTerlarang('Konsultasi gratis'), ['gratis']);
    assert.ok(kataTerlarang('Demo gratis').includes('demo gratis'));
    assert.ok(kataTerlarang('demo-gratis').includes('demo gratis'));
    assert.ok(kataTerlarang('Demo \n gratis').includes('demo gratis'));
    assert.deepEqual(kataTerlarang('Tanpa komitmen'), ['tanpa komitmen']);
    assert.deepEqual(kataTerlarang('tanpa-komitmen'), ['tanpa komitmen']);
    assert.deepEqual(kataTerlarang('Mitra psikologi'), ['mitra psikologi']);
    assert.deepEqual(kataTerlarang('mitra-psikolog klinis'), ['mitra psikologi']);
    assert.deepEqual(kataTerlarang('Data dienkripsi'), ['enkripsi']);
    assert.deepEqual(kataTerlarang('Sudah bersertifikasi'), ['sertifikasi']);
    assert.deepEqual(kataTerlarang('Enkripsi penuh'), ['enkripsi']);
    assert.deepEqual(kataTerlarang('data terenkripsi'), ['enkripsi']);
    assert.deepEqual(kataTerlarang('Terdaftar sebagai PSE'), ['pse']);
    assert.deepEqual(kataTerlarang('sesuai UU PDP'), ['uu pdp']);
    assert.deepEqual(kataTerlarang('sesuai UU-PDP'), ['uu pdp']);
    assert.deepEqual(kataTerlarang('Sertifikasi ISO'), ['sertifikasi']);
  });

  it('karakter tak terlihat tidak bisa menyelipkan kata terlarang', () => {
    [0x00ad, 0x200b, 0x200c, 0x200d, 0x2060, 0xfeff].forEach((kode) => {
      const sisip = huruf(kode);
      assert.deepEqual(kataTerlarang(`Whats${sisip}App`), ['whatsapp'], `U+${kode.toString(16)} pada WhatsApp`);
      assert.deepEqual(kataTerlarang(`Tagi${sisip}han`), ['tagihan'], `U+${kode.toString(16)} pada Tagihan`);
      assert.deepEqual(kataTerlarang(`uji${sisip}an`), ['ujian'], `U+${kode.toString(16)} pada ujian`);
    });
  });

  it('huruf bentuk kompatibilitas dinormalkan (NFKC): lebar penuh dan ligatur', () => {
    // WhatsApp dalam huruf lebar penuh.
    const lebarPenuh = [0xff37, 0xff48, 0xff41, 0xff54, 0xff53, 0xff21, 0xff50, 0xff50].map((c) => String.fromCharCode(c)).join('');
    assert.deepEqual(kataTerlarang(lebarPenuh), ['whatsapp']);
    assert.deepEqual(kataTerlarang(`Serti${huruf(0xfb01)}kasi`), ['sertifikasi']);
  });

  it('normalisasiTeks membuang karakter tak terlihat dan menormalkan NFKC', () => {
    assert.equal(normalisasiTeks(`a${huruf(0x00ad, 0x200b, 0x200c, 0x200d, 0x2060, 0xfeff)}b`), 'ab');
    assert.equal(normalisasiTeks(huruf(0xff21, 0xff22)), 'AB');
    assert.equal(normalisasiTeks('biasa'), 'biasa');
  });

  it('teks bersih dan bukan teks -> []', () => {
    assert.deepEqual(kataTerlarang('Kehadiran dicatat lewat notifikasi di aplikasi.'), []);
    assert.deepEqual(kataTerlarang(undefined), []);
    assert.deepEqual(kataTerlarang(null), []);
    assert.deepEqual(kataTerlarang(5), []);
    assert.deepEqual(kataTerlarang(''), []);
  });
});

describe('tingkat turunan dan akordeon grup', () => {
  it('tingkatTurunan: h3 -> h4, h4 -> h5', () => {
    assert.equal(tingkatTurunan('h3'), 'h4');
    assert.equal(tingkatTurunan('h4'), 'h5');
  });

  it('hanya grup pertama pada sub pertama terbuka bawaan', () => {
    assert.equal(terbukaAwal(0, 0), true);
    assert.equal(terbukaAwal(0, 1), false);
    assert.equal(terbukaAwal(1, 0), false);
    assert.equal(terbukaAwal(2, 3), false);
  });

  it('kunci grup unik per sub dan grup', () => {
    assert.equal(kunciGrup(1, 2), '1_2');
    assert.notEqual(kunciGrup(1, 2), kunciGrup(2, 1));
  });

  it('terbukaGrup: bawaan bila belum diubah, pilihan pengguna bila ada', () => {
    assert.equal(terbukaGrup({}, 0, 0), true);
    assert.equal(terbukaGrup({}, 0, 1), false);
    assert.equal(terbukaGrup(undefined, 0, 0), true);
    assert.equal(terbukaGrup(null, 1, 0), false);
    assert.equal(terbukaGrup({ '0_0': false }, 0, 0), false);
    assert.equal(terbukaGrup({ '0_1': true }, 0, 1), true);
    // Nilai bukan boolean diabaikan; kunci bawaan objek tidak dianggap pilihan.
    assert.equal(terbukaGrup({ '0_0': 'x' }, 0, 0), true);
    assert.equal(terbukaGrup({ constructor: true }, 0, 1), false);
  });

  it('alihkanGrup membalik status tanpa mengubah peta lama', () => {
    const lama = {};
    const baru = alihkanGrup(lama, 0, 0);
    assert.deepEqual(lama, {});
    assert.equal(terbukaGrup(baru, 0, 0), false);
    assert.equal(terbukaGrup(alihkanGrup(baru, 0, 0), 0, 0), true);
    assert.equal(terbukaGrup(alihkanGrup({}, 0, 1), 0, 1), true);
    assert.equal(terbukaGrup(alihkanGrup(undefined, 2, 2), 2, 2), true);
  });

  it('mengalihkan satu grup tidak mengubah grup lain', () => {
    const peta = alihkanGrup(alihkanGrup({}, 0, 1), 1, 0);
    assert.equal(terbukaGrup(peta, 0, 0), true);
    assert.equal(terbukaGrup(peta, 0, 1), true);
    assert.equal(terbukaGrup(peta, 1, 0), true);
    assert.equal(terbukaGrup(peta, 1, 1), false);
  });
});

describe('pengecualian kata dicocokkan dengan label peran, bukan indeks tab', () => {
  const keuangan = { judul: 'Keuangan dan SPP', chip: 'segera' };
  const ujian = { judul: 'Jadwal ujian', chip: 'segera' };

  it('label peran yang dipakai pengecualian', () => {
    assert.equal(LABEL_PERAN_ADMIN, 'Admin sekolah');
    assert.equal(LABEL_PERAN_WALI, 'Wali murid');
    assert.equal(LABEL_PERAN_MURID, 'Murid');
  });

  it('tagihan: hanya kartu Keuangan dan SPP berchip segera di tab Admin sekolah', () => {
    assert.equal(bolehTagihan(keuangan, LABEL_PERAN_ADMIN), true);
    [LABEL_PERAN_WALI, LABEL_PERAN_MURID, 'Guru', 'admin sekolah', 'Admin sekolah ', 0, 2, undefined, null].forEach((l) => {
      assert.equal(bolehTagihan(keuangan, l), false, String(l));
    });
    assert.equal(bolehTagihan({ judul: 'Keuangan dan SPP' }, LABEL_PERAN_ADMIN), false);
    assert.equal(bolehTagihan({ judul: 'Keuangan dan SPP', chip: 'uji-terbatas' }, LABEL_PERAN_ADMIN), false);
    assert.equal(bolehTagihan({ judul: 'Izin', chip: 'segera' }, LABEL_PERAN_ADMIN), false);
    assert.equal(bolehTagihan(undefined, LABEL_PERAN_ADMIN), false);
    assert.equal(bolehTagihan(null, LABEL_PERAN_ADMIN), false);
  });

  it('ujian: hanya kartu Jadwal ujian berchip segera di tab Wali murid dan Murid', () => {
    assert.equal(bolehUjian(ujian, LABEL_PERAN_WALI), true);
    assert.equal(bolehUjian(ujian, LABEL_PERAN_MURID), true);
    [LABEL_PERAN_ADMIN, 'Guru', 'Guru BK', 'wali murid', 2, 3, undefined, null].forEach((l) => assert.equal(bolehUjian(ujian, l), false, String(l)));
    assert.equal(bolehUjian({ judul: 'Jadwal ujian' }, LABEL_PERAN_WALI), false);
    assert.equal(bolehUjian({ judul: 'Jadwal ujian', chip: 'uji-terbatas' }, LABEL_PERAN_WALI), false);
    assert.equal(bolehUjian({ judul: 'Jadwal mapel', chip: 'segera' }, LABEL_PERAN_WALI), false);
    assert.equal(bolehUjian({ judul: 'Jadwal ujian ', chip: 'segera' }, LABEL_PERAN_WALI), false);
    assert.equal(bolehUjian(undefined, LABEL_PERAN_WALI), false);
  });

  it('bolehKata menolak kata tanpa aturan dan nama bawaan objek', () => {
    ['whatsapp', 'gratis', 'anda', 'aman', 'constructor', '__proto__', 'toString', undefined, null, 5].forEach((kata) => {
      assert.equal(bolehKata(kata, ujian, LABEL_PERAN_WALI), false, String(kata));
      assert.equal(bolehKata(kata, keuangan, LABEL_PERAN_ADMIN), false, String(kata));
    });
  });

  it('pengecualian satu kata tidak membuka kata lain: ujian tidak membuka tagihan dan sebaliknya', () => {
    assert.equal(bolehKata('tagihan', ujian, LABEL_PERAN_WALI), false);
    assert.equal(bolehKata('ujian', keuangan, LABEL_PERAN_ADMIN), false);
  });
});

describe('validasiPeran dengan pengecualian ujian dan tagihan (berdasar label)', () => {
  const peranL = (web, sub, ekstra) => peranSah(sub, { label: { web, mobile: web }, ...ekstra });
  const kartuUjian = k('Jadwal', 'Jadwal ujian', { deskripsi: { web: 'Jadwal ujian akan tampil.', mobile: 'Jadwal ujian.' }, tag: ['Ujian'], chip: 'segera' });
  const keuangan = k('Keuangan', 'Keuangan dan SPP', { deskripsi: { web: 'Tagihan dan pembayaran SPP.', mobile: 'Tagihan SPP.' }, tag: ['Tagihan'], chip: 'segera' });

  it('ujian lolos di tab berlabel Wali murid dan Murid, di posisi tab mana pun', () => {
    assert.deepEqual(validasiPeran([peranL('Murid', [{ kartu: [kartuUjian] }]), peranL('Wali murid', [{ kartu: [kartuUjian] }])]), []);
  });

  it('ujian gagal di tab berlabel lain walau berada di indeks 2 atau 3', () => {
    const biasa = peranL('Guru', [{ kartu: [k('A', 'x')] }]);
    const m = tampung([biasa, biasa, peranL('Guru BK', [{ kartu: [kartuUjian] }]), peranL('Admin sekolah', [{ kartu: [kartuUjian] }])]);
    assert.match(m, /peran 3 .*kata terlarang "ujian"/);
    assert.match(m, /peran 4 .*kata terlarang "ujian"/);
  });

  it('ujian gagal tanpa chip segera atau pada kartu lain di tab Wali murid', () => {
    assert.match(tampung([peranL('Wali murid', [{ kartu: [{ ...kartuUjian, chip: undefined }] }])]), /kata terlarang "ujian"/);
    assert.match(tampung([peranL('Wali murid', [{ kartu: [{ ...kartuUjian, judul: 'Jadwal mapel' }] }])]), /kata terlarang "ujian"/);
  });

  it('kata terlarang lain pada kartu Jadwal ujian tetap ditolak', () => {
    const wa = { ...kartuUjian, deskripsi: { web: 'Jadwal ujian lewat WhatsApp.', mobile: 'Jadwal ujian.' } };
    const m = tampung([peranL('Wali murid', [{ kartu: [wa] }])]);
    assert.match(m, /kata terlarang "whatsapp"/);
    assert.doesNotMatch(m, /kata terlarang "ujian"/);
  });

  it('ujian di deskripsi peran (di luar kartu) tetap ditolak', () => {
    assert.match(tampung([peranL('Wali murid', [{ kartu: [kartuUjian] }], { deskripsi: { web: 'Ada ujian.', mobile: 'Ada.' } })]), /peran 1: kata terlarang "ujian"/);
  });

  it('tagihan lolos hanya di tab berlabel Admin sekolah', () => {
    assert.deepEqual(validasiPeran([peranL('Admin sekolah', [{ kartu: [keuangan] }])]), []);
    assert.match(tampung([peranL('Wali murid', [{ kartu: [keuangan] }])]), /peran 1 kartu 1 \(Keuangan dan SPP\): kata terlarang "tagihan"/);
    assert.match(tampung([peranL('Murid', [{ kartu: [keuangan] }])]), /kata terlarang "tagihan"/);
    // Kartu Keuangan di indeks 0 tetapi label lain tetap gagal.
    assert.match(tampung([peranL('Guru', [{ kartu: [keuangan] }])]), /kata terlarang "tagihan"/);
  });

  it('tagihan gagal tanpa chip segera atau pada kartu lain di tab Admin sekolah', () => {
    assert.match(tampung([peranL('Admin sekolah', [{ kartu: [{ ...keuangan, chip: undefined }] }])]), /kata terlarang "tagihan"/);
    assert.match(tampung([peranL('Admin sekolah', [{ kartu: [{ ...keuangan, judul: 'Izin' }] }])]), /kata terlarang "tagihan"/);
  });

  it('pengecualian tagihan tidak melonggarkan kata lain: Keuangan segera dengan WhatsApp tetap gagal', () => {
    const wa = { ...keuangan, deskripsi: { web: 'Tagihan lewat WhatsApp.', mobile: 'Tagihan SPP.' } };
    const m = tampung([peranL('Admin sekolah', [{ kartu: [wa] }])]);
    assert.match(m, /kata terlarang "whatsapp"/);
    assert.doesNotMatch(m, /kata terlarang "tagihan"/);
  });
});

describe('validasiPeran: tata, akordeon, tautan luar, ikon grup', () => {
  it('tata harus penuh, ringkas, atau grup', () => {
    assert.deepEqual(TATA_SAH, ['penuh', 'ringkas', 'grup']);
    ['penuh', 'ringkas'].forEach((tata) => assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', '1')] }], { tata })]), [], tata));
    ['', 'Penuh', 'grid', undefined, null, 5].forEach((tata) => {
      assert.match(tampung([peranSah([], { tata })]), /tata ".*" tidak sah/, String(tata));
    });
  });

  it('akordeon harus boolean bila ada', () => {
    assert.deepEqual(validasiPeran([peranSah([], { akordeon: true }), peranSah([], { akordeon: false })]), []);
    ['ya', 1, null].forEach((akordeon) => assert.match(tampung([peranSah([], { akordeon })]), /akordeon harus boolean/, String(akordeon)));
  });

  it('tautan luar wajib berlabel bila ada', () => {
    assert.deepEqual(validasiPeran([peranSah([], { tautanLuar: { label: 'Selengkapnya di Prakersa' } })]), []);
    [{}, { label: ' ' }, { label: 5 }].forEach((tautanLuar) => assert.match(tampung([peranSah([], { tautanLuar })]), /label tautan luar wajib/));
  });

  it('tata grup mewajibkan ikon untuk setiap nama grup pada setiap sub', () => {
    const sub = [{ kartu: [k('Kasir', '1'), k('Admin', '2'), k('Kasir', '3')] }];
    assert.match(tampung([peranSah(sub, { tata: 'grup' })]), /ikon grup "Kasir" wajib/);
    assert.match(tampung([peranSah(sub, { tata: 'grup', ikonGrup: { Kasir: () => null } })]), /ikon grup "Admin" wajib/);
    assert.match(tampung([peranSah(sub, { tata: 'grup', ikonGrup: { Kasir: 'x', Admin: () => null } })]), /ikon grup "Kasir" wajib/);
    assert.deepEqual(validasiPeran([peranSah(sub, { tata: 'grup', ikonGrup: { Kasir: () => null, Admin: () => null } })]), []);
    // Tata lain tidak butuh ikon grup.
    assert.deepEqual(validasiPeran([peranSah(sub, { tata: 'penuh' })]), []);
  });
});

describe('kumpulkanTeks', () => {
  it('mengumpulkan teks bersarang dan melewati kunci non-tampil', () => {
    const teks = kumpulkanTeks({
      judul: 'A',
      ikon: { render: () => null, displayName: 'IconX', $$typeof: Symbol.for('react.forward_ref') },
      deskripsi: { web: 'B', mobile: 'C' },
      tag: ['D', 'E'],
      chip: 'segera',
      rute: 'demo',
      href: 'https://x',
    });
    assert.deepEqual(teks.sort(), ['A', 'B', 'C', 'D', 'E']);
  });

  it('setiap kunci di KUNCI_DILEWATI dilewati, kunci lain dibaca', () => {
    assert.deepEqual([...KUNCI_DILEWATI].sort(), ['chip', 'href', 'id', 'ikon', 'rute', 'varian']);
    KUNCI_DILEWATI.forEach((kunci) => {
      assert.deepEqual(kumpulkanTeks({ [kunci]: 'rahasia', lain: 'tampil' }), ['tampil'], kunci);
      assert.deepEqual(kumpulkanTeks({ [kunci]: ['rahasia'], lain: 'tampil' }), ['tampil'], kunci);
    });
    ['judul', 'verifikasi', 'catatan', 'teks'].forEach((kunci) => {
      assert.deepEqual(kumpulkanTeks({ [kunci]: 'dibaca' }), ['dibaca'], kunci);
    });
  });

  it('teks verifikasi ikut dipindai (bukan lagi dilewati)', () => {
    assert.deepEqual(kumpulkanTeks({ verifikasi: 'Verifikasi H-2' }), ['Verifikasi H-2']);
    assert.deepEqual(kumpulkanTeks({ verifikasi: true }), []);
  });

  it('nilai bukan teks diabaikan', () => {
    assert.deepEqual(kumpulkanTeks(5), []);
    assert.deepEqual(kumpulkanTeks(null), []);
    assert.deepEqual(kumpulkanTeks(undefined), []);
    assert.deepEqual(kumpulkanTeks(() => 'x'), []);
    assert.deepEqual(kumpulkanTeks([]), []);
    assert.deepEqual(kumpulkanTeks({ $$typeof: Symbol.for('react.element'), isi: 'x' }), []);
  });
});

describe('validasiPeran: data sintetis', () => {
  it('data sah -> tanpa masalah', () => {
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', '1')] }])]), []);
  });

  it('daftar kosong atau bukan array ditolak', () => {
    assert.equal(validasiPeran([]).length, 1);
    assert.equal(validasiPeran(undefined).length, 1);
    assert.equal(validasiPeran('x').length, 1);
  });

  it('chip tidak dikenal ditolak (termasuk "berjalan")', () => {
    const m = validasiPeran([peranSah([{ kartu: [k('A', '1', { chip: 'berjalan' })] }])]);
    assert.equal(m.length, 1);
    assert.match(m[0], /chip "berjalan" tidak sah/);
    assert.equal(validasiPeran([peranSah([{ kartu: [k('A', '1', { chip: null })] }])]).length, 1);
    assert.equal(validasiPeran([peranSah([{ kartu: [k('A', '1', { chip: 'segera' }), k('A', '2', { chip: 'uji-terbatas' })] }])]).length, 0);
  });

  it('label, judul, dan deskripsi peran wajib (dua versi)', () => {
    assert.match(tampung([peranSah([], { label: { web: 'x', mobile: '' } })]), /label web dan seluler wajib/);
    assert.match(tampung([peranSah([], { label: undefined })]), /label web dan seluler wajib/);
    assert.match(tampung([peranSah([], { judul: '  ' })]), /judul wajib/);
    assert.match(tampung([peranSah([], { judul: undefined })]), /judul wajib/);
    assert.match(tampung([peranSah([], { deskripsi: { web: 'x', mobile: ' ' } })]), /deskripsi web dan seluler wajib/);
    assert.match(tampung([peranSah([], { deskripsi: undefined })]), /deskripsi web dan seluler wajib/);
  });

  it('judul, deskripsi dua versi, grup, tag, dan ikon kartu wajib', () => {
    const m = validasiPeran([
      peranSah([
        {
          kartu: [
            k('A', ''),
            k('A', 'b', { deskripsi: { web: 'x' } }),
            k('', 'c'),
            k('A', 'd', { tag: [] }),
            k('A', 'e', { tag: ['ok', ''] }),
            k('A', 'f', { ikon: undefined }),
          ],
        },
      ]),
    ]);
    assert.ok(m.some((x) => /judul wajib/.test(x)));
    assert.ok(m.some((x) => /deskripsi web dan seluler wajib/.test(x)));
    assert.ok(m.some((x) => /grup wajib/.test(x)));
    assert.equal(m.filter((x) => /tag wajib/.test(x)).length, 2);
    assert.ok(m.some((x) => /ikon wajib/.test(x)));
  });

  it('ikon harus function atau object (bukan teks, angka, null)', () => {
    ['Icon', 5, null, true].forEach((ikon) => {
      assert.match(tampung([peranSah([{ kartu: [k('A', '1', { ikon })] }])]), /ikon wajib berupa komponen/, String(ikon));
    });
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', '1', { ikon: { $$typeof: 1, render: () => null } })] }])]), []);
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', '1', { ikon: () => null })] }])]), []);
  });

  it('judul kartu ganda dalam satu peran ditolak, termasuk beda huruf dan spasi', () => {
    assert.ok(validasiPeran([peranSah([{ kartu: [k('A', 'sama'), k('B', 'sama')] }])]).some((x) => /judul kartu ganda/.test(x)));
    assert.ok(validasiPeran([peranSah([{ kartu: [k('A', 'Izin'), k('B', '  izin ')] }])]).some((x) => /judul kartu ganda/.test(x)));
    assert.ok(validasiPeran([peranSah([{ kartu: [k('A', 'Izin  murid'), k('B', 'izin murid')] }])]).some((x) => /judul kartu ganda/.test(x)));
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', 'Izin'), k('B', 'Izin murid')] }])]), []);
    // Judul yang sama pada peran berbeda boleh.
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', 'Izin')] }]), peranSah([{ kartu: [k('A', 'Izin')] }])]), []);
  });

  it('nama grup yang hanya beda huruf atau spasi ditolak (memecah satu grup)', () => {
    assert.match(tampung([peranSah([{ kartu: [k('Presensi', '1'), k('presensi ', '2')] }])]), /nama grup ganda/);
    assert.match(tampung([peranSah([{ kartu: [k('Data induk', '1'), k('Data  induk', '2')] }])]), /nama grup ganda/);
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('Presensi', '1'), k('Presensi', '2'), k('Kesiswaan', '3')] }])]), []);
  });

  it('sub tanpa kartu ditolak, sub kosong pada peran boleh', () => {
    assert.equal(validasiPeran([peranSah([])]).length, 0);
    assert.ok(validasiPeran([peranSah([{ kartu: [] }])]).some((x) => /kartu wajib/.test(x)));
    assert.ok(validasiPeran([{ ...peranSah([]), sub: undefined }]).some((x) => /sub wajib/.test(x)));
  });

  it('judul sub tidak boleh kosong bila ada, dan dipindai kata terlarangnya', () => {
    assert.match(tampung([peranSah([{ judul: '', kartu: [k('A', '1')] }])]), /judul sub tidak boleh kosong/);
    assert.match(tampung([peranSah([{ judul: '  ', kartu: [k('A', '1')] }])]), /judul sub tidak boleh kosong/);
    assert.deepEqual(validasiPeran([peranSah([{ kartu: [k('A', '1')] }])]), []);
    const m = tampung([peranSah([{ judul: 'Sub WhatsApp', kartu: [k('A', '1')] }])]);
    assert.match(m, /sub 1: kata terlarang "whatsapp" pada judul sub/);
  });

  it('catatan: teks wajib bila ada, penanda harus true atau teks, kata terlarang dipindai', () => {
    assert.match(tampung([peranSah([], { catatan: { teks: ' ' } })]), /catatan wajib bila ada/);
    assert.match(tampung([peranSah([], { catatan: {} })]), /catatan wajib bila ada/);
    assert.match(tampung([peranSah([], { catatan: { teks: 'ok', verifikasi: 5 } })]), /penanda catatan tidak sah/);
    assert.match(tampung([peranSah([], { catatan: { teks: 'ok', verifikasi: '' } })]), /penanda catatan tidak sah/);
    assert.deepEqual(validasiPeran([peranSah([], { catatan: { teks: 'ok', verifikasi: 'Verifikasi H-1' } })]), []);
    assert.deepEqual(validasiPeran([peranSah([], { catatan: { teks: 'ok', verifikasi: true } })]), []);
    assert.match(tampung([peranSah([], { catatan: { teks: 'Hubungi lewat WhatsApp' } })]), /kata terlarang "whatsapp"/);
  });

  it('penanda verifikasi peran harus true atau teks', () => {
    assert.deepEqual(validasiPeran([peranSah([], { verifikasi: 'Verifikasi H-15' })]), []);
    assert.match(tampung([peranSah([], { verifikasi: 5 })]), /penanda verifikasi peran tidak sah/);
    assert.match(tampung([peranSah([], { verifikasi: '' })]), /penanda verifikasi peran tidak sah/);
  });

  it('kata terlarang di label, judul, deskripsi peran, judul, deskripsi, tag, grup, dan verifikasi ditandai', () => {
    const peran = peranSah([
      {
        kartu: [
          k('A', 'Judul Anda'),
          k('B', 'b', { deskripsi: { web: 'kabar WhatsApp', mobile: 'x' } }),
          k('C', 'c', { tag: ['Tagihan'] }),
          k('Ujian', 'd'),
          k('E', 'e', { verifikasi: 'Verifikasi sertifikasi' }),
        ],
      },
    ]);
    peran.deskripsi = { web: 'demo gratis', mobile: 'x' };
    peran.label = { web: 'Peran PSE', mobile: 'Peran' };
    const m = tampung([peran]);
    ['"anda"', '"whatsapp"', '"tagihan"', '"ujian"', '"demo gratis"', '"pse"', '"sertifikasi"'].forEach((kata) => assert.ok(m.includes(kata), `harus menandai ${kata}`));
  });

  it('penanda verifikasi harus true atau teks', () => {
    assert.equal(validasiPeran([peranSah([{ kartu: [k('A', '1', { verifikasi: true }), k('A', '2', { verifikasi: 'H-1' })] }])]).length, 0);
    assert.ok(validasiPeran([peranSah([{ kartu: [k('A', '1', { verifikasi: 5 })] }])]).some((x) => /penanda verifikasi/.test(x)));
    assert.ok(validasiPeran([peranSah([{ kartu: [k('A', '1', { verifikasi: '' })] }])]).some((x) => /penanda verifikasi/.test(x)));
  });
});

describe('normalisasiTeks dan hitungKata dengan karakter tak terlihat', () => {
  it('bukan teks -> "" tanpa melempar', () => {
    [undefined, null, 5, {}, [], true].forEach((v) => assert.equal(normalisasiTeks(v), '', String(v)));
  });

  it('karakter format (\\p{Cf}) dibuang: ZWSP sampai RLM, embedding, pengikat tak terlihat, BOM', () => {
    [0x00ad, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x202a, 0x202e, 0x2060, 0x2062, 0x2064, 0xfeff].forEach((kode) => {
      assert.equal(normalisasiTeks(`a${huruf(kode)}b`), 'ab', `U+${kode.toString(16)}`);
    });
  });

  it('tanda gabung (\\p{M}) dibuang dan spasi Unicode (NBSP, spasi sempit) menjadi spasi biasa', () => {
    assert.equal(normalisasiTeks(`Wha${huruf(0x0336)}ts`), 'Whats');
    assert.equal(normalisasiTeks(`a${huruf(0x00a0)}b`), 'a b');
    assert.equal(normalisasiTeks(`a${huruf(0x2009)}b`), 'a b');
    assert.equal(normalisasiTeks(`a${huruf(0x3000)}b`), 'a b');
  });

  it('huruf Kiril yang menyerupai Latin dilipat (huruf besar tetap besar)', () => {
    const kiril = huruf(0x0430, 0x0435, 0x043e, 0x0440, 0x0441, 0x0443, 0x0445, 0x043a, 0x0442, 0x0455, 0x0456, 0x0458, 0x043d, 0x043c, 0x0432);
    assert.equal(normalisasiTeks(kiril), 'aeopcyxktsijhmb');
    assert.equal(normalisasiTeks(huruf(0x0410, 0x0415, 0x041e, 0x0420, 0x0421)), 'AEOPC');
    assert.equal(normalisasiTeks('Absensi QR'), 'Absensi QR');
  });

  it('hitungKata: karakter tak terlihat tidak membuat atau menghilangkan kata', () => {
    assert.equal(hitungKata(`a${huruf(0x200b)}b`), 1);
    assert.equal(hitungKata(`a ${huruf(0x200b)} b`), 2);
    assert.equal(hitungKata(huruf(0x200b, 0x00ad, 0xfeff)), 0);
    assert.equal(hitungKata(`  ${huruf(0x200b)}  `), 0);
    assert.equal(hitungKata(`a${huruf(0x00a0)}b`), 2);
  });
});

describe('kataTerlarang: normalisasi, imbuhan, spasi, homoglif, kata baru', () => {
  it('karakter format, tanda gabung, dan NBSP tidak menyembunyikan kata', () => {
    [0x200e, 0x200f, 0x202a, 0x202e, 0x2062, 0x2064].forEach((kode) => {
      assert.deepEqual(kataTerlarang(`Whats${huruf(kode)}App`), ['whatsapp'], `U+${kode.toString(16)}`);
    });
    assert.deepEqual(kataTerlarang(`Whats${huruf(0x0336)}App`), ['whatsapp']);
    assert.ok(kataTerlarang(`demo${huruf(0x00a0)}gratis`).includes('demo gratis'));
    assert.deepEqual(kataTerlarang(`tanpa${huruf(0x00a0)}komitmen`), ['tanpa komitmen']);
  });

  it('homoglif Kiril ditangkap', () => {
    const a = huruf(0x0430);
    const e = huruf(0x0435);
    assert.deepEqual(kataTerlarang(`Wh${a}ts${a}pp`), ['whatsapp']);
    assert.deepEqual(kataTerlarang(`t${a}gih${a}n`), ['tagihan']);
    assert.deepEqual(kataTerlarang(`${huruf(0x0455)}${e}rtifikasi`), ['sertifikasi']);
    assert.deepEqual(kataTerlarang(`${huruf(0x0410)}nda`), ['anda']);
    assert.deepEqual(kataTerlarang(`${huruf(0x043c)}itr${a} psikologi`), ['mitra psikologi']);
  });

  it('spasi, tanda hubung, garis bawah, dan titik di tengah kata ditangkap (pola padat)', () => {
    assert.deepEqual(kataTerlarang('Whats App'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('Whats-App'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('W h a t s A p p'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('W.h.a.t.s.A.p.p'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('jadwal_ujian'), ['ujian']);
    assert.deepEqual(kataTerlarang('u j i a n'), ['ujian']);
    assert.deepEqual(kataTerlarang('Tagi han'), ['tagihan']);
    assert.ok(kataTerlarang('d e m o  g r a t i s').includes('demo gratis'));
    assert.deepEqual(kataTerlarang('l o k a s i   s e r v e r'), ['lokasi server']);
  });

  it('imbuhan tertangkap: tagihannya, ditagihkan, penagihan, pengujian, digratiskan, gratisan, jadwal ujiannya', () => {
    assert.deepEqual(kataTerlarang('tagihannya'), ['tagihan']);
    assert.deepEqual(kataTerlarang('ditagihkan'), ['tagihan']);
    assert.deepEqual(kataTerlarang('penagihan'), ['tagihan']);
    assert.deepEqual(kataTerlarang('menagih'), ['tagihan']);
    assert.deepEqual(kataTerlarang('pengujian'), ['ujian']);
    assert.deepEqual(kataTerlarang('jadwal ujiannya'), ['ujian']);
    assert.deepEqual(kataTerlarang('digratiskan'), ['gratis']);
    assert.deepEqual(kataTerlarang('gratisan'), ['gratis']);
    assert.deepEqual(kataTerlarang('WhatsAppnya'), ['whatsapp']);
    assert.deepEqual(kataTerlarang('enkripsi'), ['enkripsi']);
    assert.deepEqual(kataTerlarang('terenkripsi'), ['enkripsi']);
    assert.deepEqual(kataTerlarang('rekomendasinya'), ['rekomendasi']);
  });

  it('kata baru dari naskah: aman (kata utuh), lokasi server, rekomendasi, peringatan dini', () => {
    assert.deepEqual(kataTerlarang('Data dijamin aman.'), ['aman']);
    assert.deepEqual(kataTerlarang('AMAN'), ['aman']);
    assert.deepEqual(kataTerlarang('Lokasi server di Indonesia'), ['lokasi server']);
    assert.deepEqual(kataTerlarang('lokasi-server'), ['lokasi server']);
    assert.deepEqual(kataTerlarang('Rekomendasi industri'), ['rekomendasi']);
    assert.deepEqual(kataTerlarang('Peringatan dini'), ['peringatan dini']);
    assert.deepEqual(kataTerlarang('peringatan-dini'), ['peringatan dini']);
  });

  it('bukan kata terlarang: keamanan, amanah, penanda dini, saran, Ananda, mandala, andai', () => {
    [
      'Lihat keamanan data',
      'Akses sesuai peran, data tiap sekolah terpisah',
      'amanah',
      'Dasbor kesiapan dan penanda dini',
      'Saran industri untuk tiap murid',
      'Ananda Rizky tercatat hadir',
      'mandala andai pandai',
      'Kehadiran dicatat lewat notifikasi di aplikasi.',
      'Pegawai yang berhenti diberi status nonaktif beserta alasannya.',
      'Data tiap sekolah terpisah dari sekolah lain.',
      'Sandi awal wajib diganti.',
      'Guru akan melihat penanda dari nilai dan kehadiran.',
    ].forEach((teks) => assert.deepEqual(kataTerlarang(teks), [], teks));
  });

  it('"pse" huruf kecil dan besar sama-sama ditangkap, tetapi hanya sebagai kata utuh', () => {
    assert.deepEqual(kataTerlarang('terdaftar pse'), ['pse']);
    assert.deepEqual(kataTerlarang('terdaftar PSE'), ['pse']);
    assert.deepEqual(kataTerlarang('pseudo'), []);
    assert.deepEqual(kataTerlarang('Lipsey'), []);
  });
});

describe('validasiPeran: teks yang dipindai', () => {
  const ujiPeran = (ekstra) => peranSah([{ kartu: [k('A', 'x')] }], ekstra);

  it('deskripsi seluler kartu dipindai (bukan hanya web)', () => {
    const m = tampung([peranSah([{ kartu: [k('A', 'x', { deskripsi: { web: 'Aman sentosa tanpa kata.', mobile: 'Lewat WhatsApp.' } })] }])]);
    assert.match(m, /kata terlarang "whatsapp" pada "Lewat WhatsApp\."/);
  });

  it('judul peran, verifikasi peran, dan label tautan luar dipindai', () => {
    assert.match(tampung([ujiPeran({ judul: 'Kirim lewat WhatsApp.' })]), /peran 1: kata terlarang "whatsapp"/);
    assert.match(tampung([ujiPeran({ verifikasi: 'Verifikasi gratis' })]), /peran 1: kata terlarang "gratis"/);
    assert.match(tampung([ujiPeran({ tautanLuar: { label: 'Hubungi via WhatsApp' } })]), /peran 1: kata terlarang "whatsapp" pada "Hubungi via WhatsApp"/);
    assert.match(tampung([ujiPeran({ label: { web: 'Peran aman', mobile: 'Peran' } })]), /peran 1: kata terlarang "aman"/);
  });

  it('teks verifikasi kartu dan catatan dipindai', () => {
    assert.match(tampung([peranSah([{ kartu: [k('A', 'x', { verifikasi: 'Verifikasi sertifikasi' })] }])]), /kata terlarang "sertifikasi"/);
    assert.match(tampung([ujiPeran({ catatan: { teks: 'ok', verifikasi: 'Verifikasi enkripsi' } })]), /kata terlarang "enkripsi"/);
  });

  it('peran yang sub-nya bukan array tetap dipindai teksnya', () => {
    const m = tampung([{ ...peranSah([]), sub: undefined, judul: 'Lewat WhatsApp', tautanLuar: { label: 'Cek gratis' } }]);
    assert.match(m, /sub wajib berupa array/);
    assert.match(m, /kata terlarang "whatsapp"/);
    assert.match(m, /kata terlarang "gratis"/);
  });

  it('nomor peran pada pesan mengikuti urutan beberapa peran', () => {
    const m = tampung([ujiPeran(), ujiPeran({ judul: 'Dengan WhatsApp' }), ujiPeran()]);
    assert.match(m, /peran 2: kata terlarang "whatsapp"/);
    assert.doesNotMatch(m, /peran 1:/);
    assert.doesNotMatch(m, /peran 3:/);
  });

  it('"pse" huruf kecil pada teks kartu ditandai', () => {
    assert.match(tampung([peranSah([{ kartu: [k('A', 'x', { deskripsi: { web: 'terdaftar pse resmi', mobile: 'ok' } })] }])]), /kata terlarang "pse"/);
  });
});

describe('validasiPeran: ikon grup, normalisasi pembanding, teks kosong tak terlihat', () => {
  const grupSub = (nama) => [{ kartu: [k(nama, '1')] }];

  it('nama grup bawaan objek (constructor, toString, __proto__, hasOwnProperty) tidak lolos tanpa ikon sendiri', () => {
    ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf'].forEach((nama) => {
      assert.match(tampung([peranSah(grupSub(nama), { tata: 'grup', ikonGrup: {} })]), new RegExp(`ikon grup "${nama}" wajib`), nama);
      assert.match(tampung([peranSah(grupSub(nama), { tata: 'grup' })]), new RegExp(`ikon grup "${nama}" wajib`), nama);
    });
    assert.deepEqual(validasiPeran([peranSah(grupSub('constructor'), { tata: 'grup', ikonGrup: { constructor: () => null } })]), []);
  });

  it('judul ganda dan nama grup ganda yang hanya beda karakter tak terlihat tertangkap', () => {
    const zw = huruf(0x200b);
    assert.match(tampung([peranSah([{ kartu: [k('A', 'Izin'), k('B', `Iz${zw}in`)] }])]), /judul kartu ganda/);
    assert.match(tampung([peranSah([{ kartu: [k('Presensi', '1'), k(`Pre${zw}sensi`, '2')] }])]), /nama grup ganda/);
    assert.match(tampung([peranSah([{ kartu: [k('A', 'Izin'), k('B', `Izin${huruf(0x00a0)}`)] }])]), /judul kartu ganda/);
  });

  it('teks yang hanya berisi karakter tak terlihat dianggap kosong', () => {
    const zw = huruf(0x200b, 0x00ad, 0xfeff);
    assert.match(tampung([peranSah([{ kartu: [k('A', zw)] }])]), /judul wajib/);
    assert.match(tampung([peranSah([{ kartu: [k(zw, '1')] }])]), /grup wajib/);
    assert.match(tampung([peranSah([{ kartu: [k('A', '1', { tag: [zw] })] }])]), /tag wajib/);
    assert.match(tampung([peranSah([], { judul: zw })]), /judul wajib/);
    assert.match(tampung([peranSah([], { tautanLuar: { label: zw } })]), /label tautan luar wajib/);
    assert.match(tampung([peranSah([], { deskripsi: { web: 'x', mobile: zw } })]), /deskripsi web dan seluler wajib/);
  });
});

describe('pembantu akordeon dan tingkat: indeks bilangan, peta tidak sah, pemetaan eksplisit', () => {
  it('tingkatTurunan: pemetaan eksplisit dan nilai tak dikenal -> null', () => {
    assert.equal(tingkatTurunan('h2'), 'h3');
    assert.equal(tingkatTurunan('h3'), 'h4');
    assert.equal(tingkatTurunan('h4'), 'h5');
    assert.equal(tingkatTurunan('h5'), 'h6');
    [undefined, null, 'h6', 'h1', 'H3', '', 'div', 3, 'toString', '__proto__', 'constructor'].forEach((v) => assert.equal(tingkatTurunan(v), null, String(v)));
  });

  it('kunci grup konsisten untuk string dan angka', () => {
    assert.equal(kunciGrup('0', '1'), '0_1');
    assert.equal(kunciGrup(0, 1), '0_1');
    assert.equal(kunciGrup(1.0, '2'), '1_2');
    assert.equal(kunciGrup('01', '02'), '1_2');
    assert.equal(kunciGrup(' 3 ', '4'), '3_4');
    assert.equal(terbukaAwal('00', '0'), true);
    assert.equal(terbukaGrup({ '1_2': true }, '01', '02'), true);
    assert.equal(terbukaAwal('0', '0'), true);
    assert.equal(terbukaAwal('0', 0), true);
    assert.equal(terbukaAwal(0, '1'), false);
    assert.equal(terbukaGrup({ '0_0': false }, '0', '0'), false);
    assert.equal(terbukaGrup({}, '0', '0'), true);
    assert.equal(terbukaGrup(alihkanGrup({}, '1', '1'), 1, 1), true);
  });

  it('peta yang bukan objek biasa diperlakukan kosong dan ditolak', () => {
    [null, undefined, [], ['0_0'], 'abc', 5, true, new Date(0), new Map()].forEach((peta) => {
      assert.equal(terbukaGrup(peta, 0, 0), true, `terbukaGrup ${String(peta)}`);
      assert.equal(terbukaGrup(peta, 0, 1), false, `terbukaGrup ${String(peta)}`);
      const baru = alihkanGrup(peta, 0, 0);
      assert.equal(Object.prototype.toString.call(baru), '[object Object]');
      assert.deepEqual(baru, { '0_0': false });
    });
  });

  it('alihkanGrup tidak membawa kunci peta tidak sah dan tidak mengubah peta lama', () => {
    const lama = { '0_0': true, '1_1': false };
    const baru = alihkanGrup(lama, 1, 1);
    assert.deepEqual(lama, { '0_0': true, '1_1': false });
    assert.deepEqual(baru, { '0_0': true, '1_1': true });
    assert.deepEqual(alihkanGrup('abc', 0, 0), { '0_0': false });
  });
});

describe('kartuMelampauiBatas: batas bukan objek melempar TypeError', () => {
  const daftar = [peranSah([{ kartu: [k('A', 'x')] }])];

  it('angka, null, array, teks, dan fungsi ditolak', () => {
    [10, null, [], [14, 8], '10', true, () => ({ web: 1, mobile: 1 })].forEach((batas) => {
      assert.throws(() => kartuMelampauiBatas(daftar, batas), TypeError, String(batas));
    });
  });

  it('undefined memakai bawaan; objek biasa diterima', () => {
    assert.deepEqual(kartuMelampauiBatas(daftar, undefined), []);
    assert.deepEqual(kartuMelampauiBatas(daftar, {}), []);
    assert.deepEqual(kartuMelampauiBatas(daftar, { web: 14, mobile: 8 }), []);
  });
});
