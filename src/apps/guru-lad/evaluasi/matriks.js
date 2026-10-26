// Fungsi murni untuk matriks tab Perlu Perhatian dan panel rincian siswa. Tanpa impor selain modul murni
// lain, supaya dapat diuji dengan `node --test` tanpa Vite (lihat matriks.test.js).
//
// Berkas ini hanya MENYUSUN TAMPILAN. Keputusan "ditandai atau tidak" tetap milik server: penanda, bukti,
// dan status tiap pola dibaca dari keluaran evaluasi, tidak pernah dihitung ulang di sini. Satu-satunya
// hitungan di sini adalah ringkasan polos dari nilai yang tampil (rata-rata kolom, jumlah di bawah KKTP,
// rekap hadir), yang bukan penanda dan bukan kesimpulan tentang siswa mana pun.

import {
  bandingPrioritas, barisTpP1, catatanTersembunyiP1, dataDibutuhkan, golonganSiswa, KODE_POLA, namaTp, POLA_INFO,
  URUTAN_PRIORITAS, uraikanBukti,
} from './penjelasan.js';
import { labelTp, judulLm } from '../label.js';
import { rentangNilai } from '../rentang.js';
import { kelompokkanRemedial, kunciRemedial, remedialTerbaru, cariTpId } from '../remedial/remedial.js';
import { labelProyek, tidakDikumpulkan, JENIS_PROYEK } from '../proyek/proyek.js';
import { kunciSel, petaKehadiran, rekapSiswa } from '../kehadiran/kehadiran.js';

const centi = (x) => Math.round(Number(x) * 100);
const adaNilai = (x) => x !== null && x !== undefined && x !== '' && !Number.isNaN(Number(x));

// ------------------------------------------------------------------ pengelompokan dan urutan

export const MODE_URUT = Object.freeze({ PRIORITAS: 'prioritas', NOMOR: 'nomor', NAMA: 'nama' });

const bandingNomor = (x, y) => (x.urutan ?? 0) - (y.urutan ?? 0)
  || String(x.siswa_id).localeCompare(String(y.siswa_id), 'en', { numeric: true });
const bandingNama = (x, y) => String(x.nama ?? '').localeCompare(String(y.nama ?? ''), 'id', { sensitivity: 'base' })
  || bandingNomor(x, y);

/** Pembanding menurut mode urut. Mode tidak dikenal jatuh ke prioritas (urutan bawaan PRD 7.2). */
export function pembandingUrut(mode) {
  if (mode === MODE_URUT.NOMOR) return bandingNomor;
  if (mode === MODE_URUT.NAMA) return bandingNama;
  return bandingPrioritas;
}

/**
 * Bagi hasil evaluasi menjadi tiga golongan tampilan, masing-masing terurut.
 *  - perhatian: ada penanda selain pengayaan (termasuk yang juga P5).
 *  - pengayaan: penandanya hanya pengayaan.
 *  - tanpa: tanpa penanda; selalu menurut nomor (atau nama), karena prioritas tidak berlaku untuknya.
 * `pola` memilih pola tertentu (kosong = semua); bila ada pilihan, siswa tanpa penanda tidak ikut.
 */
export function bagiGolongan(hasil, { pola = [], urut = MODE_URUT.PRIORITAS } = {}) {
  const terpilih = new Set(pola);
  const lolos = (hasil ?? []).filter((h) => terpilih.size === 0 || h.penanda.some((k) => terpilih.has(k)));
  const bagi = { perhatian: [], pengayaan: [], tanpa: [] };
  lolos.forEach((h) => bagi[golonganSiswa(h)].push(h));
  const banding = pembandingUrut(urut);
  bagi.perhatian.sort(banding);
  bagi.pengayaan.sort(banding);
  bagi.tanpa.sort(urut === MODE_URUT.NAMA ? bandingNama : bandingNomor);
  return bagi;
}

// ------------------------------------------------------------------ kolom

