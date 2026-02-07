import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack } from "@mui/material";

const utilitiesOptions = [
    { value: 'included', label: 'Included' },
    { value: 'partial', label: 'Partial' },
    { value: 'excluded', label: 'Excluded' }
];

const furnishingOptions = [
    { value: 'furnished', label: 'Furnished' },
    { value: 'semi-furnished', label: 'Semi-Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' }
];

const LeaseDetails = ({ leaseConfig, setLeaseConfig }) => {
    const handleChange = (field, value) => {
        setLeaseConfig((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Lease Details
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Specify the terms for your long-term rental.
            </Typography>

            <Stack spacing={3}>
                <TextField
                    label="Minimum Lease Duration (Months)"
                    type="number"
                    fullWidth
                    value={leaseConfig.minLeaseDuration || ''}
                    onChange={(e) => handleChange('minLeaseDuration', parseInt(e.target.value) || 0)}
                />

                <TextField
                    select
                    label="Utilities Policy"
                    fullWidth
                    value={leaseConfig.utilities || ''}
                    onChange={(e) => handleChange('utilities', e.target.value)}
                >
                    {utilitiesOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Furnishing Status"
                    fullWidth
                    value={leaseConfig.furnishingStatus || ''}
                    onChange={(e) => handleChange('furnishingStatus', e.target.value)}
                >
                    {furnishingOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Availability Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={leaseConfig.availabilityStart ? new Date(leaseConfig.availabilityStart).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('availabilityStart', e.target.value)}
                />
            </Stack>
        </Box>
    );
};

export default LeaseDetails;
