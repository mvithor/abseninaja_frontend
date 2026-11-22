// Fungsi murni halaman Fitur Lengkap per peran (F8) tanpa React dan tanpa impor:
// status chip, pengelompokan kartu per grup, id tab berbasis indeks, dan validasi
// data (kata terlarang, batas kata deskripsi, jumlah kartu). Diuji dengan
// node --test (lib/fitur.test.js).
//
// Bentuk data (data/fitur.js, PERAN):
//   peran = { label: {web, mobile}, judul, deskripsi: {web, mobile},
//             tata: 'penuh' | 'ringkas' | 'grup', akordeon?: boolean,
//             ikonGrup?: { [nama grup]: ikon }, verifikasi?, tautanLuar?: { label },
//             sub: [{ judul?, kartu: [kartu] }], catatan?: { teks, verifikasi? } }
//   kartu = { grup, ikon, judul, deskripsi: {web, mobile}, tag: [teks],
//             chip?: 'uji-terbatas' | 'segera', verifikasi?: true | teks }
// Fitur yang sudah berjalan tidak punya `chip` (tampil tanpa label).

// Dua status saja. Nilai (kunci) dipakai di data, label dipakai di tampilan.
// Tidak ada status "berjalan": fitur yang berjalan tampil tanpa chip.
export const STATUS_CHIP = {
  'uji-terbatas': 'Uji terbatas',
  segera: 'Segera',
};

export const DAFTAR_CHIP = Object.keys(STATUS_CHIP);

// Batas panjang deskripsi kartu (kata), dari naskah: web maksimal 14, seluler 8.
export const BATAS_KATA = { web: 14, mobile: 8 };

const adaKunci = (objek, kunci) => Object.prototype.hasOwnProperty.call(objek, kunci);

// Tidak ada chip (undefined) atau salah satu dari dua status. Selain itu (null,
// teks kosong, "berjalan", "toString", "__proto__") ditolak.
export function chipSah(chip) {
  return chip === undefined || (typeof chip === 'string' && adaKunci(STATUS_CHIP, chip));
}

// Label tampil untuk chip; tanpa chip atau chip tak dikenal -> "".
export function labelChip(chip) {
  return typeof chip === 'string' && adaKunci(STATUS_CHIP, chip) ? STATUS_CHIP[chip] : '';
}

// Id tab berbasis indeks (aman untuk atribut id dan aria-labelledby walau label
// berspasi): "peran-0", "peran-1", ...
export function idTabPeran(indeks) {
  return `peran-${indeks}`;
}

// Daftar tab untuk bar tab: [{ id, label }] dengan label = { web, mobile }.
export function buatTabPeran(daftar) {
  if (!Array.isArray(daftar)) return [];
  return daftar.map((p, i) => ({ id: idTabPeran(i), label: p?.label }));
}

// Peran untuk id tab. Id tak dikenal jatuh ke peran pertama; daftar kosong -> null.
export function cariPeran(daftar, id) {
  if (!Array.isArray(daftar) || daftar.length === 0) return null;
  const indeks = daftar.findIndex((_, i) => idTabPeran(i) === id);
  const dipakai = indeks === -1 ? 0 : indeks;
  return { indeks: dipakai, id: idTabPeran(dipakai), peran: daftar[dipakai] };
}

// Kelompokkan kartu per grup. Grup muncul menurut kemunculan pertamanya dan kartu
// di dalam grup mempertahankan urutan aslinya, walau butir satu grup tidak
// berurutan di daftar. Kartu tanpa grup masuk grup bernama "" (tampil tanpa
// label). Butir yang bukan objek dibuang. Bukan array -> [].
export function kelompokkanPerGrup(kartu) {
  if (!Array.isArray(kartu)) return [];
  const hasil = [];
  const peta = new Map();
  kartu.forEach((k) => {
    if (k === null || typeof k !== 'object') return;
    const nama = typeof k.grup === 'string' ? k.grup : '';
    let grup = peta.get(nama);
    if (!grup) {
      grup = { nama, kartu: [] };
      peta.set(nama, grup);
      hasil.push(grup);
    }
    grup.kartu.push(k);
  });
  return hasil;
}

