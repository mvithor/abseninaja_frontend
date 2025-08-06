import React from "react";
import { Button, CircularProgress, Box } from "@mui/material";

const SubmitButton = ({ isLoading = false, children }) => {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={isLoading}
      sx={{
        backgroundColor: "#973BE0",
        color: "white",
        minWidth: "100px",
        height: "38px",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none",
        px: 2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        '&:hover': {
          backgroundColor: "#7d2dbd",
        },
        '&.Mui-disabled': {
          backgroundColor: "#973BE0",
          opacity: 0.8,
          color: "#fff",
        },
      }}
    >
      {isLoading && (
        <CircularProgress size={14} color="inherit" thickness={5} />
      )}
      <Box
        component="span"
        sx={{
          animation: isLoading ? 'shimmerText 1.2s ease-in-out infinite' : 'none',
        }}
      >
        {children}
      </Box>
    </Button>
  );
};

export default SubmitButton;
