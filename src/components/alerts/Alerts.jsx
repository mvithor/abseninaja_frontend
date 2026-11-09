import { useState } from 'react';
import { Box, Alert } from '@mui/material';
import useAutoHide, { DURASI_ALERT } from 'src/hooks/useAutoHide';

const ukuranHuruf = {
  xs: '0.8rem',
  sm: '1rem',
  md: '1rem',
  lg: '1rem',
};

/**
 * Alert sukses dan galat di atas form atau daftar. Hilang sendiri setelah beberapa detik (sukses 4 dtk, galat 6 dtk),
 * jadi halaman pemanggil tidak wajib membersihkan state-nya dengan setTimeout. Berhenti menghitung selama kursor
 * berada di atas alert.
 */
const Alerts = ({ error, success }) => {
  const [diatas, setDiatas] = useState(false);
  const tampilGalat = useAutoHide(error, DURASI_ALERT.error, diatas);
  const tampilSukses = useAutoHide(success, DURASI_ALERT.success, diatas);

  return (
    <Box
      justifyContent="center"
      mb={2}
      mt={-2}
      onMouseEnter={() => setDiatas(true)}
      onMouseLeave={() => setDiatas(false)}
    >
      {tampilGalat && (
        <Alert severity="error" sx={{ fontSize: ukuranHuruf }}>
          {error}
        </Alert>
      )}
      {tampilSukses && (
        <Alert severity="success" sx={{ fontSize: ukuranHuruf }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default Alerts;
