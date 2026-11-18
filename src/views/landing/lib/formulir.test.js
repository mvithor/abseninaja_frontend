// Tes logika murni formulir konversi landing (lib/formulir.js).
// Jalankan: node --test src/views/landing/lib/
// Runner bawaan Node (node:test), tanpa dependensi tambahan.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bersihkan,
  buatIdKirim,
  emailValid,
  jebakanTerisi,
  nilaiAwal,
  normalisasiWhatsapp,
  siapkanKirim,
  susunPayload,
  validasi,
} from './formulir.js';
import { KOLOM_JEBAKAN, PESAN_GALAT, SKEMA } from '../data/formulir.js';

// ---------------------------------------------------------------------------
// Bantuan
// ---------------------------------------------------------------------------

const DEMO_VALID = {
  nama: '  Budi   Santoso ',
  jabatan: 'kepala-sekolah',
  jenisSekolah: 'smk-mak',
  sekolah: 'SMKN 1 Contoh',
  kota: 'Bandar Lampung',
  jumlahMurid: '200-500',
  whatsapp: '0812-3456-7890',
  [KOLOM_JEBAKAN]: '',
};

const DEMO_PAYLOAD = {
  nama: 'Budi Santoso',
  jabatan: 'kepala-sekolah',
  jenisSekolah: 'smk-mak',
  sekolah: 'SMKN 1 Contoh',
  kota: 'Bandar Lampung',
  jumlahMurid: '200-500',
  whatsapp: '6281234567890',
};

const GURU_VALID = {
  nama: 'Siti Aminah',
  sekolah: 'MTsN 2 Pesawaran',
  mapel: 'Matematika',
  email: '  Siti.Aminah@Guru.Example.ID ',
  whatsapp: '',
  [KOLOM_JEBAKAN]: '',
};

const GURU_PAYLOAD = {
  nama: 'Siti Aminah',
  sekolah: 'MTsN 2 Pesawaran',
  mapel: 'Matematika',
  email: 'siti.aminah@guru.example.id',
};

const SEMUA_JENIS = ['demo', 'guru'];

const namaKolom = (jenis) => SKEMA[jenis].map((k) => k.nama);
const namaWajib = (jenis) => SKEMA[jenis].filter((k) => k.wajib).map((k) => k.nama);

// Waktu eksekusi (ms) satu panggilan, setelah pemanasan agar tidak terkecoh JIT.
function ukurMs(fn) {
  fn();
  const mulai = performance.now();
  fn();
  return performance.now() - mulai;
}

const BATAS_MS = 50;

// ---------------------------------------------------------------------------
// Skema (pengaman asumsi tes lain)
// ---------------------------------------------------------------------------

describe('skema formulir', () => {
  it('punya dua jenis: demo dan guru', () => {
    assert.deepEqual(Object.keys(SKEMA).sort(), ['demo', 'guru']);
  });

  it('kolom jebakan bernama netral (hp_k7x2) dan bukan bagian skema mana pun', () => {
    assert.equal(KOLOM_JEBAKAN, 'hp_k7x2');
    for (const kata of ['situs', 'website', 'url', 'email', 'telepon', 'nama', 'alamat', 'perusahaan']) {
      assert.ok(!KOLOM_JEBAKAN.toLowerCase().includes(kata), kata);
    }
    for (const jenis of SEMUA_JENIS) assert.ok(!namaKolom(jenis).includes(KOLOM_JEBAKAN));
  });

  it('urutan kolom demo dan guru sesuai desain', () => {
    assert.deepEqual(namaKolom('demo'), ['nama', 'jabatan', 'jenisSekolah', 'sekolah', 'kota', 'jumlahMurid', 'whatsapp']);
    assert.deepEqual(namaKolom('guru'), ['nama', 'sekolah', 'mapel', 'email', 'whatsapp']);
  });
});

// ---------------------------------------------------------------------------
// bersihkan
// ---------------------------------------------------------------------------

describe('bersihkan', () => {
  it('memangkas spasi di awal dan akhir', () => {
    assert.equal(bersihkan('  halo  '), 'halo');
  });

  it('menggabungkan spasi berulang menjadi satu', () => {
    assert.equal(bersihkan('Budi    Santoso   Putra'), 'Budi Santoso Putra');
  });

  it('memperlakukan tab, baris baru, dan NBSP sebagai spasi', () => {
    assert.equal(bersihkan('a\tb\nc\r\nd e'), 'a b c d e');
  });

  it('membuang karakter kendali', () => {
    assert.equal(bersihkan('a\u0000b\u0007c\u007fd'), 'abcd');
  });

  it('string kosong dan hanya spasi menjadi string kosong', () => {
    assert.equal(bersihkan(''), '');
    assert.equal(bersihkan('     '), '');
    assert.equal(bersihkan(' \t\n\r  '), '');
  });

  it('nilai bukan teks menjadi string kosong', () => {
    for (const v of [undefined, null, 0, 123, true, {}, [], ['a']]) assert.equal(bersihkan(v), '');
  });

  it('mempertahankan huruf Unicode dan tanda baca', () => {
    assert.equal(bersihkan("  Ma'had Al-Zaytun, Ibnu Sīnā  "), "Ma'had Al-Zaytun, Ibnu Sīnā");
  });

  it('linear: 10.000 karakter selesai cepat', () => {
    const masukan = ' a '.repeat(3400);
    assert.ok(ukurMs(() => bersihkan(masukan)) < BATAS_MS);
  });
});

// ---------------------------------------------------------------------------
// normalisasiWhatsapp
// ---------------------------------------------------------------------------

describe('normalisasiWhatsapp: nomor valid', () => {
  const kasus = [
    ['08123456789', '628123456789'],
    ['0812-3456-7890', '6281234567890'],
    ['+62 812 3456 7890', '6281234567890'],
    ['+6281234567890', '6281234567890'],
    ['6281234567890', '6281234567890'],
    ['62 812-3456-7890', '6281234567890'],
    ['(0812) 3456.7890', '6281234567890'],
    ['  08123456789  ', '628123456789'],
    ['0812 3456 7890', '6281234567890'],
    ['+62(812)3456-7890', '6281234567890'],
  ];
  for (const [masuk, harapan] of kasus) {
    it(`"${masuk}" menjadi ${harapan}`, () => {
      assert.equal(normalisasiWhatsapp(masuk), harapan);
    });
  }

  it('semua hasil valid diawali 628', () => {
    for (const [masuk] of kasus) assert.ok(normalisasiWhatsapp(masuk).startsWith('628'), masuk);
  });

  it('batas bawah: 9 digit setelah 62 diterima', () => {
    assert.equal(normalisasiWhatsapp('0812345678'), '62812345678');
    assert.equal(normalisasiWhatsapp('62812345678'), '62812345678');
  });

  it('batas atas: 13 digit setelah 62 diterima', () => {
    assert.equal(normalisasiWhatsapp('08123456789012'), '628123456789012');
    assert.equal(normalisasiWhatsapp('628123456789012'), '628123456789012');
  });
});

