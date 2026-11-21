// Tes logika formulir halaman Perusahaan (F6): jenis kolom baru `kontak` dan
// `teksPanjang`, serta jenis formulir `kerjaSama` dan `afiliator`.
// Jalankan: node --test src/views/landing/lib/
// Runner bawaan Node (node:test), tanpa dependensi tambahan. Tes lama jenis demo
// dan guru ada di formulir.test.js dan tidak diulang di sini.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bersihkan,
  bersihkanBanyakBaris,
  jebakanTerisi,
  nilaiAwal,
  normalisasiKontak,
  siapkanKirim,
  susunPayload,
  validasi,
} from './formulir.js';
import { kirimFormulir } from './kirimFormulir.js';
import { KOLOM_JEBAKAN, PESAN_GALAT, SKEMA } from '../data/formulir.js';

// ---------------------------------------------------------------------------
// Bantuan
// ---------------------------------------------------------------------------

const KERJA_SAMA_VALID = {
  nama: '  Rina   Wulandari ',
  instansi: 'Yayasan Pendidikan Contoh',
  bentuk: 'komunitas-guru',
  kontak: '0812-3456-7890',
  pesan: 'Kami ingin pelatihan guru.',
  [KOLOM_JEBAKAN]: '',
};

const KERJA_SAMA_PAYLOAD = {
  nama: 'Rina Wulandari',
  instansi: 'Yayasan Pendidikan Contoh',
  bentuk: 'komunitas-guru',
  kontak: '6281234567890',
  pesan: 'Kami ingin pelatihan guru.',
};

const AFILIATOR_VALID = {
  nama: 'Dewi Lestari',
  whatsapp: '+62 812-3456-7890',
  email: '  Dewi.Lestari@Email.Example.ID ',
  kota: '  Bandar   Lampung ',
  latarBelakang: 'kepala-sekolah',
  [KOLOM_JEBAKAN]: '',
};

const AFILIATOR_PAYLOAD = {
  nama: 'Dewi Lestari',
  whatsapp: '6281234567890',
  email: 'dewi.lestari@email.example.id',
  kota: 'Bandar Lampung',
  latarBelakang: 'kepala-sekolah',
};

const JENIS_BARU = ['kerjaSama', 'afiliator'];
const VALID = { kerjaSama: KERJA_SAMA_VALID, afiliator: AFILIATOR_VALID };
const PAYLOAD = { kerjaSama: KERJA_SAMA_PAYLOAD, afiliator: AFILIATOR_PAYLOAD };

const namaKolom = (jenis) => SKEMA[jenis].map((k) => k.nama);
const kolomDari = (jenis, nama) => SKEMA[jenis].find((k) => k.nama === nama);

function ukurMs(fn) {
  fn();
  const mulai = performance.now();
  fn();
  return performance.now() - mulai;
}

const BATAS_MS = 50;

// ---------------------------------------------------------------------------
// Skema
// ---------------------------------------------------------------------------

