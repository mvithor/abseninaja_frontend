import { alpha } from '@mui/material/styles';

// Teks yang hanya dibaca pembaca layar (sama dengan yang dipakai IkonRentang).
export const sembunyi = {
  // Piksel eksplisit: di sx MUI angka 1 berarti 100%, bukan 1px.
  position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
};

// Lebar tiga kolom kiri yang lengket. Disimpan sebagai variabel CSS supaya bisa berbeda di ponsel: di layar sempit
// kolom Penanda tidak ikut lengket (tiga kolom lengket akan menghabiskan seluruh lebar layar), dan kolom nama dipersempit.
export const LEBAR_NO = 44;
export const LEBAR_NAMA = 220;
export const LEBAR_PENANDA = 168;
const TINGGI_KEPALA = 48;
const TINGGI_BARIS = 52;

// Gaya matriks ditulis sekali di wadah, bukan per sel. Status tidak hanya lewat warna (NFR-06): ikon rentang,
// angka, simbol, dan garis tepi ikut membedakan. Ukuran mengikuti tabel lain di LAD: isi 15 sampai 16 px,
// kepala 15 px tebal, tidak ada teks di bawah 13 px.
export const gayaMatriks = (theme) => {
  const sempit = theme.breakpoints.down('md');
  return {
    '--l-no': `${LEBAR_NO}px`,
    '--l-nama': `${LEBAR_NAMA}px`,
    '--l-pen': `${LEBAR_PENANDA}px`,
    [sempit]: { '--l-no': '36px', '--l-nama': '136px' },
    position: 'relative',
    overflow: 'auto',
    // Lebar isi tabel tidak boleh melebarkan halaman: tanpa ini, wadah induk (flex) ikut selebar tabel dan
    // seluruh halaman mendapat gulir horizontal. width 0 + min-width 100% membuat wadah selalu selebar induknya.
    width: 0,
    minWidth: '100%',
    maxHeight: '72vh',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    '& table': { borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, minWidth: '100%' },
    '& th, & td': {
      borderRight: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      padding: '0 6px',
      background: theme.palette.background.paper,
    },
    '& thead th': {
      position: 'sticky', zIndex: 2, textAlign: 'center', fontWeight: 700, fontSize: 15, height: TINGGI_KEPALA, whiteSpace: 'nowrap',
    },
    '& thead tr:first-of-type th': { top: 0 },
    '& thead tr:nth-of-type(2) th': { top: TINGGI_KEPALA },
    '& .k-no, & .k-nama, & .k-pen': { position: 'sticky', zIndex: 1 },
    '& thead .k-no, & thead .k-nama, & thead .k-pen': { zIndex: 3 },
    '& .k-no': {
      left: 0, width: 'var(--l-no)', minWidth: 'var(--l-no)', textAlign: 'right', color: theme.palette.text.secondary,
    },
    '& .k-nama': {
      left: 'var(--l-no)',
      width: 'var(--l-nama)',
      minWidth: 'var(--l-nama)',
      maxWidth: 'var(--l-nama)',
      padding: '0 12px',
      textAlign: 'left',
      fontSize: 16,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [sempit]: { padding: '0 8px', fontSize: 15, boxShadow: `2px 0 0 ${theme.palette.divider}` },
    },
    '& .ringkas-saran': {
      display: 'block', fontSize: 13, lineHeight: 1.3, color: theme.palette.text.secondary, whiteSpace: 'normal', marginTop: 2,
    },
    '& .k-pen': {
      left: 'calc(var(--l-no) + var(--l-nama))',
      width: 'var(--l-pen)',
      minWidth: 'var(--l-pen)',
      textAlign: 'left',
      padding: '6px 10px',
      boxShadow: `2px 0 0 ${theme.palette.divider}`,
      [sempit]: { position: 'static', left: 'auto', boxShadow: 'none' },
    },
    '& .pisah': { borderLeft: `2px solid ${theme.palette.grey[400]}` },
    '& td.sel': {
      minWidth: 76, width: 76, height: TINGGI_BARIS, textAlign: 'center', position: 'relative', fontSize: 16,
    },
    '& td.sel .isi': { display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 },
    '& td.sel sup': { fontSize: 13, fontWeight: 700, marginLeft: 1 },
    '& td.r-seluruh': { backgroundColor: alpha(theme.palette.error.main, 0.22) },
    '& td.r-sebagian': { backgroundColor: alpha(theme.palette.warning.main, 0.22) },
    '& td.tanda-p1': { boxShadow: `inset 0 0 0 2px ${theme.palette.warning.dark}` },
    '& td.tidak-kumpul': { backgroundColor: alpha(theme.palette.error.main, 0.22), boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` },
    '& td.kosong': { color: theme.palette.text.secondary },
    '& td.kelompok': { fontStyle: 'italic', color: theme.palette.text.secondary },
    '& td.alpa-tanda': { fontWeight: 700, color: theme.palette.error.dark },
    '& tr.rata td': {
      background: theme.palette.action.hover, textAlign: 'center', height: 56, lineHeight: 1.3,
    },
    '& tr.rata td.k-nama, & tr.rata td.k-no, & tr.rata td.k-pen': { background: theme.palette.grey[100] },
    '& tr.rata td.k-nama, & tr.rata td.k-pen': { textAlign: 'left' },
    '& tr.rata small': { display: 'block', fontSize: 13, color: theme.palette.text.secondary },
    '& tr.grup td': { background: theme.palette.grey[100], fontWeight: 700, fontSize: 16, padding: 0 },
    '& tr.grup td > div': { position: 'sticky', left: 0, display: 'inline-block', padding: '10px 16px' },
    '& tr.terpilih td.k-nama': { boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}` },
    '& button.urut': {
      font: 'inherit', fontWeight: 700, background: 'none', border: 0, cursor: 'pointer', color: 'inherit',
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 6px', minHeight: 40, borderRadius: 4,
    },
    '& button.urut:focus-visible, & button.nama-siswa:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
    '& button.nama-siswa': {
      font: 'inherit', fontSize: 16, fontWeight: 600, background: 'none', border: 0, padding: '10px 0', minHeight: 44, cursor: 'pointer', color: 'inherit',
      textAlign: 'left', textDecoration: 'underline', textDecorationColor: theme.palette.divider, textUnderlineOffset: 4,
      maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      [sempit]: { fontSize: 15 },
    },
    '& button.nama-siswa:hover': { color: theme.palette.primary.main, textDecorationColor: theme.palette.primary.main },
  };
};
