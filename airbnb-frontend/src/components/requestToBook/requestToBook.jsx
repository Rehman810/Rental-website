import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Button,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { postDataById } from "../../config/ServiceApi/serviceApi";
import { useBookingContext } from "../../context/booking";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const BookingComponent = () => {
  const { bookListing, bookingData } = useBookingContext();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!stripe || !elements) return false;
    return true;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString("en-US", { month: "short" });
    const endMonth = end.toLocaleString("en-US", { month: "short" });

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
  };

  const handleReserve = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    let errorMessage = "";

    if (!user?.phoneNumber && !user?.photoProfile) {
      errorMessage =
        "Please add your phone number and upload a profile photo to proceed with the booking.";
    } else if (!user?.phoneNumber) {
      errorMessage =
        "Please add your phone number to proceed with the booking.";
    } else if (!user?.photoProfile) {
      errorMessage =
        "Please upload a profile photo to proceed with the booking.";
    }

    if (errorMessage) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: errorMessage,
      });
      return;
    }

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Stripe Not Loaded",
        text: "Please wait for the payment gateway to load.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        startDate: bookingData?.startDate,
        endDate: bookingData?.endDate,
        guestCapacity: bookingData?.guestCapacity,
      };

      // 1. Create Booking (Temporary) & Get Client Secret
      const response = await postDataById(
        "create-bookings",
        data,
        token,
        roomId
      );

      if (response && response.clientSecret) {
        const cardElement = elements.getElement(CardElement);

        // 2. Confirm Payment Intent
        const { error, paymentIntent } = await stripe.confirmCardPayment(response.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.userName || "Guest",
              email: user?.email,
            },
          },
        });

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Payment Error",
            text: error.message,
          });
        } else if (paymentIntent.status === "succeeded") {
          Swal.fire({
            icon: "success",
            title: "Booking Confirmed",
            text: "Payment successful! Your booking is confirmed.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error during booking/payment:", error);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Request to book
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Pay with Card
          </Typography>
          <Box mt={2}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </Box>

          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold">
              Your trip
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight={"bold"}>
                  Dates
                </Typography>
                <Typography variant="subtitle1">
                  {formatDateRange(
                    bookingData?.startDate,
                    bookingData?.endDate
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight={"bold"}>
                  Guests
                </Typography>
                <Typography variant="subtitle1">
                  {bookingData?.guestCapacity}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold">
              Required for your trip
            </Typography>

            <Box mt={2}>
              <Box mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Message the host
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Before you can continue, let Michelle know a little about your
                  trip and why their place is a good fit.
                </Typography>
              </Box>

              <Box textAlign="right">
                <Button variant="outlined" sx={{ mb: 2 }}>
                  Add
                </Button>
              </Box>

              {!user?.phoneNumber && (
                <>
                  <Box mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Phone Number
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add and confirm your phone number to get trip updates
                    </Typography>
                  </Box>

                  <Box textAlign="right">
                    <Button
                      variant="outlined"
                      sx={{ mb: 2 }}
                      onClick={() => navigate("/user/profile")}
                    >
                      Add
                    </Button>
                  </Box>
                </>
              )}
              {!user?.photoProfile && (
                <>
                  <Box mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Profile photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hosts want to know who’s staying at their place.
                    </Typography>
                  </Box>

                  <Box textAlign="right">
                    <Button
                      variant="outlined"
                      sx={{ mb: 2 }}
                      onClick={() => navigate("/user/profile")}
                    >
                      Add
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <Box mt={4}>
            <Typography variant="body2" color="text.secondary">
              Cancellation policy: This reservation is non-refundable.
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: "sticky",
              top: 100,
            }}
          >
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={
                  bookListing?.photos
                    ? bookListing?.photos[0]
                    : "https://via.placeholder.com/300"
                }
                alt="Luxury Pool Villa"
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {bookListing?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookListing?.roomType}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Grid container justifyContent="space-between">
                    <Typography variant="body2">
                      For {bookingData?.nights} nights
                    </Typography>
                    <Typography variant="body2">
                      Rs {bookingData?.priceForHouse}
                    </Typography>
                  </Grid>
                  <Grid container justifyContent="space-between">
                    <Typography variant="body2">Service fee</Typography>
                    <Typography variant="body2">
                      Rs {bookingData?.serviceFee}
                    </Typography>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Grid container justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total (PKR)
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Rs {bookingData.total}
                    </Typography>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            mt: 3,
            padding: "10px",
            fontWeight: "bold",
            letterSpacing: 1,
            textTransform: "uppercase",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            marginBottom: "10px",
          }}
          size="small"
          onClick={handleReserve}
        //   disabled={!!errors.cardNumber || !!errors.expiration || !!errors.cvv}
        >
          Request to Book
        </Button>
        <br />
        <Typography variant="caption" textAlign="center">
          <b>
            Your reservation won’t be confirmed until the Host accepts your
            request (within 24 hours).
          </b>{" "}
          You won’t be charged until then.
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingComponent;
