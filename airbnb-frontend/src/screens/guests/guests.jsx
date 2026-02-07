import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("../../pages/home/home"));
const Rooms = lazy(() => import("../../components/rooms/rooms"));
const Navbar = lazy(() => import("../../components/navbar/navbar"));
const Footer = lazy(() => import("../../components/footer/footer"));

const Protected = lazy(() => import("../../components/protected/protected"));
const NotificationsPage = lazy(() => import("../../pages/notifications/NotificationsPage"));

const NotFoundPage = lazy(() => import("../../components/notFound/notFound"));
const HostProfile = lazy(() => import("../../pages/profile/HostProfile"));
const GuestProfile = lazy(() => import("../../pages/profile/GuestProfile"));

const Guests = () => {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "22vh" }}>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Rooms Page */}
          <Route path="/rooms/:roomId" element={<Rooms />} />

          {/* Notifications Page */}
          <Route path="/notifications" element={<Protected Component={NotificationsPage} />} />

          {/* Profile Pages */}
          <Route path="/profile/host/:hostId" element={<HostProfile />} />
          <Route path="/profile/guest/:guestId" element={<GuestProfile />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {/* <Footer /> */}{/* Footer was outside in original, wait, it is closing Fragments */}
      <Footer />
    </>
  );
};

export default Guests;