describe('skema kerjaSama dan afiliator', () => {
  it('urutan kolom sesuai desain', () => {
    assert.deepEqual(namaKolom('kerjaSama'), ['nama', 'instansi', 'bentuk', 'kontak', 'pesan']);
    assert.deepEqual(namaKolom('afiliator'), ['nama', 'whatsapp', 'email', 'kota', 'latarBelakang']);
  });

  it('kolom wajib dan opsional sesuai desain dan brief', () => {
    for (const nama of ['nama', 'instansi', 'bentuk', 'kontak']) assert.equal(kolomDari('kerjaSama', nama).wajib, true, nama);
    assert.equal(kolomDari('kerjaSama', 'pesan').wajib, false);
    for (const nama of namaKolom('afiliator')) assert.equal(kolomDari('afiliator', nama).wajib, true, nama);
  });

  it('jenis kolom: kontak, teksPanjang (maks 1000), pilihan, whatsapp, email', () => {
    assert.equal(kolomDari('kerjaSama', 'kontak').jenis, 'kontak');
    assert.equal(kolomDari('kerjaSama', 'pesan').jenis, 'teksPanjang');
    assert.equal(kolomDari('kerjaSama', 'pesan').maks, 1000);
    assert.equal(kolomDari('kerjaSama', 'bentuk').jenis, 'pilihan');
    assert.equal(kolomDari('afiliator', 'latarBelakang').jenis, 'pilihan');
    assert.equal(kolomDari('afiliator', 'whatsapp').jenis, 'whatsapp');
    assert.equal(kolomDari('afiliator', 'email').jenis, 'email');
  });

  it('opsi pilihan persis desain', () => {
    assert.deepEqual(
      kolomDari('kerjaSama', 'bentuk').opsi.map((o) => o.label),
      ['Sekolah dan yayasan', 'Komunitas guru', 'Mitra industri', 'Lainnya'],
    );
    assert.deepEqual(
      kolomDari('afiliator', 'latarBelakang').opsi.map((o) => o.label),
      ['Guru', 'Kepala sekolah', 'Komunitas', 'Lainnya'],
    );
  });

  it('pilihan tanpa butir kosong punya nilai awal yang ada di opsi', () => {
    for (const [jenis, nama] of [
      ['kerjaSama', 'bentuk'],
      ['afiliator', 'latarBelakang'],
    ]) {
      const kolom = kolomDari(jenis, nama);
      assert.equal(kolom.placeholderPilih, undefined);
      assert.ok(kolom.opsi.some((o) => o.nilai === kolom.awal), `${jenis}.${nama}`);
    }
  });

  it('kolom jebakan bukan bagian skema baru', () => {
    for (const jenis of JENIS_BARU) assert.ok(!namaKolom(jenis).includes(KOLOM_JEBAKAN));
  });

  it('teks skema (label, placeholder, opsi) tanpa klaim, janji, atau angka: aman ikut chunk bersama', () => {
    const KATA_KLAIM = ['gratis', 'imbalan', 'aman', 'dasbor', 'tanpa', 'jamin', 'resmi', 'rp'];
    for (const jenis of JENIS_BARU) {
      const teks = SKEMA[jenis].flatMap((k) => [k.label, k.placeholder ?? '', ...(k.opsi ?? []).map((o) => o.label)]);
      // Per kata utuh: "Nama" tidak boleh dianggap memuat "aman".
      const kata = teks.join(' ').toLowerCase().split(/[^\p{L}\p{N}%]+/u).filter(Boolean);
      for (const klaim of KATA_KLAIM) assert.ok(!kata.includes(klaim), `${jenis} memuat kata "${klaim}"`);
      assert.ok(!kata.some((w) => w.includes('%')), `${jenis} memuat persen`);
      // Satu-satunya angka yang boleh: contoh nomor "08xxxxxxxxxx" (huruf x, bukan angka lain).
      assert.ok(!/\d/.test(teks.join(' ').replaceAll('08xxxxxxxxxx', '')), `${jenis} memuat angka`);
    }
  });

  it('nilaiAwal: semua kolom kosong kecuali pilihan tanpa butir kosong, ditambah kolom jebakan', () => {
    assert.deepEqual(nilaiAwal('kerjaSama'), {
      [KOLOM_JEBAKAN]: '',
      nama: '',
      instansi: '',
      bentuk: 'sekolah-yayasan',
      kontak: '',
      pesan: '',
    });
    assert.deepEqual(nilaiAwal('afiliator'), {
      [KOLOM_JEBAKAN]: '',
      nama: '',
      whatsapp: '',
      email: '',
      kota: '',
      latarBelakang: 'guru',
    });
  });
});

// ---------------------------------------------------------------------------
// normalisasiKontak
// ---------------------------------------------------------------------------

describe('normalisasiKontak: nomor WhatsApp', () => {
  it('menormalkan ke 628... seperti jenis whatsapp', () => {
    for (const masuk of ['0812-3456-7890', '081234567890', '+62 812 3456 7890', '+62812-3456-7890', '62 812 3456 7890', '0062 812 3456 7890']) {
      assert.deepEqual(normalisasiKontak(masuk), { jenis: 'whatsapp', nilai: '6281234567890' }, masuk);
    }
  });

  it('nomor dengan nol setelah kode negara (+62 0812...) diterima', () => {
    assert.deepEqual(normalisasiKontak('+62 0812-3456-7890'), { jenis: 'whatsapp', nilai: '6281234567890' });
  });

  it('spasi, tab, dan baris baru di sekitar nomor dipangkas', () => {
    assert.deepEqual(normalisasiKontak('   0812 3456 7890\t\n'), { jenis: 'whatsapp', nilai: '6281234567890' });
  });

  it('karakter tak kasatmata di sekitar nomor dibuang', () => {
    assert.deepEqual(normalisasiKontak('​0812-3456-7890‍'), { jenis: 'whatsapp', nilai: '6281234567890' });
  });

  it('nomor tidak valid ditolak (terlalu pendek, bukan 8 setelah 62, huruf, plus di tengah)', () => {
    for (const masuk of ['0812', '0712345678901', '+1 202 555 0100', '0812-ABCD-7890', '08123+456789', '12345678901']) {
      assert.equal(normalisasiKontak(masuk), null, masuk);
    }
  });
});

