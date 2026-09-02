import { useState, useMemo } from 'react';
import { Box, Typography, Tooltip, Dialog, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { IconUser, IconList, IconActivity, IconArrowLeft, IconArrowRight, IconArrowsMaximize, IconX } from '@tabler/icons-react';
import { T, RADIUS, RISK_THEME, LEGEND_ORDER, QUADRANT_CELLS } from './sgaConfig';
import QuadrantScatter from './QuadrantScatter';

// ── PRD §5.7 Legend ─────────────────────────────────────────────────────────
const QuadrantLegend = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
    {LEGEND_ORDER.map((key) => (
      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: RISK_THEME[key].main }} />
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: T.textSecondary, whiteSpace: 'nowrap' }}>
          {RISK_THEME[key].label}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ── PRD §5.7 ViewToggle — list (chip kuadran) ↔ chart (scatter) ─────────────
const ViewToggle = ({ view, onChange }) => {
  const btn = (active) => ({
    width: 36, height: 36, borderRadius: RADIUS.badge, border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: active ? T.primary : 'transparent',
    color: active ? '#fff' : T.textMuted,
    transition: 'background-color 150ms ease, color 150ms ease',
  });
  return (
    <Box sx={{ display: 'inline-flex', gap: 0.5, p: 0.5, borderRadius: RADIUS.tab, backgroundColor: T.pageBg }}>
      <Tooltip title="Tampilan list">
        <Box component="button" type="button" aria-label="Tampilan list" aria-pressed={view === 'list'} onClick={() => onChange('list')} sx={btn(view === 'list')}>
          <IconList size={18} />
        </Box>
      </Tooltip>
      <Tooltip title="Tampilan sebaran (scatter)">
        <Box component="button" type="button" aria-label="Tampilan sebaran" aria-pressed={view === 'chart'} onClick={() => onChange('chart')} sx={btn(view === 'chart')}>
          <IconActivity size={18} />
        </Box>
      </Tooltip>
    </Box>
  );
};

// ── PRD §5.7 StudentChip ────────────────────────────────────────────────────
const StudentChip = ({ student, variant, onClick }) => {
  const theme = RISK_THEME[variant];
  return (
    <Tooltip title={`Behavior: ${student.behaviorScore ?? '—'} · Kompetensi: ${student.competencyScore ?? '—'}`} enterDelay={300}>
      <Box
        component="button"
        type="button"
        aria-label={`${student.name}, ${theme.label}`}
        onClick={() => onClick?.(student.id)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          pl: 0.75, pr: 1.75, py: 0.75, width: 'max-content', maxWidth: '100%',
          borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
          backgroundColor: theme.chip, color: '#fff',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(0,0,0,0.12)' },
          '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px' },
        }}
      >
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconUser size={14} color={theme.main} style={{ opacity: 0.7 }} />
        </Box>
        <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.3, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
          {student.name}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ── PRD §5.7 Pagination (client-side) ───────────────────────────────────────
const QuadrantPagination = ({ page, pageCount, variant, onPrev, onNext }) => {
  const color = RISK_THEME[variant].main;
  const arrow = (disabled) => ({
    width: 32, height: 32, borderRadius: RADIUS.pill, border: 'none', backgroundColor: 'transparent',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color,
    opacity: disabled ? 0.35 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  });
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2.5 }}>
      <Box component="button" type="button" aria-label="Halaman sebelumnya" onClick={onPrev} sx={arrow(page === 0)}>
        <IconArrowLeft size={18} />
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: T.textSecondary }}>
        {page + 1} / {pageCount}
      </Typography>
      <Box component="button" type="button" aria-label="Halaman berikutnya" onClick={onNext} sx={arrow(page >= pageCount - 1)}>
        <IconArrowRight size={18} />
      </Box>
    </Box>
  );
};

// ── PRD §5.7 QuadrantCell ───────────────────────────────────────────────────
const QuadrantCell = ({ cell, students, total, onStudentClick, borderSx }) => {
  const theme = RISK_THEME[cell.key];
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(students.length / cell.pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = useMemo(
    () => students.slice(safePage * cell.pageSize, safePage * cell.pageSize + cell.pageSize),
    [students, safePage, cell.pageSize],
  );

  return (
    <Box sx={{ backgroundColor: theme.bg, p: 3, minHeight: 320, display: 'flex', flexDirection: 'column', ...borderSx }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 2.5 }}>
        <Typography sx={{ fontSize: '1.0625rem', lineHeight: 1.4, fontWeight: 700, color: T.textPrimary }}>
          {theme.label}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: T.textSecondary, whiteSpace: 'nowrap' }}>
          {total ?? students.length} siswa
        </Typography>
      </Box>

      {students.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: T.textMuted, opacity: 0.8 }}>
            Tidak ada siswa di kategori ini
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: cell.columns === 2
              ? { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
              : 'minmax(0, max-content)',
            gap: 1.5, alignContent: 'start',
          }}
        >
          {pageItems.map((s) => (
            <StudentChip key={s.id} student={s} variant={cell.key} onClick={onStudentClick} />
          ))}
        </Box>
      )}

      {students.length > cell.pageSize && (
        <QuadrantPagination
          page={safePage}
          pageCount={pageCount}
          variant={cell.key}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        />
      )}
    </Box>
  );
};

