import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

const Protected = lazy(() => import("../../components/protected/protected"));
const ProfileSection = lazy(() => import("../../components/profile/profile"));
const GuestMessages = lazy(() => import("../../pages/messages/guestMessages"));
const GuestAllMessages = lazy(() =>
  import("../../pages/messages/guestAllMessages")
);
const Wishlist = lazy(() => import("../../pages/wishlist/wishlist"));
const RequestToBook = lazy(() =>
  import("../../components/requestToBook/requestToBook")
);
const Trips = lazy(() => import("../../pages/trips/trips"));
const TripDetails = lazy(() => import("../../pages/trips/TripDetails"));
import Help from "../../screens/help/help";
const Navbar = lazy(() => import("../../components/navbar/navbar2"));
const Footer = lazy(() => import("../../components/footer/footer"));

const Reviews = lazy(() => import("../../components/reviews/reviews"));

const CommonRoutes = () => {
  const location = useLocation();

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  const isMessage = location.pathname.includes("guestAllMessages") || location.pathname.includes("guestMessages");

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "22vh" }}>
        <Routes>
          {/* Request to Book Page */}
          <Route
            path="/requestToBook/:roomId"
            element={
              <Protected
                Component={() => (
                  <Elements stripe={stripePromise}>
                    <RequestToBook />
                  </Elements>
                )}
              />
            }
          />

          {/* Profile Page */}
          <Route
            path="/profile"
            element={<Protected Component={ProfileSection} />}
          />

          {/* Reviews Page */}
          <Route path="/reviews" element={<Protected Component={Reviews} />} />

          {/* Wishlist Page */}
          <Route
            path="/wishlist"
            element={<Protected Component={Wishlist} />}
          />

          {/* Trips Page */}
          <Route path="/trips" element={<Protected Component={Trips} />} />

          {/* Trip Details Page */}
          <Route path="/trips/:tripId" element={<Protected Component={TripDetails} />} />

          {/* Guest message to host Page */}
          <Route
            path="/guestMessages/:hostId"
            element={<Protected Component={GuestMessages} />}
          />

          {/* Guest All Messages Page */}
          <Route
            path="/guestAllMessages"
            element={<Protected Component={GuestAllMessages} />}
          />

          {/* Help Center Page */}
          <Route
            path="/help/*"
            element={<Help />}
          />
        </Routes>
      </div>
      {!isMessage && (
        <Footer />
      )}
    </>
  );
};

export default CommonRoutes;