describe('normalisasiKontak: email', () => {
  it('isian ber-@ dianggap email dan diubah ke huruf kecil', () => {
    assert.deepEqual(normalisasiKontak('Halo@Abseninaja.COM'), { jenis: 'email', nilai: 'halo@abseninaja.com' });
    assert.deepEqual(normalisasiKontak('  nama.belakang+tag@sekolah.sch.id  '), { jenis: 'email', nilai: 'nama.belakang+tag@sekolah.sch.id' });
  });

  it('@ ganda ditolak', () => {
    for (const masuk of ['a@@b.com', 'a@b@c.com', '@@', 'a@b.com@', '@a@b.com']) {
      assert.equal(normalisasiKontak(masuk), null, masuk);
    }
  });

  it('@ tanpa bagian lokal atau domain ditolak', () => {
    for (const masuk of ['@', '@b.com', 'a@', 'a@b', 'a@.com', 'a@b.', 'a@b..com']) {
      assert.equal(normalisasiKontak(masuk), null, masuk);
    }
  });

  it('spasi di dalam email ditolak', () => {
    for (const masuk of ['a b@c.com', 'a@b c.com', 'a@ b.com', 'a @b.com']) {
      assert.equal(normalisasiKontak(masuk), null, masuk);
    }
  });

  it('isian berisi @ tidak pernah dianggap nomor WhatsApp, walau digitnya valid', () => {
    assert.equal(normalisasiKontak('081234567890@'), null);
    assert.equal(normalisasiKontak('0812-3456-7890 @'), null);
  });

  it('@ lebar penuh (U+FF20) bukan @: dianggap nomor dan ditolak', () => {
    assert.equal(normalisasiKontak('halo＠abseninaja.com'), null);
  });
});

describe('normalisasiKontak: masukan kosong dan aneh', () => {
  it('kosong, spasi, dan karakter tak kasatmata menjadi null', () => {
    for (const masuk of ['', '   ', '\t\n', '​‍﻿']) assert.equal(normalisasiKontak(masuk), null, JSON.stringify(masuk));
  });

  it('nilai bukan teks menjadi null', () => {
    for (const masuk of [undefined, null, 0, 81234567890, true, {}, [], ['a@b.com']]) assert.equal(normalisasiKontak(masuk), null);
  });

  it('teks biasa tanpa @ dan tanpa pola nomor ditolak', () => {
    for (const masuk of ['halo', 'abseninaja.com', 'WhatsApp saya']) assert.equal(normalisasiKontak(masuk), null, masuk);
  });

  it('bebas ReDoS: masukan sangat panjang selesai di bawah 50 ms', () => {
    const kasus = ['a'.repeat(200000), '@'.repeat(200000), `${'a.'.repeat(100000)}@${'b.'.repeat(100000)}`, '0'.repeat(200000), `${' '.repeat(100000)}x${' '.repeat(100000)}`];
    for (const k of kasus) {
      const ms = ukurMs(() => normalisasiKontak(k));
      assert.ok(ms < BATAS_MS, `${ms.toFixed(1)} ms`);
    }
  });
});

// ---------------------------------------------------------------------------
// bersihkanBanyakBaris
// ---------------------------------------------------------------------------

