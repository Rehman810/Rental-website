import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import "../../assets/styles/navbar.css";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";

import Icon1 from "../../assets/icons/icons1.png";
import Icon2 from "../../assets/icons/icons2.png";
import Icon3 from "../../assets/icons/icons3.png";

const SearchBar = () => {
  const { t } = useTranslation();
  const { RangePicker } = DatePicker;

  const isMobile = useMediaQuery("(max-width:900px)");

  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [dates, setDates] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState("");

  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  const [whereAnchorEl, setWhereAnchorEl] = useState(null);
  const [guestsAnchorEl, setGuestsAnchorEl] = useState(null);

  const { searchVisible, setSearchVisible, setSearchParams } = useAppContext();
  const [isSearchDisabled, setIsSearchDisabled] = useState(true);

  const openWhereMenu = (event) => setWhereAnchorEl(event.currentTarget);
  const closeWhereMenu = () => setWhereAnchorEl(null);

  const openGuestsMenu = (event) => setGuestsAnchorEl(event.currentTarget);
  const closeGuestsMenu = () => setGuestsAnchorEl(null);

  const incrementGuest = (type) =>
    setGuests((prev) => ({ ...prev, [type]: prev[type] + 1 }));

  const decrementGuest = (type) =>
    setGuests((prev) => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));

  const { karachi, islamabad, lahore } = t("cities");

  const cities = useMemo(
    () => [
      { name: karachi.name, text: karachi.text, icon: Icon1 },
      { name: islamabad.name, text: islamabad.text, icon: Icon2 },
      { name: lahore.name, text: lahore.text, icon: Icon3 },
    ],
    [karachi, islamabad, lahore]
  );

  const guestsText = useMemo(() => {
    const total = guests.adults + guests.children + guests.infants + guests.pets;
    if (!total) return "";

    const parts = [
      guests.adults ? `${guests.adults} ${t("adults")}` : "",
      guests.children ? `${guests.children} ${t("children")}` : "",
      guests.infants ? `${guests.infants} ${t("infants")}` : "",
      guests.pets ? `${guests.pets} ${t("pets")}` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }, [guests, t]);

  useEffect(() => {
    const isFormComplete =
      selectedDestination && dates && guests.adults + guests.children > 0;
    setIsSearchDisabled(!isFormComplete);
  }, [selectedDestination, dates, guests]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      if (currentScrollPos === 0) {
        setIsVisible(true);
      } else if (currentScrollPos > scrollPosition) {
        setSearchParams(null);
        setSearchVisible(false);
        setIsVisible(false);
      }

      setScrollPosition(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition, setSearchParams, setSearchVisible]);

  const handleSearch = () => {

    if (!dates?.length) return;

    const [startDate, endDate] = dates;

    const payload = {
      destination: selectedDestination,
      checkIn: startDate.format("YYYY-MM-DD"),
      checkOut: endDate.format("YYYY-MM-DD"),
      guests: guests.adults + guests.children + guests.infants + guests.pets,
    };
    console.log(payload);

    setSearchParams(payload);
    setHasActiveSearch(true);
  };

  const handleClearSearch = () => {
    setSelectedDestination("");
    setDates(null);
    setGuests({
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    });

    setSearchParams({});
    setHasActiveSearch(false);
  };


  const disableDates = (current) => {
    const today = new Date();
    return current && current < today.setHours(0, 0, 0, 0);
  };

  const GuestRow = ({ label, type }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 320,
        py: 0.5,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{label}</Typography>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          variant="outlined"
          onClick={() => decrementGuest(type)}
          disabled={guests[type] === 0}
          sx={{
            minWidth: 36,
            width: 36,
            height: 36,
            borderRadius: 999,
            fontWeight: 900,
          }}
        >
          -
        </Button>

        <Typography sx={{ width: 20, textAlign: "center", fontWeight: 800 }}>
          {guests[type]}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => incrementGuest(type)}
          sx={{
            minWidth: 36,
            width: 36,
            height: 36,
            borderRadius: 999,
            fontWeight: 900,
          }}
        >
          +
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box
      className={`${searchVisible
        ? !isVisible
        : isVisible
          ? "search-visible"
          : "search-hidden"
        }`}
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        pb: 2,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 980,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            px: 1,
            py: 0.6,
            backgroundColor: "white",
            boxShadow: "0 14px 45px rgba(0,0,0,0.08)",
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
            {/* WHERE */}
            <Box
              onClick={openWhereMenu}
              sx={{
                flex: 1.2,
                px: 2,
                py: 1.2,
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: 12 }}>
                {t("where")}
              </Typography>

              <TextField
                placeholder={t("destination")}
                variant="standard"
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{
                  mt: 0.2,
                  "& input": {
                    fontWeight: 700,
                    fontSize: 13,
                    color: selectedDestination ? "text.primary" : "text.secondary",
                    cursor: "pointer",
                  },
                }}
                value={selectedDestination}
                readOnly
              />
            </Box>

            {!isMobile && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* DATES */}
                <Box
                  sx={{
                    flex: 1.6,
                    px: 2,
                    py: 1.2,
                    borderRadius: 999,
                    transition: "all 0.18s ease",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: 12 }}>
                    {t("addDates")}
                  </Typography>

                  <Box sx={{ mt: 0.3 }}>
                    <RangePicker
                      value={dates}
                      allowClear={false}
                      onChange={(val) => setDates(val)}
                      placeholder={[t("checkIn"), t("checkOut")]}
                      disabledDate={disableDates}
                      format="DD MMM"
                      style={{
                        width: "100%",
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                      }}
                    />
                  </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                {/* GUESTS */}
                <Box
                  onClick={openGuestsMenu}
                  sx={{
                    flex: 1.2,
                    px: 2,
                    py: 1.2,
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: 12 }}>
                    {t("who")}
                  </Typography>

                  <TextField
                    placeholder={t("addGuests")}
                    variant="standard"
                    fullWidth
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      mt: 0.2,
                      "& input": {
                        fontWeight: 700,
                        fontSize: 13,
                        color: guestsText ? "text.primary" : "text.secondary",
                        cursor: "pointer",
                      },
                    }}
                    value={guestsText}
                    readOnly
                  />
                </Box>
              </>
            )}

            {/* SEARCH BUTTON */}
            <Box sx={{ pr: 0.8, display: "flex", alignItems: "center", gap: 1 }}>
              {hasActiveSearch && (
                <Button
                  onClick={handleClearSearch}
                  variant="text"
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 999,
                    px: 2,
                    color: "text.secondary",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  Clear
                </Button>
              )}

              <IconButton
                onClick={handleSearch}
                disabled={isSearchDisabled}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  backgroundColor: isSearchDisabled ? "#f3f4f6" : "#FF385C",
                  color: isSearchDisabled ? "#9ca3af" : "white",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    backgroundColor: isSearchDisabled ? "#f3f4f6" : "#e11d48",
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>

          </Stack>
        </Paper>

        {/* WHERE MENU */}
        <Menu
          anchorEl={whereAnchorEl}
          open={Boolean(whereAnchorEl)}
          onClose={closeWhereMenu}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
              p: 1,
              minWidth: 360,
            },
          }}
        >
          <Typography
            sx={{
              px: 2,
              pt: 1,
              pb: 1,
              fontWeight: 900,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Popular destinations
          </Typography>

          {cities.map((city) => (
            <MenuItem
              key={city.name}
              onClick={() => {
                setSelectedDestination(`${city.name}, ${t("country")}`);
                closeWhereMenu();
              }}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  src={city.icon}
                  variant="rounded"
                  sx={{ width: 44, height: 44, borderRadius: 2 }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                    {city.name}, {t("country")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {city.text}
                  </Typography>
                </Box>
              </Stack>
            </MenuItem>
          ))}
        </Menu>

        {/* GUESTS MENU */}
        <Menu
          anchorEl={guestsAnchorEl}
          open={Boolean(guestsAnchorEl)}
          onClose={closeGuestsMenu}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
              p: 1.5,
            },
          }}
        >
          <Typography sx={{ fontWeight: 900, mb: 1 }}>
            {t("who")}
          </Typography>

          <Stack spacing={1}>
            <GuestRow label={t("adults")} type="adults" />
            <Divider />
            <GuestRow label={t("children")} type="children" />
            <Divider />
            <GuestRow label={t("infants")} type="infants" />
            <Divider />
            <GuestRow label={t("pets")} type="pets" />
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1.5,
              gap: 1,
            }}
          >
            <Button
              onClick={() =>
                setGuests({
                  adults: 0,
                  children: 0,
                  infants: 0,
                  pets: 0,
                })
              }
              variant="text"
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 999,
                color: "text.secondary",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
            >
              Clear
            </Button>

            <Button
              onClick={closeGuestsMenu}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2.5,
                fontWeight: 900,
              }}
            >
              Done
            </Button>
          </Box>

        </Menu>
      </LocalizationProvider>
    </Box>
  );
};

export default SearchBar;
