import React, { lazy, useEffect, useState, useMemo } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  MobileStepper,
  useTheme,
} from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import usePageTitle from "../../hooks/usePageTitle";
import Step1 from "../host/step1";
import PropertyType from "../host/propertyType";
import PlaceType from "../host/placeType";
// import MapLocation from "../host/location";
import AddressForm from "../host/confirmAddress";
import GuestCounter from "../host/guestCounter";
import animationData from "../../animations/step3animation.json";

import HouseIcon from "@mui/icons-material/House";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CabinIcon from "@mui/icons-material/Cabin";
import BreakfastDiningIcon from "@mui/icons-material/BreakfastDining";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import CastleIcon from "@mui/icons-material/Castle";
import BarnIcon from "@mui/icons-material/StoreMallDirectory";
import RvHookupIcon from "@mui/icons-material/RvHookup";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import WifiIcon from "@mui/icons-material/Wifi";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AcUnitIcon from "@mui/icons-material/AcUnit";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PoolIcon from "@mui/icons-material/Pool";
import HotTubIcon from "@mui/icons-material/HotTub";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import BalconyIcon from "@mui/icons-material/Balcony";
import ElevatorIcon from "@mui/icons-material/Elevator";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SecurityIcon from "@mui/icons-material/Security";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PetsIcon from "@mui/icons-material/Pets";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import WorkIcon from "@mui/icons-material/Work";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MicrowaveIcon from "@mui/icons-material/Microwave";
import CoffeeIcon from "@mui/icons-material/Coffee";
import BathtubIcon from "@mui/icons-material/Bathtub";

import ImageUploader from "../host/images";
import DescriptionInput from "../host/description";
import Pricing from "../host/pricing";
import ListingPreview from "../host/preview";
import ListingTypeSelection from "../host/listingTypeSelection";
import LeaseDetails from "../host/leaseDetails";
import SaleDetails from "../host/saleDetails";
import GenericPricing from "../host/genericPricing";
import CheckInDetails from "../host/checkInDetails";
import { ALL_AMENITIES } from "../amenities/amenitiesData";
import { useAppContext } from "../../context/context";
import { postData } from "../../config/ServiceApi/serviceApi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AddressPicker from "../map/AddressPicker";
import { useTranslation } from "react-i18next";

const GetStarted = lazy(() => import("../../components/host/getStarted"));

const propertyTypes = [
  { name: "House", icon: <HouseIcon fontSize="large" /> },
  { name: "Apartment", icon: <ApartmentIcon fontSize="large" /> },
  { name: "Shared Room", icon: <BarnIcon fontSize="large" /> },
  { name: "Bed & breakfast", icon: <BreakfastDiningIcon fontSize="large" /> },
  { name: "Boat", icon: <DirectionsBoatIcon fontSize="large" /> },
  { name: "Cabin", icon: <CabinIcon fontSize="large" /> },
  { name: "Campervan/motorhome", icon: <RvHookupIcon fontSize="large" /> },
  { name: "Casa particular", icon: <HomeWorkIcon fontSize="large" /> },
  { name: "Castle", icon: <CastleIcon fontSize="large" /> },
];



