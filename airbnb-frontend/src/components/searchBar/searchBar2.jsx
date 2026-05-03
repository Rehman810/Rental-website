import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../language/Localization";

const SearchBar2 = () => {
  const { t } = useTranslation();
  const isRTL = useRTL();

  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { setSearchVisible } = useAppContext();
  const isMobile = useMediaQuery("(max-width:1100px)");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (currentScrollPos === 0) {
        setIsVisible(true);
      } else if (currentScrollPos > scrollPosition) {
        setIsVisible(false);
      }
      setScrollPosition(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollPosition]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setSearchVisible(true);
  };

  return (
    <RTLWrapper
      onClick={toggleVisibility}
      className={`${!isVisible ? "search-visible" : "search-hidden"}`}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "105%",
        paddingBottom: "20px",
        marginTop: "10px",
        [isRTL ? "marginRight" : "marginLeft"]: "100px",
      }}
    >
      {!isMobile && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: "40px",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
              backgroundColor: "var(--bg-card)",
              width: "100%",
              height: "40px",
              position: "relative",
              padding: "5px 20px",
            }}
          >
            <Box
              sx={{
                flex: 1,
                padding: "15px 16px",
                cursor: "pointer",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "12px" }}
              >
                {t("translation:anyWhere")}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ flex: 1, padding: "15px 16px" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "12px" }}
              >
                {t("translation:anyWeek")}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box
              sx={{
                flex: 1,
                padding: "15px 16px",
                cursor: "pointer",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "12px" }}
              >
                {t("translation:addGuests")}
              </Typography>
            </Box>

            <Box sx={{ [isRTL ? "marginRight" : "marginLeft"]: "8px" }}>
              <IconButton
                sx={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  "&:hover": { backgroundColor: "var(--primary-hover)" },
                  width: 30,
                  height: 30,
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      )}
    </RTLWrapper>
  );
};

export default SearchBar2;
