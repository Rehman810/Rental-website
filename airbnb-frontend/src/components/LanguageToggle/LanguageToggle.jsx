import React from "react";
import { Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === "en" ? "ur" : "en";
    i18n.changeLanguage(nextLng);
  };

  return (
    <Button
      onClick={toggleLanguage}
      sx={{
        textTransform: "none",
        color: "var(--text-primary)",
        fontWeight: 600,
        minWidth: "auto",
        px: 1,
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.05)",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <span style={{ color: i18n.language === "en" ? "var(--accent-primary)" : "inherit" }}>EN</span>
        <span>/</span>
        <span 
          style={{ 
            fontFamily: "'Noto Nastaliq Urdu', serif",
            color: i18n.language === "ur" ? "var(--accent-primary)" : "inherit"
          }}
        >
          اردو
        </span>
      </Typography>
    </Button>
  );
};

export default LanguageToggle;