describe('bersihkanBanyakBaris', () => {
  it('mempertahankan baris baru sebagai satu \\n', () => {
    assert.equal(bersihkanBanyakBaris('baris satu\nbaris dua\nbaris tiga'), 'baris satu\nbaris dua\nbaris tiga');
  });

  it('menyamakan \\r\\n, \\r, U+2028, U+2029, dan U+0085 menjadi \\n', () => {
    assert.equal(bersihkanBanyakBaris('a\r\nb\rc d e\u0085f'), 'a\nb\nc\nd\ne\nf');
  });

  it('menggabungkan spasi dan tab berulang di dalam baris', () => {
    assert.equal(bersihkanBanyakBaris('a   b\t\tc  d'), 'a b c d');
  });

  it('memangkas spasi di awal dan akhir tiap baris', () => {
    assert.equal(bersihkanBanyakBaris('  a  \n   b   '), 'a\nb');
  });

  it('menggabungkan baris kosong beruntun menjadi satu', () => {
    assert.equal(bersihkanBanyakBaris('a\n\n\n\nb'), 'a\n\nb');
    assert.equal(bersihkanBanyakBaris('a\n   \n\t\n\nb'), 'a\n\nb');
  });

  it('membuang baris kosong di awal dan akhir', () => {
    assert.equal(bersihkanBanyakBaris('\n\n  a\nb\n\n\n'), 'a\nb');
  });

  it('membuang karakter tak kasatmata dan karakter kendali; baris yang hanya berisi itu dianggap kosong', () => {
    assert.equal(bersihkanBanyakBaris('a​b‮c\u0000d\u0007e'), 'abcde');
    assert.equal(bersihkanBanyakBaris('a\n​‍\nb'), 'a\n\nb');
  });

  it('isian yang hanya spasi, baris baru, atau karakter tak kasatmata menjadi string kosong', () => {
    for (const v of ['', '   ', '\n\n\n', ' \t\r\n ', '​\n﻿', '  ']) assert.equal(bersihkanBanyakBaris(v), '', JSON.stringify(v));
  });

  it('nilai bukan teks menjadi string kosong', () => {
    for (const v of [undefined, null, 0, 123, true, {}, [], ['a']]) assert.equal(bersihkanBanyakBaris(v), '');
  });

  it('mempertahankan huruf Unicode, emoji, dan tanda baca', () => {
    assert.equal(bersihkanBanyakBaris("  Ma'had Al-Zaytun\n  Ibnu Sīnā 🙂  "), "Ma'had Al-Zaytun\nIbnu Sīnā 🙂");
  });

  it('idempoten: hasilnya tidak berubah bila dibersihkan lagi', () => {
    const sekali = bersihkanBanyakBaris(' a  b \r\n\r\n\r\n c​ \n\n');
    assert.equal(bersihkanBanyakBaris(sekali), sekali);
  });

  it('untuk teks satu baris sama dengan bersihkan', () => {
    for (const v of ['  halo   dunia  ', 'a​b', '\t x \t']) assert.equal(bersihkanBanyakBaris(v), bersihkan(v));
  });

  it('linear: masukan sangat panjang selesai di bawah 50 ms', () => {
    const kasus = ['a\n'.repeat(200000), ' '.repeat(400000), '\n'.repeat(400000), 'a b '.repeat(100000), '​'.repeat(400000)];
    for (const k of kasus) {
      const ms = ukurMs(() => bersihkanBanyakBaris(k));
      assert.ok(ms < BATAS_MS * 4, `${ms.toFixed(1)} ms`); // tiap baris dibersihkan: sedikit lebih longgar
    }
  });
});

// ---------------------------------------------------------------------------
// validasi: kerjaSama
// ---------------------------------------------------------------------------

