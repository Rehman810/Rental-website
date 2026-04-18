import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "../config/ServiceApi/apiClient";
import { getAuthToken } from "../utils/cookieUtils";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [searchVisible, setSearchVisible] = useState(false);

  // Persistence Helpers
  const getSaved = (key, fallback) => {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  };

  const [placeType, setPlaceType] = useState(() => getSaved("ls_placeType", null));
  const [propertyType, setPropertyType] = useState(() => getSaved("ls_propertyType", null));
  const [address, setAddress] = useState(() => getSaved("ls_address", {}));
  const [amenties, setAmenties] = useState(() => getSaved("ls_amenties", []));
  const [guestCount, setGuestCount] = useState(() => getSaved("ls_guestCount", {}));
  const [description, setDescription] = useState(() => getSaved("ls_description", ""));
  const [title, setTitle] = useState(() => getSaved("ls_title", ""));
  const [uploadedImages, setUploadedImages] = useState([]); // Cannot persist File objects easily
  const [weekDayPrice, setWeekDayPrice] = useState(() => getSaved("ls_weekDayPrice", null));
  const [weekendPrice, setWeekEndPrice] = useState(() => getSaved("ls_weekendPrice", null));
  const [contextLatitude, setContextLatitude] = useState(() => getSaved("ls_contextLatitude", null));
  const [contextLongitude, setContextLongitude] = useState(() => getSaved("ls_contextLongitude", null));
  const [wifiPassword, setWifiPassword] = useState(() => getSaved("ls_wifiPassword", ""));
  const [checkInInstructions, setCheckInInstructions] = useState(() => getSaved("ls_checkInInstructions", ""));
  
  const [listingType, setListingType] = useState(() => getSaved("ls_listingType", 'SHORT_TERM'));
  const [leaseConfig, setLeaseConfig] = useState(() => getSaved("ls_leaseConfig", {}));
  const [saleConfig, setSaleConfig] = useState(() => getSaved("ls_saleConfig", {}));

  const [hostSettings, setHostSettings] = useState(null);

  const fetchHostSettings = async () => {
    try {
      const response = await apiClient.get('/host/settings');
      if (response.data.settings) {
        setHostSettings(response.data.settings);
      }
    } catch (error) {
      console.error("Error fetching host settings:", error);
    }
  };

  useEffect(() => {
    fetchHostSettings();
  }, []);

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
  const [langauge, setLanguage] = useState({});

  // Persistence Effect
  useEffect(() => {
    const state = {
      ls_placeType: placeType,
      ls_propertyType: propertyType,
      ls_address: address,
      ls_amenties: amenties,
      ls_guestCount: guestCount,
      ls_description: description,
      ls_title: title,
      ls_weekDayPrice: weekDayPrice,
      ls_weekendPrice: weekendPrice,
      ls_contextLatitude: contextLatitude,
      ls_contextLongitude: contextLongitude,
      ls_wifiPassword: wifiPassword,
      ls_checkInInstructions: checkInInstructions,
      ls_listingType: listingType,
      ls_leaseConfig: leaseConfig,
      ls_saleConfig: saleConfig,
    };

    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  }, [
    placeType, propertyType, address, amenties, guestCount, description,
    title, weekDayPrice, weekendPrice, contextLatitude, contextLongitude,
    wifiPassword, checkInInstructions, listingType, leaseConfig, saleConfig
  ]);

  const resetListingState = () => {
    setPlaceType(null);
    setPropertyType(null);
    setAddress({});
    setAmenties([]);
    setGuestCount({});
    setDescription("");
    setTitle("");
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

    // Clear persistence keys
    const keys = [
      "ls_placeType", "ls_propertyType", "ls_address", "ls_amenties",
      "ls_guestCount", "ls_description", "ls_title", "ls_weekDayPrice",
      "ls_weekendPrice", "ls_contextLatitude", "ls_contextLongitude",
      "ls_wifiPassword", "ls_checkInInstructions", "ls_listingType",
      "ls_leaseConfig", "ls_saleConfig", "listing_activeStep"
    ];
    keys.forEach(key => localStorage.removeItem(key));
  };



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
    setLanguage,
    hostSettings,
    fetchHostSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
