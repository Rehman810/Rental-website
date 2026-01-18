import React, { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

const NavbarHost = lazy(() => import("../../components/navbar/navbar2"));
const HostBookingsCalendar = lazy(() =>
  import("../../pages/calendar/calendar")
);
const Messages = lazy(() => import("../../pages/messages/messages"));
const Footer = lazy(() => import("../../components/footer/footer"));
const Today = lazy(() => import("../../pages/today/today"));
const Listings = lazy(() => import("../../pages/listings/listings"));

const Hosts = () => {
    const location = useLocation();
  const isMessage = location.pathname.includes("messages");

  return (
    <>
      <NavbarHost />
      <div style={{ minHeight: "22vh" }}>
        <Routes>
          {/* Hosting Page */}
          <Route path="/today" element={<Today />} />

          {/* Listing Page */}
          <Route path="/listings" element={<Listings />} />

          {/* Host Bookings Calendar Page */}
          <Route path="/calendar" element={<HostBookingsCalendar />} />

          {/* Messages Page */}
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
      {!isMessage && (
      <Footer />
    )}
    </>
  );
};

export default Hosts;
