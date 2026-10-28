// Penyusun tampilan Ringkasan kelas (FR-10, L-2) dan Beranda lintas kelas (L-1). Fungsi murni tanpa impor selain
// modul murni lain (lihat ringkasan.test.js), supaya dapat diuji dengan `node --test` tanpa Vite.
//
// Semua ANGKA dan keputusan berasal dari server (GET /lad/kelas/:id/ringkasan dan GET /lad/kelas/ringkasan).
// Berkas ini hanya menyusun: urutan, kalimat, lebar segmen, dan tata letak grafik. Ia tidak menghitung ulang
// penanda, tidak membuat skor gabungan, dan tidak pernah menyebut siswa "aman".

import {
  RENTANG, legendaRentang, rentangNilai, tampilAngka,
} from '../rentang.js';
import { POLA_INFO, URUTAN_PRIORITAS, namaTp } from '../evaluasi/penjelasan.js';
import { judulLm } from '../label.js';

// ------------------------------------------------------------------ umum

const a = (x) => tampilAngka(x);

/** Persentase bergaya Indonesia dengan paling banyak satu desimal: 1.9 menjadi "1,9%", 4 menjadi "4%". */
export const persenTeks = (x) => (x === null || x === undefined ? '-' : `${tampilAngka(x)}%`);

const jamak = (n, satu, banyak = satu) => `${n} ${n === 1 ? satu : banyak}`;

/** Daftar kata bergaya Indonesia: "1", "1 dan 2", "1, 2, dan 3". */
const daftarKata = (daftar) => {
  const x = daftar.map(String);
  if (x.length <= 1) return x.join('');
  if (x.length === 2) return `${x[0]} dan ${x[1]}`;
  return `${x.slice(0, -1).join(', ')}, dan ${x[x.length - 1]}`;
};

/** Pola yang dihitung pada kartu "Perlu perhatian", menurut urutan prioritas tampilan. */
export const POLA_PERHATIAN = Object.freeze(URUTAN_PRIORITAS.filter((k) => POLA_INFO[k].jenis === 'perhatian'));

const POLA_PENDEK = Object.freeze({
  P2: 'Alpa', P3: 'Proyek', P1: 'TP', P4: 'Menurun',
});

/**
 * Rincian siswa perlu perhatian menurut pola utama, urutan prioritas, tanpa pola yang jumlahnya 0.
 * `pendek` dipakai di tabel Beranda yang sempit: "Alpa 4 · Proyek 3 · TP 4 · Menurun 1".
 */
export function rincianPerhatian(kartu, { pendek = false } = {}) {
  const per = kartu?.perhatian_per_pola_utama ?? {};
  return POLA_PERHATIAN
    .filter((k) => Number(per[k]) > 0)
    .map((k) => `${pendek ? POLA_PENDEK[k] : POLA_INFO[k].judul} ${per[k]}`)
    .join(' · ');
}

/**
 * Angka pada tab Perlu Perhatian: jumlah siswa golongan perhatian (pengayaan bukan peringatan). Nol tidak
 * ditampilkan, karena angka 0 bisa terbaca "aman" padahal bisa juga berarti data belum cukup untuk menandai siapa pun.
 */
