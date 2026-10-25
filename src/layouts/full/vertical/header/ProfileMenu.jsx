import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Menu, Avatar, Typography, Divider, Button, IconButton } from '@mui/material';
import * as dropdownData from './data';
import { IconMail, IconSwitchHorizontal } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import ProfileImg from 'src/assets/images/profile/user-1.jpg'
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import useLogout from 'src/hooks/useLogout';
import { getUserPortals } from 'src/portals/registry';


const ProfileMenu = () => {
  const user = useSelector((state) => state.user)
  const [anchorEl2, setAnchorEl2] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = useLogout();

  // Portal yang boleh diakses akun ini (lihat src/portals/registry.js)
  const portals = getUserPortals(user);
  const activePortal = portals.find((portal) => pathname.startsWith(portal.path));
  const otherPortals = portals.filter((portal) => portal.key !== activePortal?.key);
  const roleLabel = portals.map((portal) => portal.label).join(', ') || user?.role || 'User';

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };
  const handleSwitchPortal = (path) => {
    handleClose2();
    navigate(path);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Buka menu profil"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={ProfileImg}
          alt={user?.name || 'User'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Profile Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            mt: 2
          },
        }}
      >
        <Scrollbar sx={{ height: '100%', maxHeight: '85vh' }}>
          <Box p={3}>
            <Typography variant="h5">User Profile</Typography>
            <Stack direction="row" py={3} spacing={2} alignItems="center">
              <Avatar src={ProfileImg} alt={user?.name || 'User'} sx={{ width: 95, height: 95 }} />
              <Box>
                <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
                {user?.name || 'Guest'}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                {roleLabel}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <IconMail width={15} height={15} />
                  {user?.email || 'User'}
                </Typography>
              </Box>
            </Stack>
            <Divider />
            {dropdownData.profileAdmin.map((profile) => (
              <Box key={profile.title}>
                <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
                  <Link to={profile.href}>
                    <Stack direction="row" spacing={2}>
                      <Box
                        width="45px"
                        height="45px"
                        bgcolor="primary.light"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Avatar
                          src={profile.icon}
                          alt={profile.icon}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 0,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="textPrimary"
                          className="text-hover"
                          noWrap
                          sx={{
                            width: '240px',
                          }}
                        >
                          {profile.title}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          variant="subtitle2"
                          sx={{
                            width: '240px',
                          }}
                          noWrap
                        >
                          {profile.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                  </Link>
                </Box>
              </Box>
            ))}
            {portals.length > 1 && otherPortals.length > 0 && (
              <>
                <Divider />
                <Box py={2}>
                  <Typography variant="subtitle2" color="textSecondary" mb={1}>
                    Beralih portal
                  </Typography>
                  <Stack spacing={1}>
                    {otherPortals.map((portal) => (
                      <Button
                        key={portal.key}
                        onClick={() => handleSwitchPortal(portal.path)}
                        variant="text"
                        color="primary"
                        startIcon={<IconSwitchHorizontal size={18} />}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {portal.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
            <Box mt={2}>
              <Button
                onClick={() => {
                  handleClose2();
                  handleLogout();
                }}
                variant="outlined"
                color="primary"
                fullWidth
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Scrollbar>
      </Menu>
    </Box>
  );
};

export default ProfileMenu;