// Tes data halaman Fitur Lengkap per peran (data/fitur.js, data/fiturPeran/*.js) terhadap
// fixture golden dari naskah (lib/fiturGolden.js), dan penjaga koreksi klaim (naskah
// bagian G) serta angka hitungan pada data Untuk Sekolah, Paket, dan Beranda. Semua data
// diimpor langsung (tanpa membaca teks sumber, kecuali audit angka di bagian akhir):
// data/untukSekolah.js dan beranda.js mengimpor ./urlModul.js, bukan ./nav, sehingga bisa
// dimuat di node.
// Jalankan: node --test "src/views/landing/lib/*.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  chipSah,
  idGrup,
  jumlahKartu,
  kartuMelampauiBatas,
  kataTerlarang,
  kumpulkanTeks,
  buatTabPeran,
  susunPanel,
  validasiPeran,
} from './fitur.js';
import { GOLDEN } from './fiturGolden.js';
import { ANALITIK, CTA, HERO, KEAMANAN, LABEL_PANAH, LABEL_TAB, META, MOCK_PERHATIAN, PERAN, PRAKERSA } from '../data/fitur.js';
import * as untukSekolah from '../data/untukSekolah.js';
import * as paket from '../data/paket.js';
import * as beranda from '../data/beranda.js';
import * as analitik from '../data/analitik.js';

// "Verifikasi H-2, H-5" -> ['H-2', 'H-5']; tanpa penanda -> [].
const kode = (v) => (typeof v === 'string' ? [...v.matchAll(/H-\d+/g)].map((m) => m[0]) : []);
const semuaKartu = () => PERAN.flatMap((p) => p.sub.flatMap((s) => s.kartu));
const kartuPeran = (i) => PERAN[i].sub.flatMap((s) => s.kartu);
const IDX = { admin: 0, guru: 1, wali: 2, murid: 3, pmb: 4, kantin: 5, waka: 6, bk: 7, kepsek: 8, jurusan: 9 };
const JUMLAH_KARTU = [10, 14, 17, 15, 27, 12, 11, 13, 1, 6];

describe('struktur data halaman Fitur', () => {
  it('sepuluh tab peran persis naskah C, dengan label web dan seluler', () => {
    assert.deepEqual(
      PERAN.map((p) => p.label),
      [
        { web: 'Admin sekolah', mobile: 'Admin' },
        { web: 'Guru', mobile: 'Guru' },
        { web: 'Wali murid', mobile: 'Wali' },
        { web: 'Murid', mobile: 'Murid' },
        { web: 'Penerimaan murid baru', mobile: 'PMB' },
        { web: 'Admin kantin', mobile: 'Kantin' },
        { web: 'Waka kurikulum', mobile: 'Waka' },
        { web: 'Guru BK', mobile: 'BK' },
        { web: 'Kepala sekolah', mobile: 'Kepala sekolah' },
        { web: 'Kepala jurusan', mobile: 'Jurusan' },
      ],
    );
    assert.equal(LABEL_TAB, 'Pilih peran');
    assert.deepEqual(LABEL_PANAH, { kiri: 'Geser peran ke kiri', kanan: 'Geser peran ke kanan' });
  });

  it('jumlah kartu per tab: 10, 14, 17, 15, 27, 12, 11, 13, 1, 6 (total 126)', () => {
    assert.deepEqual(PERAN.map(jumlahKartu), JUMLAH_KARTU);
    assert.equal(PERAN.map(jumlahKartu).reduce((a, b) => a + b, 0), 126);
    assert.equal(PERAN.length, 10);
  });

  it('PMB: tiga subjudul dengan 15, 4, dan 8 kartu', () => {
    assert.deepEqual(PERAN[IDX.pmb].sub.map((s) => s.judul), ['Admin sekolah', 'Panitia', 'Calon murid dan wali']);
    assert.deepEqual(PERAN[IDX.pmb].sub.map((s) => s.kartu.length), [15, 4, 8]);
  });

  it('subjudul hanya pada PMB; tab lain satu sub tanpa subjudul (Kepala jurusan: grup, bukan sub)', () => {
    PERAN.forEach((p, i) => {
      if (i === IDX.pmb) return;
      assert.equal(p.sub.length, 1, p.label.web);
      assert.equal(p.sub[0].judul, undefined, p.label.web);
    });
  });

  it('data lolos validasi (bentuk, tata, chip, kata terlarang) dan tidak ada deskripsi melampaui batas kata', () => {
    assert.deepEqual(validasiPeran(PERAN), []);
    assert.deepEqual(kartuMelampauiBatas(PERAN), []);
  });

  it('chip hanya undefined, uji-terbatas, atau segera', () => {
    semuaKartu().forEach((kartu) => assert.ok(chipSah(kartu.chip), kartu.judul));
    assert.ok(chipSah(PRAKERSA.chip));
    assert.ok(chipSah(ANALITIK.chip));
  });

  it('id tab unik (sepuluh); nama grup unik per sub; id grup tidak bertabrakan antar sub dan peran', () => {
    assert.equal(new Set(buatTabPeran(PERAN).map((t) => t.id)).size, 10);
    const semua = [];
    PERAN.forEach((p, i) => {
      susunPanel(p).forEach((s, j) => {
        const nama = s.grup.map((g) => g.nama.trim().toLowerCase());
        assert.equal(new Set(nama).size, nama.length, `${p.label.web} sub ${j + 1}: nama grup ganda`);
        s.grup.forEach((_, n) => semua.push(idGrup(`panel-${i}`, j, n)));
      });
    });
    assert.equal(new Set(semua).size, semua.length);
    // Jumlah id = jumlah grup seluruh halaman (tiap grup punya satu id).
    assert.equal(semua.length, PERAN.flatMap((p) => susunPanel(p).flatMap((s) => s.grup)).length);
  });

  it('urutan tampil sama dengan urutan data: susunPanel tidak menata ulang kartu di tab mana pun', () => {
    PERAN.forEach((p) => {
      p.sub.forEach((sub, j) => {
        const tampil = susunPanel(p)[j].grup.flatMap((g) => g.kartu.map((x) => x.judul));
        assert.deepEqual(tampil, sub.kartu.map((x) => x.judul), `${p.label.web} sub ${j + 1}`);
      });
    });
  });

  it('Admin sekolah: kedua kartu grup Data induk berdampingan, lalu Struktur akademik dan jadwal', () => {
    assert.deepEqual(
      kartuPeran(IDX.admin).map((x) => x.judul),
      [
        'Absensi QR di gerbang',
        'Absensi pegawai',
        'Perizinan',
        'Data murid, alumni, dan transfer kelas',
        'Ekskul',
        'Prestasi',
        'Data pegawai dan status',
        'Impor Excel dan pusat unduh',
        'Struktur akademik dan jadwal',
        'Keuangan dan SPP',
      ],
    );
    assert.deepEqual(susunPanel(PERAN[IDX.admin])[0].grup.map((g) => g.nama), ['Presensi', 'Kesiswaan', 'Data induk', 'Akademik', 'Keuangan']);
  });

  it('tata kartu per tab sesuai desain: penuh untuk tab kecil, ringkas untuk tab padat, grup untuk Kantin dan Jurusan', () => {
    assert.deepEqual(
      PERAN.map((p) => p.tata),
      ['penuh', 'ringkas', 'ringkas', 'ringkas', 'ringkas', 'grup', 'penuh', 'penuh', 'penuh', 'grup'],
    );
  });

  it('akordeon seluler hanya untuk Wali murid, Murid, dan PMB', () => {
    assert.deepEqual(
      PERAN.map((p) => p.akordeon === true),
      [false, false, true, true, true, false, false, false, false, false],
    );
  });

  it('tata grup: ikon untuk setiap grup dan jumlah grup (Kantin empat, Jurusan dua)', () => {
    assert.deepEqual(susunPanel(PERAN[IDX.kantin])[0].grup.map((g) => g.nama), ['Kasir dan transaksi', 'Admin kantin', 'Laporan keuangan kantin', 'Konsinyasi']);
    assert.deepEqual(susunPanel(PERAN[IDX.jurusan])[0].grup.map((g) => g.nama), ['Kesiapan dan kompetensi', 'Penempatan dan pemantauan']);
    [IDX.kantin, IDX.jurusan].forEach((i) => {
      susunPanel(PERAN[i])[0].grup.forEach((g) => assert.ok(PERAN[i].ikonGrup[g.nama], `${PERAN[i].label.web}: ${g.nama}`));
    });
  });

  it('tautan luar hanya di tab Kepala jurusan', () => {
    assert.deepEqual(PERAN.map((p) => p.tautanLuar?.label), [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'Selengkapnya di Prakersa']);
  });

  it('semua teks tampil halaman (hero, prakersa, keamanan, cta, banner, meta) bebas kata terlarang', () => {
    const teks = kumpulkanTeks([META, HERO, PRAKERSA, KEAMANAN, CTA, ANALITIK, MOCK_PERHATIAN, LABEL_PANAH]);
    assert.ok(teks.length > 20);
    teks.forEach((t) => assert.deepEqual(kataTerlarang(t), [], t));
  });

  it('meta sesuai naskah E4', () => {
    assert.equal(META.title, 'Fitur Lengkap per Peran | Absenin Aja');
    assert.equal(
      META.description,
      'Fitur Absenin Aja untuk admin, guru, wali, murid, Waka, Guru BK, dan kepala sekolah. Fitur yang belum berjalan diberi label uji terbatas atau segera.',
    );
  });
});