describe('validasi kerjaSama: kolom wajib dan kontak', () => {
  it('isian lengkap valid', () => {
    const hasil = validasi('kerjaSama', KERJA_SAMA_VALID);
    assert.equal(hasil.valid, true);
    assert.deepEqual(hasil.galat, {});
    assert.equal(hasil.kolomPertama, null);
  });

  it('formulir kosong (nilai awal): galat pada nama, instansi, dan kontak; bentuk sudah terisi', () => {
    const hasil = validasi('kerjaSama', nilaiAwal('kerjaSama'));
    assert.equal(hasil.valid, false);
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'instansi', 'kontak']);
    assert.equal(hasil.galat.nama, PESAN_GALAT.wajibIsi('Nama lengkap'));
    assert.equal(hasil.galat.instansi, PESAN_GALAT.wajibIsi('Instansi'));
    assert.equal(hasil.galat.kontak, PESAN_GALAT.wajibIsi('WhatsApp atau email'));
    assert.equal(hasil.kolomPertama, 'nama');
  });

  it('mengosongkan tiap kolom wajib menghasilkan galat tepat pada kolom itu', () => {
    for (const nama of ['nama', 'instansi', 'bentuk', 'kontak']) {
      const hasil = validasi('kerjaSama', { ...KERJA_SAMA_VALID, [nama]: '' });
      assert.deepEqual(Object.keys(hasil.galat), [nama], nama);
      assert.equal(hasil.kolomPertama, nama);
    }
  });

  it('bentuk kosong memakai pesan "wajib dipilih"; di luar opsi memakai "tidak valid"', () => {
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, bentuk: '' }).galat.bentuk, PESAN_GALAT.wajibPilih('Bentuk kerja sama'));
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, bentuk: 'rahasia' }).galat.bentuk, PESAN_GALAT.pilihanTidakDikenal('Bentuk kerja sama'));
  });

  it('kontak berisi nomor WhatsApp valid atau email valid lolos', () => {
    for (const kontak of ['0812-3456-7890', '+62 812 3456 7890', 'Halo@Abseninaja.com', '  halo@abseninaja.com  ']) {
      assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak }).valid, true, kontak);
    }
  });

  it('kontak ber-@ yang tidak valid memakai pesan email, termasuk @ ganda', () => {
    for (const kontak of ['a@@b.com', 'a@b@c.com', '@', 'a@b', 'halo@x.com,', 'a@b.12']) {
      assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak }).galat.kontak, PESAN_GALAT.email, kontak);
    }
  });

  it('isian campuran (ber-@ sekaligus spasi atau lima digit atau lebih) memakai pesan kontak, bukan pesan email', () => {
    for (const kontak of ['a b@c.com', '081234567890@', '0812 3456 7890 atau halo@x.com', '081234567890,halo@x.com', 'halo 12345@x']) {
      assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak }).galat.kontak, PESAN_GALAT.kontak, kontak);
    }
  });

  it('kontak tanpa @ yang bukan nomor valid memakai pesan kontak', () => {
    for (const kontak of ['halo', '0812', '12345678901', '+1 202 555 0100']) {
      assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak }).galat.kontak, PESAN_GALAT.kontak, kontak);
    }
  });

  it('kontak hanya karakter tak kasatmata dianggap kosong (wajib diisi)', () => {
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak: '​‍' }).galat.kontak, PESAN_GALAT.wajibIsi('WhatsApp atau email'));
  });

  it('kontak lebih dari 254 karakter memakai pesan terlalu panjang', () => {
    const panjang = `${'a'.repeat(250)}@b.com`;
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, kontak: panjang }).galat.kontak, PESAN_GALAT.terlaluPanjang('WhatsApp atau email', 254));
  });

  it('nama dan instansi memakai batas 100 dan 150 karakter', () => {
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, nama: 'a'.repeat(100) }).valid, true);
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, nama: 'a'.repeat(101) }).galat.nama, PESAN_GALAT.terlaluPanjang('Nama lengkap', 100));
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, instansi: 'a'.repeat(150) }).valid, true);
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, instansi: 'a'.repeat(151) }).galat.instansi, PESAN_GALAT.terlaluPanjang('Instansi', 150));
  });

  it('urutan galat mengikuti skema dan kolomPertama = nama bila kosong', () => {
    const hasil = validasi('kerjaSama', { nama: '', instansi: '', bentuk: '', kontak: 'x', pesan: 'a'.repeat(1001) });
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'instansi', 'bentuk', 'kontak', 'pesan']);
    assert.equal(hasil.kolomPertama, 'nama');
  });

  it('masukan bukan objek tidak melempar galat', () => {
    for (const nilai of [undefined, null, 'x', 5]) {
      const hasil = validasi('kerjaSama', nilai);
      assert.equal(hasil.valid, false);
    }
  });
});

describe('validasi kerjaSama: pesan (teksPanjang)', () => {
  it('pesan opsional: kosong, spasi, baris baru, dan karakter tak kasatmata tetap valid', () => {
    for (const pesan of ['', '   ', '\n\n', '​‍', undefined, null]) {
      assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan }).valid, true, JSON.stringify(pesan));
    }
  });

  it('tepat 1000 karakter lolos; 1001 ditolak dengan pesan batas', () => {
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan: 'a'.repeat(1000) }).valid, true);
    const lebih = validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan: 'a'.repeat(1001) });
    assert.equal(lebih.valid, false);
    assert.deepEqual(Object.keys(lebih.galat), ['pesan']);
    assert.equal(lebih.galat.pesan, PESAN_GALAT.terlaluPanjang('Pesan', 1000));
  });

  it('batas dihitung setelah dibersihkan: spasi berlebih dan karakter tak kasatmata tidak dihitung', () => {
    const pesan = `${'a'.repeat(998)}${' '.repeat(5000)}b${'​'.repeat(5000)}`;
    // Setelah dibersihkan: 998 huruf + 1 spasi + 1 huruf = 1000 karakter.
    assert.equal(bersihkanBanyakBaris(pesan).length, 1000);
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan }).valid, true);
  });

  it('baris baru dihitung satu karakter dan baris kosong beruntun digabung sebelum dihitung', () => {
    // Setelah dibersihkan: 997 huruf + '\n\n' + 1 huruf = 1000 karakter.
    const pesan = `${'a'.repeat(997)}\r\n\r\n\r\n\r\n\r\n\r\nb`;
    assert.equal(bersihkanBanyakBaris(pesan).length, 1000);
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan }).valid, true);
    // Satu karakter lebih: 998 huruf + '\n\n' + 1 huruf = 1001.
    const lebih = `${'a'.repeat(998)}\n\n\n\nb`;
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan: lebih }).galat.pesan, PESAN_GALAT.terlaluPanjang('Pesan', 1000));
  });

  it('pesan banyak baris yang melebihi batas ditolak', () => {
    const pesan = `${'a'.repeat(600)}\n${'b'.repeat(401)}`; // 600 + 1 + 401 = 1002
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan }).galat.pesan, PESAN_GALAT.terlaluPanjang('Pesan', 1000));
  });

  it('pesan bukan teks diperlakukan kosong (opsional) dan tidak melempar galat', () => {
    for (const pesan of [123, {}, [], true]) assert.equal(validasi('kerjaSama', { ...KERJA_SAMA_VALID, pesan }).valid, true);
  });
});