function ListingSteps() {
  const { t } = useTranslation(["listingSteps", "translation"]);
  const {
    placeType,
    propertyType,
    address,
    amenties,
    guestCount,
    description,
    title,
    uploadedImages,
    weekDayPrice,
    weekendPrice,
    resetListingState,
    contextLatitude,
    contextLongitude,

    listingType,
    leaseConfig,
    setLeaseConfig,
    saleConfig,
    setSaleConfig,
    wifiPassword,
    checkInInstructions
  } = useAppContext();

  const { resolvedTheme } = useAppTheme();

  const token = getAuthToken();
  const navigate = useNavigate();
  usePageTitle(t("createListing"));
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(() => {
    return parseInt(localStorage.getItem("listing_activeStep")) || 0;
  });
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  // Sync activeStep to localStorage
  useEffect(() => {
    localStorage.setItem("listing_activeStep", activeStep.toString());
  }, [activeStep]);


  // Helper setters for configs
  const setMonthlyRent = (val) => setLeaseConfig(prev => ({ ...prev, monthlyRent: val }));
  const setSecurityDeposit = (val) => setLeaseConfig(prev => ({ ...prev, securityDeposit: val }));
  const setSalePrice = (val) => setSaleConfig(prev => ({ ...prev, salePrice: val }));

  const steps = useMemo(() => {
    let pricingSteps = [];

    if (listingType === 'SHORT_TERM') {
      pricingSteps = [
        {
          label: t("pricing.weekday.label"),
          content: (
            <Pricing
              isWeekDay={true}
              heading={t("pricing.weekday.heading")}
              para={t("pricing.weekday.para")}
              pricing={2000}
            />
          ),
        },
        {
          label: t("pricing.weekend.label"),
          content: (
            <Pricing
              isWeekDay={false}
              heading={t("pricing.weekend.heading")}
              para={t("pricing.weekend.para")}
              pricing={3000}
            />
          ),
        }
      ];
    } else if (listingType === 'LONG_TERM') {
      pricingSteps = [
        {
          label: t("leaseDetails"),
          content: <LeaseDetails leaseConfig={leaseConfig} setLeaseConfig={setLeaseConfig} />
        },
        {
          label: t("pricing.monthlyRent.label"),
          content: (
            <GenericPricing
              value={leaseConfig?.monthlyRent || 0}
              onChange={setMonthlyRent}
              heading={t("pricing.monthlyRent.heading")}
              para={t("pricing.monthlyRent.para")}
            />
          ),
        },
        {
          label: t("pricing.securityDeposit.label"),
          content: (
            <GenericPricing
              value={leaseConfig?.securityDeposit || 0}
              onChange={setSecurityDeposit}
              heading={t("pricing.securityDeposit.heading")}
              para={t("pricing.securityDeposit.para")}
            />
          ),
        }
      ];
    } else if (listingType === 'FOR_SALE') {
      pricingSteps = [
        {
          label: t("saleDetails"),
          content: <SaleDetails saleConfig={saleConfig} setSaleConfig={setSaleConfig} />
        },
        {
          label: t("pricing.salePrice.label"),
          content: (
            <GenericPricing
              value={saleConfig?.salePrice || 0}
              onChange={setSalePrice}
              heading={t("pricing.salePrice.heading")}
              para={t("pricing.salePrice.para")}
            />
          ),
        }
      ];
    }

    return [
      { label: t("listingType.label"), content: <ListingTypeSelection /> },
      { label: t("step", { number: 1 }), content: <GetStarted /> },
      {
        label: t("step", { number: 2 }),
        content: (
          <Step1
            stepNo={1}
            title={t("step1.title")}
            description={t("step1.description")}
          />
        ),
      },
      {
        label: t("step", { number: 3 }),
        content: (
          <PropertyType
            type={propertyTypes}
            heading={t("propertyType.heading")}
          />
        ),
      },
      { label: t("step", { number: 4 }), content: <PlaceType /> },
      {
        label: t("step", { number: 5 }),
        content: <AddressPicker />,
      },
      { label: t("step", { number: 6 }), content: <AddressForm /> },
      { label: t("step", { number: 7 }), content: <GuestCounter /> },
      {
        label: t("step", { number: 8 }),
        content: (
          <Step1
            stepNo={2}
            title={t("step2.title")}
            description={t("step2.description")}
          />
        ),
      },
      {
        label: t("step", { number: 9 }),
        content: (
          <PropertyType
            type={ALL_AMENITIES}
            heading={t("amenities.heading")}
            isAmenties={true}
          />
        ),
      },
      { label: t("step", { number: 10 }), content: <ImageUploader /> },
      {
        label: t("step", { number: 11 }),
        content: (
          <DescriptionInput
            isTitle={true}
            heading={t("title.heading")}
            para={t("title.para")}
            max={32}
            placholder={t("title.placeholder")}
          />
        ),
      },
      {
        label: t("step", { number: 12 }),
        content: (
          <DescriptionInput
            heading={t("description.heading")}
            para={t("description.para")}
            max={500}
            placholder={t("description.placeholder")}
          />
        ),
      },
      {
        label: t("step", { number: 13 }),
        content: <CheckInDetails />,
      },
      {
        label: t("step", { number: 14 }),
        content: (
          <Step1
            stepNo={3}
            title={t("step3.title")}
            description={t("step3.description")}
            animation={animationData}
          />
        ),
      },
      ...pricingSteps,
      { label: t("step", { number: 16 }), content: <ListingPreview /> },
    ];
  }, [listingType, leaseConfig, saleConfig, address, uploadedImages]); // Add dependencies

  useEffect(() => {
    // Indexes shifted by +1 because of ListingTypeSelection at index 0
    if (activeStep === 6) { // Address Form (was 5)
      const { flat, city } = address || {};
      const isAddressComplete = flat && city;
      setIsNextDisabled(!isAddressComplete);
    } else if (activeStep === 10) { // Image Uploader (was 9)
      const isValid =
        uploadedImages.length >= 3 || activeStep === steps.length - 1;
      setIsNextDisabled(!isValid);
    } else {
      setIsNextDisabled(false);
    }
  }, [address, uploadedImages, guestCount, activeStep]);

  const sendDataToApi = async () => {
    const formData = new FormData();

    formData.append("listingType", listingType || "SHORT_TERM");
    formData.append("placeType", propertyType || "House");
    formData.append("roomType", placeType || "Entire Place");
    formData.append("street", address?.streetAddress || "");
    formData.append("flat", address?.flat || "");
    formData.append("city", address?.city || "");
    formData.append("town", address?.area || "");
    formData.append("postcode", address?.postcode || "");
    formData.append("latitude", contextLatitude);
    formData.append("longitude", contextLongitude);
    formData.append("guestCapacity", guestCount?.guests || 0);
    formData.append("bedrooms", guestCount?.bedrooms || 0);
    formData.append("beds", guestCount?.beds || 0);
    formData.append("amenities", amenties || []);
    formData.append("title", title || "Untitled Listing");
    formData.append("description", description || "No description provided.");
    formData.append("wifiPassword", wifiPassword || "");
    formData.append("checkInInstructions", checkInInstructions || "");

    if (listingType === 'SHORT_TERM') {
      formData.append("weekdayPrice", weekDayPrice || 0);
      formData.append("weekendPrice", weekendPrice || 0);
    } else if (listingType === 'LONG_TERM') {
      formData.append("leaseConfig", JSON.stringify(leaseConfig));
    } else if (listingType === 'FOR_SALE') {
      formData.append("saleConfig", JSON.stringify(saleConfig));
    }

    if (uploadedImages.length > 0) {
      uploadedImages.forEach((image) => {
        formData.append("photos", image.file);
      });
    }
    try {
      const response = await postData("listings", formData, true);
      Swal.fire({
        title: t("success.title"),
        text: t("success.text"),
        icon: "success",
        confirmButtonText: t("success.button"),
      }).then(() => {
        // Handle post-creation navigation/reset
        resetListingState();
        navigate("/hosting/listings");
      });
    } catch (error) {
      console.error("API Error:", error.message);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      sendDataToApi();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <Toolbar>
          <Box
            component="img"
            src={resolvedTheme === "dark" ? "/Logo-dark.png" : "/Logo-light.png"}
            alt="Logo"
            sx={{ height: 42, marginRight: 2, marginLeft: 2, objectFit: "contain" }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Button
              color="inherit"
              sx={{
                textTransform: "none",
                border: "1px solid var(--border-medium)",
                borderRadius: "20px",
                padding: "8px",
                color: "var(--text-primary)",
              }}
              onClick={() => navigate(-1)}
            >
              {t("exit")}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: "1 1 0%",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "var(--bg-secondary)",
          padding: 2,
        }}
      >
        {steps[activeStep] ? steps[activeStep].content : null}
      </Box>

      <Box
        sx={{
          boxShadow: "0px -2px 4px rgba(0,0,0,0.1)",
          padding: 2,
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <MobileStepper
          variant="progress"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={isNextDisabled}
              sx={{ color: "var(--text-primary)" }}
            >
              {activeStep === 0
                ? t("getStarted")
                : activeStep === steps.length - 1
                  ? t("finish")
                  : t("next")}
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ color: "var(--text-primary)" }}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              {t("back")}
            </Button>
          }
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        />
      </Box>
    </Box>
  );
}

export default ListingSteps;
