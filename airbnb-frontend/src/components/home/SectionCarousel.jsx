import React, { useRef, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Card from "../cards/cards";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const SectionCarousel = ({ title, subtitle, listings = [], loading = false }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const SkeletonCard = () => (
    <Box
      sx={{
        minWidth: { xs: 220, sm: 260, md: 300 },
        maxWidth: { xs: 220, sm: 260, md: 300 },
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid var(--border-light)",
        bgcolor: "var(--bg-card)",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          height: 200,
          background: "linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.5s infinite",
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "100% 0" },
            "100%": { backgroundPosition: "-100% 0" },
          },
        }}
      />
      <Box sx={{ p: 2 }}>
        {[70, 90, 55].map((w, i) => (
          <Box
            key={i}
            sx={{
              height: 14,
              width: `${w}%`,
              mb: 1,
              borderRadius: 2,
              background: "linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.5s infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );

  // Don't render at all only after load finishes with zero results
  if (!loading && listings.length === 0) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      sx={{ mb: { xs: 5, md: 8 } }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 3,
          px: { xs: 2, md: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{
              color: "var(--text-primary)",
              fontSize: { xs: "1.3rem", md: "1.75rem" },
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: "var(--text-secondary)", fontWeight: 500 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Nav Arrows Desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <IconButton
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            sx={{
              border: "1.5px solid",
              borderColor: canScrollLeft ? "var(--border-focus)" : "var(--border-light)",
              bgcolor: canScrollLeft ? "var(--bg-secondary)" : "transparent",
              opacity: canScrollLeft ? 1 : 0.35,
              transition: "all 0.2s ease",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "var(--bg-tertiary)" },
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: "var(--text-primary)" }} />
          </IconButton>
          <IconButton
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            sx={{
              border: "1.5px solid",
              borderColor: canScrollRight ? "var(--border-focus)" : "var(--border-light)",
              bgcolor: canScrollRight ? "var(--bg-secondary)" : "transparent",
              opacity: canScrollRight ? 1 : 0.35,
              transition: "all 0.2s ease",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: "var(--bg-tertiary)" },
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 14, color: "var(--text-primary)" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable Row */}
      <Box sx={{ position: "relative" }}>
        {/* Left fade */}
        {/* {canScrollLeft && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background: "linear-gradient(to right, var(--bg-primary), transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )} */}
        {/* Right fade */}
        {canScrollRight && (
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background: "linear-gradient(to left, var(--bg-primary), transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}

        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            display: "flex",
            gap: 2.5,
            overflowX: "auto",
            pb: 1,
            px: { xs: 2, md: 0 },
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            : listings.map((item) => (
              <Box
                key={item._id}
                sx={{
                  minWidth: { xs: 230, sm: 270, md: 310 },
                  maxWidth: { xs: 230, sm: 270, md: 310 },
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                }}
              >
                <Card data={item} />
              </Box>
            ))}
        </Box>
      </Box>
    </MotionBox>
  );
};

export default SectionCarousel;