describe('hero: tiga butir tanpa angka hitungan', () => {
  it('Web + HP, Per peran, Per sekolah; tidak ada butir keempat "Label"', () => {
    assert.equal(HERO.statistik.length, 3);
    assert.deepEqual(HERO.statistik.map((s) => [s.angka, s.label]), [
      ['Web + HP', 'Satu data sekolah'],
      ['Per peran', 'Tampilan sendiri'],
      ['Per sekolah', 'Data terpisah'],
    ]);
    HERO.statistik.forEach((s) => assert.doesNotMatch(`${s.angka} ${s.label}`, /\d/));
    assert.equal(kumpulkanTeks(HERO).filter((t) => /^Label$/.test(t)).length, 0);
  });

  it('data halaman tidak memuat legenda status (dihapus 22 Nov)', async () => {
    const modul = await import('../data/fitur.js');
    assert.equal('LEGENDA' in modul, false);
  });
});

describe('teks halaman persis naskah (literal)', () => {
  it('hero A: eyebrow, judul, subjudul, dua tombol (rute tidak tertukar)', () => {
    assert.equal(HERO.eyebrow, 'Produk · Fitur');
    assert.deepEqual(HERO.judul, {
      web: 'Satu data sekolah, *tampilan sendiri untuk tiap peran.*',
      mobile: 'Satu data sekolah, *tampilan tiap peran.*',
    });
    assert.deepEqual(HERO.sub, {
      web: 'Pilih peran untuk melihat fitur yang tersedia. Fitur yang belum berjalan diberi label uji terbatas atau segera.',
      mobile: 'Pilih peran, lihat fitur dan labelnya.',
    });
    assert.deepEqual(HERO.aksiUtama, { label: 'Jadwalkan demo', rute: 'demo' });
    assert.deepEqual(HERO.aksiKedua, { label: 'Lihat paket', rute: 'paket' });
    assert.deepEqual(HERO.statistik.map(({ angka, label, kecil }) => ({ angka, label, kecil })), [
      { angka: 'Web + HP', label: 'Satu data sekolah', kecil: true },
      { angka: 'Per peran', label: 'Tampilan sendiri', kecil: true },
      { angka: 'Per sekolah', label: 'Data terpisah', kecil: true },
    ]);
  });

  it('E0 banner: id, label, chip, judul, deskripsi, tag, tombol', () => {
    const { ikon, ...tanpaIkon } = ANALITIK;
    assert.equal(ikon, undefined);
    assert.deepEqual(tanpaIkon, {
      id: 'analitik-guru',
      label: 'Untuk guru',
      chip: 'segera',
      judul: 'Analitik pembelajaran untuk guru',
      deskripsi: {
        web: 'Guru akan melihat murid yang perlu perhatian, dari nilai dan kehadiran kelas.',
        mobile: 'Guru akan melihat murid yang perlu perhatian.',
      },
      tag: ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut'],
      aksi: { label: 'Lihat Analitik', rute: 'analitik' },
      verifikasi: 'Verifikasi H-5',
    });
  });

  it('E1 Prakersa', () => {
    assert.deepEqual(PRAKERSA, {
      eyebrow: 'Khusus SMK dan MAK',
      judul: 'Jurusan, kompetensi, dan PKL ada di Prakersa',
      sub: {
        web: 'Profil kesiapan kerja murid dari kelas 10 sampai PKL, dengan data yang tersambung ke Absenin Aja.',
        mobile: 'Kesiapan kerja murid, kelas 10 sampai PKL.',
      },
      verifikasi: 'Verifikasi H-17',
      chip: 'uji-terbatas',
      catatan: { web: 'Jurusan dan PKL diaktifkan per sekolah.', mobile: 'Diaktifkan per sekolah.' },
      aksi: { label: 'Buka Prakersa' },
    });
  });

  it('E2 keamanan: judul, subjudul, empat butir, aksi', () => {
    assert.deepEqual(KEAMANAN, {
      judul: { web: 'Akses sesuai peran, data tiap sekolah terpisah', mobile: 'Akses sesuai peran, data sekolah terpisah' },
      sub: { web: 'Tiap peran membuka tampilan dan data sesuai tugasnya.', mobile: 'Tiap peran melihat data sesuai tugasnya.' },
      butir: [
        'Akses sesuai peran: admin, guru, wali, dan murid melihat data sesuai tugasnya.',
        'Data tiap sekolah terpisah dari sekolah lain.',
        'Pegawai yang berhenti diberi status nonaktif beserta alasannya.',
        'Sandi awal wajib diganti.',
      ],
      aksi: { label: 'Lihat keamanan data', rute: 'keamananData' },
    });
  });

  it('E3 CTA: tombol utama ke demo, tombol kedua ke paket', () => {
    assert.deepEqual(CTA, {
      judul: 'Demo bisa dimulai dari peran mana pun.',
      sub: {
        web: 'Jadwalkan demo untuk melihat yang sudah berjalan dan yang masih segera, peran demi peran.',
        mobile: 'Jadwalkan demo, lihat yang sudah berjalan.',
      },
      aksiUtama: { label: 'Jadwalkan demo', rute: 'demo' },
      aksiKedua: { label: 'Lihat paket', rute: 'paket' },
    });
  });
});

