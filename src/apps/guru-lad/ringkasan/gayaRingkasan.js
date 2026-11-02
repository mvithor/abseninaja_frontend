// Token visual halaman LAD, mengikuti papan desain "Desain Ringkasan Kelas LAD" (artefak desain terbaru).
//
// Warna diambil dari palet tema aplikasi (primary, info, success, warning, error, abu-abu) supaya halaman LAD
// satu bahasa dengan halaman lain. Aturan yang dijaga (NFR-06): status TIDAK pernah hanya lewat warna. Tiap
// rentang punya pola isian sendiri (garis miring, titik, penuh, kosong) dan angka tertulis; warna hanya penegas,
// jadi cetak hitam-putih dan layar abu-abu tetap terbaca. `printColorAdjust: exact` menjaga pola ikut tercetak.

import { RENTANG } from '../rentang.js';

// Warna pendamping yang tidak ada di palet tema: sisi gelap tiap warna status untuk garis tepi, titik, dan ikon.
const TUA = {
  seluruh: '#F3704D',
  sebagian: '#AE8E59',
  mencapai: '#1682D4',
  pengayaan: '#02B3A9',
  galat: '#C4452A',
};

/** Palet menurut mode tema. Mode gelap memakai warna yang sama dengan latar gelap bagi permukaan dan garis. */
export function warnaRingkasan(theme) {
  const p = theme.palette;
  const gelap = p.mode === 'dark';
  const dasar = {
    gelap,
    ink: p.text.primary,
    kartu: p.background.paper,
    primer: p.primary.main,
    primerMuda: p.primary.light,
    primerTua: p.primary.dark,
    tautan: p.primary.main,
    // Segmen dan ikon rentang. Mencapai = biru (info), pengayaan = hijau (success), sesuai desain.
    seluruh: p.error.main,
    seluruhTua: TUA.seluruh,
    sebagian: p.warning.main,
    sebagianTua: TUA.sebagian,
    mencapai: p.info.main,
    mencapaiTua: TUA.mencapai,
    pengayaan: p.success.main,
    pengayaanTua: TUA.pengayaan,
    galat: TUA.galat,
    // Putih untuk lencana angka di atas segmen berwarna.
    putih: '#ffffff',
    tulisanDiPutih: '#2A3547',
  };
  if (gelap) {
    return {
      ...dasar,
      sekunder: '#a3acb9',
      garis: '#3b4350',
      garisLembut: '#2e3540',
      garisTegas: '#46505e',
      latar: '#262d38',
      trek: '#2e3540',
      abu: '#8b94a1',
      bgPeringatan: 'rgba(255,174,31,.16)',
      bgOk: 'rgba(19,222,185,.14)',
      bgInfo: 'rgba(83,155,255,.16)',
      bgGalat: 'rgba(250,137,107,.16)',
      bgPetunjuk: 'rgba(94,92,230,.18)',
      chipPeringatan: 'rgba(255,174,31,.26)',
      selGalat: 'rgba(250,137,107,.28)',
      selPeringatan: 'rgba(255,174,31,.26)',
      barisHover: 'rgba(255,255,255,.04)',
      tulisanDiPutih: '#1c2128',
    };
  }
  return {
    ...dasar,
    sekunder: p.grey[500],
    garis: p.divider,
    garisLembut: p.grey[200],
    garisTegas: p.grey[300],
    latar: p.grey[100],
    trek: p.grey[200],
    abu: p.grey[400],
    bgPeringatan: p.warning.light,
    bgOk: p.success.light,
    bgInfo: p.info.light,
    bgGalat: p.error.light,
    bgPetunjuk: p.primary.light,
    chipPeringatan: 'rgba(255,174,31,.22)',
    selGalat: 'rgba(250,137,107,.24)',
    selPeringatan: 'rgba(255,174,31,.24)',
    barisHover: p.action.hover,
  };
}

const CETAK = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

/** Warna isi dan garis tepi tiap rentang, dipakai ikon pai dan isian segmen. */
export function warnaRentang(w, rentang) {
  switch (rentang) {
    case RENTANG.SELURUH: return { isi: w.seluruh, tepi: w.seluruhTua };
    case RENTANG.SEBAGIAN: return { isi: w.sebagian, tepi: w.sebagianTua };
    case RENTANG.MENCAPAI: return { isi: w.mencapai, tepi: w.mencapaiTua };
    case RENTANG.PENGAYAAN: return { isi: w.pengayaan, tepi: w.pengayaanTua };
    default: return { isi: w.kartu, tepi: w.abu };
  }
}