/**
 * Kolom matriks dari struktur kelas dan daftar proyek. Kunci TP "lm.tp" memakai nomor urutan LM dan TP,
 * sama dengan yang dipakai bukti P1 dari server.
 */
export function susunKolom(lm, proyek) {
  const kelompokLm = (lm ?? [])
    .filter((m) => Array.isArray(m.tp) && m.tp.length > 0)
    .map((m) => ({
      lm: m.urutan,
      judul: judulLm(m),
      judulPendek: `LM ${m.urutan}`,
      kolom: m.tp.map((t) => ({
        tpId: t.id, lmNo: m.urutan, tpNo: t.urutan, kunci: `${m.urutan}.${t.urutan}`, label: labelTp(t),
      })),
    }));
  const kolomProyek = (proyek ?? []).map((p) => ({
    id: p.id, jenis: p.jenis, kelompok: p.jenis === JENIS_PROYEK.KELOMPOK, label: labelProyek(p), urutan: p.urutan,
  }));
  const kolomTp = kelompokLm.flatMap((g) => g.kolom);
  return { kelompokLm, kolomTp, kolomProyek, jumlahKolom: 3 + kolomTp.length + kolomProyek.length + 2 };
}

// ------------------------------------------------------------------ peta data

/** Siapkan semua peta pencarian sekali, supaya membuat ratusan sel tidak mencari berulang. */
export function siapkanKonteks({ nilaiTp, nilaiProyek, remedial, kehadiran, pertemuan, siswa }) {
  const nilai = new Map();
  (nilaiTp ?? []).forEach((n) => { if (adaNilai(n.nilai)) nilai.set(kunciRemedial(n.siswa_id, n.tp_id), Number(n.nilai)); });
  const proyekNilai = new Map();
  (nilaiProyek ?? []).forEach((n) => { if (adaNilai(n.nilai)) proyekNilai.set(`${n.siswa_id}:${n.proyek_id}`, Number(n.nilai)); });
  return {
    nilai,
    proyekNilai,
    remedial: kelompokkanRemedial(remedial),
    hadir: petaKehadiran(kehadiran),
    pertemuan: [...(pertemuan ?? [])].sort((p, q) => (p.nomor ?? 0) - (q.nomor ?? 0)),
    siswa: new Map((siswa ?? []).map((s) => [s.id, s])),
  };
}

// ------------------------------------------------------------------ ringkasan kolom

/** Pembulatan satu desimal dari rata-rata (setengah ke atas), dihitung dalam sen supaya tidak kena galat desimal. */
export function bulatSatuDesimal(jumlahCenti, n) {
  if (n === 0) return null;
  return Math.round(jumlahCenti / n / 10) / 10;
}

/**
 * Ringkasan polos per kolom TP dari nilai yang sudah diisi: rata-rata, banyak nilai, dan banyak siswa di bawah
 * KKTP. Ini bukan rata-rata kelas milik server (yang dihitung per LM untuk penanda P4).
 */
export function ringkasKolomTp(kolomTp, siswaIds, ctx, kktp) {
  const hasil = new Map();
  kolomTp.forEach((k) => {
    let jumlah = 0;
    let n = 0;
    let bawah = 0;
    siswaIds.forEach((id) => {
      const v = ctx.nilai.get(kunciRemedial(id, k.tpId));
      if (v === undefined) return;
      jumlah += centi(v);
      n += 1;
      if (centi(v) < centi(kktp)) bawah += 1;
    });
    hasil.set(k.tpId, { n, rata: bulatSatuDesimal(jumlah, n), bawah });
  });
  return hasil;
}

// ------------------------------------------------------------------ baris matriks

const kunciTpDitandai = (h) => {
  const p1 = h.pola?.P1;
  if (!p1 || p1.status !== 'DITANDAI' || !p1.bukti || !Array.isArray(p1.bukti.tp)) return new Set();
  return new Set(p1.bukti.tp.map((t) => `${t.lm}.${t.tp}`));
};