// Isi panel satu peran: [{ judul, tingkat, grup: [{ nama, kartu }] }]. `tingkat` =
// tingkat judul kartu pada sub itu (lihat tingkatJudulSub). Peran tanpa sub
// (array kosong, atau bukan array) menghasilkan [].
export function susunPanel(peran) {
  if (!peran || !Array.isArray(peran.sub)) return [];
  return peran.sub.map((s) => ({
    judul: typeof s?.judul === 'string' ? s.judul : '',
    tingkat: tingkatJudulSub(s),
    grup: kelompokkanPerGrup(s?.kartu),
  }));
}

// Jumlah kartu seluruh sub pada satu peran.
export function jumlahKartu(peran) {
  if (!peran || !Array.isArray(peran.sub)) return 0;
  return peran.sub.reduce((n, s) => n + (Array.isArray(s?.kartu) ? s.kartu.length : 0), 0);
}

// Tingkat judul kartu PER SUB: h4 bila sub punya subjudul h3 (Waka kurikulum, Guru BK),
// h3 bila tidak (kartu langsung di bawah h2 panel). Dihitung per sub, bukan per
// panel, supaya panel yang memuat sub bertajuk dan sub tanpa tajuk tidak melompat
// tingkat judul.
export function tingkatJudulSub(sub) {
  return typeof sub?.judul === 'string' && sub.judul.trim() !== '' ? 'h4' : 'h3';
}

// Tingkat judul satu tingkat di bawah `tingkat` (pemetaan eksplisit): h2 -> h3, h3 -> h4,
// h4 -> h5, h5 -> h6. Selain itu (h6, undefined, teks lain) -> null, bukan tebakan. Dipakai
// tata 'grup': nama grup memakai tingkat sub, judul fitur di dalamnya satu tingkat lebih dalam.
const TURUNAN = { h2: 'h3', h3: 'h4', h4: 'h5', h5: 'h6' };
export function tingkatTurunan(tingkat) {
  return typeof tingkat === 'string' && adaKunci(TURUNAN, tingkat) ? TURUNAN[tingkat] : null;
}

// Akordeon grup (seluler, peran ber-`akordeon`): hanya grup pertama pada sub pertama
// terbuka bawaan. `peta` = { [kunci]: boolean } hasil pilihan pengguna; kunci yang belum
// pernah diubah memakai bawaan. Indeks dipaksa menjadi bilangan (`Number`), jadi kunci
// "0_0" sama untuk 0, '0', dan 0.0. Peta yang bukan objek biasa (null, array, teks)
// diperlakukan sebagai kosong.
const petaSah = (peta) => Object.prototype.toString.call(peta) === '[object Object]';
export function kunciGrup(indeksSub, indeksGrup) {
  return `${Number(indeksSub)}_${Number(indeksGrup)}`;
}
export function terbukaAwal(indeksSub, indeksGrup) {
  return Number(indeksSub) === 0 && Number(indeksGrup) === 0;
}
export function terbukaGrup(peta, indeksSub, indeksGrup) {
  const kunci = kunciGrup(indeksSub, indeksGrup);
  const nilai = petaSah(peta) && adaKunci(peta, kunci) ? peta[kunci] : undefined;
  return typeof nilai === 'boolean' ? nilai : terbukaAwal(indeksSub, indeksGrup);
}
// Peta baru dengan status grup dibalik (peta lama tidak diubah; peta tidak sah dibuang).
export function alihkanGrup(peta, indeksSub, indeksGrup) {
  const dasar = petaSah(peta) ? peta : {};
  return { ...dasar, [kunciGrup(indeksSub, indeksGrup)]: !terbukaGrup(dasar, indeksSub, indeksGrup) };
}

// Id label grup (dirujuk aria-labelledby daftar kartu). Unik per panel dan sub.
export function idGrup(idPanel, indeksSub, indeksGrup) {
  return `${idPanel}-grup-${indeksSub}-${indeksGrup}`;
}

// Jumlah kata. Karakter tak terlihat (mis. spasi lebar nol) dibuang lebih dulu (normalisasiTeks), jadi kata yang disisipi
// karakter itu tetap satu kata dan teks yang hanya berisi karakter tak terlihat bernilai 0.
export function hitungKata(teks) {
  if (typeof teks !== 'string') return 0;
  const t = normalisasiTeks(teks).trim();
  return t === '' ? 0 : t.split(/\s+/).length;
}

