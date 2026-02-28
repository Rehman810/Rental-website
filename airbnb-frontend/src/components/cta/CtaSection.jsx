import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CtaSection = () => {
    return (
        <Box
            sx={{
                mt: 8,
                mb: 8,
                py: { xs: 8, md: 10 },
                position: 'relative',
                borderRadius: { xs: 0, md: 4 },
                mx: { xs: 0, md: 4 },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
        >
            {/* Abstract Background Decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,56,92,0.2) 0%, rgba(255,100,120,0) 100%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(9,9,121,0) 100%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                }}
            />

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
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
                    Ready to Move In?
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
                    Browse verified listings with real 360° previews. Experience your next home before you even visit.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        bgcolor: '#FF385C',
                        color: '#fff',
                        px: 5,
                        py: 2,
                        borderRadius: '999px',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: '0 10px 20px rgba(255,56,92,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: '#E31C5F',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 15px 30px rgba(255,56,92,0.4)',
                        },
                    }}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                    Start Searching
                </Button>
            </Container>
        </Box>
    );
};

export default CtaSection;
