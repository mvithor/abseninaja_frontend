// Tes pengerasan logika formulir F6 (hasil tinjauan): emailValid, bersihkan
// (karakter kendali C1 dan sejenisnya), kebijakan nomor WhatsApp, batas email
// 254 karakter, dan jebakanTerisi untuk nilai bukan teks.
// Jalankan: node --test src/views/landing/lib/
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  bersihkan,
  bersihkanBanyakBaris,
  emailValid,
  jebakanTerisi,
  normalisasiKontak,
  normalisasiWhatsapp,
  siapkanKirim,
  validasi,
} from './formulir.js';
import { KOLOM_JEBAKAN, PESAN_GALAT } from '../data/formulir.js';

const KERJA_SAMA = {
  nama: 'Rina',
  instansi: 'Yayasan Contoh',
  bentuk: 'komunitas-guru',
  kontak: '0812-3456-7890',
  pesan: '',
};

// ---------------------------------------------------------------------------
// emailValid
// ---------------------------------------------------------------------------

describe('emailValid: karakter berbahaya dan bentuk yang bukan satu alamat', () => {
  it('menolak contoh dari tinjauan', () => {
    for (const e of [
      'halo@x.com,',
      'halo@x.com;',
      '<halo@x.com>',
      '"halo"@x.com',
      'mailto:halo@x.com',
      'a@b.12',
      'a@b_c.com',
      '=cmd@x.com',
      '+cmd@x.com',
      '-1+1@x.com',
    ]) {
      assert.equal(emailValid(e), false, e);
    }
  });

  it('menolak tiap karakter , ; < > " ( ) [ ] \\ : di bagian lokal dan di domain', () => {
    for (const ch of [',', ';', '<', '>', '"', '(', ')', '[', ']', '\\', ':']) {
      assert.equal(emailValid(`ha${ch}lo@x.com`), false, `lokal ${ch}`);
      assert.equal(emailValid(`halo@x${ch}y.com`), false, `domain ${ch}`);
      assert.equal(emailValid(`halo@x.co${ch}`), false, `akhir ${ch}`);
    }
  });

  it('menolak awalan rumus =, +, - pada bagian lokal', () => {
    for (const awal of ['=', '+', '-']) assert.equal(emailValid(`${awal}halo@x.com`), false, awal);
  });

  it('+ dan - di tengah bagian lokal tetap sah', () => {
    assert.equal(emailValid('halo+tag@sub.domain.sch.id'), true);
    assert.equal(emailValid('ha-lo+1@x.com'), true);
  });

  it('menolak TLD yang bukan huruf (angka, campuran, tanda hubung)', () => {
    for (const e of ['a@b.12', 'a@b.c1', 'a@b.1c', 'a@b.co-m']) assert.equal(emailValid(e), false, e);
  });

  it('menolak label domain dengan garis bawah atau simbol lain', () => {
    for (const e of ['a@b_c.com', 'a@b.c_d.com', 'a@b!c.com', 'a@b#c.com', 'a@b%c.com']) assert.equal(emailValid(e), false, e);
  });

  it('tetap menerima huruf besar, subdomain, dan angka di label non-TLD', () => {
    for (const e of ['Halo@X.COM', 'halo@mail.sub.domain.sch.id', 'halo@sekolah123.sch.id', 'halo@sub-domain.co.id']) {
      assert.equal(emailValid(e), true, e);
    }
  });

  it('bebas ReDoS untuk label domain dan TLD panjang', () => {
    const kasus = [`a@${'a'.repeat(240)}.${'1'.repeat(10)}`, `a@${'a-'.repeat(120)}.com`, `a@${'a'.repeat(100)}_${'a'.repeat(100)}.com`];
    for (const k of kasus) {
      const mulai = performance.now();
      emailValid(k);
      assert.ok(performance.now() - mulai < 50);
    }
  });
});