export function lencanaPerhatian(data) {
  const n = Number(data?.kartu?.perhatian);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ------------------------------------------------------------------ sebaran capaian per TP

/** Urutan segmen batang: dari yang terendah ke yang tertinggi, "belum dinilai" paling kanan. */
export const URUTAN_RENTANG = Object.freeze([
  RENTANG.SELURUH, RENTANG.SEBAGIAN, RENTANG.MENCAPAI, RENTANG.PENGAYAAN, RENTANG.BELUM_DINILAI,
]);

export const NAMA_RENTANG = Object.freeze({
  [RENTANG.SELURUH]: 'Belum mencapai seluruh',
  [RENTANG.SEBAGIAN]: 'Belum mencapai sebagian',
  [RENTANG.MENCAPAI]: 'Mencapai',
  [RENTANG.PENGAYAAN]: 'Mencapai pengayaan',
  [RENTANG.BELUM_DINILAI]: 'Belum dinilai',
});

/**
 * Lima baris legenda sebaran. Rentang angka memakai kalimat yang sama dengan tab Nilai ("41 sampai di bawah 66"),
 * bukan "41 sampai 65", karena nilai boleh berdesimal dan 65,5 termasuk rentang itu.
 */
export function legendaSebaran(ambang) {
  const batas = new Map(legendaRentang(ambang).map((l) => [l.rentang, l.batas]));
  return URUTAN_RENTANG.map((r) => ({ rentang: r, nama: NAMA_RENTANG[r], batas: batas.get(r) ?? '' }));
}

/** Label baris TP: kode yang diberi guru bila ada, kalau tidak "lm.tp" (mis. "2.1"). */
export const labelBarisTp = (lm, t) => (t.kode && String(t.kode).trim() ? String(t.kode).trim() : `${lm}.${t.tp}`);

/**
 * Segmen satu batang 100%. `lebar` adalah bagian dari jumlah siswa (0 sampai 100) untuk menentukan apakah angka
 * muat di dalam segmen; panjang segmen sendiri diatur flex di tampilan.
 */
export function segmenBatang(jumlah) {
  const n = URUTAN_RENTANG.map((r) => Number(jumlah?.[r] ?? 0));
  const total = n.reduce((x, y) => x + y, 0);
  return URUTAN_RENTANG.map((r, i) => ({
    rentang: r,
    nama: NAMA_RENTANG[r],
    n: n[i],
    lebar: total > 0 ? (n[i] * 100) / total : 0,
    tampil: n[i] > 0,
  }));
}

/** Kalimat untuk pembaca layar: semua segmen disebut, termasuk yang 0. */
export function ariaSebaran(label, segmen) {
  return `${label}: ${segmen.map((s) => `${s.n} ${s.nama.toLowerCase()}`).join(', ')}`;
}

/** Teks kolom "Di bawah KKTP": "13 dari 28 (46%)". Tanpa siswa yang dinilai, tidak ada persentase untuk disebut. */
export function teksDiBawahKktp(t) {
  if (!t || !t.dinilai) return 'Belum ada nilai';
  const persen = t.persen_di_bawah_kktp ?? Math.round((t.di_bawah_kktp * 100) / t.dinilai);
  return `${t.di_bawah_kktp} dari ${t.dinilai} (${persen}%)`;
}

/** Judul kelompok LM pada sebaran, mis. "LM 2. Aljabar". */
export const judulKelompok = (m) => judulLm({ urutan: m.lm, nama: m.lm_nama });

/** NR kelas sebuah LM untuk judul kelompok. */
export const teksNrKelas = (m) => (m.nr_kelas === null || m.nr_kelas === undefined ? 'NR kelas belum ada' : `NR kelas ${a(m.nr_kelas)}`);

/** Struktur LM dan TP (nama, kode) dari ringkasan, untuk merangkai kalimat bukti dengan penjelasan.js. */
export function strukturDariRingkasan(data) {
  const peta = new Map();
  (data?.sebaran_tp ?? []).forEach((m) => {
    peta.set(m.lm, { urutan: m.lm, nama: m.lm_nama ?? '', tp: m.tp.map((t) => ({ urutan: t.tp, kode: t.kode ?? '' })) });
  });
  (data?.tren_lm ?? []).forEach((m) => {
    if (!peta.has(m.lm)) peta.set(m.lm, { urutan: m.lm, nama: m.lm_nama ?? '', tp: [] });
  });
  return [...peta.values()].sort((x, y) => x.urutan - y.urutan);
}

// ------------------------------------------------------------------ tren NR per LM

const nilaiAda = (v) => v !== null && v !== undefined && Number.isFinite(Number(v));

/**
 * Susun grafik garis NR kelas per LM dalam koordinat SVG. Titik hanya ada untuk LM yang NR kelasnya dapat dihitung;
 * posisi LM tetap sama walau ada yang kosong, supaya "LM 3" tidak pindah ke tempat "LM 2". Sumbu Y memakai
 * kelipatan 10 (atau 5 untuk rentang sempit), selalu memuat garis KKTP, dan tidak pernah di luar 0 sampai 100.
 *
 * Titik `kosong` (dipakai false) ditandai berlubang: siswa yang terhitung masih sedikit, jadi rata-rata itu lemah
 * sebagai pembanding.
 */
export function susunGrafikTren(tren, kktp, {
  lebar = 520, tinggi = 230, kiri = 48, kanan = 20, atas = 34, bawah = 36,
} = {}) {
  const daftar = Array.isArray(tren) ? tren : [];
  const nilai = daftar.filter((m) => nilaiAda(m.nr_rata)).map((m) => Number(m.nr_rata));
  if (daftar.length === 0 || nilai.length === 0) return null;

  const batas = [...nilai];
  if (nilaiAda(kktp)) batas.push(Number(kktp));
  const rendah = Math.min(...batas);
  const tinggiNilai = Math.max(...batas);
  const langkah = tinggiNilai - rendah <= 20 ? 10 : 20;
  const min = Math.max(0, Math.floor((rendah - 3) / langkah) * langkah);
  const maks = Math.min(100, Math.ceil((tinggiNilai + 3) / langkah) * langkah);
  const rentangY = maks - min || 1;

  const tinggiIsi = tinggi - atas - bawah;
  const lebarIsi = lebar - kiri - kanan;
  const pita = lebarIsi / daftar.length;
  const y = (v) => atas + tinggiIsi * (1 - (v - min) / rentangY);
  const x = (i) => kiri + pita * (i + 0.5);

  const ticks = [];
  for (let v = min; v <= maks; v += langkah) ticks.push({ nilai: v, y: y(v) });

  const titik = daftar
    .map((m, i) => (nilaiAda(m.nr_rata)
      ? {
        lm: m.lm, x: x(i), y: y(Number(m.nr_rata)), nilai: Number(m.nr_rata), n: m.jumlah_siswa, kosong: !m.dipakai,
      }
      : null))
    .filter(Boolean);

  return {
    lebar,
    tinggi,
    kiri,
    kanan,
    atas,
    bawah,
    min,
    maks,
    ticks,
    titik,
    labelX: daftar.map((m, i) => ({ lm: m.lm, x: x(i) })),
    yKktp: nilaiAda(kktp) ? y(Number(kktp)) : null,
    kktp: nilaiAda(kktp) ? Number(kktp) : null,
  };
}

/** Kalimat untuk pembaca layar: seluruh grafik dalam satu paragraf. */
export function ariaTren(tren, kktp) {
  const bagian = (tren ?? []).map((m) => (nilaiAda(m.nr_rata)
    ? `LM ${m.lm} ${a(m.nr_rata)} (${jamak(m.jumlah_siswa, 'siswa')} dihitung)`
    : `LM ${m.lm} belum ada rata-rata`));
  return `Rata-rata nilai per lingkup materi: ${bagian.join('; ')}.${nilaiAda(kktp) ? ` KKTP ${a(kktp)}.` : ''}`;
}

/** Baris tabel di bawah grafik: LM, siswa dihitung, dan banyak siswa dengan NR di bawah KKTP. */
export function barisTren(tren) {
  return (tren ?? []).map((m) => ({
    lm: m.lm,
    nama: judulLm({ urutan: m.lm, nama: m.lm_nama }),
    siswa: nilaiAda(m.nr_rata) ? String(m.jumlah_siswa) : '-',
    nr: nilaiAda(m.nr_rata) ? a(m.nr_rata) : 'Belum ada',
    bawah: nilaiAda(m.nr_rata) ? jamak(m.di_bawah_kktp, 'siswa') : '-',
    kosong: nilaiAda(m.nr_rata) && !m.dipakai,
  }));
}

// ------------------------------------------------------------------ kehadiran per LM

/**
 * Skala batang alpa: 10% dari catatan, atau kelipatan 5 di atasnya bila ada LM yang melewati 10%, supaya batang
 * tidak terpotong dan tidak pernah salah dibaca penuh.
 */
export function skalaAlpa(lmList) {
  const maks = Math.max(0, ...(lmList ?? []).map((m) => Number(m.persen_alpa ?? 0)));
  return maks <= 10 ? 10 : Math.ceil(maks / 5) * 5;
}

export function barisKehadiran(kehadiran) {
  const daftar = kehadiran?.lm ?? [];
  const skala = skalaAlpa(daftar);
  return {
    skala,
    baris: daftar.map((m) => ({
      lm: m.lm,
      judul: m.lm === null ? 'Belum dikaitkan ke LM' : judulLm({ urutan: m.lm, nama: m.lm_nama }),
      pertemuan: m.pertemuan,
      catatan: m.catatan,
      alpa: m.catatan > 0 ? persenTeks(m.persen_alpa) : 'Belum ada catatan',
      jumlahAlpa: m.alpa,
      lebar: m.catatan > 0 ? Math.min(100, (Number(m.persen_alpa) * 100) / skala) : 0,
      sakitIzin: m.catatan > 0
        ? `Sakit ${persenTeks(m.persen_sakit)} · Izin ${persenTeks(m.persen_izin)}`
        : 'Kehadiran belum diisi untuk pertemuan ini',
    })),
  };
}

/** Kalimat penutup kartu kehadiran. Pola Sering alpa baru dinilai bila pertemuan tercatat cukup. */
export function kalimatSeringAlpa(kehadiran) {
  const total = (kehadiran?.lm ?? []).reduce((s, m) => s + m.pertemuan, 0);
  const aMin = kehadiran?.a_min;
  const min = kehadiran?.pertemuan_min;
  if (total === 0) return { teks: 'Belum ada pertemuan tercatat.', tautan: true };
  if (total < min) {
    return { teks: `Pola Sering alpa belum bisa dinilai: baru ${jamak(total, 'pertemuan')} tercatat, dibutuhkan paling sedikit ${min}.`, tautan: true };
  }
  const n = kehadiran.siswa_sering_alpa;
  if (n === 0) return { teks: `Belum ada siswa dengan ${aMin} alpa atau lebih.`, tautan: true };
  return { teks: `${jamak(n, 'siswa')} mencapai ${aMin} alpa atau lebih.`, tautan: true };
}

// ------------------------------------------------------------------ proyek individu

/** Hanya proyek individu: proyek kelompok tidak dipakai pola mana pun (PRD T-3, R-06). */
export function statusProyek(proyek) {
  return (proyek ?? [])
    .filter((p) => p.jenis === 'INDIVIDU')
    .map((p) => {
      const nama = p.nama || `Proyek ${p.proyek}`;
      const segmen = [
        { kunci: 'dinilai', nama: 'Dinilai', n: p.bernilai },
        { kunci: 'nol', nama: 'Bernilai 0', n: p.nol },
        { kunci: 'kosong', nama: 'Belum diisi', n: p.kosong },
      ];
      const total = segmen.reduce((s, x) => s + x.n, 0);
      const ket = `${p.bernilai} dinilai · ${p.nol} bernilai 0 · ${p.kosong} belum diisi`;
      return {
        proyek: p.proyek,
        nama,
        ket,
        aria: `${nama}: ${ket}`,
        segmen: segmen.map((s) => ({ ...s, lebar: total > 0 ? (s.n * 100) / total : 0, tampil: s.n > 0 })),
      };
    });
}

// ------------------------------------------------------------------ siswa perlu perhatian (teratas)

const nilaiTerendah = (tp) => tp.reduce((t, x) => (Number(x.nilai) < Number(t.nilai) ? x : t), tp[0]);

/**
 * Satu kalimat alasan untuk pola utama, memuat nilai asalnya. Kalimat disusun dari bukti server dan memakai
 * nama TP dan LM yang sama dengan tab Perlu Perhatian. Tanpa bukti, yang tampil judul polanya.
 */
export function alasanSingkat(item, ctx) {
  const kode = item.pola_utama;
  const b = item.pola?.[kode]?.bukti;
  const judul = POLA_INFO[kode]?.judul ?? 'Ditandai';
  if (!b) return judul;
  switch (kode) {
    case 'P2':
      return `${b.jumlah_a} alpa dari ${b.pertemuan_tercatat} pertemuan tercatat. Batasnya ${a(ctx.parameter.a_min)} alpa.`;
    case 'P3': {
      const nama = new Map((ctx.proyek ?? []).map((p) => [p.proyek, p.nama || `Proyek ${p.proyek}`]));
      return `${daftarKata(b.proyek.map((no) => nama.get(no) ?? `Proyek ${no}`))} bernilai 0 (tidak dikumpulkan).`;
    }
    case 'P1': {
      if (!Array.isArray(b.tp) || b.tp.length === 0) return judul;
      const t = nilaiTerendah(b.tp);
      const rem = t.remedial_terbaru === null || t.remedial_terbaru === undefined
        ? 'Belum ada remedial.'
        : `Remedial terbaru ${a(t.remedial_terbaru)} masih di bawah KKTP.`;
      const lain = b.tp.length > 1 ? ` Dan ${jamak(b.tp.length - 1, 'TP')} lain.` : '';
      return `${namaTp(t.lm, t.tp, ctx.lm)} bernilai ${a(t.nilai)}, di bawah KKTP ${a(ctx.parameter.kktp)}. ${rem}${lain}`;
    }
    case 'P4': {
      const urut = b.nr.map(a).join(' ke ');
      const kelas = b.acuan_kelas && Array.isArray(b.nr_kelas) && b.nr_kelas.length > 1
        ? ` Kelas ${a(b.nr_kelas[0])} ke ${a(b.nr_kelas[b.nr_kelas.length - 1])}.`
        : '';
      return `NR LM turun ${urut}.${kelas}`;
    }
    default:
      return judul;
  }
}

/** Chip pola satu siswa menurut urutan prioritas; yang pertama (pola utama) diisi penuh. */
export function chipPola(item) {
  const urut = [...(item.penanda ?? [])].sort((x, y) => URUTAN_PRIORITAS.indexOf(x) - URUTAN_PRIORITAS.indexOf(y));
  return urut.map((k) => ({ kode: k, teks: POLA_INFO[k]?.judul ?? k, utama: k === item.pola_utama }));
}

/**
 * Baris daftar teratas. `ctx.parameter` memuat ambang dan cacah yang dipakai kalimat: kktp dari kelas, a_min dari
 * kartu kehadiran. Siswa tanpa nama (data lama) tampil sebagai nomor urutnya.
 */
export function barisPerhatian(data) {
  const parameter = { kktp: data.kelas.kktp, a_min: data.kehadiran?.a_min };
  const ctx = { lm: strukturDariRingkasan(data), parameter, proyek: data.proyek };
  return (data.perhatian_teratas ?? []).map((x) => ({
    siswaId: x.siswa_id,
    nama: x.nama ?? (x.urutan ? `Siswa nomor ${x.urutan}` : `Siswa ${x.siswa_id}`),
    alasan: alasanSingkat(x, ctx),
    chip: chipPola(x),
  }));
}

// ------------------------------------------------------------------ yang perlu dilengkapi

export const BATAS_BARIS_LENGKAPI = 3;

export const labelTpRingkas = (t) => `LM ${t.lm} · TP ${t.kode && String(t.kode).trim() ? String(t.kode).trim() : t.tp}`;

/**
 * Daftar "Yang perlu dilengkapi". Tiap butir punya tujuan (`tab`) dan, untuk TP, TP yang disorot di tab Nilai.
 * TP dan proyek dibatasi `BATAS_BARIS_LENGKAPI` baris; sisanya diringkas dalam satu baris.
 */
export function butirLengkapi(data) {
  const p = data.perlu_dilengkapi ?? { tp: [], proyek: [], siswa_belum_cukup: { jumlah_siswa: 0, per_pola: [] } };
  const butir = [];

  p.tp.slice(0, BATAS_BARIS_LENGKAPI).forEach((t) => {
    butir.push({
      kunci: `tp-${t.lm}-${t.tp}`,
      teks: `${labelTpRingkas(t)}: ${jamak(t.jumlah_siswa, 'siswa')} belum punya nilai`,
      aksi: 'Isi nilai',
      tab: 'nilai',
      sorot: { lm: t.lm, tp: t.tp },
    });
  });
  if (p.tp.length > BATAS_BARIS_LENGKAPI) {
    const sisa = p.tp.slice(BATAS_BARIS_LENGKAPI);
    butir.push({
      kunci: 'tp-lain',
      teks: `${jamak(sisa.length, 'TP')} lain juga belum lengkap (${jamak(sisa.reduce((s, t) => s + t.jumlah_siswa, 0), 'isian')})`,
      aksi: 'Buka tabel nilai',
      tab: 'nilai',
      sorot: null,
    });
  }

  p.proyek.slice(0, BATAS_BARIS_LENGKAPI).forEach((x) => {
    butir.push({
      kunci: `proyek-${x.proyek}`,
      teks: `${x.nama || `Proyek ${x.proyek}`}: ${jamak(x.jumlah_siswa, 'siswa')} belum dinilai`,
      aksi: 'Isi proyek',
      tab: 'proyek',
      sorot: null,
    });
  });
  if (p.proyek.length > BATAS_BARIS_LENGKAPI) {
    butir.push({
      kunci: 'proyek-lain',
      teks: `${jamak(p.proyek.length - BATAS_BARIS_LENGKAPI, 'proyek')} lain juga belum lengkap`,
      aksi: 'Buka proyek',
      tab: 'proyek',
      sorot: null,
    });
  }

  const bc = p.siswa_belum_cukup;
  if (bc.jumlah_siswa > 0) {
    butir.push({
      kunci: 'siswa',
      teks: `${jamak(bc.jumlah_siswa, 'siswa')} berstatus data belum cukup`,
      rinci: bc.per_pola.map((e) => `${POLA_INFO[e.pola]?.judul ?? e.pola}: ${jamak(e.jumlah_siswa, 'siswa')}${e.alasan ? `. ${e.alasan}` : ''}`),
      aksi: 'Lihat siswa',
      tab: 'perhatian',
      sorot: null,
    });
  }
  return butir;
}

// ------------------------------------------------------------------ kartu angka

/** Empat kartu angka di puncak Ringkasan. Teksnya sengaja tidak menyebut siapa pun "aman". */
export function kartuAngka(data) {
  const k = data.kartu;
  const ambangPengayaan = a(data.kelas.ambang_pengayaan);
  const kl = k.kelengkapan;
  return {
    perhatian: {
      angka: k.perhatian,
      satuan: `dari ${jamak(k.jumlah_siswa, 'siswa')}`,
      rinci: k.perhatian > 0
        ? rincianPerhatian(k)
        : 'Tidak ada siswa yang ditandai. Lihat juga kartu Data belum cukup di sebelahnya.',
    },
    pengayaan: {
      angka: k.pengayaan,
      satuan: 'siswa',
      rinci: `Nilai TP di atas batas pengayaan ${ambangPengayaan}, tanpa TP yang belum tuntas dan tanpa proyek bernilai 0.`,
    },
    belumCukup: {
      angka: k.belum_cukup,
      satuan: 'siswa',
      rinci: 'Belum bisa dinilai. Ini bukan berarti aman.',
    },
    kelengkapan: {
      angka: kl.persen === null ? '-' : `${kl.persen}%`,
      persen: kl.persen ?? 0,
      rinci: kl.total === 0
        ? 'Belum ada isian TP.'
        : `${kl.terisi} dari ${kl.total} isian terisi. ${kl.kosong} belum.`,
    },
  };
}

// ------------------------------------------------------------------ siswa pada satu segmen (klik batang)

/**
 * Daftar siswa pada satu rentang untuk satu TP, dihitung dari masukan kelas yang sama (nilai asli per siswa).
 * Urut menurut nomor urut siswa. Rentang BELUM_DINILAI memuat siswa yang selnya kosong.
 */
export function siswaPadaRentang({
  siswa, nilaiTp, tpId, rentang, ambang,
}) {
  const nilai = new Map();
  (nilaiTp ?? []).forEach((n) => { if (n.tp_id === tpId) nilai.set(n.siswa_id, n.nilai); });
  return (siswa ?? [])
    .map((s) => {
      const v = nilai.has(s.id) ? nilai.get(s.id) : null;
      return { id: s.id, nama: s.nama, urutan: s.urutan, nilai: v === null || v === undefined ? null : Number(v) };
    })
    .filter((s) => rentangNilai(s.nilai, ambang) === rentang)
    .sort((x, y) => (x.urutan ?? 0) - (y.urutan ?? 0));
}

/** Ambil id TP dari struktur masukan kelas menurut nomor LM dan nomor TP. */
export function cariTpId(lm, lmNo, tpNo) {
  const m = (lm ?? []).find((x) => x.urutan === lmNo);
  const t = m?.tp?.find((x) => x.urutan === tpNo);
  return t ? t.id : null;
}

// ------------------------------------------------------------------ Beranda lintas kelas

export const HARI_TERTINGGAL = 14;
export const KOSONG_TERTINGGAL_PERSEN = 10;
const MS_HARI = 24 * 60 * 60 * 1000;

/** Banyak hari penuh sejak `iso`; null bila waktu tidak ada atau tidak terbaca. */
export function hariSejak(iso, sekarang = new Date()) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((new Date(sekarang).getTime() - t) / MS_HARI));
}

