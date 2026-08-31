import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Button, Avatar, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  useTheme, useMediaQuery, IconButton, Tooltip,
} from '@mui/material';
import {
  IconChevronRight, IconUser, IconInfoCircle, IconMapPin,
  IconAlertTriangle, IconX, IconCheck, IconArrowLeft,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';

// ═══════════════════════════════════════════════════════════════════════════
// Design tokens (PRD §4.1) — light palette. Dark mode maps via helper below.
// ═══════════════════════════════════════════════════════════════════════════
const T = {
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
  textFaint: '#64748B', // PRD §12: bump #94A3B8 → #64748B for contrast
  success: '#16A34A',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  track: '#EDF0F7',
};

// Kategori risiko — kode, label, warna (PRD §4.1). Urutan penanganan: RG→RB→RK→SP
const RISK = {
  RG: { code: 'RG', label: 'Risiko Ganda', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', priority: true },
  RB: { code: 'RB', label: 'Risiko Behavior', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  RK: { code: 'RK', label: 'Risiko Kompetensi', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  SP: { code: 'SP', label: 'Siap Penuh', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};
const RISK_ORDER = ['RG', 'RB', 'RK', 'SP'];      // urutan grup sidebar (PRD §6.5.1)
const CHIP_ORDER = ['SP', 'RB', 'RK', 'RG'];      // urutan filter chip (PRD §6.3)

// Kriteria penilaian — urutan tetap (PRD §6.8.D)
const CRITERIA_ORDER = [
  { key: 'kedisiplinan', label: 'Kedisiplinan' },
  { key: 'supervisor', label: 'Pengalaman Supervisor' },
  { key: 'mentoring', label: 'Kemauan Membimbing Teknis' },
  { key: 'skkni', label: 'Relevansi Unit SKKNI' },
  { key: 'trackRecord', label: 'Track Record (Profil Ini)' },
];

// Profil bobot per kategori risiko (Σ = 1.00). Dominan bila bobot ≥ 0.25.
const WEIGHT_PROFILES = {
  RG: { kedisiplinan: 0.35, supervisor: 0.30, mentoring: 0.20, skkni: 0.10, trackRecord: 0.05 },
  RB: { kedisiplinan: 0.40, supervisor: 0.30, mentoring: 0.10, skkni: 0.10, trackRecord: 0.10 },
  RK: { kedisiplinan: 0.10, supervisor: 0.10, mentoring: 0.30, skkni: 0.40, trackRecord: 0.10 },
  SP: { kedisiplinan: 0.25, supervisor: 0.25, mentoring: 0.20, skkni: 0.20, trackRecord: 0.10 },
};

// ═══════════════════════════════════════════════════════════════════════════
// Mock data — bentuk mengikuti Data Contract PRD §10
// ═══════════════════════════════════════════════════════════════════════════
const CLASS_INFO = { id: 'c-xi-tkj-1', name: 'XI TKJ', studentCount: 12 };

const INITIAL_STUDENTS = [
  // ── Risiko Ganda (1) ──
  { id: 's-001', name: 'Rian Maulana', riskCode: 'RG', behaviorScore: 48, competencyScore: 52, ewsActive: true, ewsReason: 'Behavior & kompetensi di bawah ambang batas 3 minggu', placement: null },
  // ── Risiko Behavior (4) ──
  { id: 's-002', name: 'Hamdan Rizki', riskCode: 'RB', behaviorScore: 62, competencyScore: 74, ewsActive: true, ewsReason: 'Tren penurunan behavior score 4 minggu', placement: null },
  { id: 's-003', name: 'Ilham Nugroho', riskCode: 'RB', behaviorScore: 59, competencyScore: 70, ewsActive: false, ewsReason: null, placement: null },
  { id: 's-004', name: 'Dedi Kurniawan', riskCode: 'RB', behaviorScore: 64, competencyScore: 72, ewsActive: false, ewsReason: null, placement: null },
  { id: 's-005', name: 'Joko Santoso', riskCode: 'RB', behaviorScore: 58, competencyScore: 71, ewsActive: false, ewsReason: null, placement: { industryId: 'i-090', industryName: 'Guru Komputer', source: 'manual' } },
  // ── Risiko Kompetensi (2) ──
  { id: 's-006', name: 'Fikri Ramadhan', riskCode: 'RK', behaviorScore: 80, competencyScore: 55, ewsActive: true, ewsReason: 'Nilai kompetensi jauh di bawah rata-rata kelas', placement: null },
  { id: 's-007', name: 'Bagas Prasetyo', riskCode: 'RK', behaviorScore: 78, competencyScore: 58, ewsActive: false, ewsReason: null, placement: null },
  // ── Siap Penuh (5) ──
  { id: 's-008', name: 'Rizal Fauzan', riskCode: 'SP', behaviorScore: 90, competencyScore: 88, ewsActive: false, ewsReason: null, placement: null },
  { id: 's-009', name: 'Yoga Pratama', riskCode: 'SP', behaviorScore: 86, competencyScore: 84, ewsActive: false, ewsReason: null, placement: null },
  { id: 's-010', name: 'Nanda Saputri', riskCode: 'SP', behaviorScore: 89, competencyScore: 91, ewsActive: false, ewsReason: null, placement: null },
  { id: 's-011', name: 'Eka Saputra', riskCode: 'SP', behaviorScore: 88, competencyScore: 90, ewsActive: false, ewsReason: null, placement: { industryId: 'i-070', industryName: 'AIC / Indigo Telkom', source: 'manual' } },
  { id: 's-012', name: 'Aditya Wibowo', riskCode: 'SP', behaviorScore: 85, competencyScore: 87, ewsActive: false, ewsReason: null, placement: { industryId: 'i-011', industryName: 'PT. Solusi Jaringan Makassar', source: 'recommendation' } },
];

// Industri mitra + nilai kriteria mentah (0–100). Skor akhir dihitung per bobot siswa.
const INDUSTRIES = [
  {
    id: 'i-011', name: 'PT. Solusi Jaringan Makassar', field: 'Teknologi Jaringan',
    city: 'Makassar', distanceKm: 3, evaluatorBonus: 5,
    criteria: { kedisiplinan: 80, supervisor: 100, mentoring: 80, skkni: 83, trackRecord: 62 },
    reasons: [
      'Kedisiplinan tinggi (4/5) — faktor bobot terbesar untuk profil ini',
      'Supervisor berpengalaman (5/5) — pembimbing terstruktur tersedia',
      'Track record: 62% siswa profil serupa berhasil menyelesaikan PKL — memadai',
    ],
    meta: { cohorts: 2, studentsHosted: 9, evaluationActive: true },
  },
  {
    id: 'i-012', name: 'CV. Teknindo Makassar', field: 'Jaringan & Server',
    city: 'Makassar', distanceKm: 5, evaluatorBonus: 5,
    criteria: { kedisiplinan: 100, supervisor: 80, mentoring: 60, skkni: 50, trackRecord: 80 },
    reasons: [
      'Kedisiplinan sangat tinggi (5/5) — lingkungan kerja disiplin',
      'Track record kuat: 80% siswa profil serupa berhasil menyelesaikan PKL',
    ],
    meta: { cohorts: 3, studentsHosted: 14, evaluationActive: true },
  },
  {
    id: 'i-013', name: 'Rama Komputer', field: 'Perangkat Lunak',
    city: 'Makassar', distanceKm: 8, evaluatorBonus: 5,
    criteria: { kedisiplinan: 100, supervisor: 80, mentoring: 60, skkni: 33, trackRecord: 85 },
    reasons: [
      'Kedisiplinan sangat tinggi (5/5)',
      'Track record terbaik: 85% siswa profil serupa berhasil',
      'Relevansi SKKNI rendah — perlu pendampingan teknis tambahan',
    ],
    meta: { cohorts: 1, studentsHosted: 5, evaluationActive: true },
  },
];

const INITIAL_SLOTS = { 'i-011': 2, 'i-012': 3, 'i-013': 3 };

// ═══════════════════════════════════════════════════════════════════════════
// Scoring (PRD §7) — dihitung di FE hanya untuk mock/assertion.
// ═══════════════════════════════════════════════════════════════════════════
const roundHalfUp = (n) => Math.floor(n + 0.5);

const buildRecommendations = (student, slots) => {
  const weights = WEIGHT_PROFILES[student.riskCode];
  const scored = INDUSTRIES.map((ind) => {
    const criteriaScores = CRITERIA_ORDER.map((c) => ({
      key: c.key,
      label: c.label,
      value: ind.criteria[c.key],
      weight: weights[c.key],
      dominant: weights[c.key] >= 0.25,
    }));
    const raw = criteriaScores.reduce((sum, c) => sum + c.weight * c.value, 0);
    const baseScore = roundHalfUp(raw);
    const matchScore = Math.min(100, baseScore + ind.evaluatorBonus);

    // PRD §7.3 — assertion mode dev: deteksi data tak konsisten
    if (import.meta.env?.DEV && Math.abs(raw - baseScore) > 1) {
      // eslint-disable-next-line no-console
      console.warn(`[PKL] baseScore drift pada ${ind.name}: Σ=${raw.toFixed(2)} vs base=${baseScore}`);
    }

    return {
      ...ind,
      criteriaScores,
      baseScore,
      matchScore,
      slotsAvailable: slots[ind.id] ?? 0,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || b.baseScore - a.baseScore);
  return scored.slice(0, 3).map((r, i) => ({ ...r, rank: i + 1 }));
};

// warna match score (PRD §7.4): ≥85 hijau, 70–84 amber, <70 abu
const matchColor = (score) => (score >= 85 ? T.success : score >= 70 ? '#F59E0B' : T.textMuted);

// ═══════════════════════════════════════════════════════════════════════════
// Small presentational helpers
// ═══════════════════════════════════════════════════════════════════════════
const RiskBadge = ({ code, size = 'sm' }) => {
  const r = RISK[code];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center',
        px: size === 'sm' ? 0.75 : 1, py: 0.25,
        borderRadius: '999px', backgroundColor: r.bg, color: r.color,
        border: `1px solid ${r.border}`,
        fontSize: size === 'sm' ? '0.625rem' : '0.6875rem', fontWeight: 700,
        lineHeight: 1.4, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      }}
    >
      {code}
    </Box>
  );
};

const EwsBadge = ({ label = 'EWS' }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.25,
      px: 0.75, py: 0.25, borderRadius: '999px',
      backgroundColor: RISK.RB.bg, color: '#B45309',
      border: `1px solid ${RISK.RB.border}`,
      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.4,
    }}
  >
    {label}
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// §6.2 Progress Penempatan
// ═══════════════════════════════════════════════════════════════════════════
const ProgressPenempatan = ({ placed, total, cardBg, cardBorder }) => {
  const pct = total ? (placed / total) * 100 : 0;
  const pending = total - placed;
  const done = placed === total && total > 0;
  return (
    <Box sx={{ minWidth: 210, border: `1px solid ${cardBorder}`, borderRadius: '12px', p: 1.75, backgroundColor: cardBg }}>
      <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, textAlign: 'right', fontWeight: 500 }}>
        Progress Penempatan
      </Typography>
      <Typography sx={{ fontSize: '1.375rem', lineHeight: 1.2, fontWeight: 700, color: T.textStrong, textAlign: 'right', mb: 0.75 }}>
        {placed}/{total}
      </Typography>
      <Box sx={{ height: 6, borderRadius: '999px', backgroundColor: T.track, overflow: 'hidden', mb: 0.75 }}>
        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: '999px', backgroundColor: T.success, transition: 'width 400ms cubic-bezier(.4,0,.2,1)' }} />
      </Box>
      <Typography sx={{ fontSize: '0.75rem', textAlign: 'right' }}>
        {done ? (
          <Box component="span" sx={{ color: T.success, fontWeight: 600 }}>✓ Penempatan kelas ini selesai</Box>
        ) : (
          <>
            <Box component="span" sx={{ color: T.success, fontWeight: 600 }}>✓ {placed} Ditempatkan</Box>
            <Box component="span" sx={{ color: T.textFaint }}> · </Box>
            <Box component="span" sx={{ color: '#B45309', fontWeight: 600 }}>{pending} Pending</Box>
          </>
        )}
      </Typography>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.3 Risk Filter Chips
// ═══════════════════════════════════════════════════════════════════════════
const RiskFilterChips = ({ summary, active, onToggle }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {CHIP_ORDER.map((code) => {
      const r = RISK[code];
      const count = summary[code] ?? 0;
      const isActive = active.has(code);
      return (
        <Box
          key={code}
          role="button"
          tabIndex={0}
          onClick={() => onToggle(code)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(code); } }}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1.5, py: 0.75, borderRadius: '999px', cursor: 'pointer',
            backgroundColor: r.bg, color: r.color,
            border: `1px solid ${isActive ? r.color : r.border}`,
            boxShadow: isActive ? `0 0 0 2px ${r.color}33` : 'none',
            fontSize: '0.75rem', fontWeight: 600, userSelect: 'none',
            transition: 'box-shadow 150ms, border-color 150ms',
            '&:focus-visible': { outline: `2px solid ${r.color}`, outlineOffset: '2px' },
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.color }} />
          <Box component="span" sx={{ fontWeight: 700 }}>{count}</Box>
          <Box component="span">{r.label}</Box>
        </Box>
      );
    })}
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// §6.5.2 Student Card
// ═══════════════════════════════════════════════════════════════════════════
const StudentCard = ({ student, selected, onSelect }) => {
  const placed = Boolean(student.placement);

  const bg = selected ? T.primary100 : placed ? RISK.SP.bg : T.bgCard;
  const border = selected
    ? `2px solid ${T.primary600}`
    : placed
      ? `1px solid ${RISK.SP.border}`
      : `1px solid ${T.border}`;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-selected={selected}
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(student.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(student.id); } }}
      sx={{
        p: '10px 12px', mb: 1, borderRadius: '12px', border, backgroundColor: bg,
        cursor: 'pointer', transition: 'transform 150ms, border-color 150ms, background-color 150ms',
        '&:hover': { borderColor: selected ? T.primary600 : T.borderStrong, transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: `2px solid ${T.primary600}`, outlineOffset: '2px' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: selected ? 700 : 600, color: T.textStrong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {student.name}
          </Typography>
          {student.ewsActive && <EwsBadge />}
        </Box>
        <RiskBadge code={student.riskCode} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, gap: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
          B:{student.behaviorScore} · K:{student.competencyScore}
        </Typography>
        {placed && (
          <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600, whiteSpace: 'nowrap' }}>
            ✓ Ditempatkan
          </Typography>
        )}
      </Box>
      {placed && (
        <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 500, mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          ✓ {student.placement.industryName}
        </Typography>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.5 Student Sidebar (grup + kartu)
// ═══════════════════════════════════════════════════════════════════════════
const StudentSidebar = ({ students, selectedId, onSelect, onResetFilter }) => {
  // kelompokkan + urutkan sesuai PRD §6.5.1
  const groups = useMemo(() => {
    return RISK_ORDER.map((code) => {
      const inGroup = students.filter((s) => s.riskCode === code);
      inGroup.sort((a, b) => {
        const ap = a.placement ? 1 : 0;
        const bp = b.placement ? 1 : 0;
        if (ap !== bp) return ap - bp; // yang ditempatkan didorong ke bawah
        return (a.behaviorScore + a.competencyScore) - (b.behaviorScore + b.competencyScore);
      });
      const placed = inGroup.filter((s) => s.placement).length;
      return { code, students: inGroup, placed, total: inGroup.length };
    }).filter((g) => g.total > 0);
  }, [students]);

  const totalShown = students.length;

  return (
    <Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textFaint, mb: 1 }}>
        Siswa — {CLASS_INFO.name} ({totalShown} Siswa)
      </Typography>

      {totalShown === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5, px: 2, border: `1px dashed ${T.border}`, borderRadius: '12px' }}>
          <Typography sx={{ fontSize: '0.875rem', color: T.textMuted, mb: 1.5 }}>
            Tidak ada siswa pada filter ini
          </Typography>
          <Button size="small" variant="outlined" onClick={onResetFilter} sx={{ textTransform: 'none', borderRadius: '8px' }}>
            Reset filter
          </Button>
        </Box>
      ) : (
        groups.map((g) => {
          const r = RISK[g.code];
          return (
            <Box key={g.code} sx={{ mb: 2 }}>
              {/* Group header */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  p: '8px 12px', borderRadius: '8px', mb: 1,
                  backgroundColor: r.bg, border: `1px solid ${r.border}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: r.color, whiteSpace: 'nowrap' }}>
                    {r.label}
                  </Typography>
                  {r.priority && (
                    <Box component="span" sx={{ px: 0.75, py: 0.125, borderRadius: '999px', backgroundColor: r.color, color: '#fff', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      PRIORITAS UTAMA
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {g.placed}/{g.total} ditempatkan
                </Typography>
              </Box>

              {g.students.map((s) => (
                <StudentCard key={s.id} student={s} selected={s.id === selectedId} onSelect={onSelect} />
              ))}
            </Box>
          );
        })
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.6 Student Detail Header
// ═══════════════════════════════════════════════════════════════════════════
const StudentDetailHeader = ({ student }) => {
  const r = RISK[student.riskCode];
  return (
    <Box sx={{ border: `1px solid ${r.border}`, borderRadius: '12px', p: 2, mb: 2, backgroundColor: T.bgCard }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1.3, fontWeight: 700, color: T.textStrong }}>
              {student.name}
            </Typography>
            {student.ewsActive && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '999px', backgroundColor: RISK.RB.bg, border: `1px solid ${RISK.RB.border}`, color: '#B45309' }}>
                <IconAlertTriangle size={13} />
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>EWS Aktif</Typography>
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: 0.5 }}>
            {CLASS_INFO.name} · B:{student.behaviorScore} · K:{student.competencyScore}
          </Typography>
          {student.ewsActive && student.ewsReason && (
            <Typography sx={{ fontSize: '0.8125rem', color: r.color, fontWeight: 500, mt: 0.75 }}>
              {student.ewsReason}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 1, borderRadius: '999px', border: `1px solid ${r.color}`, color: r.color, flexShrink: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r.color }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>{r.label}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.7 Matching Weights (read-only)
// ═══════════════════════════════════════════════════════════════════════════
const MatchingWeights = ({ riskCode }) => {
  const r = RISK[riskCode];
  const weights = WEIGHT_PROFILES[riskCode];
  return (
    <Box sx={{ border: `1px solid ${T.border}`, borderRadius: '10px', p: 1.5, mb: 2, backgroundColor: T.bgCard }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: T.textBody, mb: 1 }}>
        Prioritas matching untuk {r.label}:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {CRITERIA_ORDER.map((c) => {
          const w = weights[c.key];
          const dominant = w >= 0.25;
          return (
            <Box
              key={c.key}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1, py: 0.5, borderRadius: '999px',
                backgroundColor: dominant ? RISK.RB.bg : T.bgSubtle,
                border: `1px solid ${dominant ? RISK.RB.border : T.border}`,
                color: dominant ? '#B45309' : T.textMuted,
                fontSize: '0.6875rem', fontWeight: dominant ? 700 : 500,
              }}
            >
              {c.label} {Math.round(w * 100)}%{dominant ? ' ★' : ''}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.8.D Criteria Row
// ═══════════════════════════════════════════════════════════════════════════
const CriteriaRow = ({ criteria }) => {
  const { label, value, weight, dominant } = criteria;
  return (
    <Box sx={{ mb: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        {dominant && <Box sx={{ width: 3, height: 14, borderRadius: '2px', backgroundColor: T.primary600, flexShrink: 0 }} />}
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: dominant ? 600 : 400, color: dominant ? T.primary700 : T.textBody, flex: 1, minWidth: 0 }}>
          {label}
        </Typography>
        {dominant && (
          <Box component="span" sx={{ px: 0.75, py: 0.125, borderRadius: '999px', backgroundColor: T.primary050, color: T.primary600, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            DOMINAN
          </Box>
        )}
        <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: '6px', backgroundColor: '#F1F5F9', color: T.textMuted, fontSize: '0.6875rem', fontWeight: 500 }}>
          {Math.round(weight * 100)}%
        </Box>
        <Typography sx={{ width: 28, textAlign: 'right', fontSize: '0.8125rem', fontWeight: 600, color: T.textStrong, flexShrink: 0 }}>
          {value}
        </Typography>
      </Box>
      <Box
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${value} dari 100`}
        sx={{ height: 4, borderRadius: '999px', backgroundColor: T.track, overflow: 'hidden' }}
      >
        <Box sx={{ height: '100%', width: `${value}%`, borderRadius: '999px', backgroundColor: dominant ? T.primary600 : T.primary400 }} />
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// §6.8 Industry Recommendation Card
// ═══════════════════════════════════════════════════════════════════════════
const IndustryRecommendationCard = ({ rec, riskLabel, isPlacedHere, placementBusy, onPilih, onBatal }) => {
  const slotFull = rec.slotsAvailable <= 0;
  const disabled = slotFull && !isPlacedHere;

  return (
    <Box
      sx={{
        border: `1px solid ${T.border}`, borderRadius: '12px', p: 2, mb: 2,
        backgroundColor: T.bgCard, opacity: disabled ? 0.7 : 1,
      }}
    >
      {/* A. Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: T.primary600 }}>#{rec.rank}</Typography>
            <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.3, fontWeight: 700, color: T.textStrong }}>
              {rec.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            <IconMapPin size={13} color={T.textMuted} />
            <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
              {rec.field} · {rec.city} · {rec.distanceKm} km · {rec.slotsAvailable} slot tersedia
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '2rem', lineHeight: 1.05, fontWeight: 800, color: matchColor(rec.matchScore) }}>
            {rec.matchScore}%
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: T.textFaint }}>match score</Typography>
        </Box>
      </Box>

      {/* B. Strip skor dasar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: T.bgSubtle, borderRadius: '8px', px: 1.25, py: 0.75, mt: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: T.textBody }}>
          Skor dasar: <b>{rec.baseScore}</b>
        </Typography>
        {rec.evaluatorBonus > 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600 }}>
            ▲ +{rec.evaluatorBonus} evaluator aktif
          </Typography>
        )}
      </Box>

      {/* C. Label pembobotan */}
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.primary600, mt: 1.75, mb: 1 }}>
        — Bobot Disesuaikan Profil {riskLabel}
      </Typography>

      {/* D. Baris kriteria */}
      {rec.criteriaScores.map((c) => (
        <CriteriaRow key={c.key} criteria={c} />
      ))}

      {/* E. Kotak alasan */}
      <Box sx={{ backgroundColor: RISK.SP.bg, border: `1px solid ${RISK.SP.border}`, borderRadius: '10px', p: 1.5, mt: 1.5 }}>
        {rec.reasons.map((reason, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: i < rec.reasons.length - 1 ? 0.75 : 0 }}>
            <IconCheck size={15} color={T.success} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: T.textBody, lineHeight: 1.5 }}>{reason}</Typography>
          </Box>
        ))}
      </Box>

      {/* F. Footer meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
          {rec.meta.cohorts} angkatan, {rec.meta.studentsHosted} siswa
        </Typography>
        {rec.meta.evaluationActive && (
          <>
            <Typography sx={{ fontSize: '0.75rem', color: T.textFaint }}>·</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: T.success }} />
              <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>Aktif mengisi evaluasi</Typography>
            </Box>
          </>
        )}
      </Box>

      {/* G. CTA */}
      {isPlacedHere ? (
        <Box sx={{ mt: 1.75 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<IconCheck size={18} />}
            sx={{ height: 44, borderRadius: '10px', textTransform: 'none', fontWeight: 700, backgroundColor: T.success, '&:hover': { backgroundColor: '#15803D' } }}
          >
            Ditempatkan di sini
          </Button>
          <Box sx={{ textAlign: 'center', mt: 0.75 }}>
            <Typography
              component="button"
              onClick={onBatal}
              sx={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: T.textMuted, textDecoration: 'underline', '&:hover': { color: '#EF4444' } }}
            >
              Batalkan penempatan
            </Typography>
          </Box>
        </Box>
      ) : (
        <Tooltip title={disabled ? 'Slot penuh — tidak dapat menempatkan siswa di sini' : ''} disableHoverListener={!disabled}>
          <span>
            <Button
              fullWidth
              disabled={disabled || placementBusy}
              onClick={() => onPilih(rec)}
              sx={{
                mt: 1.75, height: 44, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                border: `1.5px solid ${disabled ? T.borderStrong : T.primary600}`,
                color: disabled ? T.borderStrong : T.primary600, backgroundColor: 'transparent',
                '&:hover': { backgroundColor: T.primary050 },
                '&:active': { backgroundColor: T.primary100 },
                '&.Mui-disabled': { color: T.borderStrong, borderColor: T.borderStrong },
              }}
            >
              {placementBusy ? (
                <><CircularProgress size={16} sx={{ mr: 1, color: T.primary600 }} /> Menempatkan…</>
              ) : slotFull ? 'Slot penuh' : 'Pilih Industri Ini'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Panel skeleton (loading saat ganti siswa)
// ═══════════════════════════════════════════════════════════════════════════
const PanelSkeleton = () => (
  <Box>
    <Skeleton variant="rounded" height={92} sx={{ borderRadius: '12px', mb: 2 }} />
    <Skeleton variant="rounded" height={64} sx={{ borderRadius: '10px', mb: 2 }} />
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} variant="rounded" height={360} sx={{ borderRadius: '12px', mb: 2 }} />
    ))}
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
const PenempatanPKL = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [activeFilters, setActiveFilters] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // { student, rec }
  const [cancelDialog, setCancelDialog] = useState(null);   // { student }
  const [placementBusy, setPlacementBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'
  const panelTimer = useRef(null);

  const cardBorder = T.border;
  const cardBg = T.bgCard;

  // Ringkasan risiko (count per kategori) — dari seluruh kelas, bukan hasil filter
  const riskSummary = useMemo(() => {
    return students.reduce((acc, s) => {
      acc[s.riskCode] = (acc[s.riskCode] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const progress = useMemo(() => {
    const placed = students.filter((s) => s.placement).length;
    return { placed, total: students.length };
  }, [students]);

  // Filter siswa untuk sidebar (multi-select). Kosong = tampil semua.
  const filteredStudents = useMemo(() => {
    if (activeFilters.size === 0) return students;
    return students.filter((s) => activeFilters.has(s.riskCode));
  }, [students, activeFilters]);

  // §8.1 — pilih otomatis siswa prioritas tertinggi yang belum ditempatkan
  const pickDefaultStudent = useCallback((list) => {
    for (const code of RISK_ORDER) {
      const candidates = list
        .filter((s) => s.riskCode === code && !s.placement)
        .sort((a, b) => (a.behaviorScore + a.competencyScore) - (b.behaviorScore + b.competencyScore));
      if (candidates.length) return candidates[0].id;
    }
    return list[0]?.id ?? null;
  }, []);

  useEffect(() => {
    if (selectedId === null && students.length) {
      setSelectedId(pickDefaultStudent(students));
    }
  }, [selectedId, students, pickDefaultStudent]);

  // Jika siswa terpilih tersaring keluar, pindah ke default hasil filter
  useEffect(() => {
    if (selectedId && !filteredStudents.some((s) => s.id === selectedId) && filteredStudents.length) {
      setSelectedId(pickDefaultStudent(filteredStudents));
    }
  }, [filteredStudents, selectedId, pickDefaultStudent]);

  useEffect(() => () => clearTimeout(panelTimer.current), []);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId],
  );

  const recommendations = useMemo(
    () => (selectedStudent ? buildRecommendations(selectedStudent, slots) : []),
    [selectedStudent, slots],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectStudent = (id) => {
    if (id === selectedId) { if (isMobile) setMobileView('detail'); return; }
    setPanelLoading(true);
    setSelectedId(id);
    if (isMobile) setMobileView('detail');
    clearTimeout(panelTimer.current);
    panelTimer.current = setTimeout(() => setPanelLoading(false), 260);
  };

  const toggleFilter = (code) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const openConfirm = (rec) => setConfirmDialog({ student: selectedStudent, rec });

  const commitPlacement = () => {
    if (!confirmDialog) return;
    const { student, rec } = confirmDialog;
    setPlacementBusy(true);
    // Simulasi API POST /api/placements + update optimistis
    setTimeout(() => {
      setStudents((prev) => prev.map((s) =>
        s.id === student.id
          ? { ...s, placement: { industryId: rec.id, industryName: rec.name, source: 'recommendation' } }
          : s,
      ));
      setSlots((prev) => ({ ...prev, [rec.id]: Math.max(0, (prev[rec.id] ?? 0) - 1) }));
      setPlacementBusy(false);
      setConfirmDialog(null);
      setToast({ severity: 'success', msg: `${student.name} ditempatkan di ${rec.name}` });

      // §8.1 — fokus otomatis ke siswa berikutnya yang belum ditempatkan
      setTimeout(() => {
        setStudents((cur) => {
          const nextId = pickDefaultStudent(cur.filter((s) => s.id !== student.id));
          if (nextId) setSelectedId(nextId);
          return cur;
        });
      }, 400);
    }, 700);
  };

  const openCancel = () => setCancelDialog({ student: selectedStudent });

  const commitCancel = () => {
    if (!cancelDialog) return;
    const { student } = cancelDialog;
    const industryId = student.placement?.industryId;
    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, placement: null } : s)));
    if (industryId && INITIAL_SLOTS[industryId] !== undefined) {
      setSlots((prev) => ({ ...prev, [industryId]: (prev[industryId] ?? 0) + 1 }));
    }
    setCancelDialog(null);
    setToast({ severity: 'info', msg: `Penempatan ${student.name} dibatalkan` });
  };

  const topTitle = 'PKL Placement Engine';
  const riskLabel = selectedStudent ? RISK[selectedStudent.riskCode].label : '';
  const showDetail = !isMobile || mobileView === 'detail';
  const showList = !isMobile || mobileView === 'list';

  return (
    <PageContainer title="Penempatan PKL" description="PKL Placement Engine – Kepala Jurusan">
      {/* Wrapper: reclaim gutter Container (FullLayout) di layar lebar agar konten
          memakai ruang kiri-kanan secara maksimal. Nilai negatif = besar padding
          gutter MUI Container (16px xs, 24px sm+). */}
      <Box sx={{ mx: { xs: 0, sm: '-24px', lg: '-24px' } }}>
      {/* ═══ Topbar ═══ (PRD §6.1) */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 2, flexWrap: 'wrap', px: { xs: 2, md: 2.5 }, py: 1.25, mb: 2,
          borderRadius: '12px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography component={Link} to="/dashboard/kepala-jurusan/konfigurasi-jurusan" sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.primary600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            {CLASS_INFO.name}
          </Typography>
          <IconChevronRight size={15} color={T.textFaint} />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textStrong }}>Penempatan PKL</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 40, height: 40, backgroundColor: T.primary100, color: T.primary600 }}>
            <IconUser size={22} />
          </Avatar>
          <Box sx={{ lineHeight: 1.2 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textStrong }}>
              {user?.name || 'Kepala Jurusan'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>Kepala Jurusan {CLASS_INFO.name}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══ Page Card ═══ */}
      <Box sx={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', p: { xs: 2, md: 3 }, boxShadow: '0 1px 3px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.04)' }}>
        {/* Judul + Progress widget */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, lineHeight: 1.2, fontWeight: 700, color: T.textStrong }}>
            {topTitle}
          </Typography>
          <ProgressPenempatan placed={progress.placed} total={progress.total} cardBg={cardBg} cardBorder={cardBorder} />
        </Box>

        {/* Filter chips + disclaimer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <RiskFilterChips summary={riskSummary} active={activeFilters} onToggle={toggleFilter} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconInfoCircle size={14} color={T.textFaint} />
            <Typography sx={{ fontSize: '0.75rem', color: T.textFaint }}>
              Sistem merekomendasikan · Keputusan final ada pada Kepala Jurusan
            </Typography>
          </Box>
        </Box>

        {/* Master-detail */}
        <Box sx={{ display: 'flex', gap: { xs: 2, md: '20px', xl: '28px' }, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Sidebar — melebar bertahap: tablet 260 → desktop 300 → wide 340 */}
          {showList && (
            <Box
              sx={{
                flex: { xs: '1 1 auto', md: '0 0 260px', lg: '0 0 300px', xl: '0 0 340px' },
                width: { xs: '100%', md: 260, lg: 300, xl: 340 },
                position: { md: 'sticky' }, top: { md: 88 },
                maxHeight: { md: 'calc(100vh - 112px)' }, overflowY: { md: 'auto' },
                pr: { md: 0.5 },
              }}
            >
              <StudentSidebar
                students={filteredStudents}
                selectedId={selectedId}
                onSelect={handleSelectStudent}
                onResetFilter={() => setActiveFilters(new Set())}
              />
            </Box>
          )}

          {/* Detail panel */}
          {showDetail && (
            <Box sx={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
              {isMobile && (
                <Button
                  size="small"
                  startIcon={<IconArrowLeft size={16} />}
                  onClick={() => setMobileView('list')}
                  sx={{ mb: 1.5, textTransform: 'none', color: T.primary600 }}
                >
                  Pilih siswa lain
                </Button>
              )}

              {panelLoading ? (
                <PanelSkeleton />
              ) : !selectedStudent ? (
                <Box sx={{ textAlign: 'center', py: 8, color: T.textMuted }}>
                  <Typography sx={{ fontSize: '0.875rem' }}>Pilih siswa untuk melihat rekomendasi</Typography>
                </Box>
              ) : (
                <Box aria-live="polite">
                  <StudentDetailHeader student={selectedStudent} />
                  <MatchingWeights riskCode={selectedStudent.riskCode} />

                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textFaint, mb: 1.5 }}>
                    Rekomendasi Industri — Top {recommendations.length}
                  </Typography>

                  {recommendations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6, border: `1px dashed ${T.border}`, borderRadius: '12px' }}>
                      <Typography sx={{ fontSize: '0.875rem', color: T.textMuted }}>
                        Belum ada industri mitra yang cocok dengan profil siswa ini
                      </Typography>
                    </Box>
                  ) : (
                    recommendations.map((rec) => {
                      const isPlacedHere = selectedStudent.placement?.industryId === rec.id;
                      return (
                        <IndustryRecommendationCard
                          key={rec.id}
                          rec={rec}
                          riskLabel={riskLabel}
                          isPlacedHere={isPlacedHere}
                          placementBusy={placementBusy && confirmDialog?.rec?.id === rec.id}
                          onPilih={openConfirm}
                          onBatal={openCancel}
                        />
                      );
                    })
                  )}

                  {/* §8.5 — jalur penempatan manual di luar rekomendasi */}
                  {!selectedStudent.placement && recommendations.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Typography
                        component="button"
                        onClick={() => setToast({ severity: 'info', msg: 'Pencarian industri manual akan tersedia setelah integrasi API.' })}
                        sx={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: T.primary600, textDecoration: 'underline' }}
                      >
                        Tempatkan ke industri lain…
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
      </Box>

      {/* ═══ Modal konfirmasi penempatan (PRD §8.2) ═══ */}
      <Dialog open={Boolean(confirmDialog)} onClose={() => !placementBusy && setConfirmDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Konfirmasi Penempatan
          <IconButton size="small" onClick={() => !placementBusy && setConfirmDialog(null)}><IconX size={18} /></IconButton>
        </DialogTitle>
        <DialogContent>
          {confirmDialog && (
            <Box sx={{ fontSize: '0.875rem' }}>
              <Typography sx={{ fontSize: '0.875rem', color: T.textBody, mb: 1.5 }}>
                Tetapkan penempatan siswa berikut? Aksi ini akan menggunakan satu slot industri.
              </Typography>
              {[
                ['Siswa', confirmDialog.student.name],
                ['Industri', confirmDialog.rec.name],
                ['Match Score', `${confirmDialog.rec.matchScore}%`],
                ['Sisa slot setelah penempatan', Math.max(0, confirmDialog.rec.slotsAvailable - 1)],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: `1px solid ${T.border}` }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: T.textMuted }}>{k}</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: T.textStrong }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(null)} disabled={placementBusy} sx={{ textTransform: 'none', color: T.textMuted }}>
            Batal
          </Button>
          <Button
            onClick={commitPlacement}
            disabled={placementBusy}
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', backgroundColor: T.primary600, '&:hover': { backgroundColor: T.primary700 } }}
          >
            {placementBusy ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> Menempatkan…</> : 'Tetapkan Penempatan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Modal konfirmasi pembatalan (PRD §8.4) ═══ */}
      <Dialog open={Boolean(cancelDialog)} onClose={() => setCancelDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Batalkan Penempatan</DialogTitle>
        <DialogContent>
          {cancelDialog && (
            <Typography sx={{ fontSize: '0.875rem', color: T.textBody }}>
              Batalkan penempatan <b>{cancelDialog.student.name}</b> di{' '}
              <b>{cancelDialog.student.placement?.industryName}</b>? Slot industri akan dikembalikan.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog(null)} sx={{ textTransform: 'none', color: T.textMuted }}>Tidak</Button>
          <Button onClick={commitCancel} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
            Ya, Batalkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Toast ═══ */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '10px' }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageContainer>
  );
};

export default PenempatanPKL;