describe('golden: PERAN sama dengan tabel D naskah', () => {
  it('fixture golden: sepuluh peran dan jumlah kartu sesuai naskah', () => {
    assert.equal(GOLDEN.length, 10);
    assert.deepEqual(GOLDEN.map((g) => g.sub.reduce((n, s) => n + s.kartu.length, 0)), JUMLAH_KARTU);
  });

  GOLDEN.forEach((g, i) => {
    it(`peran ${i + 1} (${g.label.web}): label, judul, deskripsi, catatan, penanda`, () => {
      const p = PERAN[i];
      assert.deepEqual(p.label, g.label);
      assert.equal(p.judul, g.judul);
      assert.deepEqual(p.deskripsi, g.deskripsi);
      assert.deepEqual(kode(p.verifikasi), g.verifikasiPeran ?? [], 'penanda peran');
      if (g.catatan) {
        assert.ok(p.catatan, 'catatan harus ada');
        assert.equal(p.catatan.teks, g.catatan.teks);
        assert.deepEqual(kode(p.catatan.verifikasi), g.catatan.kode, 'penanda catatan');
      } else {
        assert.equal(p.catatan, undefined, 'peran ini tidak punya catatan');
      }
      assert.equal(p.sub.length, g.sub.length, 'jumlah sub');
      g.sub.forEach((gs, j) => assert.equal(p.sub[j].judul ?? '', gs.judul, `judul sub ${j + 1}`));
    });

    g.sub.forEach((gs, j) => {
      gs.kartu.forEach(([grup, judul, web, mobile, tag, chip, penanda], n) => {
        it(`peran ${i + 1} sub ${j + 1} kartu ${n + 1} (${judul}): grup, judul, deskripsi, tag, chip, penanda`, () => {
          const kartu = PERAN[i].sub[j].kartu[n];
          assert.ok(kartu, 'kartu harus ada pada urutan naskah');
          assert.equal(kartu.grup, grup, 'grup');
          assert.equal(kartu.judul, judul, 'judul');
          assert.equal(kartu.deskripsi.web, web, 'deskripsi web');
          assert.equal(kartu.deskripsi.mobile, mobile, 'deskripsi seluler');
          assert.deepEqual(kartu.tag, tag, 'tag');
          assert.equal(kartu.chip ?? null, chip, 'chip');
          assert.equal(kartu.verifikasi, penanda.length ? `Verifikasi ${penanda.join(', ')}` : undefined, 'penanda verifikasi');
        });
      });
    });
  });

  it('tidak ada kartu atau sub tambahan di luar naskah', () => {
    PERAN.forEach((p, i) => {
      assert.equal(p.sub.length, GOLDEN[i].sub.length);
      p.sub.forEach((s, j) => assert.equal(s.kartu.length, GOLDEN[i].sub[j].kartu.length));
    });
  });
});

