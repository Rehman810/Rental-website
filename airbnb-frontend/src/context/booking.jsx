import React, { createContext, useState, useContext, useEffect } from "react";

const BookingContext = createContext();

export const useBookingContext = () => {
  return useContext(BookingContext);
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState(() => {
    try {
      const saved = localStorage.getItem("bookingData");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [bookListing, setBookListing] = useState(() => {
    try {
      const saved = localStorage.getItem("bookListing");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [checkingOut, setCheckingOut] = useState()
  const [pendingBooking, setPendingBooking] = useState()
  const [upcoming, setUpcoming] = useState()
  const [currentlyHosting, setCurrentlyHosting] = useState()
  const [confirmedBookings, setConfirmedBookings] = useState(0);

  useEffect(() => {
    if (bookingData && Object.keys(bookingData).length > 0) {
      localStorage.setItem("bookingData", JSON.stringify(bookingData));
    } else {
      localStorage.removeItem("bookingData");
    }
  }, [bookingData]);

  useEffect(() => {
    if (bookListing && Object.keys(bookListing).length > 0) {
      localStorage.setItem("bookListing", JSON.stringify(bookListing));
    } else {
      localStorage.removeItem("bookListing");
    }
  }, [bookListing]);

  const resetBookingState = () => {
    setBookingData({});
    setBookListing({});
    localStorage.removeItem("bookingData");
    localStorage.removeItem("bookListing");
  };

  const value = {
    resetBookingState,
    bookListing,
    bookingData,
    setBookingData,
    setBookListing,
    checkingOut,
    setCheckingOut,
    currentlyHosting,
    setCurrentlyHosting,
    pendingBooking,
    setPendingBooking,
    upcoming,
    setUpcoming,
    confirmedBookings,
    setConfirmedBookings
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

