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
const Payments = lazy(() => import("../../pages/payments/payments"));
const HostSettings = lazy(() => import("../../pages/hostSettings/HostSettings"));
const HostBookings = lazy(() => import("../../pages/hostBookings/HostBookings"));

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

          {/* Host Bookings List Page */}
          <Route path="/bookings" element={<HostBookings />} />

          {/* Messages Page */}
          <Route path="/messages" element={<Messages />} />

          {/* Payments Page */}
          <Route path="/payments" element={<Payments />} />

          {/* Settings Page */}
          <Route path="/settings" element={<HostSettings />} />
        </Routes>
      </div>
      {!isMessage && (
        <Footer />
      )}
    </>
  );
};

export default Hosts;