/**
 * Isi satu baris siswa. Sel TP memuat nilai ASLI (bukan nilai remedial); remedial terbaru, bila ada, hanya
 * menjadi catatan kecil di sel. `ditandai` menunjukkan sel yang menjadi bukti P1 dari server.
 */
export function susunBaris(h, kolom, ctx, ambang) {
  const ditandai = kunciTpDitandai(h);
  const sel = kolom.kolomTp.map((k) => {
    const nilai = ctx.nilai.has(kunciRemedial(h.siswa_id, k.tpId)) ? ctx.nilai.get(kunciRemedial(h.siswa_id, k.tpId)) : null;
    const rem = remedialTerbaru(ctx.remedial.get(kunciRemedial(h.siswa_id, k.tpId)));
    return {
      tpId: k.tpId,
      kunci: k.kunci,
      nilai,
      rentang: rentangNilai(nilai, ambang),
      ditandaiP1: ditandai.has(k.kunci),
      remedial: rem ? Number(rem.nilai_remedial) : null,
    };
  });
  const proyek = kolom.kolomProyek.map((p) => {
    const kunci = `${h.siswa_id}:${p.id}`;
    const nilai = ctx.proyekNilai.has(kunci) ? ctx.proyekNilai.get(kunci) : null;
    return {
      proyekId: p.id, kelompok: p.kelompok, nilai, tidakDikumpulkan: tidakDikumpulkan(p.jenis, nilai),
    };
  });
  const rekap = rekapSiswa(h.siswa_id, ctx.pertemuan, {}, ctx.hadir);
  return {
    siswaId: h.siswa_id,
    urutan: h.urutan,
    nama: h.nama,
    penanda: [...h.penanda].sort((x, y) => URUTAN_PRIORITAS.indexOf(x) - URUTAN_PRIORITAS.indexOf(y)),
    sel,
    proyek,
    hadir: {
      hadir: rekap.H, tercatat: rekap.tercatat, alpa: rekap.A,
      // Disorot hanya bila server menandai P2, supaya ambangnya tidak dihitung ulang di sini.
      alpaDitandai: h.pola?.P2?.status === 'DITANDAI',
    },
  };
}

// ------------------------------------------------------------------ rincian siswa (panel)

/** Deret kehadiran 1 siswa per pertemuan (menurut nomor): [{ nomor, kode }], kode null = belum dicatat. */
export function deretKehadiran(siswaId, ctx) {
  return ctx.pertemuan.map((p) => ({ nomor: p.nomor, kode: ctx.hadir.get(kunciSel(siswaId, p.id)) ?? null }));
}

/** Baris TP penanda P1 untuk panel: nilai, apakah tersembunyi, remedial terbaru, dan id TP untuk "Catat remedial". */
export function barisP1(bukti, lm) {
  if (!bukti || !Array.isArray(bukti.tp)) return [];
  return bukti.tp.map((t) => ({
    kunci: `${t.lm}.${t.tp}`,
    nama: namaTp(t.lm, t.tp, lm),
    nilai: t.nilai,
    tersembunyi: Boolean(t.tersembunyi),
    remedialTerbaru: t.remedial_terbaru ?? null,
    tpId: cariTpId(lm, t.lm, t.tp),
  }));
}

/** Deret P4: titik per LM untuk siswa dan (bila server memakai pembanding) kelas. */
export function deretP4(bukti) {
  if (!bukti || !Array.isArray(bukti.lm) || !Array.isArray(bukti.nr)) return [];
  return bukti.lm.map((no, i) => ({
    lm: no,
    siswa: Number(bukti.nr[i]),
    kelas: bukti.acuan_kelas && Array.isArray(bukti.nr_kelas) && adaNilai(bukti.nr_kelas[i]) ? Number(bukti.nr_kelas[i]) : null,
  }));
}

/**
 * Titik grafik garis P4 dalam koordinat SVG. Rentang sumbu Y mengikuti data dan garis KKTP, dibulatkan ke
 * kelipatan 5, tidak pernah di luar 0 sampai 100.
 */