describe('normalisasiWhatsapp: nomor tidak valid', () => {
  const kasus = [
    ['pendek tanpa awalan', '12345'],
    ['awalan 07 (bukan seluler 08)', '07123456789'],
    ['awalan 0712 sepuluh digit', '0712345678'],
    ['huruf saja', 'abcdefghij'],
    ['huruf di tengah', '0812abc3456789'],
    ['huruf di akhir', '08123456789x'],
    ['terlalu panjang: 14 digit setelah 62', '081234567890123'],
    ['terlalu panjang dengan 62: 14 digit', '6281234567890123'],
    ['terlalu pendek: 8 digit setelah 62', '081234567'],
    ['terlalu pendek: 7 digit setelah 62', '08123456'],
    ['+6281234 terlalu pendek', '+6281234'],
    ['6281234 terlalu pendek', '6281234'],
    ['+62 812 34', '+62 812 34'],
    ['string kosong', ''],
    ['spasi saja', '     '],
    ['tab dan baris baru saja', '\t\n'],
    ['plus tanpa 62', '+8123456789012'],
    ['plus dengan awalan 0', '+08123456789'],
    ['plus di tengah', '0812+3456789'],
    ['plus ganda', '++628123456789'],
    ['setelah 62 bukan 8', '627123456789'],
    ['setelah 62 muncul dua nol', '6200812345678'],
    ['awalan 00 tanpa 62', '00812345678'],
    ['plus dengan 0062', '+0062812345678'],
    ['simbol tidak dikenal', '0812*3456789'],
    ['garis miring', '0812/3456789'],
    ['digit lebar penuh', '０８１２３４５６７８９'],
    ['awalan 8 tanpa 0 atau 62', '8123456789'],
  ];
  for (const [nama, masuk] of kasus) {
    it(`menolak: ${nama}`, () => {
      assert.equal(normalisasiWhatsapp(masuk), null);
    });
  }

  it('menolak masukan mentah lebih dari 30 karakter', () => {
    assert.equal(normalisasiWhatsapp('0812' + '-'.repeat(27)), null);
    assert.equal(normalisasiWhatsapp('08123456789' + ' '.repeat(40) + '1'), null);
  });

  it('menolak nilai bukan teks', () => {
    for (const v of [undefined, null, 8123456789, 628123456789, {}, []]) assert.equal(normalisasiWhatsapp(v), null);
  });

  it('10.000 karakter ditolak cepat', () => {
    const panjang = '0'.repeat(10000);
    assert.equal(normalisasiWhatsapp(panjang), null);
    assert.ok(ukurMs(() => normalisasiWhatsapp(panjang)) < BATAS_MS);
  });
});

// ---------------------------------------------------------------------------
// emailValid
// ---------------------------------------------------------------------------

describe('emailValid', () => {
  it('menerima alamat yang lazim', () => {
    for (const e of [
      'budi@sekolah.sch.id',
      'siti.aminah@guru.example.id',
      'a+tag@contoh.co',
      'x_y-z@mail.contoh.com',
      'Budi@Sekolah.ID',
      'a@b.co',
      'nama123@sub-domain.contoh.org',
    ]) {
      assert.equal(emailValid(e), true, e);
    }
  });

  it('menolak tanpa @', () => {
    assert.equal(emailValid('budi.sekolah.id'), false);
    assert.equal(emailValid('budisekolah'), false);
  });

  it('menolak dua @', () => {
    assert.equal(emailValid('budi@@sekolah.id'), false);
    assert.equal(emailValid('bu@di@sekolah.id'), false);
  });

  it('menolak tanpa titik di domain', () => {
    assert.equal(emailValid('budi@sekolah'), false);
    assert.equal(emailValid('budi@localhost'), false);
  });

  it('menolak bagian lokal atau domain kosong', () => {
    assert.equal(emailValid('@sekolah.id'), false);
    assert.equal(emailValid('budi@'), false);
    assert.equal(emailValid('budi@.id'), false);
  });

  it('menolak titik di tepi atau titik ganda', () => {
    for (const e of ['.budi@sekolah.id', 'budi.@sekolah.id', 'bu..di@sekolah.id', 'budi@sekolah..id', 'budi@sekolah.id.', 'budi@.sekolah.id']) {
      assert.equal(emailValid(e), false, e);
    }
  });

  it('menolak spasi dan karakter kendali di dalam alamat', () => {
    for (const e of ['bu di@sekolah.id', 'budi@seko lah.id', 'budi@sekolah .id', 'budi@sekolah.id x', 'bu\tdi@sekolah.id', 'bu\ndi@sekolah.id', 'bu\u0000di@sekolah.id']) {
      assert.equal(emailValid(e), false, JSON.stringify(e));
    }
  });

  it('menolak TLD satu huruf dan label domain berawalan atau berakhiran tanda hubung', () => {
    assert.equal(emailValid('budi@sekolah.i'), false);
    assert.equal(emailValid('budi@-sekolah.id'), false);
    assert.equal(emailValid('budi@sekolah-.id'), false);
  });

  it('menolak yang terlalu pendek (kurang dari 5 karakter)', () => {
    assert.equal(emailValid('a@b.'), false);
    assert.equal(emailValid('a@b'), false);
    assert.equal(emailValid(''), false);
  });

  it('menolak bagian lokal lebih dari 64 karakter, menerima tepat 64', () => {
    assert.equal(emailValid(`${'a'.repeat(64)}@sekolah.id`), true);
    assert.equal(emailValid(`${'a'.repeat(65)}@sekolah.id`), false);
  });

  it('menolak total lebih dari 254 karakter, menerima tepat 254', () => {
    const domain254 = `${'b'.repeat(185)}.com`; // 64 + 1 + 189 = 254
    assert.equal(emailValid(`${'a'.repeat(64)}@${domain254}`), true);
    assert.equal(emailValid(`${'a'.repeat(64)}@b${domain254}`), false);
  });

  it('menolak nilai bukan teks', () => {
    for (const v of [undefined, null, 123, {}, []]) assert.equal(emailValid(v), false);
  });

  it('memangkas spasi tepi sebelum memeriksa', () => {
    assert.equal(emailValid('  budi@sekolah.id  '), true);
  });

  describe('bebas ReDoS: masukan sangat panjang selesai di bawah 50 ms', () => {
    const bentuk = {
      'huruf a 10.000': 'a'.repeat(10000),
      'a@ + a. berulang': `a@${'a.'.repeat(5000)}`,
      'banyak @': '@'.repeat(10000),
      'titik berulang': `a@${'.'.repeat(10000)}`,
      'spasi berulang': `a${' '.repeat(10000)}@b.co`,
      'tanda hubung berulang': `a@${'-'.repeat(10000)}.com`,
      'sebagian valid lalu rusak': `${'a'.repeat(4000)}@${'b.'.repeat(3000)}!`,
    };
    for (const [nama, masukan] of Object.entries(bentuk)) {
      it(nama, () => {
        assert.ok(masukan.length >= 10000 || nama.startsWith('a@') || nama.startsWith('sebagian'), 'panjang masukan terlalu pendek');
        assert.equal(emailValid(masukan), false);
        const ms = ukurMs(() => emailValid(masukan));
        assert.ok(ms < BATAS_MS, `${nama}: ${ms.toFixed(2)} ms`);
      });
    }

    it('validasi penuh (bersihkan + emailValid) untuk email 10.000 karakter', () => {
      const nilai = { ...GURU_VALID, email: `${'a'.repeat(9990)}@b.co` };
      const hasil = validasi('guru', nilai);
      assert.equal(hasil.valid, false);
      assert.equal(hasil.galat.email, PESAN_GALAT.terlaluPanjang('Email', 254));
      assert.ok(ukurMs(() => validasi('guru', nilai)) < BATAS_MS);
    });
  });
});