// Batas harus objek biasa (atau tidak diberikan): angka, null, atau array melempar TypeError.
const batasSah = (b) => Object.prototype.toString.call(b) === '[object Object]';

// Kartu yang deskripsinya melebihi batas kata. `batas` boleh sebagian ({ web: 10 }):
// sisi yang tidak diberikan memakai BATAS_KATA, jadi kedua sisi selalu diperiksa.
// Batas yang bukan objek biasa, atau bernilai bukan bilangan terhingga tidak negatif,
// melempar TypeError (bukan diam-diam melewatkan pemeriksaan). Hasil: [{ peran, judul, versi, kata }].
export function kartuMelampauiBatas(daftar, batas = BATAS_KATA) {
  if (!batasSah(batas)) throw new TypeError('Batas kata harus objek { web, mobile }.');
  const b = { ...BATAS_KATA, ...batas };
  ['web', 'mobile'].forEach((versi) => {
    if (typeof b[versi] !== 'number' || !Number.isFinite(b[versi]) || b[versi] < 0) {
      throw new TypeError(`Batas kata ${versi} harus bilangan terhingga tidak negatif.`);
    }
  });
  const hasil = [];
  if (!Array.isArray(daftar)) return hasil;
  daftar.forEach((p, i) => {
    (Array.isArray(p?.sub) ? p.sub : []).forEach((s) => {
      (Array.isArray(s?.kartu) ? s.kartu : []).forEach((k) => {
        ['web', 'mobile'].forEach((versi) => {
          const kata = hitungKata(k?.deskripsi?.[versi]);
          if (kata > b[versi]) hasil.push({ peran: i, judul: k.judul, versi, kata });
        });
      });
    });
  });
  return hasil;
}

// Normalisasi teks sebelum pencocokan kata terlarang: bentuk kompatibilitas Unicode
// dinormalkan (NFKC: huruf lebar penuh, ligatur), karakter format (\p{Cf}: soft hyphen,
// U+200B sampai U+200F, U+202A sampai U+202E, U+2060 sampai U+2064, BOM) dan tanda
// gabung (\p{M}) dibuang, spasi Unicode (\p{Zs}, termasuk NBSP) menjadi spasi biasa, dan
// huruf Kiril yang menyerupai Latin dilipat ke Latin (huruf besar tetap besar). Bukan
// teks -> "". Huruf besar dan kecil dipertahankan.
const KIRIL_KE_LATIN = (() => {
  const dasar = [
    [0x0430, 'a'], [0x0435, 'e'], [0x043e, 'o'], [0x0440, 'p'], [0x0441, 'c'], [0x0443, 'y'], [0x0445, 'x'], [0x043a, 'k'],
    [0x0442, 't'], [0x0455, 's'], [0x0456, 'i'], [0x0458, 'j'], [0x043d, 'h'], [0x043c, 'm'], [0x0432, 'b'],
  ];
  const peta = {};
  dasar.forEach(([kode, latin]) => {
    const kecil = String.fromCharCode(kode);
    peta[kecil] = latin;
    peta[kecil.toUpperCase()] = latin.toUpperCase();
  });
  return peta;
})();

export function normalisasiTeks(teks) {
  if (typeof teks !== 'string') return '';
  return teks
    .normalize('NFKC')
    .replace(/[\p{Cf}\p{M}]/gu, '')
    .replace(/\p{Zs}/gu, ' ')
    .replace(/\p{Script=Cyrillic}/gu, (c) => KIRIL_KE_LATIN[c] ?? c);
}

