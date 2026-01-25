import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Tooltip,
  Chip,
  Button,
  InputAdornment,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import useDocumentTitle from "../../hooks/dynamicTitle/dynamicTitle";
import { useNavigate } from "react-router-dom";
import { fetchDataById } from "../../config/ServiceApi/serviceApi";
import axios from 'axios';
import toast from 'react-hot-toast';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { Menu, MenuItem, Stack as MuiStack, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Switch, FormControlLabel } from "@mui/material"; // Stack already imported as Stack

const AvailabilityModal = ({ open, onClose, listing, token, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        minNights: listing.minNights ?? "",
        maxNights: listing.maxNights ?? "",
        allowSameDayBooking: listing.allowSameDayBooking, // boolean or undefined
        minNoticeDays: listing.minNoticeDays ?? "default",
        bookingWindowMonths: listing.bookingWindowMonths ?? "default",
        checkInFrom: listing.checkInFrom ?? "",
        checkOutBy: listing.checkOutBy ?? ""
      });
    }
  }, [listing]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        minNights: formData.minNights === "" ? null : Number(formData.minNights),
        maxNights: formData.maxNights === "" ? null : Number(formData.maxNights),
        allowSameDayBooking: formData.allowSameDayBooking === "default" ? null : formData.allowSameDayBooking === "true", // Handle select logic below
        minNoticeDays: formData.minNoticeDays === "default" ? null : Number(formData.minNoticeDays),
        bookingWindowMonths: formData.bookingWindowMonths === "default" ? null : Number(formData.bookingWindowMonths),
        checkInFrom: formData.checkInFrom === "" ? null : formData.checkInFrom,
        checkOutBy: formData.checkOutBy === "" ? null : formData.checkOutBy
      };

      // Fix allowSameDayBooking logic for payload
      // In state, I'll store it as 'default', 'true', 'false' string for Select, or just handle it carefully.
      // Let's refine state handling for Selects to be cleaner.

      await axios.put(`http://localhost:5000/listing/${listing._id}/availability`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Availability rules updated");
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // Helper for boolean/default select
  const getBoolValue = (val) => val === undefined || val === null ? "default" : (val ? "true" : "false");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800}>Availability Overrides</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          Leave fields empty or select "Host Default" to use your global settings.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Min Nights" type="number"
              value={formData.minNights}
              onChange={(e) => handleChange('minNights', e.target.value)}
              placeholder="Host Default"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Max Nights" type="number"
              value={formData.maxNights}
              onChange={(e) => handleChange('maxNights', e.target.value)}
              placeholder="Host Default"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>Allow Same Day Booking</InputLabel>
              <Select
                value={getBoolValue(formData.allowSameDayBooking)}
                onChange={(e) => handleChange('allowSameDayBooking', e.target.value === "default" ? undefined : (e.target.value === "true"))}
                label="Allow Same Day Booking"
                displayEmpty
              >
                <MenuItem value="default"><em>Use Host Default</em></MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel shrink>Min Notice</InputLabel>
              <Select
                value={formData.minNoticeDays}
                onChange={(e) => handleChange('minNoticeDays', e.target.value)}
                label="Min Notice"
                displayEmpty
              >
                <MenuItem value="default"><em>Use Host Default</em></MenuItem>
                <MenuItem value={0}>Same Day (0)</MenuItem>
                <MenuItem value={1}>1 Day</MenuItem>
                <MenuItem value={2}>2 Days</MenuItem>
                <MenuItem value={7}>7 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel shrink>Booking Window</InputLabel>
              <Select
                value={formData.bookingWindowMonths}
                onChange={(e) => handleChange('bookingWindowMonths', e.target.value)}
                label="Booking Window"
                displayEmpty
              >
                <MenuItem value="default"><em>Use Host Default</em></MenuItem>
                <MenuItem value={1}>1 Month</MenuItem>
                <MenuItem value={3}>3 Months</MenuItem>
                <MenuItem value={6}>6 Months</MenuItem>
                <MenuItem value={12}>12 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Check-in From" type="time"
              value={formData.checkInFrom}
              onChange={(e) => handleChange('checkInFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Check-out By" type="time"
              value={formData.checkOutBy}
              onChange={(e) => handleChange('checkOutBy', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save Overrides"}</Button>
      </DialogActions>
    </Dialog>
  );
};

const ListingPage = () => {
  const [listing, setListing] = useState([]);
  const [tempListing, setTempListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editingGuestRequirements, setEditingGuestRequirements] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useDocumentTitle("Listings - ThePakbnb");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetchDataById("listings", token, user?._id);
        setListing(response?.confirmedListings || []);
        setTempListing(response?.temporaryListings || []);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [token, user?._id]);

  const formatAddress = (item) => {
    if (!item) return "Address not available";

    const formatted = [item?.flat, item?.city, item?.postcode, item?.country]
      .filter(Boolean)
      .join(", ");

    return formatted || "Address not available";
  };

  const filteredConfirmed = useMemo(() => {
    if (!searchQuery?.trim()) return listing;
    const q = searchQuery.toLowerCase();
    return listing.filter((item) => item?.title?.toLowerCase().includes(q));
  }, [listing, searchQuery]);

  const filteredTemp = useMemo(() => {
    if (!searchQuery?.trim()) return tempListing;
    const q = searchQuery.toLowerCase();
    return tempListing.filter((item) => item?.title?.toLowerCase().includes(q));
  }, [tempListing, searchQuery]);

  const renderCardSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Skeleton variant="rectangular" width="100%" height={210} />
          <CardContent>
            <Skeleton variant="text" width="75%" height={30} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ));

  const ListingCard = ({ item, status }) => {
    const isVerified = status === "verified";
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClose = () => setAnchorEl(null);

    const handleUpdateMode = async (mode) => {
      handleClose();
      const toastId = toast.loading("Updating booking mode...");
      try {
        await axios.put(`http://localhost:5000/listing/${item._id}/booking-mode`, { bookingMode: mode }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Updated!", { id: toastId });
        // Refresh listings locally to see checkmark update
        // Simple way: Update local state. 
        // Better way: Re-fetch or update `listing` state.
        // For now, let's just force reload or update state manually.
        const updateList = (list) => list.map(l => l._id === item._id ? { ...l, bookingMode: mode === null ? undefined : mode } : l);
        setListing(prev => updateList(prev));
        setTempListing(prev => updateList(prev));

      } catch (e) {
        toast.error("Failed to update", { id: toastId });
      }
    };

    return (
      <Card
        onClick={() => navigate(`/rooms/${item._id}`)}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          cursor: "pointer",
          transition: "0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="210"
            image={item?.photos?.[0] || "/fallback-image.jpg"}
            alt={item?.title || "Listing"}
            sx={{ objectFit: "cover" }}
          />

          <Chip
            label={isVerified ? "Verified" : "Pending review"}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              borderRadius: "999px",
              fontWeight: 900,
              bgcolor: isVerified ? "rgba(0,0,0,0.85)" : "rgba(255,56,92,0.92)",
              color: "#fff",
            }}
          />

          <IconButton
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.9)", '&:hover': { bgcolor: "white" } }}
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={(e) => { e.stopPropagation(); handleClose(); }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={() => handleUpdateMode(null)}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                <Typography fontSize={13} fontWeight={!item.bookingMode ? 800 : 400}>Use Host Default</Typography>
                {!item.bookingMode && <CheckIcon fontSize="small" color="primary" />}
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => handleUpdateMode('instant')}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                <Typography fontSize={13} fontWeight={item.bookingMode === 'instant' ? 800 : 400}>Instant Book</Typography>
                {item.bookingMode === 'instant' && <CheckIcon fontSize="small" color="primary" />}
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => handleUpdateMode('request')}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                <Typography fontSize={13} fontWeight={item.bookingMode === 'request' ? 800 : 400}>Request to Book</Typography>
                {item.bookingMode === 'request' && <CheckIcon fontSize="small" color="primary" />}
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); setEditingAvailability(item); }}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                <Typography fontSize={13}>Availability Rules</Typography>
                {/* Show check if any override exists? */}
                {(item.minNights || item.maxNights || item.checkInFrom) && <CheckIcon fontSize="small" color="action" />}
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); setEditingGuestRequirements(item); }}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                <Typography fontSize={13}>Guest Requirements</Typography>
                {item.guestRequirementsOverride && Object.keys(item.guestRequirementsOverride).length > 0 && <CheckIcon fontSize="small" color="action" />}
              </Stack>
            </MenuItem>
          </Menu>
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight={900}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item?.title || "Untitled listing"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 38,
            }}
          >
            {formatAddress(item)}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              View →
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            py: 2,
          }}
        >
          {/* Left */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h5" fontWeight={900}>
              Your Listings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage verified and pending listings in one place.
            </Typography>
          </Box>

          {/* Right */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="stretch"
            sx={{
              width: { xs: "100%", md: "auto" },
              justifyContent: "flex-end",
            }}
          >
            <TextField
              placeholder="Search listings..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 260, md: 320 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  bgcolor: "#fafafa",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <Button
              variant="outlined"
              onClick={async () => {
                const confirm = window.confirm("This will reset ALL your listings to use your Host Settings default. Continue?");
                if (confirm) {
                  try {
                    await axios.post('http://localhost:5000/listings/migrate-modes', {}, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    window.location.reload();
                  } catch (e) { console.error(e); }
                }
              }}
              sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 800, color: "text.secondary" }}
            >
              Reset All Defaults
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/listingSteps")}
              sx={{
                width: { xs: "100%", sm: "auto" },
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 900,
                px: 2,
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              }}
            >
              New Listing
            </Button>
          </Stack>
        </Toolbar>

      </AppBar>

      {/* Body */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        {/* Confirmed */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>
            Confirmed Listings
          </Typography>
          <Chip
            label={`${filteredConfirmed?.length || 0} items`}
            variant="outlined"
            sx={{ borderRadius: "999px", fontWeight: 800 }}
          />
        </Stack>

        <Grid container spacing={2.5}>
          {loading ? (
            renderCardSkeletons()
          ) : filteredConfirmed.length === 0 ? (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight={900}>
                  No confirmed listings found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or create a new listing.
                </Typography>

                <Button
                  variant="contained"
                  sx={{ mt: 2, borderRadius: "999px", fontWeight: 900, textTransform: "none" }}
                  onClick={() => navigate("/listingSteps")}
                >
                  Create Listing
                </Button>
              </Paper>
            </Grid>
          ) : (
            filteredConfirmed.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <ListingCard item={item} status="verified" />
              </Grid>
            ))
          )}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Pending */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>
            Pending Verification
          </Typography>
          <Chip
            label={`${filteredTemp?.length || 0} items`}
            variant="outlined"
            sx={{ borderRadius: "999px", fontWeight: 800 }}
          />
        </Stack>

        <Grid container spacing={2.5}>
          {!loading && filteredTemp.length === 0 ? (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight={900}>
                  No pending listings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Everything looks good — no listings are waiting for review.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredTemp.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <ListingCard item={item} status="pending" />
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Availability Dialog */}
      <AvailabilityModal
        open={!!editingAvailability}
        onClose={() => setEditingAvailability(null)}
        listing={editingAvailability}
        token={token}
        onUpdate={() => window.location.reload()}
      />

      {/* Guest Requirements Dialog */}
      <GuestRequirementsModal
        open={!!editingGuestRequirements}
        onClose={() => setEditingGuestRequirements(null)}
        listing={editingGuestRequirements}
        token={token}
        onUpdate={() => window.location.reload()}
      />
    </Box>
  );
};

