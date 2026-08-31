export const KUADRAN_CONFIG = {
  RISIKO_BEHAVIOR: { label: 'Risiko Behavior', color: '#FF7B01', bg: '#FF7B0114' },
  SIAP_PENUH: { label: 'Siap Penuh', color: '#34A853', bg: '#34C75914' },
  RISIKO_GANDA: { label: 'Risiko Ganda', color: '#FF383C', bg: '#FF383C14' },
  RISIKO_COMPETENCY: { label: 'Risiko Kompetensi', color: '#2388FF', bg: '#2388FF14' },
};

export const PAPAN_LAYOUT_ORDER = ['RISIKO_BEHAVIOR', 'SIAP_PENUH', 'RISIKO_GANDA', 'RISIKO_COMPETENCY'];
export const SCATTER_SERIES_ORDER = ['SIAP_PENUH', 'RISIKO_BEHAVIOR', 'RISIKO_COMPETENCY', 'RISIKO_GANDA'];

export const statusVs = (skor, ambang) => {
  if (skor === null || skor === undefined || ambang === null || ambang === undefined) return null;
  return Number(skor) >= Number(ambang) ? 'BAIK' : 'KURANG';
};

export const formatAmbang = (val) => {
  const n = Number(val);
  if (Number.isNaN(n)) return '-';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};