// ---------------------------------------------------------------------------
// nilaiAwal
// ---------------------------------------------------------------------------

describe('nilaiAwal', () => {
  it('memuat semua kolom skema plus kolom jebakan, semua teks', () => {
    for (const jenis of SEMUA_JENIS) {
      const awal = nilaiAwal(jenis);
      assert.deepEqual(Object.keys(awal).sort(), [...namaKolom(jenis), KOLOM_JEBAKAN].sort());
      for (const v of Object.values(awal)) assert.equal(typeof v, 'string');
    }
  });

  it('memakai nilai awal skema dan string kosong untuk lainnya', () => {
    const awal = nilaiAwal('demo');
    assert.equal(awal.jenisSekolah, 'umum');
    assert.equal(awal.nama, '');
    assert.equal(awal.jabatan, '');
    assert.equal(awal[KOLOM_JEBAKAN], '');
  });

  it('jenis guru tidak punya kolom khusus demo', () => {
    const awal = nilaiAwal('guru');
    for (const k of ['jabatan', 'jenisSekolah', 'kota', 'jumlahMurid']) assert.ok(!(k in awal), k);
  });

  it('mengembalikan objek baru tiap panggilan', () => {
    const a = nilaiAwal('demo');
    a.nama = 'diubah';
    assert.equal(nilaiAwal('demo').nama, '');
  });

  it('jenis tidak dikenal melempar galat', () => {
    assert.throws(() => nilaiAwal('lainnya'), /Jenis formulir tidak dikenal: lainnya/);
    assert.throws(() => nilaiAwal(undefined), /Jenis formulir tidak dikenal/);
  });
});

// ---------------------------------------------------------------------------
// validasi
// ---------------------------------------------------------------------------

describe('validasi: kolom wajib', () => {
  it('demo: formulir kosong menandai semua kolom wajib, sesuai urutan skema', () => {
    const hasil = validasi('demo', nilaiAwal('demo'));
    assert.equal(hasil.valid, false);
    // jenisSekolah sudah punya nilai awal "umum", jadi tidak bergalat.
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'jabatan', 'sekolah', 'kota', 'whatsapp']);
    assert.equal(hasil.galat.nama, 'Nama lengkap wajib diisi.');
    assert.equal(hasil.galat.jabatan, 'Jabatan wajib dipilih.');
    assert.equal(hasil.galat.sekolah, 'Nama sekolah wajib diisi.');
    assert.equal(hasil.galat.kota, 'Kota wajib diisi.');
    assert.equal(hasil.galat.whatsapp, 'Nomor WhatsApp wajib diisi.');
    assert.equal(hasil.kolomPertama, 'nama');
  });

  it('demo: objek kosong menandai semua kolom wajib termasuk jenisSekolah', () => {
    const hasil = validasi('demo', {});
    assert.deepEqual(Object.keys(hasil.galat), namaWajib('demo'));
    assert.equal(hasil.galat.jenisSekolah, 'Jenis sekolah wajib dipilih.');
  });

  it('guru: formulir kosong menandai nama, sekolah, mapel, email; whatsapp opsional', () => {
    const hasil = validasi('guru', nilaiAwal('guru'));
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'sekolah', 'mapel', 'email']);
    assert.equal(hasil.galat.email, 'Email wajib diisi.');
    assert.equal(hasil.galat.mapel, 'Mata pelajaran wajib diisi.');
    assert.ok(!('whatsapp' in hasil.galat));
  });

  it('nilai undefined, null, atau tanpa isian diperlakukan sebagai kosong', () => {
    for (const jenis of SEMUA_JENIS) {
      for (const nilai of [undefined, null, {}]) {
        const hasil = validasi(jenis, nilai);
        assert.equal(hasil.valid, false);
        assert.deepEqual(Object.keys(hasil.galat), namaWajib(jenis));
      }
    }
  });

  it('kolom yang hanya berisi spasi, tab, atau NBSP ditolak', () => {
    for (const kosong of ['   ', '\t\t', ' \n ', '  ']) {
      const demo = { ...DEMO_VALID, nama: kosong, sekolah: kosong, kota: kosong, whatsapp: kosong };
      const hasil = validasi('demo', demo);
      assert.equal(hasil.valid, false, JSON.stringify(kosong));
      assert.equal(hasil.galat.nama, 'Nama lengkap wajib diisi.');
      assert.equal(hasil.galat.sekolah, 'Nama sekolah wajib diisi.');
      assert.equal(hasil.galat.kota, 'Kota wajib diisi.');
      assert.equal(hasil.galat.whatsapp, 'Nomor WhatsApp wajib diisi.');
    }
  });

  it('select wajib hanya berisi spasi dianggap belum dipilih', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, jabatan: '   ' });
    assert.equal(hasil.galat.jabatan, 'Jabatan wajib dipilih.');
  });

  it('nilai bukan teks pada kolom wajib dianggap kosong', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, nama: 123, sekolah: ['x'], kota: {} });
    assert.equal(hasil.galat.nama, 'Nama lengkap wajib diisi.');
    assert.equal(hasil.galat.sekolah, 'Nama sekolah wajib diisi.');
    assert.equal(hasil.galat.kota, 'Kota wajib diisi.');
  });
});

