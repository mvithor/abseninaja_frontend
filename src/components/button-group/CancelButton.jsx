import React from "react";
import { Button } from "@mui/material";

const CancelButton = ({ onClick }) => {
    return (
        <Button
            sx={{
                backgroundColor: "#2F327D",
                '&:hover': { backgroundColor: "#280274" }
            }}
            variant="contained"
            color="secondary"
            type="button"
            onClick={onClick}
        >
            Batal
        </Button>
    );
};

export default CancelButton;