/** "Hari ini", "1 hari lalu", "14 hari lalu", "3 bulan lalu". */
export function teksUmur(iso, sekarang = new Date()) {
  const h = hariSejak(iso, sekarang);
  if (h === null) return '-';
  if (h === 0) return 'Hari ini';
  if (h < 60) return `${h} hari lalu`;
  return `${Math.floor(h / 30)} bulan lalu`;
}

/** Keadaan satu kelas pada Beranda: apakah angkanya boleh dibaca sebagai angka. */
export const KEADAAN = Object.freeze({
  ADA: 'ADA',
  GALAT: 'GALAT',
  TANPA_RINGKASAN: 'TANPA_RINGKASAN',
  TANPA_SISWA: 'TANPA_SISWA',
  TANPA_STRUKTUR: 'TANPA_STRUKTUR',
});

export function keadaanKelas(k) {
  const r = k.ringkasan;
  // Tanpa objek ringkasan sama sekali: server ringkasan tidak terjangkau (daftar kelas dimuat dari cadangan).
  if (!r) return KEADAAN.TANPA_RINGKASAN;
  if (!r.kartu) return KEADAAN.GALAT;
  if (Number(k.jumlah_siswa) === 0) return KEADAAN.TANPA_SISWA;
  if (r.struktur_kosong) return KEADAAN.TANPA_STRUKTUR;
  return KEADAAN.ADA;
}

