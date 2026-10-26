import { alpha } from '@mui/material/styles';

// Teks yang hanya dibaca pembaca layar (sama dengan yang dipakai IkonRentang).
export const sembunyi = {
  // Piksel eksplisit: di sx MUI angka 1 berarti 100%, bukan 1px.
  position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
};

// Lebar tiga kolom kiri yang lengket; offset `left` kolom berikutnya adalah jumlah lebar sebelumnya.
export const LEBAR_NO = 40;
export const LEBAR_NAMA = 200;
export const LEBAR_PENANDA = 120;

// Gaya matriks ditulis sekali di wadah, bukan per sel. Status tidak hanya lewat warna (NFR-06): ikon rentang,
// angka, simbol, dan garis tepi ikut membedakan.
export const gayaMatriks = (theme) => ({
  position: 'relative',
  overflow: 'auto',
  // Lebar isi tabel tidak boleh melebarkan halaman: tanpa ini, wadah induk (flex) ikut selebar tabel dan
  // seluruh halaman mendapat gulir horizontal. width 0 + min-width 100% membuat wadah selalu selebar induknya.
  width: 0,
  minWidth: '100%',
  maxHeight: '68vh',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  '& table': { borderCollapse: 'separate', borderSpacing: 0, fontSize: 13, minWidth: '100%' },
  '& th, & td': {
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '0 4px',
    background: theme.palette.background.paper,
  },
  '& thead th': {
    position: 'sticky', zIndex: 2, textAlign: 'center', fontWeight: 600, height: 32, whiteSpace: 'nowrap',
  },
  '& thead tr:first-of-type th': { top: 0 },
  '& thead tr:nth-of-type(2) th': { top: 32 },
  '& .k-no, & .k-nama, & .k-pen': { position: 'sticky', zIndex: 1 },
  '& thead .k-no, & thead .k-nama, & thead .k-pen': { zIndex: 3 },
  '& .k-no': { left: 0, width: LEBAR_NO, minWidth: LEBAR_NO, textAlign: 'right', color: theme.palette.text.secondary },
  '& .k-nama': {
    left: LEBAR_NO, width: LEBAR_NAMA, minWidth: LEBAR_NAMA, maxWidth: LEBAR_NAMA, padding: '0 8px', textAlign: 'left',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  '& .ringkas-saran': { display: 'block', fontSize: 11, lineHeight: 1.2, color: theme.palette.text.secondary, whiteSpace: 'normal' },
  '& .k-pen': {
    left: LEBAR_NO + LEBAR_NAMA, width: LEBAR_PENANDA, minWidth: LEBAR_PENANDA, textAlign: 'left',
    boxShadow: `2px 0 0 ${theme.palette.divider}`,
  },
  '& .pisah': { borderLeft: `2px solid ${theme.palette.grey[400]}` },
  '& td.sel': { minWidth: 64, width: 64, height: 38, textAlign: 'center', position: 'relative' },
  '& td.sel .isi': { display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 },
  '& td.sel sup': { fontSize: 10, fontWeight: 700, marginLeft: 1 },
  '& td.r-seluruh': { backgroundColor: alpha(theme.palette.error.main, 0.22) },
  '& td.r-sebagian': { backgroundColor: alpha(theme.palette.warning.main, 0.22) },
  '& td.tanda-p1': { boxShadow: `inset 0 0 0 2px ${theme.palette.warning.dark}` },
  '& td.tidak-kumpul': { backgroundColor: alpha(theme.palette.error.main, 0.22), boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` },
  '& td.kosong': { color: theme.palette.text.secondary },
  '& td.kelompok': { fontStyle: 'italic', color: theme.palette.text.secondary },
  '& td.alpa-tanda': { fontWeight: 700, color: theme.palette.error.dark },
  '& tr.rata td': { background: theme.palette.action.hover, textAlign: 'center', height: 44, lineHeight: 1.25 },
  '& tr.rata td.k-nama, & tr.rata td.k-no, & tr.rata td.k-pen': { background: theme.palette.grey[100] },
  '& tr.rata td.k-nama, & tr.rata td.k-pen': { textAlign: 'left' },
  '& tr.rata small': { display: 'block', fontSize: 11, color: theme.palette.text.secondary },
  '& tr.grup td': { background: theme.palette.grey[100], fontWeight: 600, padding: 0 },
  '& tr.grup td > div': { position: 'sticky', left: 0, display: 'inline-block', padding: '6px 12px' },
  '& tr.terpilih td.k-nama': { boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}` },
  '& button.urut': {
    font: 'inherit', fontWeight: 600, background: 'none', border: 0, cursor: 'pointer', color: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 4px', borderRadius: 4,
  },
  '& button.urut:focus-visible, & button.nama-siswa:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
  '& button.nama-siswa': {
    font: 'inherit', fontWeight: 500, background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'inherit',
    textAlign: 'left', textDecoration: 'underline', textDecorationColor: theme.palette.divider, textUnderlineOffset: 3,
    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  '& button.nama-siswa:hover': { color: theme.palette.primary.main, textDecorationColor: theme.palette.primary.main },
});