// ---------------------------------------------------------------------------
// validasi: afiliator
// ---------------------------------------------------------------------------

describe('validasi afiliator', () => {
  it('isian lengkap valid', () => {
    assert.equal(validasi('afiliator', AFILIATOR_VALID).valid, true);
  });

  it('formulir kosong: lima kolom wajib, latar belakang sudah terisi, jadi empat galat berurutan', () => {
    const hasil = validasi('afiliator', nilaiAwal('afiliator'));
    assert.deepEqual(Object.keys(hasil.galat), ['nama', 'whatsapp', 'email', 'kota']);
    assert.equal(hasil.kolomPertama, 'nama');
  });

  it('mengosongkan tiap kolom menghasilkan galat tepat pada kolom itu (semua wajib)', () => {
    for (const nama of namaKolom('afiliator')) {
      const hasil = validasi('afiliator', { ...AFILIATOR_VALID, [nama]: '' });
      assert.deepEqual(Object.keys(hasil.galat), [nama], nama);
    }
  });

  it('nomor WhatsApp dan email memakai pesan desain', () => {
    assert.equal(validasi('afiliator', { ...AFILIATOR_VALID, whatsapp: '0812' }).galat.whatsapp, 'Nomor WhatsApp tidak valid.');
    assert.equal(validasi('afiliator', { ...AFILIATOR_VALID, email: 'a@@b.com' }).galat.email, PESAN_GALAT.email);
  });

  it('latar belakang di luar opsi ditolak', () => {
    assert.equal(validasi('afiliator', { ...AFILIATOR_VALID, latarBelakang: 'pengusaha' }).galat.latarBelakang, PESAN_GALAT.pilihanTidakDikenal('Latar belakang'));
  });

  it('semua opsi latar belakang lolos', () => {
    for (const o of kolomDari('afiliator', 'latarBelakang').opsi) {
      assert.equal(validasi('afiliator', { ...AFILIATOR_VALID, latarBelakang: o.nilai }).valid, true, o.nilai);
    }
  });
});

// ---------------------------------------------------------------------------
// susunPayload
// ---------------------------------------------------------------------------