/** Bagian siswa perlu perhatian dari seluruh kelas, 0 sampai 100; null bila angka tidak bisa dibaca. */
export function persenPerhatian(k) {
  if (keadaanKelas(k) !== KEADAAN.ADA) return null;
  const { perhatian, jumlah_siswa: n } = k.ringkasan.kartu;
  return n > 0 ? Math.round((perhatian * 100) / n) : null;
}

/** Persen isian TP yang masih kosong (0 sampai 100); null bila tidak ada isian. */
export function persenKosong(k) {
  const kl = k.ringkasan?.kartu?.kelengkapan;
  if (!kl || kl.total === 0) return null;
  return Math.round((kl.kosong * 100) / kl.total);
}

const banding = (x, y) => String(x).localeCompare(String(y), 'id', { numeric: true });

/**
 * Kelas nyata diurutkan dari persentase siswa perlu perhatian tertinggi; yang angkanya tidak bisa dibaca
 * (galat, tanpa siswa, tanpa struktur) di bawah, bukan di atas, supaya tidak tampak lebih baik atau lebih buruk.
 * Seri: jumlah perhatian, lalu data belum cukup, lalu nama.
 */
export function urutkanKelas(daftar) {
  // Angka kelas yang tidak terbaca tidak boleh ikut menentukan urutan, jadi dibaca sebagai -1.
  const kartu = (k) => (keadaanKelas(k) === KEADAAN.ADA ? k.ringkasan.kartu : null);
  // Persentase tanpa pembulatan, supaya 12/34 dan 4/11 tidak seri karena pembulatan.
  const nilaiUrut = (k) => (kartu(k) ? (kartu(k).perhatian * 100) / kartu(k).jumlah_siswa : -1);
  return [...daftar].sort((x, y) => {
    const d = nilaiUrut(y) - nilaiUrut(x);
    if (d !== 0) return d;
    const dp = (kartu(y)?.perhatian ?? -1) - (kartu(x)?.perhatian ?? -1);
    if (dp !== 0) return dp;
    const db = (kartu(y)?.belum_cukup ?? -1) - (kartu(x)?.belum_cukup ?? -1);
    if (db !== 0) return db;
    return banding(x.nama_kelas, y.nama_kelas) || banding(x.mapel, y.mapel);
  });
}

