import React from 'react';
import { Box, IconButton } from '@mui/material';
import { FilterAlt as FilterIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const FilterButton = ({ onClick, sx = {}, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        border: `1px solid ${isDarkMode ? theme.palette.text.primary : '#D3D3D3'}`, // Outline warna teks di dark mode
        backgroundColor: isDarkMode ? 'transparent' : '#ffffff', // Transparan di dark mode
        width: '38px',
        height: '38px',
        '&:hover': {
          backgroundColor: isDarkMode ? 'transparent' : '#f5f5f5',
        },
        ...sx,
      }}
      {...props}
    >
      <IconButton
        onClick={onClick}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FilterIcon
          sx={{
            color: isDarkMode ? theme.palette.text.primary : '#757575',
            fontSize: '24px',
          }}
        />
      </IconButton>
    </Box>
  );
};

export default FilterButton;
