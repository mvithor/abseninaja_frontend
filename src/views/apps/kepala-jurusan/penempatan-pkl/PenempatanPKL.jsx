import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Avatar, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress,
  useTheme, useMediaQuery, IconButton, Tooltip, Select, MenuItem, FormControl, TextField,
} from '@mui/material';
import {
  IconUser, IconInfoCircle, IconMapPin, IconAlertTriangle,
  IconX, IconCheck, IconArrowLeft, IconRefresh,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import {
  fetchClassOptions, fetchClassDashboard, fetchRecommendations,
  createPlacement, cancelPlacement,
} from './penempatanPklApi';
import { adaptDashboard, adaptRecommendations } from './penempatanPklAdapter';

// ═══════════════════════════════════════════════════════════════════════════
// Design tokens
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
  textFaint: '#64748B',
  success: '#16A34A',
  danger: '#EF4444',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  track: '#EDF0F7',
};

// Kategori risiko (kode server: SP/RB/RK/RG). Urutan grup sidebar: RG→RB→RK→SP.
const RISK = {
  RG: { code: 'RG', label: 'Risiko Ganda', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', priority: true },
  RB: { code: 'RB', label: 'Risiko Behavior', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  RK: { code: 'RK', label: 'Risiko Kompetensi', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  SP: { code: 'SP', label: 'Siap Penuh', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};
const NULL_GROUP = { label: 'Belum Terklasifikasi', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
const CHIP_ORDER = ['SP', 'RB', 'RK', 'RG'];

// warna match score: ≥85 hijau, 70–84 amber, <70 abu
const matchColor = (score) => (score >= 85 ? T.success : score >= 70 ? '#F59E0B' : T.textMuted);
const fmtScore = (v) => (v === null || v === undefined ? '—' : v);

// Ekstrak {code,msg} dari error axios (semua error PKL membawa code+msg).
const parseErr = (error) => ({
  code: error?.response?.data?.code ?? null,
  msg: error?.response?.data?.msg ?? 'Terjadi kesalahan. Silakan coba lagi.',
});

// ═══════════════════════════════════════════════════════════════════════════
// Presentational helpers
// ═══════════════════════════════════════════════════════════════════════════
const RiskBadge = ({ code, size = 'sm' }) => {
  const r = RISK[code];
  if (!r) {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.25, borderRadius: '999px', backgroundColor: NULL_GROUP.bg, color: NULL_GROUP.color, border: `1px solid ${NULL_GROUP.border}`, fontSize: '0.625rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        —
      </Box>
    );
  }
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

const ProgressPenempatan = ({ placed, total, pending, cardBg, cardBorder }) => {
  const pct = total ? (placed / total) * 100 : 0;
  const done = placed === total && total > 0;
  const sisa = pending ?? Math.max(0, total - placed);
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
            <Box component="span" sx={{ color: '#B45309', fontWeight: 600 }}>{sisa} Pending</Box>
          </>
        )}
      </Typography>
    </Box>
  );
};

const RiskFilterChips = ({ counts, active, onToggle }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {CHIP_ORDER.map((code) => {
      const r = RISK[code];
      const count = counts[code] ?? 0;
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

const StudentCard = ({ student, selected, onSelect }) => {
  const placed = Boolean(student.placement);
  const bg = selected ? T.primary100 : placed ? RISK.SP.bg : T.bgCard;
  const border = selected
    ? `2px solid ${T.primary600}`
    : placed ? `1px solid ${RISK.SP.border}` : `1px solid ${T.border}`;

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
          B:{fmtScore(student.behaviorScore)} · K:{fmtScore(student.competencyScore)}
        </Typography>
        {placed && (
          <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Ditempatkan</Typography>
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

// Grup mengikuti urutan server (JANGAN sortir ulang). Header pakai count/placed server.
const StudentSidebar = ({ className, students, riskSummary, selectedId, onSelect, onResetFilter }) => {
  const groups = useMemo(() => {
    const order = [];
    const index = {};
    students.forEach((s) => {
      const code = s.riskCode ?? 'NULL';
      if (!(code in index)) { index[code] = order.length; order.push({ code, students: [] }); }
      order[index[code]].students.push(s);
    });
    return order;
  }, [students]);

  return (
    <Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textFaint, mb: 1 }}>
        Siswa — {className} ({students.length} Siswa)
      </Typography>

      {students.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5, px: 2, border: `1px dashed ${T.border}`, borderRadius: '12px' }}>
          <Typography sx={{ fontSize: '0.875rem', color: T.textMuted, mb: 1.5 }}>Tidak ada siswa pada filter ini</Typography>
          <Button size="small" variant="outlined" onClick={onResetFilter} sx={{ textTransform: 'none', borderRadius: '8px' }}>Reset filter</Button>
        </Box>
      ) : (
        groups.map((g) => {
          const isNull = g.code === 'NULL';
          const r = isNull ? NULL_GROUP : RISK[g.code];
          const summary = riskSummary[g.code];
          const count = isNull ? g.students.length : (summary?.count ?? g.students.length);
          const placed = isNull ? g.students.filter((s) => s.placement).length : (summary?.placed ?? 0);
          return (
            <Box key={g.code} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '8px 12px', borderRadius: '8px', mb: 1, backgroundColor: r.bg, border: `1px solid ${r.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: r.color, whiteSpace: 'nowrap' }}>{r.label}</Typography>
                  {!isNull && r.priority && (
                    <Box component="span" sx={{ px: 0.75, py: 0.125, borderRadius: '999px', backgroundColor: r.color, color: '#fff', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      PRIORITAS UTAMA
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {placed}/{count} ditempatkan
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

const StudentDetailHeader = ({ student, className }) => {
  const r = RISK[student.riskCode];
  const borderColor = r ? r.border : NULL_GROUP.border;
  return (
    <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: '12px', p: 2, mb: 2, backgroundColor: T.bgCard }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1.3, fontWeight: 700, color: T.textStrong }}>{student.name}</Typography>
            {student.ewsActive && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: '999px', backgroundColor: RISK.RB.bg, border: `1px solid ${RISK.RB.border}`, color: '#B45309' }}>
                <IconAlertTriangle size={13} />
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>EWS Aktif</Typography>
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: T.textMuted, mt: 0.5 }}>
            {className} · B:{fmtScore(student.behaviorScore)} · K:{fmtScore(student.competencyScore)}
          </Typography>
          {student.ewsActive && student.ewsReason && (
            <Typography sx={{ fontSize: '0.8125rem', color: (r ? r.color : NULL_GROUP.color), fontWeight: 500, mt: 0.75 }}>
              {student.ewsReason}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.75, py: 1, borderRadius: '999px', border: `1px solid ${r ? r.color : NULL_GROUP.color}`, color: r ? r.color : NULL_GROUP.color, flexShrink: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r ? r.color : NULL_GROUP.color }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>{r ? r.label : NULL_GROUP.label}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Banner penempatan aktif — jalur batal SELALU terjangkau (tak bergantung Top-3).
const PlacedBanner = ({ placement, busy, onCancel }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', border: `1px solid ${RISK.SP.border}`, backgroundColor: RISK.SP.bg, borderRadius: '12px', p: 1.75, mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <IconCheck size={18} color={T.success} />
      <Typography sx={{ fontSize: '0.875rem', color: T.textStrong, minWidth: 0 }}>
        Ditempatkan di <b>{placement.industryName}</b>
      </Typography>
    </Box>
    <Button
      size="small"
      onClick={onCancel}
      disabled={busy}
      startIcon={<IconX size={15} />}
      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', color: T.danger, '&:hover': { backgroundColor: '#FEF2F2' } }}
    >
      Batalkan penempatan
    </Button>
  </Box>
);

const CriteriaRow = ({ criteria }) => {
  const { label, value, weight, dominant, available } = criteria;
  const pctWeight = weight === null || weight === undefined ? null : Math.round(weight * 100);
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
        {pctWeight !== null && (
          <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: '6px', backgroundColor: '#F1F5F9', color: T.textMuted, fontSize: '0.6875rem', fontWeight: 500 }}>
            {pctWeight}%
          </Box>
        )}
        <Typography sx={{ width: 40, textAlign: 'right', fontSize: '0.8125rem', fontWeight: 600, color: T.textStrong, flexShrink: 0 }}>
          {available && value !== null ? value : '—'}
        </Typography>
      </Box>
      {available && value !== null ? (
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
      ) : (
        <Typography sx={{ fontSize: '0.6875rem', color: T.textMuted, fontStyle: 'italic' }}>Data belum tersedia</Typography>
      )}
    </Box>
  );
};

const CONFIDENCE_COLOR = { TINGGI: T.success, SEDANG: '#F59E0B', RENDAH: T.textMuted };

const IndustryRecommendationCard = ({ rec, riskLabel, isPlacedHere, studentPlaced, placementBusy, onPilih }) => {
  const slotFull = rec.slotsAvailable <= 0;
  const disabledByOther = studentPlaced && !isPlacedHere;
  const disabled = (slotFull && !isPlacedHere) || disabledByOther;
  const conf = rec.confidence;

  return (
    <Box sx={{ border: `1px solid ${T.border}`, borderRadius: '12px', p: 2, mb: 2, backgroundColor: T.bgCard, opacity: disabled && !isPlacedHere ? 0.75 : 1 }}>
      {/* A. Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: T.primary600 }}>#{rec.rank}</Typography>
            <Typography sx={{ fontSize: '1.125rem', lineHeight: 1.3, fontWeight: 700, color: T.textStrong }}>{rec.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            <IconMapPin size={13} color={T.textMuted} />
            <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>
              {[rec.field, rec.city, `${rec.slotsAvailable} slot tersedia`].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '2rem', lineHeight: 1.05, fontWeight: 800, color: matchColor(rec.matchScore) }}>{rec.matchScore}%</Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: T.textFaint }}>match score</Typography>
        </Box>
      </Box>

      {/* B. Strip skor dasar + confidence */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', backgroundColor: T.bgSubtle, borderRadius: '8px', px: 1.25, py: 0.75, mt: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: T.textBody }}>Skor dasar: <b>{rec.baseScore}</b></Typography>
        {rec.evaluatorBonus > 0 && (
          <Typography sx={{ fontSize: '0.75rem', color: T.success, fontWeight: 600 }}>▲ +{rec.evaluatorBonus} evaluator aktif</Typography>
        )}
        {conf?.level && (
          <Box component="span" sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.25, borderRadius: '999px', border: `1px solid ${(CONFIDENCE_COLOR[conf.level] ?? T.textMuted)}33`, color: CONFIDENCE_COLOR[conf.level] ?? T.textMuted, fontSize: '0.625rem', fontWeight: 700 }}>
            Keyakinan {conf.level}{conf.persen != null ? ` ${conf.persen}%` : ''}
          </Box>
        )}
      </Box>

      {/* C. Label pembobotan */}
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.primary600, mt: 1.75, mb: 1 }}>
        — Bobot Disesuaikan Profil {riskLabel}
      </Typography>

      {/* D. Baris kriteria (selalu 5, hormati available:false) */}
      {rec.criteriaScores.map((c) => (
        <CriteriaRow key={c.key} criteria={c} />
      ))}

      {/* E. Kotak alasan */}
      {rec.reasons.length > 0 && (
        <Box sx={{ backgroundColor: RISK.SP.bg, border: `1px solid ${RISK.SP.border}`, borderRadius: '10px', p: 1.5, mt: 1.5 }}>
          {rec.reasons.map((reason, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: i < rec.reasons.length - 1 ? 0.75 : 0 }}>
              <IconCheck size={15} color={T.success} style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.75rem', color: T.textBody, lineHeight: 1.5 }}>{reason}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* F. CTA */}
      {isPlacedHere ? (
        <Button
          fullWidth
          variant="contained"
          disableElevation
          startIcon={<IconCheck size={18} />}
          sx={{ mt: 1.75, height: 44, borderRadius: '10px', textTransform: 'none', fontWeight: 700, backgroundColor: T.success, '&:hover': { backgroundColor: '#15803D' }, '&.Mui-disabled': { backgroundColor: T.success, color: '#fff', opacity: 0.9 } }}
          disabled
        >
          Ditempatkan di sini
        </Button>
      ) : (
        <Tooltip
          title={disabledByOther ? 'Siswa sudah ditempatkan — batalkan dulu untuk memilih industri lain' : (slotFull ? 'Slot penuh — tidak dapat menempatkan siswa di sini' : '')}
          disableHoverListener={!disabled}
        >
          <span>
            <Button
              fullWidth
              disabled={disabled || placementBusy}
              onClick={() => onPilih(rec)}
              sx={{
                mt: 1.75, height: 44, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                border: `1.5px solid ${disabled ? T.borderStrong : T.primary600}`,
                color: disabled ? T.borderStrong : T.primary600, backgroundColor: 'transparent',
                '&:hover': { backgroundColor: T.primary050, borderColor: T.primary700, color: T.primary700 },
                '&:active': { backgroundColor: T.primary100, color: T.primary700 },
                '&.Mui-disabled': { color: T.borderStrong, borderColor: T.borderStrong },
              }}
            >
              {placementBusy ? (<><CircularProgress size={16} sx={{ mr: 1, color: T.primary600 }} /> Menempatkan…</>) : slotFull ? 'Slot penuh' : 'Pilih Industri Ini'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

const PanelSkeleton = () => (
  <Box>
    <Skeleton variant="rounded" height={92} sx={{ borderRadius: '12px', mb: 2 }} />
    <Skeleton variant="rounded" height={64} sx={{ borderRadius: '10px', mb: 2 }} />
    {[0, 1, 2].map((i) => (
      <Skeleton key={i} variant="rounded" height={360} sx={{ borderRadius: '12px', mb: 2 }} />
    ))}
  </Box>
);

const SidebarSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />
    {[0, 1, 2].map((g) => (
      <Box key={g} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" height={34} sx={{ borderRadius: '8px', mb: 1 }} />
        {[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={62} sx={{ borderRadius: '12px', mb: 1 }} />)}
      </Box>
    ))}
  </Box>
);

const StateCard = ({ icon, title, message, actionLabel, onAction }) => (
  <Box sx={{ backgroundColor: T.bgCard, borderRadius: '16px', border: `1px solid ${T.border}`, p: { xs: 4, md: 6 }, textAlign: 'center' }}>
    {icon}
    <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: T.textStrong, mt: 1.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: '0.875rem', color: T.textMuted, mt: 0.5, maxWidth: 460, mx: 'auto' }}>{message}</Typography>
    {onAction && (
      <Button onClick={onAction} startIcon={<IconRefresh size={16} />} variant="outlined" sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600, borderRadius: '999px', borderColor: T.primary600, color: T.primary600, '&:hover': { borderColor: T.primary700, backgroundColor: T.primary050 } }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
const PenempatanPKL = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const [classId, setClassId] = useState(null);
  const [activeFilters, setActiveFilters] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { student, rec }
  const [cancelDialog, setCancelDialog] = useState(null);   // { student }
  const [cancelReason, setCancelReason] = useState('');
  const [toast, setToast] = useState(null);
  const [mobileView, setMobileView] = useState('list');

  const cardBorder = T.border;
  const cardBg = T.bgCard;

  // ── Queries ────────────────────────────────────────────────────────────────
  const classOptionsQuery = useQuery({
    queryKey: ['pkl-class-options'],
    queryFn: fetchClassOptions,
    staleTime: 5 * 60_000,
  });
  const classOptions = useMemo(() => classOptionsQuery.data ?? [], [classOptionsQuery.data]);

  useEffect(() => {
    if (classId == null && classOptions.length) setClassId(classOptions[0].id);
  }, [classOptions, classId]);

  const dashboardQuery = useQuery({
    queryKey: ['pkl-class-dashboard', classId],
    queryFn: () => fetchClassDashboard(classId),
    enabled: classId != null,
    select: adaptDashboard,
    staleTime: 30_000,
  });
  const dashboard = dashboardQuery.data;

  const students = useMemo(() => dashboard?.students ?? [], [dashboard]);
  const riskSummary = useMemo(() => dashboard?.riskSummary ?? {}, [dashboard]);
  const chipCounts = useMemo(
    () => CHIP_ORDER.reduce((acc, code) => { acc[code] = riskSummary[code]?.count ?? 0; return acc; }, {}),
    [riskSummary],
  );

  const filteredStudents = useMemo(() => {
    if (activeFilters.size === 0) return students;
    return students.filter((s) => s.riskCode && activeFilters.has(s.riskCode));
  }, [students, activeFilters]);

  const pickDefault = useCallback((list) => (list.find((s) => !s.placement) ?? list[0])?.id ?? null, []);

  // Pilih siswa default saat data kelas berubah; pertahankan pilihan bila masih ada.
  useEffect(() => {
    if (!students.length) { setSelectedId(null); return; }
    setSelectedId((cur) => (cur && students.some((s) => s.id === cur) ? cur : pickDefault(students)));
  }, [students, pickDefault]);

  const selectedStudent = useMemo(() => students.find((s) => s.id === selectedId) ?? null, [students, selectedId]);

  // Rekomendasi untuk siswa terpilih.
  const recoQuery = useQuery({
    queryKey: ['pkl-recos', selectedId],
    queryFn: () => fetchRecommendations(selectedId),
    enabled: Boolean(selectedId),
    select: adaptRecommendations,
    staleTime: 60_000,
  });
  const reco = recoQuery.data;

  // ── Mutations ────────────────────────────────────────────────────────────
  const placeMutation = useMutation({
    mutationFn: createPlacement,
    onSuccess: (_res, variables) => {
      const name = confirmDialog?.student?.name ?? 'Siswa';
      const indName = confirmDialog?.rec?.name ?? 'industri';
      setConfirmDialog(null);
      setToast({ severity: 'success', msg: `${name} ditempatkan di ${indName}` });
      queryClient.invalidateQueries({ queryKey: ['pkl-class-dashboard', classId] });
      queryClient.invalidateQueries({ queryKey: ['pkl-recos', variables.studentId] });
    },
    onError: (error, variables) => {
      const { code, msg } = parseErr(error);
      if (code === 'SLOT_UNAVAILABLE' || code === 'STALE_RECOMMENDATION') {
        queryClient.invalidateQueries({ queryKey: ['pkl-recos', variables.studentId] });
      } else if (code === 'STUDENT_ALREADY_PLACED') {
        queryClient.invalidateQueries({ queryKey: ['pkl-class-dashboard', classId] });
      }
      setConfirmDialog(null);
      setToast({ severity: 'error', msg });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ placementId, reason }) => cancelPlacement(placementId, reason),
    onSuccess: (_res, variables) => {
      setCancelDialog(null);
      setCancelReason('');
      setToast({ severity: 'info', msg: 'Penempatan dibatalkan. Slot dikembalikan.' });
      queryClient.invalidateQueries({ queryKey: ['pkl-class-dashboard', classId] });
      if (variables.studentId) queryClient.invalidateQueries({ queryKey: ['pkl-recos', variables.studentId] });
    },
    onError: (error) => {
      const { code, msg } = parseErr(error);
      if (code === 'PLACEMENT_NOT_FOUND' || code === 'ALREADY_CANCELLED') {
        queryClient.invalidateQueries({ queryKey: ['pkl-class-dashboard', classId] });
      }
      setToast({ severity: 'error', msg });
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSelectStudent = (id) => {
    setSelectedId(id);
    if (isMobile) setMobileView('detail');
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
    if (!confirmDialog || !reco?.recommendationToken) {
      setToast({ severity: 'error', msg: 'Sesi rekomendasi tidak valid. Memuat ulang…' });
      setConfirmDialog(null);
      if (selectedId) queryClient.invalidateQueries({ queryKey: ['pkl-recos', selectedId] });
      return;
    }
    const { student, rec } = confirmDialog;
    placeMutation.mutate({
      studentId: student.id,
      industryId: rec.id,
      decisionPath: 'terima_rekomendasi',
      recommendationRank: rec.rank,
      recommendationToken: reco.recommendationToken,
    });
  };

  const openCancel = () => { setCancelReason(''); setCancelDialog({ student: selectedStudent }); };

  const commitCancel = () => {
    const placement = cancelDialog?.student?.placement;
    if (!placement?.id || !cancelReason.trim()) return;
    cancelMutation.mutate({ placementId: placement.id, reason: cancelReason.trim(), studentId: cancelDialog.student.id });
  };

  const riskLabel = selectedStudent && RISK[selectedStudent.riskCode] ? RISK[selectedStudent.riskCode].label : (reco?.quadrantLabel ?? '');
  const showDetail = !isMobile || mobileView === 'detail';
  const showList = !isMobile || mobileView === 'list';
  const studentPlaced = Boolean(selectedStudent?.placement);
  const className = dashboard?.classInfo?.name ?? '';

  const placementBusyFor = (recId) => placeMutation.isPending && confirmDialog?.rec?.id === recId;

  // ── Render ────────────────────────────────────────────────────────────────
  const renderDetailPanel = () => {
    if (!selectedStudent) {
      return (
        <Box sx={{ textAlign: 'center', py: 8, color: T.textMuted }}>
          <Typography sx={{ fontSize: '0.875rem' }}>Pilih siswa untuk melihat rekomendasi</Typography>
        </Box>
      );
    }
    if (recoQuery.isPending || (recoQuery.isFetching && !reco)) return <PanelSkeleton />;
    if (recoQuery.isError) {
      return (
        <StateCard
          icon={<IconAlertTriangle size={36} color={T.danger} />}
          title="Gagal memuat rekomendasi"
          message={parseErr(recoQuery.error).msg}
          actionLabel="Coba Lagi"
          onAction={() => recoQuery.refetch()}
        />
      );
    }

    return (
      <Box aria-live="polite">
        <StudentDetailHeader student={selectedStudent} className={className} />

        {studentPlaced && (
          <PlacedBanner placement={selectedStudent.placement} busy={cancelMutation.isPending} onCancel={openCancel} />
        )}

        {reco && !reco.eligible ? (
          <Box sx={{ textAlign: 'center', py: 5, px: 2, border: `1px dashed ${T.border}`, borderRadius: '12px' }}>
            <IconInfoCircle size={28} color={T.textMuted} />
            <Typography sx={{ fontSize: '0.875rem', color: T.textBody, mt: 1 }}>
              {reco.msg || 'Profil siswa belum lengkap — rekomendasi butuh profil dua sisi.'}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textFaint, mb: 1.5 }}>
              Rekomendasi Industri — Top {reco?.recommendations.length ?? 0}
            </Typography>

            {(reco?.recommendations.length ?? 0) === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, border: `1px dashed ${T.border}`, borderRadius: '12px' }}>
                <Typography sx={{ fontSize: '0.875rem', color: T.textMuted }}>
                  Belum ada industri mitra yang cocok dengan profil siswa ini
                </Typography>
              </Box>
            ) : (
              reco.recommendations.map((rec) => (
                <IndustryRecommendationCard
                  key={rec.id}
                  rec={rec}
                  riskLabel={riskLabel}
                  isPlacedHere={selectedStudent.placement?.industryId === rec.id}
                  studentPlaced={studentPlaced}
                  placementBusy={placementBusyFor(rec.id)}
                  onPilih={openConfirm}
                />
              ))
            )}

            {!studentPlaced && (reco?.recommendations.length ?? 0) > 0 && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography
                  component="button"
                  onClick={() => setToast({ severity: 'info', msg: 'Penempatan manual di luar Top-3 akan tersedia berikutnya.' })}
                  sx={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: T.primary600, textDecoration: 'underline' }}
                >
                  Tempatkan ke industri lain…
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };

  return (
    <PageContainer title="Penempatan PKL" description="PKL Placement Engine – Kepala Jurusan">
      <Box
        sx={{
          backgroundColor: T.bgPage,
          mx: { xs: -2, sm: '-24px' },
          mt: { xs: -2, sm: '-24px' },
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
          {/* ═══ Topbar ═══ */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', px: { xs: 2, md: 2.5 }, py: 1.25, mb: 2, borderRadius: '12px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textStrong, whiteSpace: 'nowrap' }}>Penempatan PKL</Typography>
              <Typography sx={{ color: T.textFaint }}>·</Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={classOptions.some((k) => k.id === classId) ? classId : ''}
                  displayEmpty
                  onChange={(e) => setClassId(e.target.value)}
                  disabled={classOptionsQuery.isPending || classOptions.length === 0}
                  sx={{ fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px', '& .MuiSelect-select': { py: 0.75 } }}
                >
                  {classOptions.length === 0 && <MenuItem value="">Memuat kelas…</MenuItem>}
                  {classOptions.map((k) => (
                    <MenuItem key={k.id} value={k.id}>{k.nama_kelas}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ width: 40, height: 40, backgroundColor: T.primary100, color: T.primary600 }}>
                <IconUser size={22} />
              </Avatar>
              <Box sx={{ lineHeight: 1.2 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.textStrong }}>{user?.name || 'Kepala Jurusan'}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: T.textMuted }}>Kepala Jurusan</Typography>
              </Box>
            </Box>
          </Box>

          {/* ═══ Content ═══ */}
          {classOptionsQuery.isError ? (
            <StateCard icon={<IconAlertTriangle size={40} color={T.danger} />} title="Gagal memuat daftar kelas" message={parseErr(classOptionsQuery.error).msg} actionLabel="Coba Lagi" onAction={() => classOptionsQuery.refetch()} />
          ) : !classOptionsQuery.isPending && classOptions.length === 0 ? (
            <StateCard icon={<IconInfoCircle size={40} color={T.textMuted} />} title="Belum ada kelas" message="Jurusan Anda belum memiliki kelas pada tahun ajaran aktif." />
          ) : dashboardQuery.isError ? (
            <StateCard icon={<IconAlertTriangle size={40} color={T.danger} />} title="Gagal memuat data kelas" message={parseErr(dashboardQuery.error).msg} actionLabel="Coba Lagi" onAction={() => dashboardQuery.refetch()} />
          ) : (
            <Box sx={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', p: { xs: 2, md: 3 }, boxShadow: '0 1px 3px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.04)' }}>
              {/* Judul + Progress */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Typography sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, lineHeight: 1.2, fontWeight: 700, color: T.textStrong }}>PKL Placement Engine</Typography>
                {dashboard ? (
                  <ProgressPenempatan placed={dashboard.progress.placed} total={dashboard.progress.total} pending={dashboard.progress.pending} cardBg={cardBg} cardBorder={cardBorder} />
                ) : (
                  <Skeleton variant="rounded" width={210} height={92} sx={{ borderRadius: '12px' }} />
                )}
              </Box>

              {/* Filter chips + disclaimer */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {dashboard ? (
                  <RiskFilterChips counts={chipCounts} active={activeFilters} onToggle={toggleFilter} />
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" width={120} height={32} sx={{ borderRadius: '999px' }} />)}</Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconInfoCircle size={14} color={T.textFaint} />
                  <Typography sx={{ fontSize: '0.75rem', color: T.textFaint }}>Sistem merekomendasikan · Keputusan final ada pada Kepala Jurusan</Typography>
                </Box>
              </Box>

              {/* Master-detail */}
              <Box sx={{ display: 'flex', gap: { xs: 2, md: '20px', xl: '28px' }, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
                {showList && (
                  <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 260px', lg: '0 0 300px', xl: '0 0 340px' }, width: { xs: '100%', md: 260, lg: 300, xl: 340 }, position: { md: 'sticky' }, top: { md: 88 }, maxHeight: { md: 'calc(100vh - 112px)' }, overflowY: { md: 'auto' }, pr: { md: 0.5 } }}>
                    {dashboard ? (
                      <StudentSidebar
                        className={className}
                        students={filteredStudents}
                        riskSummary={riskSummary}
                        selectedId={selectedId}
                        onSelect={handleSelectStudent}
                        onResetFilter={() => setActiveFilters(new Set())}
                      />
                    ) : (
                      <SidebarSkeleton />
                    )}
                  </Box>
                )}

                {showDetail && (
                  <Box sx={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
                    {isMobile && (
                      <Button size="small" startIcon={<IconArrowLeft size={16} />} onClick={() => setMobileView('list')} sx={{ mb: 1.5, textTransform: 'none', color: T.primary600 }}>
                        Pilih siswa lain
                      </Button>
                    )}
                    {dashboard ? renderDetailPanel() : <PanelSkeleton />}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ═══ Modal konfirmasi penempatan ═══ */}
      <Dialog open={Boolean(confirmDialog)} onClose={() => !placeMutation.isPending && setConfirmDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Konfirmasi Penempatan
          <IconButton size="small" onClick={() => !placeMutation.isPending && setConfirmDialog(null)}><IconX size={18} /></IconButton>
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
          <Button onClick={() => setConfirmDialog(null)} disabled={placeMutation.isPending} sx={{ textTransform: 'none', color: T.textMuted }}>Batal</Button>
          <Button onClick={commitPlacement} disabled={placeMutation.isPending} variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', backgroundColor: T.primary600, '&:hover': { backgroundColor: T.primary700 } }}>
            {placeMutation.isPending ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> Menempatkan…</> : 'Tetapkan Penempatan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Modal konfirmasi pembatalan (butuh reason) ═══ */}
      <Dialog open={Boolean(cancelDialog)} onClose={() => !cancelMutation.isPending && setCancelDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Batalkan Penempatan</DialogTitle>
        <DialogContent>
          {cancelDialog && (
            <>
              <Typography sx={{ fontSize: '0.875rem', color: T.textBody, mb: 1.5 }}>
                Batalkan penempatan <b>{cancelDialog.student.name}</b> di <b>{cancelDialog.student.placement?.industryName}</b>? Slot industri akan dikembalikan.
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Alasan pembatalan"
                placeholder="Mis. Industri menutup kuota mendadak"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialog(null)} disabled={cancelMutation.isPending} sx={{ textTransform: 'none', color: T.textMuted }}>Tidak</Button>
          <Button onClick={commitCancel} disabled={cancelMutation.isPending || !cancelReason.trim()} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
            {cancelMutation.isPending ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> Membatalkan…</> : 'Ya, Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Toast ═══ */}
      <Snackbar open={Boolean(toast)} autoHideDuration={3800} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '10px' }}>{toast.msg}</Alert>
        ) : undefined}
      </Snackbar>
    </PageContainer>
  );
};

export default PenempatanPKL;
