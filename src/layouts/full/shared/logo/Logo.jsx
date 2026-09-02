import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import logoDark from 'src/assets/images/logos/dark-logo.svg';
import logoLight from 'src/assets/images/logos/light-logo.svg';
import { styled } from '@mui/material';

const Header = styled('header')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80px',
  padding: '12px',
});

const LogoWrapper = styled(Link)({
  display: 'block',
  height: '32px',
  '& img': {
    height: '100%',
    width: 'auto',
  },
});

const Logo = () => {
  const customizer = useSelector((state) => state.customizer);

  return (
    <Header>
      <LogoWrapper to="/">
        <img
          src={customizer.activeMode === 'dark' ? logoLight : logoDark}
          alt="Logo"
        />
      </LogoWrapper>
    </Header>
  );
};

export default Logo;