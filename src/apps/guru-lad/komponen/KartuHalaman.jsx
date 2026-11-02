import PropTypes from 'prop-types';
import {
  Box, Card, CardContent, CardHeader, Divider, Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';

/**
 * Kartu halaman LAD: kartu putih dengan judul, garis pemisah, dan isi. Bentuknya sama dengan ParentCard yang dipakai
 * halaman daftar lain (bayangan atau bingkai mengikuti pengaturan tampilan), hanya judulnya dirender sebagai h1/h2
 * supaya pembaca layar punya struktur judul, dan isinya ditata vertikal dengan jarak tetap sesuai desain.
 */
export default function KartuHalaman({
  judul, tingkat = 'h2', aksi, children, jarak = 2.5, sx,
}) {
  const kustom = useSelector((state) => state.customizer);
  return (
    <Card
      component="section"
      sx={{ padding: 0, minWidth: 0, ...sx }}
      elevation={kustom.isCardShadow ? 9 : 0}
      variant={!kustom.isCardShadow ? 'outlined' : undefined}
    >
      <CardHeader
        title={<Typography component={tingkat} sx={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.6rem', m: 0 }}>{judul}</Typography>}
        action={aksi}
      />
      <Divider />
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: jarak, minWidth: 0 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

KartuHalaman.propTypes = {
  judul: PropTypes.node.isRequired,
  tingkat: PropTypes.oneOf(['h1', 'h2', 'h3']),
  aksi: PropTypes.node,
  children: PropTypes.node,
  jarak: PropTypes.number,
  sx: PropTypes.object,
};
