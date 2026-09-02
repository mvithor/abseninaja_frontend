import React from "react";
import { Button } from "@mui/material";

const CancelButton = ({ onClick }) => {
    return (
        <Button
            sx={{
                backgroundColor: "transparent",
                borderColor: "#D1D5DB",
                color: "#374151",
                '&:hover': { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB", color: "#374151" }
            }}
            variant="outlined"
            type="button"
            onClick={onClick}
        >
            Batal
        </Button>
    );
};

export default CancelButton;