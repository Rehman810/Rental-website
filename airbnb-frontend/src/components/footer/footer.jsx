import { Box, Container, Grid, Typography, Link, Divider, Stack, IconButton, Paper } from "@mui/material";
import { APP_NAME, CURRENCY } from "../../config/env";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { MdLanguage } from "react-icons/md";
import Language from "../language/Language";
import { useState } from "react";
import { useAppContext } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { RTLWrapper, useRTL } from "../language/Localization";

const Footer = () => {
  const { t } = useTranslation("footer");
  const [open, setOpen] = useState(false);
  const { langauge } = useAppContext();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const isRTL = useRTL();

  const toggleModal = () => setOpen(!open);

  return (
    <RTLWrapper
      component="footer"
      sx={{
        mt: 6,
        background:
          "linear-gradient(180deg, rgba(25,118,210,0.03), rgba(0,0,0,0.02))",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 }, pb: { xs: 12, md: 5 } }}>
        {/* Top Section */}
        <Grid container spacing={3}>
          {/* Brand / Intro */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "var(--border-light)",
                background: "var(--bg-secondary)",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                {APP_NAME}
              </Typography>

              <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.8, lineHeight: 1.7 }}>
                {t("brandDescription")}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <SocialIconButton label="Facebook" onClick={() => { }}>
                  <FaFacebookF size={16} />
                </SocialIconButton>

                <SocialIconButton label="Twitter" onClick={() => { }}>
                  <FaTwitter size={16} />
                </SocialIconButton>

                <SocialIconButton label="Instagram" onClick={() => { }}>
                  <FaInstagram size={16} />
                </SocialIconButton>
              </Stack>
            </Paper>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={4}>
            <FooterColumn title={t("support.support")}>
              <FooterLink text={t("support.helpCenter")} onClick={() => navigate("/user/help/feature")} />
              <FooterLink text={t("support.airCover")} />
              <FooterLink text={t("support.antiDiscrimination")} />
              <FooterLink text={t("support.disabilitySupport")} />
              <FooterLink text={t("support.cancellationOptions")} />
              <FooterLink text={t("support.reportNeighborhoodConcern")} />
            </FooterColumn>
          </Grid>

          {/* Hosting */}
          <Grid item xs={12} sm={6} md={4}>
            <FooterColumn title={t("Hosting.hosting")}>
              <FooterLink text={t("Hosting.airCoverForHosts")} />
              <FooterLink text={t("Hosting.hostingResources")} />
              <FooterLink text={t("Hosting.CommunityForum")} />
              <FooterLink text={t("Hosting.hostingResponsibly")} />
              <FooterLink text={t("Hosting.airbnbFriendlyApartments")} />
              <FooterLink text={t("Hosting.joinAFreeHostingClass")} />
              <FooterLink text={t("Hosting.findACoHost")} />
            </FooterColumn>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 1.5,
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          {/* Left */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              © {currentYear} {APP_NAME}, Inc.
            </Typography>

            <Stack direction="row" spacing={1.2} divider={<DotDivider />}>
              <FooterMiniLink text={t("terms")} onClick={() => { }} />
              <FooterMiniLink text={t("privacy")} onClick={() => { }} />
              <FooterMiniLink text={t("sitemap")} onClick={() => { }} />
            </Stack>
          </Stack>

          {/* Right */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{
                cursor: "pointer",
                px: 1.2,
                py: 0.7,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
                "&:hover": {
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--text-secondary)",
                },
                transition: "all 0.18s ease",
              }}
              onClick={toggleModal}
            >
              <MdLanguage size={18} />
              <Typography variant="body2" fontWeight={800}>
                {langauge?.lang || "English"} ({langauge?.code || "en"})
              </Typography>
            </Stack>

            <ChipLike label={`${CURRENCY}`} />
          </Stack>
        </Box>
      </Container>

      <Language open={open} toggleModal={toggleModal} />
    </RTLWrapper>
  );
};

/* ------------------ Small Components ------------------ */

const FooterColumn = ({ title, children }) => {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1.5 }}>
        {title}
      </Typography>

      <Stack spacing={0.8}>{children}</Stack>
    </Box>
  );
};

const FooterLink = ({ text, onClick }) => {
  return (
    <Link
      component="button"
      onClick={onClick}
      underline="none"
      sx={{
        textAlign: "inherit",
        width: "fit-content",
        color: "var(--text-secondary)",
        fontSize: "0.92rem",
        fontWeight: 600,
        background: "transparent",
        border: "none",
        p: 0,
        cursor: "pointer",
        "&:hover": {
          color: "var(--text-primary)",
          textDecoration: "underline",
        },
        transition: "all 0.15s ease",
      }}
    >
      {text}
    </Link>
  );
};

const FooterMiniLink = ({ text, onClick }) => {
  return (
    <Link
      component="button"
      onClick={onClick}
      underline="none"
      sx={{
        color: "var(--text-secondary)",
        fontSize: "0.88rem",
        fontWeight: 700,
        background: "transparent",
        border: "none",
        p: 0,
        cursor: "pointer",
        "&:hover": {
          color: "var(--primary)",
          textDecoration: "underline",
        },
      }}
    >
      {text}
    </Link>
  );
};

const DotDivider = () => (
  <Typography variant="body2" sx={{ color: "var(--text-tertiary)", mx: 0.5 }}>
    ·
  </Typography>
);

const ChipLike = ({ label }) => {
  return (
    <Box
      sx={{
        px: 1.2,
        py: 0.7,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "var(--border-light)",
        backgroundColor: "var(--bg-secondary)",
        fontWeight: 900,
        fontSize: "0.9rem",
        color: "var(--text-secondary)",
      }}
    >
      {label}
    </Box>
  );
};

const SocialIconButton = ({ children, label, onClick }) => {
  return (
    <IconButton
      aria-label={label}
      onClick={onClick}
      sx={{
        width: 38,
        height: 38,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "var(--border-light)",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        "&:hover": {
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--text-primary)",
          transform: "translateY(-1px)",
          color: "var(--text-primary)",
        },
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </IconButton>
  );
};

export default Footer;
