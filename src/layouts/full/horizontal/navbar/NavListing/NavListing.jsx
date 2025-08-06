// import Menudata from '../Menudata';
// import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
// import { useSelector } from 'react-redux';
import NavItem from '../NavItem/NavItem';
import NavCollapse from '../NavCollapse/NavCollapse';

const NavListing = () => {
  // const { pathname } = useLocation();
  // const pathDirect = pathname;
  // const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  // const customizer = useSelector((state) => state.customizer);
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';

  return (
    <Box>
      <List sx={{ p: 0, display: 'flex', gap: '3px', zIndex: '100' }}>
        {/* Tidak ada menu ditampilkan */}
      </List>
    </Box>
  );
  
};
export default NavListing;
