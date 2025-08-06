import { IconButton, AppBar, useMediaQuery, Toolbar, styled, Stack, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { IconMenu2 } from '@tabler/icons-react';

// components
import Notifications from './Notifications';
import SearchAdminSekolah from './SearchAdminSekolah';
import ProfileSuperAdmin from './ProfileSuperAdmin';
import ProfileAdminSekolah from './ProfileAdminSekolah';

const Header = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();

  // role
  const role = useSelector((state) => state.user.role);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    minHeight: '64px', // Pastikan tinggi tidak lebih dari 64px
    [theme.breakpoints.up('lg')]: {
      minHeight: '64px', // Samakan tinggi header di desktop
    },
  }));
  
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    maxHeight: '64px', // Batasi tinggi toolbar agar tidak lebih tinggi
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }));
  

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Menu dan Search di sebelah kiri */}
        {/* ------------------------------------------- */}
        <Stack spacing={2} direction="row" alignItems="center" sx={{ flex: 1 }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={lgUp ? () => dispatch(toggleSidebar()) : () => dispatch(toggleMobileSidebar())}
          >
            <IconMenu2 size="20" />
          </IconButton>

          {/* Wrapper untuk Search agar tidak terlalu lebar */}
          {role === 'admin sekolah' && (
            <Box sx={{ flexGrow: 1, maxWidth: '300px',  width: '100%' }}> {/* Batasi max width untuk search */}
              <SearchAdminSekolah />
            </Box>
          )}
        </Stack>

        {/* ------------------------------------------- */}
        {/* Profil dan Notifications di sebelah kanan */}
        {/* ------------------------------------------- */}
        <Stack spacing={0} direction="row" alignItems="center">
          <Notifications />
          {role === 'super admin' ? <ProfileSuperAdmin /> : <ProfileAdminSekolah />}
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