// Kata yang tidak boleh tampil di data halaman Fitur (keputusan pengguna, naskah D1,
// D3, E2, E3, H-9, H-16, H-20). Tiap butir: [nama, pola kata, pola padat].
//  - Pola kata dicocokkan pada teks ternormalisasi. Akar kata memakai `\w*` di kedua sisi
//    sehingga imbuhan tertangkap ("tagihannya", "ditagihkan", "penagihan", "pengujian",
//    "jadwal ujiannya", "WhatsAppnya", "digratiskan", "gratisan"). Tagihan memakai akar
//    "tagih" dan "nagih". "anda" dan "aman" sengaja ketat pada batas kata: "Ananda",
//    "mandala", "keamanan" lolos.
//  - Pola padat dicocokkan pada teks huruf kecil yang dibuang spasi, tanda hubung, garis
//    bawah, dan titik, supaya "Whats App", "Whats-App", "W h a t s A p p", dan "jadwal_ujian"
//    tertangkap. Butir tanpa pola padat (pse, anda, aman) hanya dicocokkan sebagai kata
//    utuh karena tiga huruf atau kata pendek akan sering salah tangkap.
// Pola ini khusus data halaman Fitur: data Paket dan Beranda masih memuat "Demo gratis"
// (bertanda H-20) sampai ada keputusan, jadi tidak memakainya.
// "berjalan" sebagai chip ditolak oleh chipSah (bukan dari teks).
const POLA_TERLARANG = [
  ['whatsapp', /\b\w*whatsapp\w*/i, /whatsapp/],
  ['tagihan', /\b\w*[tn]agih\w*/i, /[tn]agih/],
  ['ujian', /\b\w*ujian\w*/i, /ujian/],
  ['demo gratis', /\bdemo[\s-]+\w*gratis\w*/i, /demo\w*gratis/],
  ['gratis', /\b\w*gratis\w*/i, /gratis/],
  ['tanpa komitmen', /\btanpa[\s-]+komitmen\b/i, /tanpakomitmen/],
  ['mitra psikologi', /\bmitra[\s-]+psikolog\w*/i, /mitrapsikolog/],
  ['enkripsi', /\b\w*enkripsi\w*/i, /enkripsi/],
  ['pse', /\bpse\b/i, null],
  ['uu pdp', /\buu[\s-]*pdp\b/i, /uupdp/],
  ['sertifikasi', /\b\w*sertifikasi\w*/i, /sertifikasi/],
  ['anda', /\banda\b/i, null],
  ['aman', /\baman\b/i, null],
  ['lokasi server', /\blokasi[\s-]+server\b/i, /lokasiserver/],
  ['rekomendasi', /\b\w*rekomendasi\w*/i, /rekomendasi/],
  ['peringatan dini', /\bperingatan[\s-]+dini\b/i, /peringatandini/],
];

// Kata terlarang yang ada di `teks` (nama kata, tanpa duplikat, urutan mengikuti daftar).
export function kataTerlarang(teks) {
  if (typeof teks !== 'string') return [];
  const bersih = normalisasiTeks(teks);
  const padat = bersih.toLowerCase().replace(/[\s\-_.]+/g, '');
  return POLA_TERLARANG.filter(([, kata, rapat]) => kata.test(bersih) || (rapat !== null && rapat.test(padat))).map(([nama]) => nama);
}

// Label peran (label.web) pada PERAN. Pengecualian kata dicocokkan dengan label ini, bukan
// indeks tab, supaya urutan tab boleh berubah tanpa membuka pengecualian di tab lain.
export const LABEL_PERAN_ADMIN = 'Admin sekolah';
export const LABEL_PERAN_WALI = 'Wali murid';
export const LABEL_PERAN_MURID = 'Murid';

// Pengecualian sempit yang disahkan naskah. Tiap pengecualian berlaku hanya untuk SATU
// kata terlarang, pada kartu berjudul tertentu berchip segera, di tab berlabel tertentu.
// Kata terlarang lain pada kartu yang sama tetap ditolak.
//  - tagihan: kartu Keuangan dan SPP di tab Admin sekolah (naskah D1 baris 10, H-11).
//    Di tab lain kata itu tetap terlarang (D3 melarangnya di tab Wali murid).
//  - ujian: kartu Jadwal ujian di tab Wali murid dan tab Murid (naskah D3 dan D4,
//    H-28). Di tab lain, dan pada kartu lain, kata itu tetap terlarang (D1).
const PENGECUALIAN = {
  tagihan: { judul: 'Keuangan dan SPP', peran: [LABEL_PERAN_ADMIN] },
  ujian: { judul: 'Jadwal ujian', peran: [LABEL_PERAN_WALI, LABEL_PERAN_MURID] },
};

// Apakah `kata` (hasil kataTerlarang) boleh muncul pada `kartu` di peran berlabel `labelPeran`.
export function bolehKata(kata, kartu, labelPeran) {
  const aturan = typeof kata === 'string' && adaKunci(PENGECUALIAN, kata) ? PENGECUALIAN[kata] : undefined;
  return Boolean(aturan) && Boolean(kartu) && kartu.judul === aturan.judul && kartu.chip === 'segera' && aturan.peran.includes(labelPeran);
}
export const bolehTagihan = (kartu, labelPeran) => bolehKata('tagihan', kartu, labelPeran);
export const bolehUjian = (kartu, labelPeran) => bolehKata('ujian', kartu, labelPeran);

