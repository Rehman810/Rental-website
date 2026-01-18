import React, { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import { fetchData } from "../../config/ServiceApi/serviceApi";
import dayjs from "dayjs";

const HostBookingsCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetchData("confirmed-booking-dates", token);

        const formattedBookings = (response?.bookingDates || []).map((booking) => {
          const guestName =
            booking?.guestData?.name?.replace(/^5a/, "")?.trim() || "Guest";

          // FullCalendar end date is exclusive in all-day events,
          // so add 1 day to make the booking range visually correct.
          const start = booking?.startDate;
          const endExclusive = booking?.endDate
            ? dayjs(booking.endDate).add(1, "day").format("YYYY-MM-DD")
            : booking?.endDate;

          return {
            title: guestName,
            start,
            end: endExclusive,
            allDay: true,
          };
        });

        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const totalBookings = useMemo(() => bookings?.length || 0, [bookings]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={900}>
              Bookings Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track confirmed reservations at a glance • {totalBookings} bookings
            </Typography>
          </Stack>
        </Box>

        <Divider />

        {/* Calendar Body */}
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {loading ? (
            <Box
              sx={{
                minHeight: 420,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading calendar data...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                "& .fc": {
                  fontFamily: "inherit",
                },

                // toolbar
                "& .fc-toolbar": {
                  flexWrap: "wrap",
                  gap: 1,
                  marginBottom: 2,
                },
                "& .fc-toolbar-title": {
                  fontSize: "1.1rem",
                  fontWeight: 900,
                },

                // buttons
                "& .fc .fc-button": {
                  borderRadius: "12px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  color: "#111",
                  fontWeight: 800,
                  padding: "8px 12px",
                  textTransform: "capitalize",
                  boxShadow: "none",
                },
                "& .fc .fc-button:hover": {
                  background: "#f5f5f5",
                },
                "& .fc .fc-button-primary:not(:disabled).fc-button-active": {
                  background: "#111",
                  color: "#fff",
                  borderColor: "#111",
                },

                // day cells
                "& .fc .fc-daygrid-day-frame": {
                  borderRadius: "14px",
                },

                // event chip style
                "& .fc .fc-daygrid-event": {
                  borderRadius: "999px",
                  padding: "4px 8px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "#111",
                  fontWeight: 800,
                  overflow: "hidden",
                },

                // remove default blue background
                "& .fc .fc-event-main": {
                  color: "#111",
                },
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={bookings}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek,dayGridDay",
                }}
                height="auto"
                eventContent={(eventInfo) => {
                  const title = eventInfo.event.title || "Booking";
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          bgcolor: "rgba(0,0,0,0.15)",
                          color: "#111",
                        }}
                      >
                        {title.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 120,
                        }}
                      >
                        {title}
                      </Typography>
                    </Box>
                  );
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default HostBookingsCalendar;
