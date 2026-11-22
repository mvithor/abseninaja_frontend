// Tes fungsi murni Blog (lib/blog.js) dan keutuhan data artikel (data/blog.js).
// Jalankan: node --test "src/views/landing/lib/*.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ID_TAB_SEMUA,
  SEMUA_KATEGORI,
  artikelKisi,
  artikelTerkait,
  artikelUtama,
  blokBernomor,
  buatTabKategori,
  cariBySlug,
  daftarIsi,
  daftarKategori,
  formatMenitBaca,
  formatTanggal,
  gabungPath,
  hitungPerKategori,
  idBagian,
  idTabKategori,
  saring,
  uraikanTanggal,
  urutkanTerbaru,
} from './blog.js';
import { ARTIKEL, URUTAN_KATEGORI, ikonKategori, IKON_BAWAAN } from '../data/blog.js';

const a = (slug, kategori, tanggal, ekstra = {}) => ({ slug, judul: slug, kategori, tanggal, menitBaca: 3, ringkasan: 'x', isi: [], ...ekstra });

describe('formatTanggal', () => {
  it('format Indonesia singkat dari tanggal ISO', () => {
    assert.equal(formatTanggal('2026-11-12'), '12 Nov 2026');
    assert.equal(formatTanggal('2026-10-29'), '29 Okt 2026');
    assert.equal(formatTanggal('2026-11-05'), '5 Nov 2026');
  });

  it('dua belas bulan memakai singkatan sendiri', () => {
    const hasil = Array.from({ length: 12 }, (_, i) => formatTanggal(`2026-${String(i + 1).padStart(2, '0')}-01`));
    assert.deepEqual(hasil, [
      '1 Jan 2026', '1 Feb 2026', '1 Mar 2026', '1 Apr 2026', '1 Mei 2026', '1 Jun 2026',
      '1 Jul 2026', '1 Agu 2026', '1 Sep 2026', '1 Okt 2026', '1 Nov 2026', '1 Des 2026',
    ]);
  });

  it('tahun kabisat: 29 Februari sah hanya pada tahun kabisat', () => {
    assert.equal(formatTanggal('2024-02-29'), '29 Feb 2024');
    assert.equal(formatTanggal('2000-02-29'), '29 Feb 2000');
    assert.equal(formatTanggal('2026-02-29'), '');
    assert.equal(formatTanggal('2100-02-29'), '');
  });

  it('batas hari tiap bulan', () => {
    assert.equal(formatTanggal('2026-04-30'), '30 Apr 2026');
    assert.equal(formatTanggal('2026-04-31'), '');
    assert.equal(formatTanggal('2026-12-31'), '31 Des 2026');
    assert.equal(formatTanggal('2026-12-32'), '');
    assert.equal(formatTanggal('2026-01-00'), '');
  });

  it('tanggal 31 ditolak untuk bulan 30 hari (April, Juni, September, November), diterima untuk bulan 31 hari', () => {
    ['04', '06', '09', '11'].forEach((b) => assert.equal(formatTanggal(`2026-${b}-31`), '', b));
    ['01', '03', '05', '07', '08', '10', '12'].forEach((b) => assert.notEqual(formatTanggal(`2026-${b}-31`), '', b));
  });

  it('bulan di luar 1 sampai 12 ditolak', () => {
    assert.equal(formatTanggal('2026-00-10'), '');
    assert.equal(formatTanggal('2026-13-10'), '');
  });

  it('hanya bentuk YYYY-MM-DD murni; selain itu kosong, tidak melempar', () => {
    ['2026-1-5', '12/11/2026', '2026-11-12T00:00:00Z', ' 2026-11-12', '2026-11-12 ', '', 'kemarin', null, undefined, 20261112, new Date(), {}, []].forEach(
      (x) => assert.equal(formatTanggal(x), ''),
    );
  });

  it('tidak bergantung pada zona waktu: hasil sama di proses dengan TZ berbeda (zona benar-benar diubah)', () => {
    const urlBlog = new URL('./blog.js', import.meta.url).href;
    const skrip = `
      import { formatTanggal, urutkanTerbaru } from ${JSON.stringify(urlBlog)};
      const tgl = ['2026-01-01', '2026-12-31', '2026-03-29', '2026-10-25', '2024-02-29', '2026-11-12'];
      const data = tgl.map((t, i) => ({ slug: 's' + i, tanggal: t }));
      console.log(JSON.stringify({
        offset: new Date(2026, 0, 1, 12).getTimezoneOffset(),
        format: tgl.map(formatTanggal),
        urutan: urutkanTerbaru(data).map((x) => x.slug),
      }));
    `;
    const jalankan = (tz) => {
      const r = spawnSync(process.execPath, ['--input-type=module', '-e', skrip], { env: { ...process.env, TZ: tz }, encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout.trim().split('\n').pop());
    };
    const la = jalankan('America/Los_Angeles');
    const kiri = jalankan('Pacific/Kiritimati');
    const utc = jalankan('UTC');
    // Zona benar-benar berbeda (selisih besar), tetapi keluaran identik.
    assert.notEqual(la.offset, kiri.offset);
    assert.notEqual(la.offset, utc.offset);
    assert.deepEqual(la.format, kiri.format);
    assert.deepEqual(la.format, utc.format);
    assert.deepEqual(la.urutan, kiri.urutan);
    assert.deepEqual(la.urutan, utc.urutan);
    assert.equal(la.format[0], '1 Jan 2026');
    assert.equal(la.format[1], '31 Des 2026');
    assert.deepEqual(la.urutan, ['s1', 's5', 's3', 's2', 's0', 's4']);
  });

  it('uraikan tanggal murni dari teks', () => {
    assert.deepEqual(uraikanTanggal('2026-01-01'), { tahun: 2026, bulan: 1, hari: 1 });
    assert.deepEqual(uraikanTanggal('2026-12-31'), { tahun: 2026, bulan: 12, hari: 31 });
  });
});

describe('formatMenitBaca', () => {
  it('bilangan bulat positif', () => {
    assert.equal(formatMenitBaca(5), '5 menit baca');
    assert.equal(formatMenitBaca(1), '1 menit baca');
    assert.equal(formatMenitBaca(12), '12 menit baca');
  });

  it('pecahan dibulatkan, minimal 1', () => {
    assert.equal(formatMenitBaca(0.4), '1 menit baca');
    assert.equal(formatMenitBaca(4.6), '5 menit baca');
  });

  it('bukan angka terhingga positif -> kosong', () => {
    [0, -3, NaN, Infinity, -Infinity, '5', null, undefined, {}, []].forEach((x) => assert.equal(formatMenitBaca(x), ''));
  });
});

describe('urutkanTerbaru', () => {
  it('terbaru dulu', () => {
    const hasil = urutkanTerbaru([a('lama', 'X', '2026-01-01'), a('baru', 'X', '2026-11-01'), a('tengah', 'X', '2026-06-01')]);
    assert.deepEqual(hasil.map((x) => x.slug), ['baru', 'tengah', 'lama']);
  });

  it('stabil untuk tanggal sama (urutan asli dipertahankan)', () => {
    const asli = Array.from({ length: 12 }, (_, i) => a(`s${i}`, 'X', i % 2 ? '2026-05-05' : '2026-05-06'));
    const hasil = urutkanTerbaru(asli).map((x) => x.slug);
    assert.deepEqual(hasil, ['s0', 's2', 's4', 's6', 's8', 's10', 's1', 's3', 's5', 's7', 's9', 's11']);
  });

  it('tanggal tidak sah di akhir, urutan asli di antara mereka', () => {
    const hasil = urutkanTerbaru([a('x1', 'X', 'rusak'), a('ok', 'X', '2026-01-01'), a('x2', 'X', '2026-02-30')]);
    assert.deepEqual(hasil.map((x) => x.slug), ['ok', 'x1', 'x2']);
  });

  it('tidak mengubah larik asli dan menerima masukan aneh', () => {
    const asli = [a('a', 'X', '2026-01-01'), a('b', 'X', '2026-02-01')];
    const salinan = [...asli];
    urutkanTerbaru(asli);
    assert.deepEqual(asli, salinan);
    assert.deepEqual(urutkanTerbaru(null), []);
    assert.deepEqual(urutkanTerbaru(undefined), []);
    assert.deepEqual(urutkanTerbaru('x'), []);
  });
});

describe('daftarKategori dan hitungPerKategori', () => {
  const data = [a('1', 'Panduan', '2026-11-12'), a('2', 'Absensi', '2026-11-05'), a('3', 'Keuangan', '2026-10-29'), a('4', 'Absensi', '2026-10-01'), a('5', 'Lain', '2026-09-01')];

  it('urutan mengikuti daftar urutan, sisanya menurut kemunculan', () => {
    assert.deepEqual(daftarKategori(data, ['Absensi', 'Keuangan', 'Pembelajaran', 'Fitur', 'Panduan']), ['Absensi', 'Keuangan', 'Panduan', 'Lain']);
  });

  it('tanpa daftar urutan: menurut kemunculan pertama, tanpa duplikat', () => {
    assert.deepEqual(daftarKategori(data), ['Panduan', 'Absensi', 'Keuangan', 'Lain']);
  });

  it('kategori kosong, bukan teks, dan masukan aneh diabaikan', () => {
    assert.deepEqual(daftarKategori([{ kategori: '' }, { kategori: 3 }, null, {}, a('1', 'Satu', '2026-01-01')]), ['Satu']);
    assert.deepEqual(daftarKategori(null), []);
    assert.deepEqual(daftarKategori(data, 'bukan larik'), ['Panduan', 'Absensi', 'Keuangan', 'Lain']);
    assert.deepEqual(daftarKategori(data, ['Absensi', 'Absensi']), ['Absensi', 'Panduan', 'Keuangan', 'Lain']);
  });

  it('hitungan per kategori sesuai isi data, dalam urutan yang sama', () => {
    assert.deepEqual(hitungPerKategori(data, ['Absensi', 'Keuangan', 'Panduan']), [
      { kategori: 'Absensi', jumlah: 2 },
      { kategori: 'Keuangan', jumlah: 1 },
      { kategori: 'Panduan', jumlah: 1 },
      { kategori: 'Lain', jumlah: 1 },
    ]);
    assert.deepEqual(hitungPerKategori([]), []);
    assert.deepEqual(hitungPerKategori(null), []);
  });

  it('jumlah seluruh kategori sama dengan jumlah artikel', () => {
    assert.equal(hitungPerKategori(data).reduce((s, k) => s + k.jumlah, 0), data.length);
  });
});

describe('saring', () => {
  const data = [a('1', 'A', '2026-01-01'), a('2', 'B', '2026-03-01'), a('3', 'A', '2026-02-01')];

  it('semua kategori: semua artikel, terbaru dulu', () => {
    assert.deepEqual(saring(data, SEMUA_KATEGORI).map((x) => x.slug), ['2', '3', '1']);
    assert.deepEqual(saring(data).map((x) => x.slug), ['2', '3', '1']);
    assert.deepEqual(saring(data, null).map((x) => x.slug), ['2', '3', '1']);
  });

  it('satu kategori, terbaru dulu', () => {
    assert.deepEqual(saring(data, 'A').map((x) => x.slug), ['3', '1']);
  });

  it('kategori tak dikenal atau berbeda huruf besar -> kosong', () => {
    assert.deepEqual(saring(data, 'Z'), []);
    assert.deepEqual(saring(data, 'a'), []);
    assert.deepEqual(saring(data, ''), []);
  });

  it('tidak mengubah larik asli', () => {
    const urutan = data.map((x) => x.slug);
    saring(data, 'A');
    assert.deepEqual(data.map((x) => x.slug), urutan);
  });
});

describe('cariBySlug', () => {
  const data = [a('satu', 'A', '2026-01-01'), a('dua', 'B', '2026-01-02')];

  it('menemukan slug persis sama', () => {
    assert.equal(cariBySlug(data, 'dua').slug, 'dua');
  });

  it('tidak ditemukan -> null', () => {
    assert.equal(cariBySlug(data, 'tiga'), null);
    assert.equal(cariBySlug(data, 'Satu'), null);
    assert.equal(cariBySlug(data, 'satu '), null);
    assert.equal(cariBySlug(data, ''), null);
  });

  it('awalan atau bagian dari slug tidak cocok', () => {
    assert.equal(cariBySlug(data, 'sat'), null);
    assert.equal(cariBySlug(data, 'atu'), null);
    assert.equal(cariBySlug(data, 'satu-dua'), null);
  });

  it('masukan aneh dan nama sifat prototipe tidak menyesatkan', () => {
    [null, undefined, 5, {}, []].forEach((x) => assert.equal(cariBySlug(data, x), null));
    ['constructor', '__proto__', 'toString', 'hasOwnProperty'].forEach((x) => assert.equal(cariBySlug(data, x), null));
    assert.equal(cariBySlug(null, 'satu'), null);
    assert.equal(cariBySlug('satu', 'satu'), null);
  });
});

describe('artikelUtama', () => {
  it('yang bertanda utama, bukan yang terbaru', () => {
    const data = [a('baru', 'A', '2026-12-01'), a('pilihan', 'A', '2026-01-01', { utama: true })];
    assert.equal(artikelUtama(data).slug, 'pilihan');
  });

  it('tanpa penanda: yang terbaru; kosong -> null', () => {
    assert.equal(artikelUtama([a('lama', 'A', '2026-01-01'), a('baru', 'A', '2026-02-01')]).slug, 'baru');
    assert.equal(artikelUtama([]), null);
    assert.equal(artikelUtama(null), null);
  });

  it('hanya utama === true yang dihitung', () => {
    const data = [a('x', 'A', '2026-01-01', { utama: 'ya' }), a('y', 'A', '2026-02-01')];
    assert.equal(artikelUtama(data).slug, 'y');
  });
});

describe('artikelTerkait', () => {
  const data = [
    a('ini', 'A', '2026-05-01'),
    a('a-lama', 'A', '2026-01-01'),
    a('a-baru', 'A', '2026-04-01'),
    a('b-baru', 'B', '2026-06-01'),
    a('c-lama', 'C', '2026-02-01'),
  ];

  it('sekategori dulu (terbaru dulu), lalu kategori lain', () => {
    assert.deepEqual(artikelTerkait(data, 'ini', 3).map((x) => x.slug), ['a-baru', 'a-lama', 'b-baru']);
  });

  it('tidak pernah memuat artikelnya sendiri', () => {
    data.forEach((d) => assert.ok(!artikelTerkait(data, d.slug, 10).some((x) => x.slug === d.slug)));
  });

  it('jumlah dibatasi n dan oleh artikel yang ada', () => {
    assert.equal(artikelTerkait(data, 'ini', 1).length, 1);
    assert.equal(artikelTerkait(data, 'ini', 10).length, 4);
    assert.equal(artikelTerkait(data, 'ini').length, 3);
  });

  it('slug tak dikenal atau n tidak sah -> kosong', () => {
    assert.deepEqual(artikelTerkait(data, 'tidak-ada', 3), []);
    [0, -1, 1.5, NaN, Infinity, '3', null].forEach((n) => assert.deepEqual(artikelTerkait(data, 'ini', n), []));
    assert.deepEqual(artikelTerkait(null, 'ini', 3), []);
  });

  it('butir null, undefined, dan bukan objek di data tidak melempar dan tidak muncul', () => {
    const kotor = [null, undefined, 'teks', 42, ...data, true];
    let hasil;
    assert.doesNotThrow(() => {
      hasil = artikelTerkait(kotor, 'ini', 10);
    });
    assert.deepEqual(hasil.map((x) => x.slug), ['a-baru', 'a-lama', 'b-baru', 'c-lama']);
    assert.deepEqual(artikelTerkait([null, undefined], 'x', 3), []);
  });

  it('satu-satunya artikel -> kosong', () => {
    assert.deepEqual(artikelTerkait([a('sendiri', 'A', '2026-01-01')], 'sendiri', 3), []);
  });
});

describe('blokBernomor dan daftarIsi', () => {
  const isi = [
    { tipe: 'p', teks: 'Satu' },
    { tipe: 'h2', teks: 'Bagian A' },
    { tipe: 'kutipan', teks: 'Kutip' },
    { tipe: 'h2', teks: 'Bagian B' },
  ];

  it('judul bagian diberi id berurutan', () => {
    assert.deepEqual(blokBernomor(isi).filter((b) => b.tipe === 'h2').map((b) => b.id), ['bagian-1', 'bagian-2']);
    assert.equal(idBagian(0), 'bagian-1');
  });

  it('tipe tak dikenal, teks kosong, dan butir rusak dibuang', () => {
    const hasil = blokBernomor([{ tipe: 'script', teks: 'x' }, { tipe: 'p', teks: '   ' }, { tipe: 'p' }, null, 'teks', { tipe: 'p', teks: 'sah' }, { tipe: 'p', teks: 3 }]);
    assert.deepEqual(hasil, [{ tipe: 'p', teks: 'sah' }]);
    assert.deepEqual(blokBernomor(null), []);
    assert.deepEqual(blokBernomor('x'), []);
  });

  it('HTML di teks tetap teks biasa (tidak ditafsirkan di sini)', () => {
    const [b] = blokBernomor([{ tipe: 'p', teks: '<img src=x onerror=alert(1)>' }]);
    assert.equal(b.teks, '<img src=x onerror=alert(1)>');
  });

  it('daftar isi diturunkan dari judul bagian dengan id yang sama', () => {
    assert.deepEqual(daftarIsi({ isi }), [
      { teks: 'Bagian A', id: 'bagian-1' },
      { teks: 'Bagian B', id: 'bagian-2' },
    ]);
  });

  it('daftar isi eksplisit menang dan tanpa id', () => {
    assert.deepEqual(daftarIsi({ isi, daftarIsi: ['Siapkan', '  ', 'Bagikan', 5] }), [
      { teks: 'Siapkan', id: null },
      { teks: 'Bagikan', id: null },
    ]);
  });

  it('daftar isi eksplisit yang setelah disaring kosong jatuh ke turunan dari judul bagian', () => {
    [['   '], [''], [5, null], ['', '  ', 7]].forEach((eksplisit) => {
      assert.deepEqual(daftarIsi({ isi, daftarIsi: eksplisit }), [
        { teks: 'Bagian A', id: 'bagian-1' },
        { teks: 'Bagian B', id: 'bagian-2' },
      ]);
    });
    assert.deepEqual(daftarIsi({ isi: [{ tipe: 'p', teks: 'x' }], daftarIsi: ['  '] }), []);
  });

  it('daftar isi eksplisit kosong jatuh ke turunan; tanpa judul -> kosong', () => {
    assert.equal(daftarIsi({ isi, daftarIsi: [] }).length, 2);
    assert.deepEqual(daftarIsi({ isi: [{ tipe: 'p', teks: 'x' }] }), []);
    assert.deepEqual(daftarIsi(null), []);
    assert.deepEqual(daftarIsi({}), []);
  });
});

describe('gabungPath', () => {
  it('menggabung dasar dan slug', () => {
    assert.equal(gabungPath('/blog', 'judul-a'), '/blog/judul-a');
    assert.equal(gabungPath('/blog/', 'judul-a'), '/blog/judul-a');
  });

  it('garis miring ganda di akhir dasar dibuang', () => {
    assert.equal(gabungPath('/blog//', 'x'), '/blog/x');
    assert.equal(gabungPath('/blog///', 'x'), '/blog/x');
  });

  it('slug di-encode', () => {
    assert.equal(gabungPath('/blog', 'a b/c'), '/blog/a%20b%2Fc');
  });
});

describe('artikelKisi dan tab kategori', () => {
  const data = [
    a('utama', 'Hanya-Utama', '2026-11-12', { utama: true }),
    a('1', 'Absensi', '2026-11-05'),
    a('2', 'Tips sekolah', '2026-10-29'),
    a('3', 'Absensi', '2026-10-01'),
  ];

  it('kisi memuat semua artikel kecuali artikel utama', () => {
    assert.deepEqual(artikelKisi(data).map((x) => x.slug), ['1', '2', '3']);
    assert.deepEqual(artikelKisi(null), []);
    assert.deepEqual(artikelKisi([]), []);
  });

  it('kategori yang hanya berisi artikel utama tidak muncul (tidak ada tab kosong)', () => {
    const kategori = daftarKategori(artikelKisi(data));
    assert.ok(!kategori.includes('Hanya-Utama'));
    assert.deepEqual(kategori, ['Absensi', 'Tips sekolah']);
  });

  it('hitungan per kategori sama dengan isi kisi, dan jumlahnya sama dengan jumlah kartu', () => {
    const kisi = artikelKisi(data);
    const hitung = hitungPerKategori(kisi);
    hitung.forEach((k) => assert.equal(saring(kisi, k.kategori).length, k.jumlah, k.kategori));
    assert.equal(hitung.reduce((j, k) => j + k.jumlah, 0), kisi.length);
    assert.equal(saring(kisi, SEMUA_KATEGORI).length, kisi.length);
  });

  it('tanpa artikel utama bertanda, artikel terbaru dianggap utama dan keluar dari kisi', () => {
    const tanpa = [a('lama', 'A', '2026-01-01'), a('baru', 'B', '2026-02-01')];
    assert.deepEqual(artikelKisi(tanpa).map((x) => x.slug), ['lama']);
  });

  it('id tab berbasis indeks: unik, tanpa spasi, aman untuk kategori berspasi', () => {
    const tab = buatTabKategori(['Absensi', 'Tips sekolah', 'A & B / "C"'], 'Semua');
    assert.equal(tab[0].id, ID_TAB_SEMUA);
    assert.equal(tab[0].kategori, SEMUA_KATEGORI);
    assert.equal(tab[0].label, 'Semua');
    assert.deepEqual(tab.slice(1).map((t) => t.id), ['kategori-0', 'kategori-1', 'kategori-2']);
    assert.equal(new Set(tab.map((t) => t.id)).size, tab.length);
    tab.forEach((t) => assert.match(t.id, /^[a-z0-9-]+$/));
    assert.equal(tab[2].kategori, 'Tips sekolah');
    assert.equal(tab[2].label, 'Tips sekolah');
    assert.equal(idTabKategori(4), 'kategori-4');
  });

  it('tanpa kategori hanya ada tab Semua', () => {
    assert.deepEqual(buatTabKategori([], 'Semua').map((t) => t.id), [ID_TAB_SEMUA]);
  });
});

// Keutuhan data artikel dummy (data/blog.js) terhadap desain Blog.dc.html.
describe('data artikel', () => {
  it('tujuh artikel dengan judul, kategori, tanggal, dan menit baca dari desain', () => {
    const ringkas = ARTIKEL.map((x) => [x.judul, x.kategori, formatTanggal(x.tanggal), formatMenitBaca(x.menitBaca)]);
    assert.deepEqual(ringkas, [
      ['Cara memulai absensi QR di sekolah dalam satu minggu', 'Panduan', '12 Nov 2026', '5 menit baca'],
      ['Tujuh kebiasaan absensi yang membuat rekap lebih rapi', 'Absensi', '5 Nov 2026', '4 menit baca'],
      ['Cara membaca laporan keuangan sekolah tanpa pusing', 'Keuangan', '29 Okt 2026', '6 menit baca'],
      ['Mengenali murid yang butuh perhatian lebih awal', 'Pembelajaran', '21 Okt 2026', '3 menit baca'],
      ['Panduan memilih modul untuk sekolah baru', 'Fitur', '12 Nov 2026', '5 menit baca'],
      ['Langkah menyiapkan data murid sebelum semester baru', 'Panduan', '5 Nov 2026', '4 menit baca'],
      ['Mengapa absensi harian penting untuk wali murid', 'Absensi', '29 Okt 2026', '6 menit baca'],
    ]);
  });

  it('slug unik dan aman dipakai di URL', () => {
    const slug = ARTIKEL.map((x) => x.slug);
    assert.equal(new Set(slug).size, slug.length);
    slug.forEach((s) => assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it('tepat satu artikel utama: artikel pertama desain', () => {
    assert.equal(ARTIKEL.filter((x) => x.utama === true).length, 1);
    assert.equal(artikelUtama(ARTIKEL).judul, 'Cara memulai absensi QR di sekolah dalam satu minggu');
  });

  it('semua kategori tercantum di urutan kategori', () => {
    daftarKategori(ARTIKEL).forEach((k) => assert.ok(URUTAN_KATEGORI.includes(k), k));
  });

  it('SEMUA_KATEGORI dan id tab semua tidak sama dengan nama kategori mana pun di data', () => {
    const nama = daftarKategori(ARTIKEL, URUTAN_KATEGORI);
    assert.ok(!nama.includes(SEMUA_KATEGORI));
    assert.ok(!nama.map((k) => k.toLowerCase()).includes(ID_TAB_SEMUA));
    assert.ok(!URUTAN_KATEGORI.includes(SEMUA_KATEGORI));
  });

  it('hitungan di kisi (bukan semua artikel) memakai artikel yang tampil: tab, hitungan, dan sidebar sama', () => {
    const kisi = artikelKisi(ARTIKEL);
    assert.equal(kisi.length, 6);
    assert.deepEqual(hitungPerKategori(kisi, URUTAN_KATEGORI), [
      { kategori: 'Absensi', jumlah: 2 },
      { kategori: 'Keuangan', jumlah: 1 },
      { kategori: 'Pembelajaran', jumlah: 1 },
      { kategori: 'Fitur', jumlah: 1 },
      { kategori: 'Panduan', jumlah: 1 },
    ]);
    daftarKategori(kisi, URUTAN_KATEGORI).forEach((k) => assert.ok(saring(kisi, k).length > 0, k));
  });

  it('ikonKategori: kategori dikenal punya ikon sendiri, tidak dikenal memakai ikon bawaan', () => {
    assert.notEqual(ikonKategori('Absensi'), IKON_BAWAAN);
    assert.equal(ikonKategori('Tidak ada'), IKON_BAWAAN);
    assert.equal(ikonKategori(undefined), IKON_BAWAAN);
  });

  it('penanda dummy masih ada di berkas data selama isinya dummy (hapus tes ini bersama penandanya)', () => {
    ['../data/blog.js', '../data/kalkulator.js'].forEach((rel) => {
      const teks = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
      assert.match(teks, /DUMMY wajib diganti sebelum main/, rel);
    });
    const blog = readFileSync(fileURLToPath(new URL('../data/blog.js', import.meta.url)), 'utf8');
    assert.ok(blog.includes('// DUMMY wajib diganti sebelum main\nexport const ARTIKEL = ['), 'penanda tepat di atas ARTIKEL');
    const kal = readFileSync(fileURLToPath(new URL('../data/kalkulator.js', import.meta.url)), 'utf8');
    ['export const SOAL = [', 'export const OPSI = [', 'export const AMBANG =', 'export const TINGKAT ='].forEach((deklarasi) => {
      const i = kal.indexOf(deklarasi);
      assert.ok(i > 0, deklarasi);
      assert.ok(kal.slice(Math.max(0, i - 160), i).includes('DUMMY wajib diganti sebelum main'), `penanda di atas ${deklarasi}`);
    });
  });

  it('jumlah dan hitungan kategori diturunkan dari data, bukan angka desain (24, 12, 36, 18, 9)', () => {
    const hitung = hitungPerKategori(ARTIKEL, URUTAN_KATEGORI);
    assert.deepEqual(hitung, [
      { kategori: 'Absensi', jumlah: 2 },
      { kategori: 'Keuangan', jumlah: 1 },
      { kategori: 'Pembelajaran', jumlah: 1 },
      { kategori: 'Fitur', jumlah: 1 },
      { kategori: 'Panduan', jumlah: 2 },
    ]);
    assert.equal(hitung.reduce((s, k) => s + k.jumlah, 0), ARTIKEL.length);
  });

  it('isi artikel utama persis desain: sembilan blok, dua judul bagian, satu kutipan', () => {
    const isi = ARTIKEL[0].isi;
    assert.deepEqual(isi.map((b) => b.tipe), ['p', 'p', 'h2', 'p', 'p', 'kutipan', 'h2', 'p', 'p']);
    assert.equal(isi[2].teks, 'Mulai dari yang paling sering dikerjakan');
    assert.equal(isi[5].teks, 'Mulailah dari satu proses saja, lalu tambah modul setelah tim terbiasa.');
    assert.equal(isi[6].teks, 'Ukur hasilnya setiap bulan');
  });

  it('daftar isi artikel utama eksplisit (desain), artikel lain diturunkan dari judul bagian', () => {
    assert.deepEqual(daftarIsi(ARTIKEL[0]).map((b) => b.teks), ['Siapkan data murid', 'Bagikan kartu QR', 'Pantau dari dasbor']);
    assert.deepEqual(daftarIsi(ARTIKEL[1]).map((b) => b.teks), ['Mulai dari yang paling sering dikerjakan', 'Ukur hasilnya setiap bulan']);
  });

  it('tanggal dan menit baca sah, tanpa penanda sementara yang terlihat', () => {
    ARTIKEL.forEach((x) => {
      assert.ok(uraikanTanggal(x.tanggal), x.slug);
      assert.ok(Number.isInteger(x.menitBaca) && x.menitBaca > 0, x.slug);
      const semua = [x.judul, x.ringkasan, ...x.isi.map((b) => b.teks)].join(' ');
      assert.doesNotMatch(semua, /lorem|todo|\[|\]/i, x.slug);
    });
  });

  it('artikel terkait artikel utama: sekategori dulu (Panduan), tiga kartu', () => {
    const terkait = artikelTerkait(ARTIKEL, ARTIKEL[0].slug, 3);
    assert.equal(terkait.length, 3);
    assert.equal(terkait[0].kategori, 'Panduan');
    assert.ok(!terkait.some((x) => x.slug === ARTIKEL[0].slug));
  });
});
