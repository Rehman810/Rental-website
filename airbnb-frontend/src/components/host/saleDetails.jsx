import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

const propertyTypeOptions = [
    { value: 'House', label: 'House' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Plot', label: 'Plot' },
    { value: 'Commercial', label: 'Commercial' }
];

const SaleDetails = ({ saleConfig, setSaleConfig }) => {
    const { t } = useTranslation("listingSteps");
    const handleChange = (field, value) => {
        setSaleConfig((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t("sale.title")}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                {t("sale.subtitle")}
            </Typography>

            <Stack spacing={3}>
                <TextField
                    select
                    label={t("sale.propertyType")}
                    fullWidth
                    value={saleConfig.propertyType || ''}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                >
                    {propertyTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {t(`propertyType.types.${option.value}`, option.label)}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label={t("sale.ownership.label")}
                    helperText={t("sale.ownership.helper")}
                    fullWidth
                    value={saleConfig.ownershipStatus || ''}
                    onChange={(e) => handleChange('ownershipStatus', e.target.value)}
                />

                <TextField
                    label={t("sale.visit.label")}
                    helperText={t("sale.visit.helper")}
                    fullWidth
                    value={saleConfig.visitAvailability || ''}
                    onChange={(e) => handleChange('visitAvailability', e.target.value)}
                />
            </Stack>
        </Box>
    );
};

export default SaleDetails;
