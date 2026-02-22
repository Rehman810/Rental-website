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

const VerificationPage = lazy(() => import("../../pages/longTerm/VerificationPage"));
const AgreementPage = lazy(() => import("../../pages/longTerm/AgreementPage"));
const RentPage = lazy(() => import("../../pages/longTerm/RentPage"));
const ApplyPage = lazy(() => import("../../pages/longTerm/ApplyPage"));

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

          {/* Long Term Rental Pages */}
          <Route path="/long-term/apply/:listingId" element={<Protected Component={ApplyPage} />} />
          <Route path="/long-term/verification/:agreementId" element={<Protected Component={VerificationPage} />} />
          <Route path="/long-term/agreement/:agreementId" element={<Protected Component={AgreementPage} />} />
          <Route path="/long-term/payments/:agreementId" element={<Protected Component={RentPage} />} />

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
