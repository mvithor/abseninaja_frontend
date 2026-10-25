import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import img1 from 'src/assets/images/profile/user-1.jpg';
import { IconPower } from '@tabler/icons-react';
import useLogout from 'src/hooks/useLogout';
import { getUserPortals } from 'src/portals/registry';

export const Profile = () => {
  const customizer = useSelector((state) => state.customizer);
  const user = useSelector((state) => state.user);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const handleLogout = useLogout();
  const roleLabel = getUserPortals(user).map((portal) => portal.label).join(', ') || user?.role || 'User';

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Box
        display={'flex'}
        alignItems="center"
        gap={2}
        sx={{
          p: 2,
          bgcolor: `${'secondary.light'}`,
          borderRadius: '12px', // Tetap mempertahankan bentuk
          boxShadow: 1, // Tambahkan shadow untuk estetika
          width: '100%',
          maxWidth: '400px', // Batasi lebar maksimum box
        }}
      >
        {!hideMenu ? (
          <>
            <Avatar alt={user?.name || 'User'} src={img1} />

            <Box>
              <Typography variant="h6" color="textPrimary">{user?.name || 'Guest'}</Typography>
              <Typography variant="caption" color="textSecondary">{roleLabel}</Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Logout" placement="top">
                <IconButton color="primary" onClick={handleLogout} aria-label="logout" size="small">
                  <IconPower size="20" />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        ) : (
          ''
        )}
      </Box>
    </Container>
  );
};