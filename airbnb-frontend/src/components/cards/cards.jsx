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
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/wishlistProvider";
import VerifyToken from "../protected/verifyToken";
import LoginModal from "../Login/LoginModal";

const CardItem = React.memo(({ data }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [signUp, isSignUp] = useState(false);

  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isWishlisted = useMemo(
    () => wishlist.some((item) => item._id === data._id),
    [wishlist, data._id]
  );
  const [showSlider, setShowSlider] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 450,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 4500,
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
      <FavoriteIcon sx={{ color: "#e11d48" }} />
    ) : (
      <FavoriteBorderIcon />
    );

  const UnverifiedComponent = ({ handleLoginModalOpen }) => (
    <span onClick={handleLoginModalOpen}>
      <FavoriteBorderIcon />
    </span>
  );

  const totalPhotos = data?.photos?.length || 0;

  const hoverTimeout = React.useRef(null);

  const handleMouseEnter = () => {
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setShowSlider(false);
  };

  const isMobile = useMediaQuery("(max-width:1100px)");

  return (
    <>
      <Card
        onClick={() => navigate(`/rooms/${data._id}`)}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.18s ease",
          backgroundColor: "var(--bg-card)",
          "&:hover": {
            // transform: "translateY(-3px)",
            boxShadow: "var(--shadow-lg)",
          },
        }}
      >
        {/* Image Area */}
        <Box sx={{ position: "relative" }} >
          <Box sx={{ height: isMobile ? 150 : 240 }} onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => e.stopPropagation()} >
            {/* {showSlider ? ( */}
            <Slider {...settings}>
              {(data?.photos || []).map((img, index) => (
                <Box key={index} sx={{ height: isMobile ? 150 : 240 }}>
                  <img
                    src={img}
                    alt={`Photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                  />
                </Box>
              ))}
            </Slider>
            {/* ) : (
              <img
                src={data.photos?.[0]}
                style={{ width: "100%", height: 240, objectFit: "cover" }}
                loading="lazy"
              />
            )} */}
          </Box>

          {/* Wishlist Button */}
          <IconButton
            onClick={handleWishlistClick}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 5,
              width: 42,
              height: 42,
              borderRadius: 3,
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
              "&:hover": {
                backgroundColor: "var(--bg-secondary)",
              },
            }}
          >
            <VerifyToken
              VerifiedComponent={VerifiedComponent}
              UnverifiedComponent={UnverifiedComponent}
              handleLoginModalOpen={handleLoginModalOpen}
            />
          </IconButton>
          {/* Guest favourite */}
          {data?.guestFavourite && (
            <Chip
              label="Guest favourite"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 5,
                borderRadius: 999,
                fontWeight: 900,
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-light)",
              }}
            />
          )}

          {/* Photo Counter */}
          {totalPhotos > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                right: 12,
                zIndex: 5,
                px: 1.2,
                py: 0.6,
                borderRadius: 999,
                fontSize: "12px",
                fontWeight: 900,
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
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
                bottom: 10,
                left: 10,
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "var(--bg-card)",
                borderRadius: "8px",
                px: 1.5,
                py: 2.5,
                boxShadow: 1,
                cursor: "pointer",
                transform: "perspective(600px) rotateY(0deg)",
                transformOrigin: "left center",
                transition: "transform 0.5s ease",
                "&:hover": {
                  transform: "perspective(200px) rotateY(-20deg)",
                },
              }}
            >
              <Avatar
                src={data?.hostData.photoProfile}
                alt="Host"
                sx={{ width: 40, height: 40 }}
              />
            </Box>
          )}
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 2 }}>
          {/* Title + Rating */}
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography
              variant="subtitle1"
              fontWeight={900}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {data?.title}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" fontWeight={900}>
                {data?.averageRating || "New"}
              </Typography>
            </Stack>
          </Stack>

          {/* Location / small meta */}
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              mt: 0.4,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {data?.city ? `${data.city}, Pakistan` : "Pakistan"}
          </Typography>

          {/* Description (truncate) */}
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              mt: 0.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 40,
            }}
          >
            {data?.description || "Comfortable stay with great amenities."}
          </Typography>
        </CardContent>
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
