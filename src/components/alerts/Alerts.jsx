import { Box, Alert } from '@mui/material';

const Alerts = ({ error, success }) => {
  return (
    <Box justifyContent="center" mb={2} mt={-2}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            fontSize: {
              xs: '0.8rem', 
              sm: '1rem',
              md: '1rem',
              lg: '1rem',
            }
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            fontSize: {
              xs: '0.8rem', 
              sm: '1rem',
              md: '1rem',
              lg: '1rem',
            }
          }}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default Alerts;
