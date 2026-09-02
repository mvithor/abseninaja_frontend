import { Box, Typography } from '@mui/material';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { T, RADIUS, RISK_THEME } from './sgaConfig';

// PRD §5.8 (revamp full-width) — satu item peringatan sebagai kartu.
// Dulu baris vertikal di sidebar 380px; kini kartu dalam grid agar rapi saat
// panel melebar penuh di bawah Profile Data Siswa.
const EarlyWarningItem = ({ entry, onStudentClick }) => {
  const theme = RISK_THEME[entry.riskType];
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onStudentClick?.(entry.studentId)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStudentClick?.(entry.studentId); } }}
      sx={{
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${T.border}`, borderLeft: `3px solid ${theme.main}`,
        borderRadius: RADIUS.panelInner, p: 2, cursor: 'pointer', height: '100%',
        backgroundColor: T.surface,
        transition: 'box-shadow 150ms ease, border-color 150ms ease, transform 150ms ease',
        '&:hover': { boxShadow: '0 4px 12px rgba(16,24,40,0.06)', transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: `2px solid ${T.primary}`, outlineOffset: '2px' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: RADIUS.pill, backgroundColor: theme.main, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4, color: T.textPrimary, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.name}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: theme.main, whiteSpace: 'nowrap' }}>
          {theme.label}
        </Typography>
      </Box>
      <Typography sx={{ pl: 2, mt: 0.25, fontSize: '0.8125rem', lineHeight: 1.4, color: T.textSecondary }}>
        {entry.className}
      </Typography>
      <Box sx={{ mt: 1.25, backgroundColor: theme.bg, borderRadius: '10px', px: 1.75, py: 1.25 }}>
        <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.55, color: T.textPrimary }}>
          {entry.reason}
        </Typography>
      </Box>
    </Box>
  );
};

// PRD §5.8 — panel Early Warning (kini full-width di bawah Profile Data Siswa).
const EarlyWarningPanel = ({ entries, onStudentClick }) => {
  const count = entries.length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography component="h2" sx={{ fontSize: '1.375rem', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.01em', color: T.textPrimary }}>
          Early Warning
        </Typography>
        <IconAlertTriangle size={18} color={RISK_THEME.risiko_ganda.main} />
        {count > 0 && (
          <Box sx={{ minWidth: 28, textAlign: 'center', backgroundColor: T.dangerStrong, color: '#fff', borderRadius: RADIUS.badge, px: 1.25, py: 0.5, fontSize: '0.8125rem', fontWeight: 700 }}>
            {count}
          </Box>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.8125rem', lineHeight: 1.55, color: T.textSecondary, display: { xs: 'none', sm: 'block' } }}>
          Butuh perhatian segera
        </Typography>
      </Box>

      <Box sx={{ height: '1px', backgroundColor: T.border, my: 2.5 }} />

      {count === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <IconCircleCheck size={40} color={RISK_THEME.siap_penuh.main} />
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: T.textPrimary, mt: 1 }}>
            Tidak ada peringatan aktif
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: T.textSecondary, mt: 0.5 }}>
            Semua siswa dalam kondisi terpantau
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {entries.map((entry) => (
            <EarlyWarningItem key={entry.studentId} entry={entry} onStudentClick={onStudentClick} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EarlyWarningPanel;
