import { IconButton, Box, AppBar, useMediaQuery, Toolbar, styled, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { IconMenu2 } from '@tabler/icons-react';
import Notifications from 'src/layouts/full/vertical/header/Notifications';
import ProfileMenu from '../../vertical/header/ProfileMenu';
import SearchAdminSekolah from 'src/layouts/full/vertical/header/SearchAdminSekolah';
import Navigation from 'src/layouts/full/vertical/header/Navigation';
import Logo from 'src/layouts/full/shared/logo/Logo';

// Didefinisikan DI LUAR komponen: styled() di dalam komponen membuat tipe komponen
// baru pada setiap render, sehingga seluruh isi header (termasuk menu profil yang
// sedang terbuka) di-mount ulang setiap kali Header dirender.
const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
}));
const ToolbarStyled = styled(Toolbar)(({theme}) => ({ margin: '0 auto', width: '100%', color: `${theme.palette.text.secondary} !important`, }));

const Header = () => {
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  // drawer
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();

  // role
  const role = useSelector((state) => state.user.role);

  return (
    <AppBarStyled
      position="sticky"
      color="default"
      elevation={8}
      sx={(theme) => ({
        [theme.breakpoints.up('lg')]: {
          minHeight: customizer.TopbarHeight,
        },
      })}
    >
      <ToolbarStyled
        sx={{
          maxWidth: customizer.isLayout === 'boxed' ? 'lg' : '100%!important',
        }}
      >
        <Box sx={{ width: lgDown ? '45px' : 'auto', overflow: 'hidden' }}>
          <Logo />
        </Box>
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        {lgDown ? (
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => dispatch(toggleMobileSidebar())}
          >
            <IconMenu2 />
          </IconButton>
        ) : (
          ''
        )}
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        {role === 'admin sekolah' && <SearchAdminSekolah />}
        {lgUp ? (
          <>
            <Navigation />
          </>
        ) : null}
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">

          <Notifications />
          <ProfileMenu />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
  toggleSidebar: PropTypes.func,
};

export default Header;