describe('validasi: batas panjang', () => {
  it('teks tepat pada batas diterima, satu karakter lebih ditolak', () => {
    const batas = { nama: 100, sekolah: 150, kota: 100 };
    for (const [kolom, maks] of Object.entries(batas)) {
      const ok = validasi('demo', { ...DEMO_VALID, [kolom]: 'a'.repeat(maks) });
      assert.equal(ok.valid, true, `${kolom} ${maks}`);
      const lebih = validasi('demo', { ...DEMO_VALID, [kolom]: 'a'.repeat(maks + 1) });
      assert.equal(lebih.valid, false, `${kolom} ${maks + 1}`);
      assert.equal(lebih.galat[kolom], PESAN_GALAT.terlaluPanjang(SKEMA.demo.find((k) => k.nama === kolom).label, maks));
    }
  });

  it('pesan batas panjang berpola "<label> maksimal N karakter."', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, nama: 'a'.repeat(101) });
    assert.equal(hasil.galat.nama, 'Nama lengkap maksimal 100 karakter.');
  });

  it('panjang dihitung setelah dipangkas dan spasi digabung', () => {
    const berspasi = `   ${'a'.repeat(100)}   `;
    assert.equal(validasi('demo', { ...DEMO_VALID, nama: berspasi }).valid, true);
    const gandaan = `${'a'.repeat(50)}${' '.repeat(30)}${'b'.repeat(49)}`; // 50 + 1 + 49 = 100 setelah dibersihkan
    assert.equal(validasi('demo', { ...DEMO_VALID, nama: gandaan }).valid, true);
  });

  it('email dibatasi 254 karakter; di atas itu galatnya soal panjang', () => {
    const hasil = validasi('guru', { ...GURU_VALID, email: `${'a'.repeat(64)}@${'b'.repeat(190)}.com` });
    assert.equal(hasil.galat.email, 'Email maksimal 254 karakter.');
  });

  it('email di bawah batas tetapi tidak sah memakai pesan email', () => {
    const hasil = validasi('guru', { ...GURU_VALID, email: 'bukan-email' });
    assert.equal(hasil.galat.email, 'Alamat email tidak valid.');
  });

  it('whatsapp panjang ditolak dengan pesan WhatsApp, bukan pesan panjang', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, whatsapp: '0'.repeat(500) });
    assert.equal(hasil.galat.whatsapp, 'Nomor WhatsApp tidak valid.');
  });
});

describe('validasi: select', () => {
  it('menolak nilai di luar opsi dengan pesan "tidak valid"', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, jabatan: 'presiden', jenisSekolah: 'swasta' });
    assert.equal(hasil.galat.jabatan, 'Jabatan tidak valid.');
    assert.equal(hasil.galat.jenisSekolah, 'Jenis sekolah tidak valid.');
  });

  it('opsi dicocokkan persis (huruf besar tidak sama)', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, jabatan: 'Kepala-Sekolah' });
    assert.equal(hasil.galat.jabatan, 'Jabatan tidak valid.');
  });

  it('menerima setiap opsi yang terdaftar', () => {
    for (const kolom of SKEMA.demo.filter((k) => k.jenis === 'pilihan')) {
      for (const opsi of kolom.opsi) {
        const hasil = validasi('demo', { ...DEMO_VALID, [kolom.nama]: opsi.nilai });
        assert.equal(hasil.valid, true, `${kolom.nama}=${opsi.nilai}`);
      }
    }
  });

  it('opsi opsional kosong boleh, tetapi bila diisi harus dikenal', () => {
    assert.equal(validasi('demo', { ...DEMO_VALID, jumlahMurid: '' }).valid, true);
    assert.equal(validasi('demo', { ...DEMO_VALID, jumlahMurid: '   ' }).valid, true);
    assert.equal(validasi('demo', { ...DEMO_VALID, jumlahMurid: 'banyak' }).galat.jumlahMurid, 'Jumlah murid tidak valid.');
  });
});

describe('validasi: kolom opsional dan WhatsApp', () => {
  it('guru: whatsapp kosong boleh', () => {
    assert.equal(validasi('guru', { ...GURU_VALID, whatsapp: '' }).valid, true);
    assert.equal(validasi('guru', { ...GURU_VALID, whatsapp: '    ' }).valid, true);
    assert.equal(validasi('guru', { ...GURU_VALID, whatsapp: undefined }).valid, true);
  });

  it('guru: whatsapp opsional yang diisi harus valid', () => {
    const hasil = validasi('guru', { ...GURU_VALID, whatsapp: '12345' });
    assert.equal(hasil.valid, false);
    assert.deepEqual(Object.keys(hasil.galat), ['whatsapp']);
    assert.equal(hasil.kolomPertama, 'whatsapp');
  });

  it('pesan galat WhatsApp persis "Nomor WhatsApp tidak valid."', () => {
    for (const buruk of ['12345', '07123456789', 'abc', '081234567', '081234567890123', '+6281234']) {
      const hasil = validasi('demo', { ...DEMO_VALID, whatsapp: buruk });
      assert.equal(hasil.galat.whatsapp, 'Nomor WhatsApp tidak valid.', buruk);
    }
    assert.equal(PESAN_GALAT.whatsapp, 'Nomor WhatsApp tidak valid.');
  });

  it('format nomor yang lazim lolos validasi', () => {
    for (const ok of ['08123456789', '0812-3456-7890', '+62 812 3456 7890', '6281234567890', '(0812) 3456.7890']) {
      assert.equal(validasi('demo', { ...DEMO_VALID, whatsapp: ok }).valid, true, ok);
    }
  });
});