describe('emailValid: batas 254 karakter', () => {
  const domain = (n) => `${'b'.repeat(n - 4)}.com`; // panjang total domain n
  const email = (panjang) => `${'a'.repeat(64)}@${domain(panjang - 65)}`;

  it('tepat 254 karakter lolos, 255 ditolak', () => {
    assert.equal(email(254).length, 254);
    assert.equal(email(255).length, 255);
    assert.equal(emailValid(email(254)), true);
    assert.equal(emailValid(email(255)), false);
  });

  it('di kolom kontak: 254 lolos, 255 memakai pesan terlalu panjang', () => {
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA, kontak: email(254) }).valid, true);
    assert.equal(validasi('kerjaSama', { ...KERJA_SAMA, kontak: email(255) }).galat.kontak, PESAN_GALAT.terlaluPanjang('WhatsApp atau email', 254));
  });

  it('di kolom email afiliator: 254 lolos, 255 memakai pesan terlalu panjang', () => {
    const afiliator = { nama: 'Dewi', whatsapp: '0812-3456-7890', email: email(254), kota: 'Bandar Lampung', latarBelakang: 'guru' };
    assert.equal(validasi('afiliator', afiliator).valid, true);
    assert.equal(validasi('afiliator', { ...afiliator, email: email(255) }).galat.email, PESAN_GALAT.terlaluPanjang('Email', 254));
  });
});

// ---------------------------------------------------------------------------
// bersihkan: C1, nonkarakter, surrogat tunggal
// ---------------------------------------------------------------------------

describe('bersihkan: kendali C1, U+FFFE, U+FFFF, dan surrogat tunggal', () => {
  it('membuang seluruh kendali C1 (U+0080 sampai U+009F)', () => {
    for (let kode = 0x80; kode <= 0x9f; kode++) {
      assert.equal(bersihkan(`a${String.fromCodePoint(kode)}b`), 'ab', `U+${kode.toString(16)}`);
    }
  });

  it('membuang U+FFFE dan U+FFFF', () => {
    assert.equal(bersihkan('a￾b￿c'), 'abc');
  });

  it('membuang surrogat tunggal (tinggi atau rendah) tetapi mempertahankan pasangan yang sah', () => {
    assert.equal(bersihkan('a\uD800b'), 'ab');
    assert.equal(bersihkan('a\uDC00b'), 'ab');
    assert.equal(bersihkan('a\uD83Dz'), 'az');
    assert.equal(bersihkan('halo 🙂'), 'halo 🙂');
    assert.equal(bersihkan('🙂'), '🙂');
  });

  it('isian yang hanya berisi karakter itu menjadi kosong', () => {
    assert.equal(bersihkan('\u0080\u0085\u009F￾￿\uD800'), '');
  });

  it('hasil tetap bebas karakter itu pada teks campuran dan tidak menggandakan spasi', () => {
    assert.equal(bersihkan('  a \u0085 b\u009Fc  '), 'a bc');
  });
});

describe('normalisasiKontak dan karakter kendali', () => {
  it('nomor dengan kendali C1 atau nonkarakter di sela digit tetap dinormalisasi', () => {
    assert.deepEqual(normalisasiKontak('0812\u00853456\u009F7890'), { jenis: 'whatsapp', nilai: '6281234567890' });
    assert.deepEqual(normalisasiKontak('￾0812-3456-7890￿'), { jenis: 'whatsapp', nilai: '6281234567890' });
  });

  it('email dengan kendali C1 disisipkan: yang tersisa tetap dinilai', () => {
    assert.deepEqual(normalisasiKontak('ha\u0085lo@x.com'), { jenis: 'email', nilai: 'halo@x.com' });
  });

  it('hanya karakter kendali C1 menjadi null', () => {
    assert.equal(normalisasiKontak('\u0085\u009F'), null);
  });
});

describe('bersihkanBanyakBaris dan U+0085', () => {
  it('U+0085 tetap menjadi pemisah baris (bukan dibuang)', () => {
    assert.equal(bersihkanBanyakBaris('a\u0085b'), 'a\nb');
    assert.equal(bersihkanBanyakBaris('a\u0085\u0085\u0085b'), 'a\n\nb');
  });

  it('kendali C1 lain, nonkarakter, dan surrogat tunggal dibuang di dalam baris', () => {
    assert.equal(bersihkanBanyakBaris('a\u0080b\u009Fc\n d￿e\uD800f'), 'abc\ndef');
  });

  it('pesan dengan U+0085 lolos validasi dan menjadi baris baru di payload', () => {
    const hasil = siapkanKirim('kerjaSama', { ...KERJA_SAMA, pesan: 'baris satu\u0085baris dua' });
    assert.equal(hasil.status, 'siap');
    assert.equal(hasil.payload.pesan, 'baris satu\nbaris dua');
  });
});

