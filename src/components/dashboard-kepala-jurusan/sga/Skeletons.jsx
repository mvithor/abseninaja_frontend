import { Box, Skeleton } from '@mui/material';
import { T, RADIUS, SHADOW_CARD } from './sgaConfig';

// PRD §7 — skeleton menahan layout (no CLS), bukan spinner.
export const KpiRowSkeleton = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2.5 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={118} sx={{ borderRadius: RADIUS.card, bgcolor: T.track }} />
    ))}
  </Box>
);

export const QuadrantSkeleton = () => (
  <Box sx={{ backgroundColor: T.surface, borderRadius: RADIUS.card, border: `1px solid ${T.border}`, boxShadow: SHADOW_CARD, p: { xs: 2.5, md: 3.5 } }}>
    <Skeleton variant="text" width={220} height={36} sx={{ bgcolor: T.track }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0, mt: 2, borderRadius: RADIUS.panelInner, overflow: 'hidden', border: `1px solid ${T.border}` }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i} sx={{ p: 3, minHeight: 320 }}>
          <Skeleton variant="text" width={140} height={28} sx={{ bgcolor: T.track, mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {Array.from({ length: 6 }).map((__, j) => (
              <Skeleton key={j} variant="rounded" width={90 + ((j * 27) % 60)} height={36} sx={{ borderRadius: '999px', bgcolor: T.track }} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export const EarlyWarningSkeleton = () => (
  <Box sx={{ backgroundColor: T.surface, borderRadius: RADIUS.card, border: `1px solid ${T.border}`, boxShadow: SHADOW_CARD, p: { xs: 2.5, md: 3.5 } }}>
    <Skeleton variant="text" width={160} height={32} sx={{ bgcolor: T.track }} />
    <Box sx={{ height: '1px', backgroundColor: T.border, my: 2.5 }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={116} sx={{ borderRadius: RADIUS.panelInner, bgcolor: T.track }} />
      ))}
    </Box>
  </Box>
);