export function titikGrafikP4(deret, kktp, {
  lebar = 392, tinggi = 120, kiri = 36, kanan = 16, atas = 10, bawah = 22, inset = 0,
} = {}) {
  if (!Array.isArray(deret) || deret.length === 0) return null;
  const nilai = deret.flatMap((d) => [d.siswa, d.kelas]).filter((v) => v !== null && Number.isFinite(v));
  if (adaNilai(kktp)) nilai.push(Number(kktp));
  const min = Math.max(0, Math.floor((Math.min(...nilai) - 3) / 5) * 5);
  const maks = Math.min(100, Math.ceil((Math.max(...nilai) + 3) / 5) * 5);
  // `inset` menggeser titik pertama dan terakhir ke dalam supaya tidak menempel pada sumbu dan labelnya.
  const lebarIsi = lebar - kiri - kanan - 2 * inset;
  const tinggiIsi = tinggi - atas - bawah;
  const x = (i) => (deret.length === 1 ? kiri + inset + lebarIsi / 2 : kiri + inset + (lebarIsi * i) / (deret.length - 1));
  const y = (v) => atas + tinggiIsi * (1 - (v - min) / (maks - min || 1));
  const garis = (ambil) => deret.map((d, i) => (ambil(d) === null ? null : { x: x(i), y: y(ambil(d)), nilai: ambil(d), lm: d.lm })).filter(Boolean);
  return {
    min, maks, lebar, tinggi, kiri, kanan, atas, bawah,
    siswa: garis((d) => d.siswa),
    kelas: deret.some((d) => d.kelas !== null) ? garis((d) => d.kelas) : null,
    // KKTP ikut menentukan rentang sumbu, jadi selalu berada di dalamnya.
    yKktp: adaNilai(kktp) ? y(Number(kktp)) : null,
    petakY: y,
  };
}

/**
 * Susun isi panel untuk satu siswa. Bagian muncul menurut urutan prioritas pola; hanya pola yang DITANDAI.
 * `ctx` = { lm, parameter }, `konteks` hasil siapkanKonteks, `kktp` angka.
 */
export function susunRincian(h, ctx, konteks, kktp) {
  const urut = [...h.penanda].sort((x, y) => URUTAN_PRIORITAS.indexOf(x) - URUTAN_PRIORITAS.indexOf(y));
  const bagian = urut.map((kode) => {
    const bukti = h.pola[kode].bukti;
    const dasar = {
      kode, judul: POLA_INFO[kode]?.judul ?? kode, jenis: POLA_INFO[kode]?.jenis ?? 'perhatian',
    };
    if (kode === 'P1') {
      return {
        ...dasar,
        baris: barisP1(bukti, ctx.lm),
        kalimat: barisTpP1(bukti, ctx),
        catatan: catatanTersembunyiP1(bukti, ctx),
      };
    }
    if (kode === 'P2') {
      return { ...dasar, kalimat: uraikanBukti(kode, bukti, ctx), deret: deretKehadiran(h.siswa_id, konteks) };
    }
    if (kode === 'P4') {
      const deret = deretP4(bukti);
      return {
        ...dasar, kalimat: uraikanBukti(kode, bukti, ctx), deret, kktp: adaNilai(kktp) ? Number(kktp) : null, grafik: titikGrafikP4(deret, kktp),
      };
    }
    return { ...dasar, kalimat: uraikanBukti(kode, bukti, ctx) };
  });
  // Pola yang belum bisa dinilai karena datanya kurang. Tidak berarti siswa aman.
  const belumCukup = KODE_POLA.filter((k) => h.pola[k] && h.pola[k].status === 'BELUM_CUKUP').map((k) => ({
    kode: k,
    judul: POLA_INFO[k].judul,
    alasan: h.pola[k].alasan || null,
    butuh: dataDibutuhkan(k, ctx.parameter ?? {}),
  }));
  return {
    siswaId: h.siswa_id, nama: h.nama, urutan: h.urutan, bagian, belumCukup,
  };
}
