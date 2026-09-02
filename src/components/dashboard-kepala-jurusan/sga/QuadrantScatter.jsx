import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { IconUser, IconPlus, IconMinus, IconRefresh } from '@tabler/icons-react';
import { T, RISK_THEME, QUADRANT_CELLS } from './sgaConfig';

const FULL_VIEW = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
const MIN_SPAN = 12; // batas zoom-in maksimal (rentang data terkecil)
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Tick "cantik" untuk rentang [min,max] → ~5 langkah, dipakai untuk label sumbu
// yang ikut menyesuaikan saat di-zoom.
const niceTicks = (min, max, count = 5) => {
  const span = max - min || 1;
  const rawStep = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
};

// Region kuadran → label pojok (dipakai saat garis threshold terlihat penuh).
const REGION_LABELS = [
  { key: 'risiko_behavior', pos: { top: 14, left: 16 } },
  { key: 'siap_penuh', pos: { top: 14, right: 16 } },
  { key: 'risiko_ganda', pos: { bottom: 14, left: 16 } },
  { key: 'risiko_kompetensi', pos: { bottom: 14, right: 16 } },
];

// Marker siswa: avatar bulat warna kategori (ikon user putih + ring putih).
const ScatterMarker = ({ student, variant, size, left, top, onClick, onHoverStart, onHoverEnd }) => {
  const color = RISK_THEME[variant].main;
  return (
    <Tooltip title={`${student.name} · Behavior: ${student.behaviorScore} · Kompetensi: ${student.competencyScore}`} enterDelay={200}>
      <Box
        component="button"
        type="button"
        aria-label={`${student.name}, ${RISK_THEME[variant].label}`}
        onClick={() => onClick?.(student.id)}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        sx={{
          position: 'absolute', left: `${left}%`, top: `${top}%`,
          transform: 'translate(-50%, -50%)',
          width: size, height: size, p: 0, borderRadius: '50%',
          backgroundColor: color, border: '2px solid #fff',
          boxShadow: '0 1px 3px rgba(16,24,40,0.25)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 5,
          transition: 'transform 150ms ease, box-shadow 150ms ease',
          '&:hover': { transform: 'translate(-50%, -50%) scale(1.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.28)', zIndex: 7 },
          '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px', zIndex: 7 },
        }}
      >
        <IconUser size={Math.round(size * 0.54)} color="#fff" />
      </Box>
    </Tooltip>
  );
};

// Pill nilai yang muncul di sumbu saat marker di-hover.
const AxisValue = ({ children, color, sx }) => (
  <Box sx={{ position: 'absolute', zIndex: 6, pointerEvents: 'none', backgroundColor: color, color: '#fff', borderRadius: '6px', px: 0.75, py: 0.125, fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.5, boxShadow: '0 1px 3px rgba(16,24,40,0.25)', ...sx }}>
    {children}
  </Box>
);