describe('validasi: keluaran dan urutan galat', () => {
  it('formulir valid: valid true, tanpa galat, kolomPertama null', () => {
    for (const [jenis, nilai] of [['demo', DEMO_VALID], ['guru', GURU_VALID]]) {
      assert.deepEqual(validasi(jenis, nilai), { valid: true, galat: {}, kolomPertama: null });
    }
  });

  it('kolomPertama mengikuti urutan skema, bukan urutan kunci masukan', () => {
    // kunci sengaja disusun terbalik
    const terbalik = {
      whatsapp: 'x',
      kota: '',
      sekolah: 'SMKN 1',
      jumlahMurid: '',
      jenisSekolah: 'umum',
      jabatan: 'tidak-ada',
      nama: 'Budi',
    };
    const hasil = validasi('demo', terbalik);
    assert.equal(hasil.kolomPertama, 'jabatan');
    assert.deepEqual(Object.keys(hasil.galat), ['jabatan', 'kota', 'whatsapp']);
  });

  it('urutan galat konsisten untuk jenis guru', () => {
    const hasil = validasi('guru', { email: 'x', whatsapp: '1', mapel: '', sekolah: '', nama: '' });
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'sekolah', 'mapel', 'email', 'whatsapp']);
    assert.equal(hasil.kolomPertama, 'nama');
  });

  it('kolomPertama selalu kunci pertama dari galat', () => {
    const hasil = validasi('demo', { ...DEMO_VALID, kota: '', whatsapp: '' });
    assert.equal(hasil.kolomPertama, Object.keys(hasil.galat)[0]);
    assert.equal(hasil.kolomPertama, 'kota');
  });

  it('jenis tidak dikenal melempar galat', () => {
    assert.throws(() => validasi('x', {}), /Jenis formulir tidak dikenal: x/);
  });

  it('tidak mengubah objek masukan', () => {
    const masukan = { ...DEMO_VALID };
    const salinan = structuredClone(masukan);
    validasi('demo', masukan);
    assert.deepEqual(masukan, salinan);
  });

  it('kolom jebakan terisi tidak memengaruhi validasi kolom skema', () => {
    assert.equal(validasi('demo', { ...DEMO_VALID, [KOLOM_JEBAKAN]: 'http://spam.example' }).valid, true);
  });
});

// ---------------------------------------------------------------------------
// susunPayload
// ---------------------------------------------------------------------------

describe('susunPayload', () => {
  it('demo: menghasilkan hanya kolom skema yang sudah dibersihkan dan dinormalisasi', () => {
    assert.deepEqual(susunPayload('demo', DEMO_VALID), DEMO_PAYLOAD);
  });

  it('guru: email huruf kecil, whatsapp kosong dibuang', () => {
    assert.deepEqual(susunPayload('guru', GURU_VALID), GURU_PAYLOAD);
  });

  it('membuang kolom jebakan dan kolom asing', () => {
    const kotor = {
      ...DEMO_VALID,
      [KOLOM_JEBAKAN]: 'http://spam.example',
      admin: 'true',
      isAdmin: true,
      __proto__: { diwariskan: 'x' },
      constructor: 'x',
      password: 'rahasia',
    };
    const payload = susunPayload('demo', kotor);
    assert.deepEqual(payload, DEMO_PAYLOAD);
    for (const k of [KOLOM_JEBAKAN, 'admin', 'isAdmin', 'password', 'diwariskan', 'constructor']) {
      assert.ok(!Object.hasOwn(payload, k), k);
    }
  });

  it('kunci payload selalu himpunan bagian dari skema', () => {
    for (const [jenis, nilai] of [['demo', DEMO_VALID], ['guru', GURU_VALID]]) {
      const payload = susunPayload(jenis, { ...nilai, [KOLOM_JEBAKAN]: 'bot', lain: 'x' });
      for (const k of Object.keys(payload)) assert.ok(namaKolom(jenis).includes(k), k);
    }
  });

  it('kolom opsional kosong atau hanya spasi dibuang (bukan string kosong)', () => {
    const payload = susunPayload('demo', { ...DEMO_VALID, jumlahMurid: '   ' });
    assert.ok(!('jumlahMurid' in payload));
    for (const v of Object.values(payload)) assert.notEqual(v, '');
    const guru = susunPayload('guru', { ...GURU_VALID, whatsapp: '  ' });
    assert.ok(!('whatsapp' in guru));
  });

  it('memangkas spasi dan menggabungkan spasi berulang pada teks', () => {
    const payload = susunPayload('demo', { ...DEMO_VALID, nama: '\t Budi \n  Santoso  ', sekolah: '  SMKN   1  ', kota: ' Metro ' });
    assert.equal(payload.nama, 'Budi Santoso');
    assert.equal(payload.sekolah, 'SMKN 1');
    assert.equal(payload.kota, 'Metro');
  });

  it('WhatsApp dinormalisasi ke 628...', () => {
    for (const [masuk, harapan] of [
      ['08123456789', '628123456789'],
      ['+62 812 3456 7890', '6281234567890'],
      ['(0812) 3456.7890', '6281234567890'],
    ]) {
      assert.equal(susunPayload('demo', { ...DEMO_VALID, whatsapp: masuk }).whatsapp, harapan);
    }
  });

  it('email diubah ke huruf kecil dan dipangkas', () => {
    const payload = susunPayload('guru', { ...GURU_VALID, email: '  BUDI@SEKOLAH.SCH.ID ' });
    assert.equal(payload.email, 'budi@sekolah.sch.id');
  });

  it('nama dan teks lain TIDAK diubah ke huruf kecil', () => {
    const payload = susunPayload('demo', { ...DEMO_VALID, nama: 'BUDI Santoso', kota: 'BANDAR Lampung' });
    assert.equal(payload.nama, 'BUDI Santoso');
    assert.equal(payload.kota, 'BANDAR Lampung');
  });

  it('nilai select dibawa apa adanya (setelah dipangkas)', () => {
    const payload = susunPayload('demo', { ...DEMO_VALID, jabatan: ' guru ' });
    assert.equal(payload.jabatan, 'guru');
  });

  it('tidak mengubah objek masukan', () => {
    const masukan = { ...DEMO_VALID };
    const salinan = structuredClone(masukan);
    susunPayload('demo', masukan);
    assert.deepEqual(masukan, salinan);
  });

  it('masukan kosong menghasilkan payload kosong', () => {
    assert.deepEqual(susunPayload('demo', undefined), {});
    assert.deepEqual(susunPayload('guru', {}), {});
  });

  it('jenis tidak dikenal melempar galat', () => {
    assert.throws(() => susunPayload('x', {}), /Jenis formulir tidak dikenal/);
  });

  it('payload dapat diserialisasi JSON tanpa kehilangan data', () => {
    assert.deepEqual(JSON.parse(JSON.stringify(susunPayload('demo', DEMO_VALID))), DEMO_PAYLOAD);
  });
});

// ---------------------------------------------------------------------------
// jebakanTerisi (honeypot)
// ---------------------------------------------------------------------------

