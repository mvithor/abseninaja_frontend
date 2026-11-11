import PropTypes from 'prop-types';
import { Alert, Box, Button, Typography } from '@mui/material';
import { AKUN_DUMMY } from './akunDummy';

// Petunjuk akun dummy di halaman login (hanya dirender di mode development).
const DummyAkunHint = ({ onPilih }) => (
  <Alert severity="info" sx={{ mb: 2 }}>
    <Typography variant="subtitle2">Mode dummy (development)</Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Klik untuk mengisi akun contoh. Password: <code>{AKUN_DUMMY[0].password}</code>
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {AKUN_DUMMY.map((akun) => (
        <Button key={akun.email} size="small" variant="outlined" onClick={() => onPilih(akun)} sx={{ textTransform: 'none' }}>
          {akun.label}
        </Button>
      ))}
    </Box>
  </Alert>
);

DummyAkunHint.propTypes = {
  onPilih: PropTypes.func.isRequired,
};

export default DummyAkunHint;
