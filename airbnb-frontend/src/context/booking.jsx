import React, { createContext, useState, useContext } from "react";

const BookingContext = createContext();

export const useBookingContext = () => {
  return useContext(BookingContext);
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({});
  const [bookListing, setBookListing] = useState({});
  const [checkingOut, setCheckingOut] = useState()
  const [pendingBooking, setPendingBooking] = useState()
  const [upcoming, setUpcoming] = useState()
  const [currentlyHosting, setCurrentlyHosting] = useState()
  const [confirmedBookings, setConfirmedBookings] = useState(0);

  const resetBookingState = () => {
    setBookingData({});
    setBookListing({});
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
