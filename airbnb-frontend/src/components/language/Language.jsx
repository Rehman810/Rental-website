import React from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  IconButton,
  Divider,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/context";

const Language = ({ open, toggleModal }) => {
  const { i18n } = useTranslation();
  const { setLanguage } = useAppContext();

  const languages = [
    { code: "en", lang: "English", region: "United States" },
    { code: "zh", lang: "Chinese", region: "China" },
  ];

  const otherLanguages = [
    { code: "tr", lang: "Turkish", region: "Türkiye" },
    { code: "ar", lang: "Arabic", region: "Middle East" },
    { code: "ur", lang: "Urdu", region: "Pakistan" },
    { code: "fr", lang: "French", region: "France" },
    { code: "de", lang: "German", region: "Germany" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const LanguageCard = ({ lng }) => {
    const isActive = i18n.language === lng.code;

    return (
      <Paper
        elevation={0}
        onClick={() => {
          setLanguage({ code: lng.code, lang: lng.lang });
          changeLanguage(lng.code);

          const token = getAuthToken();
          if (token) {
            import('../../services/platformSettingsService.js').then(({ updatePlatformSettings }) => {
              updatePlatformSettings({ language: lng.code }, token).catch(err => console.error(err));
            });
          }

          toggleModal();
        }}
        sx={{
          p: 1.6,
          borderRadius: 3,
          border: "1px solid",
          borderColor: isActive ? "text.primary" : "divider",
          cursor: "pointer",
          transition: "all 0.18s ease",
          backgroundColor: isActive ? "rgba(0,0,0,0.03)" : "white",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
            borderColor: "text.primary",
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" >
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
              {lng.lang}
            </Typography>
            <Typography variant="body2" color="" sx={{ mt: 0.3 }}>
              {lng.region}
            </Typography>
          </Box>

          {isActive && (
            <CheckCircleIcon sx={{ fontSize: 20, color: "success.main" }} />
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={toggleModal}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          // backgroundColor: "rgba(255,255,255,0.92)",
          backgroundColor: "var(--bg-card)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Language & Region
          </Typography>
          <Typography variant="body2" color="" sx={{ mt: 0.3 }}>
            Select your preferred language for a better experience.
          </Typography>
        </Box>

        <IconButton
          onClick={toggleModal}
          sx={{
            borderRadius: 2,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent
        sx={{
          px: 3,
          py: 3,
          maxHeight: "65vh",
        }}
      >
        {/* Primary Languages */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Recommended
          </Typography>
          <Grid container spacing={2}>
            {languages.map((lng) => (
              <Grid item xs={12} sm={6} md={4} key={lng.code}>
                <LanguageCard lng={lng} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Other Languages */}
        <Box>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            More languages
          </Typography>

          <Grid container spacing={2}>
            {otherLanguages.map((lng) => (
              <Grid item xs={12} sm={6} md={4} key={lng.code}>
                <LanguageCard lng={lng} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Language;
