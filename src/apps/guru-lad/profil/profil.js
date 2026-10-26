// Fungsi murni untuk halaman profil satu siswa. Tanpa impor selain modul murni lain (lihat profil.test.js).
//
// Berkas ini hanya MENYUSUN TAMPILAN dari data kelas yang sudah dimuat (nilai TP, proyek, kehadiran, remedial).
// Penanda dan buktinya tetap dari server; satu-satunya hitungan di sini adalah rata-rata polos dari nilai yang
// tampil, bukan penanda dan bukan kesimpulan tentang siswa.

import { rentangNilai } from '../rentang.js';
import { labelTp, judulLm } from '../label.js';
import { kunciRemedial, namaTpLengkap, remedialTerbaru } from '../remedial/remedial.js';
import { tidakDikumpulkan, labelProyek, JENIS_PROYEK } from '../proyek/proyek.js';
import { deretKehadiran } from '../evaluasi/matriks.js';

const centi = (x) => Math.round(Number(x) * 100);
const adaNilai = (x) => x !== null && x !== undefined && x !== '' && !Number.isNaN(Number(x));

/** Rata-rata nilai dalam sen, dibulatkan setengah ke atas ke dua desimal; null bila tidak ada nilai. */
export function rataDuaDesimal(daftar) {
  const ada = daftar.filter(adaNilai);
  if (ada.length === 0) return null;
  const jumlah = ada.reduce((h, v) => h + centi(v), 0);
  // jumlah/ada.length sen, dibulatkan ke sen terdekat (setengah ke atas) lalu kembali ke poin.
  return Math.floor((2 * jumlah + ada.length) / (2 * ada.length)) / 100;
}

/**
 * Capaian per LM untuk satu siswa. Nilai TP yang tampil adalah nilai ASLI; remedial terbaru hanya catatan.
 * `ctx` dari siapkanKonteks (peta nilai dan remedial), `ambang` = { ambang_bagian, kktp, ambang_pengayaan },
 * `ditandai` = Set kunci "lm.tp" yang menjadi bukti P1 dari server.
 */
export function capaianPerLm(siswaId, lm, ctx, ambang, ditandai = new Set()) {
  return (lm ?? []).filter((m) => Array.isArray(m.tp) && m.tp.length > 0).map((m) => {
    const tp = m.tp.map((t) => {
      const kunci = kunciRemedial(siswaId, t.id);
      const nilai = ctx.nilai.has(kunci) ? ctx.nilai.get(kunci) : null;
      const daftarRem = ctx.remedial.get(kunci) ?? [];
      const terbaru = remedialTerbaru(daftarRem);
      // Remedial TERBARU yang mencapai KKTP menuntaskan TP (sama dengan aturan server), nilai aslinya tidak berubah.
      const lewatRemedial = nilai !== null && centi(nilai) < centi(ambang.kktp)
        && terbaru !== null && centi(terbaru.nilai_remedial) >= centi(ambang.kktp);
      return {
        tpId: t.id,
        kunci: `${m.urutan}.${t.urutan}`,
        label: labelTp(t),
        rumusan: t.rumusan ?? null,
        nilai,
        rentang: rentangNilai(nilai, ambang),
        tuntas: nilai === null ? null : (centi(nilai) >= centi(ambang.kktp) || lewatRemedial),
        tuntasLewatRemedial: lewatRemedial,
        remedial: daftarRem.map((r) => ({ id: r.id, urutan: r.urutan, nilai: Number(r.nilai_remedial), tanggal: r.tanggal ?? null })),
        remedialTerbaru: terbaru ? Number(terbaru.nilai_remedial) : null,
        ditandaiP1: ditandai.has(`${m.urutan}.${t.urutan}`),
      };
    });
    return {
      lmId: m.id, lm: m.urutan, judul: judulLm(m), tp, rata: rataDuaDesimal(tp.map((x) => x.nilai)),
    };
  });
}

/** Kunci TP ("lm.tp") yang menjadi bukti P1 menurut server. */
export function kunciP1(hasil) {
  const p1 = hasil?.pola?.P1;
  if (!p1 || p1.status !== 'DITANDAI' || !Array.isArray(p1.bukti?.tp)) return new Set();
  return new Set(p1.bukti.tp.map((t) => `${t.lm}.${t.tp}`));
}

/**
 * Tren rata-rata nilai per LM: siswa dan kelas. Rata-rata kelas dihitung polos dari nilai yang diisi pada
 * LM itu (semua siswa); bila tidak ada, null. Titik tanpa nilai siswa tidak digambar.
 */
export function trenPerLm(siswaId, lm, siswaIds, ctx) {
  return (lm ?? []).filter((m) => Array.isArray(m.tp) && m.tp.length > 0).map((m) => {
    const rataSiswa = (id) => rataDuaDesimal(m.tp.map((t) => (ctx.nilai.has(kunciRemedial(id, t.id)) ? ctx.nilai.get(kunciRemedial(id, t.id)) : null)));
    const rataan = siswaIds.map(rataSiswa).filter((v) => v !== null);
    return {
      lm: m.urutan,
      siswa: rataSiswa(siswaId),
      kelas: rataDuaDesimal(rataan),
      jumlahKelas: rataan.length,
    };
  });
}

/** Proyek siswa: nilai, atau tidak dikumpulkan (proyek individu bernilai 0). Proyek kelompok tidak dipakai penanda. */
export function proyekSiswa(siswaId, proyek, ctx) {
  return (proyek ?? []).map((p) => {
    const kunci = `${siswaId}:${p.id}`;
    const nilai = ctx.proyekNilai.has(kunci) ? ctx.proyekNilai.get(kunci) : null;
    return {
      id: p.id,
      label: labelProyek(p),
      kelompok: p.jenis === JENIS_PROYEK.KELOMPOK,
      nilai,
      tidakDikumpulkan: tidakDikumpulkan(p.jenis, nilai),
    };
  });
}

/** Rekap kehadiran siswa di mapel ini: deret per pertemuan dan jumlah tiap kode. Kosong = belum dicatat, bukan alpa. */
export function kehadiranSiswa(siswaId, ctx) {
  const deret = deretKehadiran(siswaId, ctx);
  const jumlah = {
    H: 0, S: 0, I: 0, A: 0,
  };
  deret.forEach((d) => { if (d.kode) jumlah[d.kode] += 1; });
  const tercatat = jumlah.H + jumlah.S + jumlah.I + jumlah.A;
  return {
    deret, jumlah, tercatat, pertemuan: deret.length, belumDicatat: deret.length - tercatat,
  };
}

/** Semua catatan remedial siswa, terurut menurut LM, TP, lalu urutan, dengan nama TP. */
export function riwayatRemedial(siswaId, lm, ctx) {
  const baris = [];
  (lm ?? []).forEach((m) => (m.tp ?? []).forEach((t) => {
    (ctx.remedial.get(kunciRemedial(siswaId, t.id)) ?? []).forEach((r) => {
      baris.push({
        id: r.id,
        tp: namaTpLengkap(t, m.urutan),
        lm: m.urutan,
        tpUrutan: t.urutan,
        urutan: r.urutan,
        nilaiAwal: adaNilai(r.nilai_awal) ? Number(r.nilai_awal) : null,
        nilai: Number(r.nilai_remedial),
        tanggal: r.tanggal ?? null,
        catatan: r.catatan ?? '',
      });
    });
  }));
  return baris.sort((a, b) => a.lm - b.lm || a.tpUrutan - b.tpUrutan || a.urutan - b.urutan);
}