describe('jebakanTerisi', () => {
  it('benar bila kolom jebakan terisi', () => {
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: 'http://spam.example' }), true);
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: 'x' }), true);
    assert.equal(jebakanTerisi({ ...DEMO_VALID, [KOLOM_JEBAKAN]: 'bot' }), true);
  });

  it('salah bila kosong, hanya spasi, atau tidak ada', () => {
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: '' }), false);
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: '   ' }), false);
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: '\t\n' }), false);
    assert.equal(jebakanTerisi({}), false);
    assert.equal(jebakanTerisi(undefined), false);
    assert.equal(jebakanTerisi(null), false);
  });

  it('hanya kolom jebakan yang dihitung, kolom lain tidak (termasuk "situs")', () => {
    assert.equal(jebakanTerisi({ nama: 'Budi', website: 'x', url: 'y', situs: 'z' }), false);
  });

  it('nilai bukan teks pada kolom jebakan dianggap kosong', () => {
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: 0 }), false);
    assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: null }), false);
  });

  it('formulir valid yang diisi manusia tidak memicu jebakan', () => {
    assert.equal(jebakanTerisi(DEMO_VALID), false);
    assert.equal(jebakanTerisi(GURU_VALID), false);
    for (const jenis of SEMUA_JENIS) assert.equal(jebakanTerisi(nilaiAwal(jenis)), false);
  });
});

// ---------------------------------------------------------------------------
// siapkanKirim
// ---------------------------------------------------------------------------

describe('siapkanKirim', () => {
  it('demo valid: status siap dengan payload bersih', () => {
    assert.deepEqual(siapkanKirim('demo', DEMO_VALID), { status: 'siap', payload: DEMO_PAYLOAD });
  });

  it('guru valid: status siap dengan payload bersih', () => {
    assert.deepEqual(siapkanKirim('guru', GURU_VALID), { status: 'siap', payload: GURU_PAYLOAD });
  });

  it('formulir tidak valid: status galat beserta kolomPertama', () => {
    for (const jenis of SEMUA_JENIS) {
      const hasil = siapkanKirim(jenis, nilaiAwal(jenis));
      assert.equal(hasil.status, 'galat');
      assert.equal(hasil.kolomPertama, 'nama');
      assert.deepEqual(Object.keys(hasil.galat), namaWajib(jenis).filter((n) => !(jenis === 'demo' && n === 'jenisSekolah')));
      assert.ok(!('payload' in hasil));
    }
  });

  it('galat memberi kolomPertama sesuai urutan skema', () => {
    const hasil = siapkanKirim('demo', { ...DEMO_VALID, kota: '', whatsapp: 'abc' });
    assert.equal(hasil.status, 'galat');
    assert.equal(hasil.kolomPertama, 'kota');
    assert.equal(hasil.galat.whatsapp, 'Nomor WhatsApp tidak valid.');
  });

  it('honeypot terisi + formulir valid: TETAP siap dengan payload utuh dan curiga: true (data tidak dibuang)', () => {
    for (const [jenis, nilai, payload] of [['demo', DEMO_VALID, DEMO_PAYLOAD], ['guru', GURU_VALID, GURU_PAYLOAD]]) {
      const hasil = siapkanKirim(jenis, { ...nilai, [KOLOM_JEBAKAN]: 'http://spam.example' });
      assert.deepEqual(hasil, { status: 'siap', payload, curiga: true });
    }
  });

  it('honeypot kosong atau hanya spasi: tanpa kunci curiga sama sekali', () => {
    for (const kosong of ['', '   ', '\t\n']) {
      const hasil = siapkanKirim('demo', { ...DEMO_VALID, [KOLOM_JEBAKAN]: kosong });
      assert.equal(hasil.status, 'siap');
      assert.ok(!('curiga' in hasil));
    }
    assert.ok(!('curiga' in siapkanKirim('guru', GURU_VALID)));
  });

  it('honeypot terisi + formulir tidak valid: validasi tetap berjalan lebih dulu dan galat tampil normal', () => {
    // Pengguna asli bisa terkena isian otomatis; ia harus tetap melihat dan memperbaiki galatnya.
    for (const jenis of SEMUA_JENIS) {
      const hasil = siapkanKirim(jenis, { ...nilaiAwal(jenis), [KOLOM_JEBAKAN]: 'bot' });
      assert.equal(hasil.status, 'galat');
      assert.equal(hasil.kolomPertama, 'nama');
      assert.ok(Object.keys(hasil.galat).length > 0);
      assert.ok(!('curiga' in hasil));
      assert.ok(!('payload' in hasil));
    }
  });

  it('payload siap tidak pernah memuat kolom jebakan', () => {
    for (const [jenis, nilai] of [['demo', DEMO_VALID], ['guru', GURU_VALID]]) {
      for (const isi of ['', 'bot']) {
        const hasil = siapkanKirim(jenis, { ...nilai, [KOLOM_JEBAKAN]: isi });
        assert.equal(hasil.status, 'siap');
        assert.ok(!(KOLOM_JEBAKAN in hasil.payload));
        assert.ok(!('situs' in hasil.payload));
      }
    }
  });

  it('jenis tidak dikenal melempar galat', () => {
    assert.throws(() => siapkanKirim('x', {}), /Jenis formulir tidak dikenal/);
  });
});