describe('status, tab baru, dan kartu penting', () => {
  it('fitur yang berjalan tanpa chip; tab rencana (PMB, Kantin, Waka, BK, Kepala sekolah) semua Segera', () => {
    [IDX.pmb, IDX.kantin, IDX.waka, IDX.bk, IDX.kepsek].forEach((i) => {
      kartuPeran(i).forEach((kartu) => assert.equal(kartu.chip, 'segera', `${PERAN[i].label.web}: ${kartu.judul}`));
    });
    assert.equal(kartuPeran(IDX.admin).find((x) => x.judul === 'Absensi QR di gerbang').chip, undefined);
    assert.equal(kartuPeran(IDX.guru).find((x) => x.judul === 'Jurnal harian mengajar').chip, undefined);
    assert.equal(kartuPeran(IDX.murid).find((x) => x.judul === 'Kartu pelajar QR').chip, undefined);
    assert.equal(kartuPeran(IDX.wali).find((x) => x.judul === 'Rapor').chip, undefined);
  });

  it('hanya dua status dipakai: segera dan uji-terbatas (tidak ada "berjalan")', () => {
    const dipakai = new Set([...semuaKartu().map((x) => x.chip), PRAKERSA.chip, ANALITIK.chip].filter(Boolean));
    assert.deepEqual([...dipakai].sort(), ['segera', 'uji-terbatas']);
  });

  it('LAKSANA dan banner Analitik berchip Segera (E0), bersama-sama', () => {
    assert.equal(kartuPeran(IDX.guru).find((x) => x.judul.startsWith('LAKSANA')).chip, 'segera');
    assert.equal(ANALITIK.chip, 'segera');
    assert.equal(ANALITIK.label, 'Untuk guru');
    assert.equal(ANALITIK.judul, 'Analitik pembelajaran untuk guru');
    assert.equal(ANALITIK.deskripsi.web, 'Guru akan melihat murid yang perlu perhatian, dari nilai dan kehadiran kelas.');
    assert.equal(ANALITIK.deskripsi.mobile, 'Guru akan melihat murid yang perlu perhatian.');
    assert.deepEqual(ANALITIK.tag, ['Impor dari Excel', 'Nilai per tujuan', 'Saran tindak lanjut']);
    assert.deepEqual(ANALITIK.aksi, { label: 'Lihat Analitik', rute: 'analitik' });
    assert.equal(ANALITIK.verifikasi, 'Verifikasi H-5');
  });

  it('peraga Perlu perhatian berlabel permanen "Data contoh" dengan data contoh naskah E0', () => {
    assert.equal(MOCK_PERHATIAN.label, 'Data contoh');
    assert.deepEqual(MOCK_PERHATIAN.ringkasan, [
      { label: 'Kelas', nilai: '5' },
      { label: 'Hadir rata-rata', nilai: '92%' },
      { label: 'Perlu perhatian', nilai: '3' },
    ]);
    assert.deepEqual(MOCK_PERHATIAN.baris.map((b) => [b.teks, b.aksi]), [
      ['Ahmad F. tujuan 1.2 belum tuntas', 'Remedial'],
      ['Ahmad F. kehadiran menurun', 'Pantau'],
      ['Ahmad F. nilai proyek kosong', 'Lengkapi'],
    ]);
  });

  it('kartu Jadwal piket dan Jadwal ujian (tab Wali murid dan Murid) berchip Segera', () => {
    [IDX.wali, IDX.murid].forEach((i) => {
      ['Jadwal piket', 'Jadwal ujian'].forEach((judul) => {
        const kartu = kartuPeran(i).find((x) => x.judul === judul);
        assert.ok(kartu, `${PERAN[i].label.web}: ${judul}`);
        assert.equal(kartu.chip, 'segera', `${PERAN[i].label.web}: ${judul}`);
      });
    });
  });

  it('kata "ujian" hanya pada kartu Jadwal ujian di tab Wali murid dan Murid', () => {
    PERAN.forEach((p, i) => {
      p.sub.flatMap((s) => s.kartu).forEach((kartu) => {
        const ada = kumpulkanTeks({ judul: kartu.judul, deskripsi: kartu.deskripsi, tag: kartu.tag }).some((t) => kataTerlarang(t).includes('ujian'));
        const seharusnya = (i === IDX.wali || i === IDX.murid) && kartu.judul === 'Jadwal ujian';
        assert.equal(ada, seharusnya, `${p.label.web}: ${kartu.judul}`);
      });
    });
  });

  it('kata "tagihan" hanya pada kartu Keuangan dan SPP di tab Admin sekolah', () => {
    PERAN.forEach((p, i) => {
      p.sub.flatMap((s) => s.kartu).forEach((kartu) => {
        const ada = kumpulkanTeks({ judul: kartu.judul, deskripsi: kartu.deskripsi, tag: kartu.tag }).some((t) => kataTerlarang(t).includes('tagihan'));
        assert.equal(ada, i === IDX.admin && kartu.judul === 'Keuangan dan SPP', `${p.label.web}: ${kartu.judul}`);
      });
    });
  });

  it('Guru BK: kartu Tim BK dihapus, dua kartu pemetaan baru ada dan berchip Segera', () => {
    const bk = kartuPeran(IDX.bk);
    assert.equal(bk.some((x) => /tim bk/i.test(x.judul)), false);
    ['Pemetaan jalur karier', 'Pemetaan kesesuaian jurusan kuliah'].forEach((judul) => {
      const kartu = bk.find((x) => x.judul === judul);
      assert.ok(kartu, judul);
      assert.equal(kartu.chip, 'segera');
      assert.equal(kartu.verifikasi, 'Verifikasi H-27');
    });
    assert.equal(bk.find((x) => x.judul === 'Pemetaan minat dan bakat').verifikasi, 'Verifikasi H-16');
    assert.equal(kumpulkanTeks(PERAN).some((t) => /tim bk|mitra psikologi/i.test(t)), false);
  });

  it('Kepala jurusan: lima kartu Uji terbatas dan satu Segera, dua grup', () => {
    const jur = kartuPeran(IDX.jurusan);
    assert.equal(jur.length, 6);
    assert.equal(jur.filter((x) => x.chip === 'uji-terbatas').length, 5);
    assert.deepEqual(jur.filter((x) => x.chip === 'segera').map((x) => x.judul), ['Pemantauan selama PKL']);
    assert.equal(semuaKartu().filter((x) => x.chip === 'uji-terbatas').length, 5);
    jur.forEach((x) => assert.ok(['Kesiapan dan kompetensi', 'Penempatan dan pemantauan'].includes(x.grup), x.judul));
    assert.equal(PERAN[IDX.jurusan].catatan.teks, 'SKKNI adalah Standar Kompetensi Kerja Nasional Indonesia.');
    assert.equal(PRAKERSA.chip, 'uji-terbatas');
  });

  it('Admin kantin: dua belas kartu Segera dalam empat grup, istilah konsinyor dijelaskan sekali', () => {
    assert.equal(kartuPeran(IDX.kantin).length, 12);
    assert.equal(PERAN[IDX.kantin].catatan.teks, 'Konsinyor adalah pemasok yang menitipkan barangnya untuk dijual di kantin.');
    assert.equal(PERAN[IDX.kantin].catatan.verifikasi, 'Verifikasi H-26');
  });

  it('hanya dasbor kepala sekolah yang memuat bulan; LAKSANA tanpa bulan', () => {
    const BULAN = /\b(jan(uari)?|feb(ruari)?|mar(et)?|apr(il)?|mei|jun(i)?|jul(i)?|agu(stus)?|sep(tember)?|okt(ober)?|nov(ember)?|des(ember)?)\b/i;
    PERAN.forEach((p, i) => {
      const teks = kumpulkanTeks({ judul: p.judul, deskripsi: p.deskripsi, sub: p.sub, catatan: p.catatan }).join(' ');
      if (i === IDX.kepsek) assert.match(teks, /januari 2027/i);
      else assert.doesNotMatch(teks, BULAN, `${p.label.web} tidak boleh memuat bulan`);
    });
    assert.doesNotMatch(kumpulkanTeks([HERO, PRAKERSA, KEAMANAN, CTA, ANALITIK]).join(' '), BULAN);
  });

  it('Kepala sekolah: satu kartu; rilis Januari 2027 dikonfirmasi pemilik, jadi kartu dan judul tanpa penanda; penanda H-15 hanya di isi dasbor', () => {
    assert.equal(kartuPeran(IDX.kepsek).length, 1);
    assert.equal(kartuPeran(IDX.kepsek)[0].verifikasi, undefined);
    assert.equal(PERAN[IDX.kepsek].judul, 'Dasbor kepala sekolah dijadwalkan rilis Januari 2027.');
    assert.equal(PERAN[IDX.kepsek].verifikasi, 'Verifikasi H-15');
    assert.match(PERAN[IDX.kepsek].deskripsi.web, /merangkum kondisi sekolah secara agregat/);
    assert.equal(PERAN[IDX.kepsek].catatan.verifikasi, 'Verifikasi H-15');
    assert.equal(semuaKartu().filter((x) => kode(x.verifikasi).includes('H-15')).length, 0);
    untukSekolah.JENIS.forEach((j) => {
      const peran = j.peran.find((x) => x.nama === 'Kepala sekolah');
      assert.equal(peran.deskripsi, 'Dasbor dijadwalkan rilis Januari 2027.');
      assert.equal(peran.verifikasi, undefined, `${j.id}: kalimat tanggal tanpa penanda`);
      assert.equal(peran.chip, 'segera');
    });
  });

  it('butir terkonfirmasi pemilik tidak diberi penanda', () => {
    ['Ekskul', 'Prestasi', 'Data murid, alumni, dan transfer kelas', 'Kartu pelajar QR', 'Impor Excel dan pusat unduh', 'Data pegawai dan status', 'Kehadiran sekolah', 'Rapor'].forEach((judul) => {
      semuaKartu().filter((x) => x.judul === judul).forEach((x) => assert.equal(x.verifikasi, undefined, judul));
    });
    assert.ok(PRAKERSA.verifikasi);
  });

});

