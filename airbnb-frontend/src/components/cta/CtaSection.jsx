import React, { useRef } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { 
  motion, 
  useInView, 
  useReducedMotion, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from 'framer-motion';

/**
 * SplitText Reveal Component
 * Animates each character with a staggered, springy entrance.
 */
const SplitText = ({ children, delay = 0 }) => {
  const letters = children.split("");
  return (
    <Box component="span" sx={{ display: 'inline-flex', overflow: 'hidden' }}>
      {letters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: delay + (index * 0.03),
            ease: [0.33, 1, 0.68, 1]
          }}
          style={{ display: 'inline-block', whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </Box>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

const CtaSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  // Mouse Tracking for Spotlight and Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Tilt transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-3deg", "3deg"]);
  
  // Spotlight position
  const spotlightX = useTransform(smoothX, [-0.5, 0.5], ["0%", "100%"]);
  const spotlightY = useTransform(smoothY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <Box
      sx={{
        mt: { xs: 6, md: 16 },
        mb: { xs: 6, md: 16 },
        position: "relative",
        px: { xs: 2, md: 4 },
        perspective: "1200px",
      }}
    >
      <Container maxWidth="xl">
        <MotionBox
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            rotateX: shouldReduceMotion ? 0 : rotateX,
            rotateY: shouldReduceMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          sx={{
            py: { xs: 6, md: 14 },
            px: { xs: 3, md: 10 },
            textAlign: "center",
            borderRadius: { xs: 8, md: 14 },
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, #090909 0%, #1a1a1a 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 40px 120px rgba(0, 0, 0, 0.7)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 70%)`,
              opacity: isInView ? 1 : 0,
              transition: "opacity 1s ease",
            }
          }}
        >
          {/* Spotlight Effect that follows cursor */}
          {!shouldReduceMotion && (
            <MotionBox
              style={{
                left: spotlightX,
                top: spotlightY,
                x: "-50%",
                y: "-50%",
              }}
              sx={{
                position: "absolute",
                width: "600px",
                height: "600px",
                background: "radial-gradient(circle, rgba(255, 56, 92, 0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          )}

          {/* Background Blobs */}
          <Box sx={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
             <MotionBox
              animate={{
                y: [0, -30, 0],
                rotate: [0, 45, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              sx={{
                position: "absolute",
                top: "-10%",
                left: "-5%",
                width: "40%",
                height: "60%",
                background: "radial-gradient(circle, rgba(255, 56, 92, 0.2) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <MotionBox
              animate={{
                y: [0, 40, 0],
                rotate: [0, -30, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              sx={{
                position: "absolute",
                bottom: "-10%",
                right: "-5%",
                width: "45%",
                height: "70%",
                background: "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
          </Box>

          {/* Content with 3D Depth */}
          <Box sx={{ position: "relative", zIndex: 1, transform: "translateZ(40px)" }}>
            <Typography
              variant="h2"
              sx={{
                color: "#fff",
                fontWeight: 950,
                fontSize: { xs: "2rem", sm: "3.5rem", md: "5rem" },
                mb: 3,
                letterSpacing: "-0.05em",
                lineHeight: 1.1,
                textShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {isInView && (
                <>
                  <SplitText>Find Your Next</SplitText> <br />
                  <Box component="span" sx={{ color: "#FF385C" }}>
                    <SplitText delay={0.8}>Home With Confidence</SplitText>
                  </Box>
                </>
              )}
            </Typography>

            <MotionTypography
              variants={itemVariants}
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontWeight: 400,
                mb: 6,
                maxWidth: "750px",
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1.3rem" },
                lineHeight: 1.7,
              }}
            >
              Whether it&apos;s a coastal retreat or a downtown loft, our curated collection 
              of high-quality listings ensures your next stay is nothing short of extraordinary.
            </MotionTypography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <MotionButton
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "#FF4D6D",
                  boxShadow: "0 20px 50px rgba(255, 56, 92, 0.5)" 
                }}
                whileTap={{ scale: 0.98 }}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon sx={{ transition: "transform 0.3s ease" }} />}
                sx={{
                  bgcolor: "#FF385C",
                  color: "#fff",
                  px: { xs: 4, md: 10 },
                  py: { xs: 1.5, md: 3 },
                  borderRadius: "999px",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  fontWeight: 900,
                  textTransform: "none",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 15px 40px rgba(255, 56, 92, 0.35)",
                  position: "relative",
                  overflow: "hidden",
                  "& .MuiButton-endIcon": {
                    ml: 2,
                  },
                  "&:hover .MuiButton-endIcon": {
                    transform: "translateX(8px)",
                  },
                  // Internal shimmer
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "50%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transform: "skewX(-25deg)",
                    animation: "shimmer 3s infinite",
                  },
                  "@keyframes shimmer": {
                    "0%": { left: "-100%" },
                    "30%": { left: "150%" },
                    "100%": { left: "150%" },
                  }
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Start Searching Now
              </MotionButton>
            </Box>
          </Box>

          {/* Bottom Edge Light */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), rgba(255, 56, 92, 0.4), transparent)",
              boxShadow: "0 -5px 20px rgba(255, 56, 92, 0.2)",
            }}
          />
        </MotionBox>
      </Container>
    </Box>
  );
};

export default CtaSection;