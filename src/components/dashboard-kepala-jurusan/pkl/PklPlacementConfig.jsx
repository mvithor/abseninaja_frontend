export const T = {
  bgPage: '#F3F2FB',
  bgCard: '#FFFFFF',
  bgSubtle: '#F8FAFC',
  primary700: '#4C3FCF',
  primary600: '#6357E0',
  primary400: '#8B80F0',
  primary100: '#EDEBFE',
  primary050: '#F5F3FF',
  textStrong: '#1E2233',
  textBody: '#334155',
  textMuted: '#64748B',
  textFaint: '#64748B',
  success: '#16A34A',
  danger: '#EF4444',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  track: '#EDF0F7',
};

// Kategori risiko (kode server: SP/RB/RK/RG). Urutan grup sidebar: RG→RB→RK→SP.
export const RISK = {
  RG: { code: 'RG', label: 'Risiko Ganda', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', priority: true },
  RB: { code: 'RB', label: 'Risiko Behavior', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  RK: { code: 'RK', label: 'Risiko Kompetensi', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  SP: { code: 'SP', label: 'Siap Penuh', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};
export const NULL_GROUP = { label: 'Belum Terklasifikasi', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
export const CHIP_ORDER = ['SP', 'RB', 'RK', 'RG'];
export const CONFIDENCE_COLOR = { TINGGI: T.success, SEDANG: '#F59E0B', RENDAH: T.textMuted };

// warna match score: ≥85 hijau, 70–84 amber, <70 abu
export const matchColor = (score) => (score >= 85 ? T.success : score >= 70 ? '#F59E0B' : T.textMuted);
export const fmtScore = (v) => (v === null || v === undefined ? '—' : v);

// Ekstrak {code,msg} dari error axios (semua error PKL membawa code+msg).
export const parseErr = (error) => ({
  code: error?.response?.data?.code ?? null,
  msg: error?.response?.data?.msg ?? 'Terjadi kesalahan. Silakan coba lagi.',
});