// Kumpulkan semua teks dari data (objek bersarang), termasuk teks penanda verifikasi.
// Kunci yang bukan teks (ikon, tautan, id, status chip, varian) dilewati.
export const KUNCI_DILEWATI = ['ikon', 'rute', 'href', 'chip', 'id', 'varian'];
export function kumpulkanTeks(nilai) {
  if (typeof nilai === 'string') return [nilai];
  if (Array.isArray(nilai)) return nilai.flatMap(kumpulkanTeks);
  if (nilai !== null && typeof nilai === 'object' && !('$$typeof' in nilai)) {
    return Object.entries(nilai)
      .filter(([kunci]) => !KUNCI_DILEWATI.includes(kunci))
      .flatMap(([, v]) => kumpulkanTeks(v));
  }
  return [];
}

// Teks dianggap berisi bila setelah normalisasi (karakter tak terlihat dibuang) dan pangkas
// masih ada isinya: teks yang hanya berisi spasi, ZWSP, atau soft hyphen dianggap kosong.
const teksIsi = (v) => typeof v === 'string' && normalisasiTeks(v).trim() !== '';
export const TATA_SAH = ['penuh', 'ringkas', 'grup'];
const duaVersiIsi = (v) => Boolean(v) && teksIsi(v.web) && teksIsi(v.mobile);
const penandaSah = (v) => v === undefined || v === true || teksIsi(v);
const ikonSah = (v) => typeof v === 'function' || (typeof v === 'object' && v !== null);
// Bentuk pembanding untuk judul dan nama grup: dinormalkan, dipangkas, huruf kecil, spasi tunggal.
const bentukBanding = (t) => normalisasiTeks(t).trim().toLowerCase().replace(/\s+/g, ' ');

