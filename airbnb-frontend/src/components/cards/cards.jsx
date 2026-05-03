import React, { useCallback, useMemo, useState } from "react";
import Slider from "react-slick";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/wishlistProvider";
import VerifyToken from "../protected/verifyToken";
import LoginModal from "../Login/LoginModal";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../language/Localization";

const CardItem = React.memo(({ data }) => {
  const { t } = useTranslation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [signUp, isSignUp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isWishlisted = useMemo(
    () => wishlist.some((item) => item._id === data._id),
    [wishlist, data._id]
  );

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 400,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      arrows: false,
      beforeChange: (_, next) => setActiveSlide(next),
    }),
    []
  );

  const handleWishlistClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (isWishlisted) removeFromWishlist(data._id);
      else addToWishlist(data);
    },
    [data, isWishlisted, addToWishlist, removeFromWishlist]
  );

  const handleLoginModalOpen = () => {
    isSignUp(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    navigate("/");
  };

  const VerifiedComponent = () =>
    isWishlisted ? (
      <FavoriteIcon sx={{ color: "#FF385C", fontSize: 18 }} />
    ) : (
      <FavoriteBorderIcon sx={{ fontSize: 18, color: "#fff" }} />
    );

  const UnverifiedComponent = ({ handleLoginModalOpen }) => (
    <span onClick={handleLoginModalOpen}>
      <FavoriteBorderIcon sx={{ fontSize: 18, color: "#fff" }} />
    </span>
  );

  const totalPhotos = data?.photos?.length || 0;
  const isMobile = useMediaQuery("(max-width:1100px)");
  const isRTL = useRTL();
  const imgHeight = isMobile ? 180 : 220;

  return (
    <>
      <Card
        onClick={() => navigate(`/rooms/${data._id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: isHovered ? "rgba(255,56,92,0.2)" : "var(--border-light)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "var(--bg-card)",
          boxShadow: isHovered
            ? "0 20px 50px rgba(0,0,0,0.14)"
            : "0 2px 12px rgba(0,0,0,0.06)",
          transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        }}
      >
        {/* Image Area */}
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <Box
            sx={{
              height: imgHeight,
              overflow: "hidden",
              "& .slick-slider, & .slick-list, & .slick-track": {
                height: "100%",
              },
              "& .slick-slide > div": { height: "100%" },
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Slider {...settings}>
              {(data?.photos || []).map((img, index) => (
                <Box key={index} sx={{ height: imgHeight }}>
                  <Box
                    component="img"
                    src={img}
                    alt={`Photo ${index + 1}`}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transform: isHovered ? "scale(1.06)" : "scale(1)",
                      transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </Box>
              ))}
            </Slider>
          </Box>

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Top Overlay: Rating + Location */}
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              [isRTL ? "right" : "left"]: 12,
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ fontSize: 13, color: "#FFD700" }} />
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{ color: "#fff", fontSize: "0.78rem", lineHeight: 1 }}
              >
                {data?.averageRating || t("listing:new")}
                {data?.reviewCount ? (
                  <span style={{ fontWeight: 500, opacity: 0.85 }}>
                    {" "}({data.reviewCount})
                  </span>
                ) : null}
              </Typography>
            </Stack>
            {data?.city && (
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                📍 {data.city}, PK
              </Typography>
            )}
          </Box>

          {/* Wishlist Button — Top Right */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              [isRTL ? "left" : "right"]: 10,
              zIndex: 5,
            }}
          >
            <IconButton
              onClick={handleWishlistClick}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.25s ease",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.55)",
                  transform: "scale(1.12)",
                },
                "&:active": { transform: "scale(0.92)" },
              }}
            >
              <VerifyToken
                VerifiedComponent={VerifiedComponent}
                UnverifiedComponent={UnverifiedComponent}
                handleLoginModalOpen={handleLoginModalOpen}
              />
            </IconButton>
          </Box>

          {/* Guest Favourite Badge — Top Left */}
          {data?.guestFavourite && (
            <Chip
              label={t("listing:guestFavourite")}
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                [isRTL ? "right" : "left"]: 10,
                zIndex: 5,
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "0.7rem",
                color: "#222",
                bgcolor: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                "& .MuiChip-label": { px: 1.2 },
              }}
            />
          )}

          {/* 360 Badge */}
          {data?.image360 && (
            <Chip
              label={t("listing:available360")}
              size="small"
              sx={{
                position: "absolute",
                top: data?.guestFavourite ? 44 : 10,
                [isRTL ? "right" : "left"]: 10,
                zIndex: 5,
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "0.7rem",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(4px)",
              }}
            />
          )}

          {/* Photo Counter */}
          {totalPhotos > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 10,
                [isRTL ? "left" : "right"]: 10,
                zIndex: 5,
                px: 1,
                py: 0.4,
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 800,
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {activeSlide + 1}/{totalPhotos}
            </Box>
          )}

          {/* Host Avatar */}
          {data?.hostData && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                if (data?.hostData?._id) {
                  navigate(`/profile/host/${data.hostData._id}`);
                }
              }}
              sx={{
                position: "absolute",
                bottom: 38,
                [isRTL ? "right" : "left"]: 10,
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                backgroundColor: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(6px)",
                borderRadius: "8px",
                px: 1,
                py: 0.5,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
              }}
            >
              <Avatar
                src={data?.hostData.photoProfile}
                alt="Host"
                sx={{ width: 26, height: 26 }}
              />
            </Box>
          )}
        </Box>

        {/* Card Content */}
        <RTLWrapper sx={{ p: { xs: 1.5, md: 2 } }}>
          {/* Title Row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: "var(--text-primary)",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              {data?.title}
            </Typography>

            {/* Verified badge */}
            {data?.verified && (
              <VerifiedIcon
                sx={{ fontSize: 18, color: "#0066FF", flexShrink: 0, mt: 0.2 }}
              />
            )}
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              fontSize: "0.78rem",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {data?.description || "Comfortable stay with great amenities."}
          </Typography>

          {/* Price Row */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            {data?.pricePerNight ? (
              <>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  PKR {Number(data.pricePerNight).toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.75rem" }}
                >
                  / night
                </Typography>
              </>
            ) : null}
          </Box>
        </RTLWrapper>
      </Card>

      {/* Login Modal */}
      <span onClick={(e) => e.stopPropagation()}>
        {isLoginModalOpen && (
          <LoginModal
            open={isLoginModalOpen}
            onClose={handleLoginModalClose}
            signUp={signUp}
            isSignUp={isSignUp}
          />
        )}
      </span>
    </>
  );
});

export default CardItem;