/** Pisahkan kelas nyata dan kelas kasus latihan (hanya-baca, dicatat terpisah). */
export function pisahKelas(daftar) {
  const nyata = [];
  const kasus = [];
  (daftar ?? []).forEach((k) => (k.jenis === 'NYATA' ? nyata : kasus).push(k));
  return { nyata: urutkanKelas(nyata), kasus: [...kasus].sort((x, y) => banding(x.nama_kelas, y.nama_kelas)) };
}

/** Kalimat di bawah judul Beranda: "4 kelas · 129 siswa · 30 siswa perlu perhatian · Ganjil 2026/2027". */
export function ringkasBeranda(nyata) {
  const daftar = nyata ?? [];
  if (daftar.length === 0) return '';
  const siswa = daftar.reduce((s, k) => s + Number(k.jumlah_siswa ?? 0), 0);
  const bagian = [jamak(daftar.length, 'kelas'), `${siswa} siswa`];
  const terbaca = daftar.filter((k) => keadaanKelas(k) === KEADAAN.ADA);
  const perhatian = terbaca.reduce((s, k) => s + k.ringkasan.kartu.perhatian, 0);
  if (terbaca.length > 0) bagian.push(`${perhatian} siswa perlu perhatian`);
  if (terbaca.length < daftar.length) bagian.push(`${daftar.length - terbaca.length} kelas belum bisa dibaca angkanya`);
  const semester = [...new Set(daftar.map((k) => `${k.semester} ${k.tahun_ajaran}`.trim()))];
  if (semester.length === 1) bagian.push(semester[0]);
  return bagian.join(' · ');
}

