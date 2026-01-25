import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Avatar,
  MenuItem,
  TextField,
  Menu,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  Rating,
  Paper,
  Stack,
  Chip,
} from "@mui/material";

import { DatePicker } from "antd";
import "antd/dist/reset.css";

import LeafletMap from "../map/map";
import HostSection from "../hostSection/hostSection";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDataById } from "../../config/ServiceApi/serviceApi";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import useDocumentTitle from "../../hooks/dynamicTitle/dynamicTitle";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useBookingContext } from "../../context/booking";
import ShareIcon from "@mui/icons-material/Share";
import toast from "react-hot-toast";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import GroupIcon from "@mui/icons-material/Group";
import HotelIcon from "@mui/icons-material/Hotel";
import ArrowForwardIcon2 from "@mui/icons-material/ArrowForward";

import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import Tooltip from "@mui/material/Tooltip";
import ReviewsSection from "../../components/reviews/ReviewsSection";

const { RangePicker } = DatePicker;

const MemoizedHostSection = React.memo(HostSection);
const MemoizedLeafletMap = React.memo(LeafletMap);

const RoomPage = () => {
  const [place, setPlace] = useState({});
  const [host, setHost] = useState({});
  const [dates, setDates] = useState(null);
  const [openShareModal, setOpenShareModal] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `Check out this place: ${place?.title || "Listing"}`;

  const [maxGuests, setMaxGuests] = useState(1);
  const [bookedDates, setBookedDates] = useState([]);
  const [weekDayPrice, setWeekdayPrice] = useState(0);
  const [weekendDayPrice, setWeekenddayPrice] = useState(0);

  const serviceFeePercentage = 13;

  const [totalPrice, setTotalPrice] = useState(0);
  const [numofDays, setNumofDays] = useState(0);

  const [guestsAnchorEl, setGuestsAnchorEl] = useState(null);
  const openGuestsMenu = (event) => setGuestsAnchorEl(event.currentTarget);
  const closeGuestsMenu = () => setGuestsAnchorEl(null);

  const [guests, setGuests] = useState({ adults: 0 });

  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingText, setLoadingText] = useState(true);

  const [openImageModal, setOpenImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { setBookingData, setBookListing } = useBookingContext();
  const { roomId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);

  const toPascalCase = (str) => {
    return str
      ?.split(" ")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      ?.join(" ");
  };

  useDocumentTitle(place?.title ? toPascalCase(place.title) : "Airbnb");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetchDataById("listing", token, roomId);

        if (response?.listing) {
          setPlace(response.listing);
          setHost(response.hostData);

          setMaxGuests(response.listing.guestCapacity);

          setBookedDates(
            response.listing.bookings.map((booking) => ({
              startDate: dayjs(booking.startDate),
              endDate: dayjs(booking.endDate),
            }))
          );

          setWeekdayPrice(response.listing.weekdayPrice);
          setWeekenddayPrice(response.listing.weekendPrice);

          setLoadingText(false);
        }
      } catch (error) {
        console.error("Failed to fetch listing:", error);
      }
    };
    fetchOptions();
  }, [roomId, token]);

  const handleOpenModal = () => {
    setCurrentImageIndex(0);
    setOpenImageModal(true);
  };

  const handleCloseModal = () => setOpenImageModal(false);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev + 1 < (place?.photos?.length || 0) ? prev + 1 : 0
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : (place?.photos?.length || 1) - 1
    );
  };

  const incrementGuest = (type) => {
    if (guests[type] < maxGuests) {
      setGuests((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    }
  };

  const decrementGuest = (type) => {
    if (guests[type] > 0) {
      setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
    }
  };

  const handleDateChange = (value) => {
    if (value && value[0]) {
      setSelectedStartDate(value[0]);
      setSelectedDates(value);
    } else {
      setSelectedStartDate(null);
      setSelectedDates(null);
    }
  };

  const handleOpenShare = () => setOpenShareModal(true);
  const handleCloseShare = () => setOpenShareModal(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    } catch (error) {
      toast.error("Copy failed");
    }
  };

  const openNewTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

  const handleShareWhatsApp = () => {
    openNewTab(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
  };

  const handleShareFacebook = () => {
    openNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const handleShareTwitter = () => {
    openNewTab(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
  };

  const handleShareEmail = () => {
    openNewTab(`mailto:?subject=${encodeURIComponent("Check this out")}&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
  };

  const handleShareInstagram = async () => {
    await handleCopyLink();
    openNewTab("https://www.instagram.com/");
  };


  const handleDateChange2 = (value) => {
    setDates(value);

    if (value && value.length === 2) {
      const startDate = value[0];
      const endDate = value[1];

      let total = 0;
      const numOfDays = endDate.diff(startDate, "days");
      setNumofDays(numOfDays);

      for (let date = startDate; date.isBefore(endDate, "day"); date = date.add(1, "day")) {
        if (date.day() === 0 || date.day() === 6) total += weekendDayPrice;
        else total += weekDayPrice;
      }

      setTotalPrice(total);
    }
  };

  const disabledDate = (current) => {
    if (!current) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (current < today) return true;

    const currentDate = dayjs(current).startOf("day");

    for (let booked of bookedDates) {
      const bookedStart = dayjs(booked.startDate).startOf("day");
      const bookedEnd = dayjs(booked.endDate).startOf("day");

      if (selectedStartDate) {
        const selectedStart = dayjs(selectedStartDate).startOf("day");
        if (selectedStart < bookedStart) {
          if (currentDate >= bookedStart || currentDate < selectedStart) return true;
        }
        if (selectedStart > bookedEnd) {
          if (currentDate >= bookedStart && currentDate <= bookedEnd) return true;
        }
      }

      if (currentDate >= bookedStart && currentDate <= bookedEnd) return true;
    }
    return false;
  };

  const clearDates = () => {
    setSelectedStartDate(null);
    setSelectedDates(null);
    setDates(null);
    setTotalPrice(0);
    setNumofDays(0);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    const formatted = [address?.city].filter(Boolean).join(", ");
    return formatted ? `${formatted}, Pakistan` : "Address not available";
  };

  const handleImageLoad = () => setLoadingImages(false);

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied!"))
      .catch((error) => toast.error(error.message));
  };

  const serviceFee = useMemo(() => {
    return (totalPrice * serviceFeePercentage) / 100;
  }, [totalPrice]);

  const grandTotal = useMemo(() => {
    return totalPrice + serviceFee;
  }, [totalPrice, serviceFee]);

  const isReserveDisabled = useMemo(() => {
    return !dates || dates?.length < 2 || !guests?.adults;
  }, [dates, guests]);

  const handleReserve = async () => {
    if (!dates || dates.length < 2) {
      Swal.fire({
        icon: "error",
        title: "Select dates",
        text: "Please select check-in and check-out dates.",
      });
      return;
    }

    if (!guests.adults) {
      Swal.fire({
        icon: "error",
        title: "Select guests",
        text: "Please select number of guests.",
      });
      return;
    }

    const [startDate, endDate] = dates;

    const data = {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      guestCapacity: guests.adults,
      priceForHouse: totalPrice,
      serviceFee: serviceFee.toFixed(2),
      nights: numofDays,
      total: grandTotal.toFixed(2),
    };

    setBookListing(place);
    setBookingData(data);
    navigate(`/user/requestToBook/${place._id}`);
  };

  const ShareTile = ({ icon, label, onClick }) => {
    return (
      <Button
        onClick={onClick}
        fullWidth
        variant="outlined"
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 900,
          py: 1.4,
          display: "flex",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {icon}
        {label}
      </Button>
    );
  };


  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 2.5,
        }}
      >
        <Dialog
          open={openShareModal}
          onClose={handleCloseShare}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 0.5,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pb: 1,
            }}
          >
            Share this listing
            <IconButton onClick={handleCloseShare}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose how you want to share this place.
            </Typography>

            <Grid container spacing={1.5}>
              {/* Copy Link */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyLink}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 900,
                    py: 1.2,
                  }}
                >
                  Copy Link
                </Button>
              </Grid>

              {/* WhatsApp */}
              <Grid item xs={6}>
                <ShareTile
                  icon={<WhatsAppIcon />}
                  label="WhatsApp"
                  onClick={handleShareWhatsApp}
                />
              </Grid>

              {/* Facebook */}
              <Grid item xs={6}>
                <ShareTile
                  icon={<FacebookIcon />}
                  label="Facebook"
                  onClick={handleShareFacebook}
                />
              </Grid>

              {/* Twitter */}
              <Grid item xs={6}>
                <ShareTile
                  icon={<TwitterIcon />}
                  label="Twitter / X"
                  onClick={handleShareTwitter}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={6}>
                <ShareTile
                  icon={<EmailIcon />}
                  label="Email"
                  onClick={handleShareEmail}
                />
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseShare}
              variant="text"
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box>
            {loadingText ? (
              <Skeleton variant="text" width={320} height={40} animation="wave" />
            ) : (
              <Typography variant="h5" fontWeight={900}>
                {toPascalCase(place?.title)}
              </Typography>
            )}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
              <Chip
                icon={<LocationOnIcon />}
                label={formatAddress(place)}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                icon={<GroupIcon />}
                label={`${place?.guestCapacity || 0} guests`}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                icon={<BedIcon />}
                label={`${place?.bedrooms || 0} bedrooms`}
                size="small"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                icon={<HotelIcon />}
                label={`${place?.guestCapacity || 0} beds`}
                size="small"
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Box>

          <Button
            onClick={handleOpenShare}
            startIcon={<ShareIcon />}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Share
          </Button>
        </Stack>
      </Paper>

      {/* Image Gallery */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "relative",
          mb: 3,
        }}
      >
        <Grid container spacing={0} onClick={handleOpenModal} sx={{ cursor: "pointer" }}>
          <Grid item xs={12} md={6}>
            {loadingImages && (
              <Skeleton variant="rectangular" width="100%" height={460} animation="wave" />
            )}
            <CardMedia
              component="img"
              height="460"
              image={place?.photos?.[0] || "/fallback-image.jpg"}
              alt="Main"
              onLoad={handleImageLoad}
              loading="lazy"
              sx={{
                width: "100%",
                objectFit: "cover",
                transition: "all 0.25s ease",
                "&:hover": { transform: "scale(1.01)" },
              }}
              onError={(e) => (e.target.src = "/fallback-image.jpg")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={0}>
              {(loadingImages ? Array.from({ length: 4 }) : place?.photos?.slice(1, 5)).map((photo, index) => (
                <Grid item xs={6} key={index}>
                  {loadingImages ? (
                    <Skeleton variant="rectangular" width="100%" height={230} animation="wave" />
                  ) : (
                    <CardMedia
                      component="img"
                      height="230"
                      image={photo || "/fallback-image.jpg"}
                      alt={`Photo ${index + 1}`}
                      loading="lazy"
                      sx={{
                        width: "100%",
                        objectFit: "cover",
                        borderLeft: "1px solid rgba(0,0,0,0.06)",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        transition: "all 0.25s ease",
                        "&:hover": { transform: "scale(1.01)" },
                      }}
                      onError={(e) => (e.target.src = "/fallback-image.jpg")}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon2 />}
          sx={{
            position: "absolute",
            right: 14,
            bottom: 14,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 900,
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
        >
          View all photos
        </Button>
      </Paper>

      {/* Fullscreen Gallery Modal */}
      <Dialog fullScreen open={openImageModal} onClose={handleCloseModal}>
        <DialogContent
          sx={{
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 16, right: 16, color: "white" }}
            onClick={handleCloseModal}
          >
            <CloseIcon />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              color: "white",
              transform: "translateY(-50%)",
            }}
            onClick={handlePreviousImage}
          >
            <ArrowBackIcon />
          </IconButton>

          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              color: "white",
              transform: "translateY(-50%)",
            }}
            onClick={handleNextImage}
          >
            <ArrowForwardIcon />
          </IconButton>

          <img
            src={place?.photos?.[currentImageIndex] || "/fallback-image.jpg"}
            alt={`Image ${currentImageIndex + 1}`}
            style={{
              width: "82%",
              maxWidth: "1100px",
              borderRadius: "12px",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Main Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={900}>
              {place?.roomType || "Room"} in {formatAddress(place)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              <b>{place?.guestCapacity || 0}</b> guests •{" "}
              <b>{place?.guestCapacity || 0}</b> beds •{" "}
              <b>{place?.bedrooms || 0}</b> bedrooms
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={900}>
              About this place
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, lineHeight: 1.8 }}>
              {place?.description || "No description available."}
            </Typography>
          </Paper>

          {/* Reviews Section */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ReviewsSection listingId={roomId} currentUser={JSON.parse(localStorage.getItem('user'))} listingHostId={place?.hostId?._id || place?.hostId} />
          </Paper>
        </Grid>

        {/* Right Column - Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              position: { md: "sticky" },
              top: { md: 120 },
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              {/* Price */}
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: "primary.main" }}>
                  Rs {weekDayPrice}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / night
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                  Weekends may have different pricing.
                </Typography>
              </Box>

              {/* Date Picker */}
              <Box>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
                  Dates
                </Typography>

                <RangePicker
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                  placeholder={["Check-in", "Check-out"]}
                  onCalendarChange={handleDateChange}
                  onChange={handleDateChange2}
                  disabledDate={disabledDate}
                  format="DD MMM, YYYY"
                  value={selectedDates}
                />

                <Button
                  variant="text"
                  onClick={clearDates}
                  sx={{ textTransform: "none", fontWeight: 800, px: 0 }}
                >
                  Clear dates
                </Button>
              </Box>

              {/* Guests */}
              <Box>
                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
                  Guests
                </Typography>

                <Box
                  onClick={openGuestsMenu}
                  sx={{
                    cursor: "pointer",
                    p: 1.2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography fontWeight={900} variant="body2">
                    {guests.adults ? `${guests.adults} guest(s)` : "Select guests"}
                  </Typography>

                  <Box sx={{ flex: 1 }} />

                  <Typography variant="body2" color="text.secondary">
                    Max {maxGuests}
                  </Typography>
                </Box>

                <Menu
                  anchorEl={guestsAnchorEl}
                  open={Boolean(guestsAnchorEl)}
                  onClose={closeGuestsMenu}
                >
                  <MenuItem disableRipple>
                    <Box sx={{ width: 260 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={900}>Adults</Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            variant="outlined"
                            onClick={() => decrementGuest("adults")}
                            disabled={guests.adults === 0}
                            sx={{ minWidth: 36, borderRadius: 2 }}
                          >
                            -
                          </Button>

                          <Typography fontWeight={900}>{guests.adults}</Typography>

                          <Button
                            variant="outlined"
                            onClick={() => incrementGuest("adults")}
                            disabled={guests.adults === maxGuests}
                            sx={{ minWidth: 36, borderRadius: 2 }}
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        Maximum allowed guests: {maxGuests}
                      </Typography>
                    </Box>
                  </MenuItem>
                </Menu>
              </Box>

              <Divider />

              {/* Price Breakdown */}
              <Stack spacing={1}>
                <Row label={`Total for ${numofDays || 0} night(s)`} value={`Rs ${totalPrice.toFixed(2)}`} />
                <Row label={`Service fee (${serviceFeePercentage}%)`} value={`Rs ${serviceFee.toFixed(2)}`} />
              </Stack>

              <Divider />

              <Row
                label={<Typography fontWeight={900}>Total</Typography>}
                value={<Typography fontWeight={900}>Rs {grandTotal.toFixed(2)}</Typography>}
              />

              {/* Reserve CTA */}
              <Button
                variant="contained"
                fullWidth
                disabled={isReserveDisabled}
                onClick={handleReserve}
                sx={{
                  mt: 1,
                  py: 1.4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "0 12px 30px rgba(25,118,210,0.25)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 35px rgba(25,118,210,0.35)",
                  },
                  transition: "all 0.18s ease",
                }}
              >
                Reserve
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                You won’t be charged yet.
              </Typography>

              <Typography variant="caption" color="text.secondary" textAlign="center">
                Weekdays: Mon–Thu • Weekend: Fri–Sun
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Location */}
      <Box
        elevation={0}
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
          Location
        </Typography>

        <MemoizedLeafletMap
          latitude={place.latitude ? place.latitude : 24.8607}
          longitude={place.longitude ? place.longitude : 67.0011}
        />
      </Box>

      {/* Host */}
      <Box sx={{ mt: 4 }}>
        <MemoizedHostSection data={host} listing={place} />
      </Box>
    </Box>
  );
};

const Row = ({ label, value }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800}>
        {value}
      </Typography>
    </Stack>
  );
};

export default RoomPage;
