import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = ({
    label = "Back",
    to = -1,
    showLabel = true,
}) => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
            }}
        >
            <IconButton
                onClick={() => navigate(to)}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <ArrowBackIcon />
            </IconButton>

            {showLabel && (
                <Typography fontWeight={900}>
                    {label}
                </Typography>
            )}
        </Box>
    );
};

export default BackButton;
