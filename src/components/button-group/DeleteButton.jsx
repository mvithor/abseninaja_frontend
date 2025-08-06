import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';

const DeleteButton = ({ 
    onClick, 
    isLoading = false, // Default value langsung di parameter
    children = 'Hapus', // Default value langsung di parameter
}) => {
    return (
        <Button
            sx={{
                mr: 3,
                backgroundColor: "#F48C06",
                '&:hover': { backgroundColor: "#f7a944" },
            }}
            variant="contained"
            onClick={onClick}
            disabled={isLoading}
        >
            {isLoading ? <CircularProgress size={24} /> : children}
        </Button>
    );
};

DeleteButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    children: PropTypes.node,
};

export default DeleteButton;