// ---------------------------------------------------------------------------
// normalisasiWhatsapp: kebijakan nomor
// ---------------------------------------------------------------------------

describe('normalisasiWhatsapp: kebijakan nomor F6', () => {
  it('menerima tanda kurung di sekitar +62: "(+62) 812 3456 7890"', () => {
    assert.equal(normalisasiWhatsapp('(+62) 812 3456 7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('(+62)812-3456-7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('+(62) 812 3456 7890'), '6281234567890');
  });

  it('menerima awalan 8 tanpa nol: "812-3456-7890" menjadi 628...', () => {
    assert.equal(normalisasiWhatsapp('812-3456-7890'), '6281234567890');
    assert.equal(normalisasiWhatsapp('8123456789'), '628123456789');
    assert.equal(normalisasiWhatsapp(' 812 3456 7890 '), '6281234567890');
  });

  it('awalan 8 tanpa nol tetap tunduk pada batas 9 sampai 13 digit setelah 62', () => {
    assert.equal(normalisasiWhatsapp('81234567'), null); // 8 digit
    assert.equal(normalisasiWhatsapp('812345678'), '62812345678'); // 9 digit
    assert.equal(normalisasiWhatsapp('8123456789012'), '628123456789012'); // 13 digit
    assert.equal(normalisasiWhatsapp('81234567890123'), null); // 14 digit
  });

  it('tetap menolak: plus tanpa 62, +0812, +62 saja, 62 saja, kurung kosong', () => {
    for (const masuk of ['+0812 3456 7890', '+08123456789', '+62', '+62 ', '(+62)', '62', '()', '(', '+8123456789012', '+ 812 3456 7890x']) {
      assert.equal(normalisasiWhatsapp(masuk), null, masuk);
    }
  });

  it('tetap menolak plus di tengah walau ada kurung', () => {
    assert.equal(normalisasiWhatsapp('0812(+)3456789'), null);
    assert.equal(normalisasiWhatsapp('(0812+3456789)'), null);
  });

  it('tetap menolak digit lebar penuh, juga di dalam kurung', () => {
    assert.equal(normalisasiWhatsapp('０８１２３４５６７８９'), null);
    assert.equal(normalisasiWhatsapp('(+６２) 812 3456 7890'), null);
    assert.equal(normalisasiWhatsapp('８１２３４５６７８９'), null);
  });

  it('awalan 7 atau 9 tanpa nol tetap ditolak', () => {
    assert.equal(normalisasiWhatsapp('712345678901'), null);
    assert.equal(normalisasiWhatsapp('912345678901'), null);
  });

  it('kontak: nomor berawalan 8 dan ber-kurung diterima sebagai WhatsApp', () => {
    assert.deepEqual(normalisasiKontak('812-3456-7890'), { jenis: 'whatsapp', nilai: '6281234567890' });
    assert.deepEqual(normalisasiKontak('(+62) 812 3456 7890'), { jenis: 'whatsapp', nilai: '6281234567890' });
  });
});

// ---------------------------------------------------------------------------
// jebakanTerisi: nilai bukan teks
// ---------------------------------------------------------------------------

describe('jebakanTerisi: nilai bukan teks', () => {
  it('nilai bukan teks yang tidak kosong dianggap terisi', () => {
    for (const v of [true, 1, 42, ['x'], { a: 1 }, [0], [''], { a: '' }]) {
      assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: v }), true, JSON.stringify(v));
    }
  });

  it('nilai kosong tetap dianggap kosong', () => {
    for (const v of [false, 0, null, undefined, [], {}, NaN, '', '   ', '​']) {
      assert.equal(jebakanTerisi({ [KOLOM_JEBAKAN]: v }), false, String(JSON.stringify(v)));
    }
  });

  it('nilai bukan teks yang tidak kosong memicu curiga di siapkanKirim tanpa mengubah payload', () => {
    const hasil = siapkanKirim('kerjaSama', { ...KERJA_SAMA, [KOLOM_JEBAKAN]: ['x'] });
    assert.equal(hasil.status, 'siap');
    assert.equal(hasil.curiga, true);
    assert.ok(!(KOLOM_JEBAKAN in hasil.payload));
  });
});
