import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import HotelIcon from "@mui/icons-material/Hotel";
import KeyIcon from "@mui/icons-material/Key";
import SellIcon from "@mui/icons-material/Sell";
import { useAppContext } from "../../context/context";

const StyledPaper = styled(Paper)(({ theme, selected }) => ({
    padding: theme.spacing(3),
    cursor: "pointer",
    border: selected ? "2px solid #222" : "1px solid #ddd",
    backgroundColor: selected ? "#F7F7F7" : "white",
    transition: "all 0.3s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "12px",
    width: "100%",
    margin: "0 auto",
    "&:hover": {
        borderColor: "#222",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
}));

const listingTypes = [
    {
        id: "SHORT_TERM",
        name: "Short Term Rental",
        text: "Host guests for nightly stays.",
        icon: <HotelIcon fontSize="large" sx={{ color: "#FF385C" }} />
    },
    {
        id: "LONG_TERM",
        name: "Monthly Lease",
        text: "Long-term rentals with leases & deposits.",
        icon: <KeyIcon fontSize="large" sx={{ color: "#FF385C" }} />
    },
    {
        id: "FOR_SALE",
        name: "Property Sale",
        text: "List your property for sale to buyers.",
        icon: <SellIcon fontSize="large" sx={{ color: "#FF385C" }} />
    },
];

const ListingTypeSelection = () => {
    const { setListingType, listingType } = useAppContext();
    const [selected, setSelected] = useState(listingType || "SHORT_TERM");

    const select = (type) => {
        setSelected(type);
        setListingType(type);
    };

    useEffect(() => {
        if (listingType && listingType !== selected) {
            setSelected(listingType);
        }
    }, [listingType]);

    return (
        <Box sx={{ py: 6, px: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" fontWeight="800" gutterBottom textAlign="center" sx={{ mb: 1 }}>
                What kind of listing is this?
            </Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center" sx={{ mb: 5 }}>
                Choose the model that best fits your needs.
            </Typography>

            <Stack spacing={3} alignItems="center">
                {listingTypes.map((type) => (
                    <Box width="100%" maxWidth="600px" key={type.id}>
                        <StyledPaper
                            selected={selected === type.id}
                            onClick={() => select(type.id)}
                            elevation={selected === type.id ? 4 : 0}
                        >
                            <Box>
                                <Typography variant="h6" fontWeight="700">
                                    {type.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    {type.text}
                                </Typography>
                            </Box>
                            <Box sx={{
                                bgcolor: selected === type.id ? "rgba(255, 56, 92, 0.1)" : "transparent",
                                p: 1.5,
                                borderRadius: "50%"
                            }}>
                                {type.icon}
                            </Box>
                        </StyledPaper>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default ListingTypeSelection;
