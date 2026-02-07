import {
    Dialog,
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Stack,
    Paper,
    IconButton,
    Divider,
    Menu,
    MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState, useMemo } from "react";
import { useAppContext } from "../../context/context";
import { useTranslation } from "react-i18next";

import Icon1 from "../../assets/icons/icons1.png";
import Icon2 from "../../assets/icons/icons2.png";
import Icon3 from "../../assets/icons/icons3.png";

const GuestRow = ({ label, value, onAdd, onRemove }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={700}>{label}</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={onRemove} disabled={value === 0}>
                <RemoveIcon />
            </IconButton>

            <Typography fontWeight={900}>{value}</Typography>

            <IconButton onClick={onAdd}>
                <AddIcon />
            </IconButton>
        </Stack>
    </Stack>
);

const MobileSearchDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { setSearchParams } = useAppContext();

    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    const [guests, setGuests] = useState({
        adults: 0,
        children: 0,
        infants: 0,
        pets: 0,
    });

    const [destinationAnchor, setDestinationAnchor] = useState(null);

    const { karachi, islamabad, lahore } = t("cities");

    const cities = useMemo(
        () => [
            { name: karachi.name, text: karachi.text, icon: Icon1 },
            { name: islamabad.name, text: islamabad.text, icon: Icon2 },
            { name: lahore.name, text: lahore.text, icon: Icon3 },
        ],
        [karachi, islamabad, lahore]
    );

    const totalGuests =
        guests.adults + guests.children + guests.infants + guests.pets;

    const handleClearAll = () => {
        setDestination("");
        setCheckIn(null);
        setCheckOut(null);
        setGuests({ adults: 0, children: 0, infants: 0, pets: 0 });
        setSearchParams({});
    };

    const handleSearch = () => {
        setSearchParams({
            destination,
            checkIn: checkIn?.format("YYYY-MM-DD"),
            checkOut: checkOut?.format("YYYY-MM-DD"),
            guests: totalGuests,
        });
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog fullScreen open={open} onClose={onClose}>
                {/* HEADER */}
                <AppBar elevation={0} sx={{ background: "var(--bg-card)" }}>
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>

                        <Typography fontWeight={900}>Search</Typography>

                        <Button
                            startIcon={<RestartAltIcon />}
                            onClick={handleClearAll}
                            sx={{ fontWeight: 900 }}
                        >
                            Clear
                        </Button>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: 2.5, pt: 4 }}>
                    {/* DESTINATION */}
                    <Typography fontWeight={900} mb={1}>
                        Where
                    </Typography>

                    <Paper
                        onClick={(e) => setDestinationAnchor(e.currentTarget)}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            mb: 3,
                            fontWeight: 700,
                            cursor: "pointer",
                            backgroundColor: "var(--bg-input)",
                            border: "1px solid var(--border-light)",
                        }}
                    >
                        {destination || "Search destination"}
                    </Paper>

                    <Menu
                        anchorEl={destinationAnchor}
                        open={Boolean(destinationAnchor)}
                        onClose={() => setDestinationAnchor(null)}
                        PaperProps={{ sx: { borderRadius: 3 } }}
                    >
                        {cities.map((city) => (
                            <MenuItem
                                key={city.name}
                                onClick={() => {
                                    setDestination(`${city.name}, ${t("country")}`);
                                    setDestinationAnchor(null);
                                }}
                            >
                                {city.name}, {t("country")}
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* DATES */}
                    <Typography fontWeight={900} mb={1}>
                        Dates
                    </Typography>

                    <Stack spacing={2} mb={3}>
                        <DatePicker
                            label="Check-in"
                            value={checkIn}
                            onChange={setCheckIn}
                            disablePast
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: { backgroundColor: "var(--bg-input)", borderRadius: 2 },
                                },
                            }}
                        />

                        <DatePicker
                            label="Check-out"
                            value={checkOut}
                            onChange={setCheckOut}
                            disablePast
                            minDate={checkIn}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: { backgroundColor: "var(--bg-input)", borderRadius: 2 },
                                },
                            }}
                        />
                    </Stack>

                    {/* GUESTS */}
                    <Typography fontWeight={900} mb={1}>
                        Guests
                    </Typography>

                    <Paper
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            mb: 4,
                            backgroundColor: "var(--bg-input)",
                            border: "1px solid var(--border-light)",
                        }}
                    >
                        <Stack spacing={2}>
                            <GuestRow
                                label="Adults"
                                value={guests.adults}
                                onAdd={() => setGuests({ ...guests, adults: guests.adults + 1 })}
                                onRemove={() =>
                                    setGuests({ ...guests, adults: Math.max(0, guests.adults - 1) })
                                }
                            />
                            <Divider />
                            <GuestRow
                                label="Children"
                                value={guests.children}
                                onAdd={() =>
                                    setGuests({ ...guests, children: guests.children + 1 })
                                }
                                onRemove={() =>
                                    setGuests({
                                        ...guests,
                                        children: Math.max(0, guests.children - 1),
                                    })
                                }
                            />
                            <Divider />
                            <GuestRow
                                label="Infants"
                                value={guests.infants}
                                onAdd={() =>
                                    setGuests({ ...guests, infants: guests.infants + 1 })
                                }
                                onRemove={() =>
                                    setGuests({
                                        ...guests,
                                        infants: Math.max(0, guests.infants - 1),
                                    })
                                }
                            />
                            <Divider />
                            <GuestRow
                                label="Pets"
                                value={guests.pets}
                                onAdd={() => setGuests({ ...guests, pets: guests.pets + 1 })}
                                onRemove={() =>
                                    setGuests({ ...guests, pets: Math.max(0, guests.pets - 1) })
                                }
                            />
                        </Stack>
                    </Paper>

                    {/* SEARCH */}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ py: 1.6, borderRadius: 999, fontWeight: 900 }}
                        disabled={!destination || !checkIn || !checkOut || totalGuests === 0}
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </Box>
            </Dialog>
        </LocalizationProvider>
    );
};

export default MobileSearchDialog;
