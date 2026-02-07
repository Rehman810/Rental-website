import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack } from "@mui/material";

const propertyTypeOptions = [
    { value: 'House', label: 'House' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Plot', label: 'Plot' },
    { value: 'Commercial', label: 'Commercial' }
];

const SaleDetails = ({ saleConfig, setSaleConfig }) => {
    const handleChange = (field, value) => {
        setSaleConfig((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Property Sale Details
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Fill in the ownership and property type details.
            </Typography>

            <Stack spacing={3}>
                <TextField
                    select
                    label="Property Type"
                    fullWidth
                    value={saleConfig.propertyType || ''}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                >
                    {propertyTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Ownership Status"
                    helperText="e.g. Freehold, Leasehold"
                    fullWidth
                    value={saleConfig.ownershipStatus || ''}
                    onChange={(e) => handleChange('ownershipStatus', e.target.value)}
                />

                <TextField
                    label="Visit Availability"
                    helperText="e.g. Weekends 10am-4pm"
                    fullWidth
                    value={saleConfig.visitAvailability || ''}
                    onChange={(e) => handleChange('visitAvailability', e.target.value)}
                />
            </Stack>
        </Box>
    );
};

export default SaleDetails;
