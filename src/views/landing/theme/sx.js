// Potongan sx yang dipakai berulang. Nilai warna berasal dari tokens.js.
import { colors } from './tokens';

export const cincinFokus = {
  outline: `3px solid ${colors.yellow}`,
  outlineOffset: '3px',
};

export const resetTombol = {
  font: 'inherit',
  color: 'inherit',
  background: 'none',
  border: 0,
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  textAlign: 'left',
  appearance: 'none',
};

export const resetTautan = {
  color: 'inherit',
  textDecoration: 'none',
};

export const resetDaftar = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

export const hanyaPembaca = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const tanpaScrollbar = {
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

// Subjudul bagian (h2 diikuti p) 16 px web dan 15 px seluler: skala `.sub`
// desain halaman Bukti (F5). Bawaan JudulSeksi 17 px (F1 sampai F3).
export const sxSubBukti = { '& > h2 + p': { fontSize: { xs: '15px', md: '16px' } } };
