import React, { useEffect, useMemo, useState } from "react";
import { getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import { API_BASE_URL } from "../../config/env";
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
import usePageTitle from "../../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { fetchDataById } from "../../config/ServiceApi/serviceApi";
import axios from 'axios';
import toast from 'react-hot-toast';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { Menu, MenuItem, Stack as MuiStack, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Switch, FormControlLabel, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material"; // Stack already imported as Stack
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

import { useTranslation } from "react-i18next";
import { RTLWrapper, useRTL } from "../../components/language/Localization";
import apiClient from "../../config/ServiceApi/apiClient";

const BlockedDatesManagementModal = ({ open, onClose, listing, token, onUpdate }) => {
  const { t } = useTranslation("listings");
  const isRTL = useRTL();
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newBlockStart, setNewBlockStart] = useState(null);
  const [newBlockEnd, setNewBlockEnd] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing?.unavailableDates) {
      setUnavailableDates(listing.unavailableDates);
    } else {
      setUnavailableDates([]);
    }
  }, [listing]);

  const handleAddBlock = () => {
    if (!newBlockStart || !newBlockEnd) return toast.error("Select start and end dates");
    if (dayjs(newBlockEnd).isBefore(dayjs(newBlockStart))) return toast.error("End date must be after start date");

    const newBlock = {
      startDate: dayjs(newBlockStart).toISOString(),
      endDate: dayjs(newBlockEnd).toISOString()
    };
    setUnavailableDates([...unavailableDates, newBlock]);
    setNewBlockStart(null);
    setNewBlockEnd(null);
  };

  const handleDeleteBlock = (index) => {
    const updated = [...unavailableDates];
    updated.splice(index, 1);
    setUnavailableDates(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        unavailableDates: unavailableDates
      };
      await apiClient.put(`${API_BASE_URL}/listing/${listing._id}/availability`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t("blockedDatesUpdated"));
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t("failedUpdateBlocked"));
    } finally {
      setSaving(false);
    }
  };

  // Custom Day Render for Calendar
  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;

    // Check if day is blocked
    const isBlocked = unavailableDates.some(block =>
      dayjs(day).isBetween(dayjs(block.startDate), dayjs(block.endDate), 'day', '[]')
    );

    return (
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          ...(isBlocked && {
            backgroundColor: '#ff385c !important',
            color: 'white !important',
            borderRadius: '50%'
          })
        }}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: 4 } }}>
      <RTLWrapper>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={900} fontSize={18}>{t("manageBlockedDates")}</Typography>
          <Typography variant="body2" color="var(--text-secondary)">{t("blockDesc")}</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  slots={{ day: ServerDay }}
                  readOnly
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Box>
                  <Typography fontSize={12} fontWeight={900} color="var(--text-secondary)" gutterBottom>{t("addBlock")}</Typography>
                  <Stack spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker label={t("startDate")} value={newBlockStart} onChange={setNewBlockStart} />
                      <DatePicker label={t("endDate")} value={newBlockEnd} onChange={setNewBlockEnd} minDate={newBlockStart} />
                    </LocalizationProvider>
                    <Button variant="outlined" onClick={handleAddBlock} startIcon={<EventBusyIcon />}>{t("blockDates")}</Button>
                  </Stack>
                </Box>

                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <Typography fontSize={12} fontWeight={900} color="var(--text-secondary)" gutterBottom>{t("currentBlocks")}</Typography>
                  <List dense>
                    {unavailableDates.length === 0 && <Typography variant="caption" color="var(--text-secondary)">{t("noDatesBlocked")}</Typography>}
                    {unavailableDates.map((block, index) => (
                      <ListItem key={index} sx={{ bgcolor: 'var(--bg-secondary)', borderRadius: 2, mb: 1 }}>
                        <ListItemText
                          primary={`${dayjs(block.startDate).format('MMM D, YYYY')} - ${dayjs(block.endDate).format('MMM D, YYYY')}`}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small" onClick={() => handleDeleteBlock(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>{t("back")}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ borderRadius: "999px", px: 3 }}>
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </DialogActions>
      </RTLWrapper>
    </Dialog>
  );
};

const AvailabilityModal = ({ open, onClose, listing, token, onUpdate }) => {
  const { t } = useTranslation("listings");
  const isRTL = useRTL();
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

      await apiClient.put(`${API_BASE_URL}/listing/${listing._id}/availability`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t("availabilityUpdated"));
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t("failedUpdate"));
    } finally {
      setSaving(false);
    }
  };

  // Helper for boolean/default select
  const getBoolValue = (val) => val === undefined || val === null ? "default" : (val ? "true" : "false");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 4,
        },
      }}
    >
      <RTLWrapper>
        {/* Header */}
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={900} fontSize={18}>
            {t("availabilityOverrides")}
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
            {t("availabilityDesc")}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          {/* Stay Length */}
          <Box sx={{ mb: 3 }}>
            <Typography fontSize={12} fontWeight={900} color="var(--text-secondary)" gutterBottom>
              {t("stayLength")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("minNights")}
                  type="number"
                  value={formData.minNights}
                  onChange={(e) => handleChange("minNights", e.target.value)}
                  placeholder={t("hostDefault")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("maxNights")}
                  type="number"
                  value={formData.maxNights}
                  onChange={(e) => handleChange("maxNights", e.target.value)}
                  placeholder={t("hostDefault")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Booking Rules */}
          <Box sx={{ mb: 3 }}>
            <Typography fontSize={12} fontWeight={900} color="var(--text-secondary)" gutterBottom>
              {t("bookingRules")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel shrink>{t("allowSameDay")}</InputLabel>
                  <Select
                    value={getBoolValue(formData.allowSameDayBooking)}
                    onChange={(e) =>
                      handleChange(
                        "allowSameDayBooking",
                        e.target.value === "default"
                          ? undefined
                          : e.target.value === "true"
                      )
                    }
                    displayEmpty
                  >
                    <MenuItem value="default">
                      <em>{t("useHostDefault")}</em>
                    </MenuItem>
                    <MenuItem value="true">{t("translation:yes")}</MenuItem>
                    <MenuItem value="false">{t("translation:no")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel shrink>{t("minNotice")}</InputLabel>
                  <Select
                    value={formData.minNoticeDays}
                    onChange={(e) => handleChange("minNoticeDays", e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="default">
                      <em>{t("useHostDefault")}</em>
                    </MenuItem>
                    <MenuItem value={0}>Same day</MenuItem>
                    <MenuItem value={1}>1 day</MenuItem>
                    <MenuItem value={2}>2 days</MenuItem>
                    <MenuItem value={7}>7 days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel shrink>{t("bookingWindow")}</InputLabel>
                  <Select
                    value={formData.bookingWindowMonths}
                    onChange={(e) =>
                      handleChange("bookingWindowMonths", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="default">
                      <em>{t("useHostDefault")}</em>
                    </MenuItem>
                    <MenuItem value={1}>1 month</MenuItem>
                    <MenuItem value={3}>3 months</MenuItem>
                    <MenuItem value={6}>6 months</MenuItem>
                    <MenuItem value={12}>12 months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Check-in / Check-out */}
          <Box>
            <Typography fontSize={12} fontWeight={900} color="var(--text-secondary)" gutterBottom>
              {t("checkInAndOut")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("checkInFrom")}
                  type="time"
                  value={formData.checkInFrom}
                  onChange={(e) => handleChange("checkInFrom", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={t("checkOutBy")}
                  type="time"
                  value={formData.checkOutBy}
                  onChange={(e) => handleChange("checkOutBy", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {t("back")}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: "999px",
              px: 3,
            }}
          >
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </DialogActions>
      </RTLWrapper>
    </Dialog>

  );
};

const CancellationPolicyModal = ({ open, onClose, listing, token, onUpdate }) => {
  const { t } = useTranslation("listings");
  const isRTL = useRTL();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);

  // Custom Flow
  const [customName, setCustomName] = useState("");
  const [fullRefundHours, setFullRefundHours] = useState(24);
  const [partialEnabled, setPartialEnabled] = useState(false);
  const [partialPercent, setPartialPercent] = useState(50);
  const [partialHours, setPartialHours] = useState(24);

  useEffect(() => {
    if (open) fetchPolicies();
  }, [open]);

  useEffect(() => {
    if (listing?.cancellationPolicy) {
      const pid = typeof listing.cancellationPolicy === 'object' ? listing.cancellationPolicy._id : listing.cancellationPolicy;
      setSelectedPolicyId(pid);
    }
  }, [listing]);

  const fetchPolicies = async () => {
    try {
      const res = await apiClient.get(`${API_BASE_URL}/api/cancellation-policies`, { headers: { Authorization: `Bearer ${token}` } });
      setPolicies(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateCustom = async () => {
    if (!customName) return toast.error("Name required");
    const payload = {
      type: 'CUSTOM',
      name: customName,
      rules: {
        fullRefundHours: Number(fullRefundHours),
        partialRefundBeforeCheckIn: {
          enabled: partialEnabled,
          percentage: Number(partialPercent),
          hoursBeforeCheckIn: Number(partialHours)
        },
        noRefundAfterCheckIn: true
      }
    };
    try {
      const res = await apiClient.post(`${API_BASE_URL}/api/cancellation-policies`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setPolicies([...policies, res.data]);
      setSelectedPolicyId(res.data._id);
      setCreatingCustom(false);
      toast.success("Custom policy created");
    } catch (e) { toast.error("Failed to create policy"); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`${API_BASE_URL}/listing/${listing._id}/cancellation-policy`, { policyId: selectedPolicyId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t("policyUpdated"));
      onUpdate();
      onClose();
    } catch (e) { toast.error(t("failedPolicyUpdate")); }
    finally { setLoading(false); }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 4,
        },
      }}
    >
      <RTLWrapper>
        {/* Header */}
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={900} fontSize={18}>
            {t("cancellationPolicy")}
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
            {t("cancellationDesc")}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          {!creatingCustom ? (
            <Stack spacing={3}>
              {/* Select Policy */}
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={900}
                  color="var(--text-secondary)"
                  gutterBottom
                  mb={2}
                >
                  {t("selectPolicy")}
                </Typography>

                <FormControl fullWidth>
                  <InputLabel shrink>Policy</InputLabel>
                  <Select
                    value={selectedPolicyId || ""}
                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                    displayEmpty
                  >
                    {policies.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        <Stack spacing={0.4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography fontWeight={800}>{p.name}</Typography>
                            {p.type === "CUSTOM" && (
                              <Chip
                                label="Custom"
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Stack>
                          <Typography
                            variant="caption"
                            color="var(--text-secondary)"
                            sx={{ whiteSpace: "normal" }}
                          >
                            {p.description ||
                              `Free cancellation within ${p.rules?.fullRefundHours} hours`}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ fontSize: 12, fontWeight: 800 }}>OR</Divider>

              {/* Create Custom */}
              <Button
                variant="outlined"
                onClick={() => setCreatingCustom(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "999px",
                  alignSelf: "flex-start",
                }}
              >
                {t("createCustomPolicy")}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3}>
              {/* Custom Policy */}
              <Box>
                <Typography
                  fontSize={12}
                  fontWeight={900}
                  color="var(--text-secondary)"
                  gutterBottom
                >
                  {t("customPolicyDetails")}
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label={t("policyName")}
                    fullWidth
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Weekend Friendly"
                  />

                  <TextField
                    label={t("fullRefundPeriod")}
                    type="number"
                    fullWidth
                    value={fullRefundHours}
                    onChange={(e) => setFullRefundHours(e.target.value)}
                  />
                </Stack>
              </Box>

              {/* Partial Refund */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={partialEnabled}
                      onChange={(e) => setPartialEnabled(e.target.checked)}
                    />
                  }
                  label={
                    <Typography fontWeight={700}>
                      {t("enablePartialRefund")}
                    </Typography>
                  }
                />

                {partialEnabled && (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label={t("refundPercent")}
                      type="number"
                      fullWidth
                      value={partialPercent}
                      onChange={(e) => setPartialPercent(e.target.value)}
                    />
                    <TextField
                      label={t("hoursBeforeCheckIn")}
                      type="number"
                      fullWidth
                      value={partialHours}
                      onChange={(e) => setPartialHours(e.target.value)}
                    />
                  </Stack>
                )}
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  onClick={() => setCreatingCustom(false)}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  {t("back")}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateCustom}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: "999px",
                    px: 3,
                  }}
                >
                  {t("createPolicy")}
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {t("back")}
          </Button>

          {!creatingCustom && (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading || !selectedPolicyId}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: "999px",
                px: 3,
              }}
            >
              {loading ? t("saving") : t("savePolicy")}
            </Button>
          )}
        </DialogActions>
      </RTLWrapper>
    </Dialog>
  );
};


const ListingPage = () => {
  const { t } = useTranslation(["translation", "listings"]);
  const [listing, setListing] = useState([]);
  const [tempListing, setTempListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editingGuestRequirements, setEditingGuestRequirements] = useState(null);
  const [editingCancellation, setEditingCancellation] = useState(null);
  const [editingBlockedDates, setEditingBlockedDates] = useState(null);
  const [editingAiAssistant, setEditingAiAssistant] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  usePageTitle(t("menu.hostMenu.listings"));

  const isRTL = useRTL();

  const token = getAuthToken();
  const user = getAuthUser();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetchDataById("listings", user?._id);
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
    if (!item) return t("listings:addressNotAvailable");

    const formatted = [item?.flat, item?.city, item?.postcode, item?.country]
      .filter(Boolean)
      .join(", ");

    return formatted || t("listings:addressNotAvailable");
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

  const MenuRow = ({ label, active = false, checked = false }) => (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Typography
        fontSize={13}
        fontWeight={active ? 800 : 500}
        color={active ? "var(--text-primary)" : "var(--text-secondary)"}
      >
        {label}
      </Typography>

      {(active || checked) && (
        <CheckIcon fontSize="small" color="var(--text-primary)" />
      )}
    </Stack>
  );

  const ListingCard = ({ item, status, showIcon = true }) => {
    const isVerified = item.status === "active";
    const isDisabled = item.status === "disabled";
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClose = () => setAnchorEl(null);

    const handleUpdateMode = async (mode) => {
      handleClose();
      const toastId = toast.loading(t("updatingBookingMode"));
      try {
        await apiClient.put(`${API_BASE_URL}/listing/${item._id}/booking-mode`, { bookingMode: mode }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t("updated"), { id: toastId });
        reloadListings();
      } catch (e) {
        toast.error(t("failedUpdate"), { id: toastId });
      }
    };

    const handleUpdateStatus = async (newStatus) => {
      handleClose();
      const toastId = toast.loading(t("settingStatus", { status: newStatus }));
      try {
        await apiClient.put(`${API_BASE_URL}/listing/${item._id}/availability`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t("statusUpdated"), { id: toastId });
        reloadListings();
      } catch (e) {
        console.error(e);
        toast.error(t("failedUpdate"), { id: toastId });
      }
    };

    const reloadListings = () => {
      window.location.reload();
    };

    return (
      <Card
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
            height="150"
            image={item?.photos?.[0] || "/fallback-image.jpg"}
            alt={item?.title || "Listing"}
            sx={{ objectFit: "cover" }}
          />

          <Chip
            label={isDisabled ? t("hosting.listings.disabled") : (item.status === 'active' ? t("hosting.listings.active") : t("hosting.listings.pending"))}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              [isRTL ? "right" : "left"]: 12,
              zIndex: 5,
              borderRadius: "999px",
              fontWeight: 900,
              bgcolor: isDisabled ? "var(--text-secondary)" : (item.status === 'active' ? "rgba(0,0,0,0.85)" : "rgba(255,56,92,0.92)"),
              color: "#fff",
            }}
          />

          {showIcon && <IconButton
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.9)", '&:hover': { bgcolor: "white" } }}
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                borderRadius: 3,
                minWidth: 240,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 18px 60px rgba(0,0,0,0.12)",
                overflow: "hidden",
              },
            }}
          >
            {/* Section: Booking Mode */}
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography fontSize={11} fontWeight={900} color="var(--text-secondary)">
                {t("bookingMode")}
              </Typography>
            </Box>

            <MenuItem onClick={() => handleUpdateMode(null)}>
              <MenuRow
                label={t("useHostDefault")}
                active={!item.bookingMode}
              />
            </MenuItem>

            <MenuItem onClick={() => handleUpdateMode("instant")}>
              <MenuRow
                label={t("instantBook")}
                active={item.bookingMode === "instant"}
              />
            </MenuItem>

            <MenuItem onClick={() => handleUpdateMode("request")}>
              <MenuRow
                label={t("requestToBook")}
                active={item.bookingMode === "request"}
              />
            </MenuItem>

            <Divider />

            {/* Section: Rules */}
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography fontSize={11} fontWeight={900} color="var(--text-secondary)">
                {t("listingRules")}
              </Typography>
            </Box>

            <MenuItem onClick={() => { handleClose(); setEditingAvailability(item); }}>
              <MenuRow
                label={t("availabilityRules")}
                checked={item.minNights || item.maxNights || item.checkInFrom}
              />
            </MenuItem>

            <MenuItem onClick={() => { handleClose(); setEditingGuestRequirements(item); }}>
              <MenuRow
                label={t("guestRequirements")}
                checked={item.guestRequirementsOverride && Object.keys(item.guestRequirementsOverride).length > 0}
              />
            </MenuItem>

            <MenuItem onClick={() => { handleClose(); setEditingBlockedDates(item); }}>
              <MenuRow
                label={t("blockDates")}
                checked={item.unavailableDates && item.unavailableDates.length > 0}
              />
            </MenuItem>

            <Divider />

            {/* Section: Status */}
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography fontSize={11} fontWeight={900} color="var(--text-secondary)">
                {t("status")}
              </Typography>
            </Box>

            <MenuItem onClick={() => handleUpdateStatus("active")}>
              <MenuRow
                label={t("active")}
                active={item.status === 'active'}
              />
            </MenuItem>

            <MenuItem onClick={() => handleUpdateStatus("disabled")}>
              <MenuRow
                label={t("disabled")}
                active={item.status === 'disabled'}
              />
            </MenuItem>

            <MenuItem onClick={() => { handleClose(); setEditingCancellation(item); }}>
              <MenuRow
                label={t("cancellationPolicy")}
                checked={!!item.cancellationPolicy}
              />
            </MenuItem>

            <Divider />

            {/* Section: AI Assistant */}
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography fontSize={11} fontWeight={900} color="var(--text-secondary)">
                {t("aiAssistant")}
              </Typography>
            </Box>

            <MenuItem onClick={() => { handleClose(); setEditingAiAssistant(item); }}>
              <MenuRow
                label={t("hostAssistant")}
                checked={item.autoReplyEnabled}
              />
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
            color="var(--text-secondary)"
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

          {showIcon && <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }} onClick={() => navigate(`/hosting/listings/${item._id}`)}>
            <Typography variant="caption" color="var(--text-secondary)" fontWeight={800}>
              {t("hosting.listings.view")} →
            </Typography>
          </Stack>}
        </CardContent>
      </Card>
    );
  };

  return (
    <RTLWrapper sx={{ bgcolor: "var(--bg-primary)", minHeight: "100vh" }}>
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
          <Box sx={{ textAlign: isRTL ? { xs: "center", md: "right" } : { xs: "center", md: "left" } }}>
            <Typography variant="h5" fontWeight={900}>
              {t("hosting.listings.title")}
            </Typography>
            <Typography variant="body2" color="var(--text-secondary)">
              {t("hosting.listings.desc")}
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
              placeholder={t("hosting.listings.searchPlaceholder")}
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 260, md: 320 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  bgcolor: "var(--bg-secondary)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "var(--text-secondary)", [isRTL ? "ml" : "mr"]: 1 }} />
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
                const confirm = window.confirm(t("hosting.listings.resetConfirm"));
                if (confirm) {
                  try {
                    await apiClient.post(`${API_BASE_URL}/listings/migrate-modes`, {}, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    window.location.reload();
                  } catch (e) { console.error(e); }
                }
              }}
              sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 800, color: "var(--text-secondary)" }}
            >
              {t("hosting.listings.resetAll")}
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
                flexDirection: isRTL ? "row-reverse" : "row"
              }}
            >
              {t("hosting.listings.newListing")}
            </Button>
          </Stack>
        </Toolbar>

      </AppBar>

      {/* Body */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        {/* Confirmed */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>
            {t("hosting.listings.confirmed")}
          </Typography>
          <Chip
            label={`${filteredConfirmed?.length || 0} ${t("items")}`}
            variant="outlined"
            sx={{
              borderRadius: "999px",
              fontWeight: 800,

              color: "var(--text-secondary)",
              borderColor: "var(--border-light)",
              bgcolor: "transparent",
            }} />
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
                  {t("hosting.listings.noConfirmed")}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 1 }}>
                  {t("hosting.listings.noConfirmedDesc")}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ mt: 2, borderRadius: "999px", fontWeight: 900, textTransform: "none" }}
                  onClick={() => navigate("/listingSteps")}
                >
                  {t("hosting.createListing")}
                </Button>
              </Paper>
            </Grid>
          ) : (
            filteredConfirmed.map((item) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={item._id}>
                <ListingCard item={item} status="verified" />
              </Grid>
            ))
          )}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Pending */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>
            {t("hosting.listings.pendingVerification")}
          </Typography>
          <Chip
            label={`${filteredTemp?.length || 0} ${t("items")}`}
            variant="outlined"
            sx={{
              borderRadius: "999px",
              fontWeight: 800,

              color: "var(--text-secondary)",
              borderColor: "var(--border-light)",
              bgcolor: "transparent",
            }} />
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
                  {t("noPending")}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 1 }}>
                  {t("everythingLooksGood")}
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

      {/* Cancellation Policy Dialog */}
      <CancellationPolicyModal
        open={!!editingCancellation}
        onClose={() => setEditingCancellation(null)}
        listing={editingCancellation}
        token={token}
        onUpdate={() => window.location.reload()}
      />
      {/* Blocked Dates Dialog */}
      <BlockedDatesManagementModal
        open={!!editingBlockedDates}
        onClose={() => setEditingBlockedDates(null)}
        listing={editingBlockedDates}
        token={token}
        onUpdate={() => window.location.reload()}
      />

      {/* AI Assistant Dialog */}
      <AiAssistantModal
        open={!!editingAiAssistant}
        onClose={() => setEditingAiAssistant(null)}
        listing={editingAiAssistant}
        token={token}
        onUpdate={() => window.location.reload()}
      />

    </RTLWrapper>
  );
};