describe('koreksi klaim G2: Untuk Sekolah', () => {
  const peran = (jalur, nama) => untukSekolah.JENIS.find((j) => j.id === jalur).peran.find((p) => p.nama === nama);

  it('admin, wali, guru, Waka, BK', () => {
    ['umum', 'smk'].forEach((j) => {
      assert.equal(peran(j, 'Admin dan tata usaha').deskripsi, 'Kelola data, kehadiran, dan jadwal.');
      assert.equal(peran(j, 'Wali murid').deskripsi, 'Kabar kehadiran lewat notifikasi aplikasi.');
      assert.equal(peran(j, 'Guru').deskripsi, 'Absensi mapel, jurnal, dan nilai.');
    });
    assert.deepEqual(
      [peran('umum', 'Waka kurikulum'), peran('umum', 'Guru BK')].map((p) => [p.deskripsi, p.chip]),
      [
        ['Pantau perangkat ajar guru.', 'segera'],
        ['Jurnal dan pemetaan konseling.', 'segera'],
      ],
    );
  });

  it('strip analitik dan butir jenis sekolah', () => {
    const umum = untukSekolah.JENIS.find((j) => j.id === 'umum');
    const smk = untukSekolah.JENIS.find((j) => j.id === 'smk');
    assert.equal(umum.strip.teks, 'LAKSANA, analitik pembelajaran untuk guru, segera dipakai guru, juga lewat akun guru mandiri.');
    assert.equal(umum.strip.chip, 'segera');
    assert.equal(umum.strip.verifikasi, 'Verifikasi H-5, H-23');
    assert.equal(smk.strip.teks, 'Jurusan, kompetensi SKKNI, dan penempatan PKL. Diaktifkan per sekolah.');
    assert.equal(smk.strip.chip, undefined);
    assert.equal(smk.butir[0].teks, 'Fitur sekolah umum, ditambah jurusan dan PKL.');
    const butirAnalitik = umum.butir.find((b) => b.teks === 'Analitik pembelajaran untuk guru');
    assert.equal(butirAnalitik.chip, 'segera');
    assert.equal(butirAnalitik.verifikasi, 'Verifikasi H-5');
  });

  it('perbandingan: Keuangan dan Analitik segera di kedua jalur, baris lain tetap', () => {
    const baris = (m) => untukSekolah.PERBANDINGAN.baris.find((b) => b.modul === m);
    assert.deepEqual([baris('Keuangan dan SPP').umum, baris('Keuangan dan SPP').smk], ['segera', 'segera']);
    assert.deepEqual([baris('Analitik pembelajaran').umum, baris('Analitik pembelajaran').smk], ['segera', 'segera']);
    assert.equal(baris('Analitik pembelajaran').verifikasi, 'Verifikasi H-5');
    assert.deepEqual([baris('Absensi QR').umum, baris('Absensi QR').smk], ['ada', 'ada']);
    assert.deepEqual([baris('Jadwal sekolah').umum, baris('Jadwal sekolah').smk], ['ada', 'ada']);
    assert.deepEqual([baris('Jurusan dan kompetensi').umum, baris('Jurusan dan kompetensi').smk], ['tidak', 'prakersa']);
    assert.deepEqual([baris('PKL dan mitra industri').umum, baris('PKL dan mitra industri').smk], ['tidak', 'prakersa']);
    assert.equal(untukSekolah.PERBANDINGAN.baris.length, 6);
  });

  it('CTA tanpa kata Anda', () => {
    assert.equal(untukSekolah.CTA.judul, 'Mulai dari jenis sekolahnya');
  });
});