// Validasi data PERAN. Hasil: daftar masalah (teks), kosong bila sah. Memeriksa
// bentuk (label, judul, dua versi deskripsi, tata, grup, tag, ikon berupa komponen), chip
// hanya undefined/uji-terbatas/segera, judul kartu unik per peran dan nama grup
// konsisten per sub (dibandingkan setelah normalisasi, pangkas, dan huruf kecil), serta kata
// terlarang pada seluruh teks tampil termasuk deskripsi seluler, penanda verifikasi, dan
// label tautan luar (dengan pengecualian sempit, lihat bolehKata, yang dicocokkan dengan
// label peran). Teks tingkat peran dipindai sebelum pemeriksaan sub, jadi peran yang `sub`-nya
// rusak tetap dipindai.
export function validasiPeran(daftar) {
  const masalah = [];
  if (!Array.isArray(daftar) || daftar.length === 0) return ['Daftar peran kosong atau bukan array.'];

  daftar.forEach((p, i) => {
    const di = `peran ${i + 1}`;
    if (!duaVersiIsi(p?.label)) masalah.push(`${di}: label web dan seluler wajib.`);
    if (!teksIsi(p?.judul)) masalah.push(`${di}: judul wajib.`);
    if (!duaVersiIsi(p?.deskripsi)) masalah.push(`${di}: deskripsi web dan seluler wajib.`);
    if (!penandaSah(p?.verifikasi)) masalah.push(`${di}: penanda verifikasi peran tidak sah.`);
    if (!TATA_SAH.includes(p?.tata)) masalah.push(`${di}: tata "${String(p?.tata)}" tidak sah (penuh, ringkas, atau grup).`);
    if (p?.akordeon !== undefined && typeof p.akordeon !== 'boolean') masalah.push(`${di}: akordeon harus boolean.`);
    if (p?.tautanLuar !== undefined && !teksIsi(p.tautanLuar?.label)) masalah.push(`${di}: label tautan luar wajib bila ada.`);
    if (p?.catatan !== undefined && !teksIsi(p.catatan?.teks)) masalah.push(`${di}: catatan wajib bila ada.`);
    if (p?.catatan !== undefined && !penandaSah(p.catatan?.verifikasi)) masalah.push(`${di}: penanda catatan tidak sah.`);
    // Teks tingkat peran dipindai sebelum pemeriksaan sub.
    kumpulkanTeks({ label: p?.label, judul: p?.judul, deskripsi: p?.deskripsi, catatan: p?.catatan, verifikasi: p?.verifikasi, tautanLuar: p?.tautanLuar }).forEach((t) =>
      kataTerlarang(t).forEach((k) => masalah.push(`${di}: kata terlarang "${k}" pada "${t}".`)),
    );
    if (!Array.isArray(p?.sub)) {
      masalah.push(`${di}: sub wajib berupa array (boleh kosong).`);
      return;
    }

    const judulKartu = new Set();
    p.sub.forEach((s, j) => {
      if (s?.judul !== undefined && !teksIsi(s.judul)) masalah.push(`${di} sub ${j + 1}: judul sub tidak boleh kosong bila ada.`);
      if (!Array.isArray(s?.kartu) || s.kartu.length === 0) {
        masalah.push(`${di} sub ${j + 1}: kartu wajib berupa array tidak kosong.`);
        return;
      }
      if (typeof s.judul === 'string') {
        kataTerlarang(s.judul).forEach((k) => masalah.push(`${di} sub ${j + 1}: kata terlarang "${k}" pada judul sub.`));
      }
      // Nama grup yang hanya beda huruf, spasi, atau karakter tak terlihat memecah satu grup menjadi dua.
      const varianGrup = new Map();
      s.kartu.forEach((k, n) => {
        const dk = `${di} kartu ${n + 1} (${k?.judul ?? '?'})`;
        if (!teksIsi(k?.judul)) masalah.push(`${dk}: judul wajib.`);
        if (!teksIsi(k?.grup)) masalah.push(`${dk}: grup wajib.`);
        if (!duaVersiIsi(k?.deskripsi)) masalah.push(`${dk}: deskripsi web dan seluler wajib.`);
        if (!Array.isArray(k?.tag) || k.tag.length === 0 || !k.tag.every(teksIsi)) masalah.push(`${dk}: tag wajib berupa daftar teks.`);
        if (!ikonSah(k?.ikon)) masalah.push(`${dk}: ikon wajib berupa komponen (function atau object).`);
        if (!chipSah(k?.chip)) masalah.push(`${dk}: chip "${String(k?.chip)}" tidak sah.`);
        if (!penandaSah(k?.verifikasi)) masalah.push(`${dk}: penanda verifikasi tidak sah.`);
        if (teksIsi(k?.judul)) {
          const kunci = bentukBanding(k.judul);
          if (judulKartu.has(kunci)) masalah.push(`${dk}: judul kartu ganda dalam satu peran.`);
          judulKartu.add(kunci);
        }
        if (teksIsi(k?.grup)) {
          const kunci = bentukBanding(k.grup);
          if (!varianGrup.has(kunci)) varianGrup.set(kunci, new Set());
          varianGrup.get(kunci).add(k.grup);
        }
        kumpulkanTeks({ judul: k?.judul, grup: k?.grup, deskripsi: k?.deskripsi, tag: k?.tag, verifikasi: k?.verifikasi }).forEach((t) => {
          kataTerlarang(t).forEach((kata) => {
            if (bolehKata(kata, k, p.label?.web)) return;
            masalah.push(`${dk}: kata terlarang "${kata}" pada "${t}".`);
          });
        });
      });
      if (p.tata === 'grup') {
        const ikonGrup = p.ikonGrup !== null && typeof p.ikonGrup === 'object' ? p.ikonGrup : {};
        new Set(s.kartu.map((x) => x?.grup).filter(teksIsi)).forEach((nama) => {
          // Hanya kunci milik sendiri: nama grup "constructor" atau "toString" tidak boleh lolos.
          if (!adaKunci(ikonGrup, nama) || !ikonSah(ikonGrup[nama])) masalah.push(`${di} sub ${j + 1}: ikon grup "${nama}" wajib untuk tata grup.`);
        });
      }
      varianGrup.forEach((varian) => {
        if (varian.size > 1) masalah.push(`${di} sub ${j + 1}: nama grup ganda beda huruf atau spasi: ${[...varian].map((v) => `"${v}"`).join(', ')}.`);
      });
    });
  });
  return masalah;
}
