import { Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AddButton = ({ icon, onClick, children, ...props }) => {
  const theme = useTheme(); // Mengambil tema aktif
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px',
        padding: '6px 12px',
        borderColor: isDarkMode ? theme.palette.text.primary : '#D3D3D3',
        backgroundColor: isDarkMode ? 'transparent' : '#ffffff', // Transparan di dark mode
        '&:hover': {
          backgroundColor: isDarkMode ? 'transparent' : '#f5f5f5',
        },
        width: { xs: '100%', sm: '220px' },
        maxWidth: '160px',
        textTransform: 'none',
        ml: 'auto',
      }}
      {...props}
    >
      <Typography
        sx={{
          color: isDarkMode ? theme.palette.text.primary : '#333333',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          flexGrow: 1,
        }}
      >
        {children}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? 'transparent' : '#2A85FF',
          color: isDarkMode ? theme.palette.text.primary : '#ffffff',
          border: isDarkMode ? `1px solid ${theme.palette.text.primary}` : 'none',
          marginLeft: '8px',
          borderRadius: '20%',
          width: '24px',
          height: '24px',
        }}
      >
        {icon}
      </Box>
    </Button>
  );
};

export default AddButton;