// ── Panel "Profile Data Siswa" ──────────────────────────────────────────────
const QuadrantMatrix = ({ quadrants, quadrantTotals, threshold, thresholdX, thresholdY, onStudentClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [view, setView] = useState('list');
  const [expanded, setExpanded] = useState(false);

  // Pemisah dashed (PRD §5.7). Desktop: grid 2×2 dengan border-right/bottom.
  // Mobile: 1 kolom, hanya border-bottom antar sel.
  const borderFor = (index) => {
    if (isMobile) {
      return index < QUADRANT_CELLS.length - 1 ? { borderBottom: `1px dashed ${T.borderDashed}` } : {};
    }
    const sx = {};
    if (index === 0 || index === 2) sx.borderRight = `1px dashed ${T.borderDashed}`;
    if (index === 0 || index === 1) sx.borderBottom = `1px dashed ${T.borderDashed}`;
    return sx;
  };

  // Urutan sel: desktop mengikuti QUADRANT_CELLS, mobile pakai mobileOrder (kritis di atas).
  const cells = isMobile
    ? [...QUADRANT_CELLS].sort((a, b) => a.mobileOrder - b.mobileOrder)
    : QUADRANT_CELLS;

  return (
    <Box>
      {/* Baris 1: judul + legend */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography component="h2" sx={{ fontSize: '1.375rem', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.01em', color: T.textPrimary }}>
          Profile Data Siswa
        </Typography>
        <QuadrantLegend />
      </Box>

      {/* Baris 2: caption + filter + toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mt: 1, mb: 3 }}>
        <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.55, color: T.textSecondary }}>
          Behavior Score × Skor Kompetensi · Threshold: {threshold}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: T.textSecondary }}>Filter</Typography>
          <ViewToggle view={view} onChange={setView} />
          {view === 'chart' && (
            <Tooltip title="Lihat lebih lega (layar penuh)">
              <Box
                component="button"
                type="button"
                aria-label="Perbesar tampilan sebaran ke layar penuh"
                onClick={() => setExpanded(true)}
                sx={{
                  width: 36, height: 36, borderRadius: RADIUS.badge,
                  border: `1px solid ${T.border}`, backgroundColor: T.surface,
                  color: T.textSecondary, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
                  '&:hover': { backgroundColor: T.pageBg, color: T.primary, borderColor: T.primary },
                  '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px' },
                }}
              >
                <IconArrowsMaximize size={17} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {view === 'chart' ? (
        <QuadrantScatter quadrants={quadrants} thresholdX={thresholdX} thresholdY={thresholdY} onStudentClick={onStudentClick} />
      ) : (
        /* Grid kuadran 2×2 tanpa gap, sudut luar membulat */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gridTemplateRows: { sm: 'auto auto' },
            borderRadius: RADIUS.panelInner, overflow: 'hidden',
            border: `1px solid ${T.border}`,
          }}
        >
          {cells.map((cell, index) => (
            <QuadrantCell
              key={cell.key}
              cell={cell}
              students={quadrants[cell.key] || []}
              total={quadrantTotals?.[cell.key]}
              onStudentClick={onStudentClick}
              borderSx={borderFor(index)}
            />
          ))}
        </Box>
      )}

      {/* Mode fullscreen: scatter dibuka satu layar agar angka lebih jelas */}
      <Dialog fullScreen open={expanded} onClose={() => setExpanded(false)}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: T.surface, p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" sx={{ fontSize: '1.375rem', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.01em', color: T.textPrimary }}>
                Profile Data Siswa
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.55, color: T.textSecondary, mt: 0.25 }}>
                Behavior Score × Skor Kompetensi · Threshold: {threshold}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <QuadrantLegend />
              </Box>
              <IconButton aria-label="Tutup layar penuh" onClick={() => setExpanded(false)} sx={{ color: T.textSecondary }}>
                <IconX size={20} />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QuadrantScatter
              quadrants={quadrants}
              thresholdX={thresholdX}
              thresholdY={thresholdY}
              onStudentClick={onStudentClick}
              maxWidth="min(96vw, calc((100vh - 210px) * 1.1))"
              zoomable
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default QuadrantMatrix;