describe('susunPayload: kerjaSama dan afiliator', () => {
  it('menyusun payload bersih dari isian valid', () => {
    assert.deepEqual(susunPayload('kerjaSama', KERJA_SAMA_VALID), KERJA_SAMA_PAYLOAD);
    assert.deepEqual(susunPayload('afiliator', AFILIATOR_VALID), AFILIATOR_PAYLOAD);
  });

  it('urutan kunci payload mengikuti skema', () => {
    assert.deepEqual(Object.keys(susunPayload('kerjaSama', KERJA_SAMA_VALID)), ['nama', 'instansi', 'bentuk', 'kontak', 'pesan']);
    assert.deepEqual(Object.keys(susunPayload('afiliator', AFILIATOR_VALID)), ['nama', 'whatsapp', 'email', 'kota', 'latarBelakang']);
  });

  it('kontak berisi nomor menjadi 628...; berisi email menjadi huruf kecil', () => {
    assert.equal(susunPayload('kerjaSama', { ...KERJA_SAMA_VALID, kontak: '+62 812-3456-7890' }).kontak, '6281234567890');
    assert.equal(susunPayload('kerjaSama', { ...KERJA_SAMA_VALID, kontak: ' Halo@Abseninaja.COM ' }).kontak, 'halo@abseninaja.com');
  });

  it('kontak tidak valid dibuang dari payload (bukan null atau mentah)', () => {
    for (const kontak of ['a@@b.com', 'halo', '081234567890@']) {
      assert.ok(!('kontak' in susunPayload('kerjaSama', { ...KERJA_SAMA_VALID, kontak })), kontak);
    }
  });

  it('pesan mempertahankan baris baru dan dibersihkan per baris', () => {
    const payload = susunPayload('kerjaSama', { ...KERJA_SAMA_VALID, pesan: '  Halo,  \r\n\r\n\r\n   kami ingin   bekerja sama. ​\n' });
    assert.equal(payload.pesan, 'Halo,\n\nkami ingin bekerja sama.');
  });

  it('pesan kosong atau hanya karakter tak kasatmata dihilangkan dari payload', () => {
    for (const pesan of ['', '  \n ', '​‍', undefined]) {
      assert.ok(!('pesan' in susunPayload('kerjaSama', { ...KERJA_SAMA_VALID, pesan })), JSON.stringify(pesan));
    }
  });

  it('payload tidak pernah memuat kolom jebakan atau kunci di luar skema', () => {
    for (const jenis of JENIS_BARU) {
      // JSON.parse membuat `__proto__` sebagai kunci milik sendiri (literal objek hanya mengganti prototipe).
      const berbahaya = JSON.parse(`{"__proto__":{"x":1},"constructor":"c","tambahan":"x","${KOLOM_JEBAKAN}":"http://spam.example"}`);
      assert.ok(Object.hasOwn(berbahaya, '__proto__'), 'prasyarat: __proto__ kunci milik sendiri');
      const payload = susunPayload(jenis, { ...VALID[jenis], ...berbahaya });
      assert.ok(!Object.hasOwn(payload, '__proto__'), jenis);
      assert.ok(!('constructor' in payload) || typeof payload.constructor === 'function', jenis);
      assert.ok(!(KOLOM_JEBAKAN in payload), jenis);
      assert.ok(!('tambahan' in payload), jenis);
      assert.deepEqual(Object.keys(payload).filter((k) => !namaKolom(jenis).includes(k)), [], jenis);
    }
  });

  it('tidak mengubah objek masukan', () => {
    for (const jenis of JENIS_BARU) {
      const masuk = { ...VALID[jenis] };
      const salinan = { ...masuk };
      susunPayload(jenis, masuk);
      siapkanKirim(jenis, masuk);
      assert.deepEqual(masuk, salinan);
    }
  });
});

// ---------------------------------------------------------------------------
// siapkanKirim dan honeypot
// ---------------------------------------------------------------------------

describe('siapkanKirim: kerjaSama dan afiliator', () => {
  it('isian valid menghasilkan status siap dengan payload bersih tanpa penanda curiga', () => {
    for (const jenis of JENIS_BARU) {
      const hasil = siapkanKirim(jenis, VALID[jenis]);
      assert.deepEqual(hasil, { status: 'siap', payload: PAYLOAD[jenis] }, jenis);
      assert.ok(!('curiga' in hasil), jenis);
    }
  });

  it('isian tidak valid menghasilkan galat dan kolom pertama menurut urutan skema', () => {
    const hasil = siapkanKirim('kerjaSama', { ...KERJA_SAMA_VALID, instansi: '', kontak: 'halo' });
    assert.equal(hasil.status, 'galat');
    assert.equal(hasil.kolomPertama, 'instansi');
    assert.deepEqual(Object.keys(hasil.galat), ['instansi', 'kontak']);
    assert.ok(!('payload' in hasil));
  });

  it('kolom jebakan terisi: tetap siap, curiga true, dan payload tanpa kolom jebakan', () => {
    for (const jenis of JENIS_BARU) {
      const hasil = siapkanKirim(jenis, { ...VALID[jenis], [KOLOM_JEBAKAN]: 'bot' });
      assert.equal(hasil.status, 'siap', jenis);
      assert.equal(hasil.curiga, true, jenis);
      assert.deepEqual(hasil.payload, PAYLOAD[jenis], jenis);
      assert.ok(!(KOLOM_JEBAKAN in hasil.payload), jenis);
    }
  });

  it('kolom jebakan berisi spasi atau karakter tak kasatmata tidak dihitung terisi', () => {
    for (const isi of ['', '   ', '​']) {
      assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: isi }), false, JSON.stringify(isi));
      assert.ok(!('curiga' in siapkanKirim('afiliator', { ...AFILIATOR_VALID, [KOLOM_JEBAKAN]: isi })));
    }
  });

  it('kolom jebakan terisi tidak menghilangkan galat validasi yang sah', () => {
    const hasil = siapkanKirim('afiliator', { ...AFILIATOR_VALID, kota: '', [KOLOM_JEBAKAN]: 'bot' });
    assert.equal(hasil.status, 'galat');
    assert.deepEqual(Object.keys(hasil.galat), ['kota']);
  });
});

