// Token visual Ringkasan dan Beranda LAD, mengikuti desain yang disetujui (hitam-putih lebih dulu).
//
// Aturan yang dijaga di sini (NFR-06): status TIDAK pernah hanya lewat warna. Tiap rentang punya pola isian
// sendiri (garis miring, titik, penuh sedang, penuh gelap, kosong) dan angka tertulis. Warna hanya penegas,
// jadi cetak hitam-putih dan layar abu-abu tetap terbaca. `printColorAdjust: exact` menjaga pola ikut tercetak.

import { RENTANG } from '../rentang.js';

/** Palet menurut mode tema. Mode gelap menukar kedalaman supaya segmen "tertinggi" tetap yang paling menonjol. */
export function warnaRingkasan(theme) {
  const gelap = theme.palette.mode === 'dark';
  if (gelap) {
    return {
      gelap,
      ink: '#e6e8eb',
      sekunder: '#a3acb9',
      garis: '#3b4350',
      garisLembut: '#2e3540',
      kartu: theme.palette.background.paper,
      latar: theme.palette.background.default,
      trek: '#2e3540',
      abu: '#8b94a1',
      navy: '#9db8da',
      tengah: '#6f95c4',
      terang: '#3d5877',
      pucat: '#26384f',
      tautan: '#9db8da',
      putih: '#ffffff',
      tulisanDiPutih: '#1c2128',
    };
  }
  return {
    gelap,
    ink: '#1c2128',
    sekunder: '#4b5563',
    garis: '#d5dae1',
    garisLembut: '#eceef1',
    kartu: '#ffffff',
    latar: '#f3f4f6',
    trek: '#e5e7eb',
    abu: '#6b7280',
    navy: '#1f3a5f',
    tengah: '#5f86b5',
    terang: '#a9bdd6',
    pucat: '#dbe4ef',
    tautan: '#1f3a5f',
    putih: '#ffffff',
    tulisanDiPutih: '#1c2128',
  };
}

const CETAK = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

/** Isian segmen sebaran per rentang. s0 garis miring, s1 titik, s2 penuh sedang, s3 penuh gelap, s4 kosong berbingkai. */
export function isianRentang(w, rentang) {
  switch (rentang) {
    case RENTANG.SELURUH:
      return { ...CETAK, background: `repeating-linear-gradient(45deg, ${w.navy} 0 2px, ${w.pucat} 2px 7px)` };
    case RENTANG.SEBAGIAN:
      return { ...CETAK, background: `radial-gradient(${w.navy} 1.3px, transparent 1.5px) 0 0 / 6px 6px, ${w.terang}` };
    case RENTANG.MENCAPAI:
      return { ...CETAK, background: w.tengah };
    case RENTANG.PENGAYAAN:
      return { ...CETAK, background: w.navy };
    default:
      return { ...CETAK, background: w.kartu, boxShadow: `inset 0 0 0 1px ${w.abu}` };
  }
}

/** Isian segmen proyek: dinilai penuh sedang, bernilai 0 garis miring hitam, belum diisi kosong berbingkai. */
export function isianProyek(w, kunci) {
  switch (kunci) {
    case 'dinilai':
      return { ...CETAK, background: w.tengah };
    case 'nol':
      return {
        ...CETAK,
        background: `repeating-linear-gradient(45deg, ${w.ink} 0 2px, ${w.kartu} 2px 6px)`,
        boxShadow: `inset 0 0 0 1px ${w.ink}`,
      };
    default:
      return { ...CETAK, background: w.kartu, boxShadow: `inset 0 0 0 1px ${w.abu}` };
  }
}

/** Lingkaran legenda: seperempat, setengah, tiga perempat, penuh (bentuk yang sama dengan ikon rentang di tab Nilai). */
export function isiLingkaran(w, rentang) {
  const bagian = {
    [RENTANG.SELURUH]: 25, [RENTANG.SEBAGIAN]: 50, [RENTANG.MENCAPAI]: 75, [RENTANG.PENGAYAAN]: 100,
  }[rentang];
  return bagian === undefined ? w.kartu : `conic-gradient(${w.ink} 0 ${bagian}%, ${w.kartu} 0)`;
}

/** Kartu putih berbingkai tipis. `gaya` tegas = bingkai ink, putus = bingkai putus-putus. */
export function gayaKartu(w, gaya = 'biasa') {
  const bingkai = {
    biasa: `1px solid ${w.garis}`,
    tegas: `1.5px solid ${w.ink}`,
    putus: `1px dashed ${w.ink}`,
  }[gaya];
  return {
    bgcolor: w.kartu,
    border: bingkai,
    borderRadius: '8px',
    // Tema memberi radius dan bayangan ke setiap .MuiBox-root; di sini sengaja ditegaskan.
    boxShadow: 'none',
  };
}

/** Chip pola. `utama` diisi penuh, yang lain hanya bingkai. */
export function gayaChip(w, utama) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 28,
    px: '10px',
    borderRadius: '14px',
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${w.ink}`,
    bgcolor: utama ? w.ink : w.kartu,
    color: utama ? w.kartu : w.ink,
    whiteSpace: 'nowrap',
    ...CETAK,
  };
}

/** Tautan yang tampil sebagai tautan (bergaris bawah) tetapi berupa tombol, supaya dibaca sebagai aksi. */
export function gayaTautan(w) {
  return {
    font: 'inherit',
    fontSize: 14,
    color: w.tautan,
    textDecoration: 'underline',
    bgcolor: 'transparent',
    border: 0,
    p: 0,
    minHeight: 24,
    cursor: 'pointer',
    textAlign: 'left',
    '&:hover': { opacity: 0.8 },
    '&:focus-visible': { outline: `2px solid ${w.tautan}`, outlineOffset: 2, borderRadius: '2px' },
  };
}

/** Tombol garis tepi 44px, sasaran sentuh yang cukup. */
export function gayaTombol(w, { isi = false } = {}) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    px: 2,
    border: `1px solid ${w.navy}`,
    borderRadius: '6px',
    bgcolor: isi ? w.navy : w.kartu,
    color: isi ? w.kartu : w.navy,
    font: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': { opacity: 0.88 },
    '&:focus-visible': { outline: `2px solid ${w.navy}`, outlineOffset: 2 },
  };
}

export { CETAK };