const GuestRequirementsModal = ({ open, onClose, listing, token, onUpdate }) => {
  const { t } = useTranslation("listings");
  const isRTL = useRTL();
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

      await apiClient.put(`${API_BASE_URL}/listing/${listing._id}/guest-requirements`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t("availabilityUpdated")); // Reusing similar message
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t("failedUpdate"));
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
          <MenuItem value="default"><em>{t("useHostDefault")}</em></MenuItem>
          <MenuItem value="true">{t("translation:yes")}</MenuItem>
          <MenuItem value="false">{t("translation:no")}</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <RTLWrapper>
        <DialogTitle fontWeight={800}>{t("guestRequirementsOverride")}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="var(--text-secondary)" paragraph>
            {t("guestRequirementsDesc")}
          </Typography>
          <Grid container spacing={2}>
            <BooleanOverride label={t("requireVerifiedPhone")} field="requireVerifiedPhone" />
            <BooleanOverride label={t("requireVerifiedEmail")} field="requireVerifiedEmail" />
            <BooleanOverride label={t("requireCnicVerification")} field="requireCNIC" />
            <BooleanOverride label={t("requireProfilePhoto")} field="requireProfilePhoto" />
            <BooleanOverride label={t("requireCompletedProfile")} field="requireCompletedProfile" />

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label={t("minAccountAge")} type="number"
                value={formData.minAccountAgeDays ?? ""}
                onChange={(e) => handleChange('minAccountAgeDays', e.target.value === "" ? undefined : e.target.value)}
                placeholder={t("hostDefault")}
                InputLabelProps={{ shrink: true }}
                helperText={t("leaveEmptyDefault")}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("back")}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? t("saving") : t("saveOverrides")}</Button>
        </DialogActions>
      </RTLWrapper>
    </Dialog>
  );
};

const AiAssistantModal = ({ open, onClose, listing, token, onUpdate }) => {
  const { t } = useTranslation("listings");
  const isRTL = useRTL();
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setAutoReplyEnabled(listing.autoReplyEnabled || false);
    }
  }, [listing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`${API_BASE_URL}/listing/${listing._id}/ai-assistant`,
        { autoReplyEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("availabilityUpdated"));
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t("failedUpdate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ "& .MuiPaper-root": { borderRadius: 4 } }}>
      <RTLWrapper>
        <DialogTitle fontWeight={800}>{t("hostAssistant")}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="var(--text-secondary)" paragraph>
            {t("hostAssistantDesc")}
          </Typography>

          <Box sx={{ py: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoReplyEnabled}
                  onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={700}>{t("autoReply")}</Typography>
                  <Typography variant="caption" color="var(--text-secondary)">{autoReplyEnabled ? t("aiWillReply") : t("manualRepliesOnly")}</Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 999 }}>{t("back")}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ borderRadius: 999, px: 3 }}>
            {saving ? t("saving") : t("saveSettings")}
          </Button>
        </DialogActions>
      </RTLWrapper>
    </Dialog>
  );
};

export default ListingPage;
