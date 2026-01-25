import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";

import CssBaseline from '@mui/material/CssBaseline';
import { Box } from "@mui/material";

const Navbar = lazy(() => import("../components/navbar/navbar"));
const Sidebar = lazy(() => import("../components/sidebar/sidebar"));
const DashBoard = lazy(() => import("../pages/dashBoard/dashboard"));
const NotFound = lazy(() => import("../components/notFound/notFound"));
const AddProducts = lazy(() => import("../pages/addProducts/addProducts"));
const Body = lazy(() => import("../components/main/main"));
const AllProducts = lazy(() => import("../pages/allProducts/allProducts"));
const EditProductPage = lazy(() => import("../pages/editProduct/editProduct"));
const Listings = lazy(() => import("../pages/orderDetails/orderDetails"));
const ListingDetails = lazy(() => import("../components/orders/orders"));
const CNICVerification = lazy(() => import("../pages/cnicVerification/cnicVerification"));
const UserVerification = lazy(() => import("../pages/userVerification/UserVerification"));

import "../assets/styles/mainScreen.css";

const MainScreen = () => {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <Box sx={{ display: 'flex', width: "100%" }}>
      <CssBaseline />
      <Navbar open={open} handleDrawerOpen={handleDrawerOpen} />
      <div style={{ width: "95%", margin: "0 auto" }}>
        <div>
          <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
        </div>
        <div>
          <Routes>
            {/* DashBoard Route */}
            {/* <Route path="/" element={<Body open={open} body={<DashBoard />}/>} /> */}

            {/* Listings Route */}
            <Route path="/" element={<Body open={open} body={<Listings />} />} />

            {/* Listing Details Route */}
            <Route path="/listing/:listingId" element={<Body open={open} body={<ListingDetails />} />} />

            {/* cnic-verification Route */}
            <Route path="/cnic-verification" element={<Body open={open} body={<CNICVerification />} />} />

            {/* user-verification Route */}
            <Route path="/user-verification" element={<Body open={open} body={<UserVerification />} />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Box>
  );
};

export default MainScreen;