/**
 * Kelas yang datanya tertinggal: tidak berubah paling sedikit HARI_TERTINGGAL hari DAN isian TP yang kosong
 * paling sedikit KOSONG_TERTINGGAL_PERSEN persen. Kelas lengkap yang lama tidak berubah tidak ditandai.
 * Ambang ini keputusan tampilan, bukan aturan penanda; angka di kelas yang ditandai tetap benar menurut datanya.
 */
export function kelasTertinggal(daftar, sekarang = new Date()) {
  return (daftar ?? [])
    .map((k) => ({ kelas: k, hari: hariSejak(k.terakhir_diubah, sekarang), kosong: persenKosong(k) }))
    .filter((x) => x.hari !== null && x.kosong !== null && x.hari >= HARI_TERTINGGAL && x.kosong >= KOSONG_TERTINGGAL_PERSEN)
    .sort((x, y) => y.kosong - x.kosong || y.hari - x.hari)
    .map((x) => ({
      id: x.kelas.id,
      nama: x.kelas.nama_kelas,
      hari: x.hari,
      kosong: x.kosong,
      kalimat: `nilai terakhir diubah ${x.hari} hari lalu dan ${x.kosong}% isian TP masih kosong. Ringkasannya kurang bisa dipercaya sampai data dilengkapi.`,
    }));
}

/** Pesan untuk kelas yang angkanya tidak bisa dibaca. Tidak pernah tampil sebagai angka 0. */
export function pesanKeadaan(keadaan) {
  switch (keadaan) {
    case KEADAAN.TANPA_RINGKASAN: return 'Ringkasan kelas ini belum dapat dimuat. Buka kelasnya untuk melihat datanya.';
    case KEADAAN.GALAT: return 'Ringkasan tidak tersedia karena batas nilai kelas ini tidak sah. Perbaiki di tab Struktur.';
    case KEADAAN.TANPA_SISWA: return 'Belum ada siswa. Isi daftar siswa dulu.';
    case KEADAAN.TANPA_STRUKTUR: return 'Struktur lingkup materi dan TP belum diisi.';
    default: return '';
  }
}