describe('honeypot: data pengguna tidak pernah dibuang', () => {
  // Pola pemanggil seperti useFormulir: kirim hanya bila status === 'siap', dengan curiga di amplop.
  function pemanggil(kirim) {
    return async (jenis, nilai) => {
      const hasil = siapkanKirim(jenis, nilai);
      if (hasil.status === 'siap') await kirim(jenis, hasil.payload, { curiga: hasil.curiga === true });
      return hasil.status;
    };
  }

  it('honeypot terisi + valid: fungsi kirim tiruan dipanggil sekali dengan curiga: true', async () => {
    const panggilan = [];
    const jalankan = pemanggil(async (jenis, payload, opsi) => {
      panggilan.push({ jenis, payload, opsi });
    });
    assert.equal(await jalankan('demo', { ...DEMO_VALID, [KOLOM_JEBAKAN]: 'bot' }), 'siap');
    assert.equal(await jalankan('guru', { ...GURU_VALID, [KOLOM_JEBAKAN]: 'bot' }), 'siap');
    assert.deepEqual(panggilan, [
      { jenis: 'demo', payload: DEMO_PAYLOAD, opsi: { curiga: true } },
      { jenis: 'guru', payload: GURU_PAYLOAD, opsi: { curiga: true } },
    ]);
  });

  it('honeypot terisi tetapi formulir kosong: tidak dikirim (galat validasi)', async () => {
    let hitung = 0;
    const jalankan = pemanggil(async () => {
      hitung += 1;
    });
    assert.equal(await jalankan('demo', { ...nilaiAwal('demo'), [KOLOM_JEBAKAN]: 'bot' }), 'galat');
    assert.equal(hitung, 0);
  });

  it('formulir valid tanpa jebakan: dipanggil tepat sekali, curiga: false, tanpa kolom jebakan', async () => {
    const panggilan = [];
    const jalankan = pemanggil(async (jenis, payload, opsi) => {
      panggilan.push({ jenis, payload, opsi });
    });
    assert.equal(await jalankan('demo', DEMO_VALID), 'siap');
    assert.deepEqual(panggilan, [{ jenis: 'demo', payload: DEMO_PAYLOAD, opsi: { curiga: false } }]);
  });

  it('formulir tidak valid: tidak dikirim', async () => {
    let hitung = 0;
    const jalankan = pemanggil(async () => {
      hitung += 1;
    });
    assert.equal(await jalankan('demo', nilaiAwal('demo')), 'galat');
    assert.equal(hitung, 0);
  });

  it('siapkanKirim sendiri tidak menyentuh jaringan (fetch global dipantau)', () => {
    const asli = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
    let hitung = 0;
    Object.defineProperty(globalThis, 'fetch', {
      value: () => {
        hitung += 1;
        return Promise.reject(new Error('tidak boleh dipanggil'));
      },
      configurable: true,
      writable: true,
    });
    try {
      siapkanKirim('demo', { ...DEMO_VALID, [KOLOM_JEBAKAN]: 'bot' });
      siapkanKirim('demo', DEMO_VALID);
      siapkanKirim('guru', GURU_VALID);
      siapkanKirim('guru', nilaiAwal('guru'));
    } finally {
      if (asli) Object.defineProperty(globalThis, 'fetch', asli);
      else delete globalThis.fetch;
    }
    assert.equal(hitung, 0);
  });
});

// ---------------------------------------------------------------------------
// Kedua jenis formulir, dijalankan dari satu tabel
// ---------------------------------------------------------------------------

describe('kedua jenis formulir (demo dan guru)', () => {
  const tabel = {
    demo: { valid: DEMO_VALID, payload: DEMO_PAYLOAD, wajibPertama: 'nama' },
    guru: { valid: GURU_VALID, payload: GURU_PAYLOAD, wajibPertama: 'nama' },
  };

  for (const [jenis, { valid, payload }] of Object.entries(tabel)) {
    it(`${jenis}: alur valid dari nilaiAwal sampai payload`, () => {
      const awal = nilaiAwal(jenis);
      assert.equal(validasi(jenis, awal).valid, false);
      const diisi = { ...awal, ...valid };
      assert.equal(validasi(jenis, diisi).valid, true);
      assert.deepEqual(siapkanKirim(jenis, diisi), { status: 'siap', payload });
    });

    it(`${jenis}: mengosongkan tiap kolom wajib menghasilkan galat tepat pada kolom itu`, () => {
      for (const nama of namaWajib(jenis)) {
        const hasil = validasi(jenis, { ...valid, [nama]: '' });
        assert.deepEqual(Object.keys(hasil.galat), [nama], `${jenis}.${nama}`);
        assert.equal(hasil.kolomPertama, nama);
      }
    });

    it(`${jenis}: mengosongkan tiap kolom opsional tetap valid`, () => {
      for (const kolom of SKEMA[jenis].filter((k) => !k.wajib)) {
        assert.equal(validasi(jenis, { ...valid, [kolom.nama]: '' }).valid, true, `${jenis}.${kolom.nama}`);
      }
    });
  }

  it('skema membedakan jenis: kolom khusus demo tidak diminta pada guru dan sebaliknya', () => {
    const hasilGuru = validasi('guru', { ...GURU_VALID, jabatan: '', kota: '' });
    assert.equal(hasilGuru.valid, true);
    const hasilDemo = validasi('demo', { ...DEMO_VALID, email: '', mapel: '' });
    assert.equal(hasilDemo.valid, true);
  });

  it('WhatsApp wajib di demo tetapi opsional di guru', () => {
    assert.equal(SKEMA.demo.find((k) => k.nama === 'whatsapp').wajib, true);
    assert.equal(SKEMA.guru.find((k) => k.nama === 'whatsapp').wajib, false);
    assert.equal(validasi('demo', { ...DEMO_VALID, whatsapp: '' }).valid, false);
    assert.equal(validasi('guru', { ...GURU_VALID, whatsapp: '' }).valid, true);
  });
});

// ---------------------------------------------------------------------------
// Privasi: tanpa console, tanpa penyimpanan
// ---------------------------------------------------------------------------

describe('privasi: logika formulir tidak mencatat atau menyimpan isian', () => {
  const METODE_CONSOLE = ['log', 'info', 'warn', 'error', 'debug', 'trace', 'table', 'dir'];
  const RAHASIA = {
    nama: 'RAHASIA-NAMA-Budi',
    jabatan: 'kepala-sekolah',
    jenisSekolah: 'umum',
    sekolah: 'RAHASIA-SEKOLAH',
    kota: 'RAHASIA-KOTA',
    jumlahMurid: '',
    whatsapp: '0812-3456-7890',
    [KOLOM_JEBAKAN]: '',
  };

  function pasangStorageTiruan() {
    const panggilan = [];
    const tiruan = new Proxy(
      {},
      {
        get(_t, p) {
          panggilan.push(`get:${String(p)}`);
          return () => {
            panggilan.push(`panggil:${String(p)}`);
          };
        },
        set(_t, p) {
          panggilan.push(`set:${String(p)}`);
          return true;
        },
      },
    );
    const asli = {};
    for (const nama of ['localStorage', 'sessionStorage']) {
      asli[nama] = Object.getOwnPropertyDescriptor(globalThis, nama);
      Object.defineProperty(globalThis, nama, { value: tiruan, configurable: true, writable: true });
    }
    return {
      panggilan,
      pulihkan() {
        for (const nama of Object.keys(asli)) {
          if (asli[nama]) Object.defineProperty(globalThis, nama, asli[nama]);
          else delete globalThis[nama];
        }
      },
    };
  }

  it('tidak ada console.* dan tidak ada akses localStorage atau sessionStorage', (t) => {
    const spy = METODE_CONSOLE.map((m) => t.mock.method(console, m, () => {}));
    const storage = pasangStorageTiruan();
    try {
      for (const jenis of SEMUA_JENIS) {
        const nilai = jenis === 'demo' ? RAHASIA : { ...GURU_VALID, nama: 'RAHASIA-NAMA-Siti' };
        bersihkan(nilai.nama);
        normalisasiWhatsapp(nilai.whatsapp ?? '0812-3456-7890');
        emailValid('rahasia@contoh.id');
        nilaiAwal(jenis);
        validasi(jenis, nilai);
        validasi(jenis, { ...nilai, nama: '' }); // jalur galat
        susunPayload(jenis, nilai);
        jebakanTerisi(nilai);
        siapkanKirim(jenis, nilai);
        siapkanKirim(jenis, { ...nilai, [KOLOM_JEBAKAN]: 'bot' }); // jalur curiga
        siapkanKirim(jenis, { ...nilai, nama: '' }); // jalur galat
      }
    } finally {
      storage.pulihkan();
    }
    for (let i = 0; i < spy.length; i++) {
      assert.equal(spy[i].mock.callCount(), 0, `console.${METODE_CONSOLE[i]} dipanggil`);
    }
    assert.deepEqual(storage.panggilan, []);
  });

  it('pesan galat tidak memuat isi isian', () => {
    const hasil = validasi('demo', { ...RAHASIA, whatsapp: 'RAHASIA-WA', kota: 'RAHASIA-KOTA'.repeat(20) });
    const semuaPesan = Object.values(hasil.galat).join('\n');
    assert.ok(!semuaPesan.includes('RAHASIA'), semuaPesan);
  });
});

