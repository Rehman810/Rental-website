import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CtaSection = () => {
    return (
        <Box
            sx={{
                mt: 10,
                mb: 10,
                position: "relative",
                px: { xs: 2, md: 4 }
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        py: { xs: 8, md: 10 },
                        px: { xs: 3, md: 8 },
                        textAlign: "center",
                        borderRadius: 6,
                        position: "relative",
                        overflow: "hidden",

                        background:
                            "linear-gradient(135deg, #1a1a1a 0%, #242424 40%, #2d2d2d 100%)",

                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.06)",

                        boxShadow: `
                          0 20px 60px rgba(0,0,0,0.35),
                          inset 0 1px 0 rgba(255,255,255,0.05)
                        `,
                    }}
                >
                    {/* Top Glow */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: -120,
                            right: -120,
                            width: 320,
                            height: 320,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(255,56,92,0.25) 0%, rgba(255,56,92,0) 70%)",
                            filter: "blur(40px)",
                            pointerEvents: "none",
                        }}
                    />

                    {/* Bottom Glow */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -120,
                            left: -120,
                            width: 320,
                            height: 320,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0) 70%)",
                            filter: "blur(40px)",
                            pointerEvents: "none",
                        }}
                    />

                    <Typography
                        variant="h2"
                        component="h2"
                        sx={{
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            mb: 2,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Find Your Next Home With Confidence
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: 400,
                            mb: 5,
                            maxWidth: '600px',
                            mx: 'auto',
                        }}
                    >
                        Discover high-quality listings, explore detailed property insights, and connect with trusted hosts — all in one seamless platform.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            bgcolor: "#FF385C",
                            color: "#fff",
                            px: 6,
                            py: 2,
                            borderRadius: "999px",
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            textTransform: "none",

                            boxShadow: "0 12px 25px rgba(255,56,92,0.35)",

                            transition: "all 0.35s ease",

                            '&:hover': {
                                bgcolor: "#E31C5F",
                                transform: "translateY(-4px)",
                                boxShadow: "0 20px 40px rgba(255,56,92,0.45)",
                            }
                        }}
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Start Searching
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CtaSection;