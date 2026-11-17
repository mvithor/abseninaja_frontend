import PropTypes from 'prop-types';
import { Box } from '@mui/material';

// Teks dua versi. Pertukaran lewat CSS display (bukan JavaScript) supaya tidak
// berkedip dan tidak ada render ganda berbeda saat hidrasi. Versi yang tidak
// tampil memakai display none, sehingga tidak terbaca pembaca layar.
// `web` tampil di md ke atas, `seluler` di bawah md.
export default function Teks({ web, seluler, sx }) {
  if (seluler === undefined || seluler === null || seluler === web) {
    return sx ? <Box component="span" sx={sx}>{web}</Box> : <>{web}</>;
  }
  return (
    <>
      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, ...sx }}>
        {web}
      </Box>
      <Box component="span" sx={{ display: { xs: 'inline', md: 'none' }, ...sx }}>
        {seluler}
      </Box>
    </>
  );
}

Teks.propTypes = {
  web: PropTypes.node.isRequired,
  seluler: PropTypes.node,
  sx: PropTypes.object,
};
