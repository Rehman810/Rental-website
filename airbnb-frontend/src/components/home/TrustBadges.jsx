import React from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

const badges = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 28 }} />,
    key: "verifiedHosts",
    gradient: "linear-gradient(135deg, #0066FF 0%, #00C6FF 100%)",
    stat: "100%",
    statLabel: "verified",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 28 }} />,
    key: "securePayments",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    stat: "Secure",
    statLabel: "encrypted",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 28 }} />,
    key: "support",
    gradient: "linear-gradient(135deg, #FF385C 0%, #FF6B35 100%)",
    stat: "10,000+",
    statLabel: "users",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const TrustBadges = () => {
  const { t } = useTranslation(["homepage", "translation"]);

  return (
    <Box
      sx={{
        position: "relative",
        py: { xs: 7, md: 10 },
        overflow: "hidden",
        bgcolor: "var(--bg-primary)",
      }}
    >
      {/* Subtle radial background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,56,92,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Section Heading */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="overline"
            sx={{
              color: "#FF385C",
              fontWeight: 800,
              letterSpacing: "0.12em",
              fontSize: "0.75rem",
              mb: 1,
              display: "block",
            }}
          >
            {t("homepage:trustBadges.overline")}
          </Typography>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              color: "var(--text-primary)",
              fontSize: { xs: "1.5rem", md: "2.4rem" },
              letterSpacing: "-0.03em",
              mb: 1.5,
            }}
          >
            {t("homepage:trustBadges.title")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "var(--text-secondary)",
              maxWidth: 520,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            {t("homepage:trustBadges.subtitle")}
          </Typography>
        </Box>

        <MotionBox
          component={Grid}
          container
          spacing={3}
          justifyContent="center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {badges.map((badge, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <MotionBox
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                sx={{
                  p: { xs: 2, md: 4 },
                  borderRadius: "24px",
                  border: "1px solid var(--border-light)",
                  bgcolor: "var(--bg-card)",
                  textAlign: "center",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
                    borderColor: "rgba(255,56,92,0.2)",
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: { xs: 52, md: 68 },
                    height: { xs: 52, md: 68 },
                    borderRadius: "20px",
                    background: badge.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    mx: "auto",
                    mb: 2.5,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                  }}
                >
                  {badge.icon}
                </Box>

                {/* Stat */}
                <Typography
                  sx={{
                    fontSize: { xs: "1.5rem", md: "2.4rem" },
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {badge.stat}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#FF385C",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    display: "block",
                    mb: 2,
                  }}
                >
                  {t(`homepage:trustBadges.statLabels.${badge.statLabel}`)}
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    color: "var(--text-primary)",
                    fontSize: { xs: "0.95rem", md: "1.15rem" },
                    letterSpacing: "-0.01em",
                    mb: 1,
                  }}
                >
                  {t(`homepage:trustBadges.${badge.key}.title`)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--text-secondary)",
                    maxWidth: 220,
                    mx: "auto",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {t(`homepage:trustBadges.${badge.key}.description`)}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </MotionBox>
      </Container>
    </Box>
  );
};

export default TrustBadges;