// Tombol kontrol zoom.
const ZoomButton = ({ label, onClick, children }) => (
  <Tooltip title={label} placement="left">
    <Box
      component="button" type="button" aria-label={label} onClick={onClick}
      sx={{
        width: 32, height: 32, borderRadius: '8px', border: `1px solid ${T.border}`,
        backgroundColor: T.surface, color: T.textSecondary, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 3px rgba(16,24,40,0.10)',
        '&:hover': { backgroundColor: T.pageBg, color: T.primary, borderColor: T.primary },
        '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px' },
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

// PRD §5.7 (mode chart) — scatter Behavior × Kompetensi.
// Dok backend §4.1: pakai DUA ambang — `thresholdX` (behavior, garis vertikal) &
// `thresholdY` (competency, garis horizontal). `maxWidth` bisa dinaikkan saat
// fullscreen; `zoomable` mengaktifkan pan + zoom dengan sumbu ikut menyesuaikan.
const QuadrantScatter = ({ quadrants, thresholdX = 70, thresholdY = 70, onStudentClick, maxWidth = 720, zoomable = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const markerSize = isMobile ? 26 : 30;

  const [hovered, setHovered] = useState(null);
  const [view, setView] = useState(FULL_VIEW);
  const [dragging, setDragging] = useState(false);
  const plotRef = useRef(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const points = useMemo(() => {
    const list = [];
    QUADRANT_CELLS.forEach((cell) => {
      (quadrants[cell.key] || []).forEach((s) => {
        // Skor bisa null (data belum cukup) → tidak bisa diplot di scatter.
        if (s.behaviorScore == null || s.competencyScore == null) return;
        list.push({ ...s, variant: cell.key });
      });
    });
    return list;
  }, [quadrants]);

  // Pemetaan data → posisi % dalam plot (mengikuti viewport aktif).
  const spanX = view.xMax - view.xMin;
  const spanY = view.yMax - view.yMin;
  const toLeft = useCallback((v) => ((v - view.xMin) / spanX) * 100, [view.xMin, spanX]);
  const toTop = useCallback((v) => (1 - (v - view.yMin) / spanY) * 100, [view.yMin, spanY]);

  const xTicks = useMemo(() => niceTicks(view.xMin, view.xMax), [view.xMin, view.xMax]);
  const yTicks = useMemo(() => niceTicks(view.yMin, view.yMax), [view.yMin, view.yMax]);

  const applyZoom = useCallback((factor, fx, fy) => {
    setView((vp) => {
      const sX = vp.xMax - vp.xMin;
      const sY = vp.yMax - vp.yMin;
      const nX = clamp(sX * factor, MIN_SPAN, 100);
      const nY = clamp(sY * factor, MIN_SPAN, 100);
      const rx = (fx - vp.xMin) / sX;
      const ry = (fy - vp.yMin) / sY;
      const xMin = clamp(fx - rx * nX, 0, 100 - nX);
      const yMin = clamp(fy - ry * nY, 0, 100 - nY);
      return { xMin, xMax: xMin + nX, yMin, yMax: yMin + nY };
    });
  }, []);

  const zoomCenter = (factor) => applyZoom(factor, (view.xMin + view.xMax) / 2, (view.yMin + view.yMax) / 2);
  const resetView = () => setView(FULL_VIEW);

  // Wheel zoom (native, non-passive) berpusat di kursor.
  useEffect(() => {
    const el = plotRef.current;
    if (!el || !zoomable) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const vp = viewRef.current;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const fx = vp.xMin + px * (vp.xMax - vp.xMin);
      const fy = vp.yMin + (1 - py) * (vp.yMax - vp.yMin);
      applyZoom(e.deltaY > 0 ? 1.12 : 0.88, fx, fy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomable, applyZoom]);

  // Pan lewat drag (pointer → mouse & touch).
  const onPointerDown = (e) => {
    if (!zoomable || e.target.closest('button')) return;
    const el = plotRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startVp = viewRef.current;
    setDragging(true);
    const move = (ev) => {
      const sX = startVp.xMax - startVp.xMin;
      const sY = startVp.yMax - startVp.yMin;
      const dxData = ((ev.clientX - startX) / rect.width) * sX;
      const dyData = ((ev.clientY - startY) / rect.height) * sY;
      const xMin = clamp(startVp.xMin - dxData, 0, 100 - sX);
      const yMin = clamp(startVp.yMin + dyData, 0, 100 - sY);
      setView({ xMin, xMax: xMin + sX, yMin, yMax: yMin + sY });
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const hoverColor = hovered ? RISK_THEME[hovered.variant].main : null;

  // Posisi garis pemisah kuadran pada viewport aktif (dua ambang).
  const sx = clamp(toLeft(thresholdX), 0, 100);
  const sy = clamp(toTop(thresholdY), 0, 100);
  const regionRects = {
    risiko_behavior: { left: 0, top: 0, width: `${sx}%`, height: `${sy}%` },
    siap_penuh: { left: `${sx}%`, top: 0, right: 0, height: `${sy}%` },
    risiko_ganda: { left: 0, top: `${sy}%`, width: `${sx}%`, bottom: 0 },
    risiko_kompetensi: { left: `${sx}%`, top: `${sy}%`, right: 0, bottom: 0 },
  };
  const thresholdXVisible = thresholdX > view.xMin && thresholdX < view.xMax;
  const thresholdYVisible = thresholdY > view.yMin && thresholdY < view.yMax;
  const showQuadrantLabels = thresholdXVisible && thresholdYVisible;

  return (
    <Box sx={{ maxWidth, mx: 'auto', width: '100%' }}>
      <Box sx={{ display: 'flex' }}>
        {/* Judul sumbu Y (vertikal) */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>
          <Typography sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.8125rem', fontWeight: 500, color: T.textSecondary, whiteSpace: 'nowrap' }}>
            Skor Kompetensi
          </Typography>
        </Box>

        {/* Kolom kanan: area plot + judul sumbu X */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            ref={plotRef}
            onPointerDown={onPointerDown}
            sx={{
              position: 'relative',
              ml: '30px', mb: '22px',
              aspectRatio: '11 / 10',
              borderLeft: `1px dashed ${T.borderDashed}`,
              borderBottom: `1px dashed ${T.borderDashed}`,
              touchAction: zoomable ? 'none' : 'auto',
              cursor: zoomable ? (dragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            {/* Layer region berwarna (sudut atas membulat) */}
            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
              {REGION_LABELS.map((r) => (
                <Box key={r.key} sx={{ position: 'absolute', backgroundColor: RISK_THEME[r.key].bg, ...regionRects[r.key] }} />
              ))}
            </Box>

            {/* Gridline samar di tiap tick (mengikuti zoom) */}
            {xTicks.map((v) => {
              const l = toLeft(v);
              if (l <= 0.5 || l >= 99.5) return null;
              return <Box key={`gx-${v}`} sx={{ position: 'absolute', top: 0, bottom: 0, left: `${l}%`, borderLeft: `1px dashed rgba(148,163,184,0.30)`, pointerEvents: 'none' }} />;
            })}
            {yTicks.map((v) => {
              const t = toTop(v);
              if (t <= 0.5 || t >= 99.5) return null;
              return <Box key={`gy-${v}`} sx={{ position: 'absolute', left: 0, right: 0, top: `${t}%`, borderTop: `1px dashed rgba(148,163,184,0.30)`, pointerEvents: 'none' }} />;
            })}

            {/* Garis threshold dashed (lebih tegas) */}
            {thresholdXVisible && <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: `${sx}%`, borderLeft: `1px dashed ${T.textMuted}`, pointerEvents: 'none', zIndex: 2 }} />}
            {thresholdYVisible && <Box sx={{ position: 'absolute', left: 0, right: 0, top: `${sy}%`, borderTop: `1px dashed ${T.textMuted}`, pointerEvents: 'none', zIndex: 2 }} />}

            {/* Crosshair saat marker di-hover */}
            {hovered && (
              <>
                <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: `${toLeft(hovered.behaviorScore)}%`, borderLeft: `1.5px dashed ${hoverColor}`, pointerEvents: 'none', zIndex: 4 }} />
                <Box sx={{ position: 'absolute', left: 0, right: 0, top: `${toTop(hovered.competencyScore)}%`, borderTop: `1.5px dashed ${hoverColor}`, pointerEvents: 'none', zIndex: 4 }} />
                <AxisValue color={hoverColor} sx={{ left: `${toLeft(hovered.behaviorScore)}%`, bottom: 0, transform: 'translate(-50%, calc(100% + 4px))' }}>
                  {hovered.behaviorScore}
                </AxisValue>
                <AxisValue color={hoverColor} sx={{ top: `${toTop(hovered.competencyScore)}%`, left: 0, transform: 'translate(calc(-100% - 5px), -50%)' }}>
                  {hovered.competencyScore}
                </AxisValue>
              </>
            )}

            {/* Label kuadran (hanya saat split threshold terlihat penuh) */}
            {showQuadrantLabels && REGION_LABELS.map((r) => (
              <Typography key={`lbl-${r.key}`} sx={{ position: 'absolute', ...r.pos, fontSize: '1rem', fontWeight: 700, color: T.textPrimary, pointerEvents: 'none', zIndex: 3 }}>
                {RISK_THEME[r.key].label}
              </Typography>
            ))}

            {/* Tick label sumbu Y (dinamis) */}
            {yTicks.map((v) => {
              const t = toTop(v);
              if (t < -1 || t > 101) return null;
              return (
                <Typography key={`y-${v}`} sx={{ position: 'absolute', left: 0, top: `${t}%`, transform: 'translate(calc(-100% - 5px), -50%)', fontSize: '0.75rem', color: T.textSecondary, pointerEvents: 'none' }}>
                  {v}
                </Typography>
              );
            })}

            {/* Tick label sumbu X (dinamis) */}
            {xTicks.map((v) => {
              const l = toLeft(v);
              if (l < -1 || l > 101) return null;
              return (
                <Typography key={`x-${v}`} sx={{ position: 'absolute', left: `${l}%`, bottom: 0, transform: 'translate(-50%, calc(100% + 4px))', fontSize: '0.75rem', color: T.textSecondary, pointerEvents: 'none' }}>
                  {v}
                </Typography>
              );
            })}

            {/* Marker siswa (di-clip saat mode zoom) */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: zoomable ? 'hidden' : 'visible', pointerEvents: 'none' }}>
              {points.length === 0 ? (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: T.textMuted, opacity: 0.8 }}>
                    Tidak ada data siswa untuk ditampilkan
                  </Typography>
                </Box>
              ) : (
                points.map((s) => {
                  const left = toLeft(s.behaviorScore);
                  const top = toTop(s.competencyScore);
                  if (left < -3 || left > 103 || top < -3 || top > 103) return null;
                  return (
                    <Box key={s.id} sx={{ pointerEvents: 'auto' }}>
                      <ScatterMarker
                        student={s}
                        variant={s.variant}
                        size={markerSize}
                        left={left}
                        top={top}
                        onClick={onStudentClick}
                        onHoverStart={() => setHovered(s)}
                        onHoverEnd={() => setHovered((cur) => (cur?.id === s.id ? null : cur))}
                      />
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Kontrol zoom */}
            {zoomable && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <ZoomButton label="Perbesar" onClick={() => zoomCenter(0.7)}><IconPlus size={16} /></ZoomButton>
                <ZoomButton label="Perkecil" onClick={() => zoomCenter(1 / 0.7)}><IconMinus size={16} /></ZoomButton>
                <ZoomButton label="Reset zoom" onClick={resetView}><IconRefresh size={16} /></ZoomButton>
              </Box>
            )}
          </Box>

          {/* Judul sumbu X + petunjuk interaksi */}
          <Typography sx={{ ml: '30px', mt: 0.5, textAlign: 'center', fontSize: '0.8125rem', fontWeight: 500, color: T.textSecondary }}>
            Skor Behavior
          </Typography>
          {zoomable && (
            <Typography sx={{ ml: '30px', mt: 0.25, textAlign: 'center', fontSize: '0.6875rem', color: T.textMuted }}>
              Scroll / tombol +− untuk zoom · seret untuk menggeser
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default QuadrantScatter;
