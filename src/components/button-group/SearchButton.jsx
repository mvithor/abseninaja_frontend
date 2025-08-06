import React from 'react';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';

const SearchButton = ({ value, onChange, placeholder = "Cari", ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        borderRadius: '8px',
        width: { xs: '100%', sm: '250px' }, // Full width di mobile, 250px di desktop
      }}
    >
      <OutlinedInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        startAdornment={
          <InputAdornment position="start" sx={{ marginLeft: '6px' }}> {/* Ikon lebih dekat */}
            <IconSearch size="20" color={isDarkMode ? theme.palette.text.primary : '#525252'} />
          </InputAdornment>
        }
        sx={{
          borderRadius: '10px', // Bentuk rounded penuh sesuai gambar
          height: '40px', // Tinggi input
          backgroundColor: isDarkMode ? 'transparent' : '#f5f5f5', // Transparan di mode dark
          color: theme.palette.text.primary,
          paddingLeft: '8px', // Padding di kiri
          paddingRight: '8px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? 'white' : 'transparent', // Outline putih di mode dark
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? 'white' : 'transparent', // Hover outline putih di mode dark
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main, // Fokus warna tema utama
          },
        }}
        {...props}
      />
    </Box>
  );
};

export default SearchButton;