describe('koreksi klaim G3: Paket', () => {
  it('hero dan paket lengkap', () => {
    assert.deepEqual(paket.HERO.fakta.map((f) => f.label), ['Demo gratis', 'Pelatihan per peran', 'Dukungan WhatsApp', 'Fitur per peran']);
    assert.equal(paket.LENGKAP.judul, 'Paket lengkap: fitur yang sudah berjalan, dengan fitur Segera menyusul.');
    assert.equal(paket.LENGKAP.sub, undefined);
    assert.deepEqual(paket.LENGKAP.statistik, [{ angka: 'Web + HP', label: 'Satu data' }]);
    assert.equal(paket.LENGKAP.verifikasi, 'Verifikasi H-24');
  });

  it('kartu modul', () => {
    const modul = (j) => paket.LENGKAP.modul.find((m) => m.judul === j);
    assert.equal(paket.LENGKAP.modul.length, 6);
    assert.equal(modul('Jadwal sekolah').deskripsi, 'Kelas, mapel, ekskul.');
    assert.equal(modul('Perizinan').deskripsi, 'Izin tercatat, rekap bisa diunduh.');
    assert.equal(modul('Keuangan dan SPP'), undefined);
    assert.equal(modul('Kabar wali murid').deskripsi, 'Notifikasi di aplikasi wali.');
    assert.equal(modul('Data murid dan pegawai').deskripsi, 'Satu data untuk semua fitur.');
    const a = modul('Analitik pembelajaran');
    assert.equal(a.deskripsi, 'Segera dipakai guru.');
    assert.equal(a.chip, 'segera');
    assert.equal(a.verifikasi, 'Verifikasi H-5');
  });

  it('jalur dan termasuk', () => {
    assert.equal(paket.JALUR.lengkap.deskripsi, 'Fitur yang berjalan, pelatihan, dan pendampingan.');
    assert.equal(paket.JALUR.lengkap.verifikasi, 'Verifikasi H-20, H-24');
    assert.equal(
      paket.JALUR.modular.deskripsi.web,
      'Fitur inti ada di setiap paket. Jurusan, PKL, dan analitik pembelajaran ditambahkan sesuai kebutuhan sekolah.',
    );
    assert.equal(paket.JALUR.modular.deskripsi.mobile, 'Jurusan, PKL, dan analitik ditambah sesuai kebutuhan.');
    assert.equal(paket.JALUR.modular.verifikasi, 'Verifikasi H-24');
    assert.equal(paket.TERMASUK.judul, 'Aplikasi, pelatihan, dan pendampingan');
    assert.equal(paket.TERMASUK.verifikasi, 'Verifikasi H-20');
    const demo = paket.TERMASUK.kartu.find((k) => k.judul === 'Demo gratis');
    assert.equal(demo.deskripsi.web, 'Kebutuhan dipetakan sebelum sekolah memutuskan.');
    assert.equal(demo.verifikasi, 'Verifikasi H-20');
  });

  it('klaim layanan (H-20) bertanda tetapi teksnya tidak diubah (G5)', () => {
    const hero = Object.fromEntries(paket.HERO.fakta.map((f) => [f.label, f.verifikasi]));
    assert.equal(hero['Demo gratis'], 'Verifikasi H-20');
    assert.equal(hero['Dukungan WhatsApp'], 'Verifikasi H-20');
    assert.equal(paket.TERMASUK.kartu.find((k) => k.judul === 'Dukungan WhatsApp').deskripsi, 'Kendala dibantu pada jam kerja sekolah.');
  });
});

