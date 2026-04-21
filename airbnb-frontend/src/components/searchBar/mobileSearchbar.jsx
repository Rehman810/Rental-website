import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Box,
    Paper,
    Typography,
    Dialog,
    AppBar,
    Toolbar,
    Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MobileSearchDialog from "./mobileSearchbarDialog";

const MobileSearchBar = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Box sx={{ px: 2, pt: 2 }}>
                <Paper
                    onClick={() => setOpen(true)}
                    sx={{
                        p: 1.6,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        cursor: "pointer",
                        boxShadow: "var(--shadow-md)",
                        mb: 2
                    }}
                >
                    <SearchIcon />
                    <Typography fontWeight={800}>
                        {t("translation:anyWhere")}
                    </Typography>
                </Paper>
            </Box>

            <MobileSearchDialog open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default MobileSearchBar;