// ---------------------------------------------------------------------------
// Temuan tinjauan (sebelumnya todo, kini diperbaiki)
// ---------------------------------------------------------------------------

describe('temuan tinjauan', () => {
  it('kolom wajib yang hanya berisi karakter lebar nol (U+200B, U+FEFF, U+200D) ditolak sebagai kosong', () => {
    for (const taktampak of ['\u200B', '\u200B\u200B', '\uFEFF', '\u200D', ' \u200B \uFEFF ']) {
      const hasil = validasi('demo', { ...DEMO_VALID, nama: taktampak });
      assert.equal(hasil.galat.nama, 'Nama lengkap wajib diisi.', JSON.stringify(taktampak));
    }
  });

  it('jenis formulir bernama properti bawaan Object memberi galat "tidak dikenal"', () => {
    for (const jenis of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
      assert.throws(() => nilaiAwal(jenis), /Jenis formulir tidak dikenal/, jenis);
      assert.throws(() => validasi(jenis, {}), /Jenis formulir tidak dikenal/, jenis);
      assert.throws(() => susunPayload(jenis, {}), /Jenis formulir tidak dikenal/, jenis);
      assert.throws(() => siapkanKirim(jenis, {}), /Jenis formulir tidak dikenal/, jenis);
    }
    for (const bukanTeks of [undefined, null, 0, {}, ['demo']]) {
      assert.throws(() => nilaiAwal(bukanTeks), /Jenis formulir tidak dikenal/);
    }
  });

  it('susunPayload pada WhatsApp tidak valid membuang kolomnya (bukan null)', () => {
    const payload = susunPayload('demo', { ...DEMO_VALID, whatsapp: '12345' });
    assert.ok(!('whatsapp' in payload));
    for (const v of Object.values(payload)) assert.equal(typeof v, 'string');
  });
});

describe('bersihkan: karakter format Unicode (Cf)', () => {
  it('membuang U+200B, U+200D, U+FEFF, U+202E di tengah dan ujung teks', () => {
    assert.equal(bersihkan('\u200BBudi\u200D Santoso\uFEFF'), 'Budi Santoso');
    assert.equal(bersihkan('abc\u202Edef'), 'abcdef');
  });

  it('membuang karakter format di luar BMP (U+E0001 tag)', () => {
    assert.equal(bersihkan('a\u{E0001}b'), 'ab');
  });

  it('karakter tak kasatmata antara dua spasi tidak menambah spasi', () => {
    assert.equal(bersihkan('a \u200B b'), 'a b');
  });

  it('emoji dan huruf non-Latin biasa tetap utuh', () => {
    assert.equal(bersihkan('  Siti 😀 Ünal  '), 'Siti 😀 Ünal');
  });
});

describe('normalisasiWhatsapp: penulisan tambahan', () => {
  it('menerima nol di depan setelah kode negara: +62 0812..., 62 0812...', () => {
    assert.equal(normalisasiWhatsapp('+62 0812 3456 7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('62 0812-3456-7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('620812345678'), '62812345678');
  });

  it('menerima awalan internasional 0062 tanpa plus', () => {
    assert.equal(normalisasiWhatsapp('0062 812 3456 7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('0062 0812 3456 7890'), '6281234567890');
  });

  it('panjang tetap 9 sampai 13 digit setelah 62', () => {
    assert.equal(normalisasiWhatsapp('+62 0812345678'), '62812345678'); // 9 digit
    assert.equal(normalisasiWhatsapp('+62 08123456'), null); // 7 digit
    assert.equal(normalisasiWhatsapp('+62 0812345678901234'), null); // 15 digit
    assert.equal(normalisasiWhatsapp('0062 8123456789012'), '628123456789012'); // 13 digit
    assert.equal(normalisasiWhatsapp('0062 81234567890123'), null); // 14 digit
  });

  it('tetap menolak dua nol setelah 62 dan plus bersama 0062', () => {
    assert.equal(normalisasiWhatsapp('+62 00812345678'), null);
    assert.equal(normalisasiWhatsapp('+0062 812345678'), null);
  });
});

describe('buatIdKirim', () => {
  it('memakai crypto.randomUUID bila ada', () => {
    assert.equal(buatIdKirim({ randomUUID: () => 'id-tetap' }), 'id-tetap');
  });

  it('fallback getRandomValues: bentuk UUID v4', () => {
    const id = buatIdKirim({
      getRandomValues: (b) => {
        for (let i = 0; i < b.length; i++) b[i] = (i * 17 + 3) & 255;
        return b;
      },
    });
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('fallback tanpa crypto sama sekali: bentuk UUID v4 dan berbeda tiap panggilan', () => {
    const a = buatIdKirim(null);
    const b = buatIdKirim({});
    assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.notEqual(a, b);
  });

  it('default memakai crypto global Node', () => {
    assert.match(buatIdKirim(), /^[0-9a-f-]{36}$/);
  });
});