/** Isian segmen sebaran per rentang. Seluruh garis miring, sebagian titik, mencapai dan pengayaan penuh, kosong berbingkai. */
export function isianRentang(w, rentang) {
  switch (rentang) {
    case RENTANG.SELURUH:
      return { ...CETAK, background: `repeating-linear-gradient(45deg, ${w.seluruhTua} 0 2px, ${w.seluruh} 2px 7px)` };
    case RENTANG.SEBAGIAN:
      return { ...CETAK, background: `radial-gradient(${w.sebagianTua} 1.2px, transparent 1.5px) 0 0 / 6px 6px, ${w.sebagian}` };
    case RENTANG.MENCAPAI:
      return { ...CETAK, background: w.mencapai };
    case RENTANG.PENGAYAAN:
      return { ...CETAK, background: w.pengayaan };
    default:
      return { ...CETAK, background: w.kartu, boxShadow: `inset 0 0 0 1px ${w.abu}` };
  }
}

/** Isian segmen proyek: dinilai biru, bernilai 0 garis miring, belum diisi kosong berbingkai. */
export function isianProyek(w, kunci) {
  switch (kunci) {
    case 'dinilai':
      return { ...CETAK, background: w.mencapai };
    case 'nol':
      return { ...CETAK, background: `repeating-linear-gradient(45deg, ${w.seluruhTua} 0 2px, ${w.seluruh} 2px 7px)` };
    default:
      return { ...CETAK, background: w.kartu, boxShadow: `inset 0 0 0 1px ${w.abu}` };
  }
}

/**
 * Kartu putih. `biasa` bingkai tipis, `bayangan` tanpa bingkai dengan bayangan lembut, `putus` bingkai putus-putus
 * (dipakai untuk "data belum cukup", yang bukan berarti aman). `tegas` dipertahankan sebagai nama lama dari `biasa`.
 */
export function gayaKartu(w, gaya = 'biasa') {
  const dasar = {
    bgcolor: w.kartu,
    borderRadius: '7px',
    // Tema memberi radius dan bayangan ke setiap .MuiBox-root; di sini sengaja ditegaskan.
    boxShadow: 'none',
  };
  if (gaya === 'putus') return { ...dasar, border: `1px dashed ${w.abu}` };
  if (gaya === 'bayangan') return { ...dasar, border: 0, boxShadow: '0 9px 17.5px rgba(0,0,0,.05)' };
  return { ...dasar, border: `1px solid ${w.garis}` };
}

/** Chip pola. `utama` diisi warna primer, yang lain latar abu-abu muda. */
export function gayaChip(w, utama) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 26,
    px: '10px',
    borderRadius: '8px',
    fontSize: 13,
    fontWeight: 600,
    border: 0,
    bgcolor: utama ? w.primer : w.latar,
    color: utama ? '#ffffff' : w.ink,
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    ...CETAK,
  };
}

/** Tautan yang tampil sebagai tautan (bergaris bawah) tetapi berupa tombol, supaya dibaca sebagai aksi. */
export function gayaTautan(w) {
  return {
    font: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    color: w.tautan,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    bgcolor: 'transparent',
    border: 0,
    // Tautan yang berdiri sendiri (bukan di dalam kalimat) diberi tinggi 40px agar mudah diketuk.
    display: 'inline-flex',
    alignItems: 'center',
    p: 0,
    minHeight: 40,
    cursor: 'pointer',
    textAlign: 'left',
    '&:hover': { color: w.primerTua },
    '&:focus-visible': { outline: `2px solid ${w.tautan}`, outlineOffset: 2, borderRadius: '2px' },
  };
}

/** Tombol 44px. `isi` = primer penuh; bila tidak, latar primer muda dengan teks primer (tombol teks di desain). */
export function gayaTombol(w, { isi = false, garis = false } = {}) {
  const alphaPrimer = w.gelap ? 'rgba(157,184,218,.5)' : 'rgba(94,92,230,.5)';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    px: 2.5,
    border: garis ? `1px solid ${alphaPrimer}` : 0,
    borderRadius: '7px',
    bgcolor: isi ? w.primer : garis ? 'transparent' : w.primerMuda,
    color: isi ? '#ffffff' : w.primer,
    font: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': garis ? { bgcolor: w.primerMuda, color: w.primer } : { bgcolor: isi ? w.primerTua : w.primer, color: '#ffffff' },
    '&:focus-visible': { outline: `2px solid ${w.primer}`, outlineOffset: 2 },
  };
}

export { CETAK };
