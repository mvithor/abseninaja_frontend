// ═══════════════════════════════════════════════════════════════════════════
// SGA Dashboard Kepala Jurusan — Design Tokens (PRD §3)
// Single source of truth untuk warna/radius/shadow. Komponen TIDAK boleh
// hardcode hex — ambil dari sini (Acceptance Criteria §10.10).
// ═══════════════════════════════════════════════════════════════════════════
export const T = {
  // Brand / primary
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  primarySoft: '#EEF2FF',
  // Surface & layout
  pageBg: '#F4F5F7',
  surface: '#FFFFFF',
  border: '#E9EAEE',
  borderDashed: '#CBD5E1',
  // Teks
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  // Aksen
  track: '#EDEEF2',
  warningText: '#B45309',
  warningBg: '#FFF7ED',
  dangerStrong: '#DC2626',
  success: '#22C55E',
  successSoftBg: '#F0FDF4',
};

// Trio warna per kategori risiko (PRD §3.1). `chip` sengaja dipisah dari
// `main` karena background chip Risiko Behavior digelapkan ke #EA580C demi
// kontras WCAG (PRD §9), sementara legend/KPI tetap #F97316.
export const RISK_THEME = {
  siap_penuh: { main: '#22C55E', bg: '#F0FDF4', chip: '#22C55E', label: 'Siap Penuh' },
  risiko_behavior: { main: '#F97316', bg: '#FFF7ED', chip: '#EA580C', label: 'Risiko Behavior' },
  risiko_kompetensi: { main: '#3B82F6', bg: '#EFF6FF', chip: '#3B82F6', label: 'Risiko Kompetensi' },
  risiko_ganda: { main: '#EF4444', bg: '#FEF2F2', chip: '#EF4444', label: 'Risiko Ganda' },
};

// Peta KPI variant → warna fill progress bar (PRD §5.5)
export const KPI_VARIANT_COLOR = {
  primary: T.primary,
  success: RISK_THEME.siap_penuh.main,
  warning: RISK_THEME.risiko_behavior.main,
  info: RISK_THEME.risiko_kompetensi.main,
  danger: RISK_THEME.risiko_ganda.main,
};

// Urutan legend (PRD §5.7): SIAP PENUH → RISIKO BEHAVIOR → RISIKO KOMPETENSI → RISIKO GANDA
export const LEGEND_ORDER = ['siap_penuh', 'risiko_behavior', 'risiko_kompetensi', 'risiko_ganda'];

// Posisi sel kuadran (PRD §5.7 — WAJIB persis)
//   [baris atas]  Risiko Behavior | Siap Penuh
//   [baris bawah] Risiko Ganda    | Risiko Kompetensi
// Urutan mobile (kritis di atas): Ganda → Behavior → Kompetensi → Siap Penuh
export const QUADRANT_CELLS = [
  { key: 'risiko_behavior', variant: 'warning', columns: 2, pageSize: 12, mobileOrder: 2 },
  { key: 'siap_penuh', variant: 'success', columns: 2, pageSize: 12, mobileOrder: 4 },
  { key: 'risiko_ganda', variant: 'danger', columns: 1, pageSize: 7, mobileOrder: 1 },
  { key: 'risiko_kompetensi', variant: 'info', columns: 1, pageSize: 7, mobileOrder: 3 },
];

// Radius & shadow (PRD §3.3)
export const RADIUS = {
  card: '16px',
  panelInner: '14px',
  tab: '12px',
  pill: '999px',
  badge: '8px',
};

export const SHADOW_CARD = '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.05)';
export const SHADOW_HEADER = '0 1px 0 rgba(16,24,40,0.04)';

// Map KPI key → { label, variant } (urutan kartu di mockup)
export const KPI_CARDS = [
  { key: 'totalSiswa', label: 'Total Siswa', variant: 'primary', isTotal: true },
  { key: 'siapPenuh', label: 'Siap Penuh', variant: 'success' },
  { key: 'risikoBehavior', label: 'Risiko Behavior', variant: 'warning' },
  { key: 'risikoKompetensi', label: 'Risiko Kompetensi', variant: 'info' },
  { key: 'risikoGanda', label: 'Risiko Ganda', variant: 'danger' },
];
