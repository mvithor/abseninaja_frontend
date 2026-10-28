// Gaya grid ditulis sekali di wadah, bukan per sel, supaya ratusan sel tetap ringan.
export const gayaGrid = (theme) => ({
  position: 'relative',
  overflow: 'auto',
  maxHeight: '65vh',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  '& table': { borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 },
  '& th, & td': {
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '0 4px',
    background: theme.palette.background.paper,
  },
  '& thead th': {
    position: 'sticky', zIndex: 2, textAlign: 'center', fontWeight: 600, height: 32,
  },
  '& thead tr:first-of-type th': { top: 0 },
  '& thead tr:nth-of-type(2) th': { top: 32 },
  '& .nama': {
    position: 'sticky', left: 0, zIndex: 1, minWidth: 200, maxWidth: 260, textAlign: 'left', padding: '0 8px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  '& thead .nama': { zIndex: 3 },
  '& .no': { width: 40, textAlign: 'right', color: theme.palette.text.secondary },
  '& .sel': { minWidth: 88, padding: 0 },
  '& .isi': { display: 'flex', alignItems: 'center', position: 'relative' },
  '& input': {
    width: 68, height: 30, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right',
    font: 'inherit', padding: '0 4px', color: theme.palette.text.primary,
  },
  '& input:focus': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
  '& .tanda': {
    width: 20, fontSize: 12, fontWeight: 700, lineHeight: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
  },
  // Kolom TP yang disorot dari Ringkasan: garis tebal di kiri dan kanan, header ditebalkan (bukan hanya warna).
  '& th.sorot': { boxShadow: `inset 0 -3px 0 ${theme.palette.text.primary}`, fontWeight: 800 },
  '& td.sorot': { borderLeft: `2px solid ${theme.palette.text.primary}`, borderRight: `2px solid ${theme.palette.text.primary}` },
  // Status tidak hanya lewat warna (NFR-06): bentuk garis dan simbol ikut membedakan.
  '& td.kotor': { background: theme.palette.action.selected, boxShadow: `inset 0 0 0 1px ${theme.palette.text.secondary}` },
  '& td.salah': { background: theme.palette.error.light, boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` },
});
