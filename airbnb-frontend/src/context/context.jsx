import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [placeType, setPlaceType] = useState();
  const [propertyType, setPropertyType] = useState();
  const [address, setAddress] = useState({});
  const [amenties, setAmenties] = useState([]);
  const [guestCount, setGuestCount] = useState({});
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [weekDayPrice, setWeekDayPrice] = useState();
  const [weekendPrice, setWeekEndPrice] = useState();
  const [contextLatitude, setContextLatitude] = useState();
  const [contextLongitude, setContextLongitude] = useState();
  const [wifiPassword, setWifiPassword] = useState("");
  const [checkInInstructions, setCheckInInstructions] = useState("");
  const [searchParams, setSearchParams] = useState({
    destination: "",
    checkIn: null,
    checkOut: null,
    guests: {
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    },
  });
  const [langauge, setLanguage] = useState({})

  const resetListingState = () => {
    setPlaceType(null);
    setPropertyType(null);
    setAddress({});
    setAmenties([]);
    setGuestCount({});
    setDescription("");
    setTitle("");
    setUploadedImages([]);
    setUploadedImages([]);
    setWeekDayPrice(null);
    setWeekEndPrice(null);
    setListingType('SHORT_TERM');
    setLeaseConfig({});
    setSaleConfig({});
    setContextLatitude(null);
    setContextLongitude(null);
    setWifiPassword("");
    setCheckInInstructions("");
  };

  const [listingType, setListingType] = useState('SHORT_TERM');
  const [leaseConfig, setLeaseConfig] = useState({});
  const [saleConfig, setSaleConfig] = useState({});

  const value = {
    searchVisible,
    setSearchVisible,
    guestCount,
    setGuestCount,
    description,
    setDescription,
    uploadedImages,
    setUploadedImages,
    listingType,
    setListingType,
    leaseConfig,
    setLeaseConfig,
    saleConfig,
    setSaleConfig,
    placeType,
    setPlaceType,
    propertyType,
    setPropertyType,
    address,
    setAddress,
    amenties,
    setAmenties,
    title,
    setTitle,
    weekDayPrice,
    setWeekDayPrice,
    weekendPrice,
    setWeekEndPrice,
    resetListingState,
    setContextLatitude,
    setContextLongitude,
    contextLatitude,
    contextLongitude,
    wifiPassword,
    setWifiPassword,
    checkInInstructions,
    setCheckInInstructions,
    searchParams,
    setSearchParams,
    langauge,
    setLanguage
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
