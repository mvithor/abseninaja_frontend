import { Box, Typography } from '@mui/material';
import { T, RADIUS, SHADOW_CARD, KPI_VARIANT_COLOR, KPI_CARDS } from './sgaConfig';

// PRD §5.5 — lebar fill progress bar.
const fillPercent = ({ value, total, isTotal }) => {
  if (isTotal) return 100;
  if (!value) return 0;
  const raw = total > 0 ? (value / total) * 100 : 0;
  return Math.max(8, raw); // minimum 8% agar bar kecil tetap terlihat
};

export const KpiCard = ({ label, value, total, variant, isTotal }) => {
  const color = KPI_VARIANT_COLOR[variant];
  const pct = fillPercent({ value, total, isTotal });

  return (
    <Box
      component="article"
      aria-label={`${label}: ${value} siswa`}
      sx={{
        p: 3, borderRadius: RADIUS.card,
        backgroundColor: T.surface, border: `1px solid ${T.border}`, boxShadow: SHADOW_CARD,
        display: 'flex', flexDirection: 'column', gap: 1.5,
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.33, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textSecondary }}>
        {label}
      </Typography>
      <Typography
        sx={{
          // ≥10000 dikecilkan otomatis (PRD §7 data overflow)
          fontSize: value >= 10000 ? '1.875rem' : 'clamp(1.75rem, 2.4vw, 2.125rem)',
          lineHeight: 1.18, fontWeight: 700, letterSpacing: '-0.02em', color: T.textPrimary,
        }}
      >
        {value}
      </Typography>
      <Box sx={{ height: 6, borderRadius: RADIUS.pill, backgroundColor: T.track, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: RADIUS.pill, backgroundColor: color, transition: 'width 400ms cubic-bezier(.4,0,.2,1)' }} />
      </Box>
    </Box>
  );
};

// PRD §5.5 + §8 responsive: 5 kol desktop → 3 kol tablet → 2 kol mobile.
const KpiRow = ({ kpi }) => {
  const total = kpi.totalSiswa;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
        gap: 2.5,
      }}
    >
      {KPI_CARDS.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={kpi[c.key] ?? 0}
          total={total}
          variant={c.variant}
          isTotal={c.isTotal}
        />
      ))}
    </Box>
  );
};

export default KpiRow;