const GuestRequirementsModal = ({ open, onClose, listing, token, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        requireVerifiedPhone: listing.guestRequirementsOverride?.requireVerifiedPhone,
        requireCNIC: listing.guestRequirementsOverride?.requireCNIC,
        requireVerifiedEmail: listing.guestRequirementsOverride?.requireVerifiedEmail,
        requireProfilePhoto: listing.guestRequirementsOverride?.requireProfilePhoto,
        minAccountAgeDays: listing.guestRequirementsOverride?.minAccountAgeDays,
        requireCompletedProfile: listing.guestRequirementsOverride?.requireCompletedProfile
      });
    }
  }, [listing]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getSelectValue = (val) => val === undefined || val === null ? "default" : (val ? "true" : "false");

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        requireVerifiedPhone: formData.requireVerifiedPhone === undefined ? null : formData.requireVerifiedPhone,
        requireCNIC: formData.requireCNIC === undefined ? null : formData.requireCNIC,
        requireVerifiedEmail: formData.requireVerifiedEmail === undefined ? null : formData.requireVerifiedEmail,
        requireProfilePhoto: formData.requireProfilePhoto === undefined ? null : formData.requireProfilePhoto,
        requireCompletedProfile: formData.requireCompletedProfile === undefined ? null : formData.requireCompletedProfile,
        minAccountAgeDays: formData.minAccountAgeDays === undefined || formData.minAccountAgeDays === "" ? null : Number(formData.minAccountAgeDays)
      };

      await axios.put(`http://localhost:5000/listing/${listing._id}/guest-requirements`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Guest requirements updated");
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const BooleanOverride = ({ label, field }) => (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel shrink>{label}</InputLabel>
        <Select
          value={getSelectValue(formData[field])}
          onChange={(e) => handleChange(field, e.target.value === "default" ? undefined : (e.target.value === "true"))}
          label={label}
          displayEmpty
        >
          <MenuItem value="default"><em>Use Host Default</em></MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={800}>Guest Requirements Override</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          Override global host settings for this specific listing.
        </Typography>
        <Grid container spacing={2}>
          <BooleanOverride label="Require Verified Phone" field="requireVerifiedPhone" />
          <BooleanOverride label="Require Verified Email" field="requireVerifiedEmail" />
          <BooleanOverride label="Require CNIC Verification" field="requireCNIC" />
          <BooleanOverride label="Require Profile Photo" field="requireProfilePhoto" />
          <BooleanOverride label="Require Completed Profile" field="requireCompletedProfile" />

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Min Account Age (Days)" type="number"
              value={formData.minAccountAgeDays ?? ""}
              onChange={(e) => handleChange('minAccountAgeDays', e.target.value === "" ? undefined : e.target.value)}
              placeholder="Host Default"
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to use host default"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save Overrides"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListingPage;
