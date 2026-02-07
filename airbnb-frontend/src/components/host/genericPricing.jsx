import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    IconButton,
    InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const GenericPricing = ({ value, onChange, heading, para, prefix = "Rs", label = "Price" }) => {
    const [price, setPrice] = useState(value || 0);
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        setPrice(value || 0);
    }, [value]);

    const handlePriceChange = (event) => {
        const val = parseFloat(event.target.value) || 0;
        setPrice(val);
        onChange(val);
    };

    const toggleEditable = () => {
        setIsEditable(!isEditable);
    };

    return (
        <Box
            sx={{
                textAlign: "center",
                p: 3,
                borderRadius: 2,
                margin: "auto",
                maxWidth: 600
            }}
        >
            <Typography variant="h4" fontWeight="bold" textAlign="left" sx={{ mb: 1 }}>
                {heading}
            </Typography>
            <Typography variant="body1" fontWeight="bold" textAlign="left" sx={{ color: "gray", mb: 3 }}>
                {para}
            </Typography>

            <Box sx={{ position: "relative", mb: 2, textAlign: 'center' }}>
                {isEditable ? (
                    <TextField
                        variant="standard"
                        size="large"
                        value={price}
                        onChange={handlePriceChange}
                        type="number"
                        sx={{
                            "& .MuiInputBase-root": {
                                fontSize: "3rem",
                                textAlign: "center",
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">{prefix}</InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={toggleEditable}>
                                        <EditIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                ) : (
                    <Typography
                        variant="h1"
                        onClick={toggleEditable}
                        sx={{
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {prefix} {price}
                        <IconButton sx={{ ml: 1 }} onClick={toggleEditable}>
                            <EditIcon />
                        </IconButton>
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default GenericPricing;
