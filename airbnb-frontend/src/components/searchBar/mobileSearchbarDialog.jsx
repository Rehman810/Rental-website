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
    Autocomplete,
    TextField,
    Chip,
    Avatar,
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
import { pakistanCities, normalizeCityName, getCityName, getCityText } from "../../constants/pakistanCities";

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

    const popularDestinations = useMemo(() =>
        pakistanCities.filter(city => city.popular).slice(0, 4),
        []);

    const getCityIcon = (city) => {
        const name = city?.name || "";
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) % 10000;
        }
        const icons = [Icon1, Icon2, Icon3];
        return icons[hash % 3];
    };

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

                        <Typography fontWeight={900}>{t("search")}</Typography>

                        <Button
                            startIcon={<RestartAltIcon />}
                            onClick={handleClearAll}
                            sx={{ fontWeight: 900 }}
                        >
                            {t("translation:clear")}
                        </Button>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: 2.5, pt: 4 }}>
                    {/* DESTINATION */}
                    <Typography fontWeight={900} mb={1}>
                        {t("translation:where")}
                    </Typography>

                    <Autocomplete
                        freeSolo
                        options={pakistanCities}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        value={destination}
                        onChange={(event, newValue) => {
                            if (typeof newValue === 'string') {
                                setDestination(normalizeCityName(newValue));
                            } else if (newValue && newValue.name) {
                                setDestination(`${newValue.name}, ${t("translation:country")}`);
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            if (event && event.type === 'change') {
                                setDestination(newInputValue);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={t("translation:destination")}
                                variant="outlined"
                                fullWidth
                                sx={{
                                    mb: 1.5,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        backgroundColor: "var(--bg-input)",
                                    },
                                }}
                            />
                        )}
                        renderOption={(props, option) => {
                            const cityName = getCityName(option, t);
                            const cityText = getCityText(option, t);
                            const cityIcon = getCityIcon(option);

                            return (
                                <li {...props} style={{ padding: 0 }}>
                                    <MenuItem
                                        sx={{
                                            width: "100%",
                                            borderRadius: 2,
                                            py: 1.2,
                                            px: 1.5,
                                            "&:hover": { backgroundColor: "var(--bg-secondary)" },
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Avatar
                                                src={cityIcon}
                                                variant="rounded"
                                                sx={{ width: 44, height: 44, borderRadius: 2 }}
                                            />
                                            <Box>
                                                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                                                    {cityName}, {t("translation:country")}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
                                                    {cityText}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </MenuItem>
                                </li>
                            );
                        }}
                    />

                    {/* Quick Picks */}
                    <Typography variant="caption" fontWeight={700} color="var(--text-secondary)" sx={{ mb: 1, display: 'block' }}>
                        {t("translation:popularDestinations")}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
                        {popularDestinations.map((city) => (
                            <Chip
                                key={city.name}
                                label={city.name}
                                onClick={() => setDestination(`${city.name}, ${t("translation:country")}`)}
                                sx={{ fontWeight: 700, borderRadius: 2, color: "var(--text-primary)" }}
                            />
                        ))}
                    </Stack>

                    {/* DATES */}
                    <Typography fontWeight={900} mb={1}>
                        {t("translation:addDates")}
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
                    <Typography fontWeight={900} mb={1} color="var(--text-primary)">
                        {t("translation:who")}
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
                                label={t("translation:adults")}
                                value={guests.adults}
                                onAdd={() => setGuests({ ...guests, adults: guests.adults + 1 })}
                                onRemove={() =>
                                    setGuests({ ...guests, adults: Math.max(0, guests.adults - 1) })
                                }
                            />
                            <Divider />
                            <GuestRow
                                label={t("translation:children")}
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
                                label={t("translation:infants")}
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
                                label={t("translation:pets")}
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
                        {t("search")}
                    </Button>
                </Box>
            </Dialog>
        </LocalizationProvider>
    );
};

export default MobileSearchDialog;
