import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import logoDark from 'src/assets/images/logos/dark-logo.svg';

// Logo Absenin Aja (src/assets/images/logos/dark-logo.svg, 181x34). Memakai
// styled('img') supaya atribut width dan height tetap ada di DOM (Box
// menelan keduanya sebagai prop sistem), sehingga rasio gambar diketahui
// sebelum dimuat dan tidak ada CLS. Tinggi diatur lewat sx.
const Gambar = styled('img')({ display: 'block', width: 'auto' });

export default function LogoMerek({ putih = false, alt = '', sx }) {
  return (
    <Gambar
      src={logoDark}
      alt={alt}
      width={181}
      height={34}
      sx={{ height: { xs: 23, md: 26 }, ...(putih ? { filter: 'brightness(0) invert(1)' } : null), ...sx }}
    />
  );
}

LogoMerek.propTypes = {
  putih: PropTypes.bool,
  alt: PropTypes.string,
  sx: PropTypes.object,
};