describe('koreksi klaim G4: Beranda', () => {
  it('meta, hero, dan fakta', () => {
    assert.equal(beranda.META.description, 'Absensi QR, jadwal, jurnal guru, dan kabar kehadiran untuk wali murid dalam satu sistem sekolah.');
    assert.equal(beranda.HERO.sub.web, 'Absensi QR, jadwal, jurnal guru, dan kabar kehadiran untuk wali murid dalam satu sistem.');
    assert.equal(beranda.HERO.sub.mobile, 'Absensi, jadwal, dan jurnal di satu sistem.');
    assert.equal(beranda.HERO.catatan, null);
    assert.deepEqual(beranda.FAKTA, [{ nilai: 'Web *+ HP*', label: 'Admin di web, guru dan wali di aplikasi' }]);
  });

  it('sebelum dan sesudah', () => {
    assert.deepEqual(beranda.SEBELUM_SESUDAH.sebelum.butir, [
      'Rekap absensi dikerjakan manual',
      'Jurnal mengajar ditulis di buku',
      'Jadwal tersebar di banyak berkas',
      'Wali menelepon sekolah untuk bertanya',
    ]);
    assert.deepEqual(beranda.SEBELUM_SESUDAH.sesudah.butir, [
      'Absensi QR langsung masuk rekap',
      'Jurnal mengajar dicatat di sistem',
      'Jadwal sekolah di satu tempat',
      'Wali menerima kabar otomatis',
    ]);
    assert.equal(beranda.SEBELUM_SESUDAH.sebelum.verifikasi, 'Verifikasi H-25');
    assert.equal(beranda.SEBELUM_SESUDAH.sub.mobile, 'Dicatat sekali, dipakai di semua fitur.');
  });

  it('fitur: judul, kartu, chip Segera, dan banner analitik', () => {
    const modul = (j) => beranda.FITUR.modul.find((m) => m.judul === j);
    assert.equal(beranda.FITUR.judul, 'Fitur yang berjalan membaca *data yang sama*');
    assert.equal(modul('Jadwal sekolah').deskripsi, 'Kelas, mapel, dan ekskul.');
    assert.equal(modul('Kabar wali murid').deskripsi, 'Lewat notifikasi di aplikasi wali.');
    assert.equal(modul('Murid baru').deskripsi, 'Pendaftaran lewat web.');
    ['Keuangan dan SPP', 'Murid baru', 'Kantin'].forEach((j) => assert.equal(modul(j).chip, 'segera', j));
    ['Absensi QR', 'Jadwal sekolah', 'Izin dan rekap', 'Data murid dan pegawai', 'Kabar wali murid'].forEach((j) => assert.equal(modul(j).chip, undefined, j));
    const a = beranda.FITUR.analitik;
    assert.equal(a.chip, 'segera');
    assert.equal(a.verifikasi, 'Verifikasi H-5');
    assert.equal(a.deskripsi.web, 'Guru akan melihat penanda dari nilai dan kehadiran.');
    assert.equal(a.deskripsi.mobile, 'Guru akan dapat penanda, keputusan tetap di guru.');
    const butir = beranda.UNTUK_SEKOLAH.kartu.find((k) => k.id === 'umum').butir;
    assert.deepEqual(butir[2], { teks: 'Analitik pembelajaran untuk guru', chip: 'segera' });
  });

  it('komunikasi, FAQ, dan peraga', () => {
    assert.equal(beranda.KOMUNIKASI.judul, 'Wali murid menerima *kabar kehadiran di aplikasi*');
    assert.equal(beranda.KOMUNIKASI.sub.web, 'Kabar kehadiran sampai ke wali lewat notifikasi di aplikasi.');
    assert.equal(beranda.KOMUNIKASI.sub.mobile, 'Kabar kehadiran lewat notifikasi aplikasi.');
    assert.deepEqual(beranda.KOMUNIKASI.kanal, ['Aplikasi wali', 'Notifikasi otomatis']);
    const faq = beranda.FAQ.kelompok.flatMap((k) => k.butir);
    const jawab = (q) => faq.find((b) => b.q === q);
    assert.equal(jawab('Apa itu Absenin Aja?').a, 'Sistem sekolah untuk absensi QR, jadwal, jurnal guru, dan kabar kehadiran wali murid.');
    assert.equal(jawab('Bisakah dipilih per modul?').a, 'Fitur inti ada di setiap paket. Jurusan, PKL, dan analitik pembelajaran ditambahkan sesuai kebutuhan.');
    assert.equal(jawab('Bisakah dipilih per modul?').verifikasi, 'Verifikasi H-24');
    assert.equal(jawab('Bisakah guru memakai tanpa sekolah berlangganan?').a, 'Bisa. LAKSANA, analitik pembelajaran untuk guru, segera dipakai guru, juga lewat akun guru mandiri.');
    assert.equal(jawab('Bisakah guru memakai tanpa sekolah berlangganan?').verifikasi, 'Verifikasi H-5, H-23');
    assert.deepEqual(beranda.MOCK_DASBOR.statistik[2], { angka: 'Rekap', label: 'otomatis' });
    assert.equal(beranda.MOCK_DASBOR.tersambung.teks, 'Data murid dan kehadiran terhubung otomatis');
    assert.deepEqual(beranda.MOCK_PONSEL.pesan.map((p) => p.waktu), ['06.52', '15.30']);
  });

  it('klaim layanan (H-20) pada langkah pendampingan bertanda, teks tidak berubah (G5)', () => {
    const langkah = beranda.PENDAMPINGAN.langkah.find((l) => l.judul === 'Dukungan WhatsApp');
    assert.deepEqual(langkah, { judul: 'Dukungan WhatsApp', deskripsi: 'Jam kerja sekolah', verifikasi: 'Verifikasi H-20' });
  });
});