// ---------------------------------------------------------------------------
// Jenis tidak dikenal
// ---------------------------------------------------------------------------

describe('jenis formulir tidak dikenal tetap melempar galat', () => {
  const TIDAK_DIKENAL = ['perusahaan', 'KerjaSama', 'kerja-sama', 'affiliator', '', undefined, null, 5, {}, 'constructor', 'toString', '__proto__', 'hasOwnProperty'];
  const fungsi = {
    nilaiAwal: (j) => nilaiAwal(j),
    validasi: (j) => validasi(j, {}),
    susunPayload: (j) => susunPayload(j, {}),
    siapkanKirim: (j) => siapkanKirim(j, {}),
  };
  for (const [nama, f] of Object.entries(fungsi)) {
    it(`${nama} melempar untuk jenis yang bukan demo, guru, kerjaSama, atau afiliator`, () => {
      for (const jenis of TIDAK_DIKENAL) assert.throws(() => f(jenis), /Jenis formulir tidak dikenal/, String(jenis));
    });
  }

  it('jenis lama dan baru tetap dikenal', () => {
    for (const jenis of ['demo', 'guru', 'kerjaSama', 'afiliator']) assert.doesNotThrow(() => nilaiAwal(jenis), jenis);
  });
});

// ---------------------------------------------------------------------------
// Amplop pengiriman
// ---------------------------------------------------------------------------

describe('kirimFormulir: amplop untuk jenis baru', () => {
  const URL_UJI = 'https://api.contoh.test/landing/formulir';
  const fetchTiruan = () => {
    const f = async (url, init) => {
      f.panggilan.push({ url, init });
      return { ok: true, status: 200 };
    };
    f.panggilan = [];
    return f;
  };

  for (const jenis of JENIS_BARU) {
    it(`${jenis}: POST amplop { jenis, payload, idKirim } tanpa kolom jebakan`, async () => {
      const f = fetchTiruan();
      const { payload } = siapkanKirim(jenis, VALID[jenis]);
      await kirimFormulir(jenis, payload, { url: URL_UJI, fetchFn: f, idKirim: 'id-uji-1' });
      assert.equal(f.panggilan.length, 1);
      assert.equal(f.panggilan[0].init.method, 'POST');
      const badan = JSON.parse(f.panggilan[0].init.body);
      assert.deepEqual(badan, { jenis, payload: PAYLOAD[jenis], idKirim: 'id-uji-1' });
      assert.ok(!(KOLOM_JEBAKAN in badan.payload));
      assert.ok(!('curiga' in badan));
    });

    it(`${jenis}: curiga true muncul di amplop, di luar payload, bila kolom jebakan terisi`, async () => {
      const f = fetchTiruan();
      const siap = siapkanKirim(jenis, { ...VALID[jenis], [KOLOM_JEBAKAN]: 'bot' });
      await kirimFormulir(jenis, siap.payload, { url: URL_UJI, fetchFn: f, idKirim: 'id-uji-2', curiga: siap.curiga });
      const badan = JSON.parse(f.panggilan[0].init.body);
      assert.equal(badan.curiga, true);
      assert.ok(!(KOLOM_JEBAKAN in badan.payload));
    });

    it(`${jenis}: simulasi DEV berhasil, dan nama "uji gagal" memicu gagal`, async () => {
      const siap = siapkanKirim(jenis, VALID[jenis]);
      assert.deepEqual(await kirimFormulir(jenis, siap.payload, { dev: true, url: '', tundaSimulasi: 0 }), { ok: true });
      const gagal = siapkanKirim(jenis, { ...VALID[jenis], nama: '  Uji Gagal ' });
      await assert.rejects(kirimFormulir(jenis, gagal.payload, { dev: true, url: '', tundaSimulasi: 0 }), (e) => e.kode === 'jaringan');
    });

    it(`${jenis}: produksi tanpa endpoint menolak dengan kode nonaktif (tidak pernah berpura-pura sukses)`, async () => {
      const f = fetchTiruan();
      const siap = siapkanKirim(jenis, VALID[jenis]);
      await assert.rejects(kirimFormulir(jenis, siap.payload, { dev: false, url: '', fetchFn: f }), (e) => e.kode === 'nonaktif');
      assert.equal(f.panggilan.length, 0);
    });
  }
});
