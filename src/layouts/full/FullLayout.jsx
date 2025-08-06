import { styled, Container, Box, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Header from './vertical/header/Header';
import HorizontalHeader from '../full/horizontal/header/Header';
import Sidebar from './vertical/sidebar/Sidebar';
import Customizer from './shared/customizer/Customizer';
import Navigation from './horizontal/navbar/Navbar';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  paddingTop: '0px', // Kurangi padding agar tidak terlalu turun
}));


const FullLayout = () => {
  const customizer = useSelector((state) => state.customizer);
  const theme = useTheme();

  return (
    <MainWrapper
      className={customizer.activeMode === 'dark' ? 'darkbg mainwrapper' : 'mainwrapper'}
    >
      {/* Sidebar */}
      {!customizer.isHorizontal && <Sidebar />}
      {/* Main Wrapper */}
      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(customizer.isCollapse && {
            [theme.breakpoints.up('lg')]: { ml: `${customizer.MiniSidebarWidth}px` },
          }),
        }}
      >
        {/* Header */}
        {customizer.isHorizontal ? <HorizontalHeader /> : <Header />}
        {/* Navigation untuk horizontal mode */}
        {customizer.isHorizontal && <Navigation />}
        <Container
          sx={{
            maxWidth: customizer.isLayout === 'boxed' ? 'lg' : '100%!important',
            marginTop: '5px', // Tambahkan margin agar konten ada jarak
          }}
        >
          <Box
            sx={{
              minHeight: 'calc(100vh - 200px)', // Sesuaikan tinggi agar tidak terlalu pendek
              mt: 3, // Beri margin top untuk menambah jarak antar elemen
            }}
          >
            <Outlet />
          </Box>
        </Container>
        <Customizer />
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