describe('pola larangan dasar pada data Untuk Sekolah, Paket, dan Beranda', () => {
  const POLA = /whatsapp|tagihan|keuangan|ujian|\banda\b|demo gratis/i;
  const SKIP = ['ikon', 'rute', 'href', 'chip', 'id', 'varian'];

  // Kumpulkan setiap string yang cocok beserta objek induknya.
  function cari(nilai, jalur, hasil) {
    if (Array.isArray(nilai)) {
      nilai.forEach((v, i) => {
        if (typeof v === 'string') {
          if (POLA.test(v)) hasil.push({ jalur: `${jalur}[${i}]`, teks: v, induk: null });
        } else cari(v, `${jalur}[${i}]`, hasil);
      });
    } else if (nilai !== null && typeof nilai === 'object' && !('$$typeof' in nilai)) {
      Object.entries(nilai).forEach(([kunci, v]) => {
        if (SKIP.includes(kunci)) return;
        if (typeof v === 'string') {
          if (POLA.test(v)) hasil.push({ jalur: `${jalur}.${kunci}`, teks: v, induk: nilai });
        } else cari(v, `${jalur}.${kunci}`, hasil);
      });
    }
  }

  // Butir yang memang diizinkan: fitur Segera (chip, atau baris tabel Segera di kedua
  // jalur) dan klaim layanan bertanda H-20 sampai ada keputusan (G5).
  const diizinkan = (induk) =>
    Boolean(induk) &&
    (induk.chip === 'segera' || (induk.umum === 'segera' && induk.smk === 'segera') || /H-20/.test(induk.verifikasi ?? ''));

  const berkas = { untukSekolah, paket, beranda };
  const cocok = Object.entries(berkas).flatMap(([nama, modul]) => {
    const hasil = [];
    Object.entries(modul).forEach(([ekspor, nilai]) => cari(nilai, `${nama}.${ekspor}`, hasil));
    return hasil;
  });

  it('setiap kecocokan adalah butir yang diizinkan (Segera atau H-20)', () => {
    const pelanggar = cocok.filter((c) => !diizinkan(c.induk));
    assert.deepEqual(pelanggar.map((c) => `${c.jalur}: ${c.teks}`), []);
  });

  it('daftar butir yang diizinkan persis seperti yang disetujui (butir baru harus disengaja)', () => {
    assert.deepEqual(
      cocok.map((c) => c.jalur).sort(),
      [
        'beranda.FITUR.modul[4].judul',
        'beranda.FITUR.modul[4].deskripsi',
        'beranda.PENDAMPINGAN.langkah[3].judul',
        'paket.HERO.fakta[0].label',
        'paket.HERO.fakta[2].label',
        'paket.TERMASUK.kartu[0].judul',
        'paket.TERMASUK.kartu[2].judul',
        'untukSekolah.PERBANDINGAN.baris[2].modul',
      ].sort(),
    );
  });

  it('tidak ada "semua modul" (huruf apa pun) pada ketiga berkas', () => {
    Object.entries(berkas).forEach(([nama, modul]) => {
      kumpulkanTeks(Object.values(modul)).forEach((t) => assert.doesNotMatch(t, /semua modul/i, `${nama}: ${t}`));
    });
  });

  it('klaim lama yang dikoreksi tidak kembali', () => {
    const POLA_LAMA = [
      /\b(12|13|10) (modul|peran|portal)\b/i,
      /dua belas modul/i,
      /2\.000/,
      /Jan \*?2026/,
      /10 \*peran\*/,
      /SPP dicatat/,
      /Tagihan SPP/i,
      /dan SPP terhubung/,
      /Aplikasi dan WhatsApp/,
      /lewat aplikasi (dan|atau) WhatsApp/i,
      /Templat pesan/,
      /tanpa menelepon/,
      /di hari yang sama/i,
      /\b0 jam\b/,
      /Solusi terintegrasi/,
      /Demo gratis, tanpa komitmen/,
      /Bukan hanya aplikasi/,
      /tambah kapan saja/,
      /jadwal, dan keuangan/i,
      /Tersedia untuk semua jenis sekolah/,
    ];
    Object.entries(berkas).forEach(([nama, modul]) => {
      kumpulkanTeks(Object.values(modul)).forEach((t) => POLA_LAMA.forEach((p) => assert.doesNotMatch(t, p, `${nama}: ${t}`)));
    });
  });
});

// Audit angka hitungan: angka atau kata jumlah (modul, portal, peran, tab, fitur) tidak
// boleh ditulis tangan pada data landing, kecuali yang konsisten dengan datanya sendiri.
// Halaman Fitur tidak menampilkan hitungan sama sekali (hero tanpa angka, naskah A).
describe('audit angka hitungan pada data landing', () => {
  const FOLDER = fileURLToPath(new URL('../data/', import.meta.url));
  // Komentar baris dibuang: yang diperiksa hanya teks yang tampil. `//` dalam string
  // (https://...) aman karena pemotongan hanya untuk `//` yang didahului spasi atau awal baris.
  const bacaTanpaKomentar = (nama) =>
    readFileSync(FOLDER + nama, 'utf8')
      .split('\n')
      .map((baris) => baris.replace(/(^|\s)\/\/.*$/, '$1'))
      .join('\n');
  const berkasData = readdirSync(FOLDER).filter((n) => n.endsWith('.js'));

  it('tidak ada hitungan modul, portal, atau peran yang ditulis tangan', () => {
    const POLA = /\b(\d+|dua belas|sebelas|sepuluh|sembilan|delapan|tujuh|enam|lima|empat|tiga)\s+(modul|portal|peran pengguna|peran)\b/i;
    berkasData.forEach((nama) => {
      assert.doesNotMatch(bacaTanpaKomentar(nama), POLA, `${nama} memuat hitungan modul, portal, atau peran`);
    });
  });

  it('tidak ada hitungan tab yang ditulis tangan', () => {
    const POLA = /\b(\d+|dua belas|sebelas|sepuluh|sembilan|delapan|tujuh|enam|lima|empat|tiga)\s+tab\b/i;
    berkasData.forEach((nama) => {
      assert.doesNotMatch(bacaTanpaKomentar(nama), POLA, `${nama} memuat hitungan tab`);
    });
  });

  it('data halaman Fitur tidak memuat angka sama sekali pada teks tampil kecuali tahun rilis dasbor dan nomor penanda', () => {
    const teks = kumpulkanTeks([META, HERO, PRAKERSA, KEAMANAN, CTA, ANALITIK, MOCK_PERHATIAN, PERAN.map((p) => ({ label: p.label, judul: p.judul, deskripsi: p.deskripsi, catatan: p.catatan, sub: p.sub }))]);
    const berAngka = teks.filter((t) => /\d/.test(t) && !/^Verifikasi H-[\d, H-]+$/.test(t));
    // Angka yang sah: "Januari 2027" (dasbor), "kelas 10 sampai PKL" (Prakersa), "1.2" dan "92%" dan "5" dan "3" (peraga contoh), "(TP)" tidak.
    const sah = (t) => /Januari 2027|kelas 10|tujuan 1\.2|^92%$|^5$|^3$/.test(t) || /^Perlu perhatian$/.test(t);
    assert.deepEqual(berAngka.filter((t) => !sah(t)), []);
  });

  it('halaman Analitik: "dua belas fitur dalam empat kelompok" sesuai daftar fitur dan kelompoknya', () => {
    assert.equal(analitik.MODUL.length, 12);
    assert.equal(analitik.KELOMPOK.filter((k) => k.id !== 'semua').length, 4); // tab "Semua" bukan kelompok
    assert.match(analitik.FITUR.sub.web, /^Dua belas fitur dalam empat kelompok/);
    assert.equal(analitik.FITUR.sub.mobile, '12 fitur dalam 4 kelompok');
  });

});
