import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { IconAlertTriangle, IconUser } from '@tabler/icons-react';
import { T, RADIUS, SHADOW_HEADER } from './sgaConfig';

// PRD §5.2 — pill peringatan. Disembunyikan bila count === 0.
export const EwsBadge = ({ count, onClick }) => {
  if (!count) return null;
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      onClick={onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75,
        px: '14px', py: '8px', borderRadius: RADIUS.pill,
        backgroundColor: T.warningBg, color: T.warningText,
        border: 'none', cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
      }}
    >
      <IconAlertTriangle size={16} stroke={1.5} />
      <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.2, color: 'inherit' }}>
        {count} EWS Aktif
      </Typography>
    </Box>
  );
};

// PRD §5.3 — avatar + nama + role. Tanpa dropdown di v1.0.
export const UserChip = ({ user, compact }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
    <Box
      sx={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        backgroundColor: T.primary, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {user.avatarUrl ? (
        <Box component="img" src={user.avatarUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <IconUser size={22} />
      )}
    </Box>
    {!compact && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: T.textPrimary, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          {user.name}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 400, color: T.textSecondary, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          {user.role}
        </Typography>
      </Box>
    )}
  </Box>
);

// PRD §5.1
const AppHeader = ({ schoolName, academicYear, semester, ewsCount, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="header"
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 2, flexWrap: 'wrap',
        px: { xs: 2, md: 4 }, py: 3,
        backgroundColor: T.surface, borderRadius: RADIUS.card,
        border: `1px solid ${T.border}`, boxShadow: SHADOW_HEADER,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.25, fontWeight: 700, letterSpacing: '-0.01em', color: T.textPrimary }}
        >
          Skill Gap Advisor
        </Typography>
        <Typography sx={{ fontSize: '0.9375rem', lineHeight: 1.45, color: T.textSecondary, mt: 0.5 }}>
          {schoolName} · TA {academicYear} · Semester {semester}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <EwsBadge count={ewsCount} />
        <UserChip user={user} compact={isMobile} />
      </Box>
    </Box>
  );
};

export default AppHeader;
