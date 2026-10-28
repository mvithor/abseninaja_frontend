import { warnaRingkasan } from '../ringkasan/gayaRingkasan';

// Gaya grid ditulis sekali di wadah, bukan per sel, supaya ratusan sel tetap ringan.
//
// Ukuran mengikuti gaya tabel yang disepakati: isi 16 px, kepala 15 px tebal, baris 48 px. Tinggi sel 48 px juga
// membuat tiap sel mudah diketuk di layar sentuh. Kolom nomor dan nama menempel di kiri saat grid digulir ke samping.
export const TINGGI_BARIS = 48;
export const LEBAR_NO = 44;

export const gayaGrid = (theme) => {
  const w = warnaRingkasan(theme);
  const sempit = theme.breakpoints.down('sm');
  return {
    position: 'relative',
    overflow: 'auto',
    // Lebar isi tabel tidak boleh melebarkan halaman (induknya flex): width 0 + min-width 100% membuat wadah selalu
    // selebar induknya dan hanya tabelnya yang bergulir ke samping.
    width: 0,
    minWidth: '100%',
    maxHeight: '70vh',
    border: `1px solid ${w.garis}`,
    borderRadius: '8px',
    bgcolor: w.kartu,
    boxShadow: 'none',
    '& table': { borderCollapse: 'separate', borderSpacing: 0, fontSize: 16 },
    '& th, & td': {
      borderRight: `1px solid ${w.garisLembut}`,
      borderBottom: `1px solid ${w.garisLembut}`,
      padding: '0 8px',
      background: w.kartu,
      color: w.ink,
    },
    '& thead th': {
      position: 'sticky',
      zIndex: 2,
      textAlign: 'center',
      fontWeight: 700,
      fontSize: 15,
      height: TINGGI_BARIS,
      background: w.latar,
      borderBottom: `1px solid ${w.garis}`,
    },
    '& thead tr:first-of-type th': { top: 0 },
    '& thead tr:nth-of-type(2) th': { top: TINGGI_BARIS, borderBottom: `1px solid ${w.ink}` },
    '& thead tr:only-child th': { borderBottom: `1px solid ${w.ink}` },
    '& tbody tr:last-of-type td': { borderBottom: 0 },
    '& .no': {
      position: 'sticky', left: 0, zIndex: 1, width: LEBAR_NO, minWidth: LEBAR_NO, textAlign: 'right', color: w.sekunder,
      [sempit]: { width: 36, minWidth: 36, padding: '0 6px' },
    },
    '& .nama': {
      position: 'sticky',
      left: LEBAR_NO,
      zIndex: 1,
      minWidth: 220,
      maxWidth: 280,
      textAlign: 'left',
      padding: '0 12px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      boxShadow: `2px 0 0 ${w.garis}`,
      [sempit]: { left: 36, minWidth: 140, maxWidth: 160, padding: '0 8px', fontSize: 15 },
    },
    '& thead .no, & thead .nama': { zIndex: 3 },
    '& .sel': { minWidth: 108, padding: 0, height: TINGGI_BARIS },
    '& .isi': { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: TINGGI_BARIS },
    '& input': {
      width: 76,
      height: TINGGI_BARIS - 2,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      textAlign: 'right',
      font: 'inherit',
      fontSize: 16,
      padding: '0 6px',
      color: w.ink,
    },
    '& input:focus': { outline: `3px solid ${w.navy}`, outlineOffset: -3, background: w.kartu },
    '& .tanda': {
      width: 28, fontSize: 15, fontWeight: 700, lineHeight: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
    },
    // Kolom TP yang disorot dari Ringkasan: garis tebal di kiri dan kanan, header ditebalkan (bukan hanya warna).
    '& th.sorot': { boxShadow: `inset 0 -4px 0 ${w.ink}`, fontWeight: 800 },
    '& td.sorot': { borderLeft: `2px solid ${w.ink}`, borderRight: `2px solid ${w.ink}` },
    // Status tidak hanya lewat warna (NFR-06): bentuk garis dan simbol ikut membedakan.
    '& td.kotor': { background: theme.palette.action.selected, boxShadow: `inset 0 0 0 1px ${w.sekunder}` },
    '& td.salah': { background: theme.palette.error.light, boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` },
  };
};
