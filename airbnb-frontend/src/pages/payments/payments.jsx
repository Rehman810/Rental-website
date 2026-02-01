import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Avatar,
    Tooltip,
} from "@mui/material";
import { fetchData, postData } from "../../config/ServiceApi/serviceApi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PaymentsIcon from "@mui/icons-material/Payments";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import toast from "react-hot-toast";

const Payments = () => {
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [status, setStatus] = useState({
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        const getStatus = async () => {
            try {
                const data = await fetchData("api/stripe/status", token);
                setStatus(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getStatus();
    }, [token]);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            const response = await postData("api/stripe/connect", {}, token);
            if (response?.url) window.location.href = response.url;
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate connection");
        } finally {
            setConnecting(false);
        }
    };

    const isConnected = useMemo(() => {
        return (
            status.charges_enabled &&
            status.payouts_enabled &&
            status.details_submitted
        );
    }, [status]);

    const statusConfig = useMemo(() => {
        if (isConnected) {
            return {
                label: "Payouts Active",
                color: "success",
                icon: <CheckCircleIcon />,
                description:
                    "Your Stripe account is fully verified and payouts are enabled.",
            };
        }

        if (status.details_submitted) {
            return {
                label: "Pending Verification",
                color: "warning",
                icon: <ErrorIcon />,
                description:
                    "Stripe is reviewing your details. This usually takes a short time.",
            };
        }

        return {
            label: "Action Required",
            color: "error",
            icon: <ErrorIcon />,
            description:
                "Complete Stripe onboarding to enable payouts and start receiving funds.",
        };
    }, [isConnected, status.details_submitted]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "55vh",
                    display: "grid",
                    placeItems: "center",
                    p: 4,
                }}
            >
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography variant="body2" color="var(--text-secondary)">
                        Loading payment settings...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    background:
                        "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(156,39,176,0.06))",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 46,
                                height: 46,
                                bgcolor: "primary.main",
                                boxShadow: "0 10px 30px rgba(25,118,210,0.25)",
                            }}
                        >
                            <PaymentsIcon />
                        </Avatar>

                        <Box>
                            <Typography variant="h5" fontWeight={800}>
                                Payments & Payouts
                            </Typography>
                            <Typography variant="body2" color="var(--text-secondary)">
                                Connect Stripe to securely manage onboarding, verification, and
                                payouts.
                            </Typography>
                        </Box>
                    </Stack>

                    <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        sx={{
                            px: 1,
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: "0.95rem",
                        }}
                    />
                </Stack>
            </Paper>

            {/* Main Card */}
            <Paper
                elevation={0}
                sx={{
                    mt: 3,
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack spacing={2.2}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            Stripe Connect Status
                        </Typography>
                        <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
                            {statusConfig.description}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Requirements */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="var(--text-secondary)"
                            sx={{ mb: 1.2 }}
                        >
                            Requirements
                        </Typography>

                        <Stack spacing={1.2}>
                            <RequirementRow
                                title="Charges Enabled"
                                ok={status.charges_enabled}
                                hint="Allows you to accept payments from customers."
                            />
                            <RequirementRow
                                title="Payouts Enabled"
                                ok={status.payouts_enabled}
                                hint="Allows Stripe to send payouts to your bank."
                            />
                            <RequirementRow
                                title="Details Submitted"
                                ok={status.details_submitted}
                                hint="Identity and business details are submitted for verification."
                            />
                        </Stack>
                    </Box>

                    {/* CTA */}
                    {!isConnected && (
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2.5,
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "rgba(25,118,210,0.04)",
                                display: "flex",
                                alignItems: { xs: "stretch", sm: "center" },
                                justifyContent: "space-between",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Typography fontWeight={800}>
                                    {status.details_submitted
                                        ? "Finish your Stripe onboarding"
                                        : "Connect your Stripe account"}
                                </Typography>
                                <Typography variant="body2" color="var(--text-secondary)">
                                    {status.details_submitted
                                        ? "Continue from where you left off to enable payouts."
                                        : "It takes only a minute to get started."}
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                onClick={handleConnect}
                                disabled={connecting}
                                endIcon={
                                    connecting ? null : <ArrowForwardIcon />
                                }
                                sx={{
                                    borderRadius: 2,
                                    px: 2.5,
                                    py: 1.1,
                                    fontWeight: 800,
                                    textTransform: "none",
                                    boxShadow: "0 12px 30px rgba(25,118,210,0.25)",
                                    "&:hover": {
                                        transform: connecting ? "none" : "translateY(-1px)",
                                        boxShadow: connecting
                                            ? "0 12px 30px rgba(25,118,210,0.25)"
                                            : "0 16px 35px rgba(25,118,210,0.35)",
                                    },
                                    transition: "all 0.18s ease",
                                }}
                            >
                                {connecting ? (
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                        <CircularProgress size={18} color="inherit" />
                                        <span>Redirecting...</span>
                                    </Stack>
                                ) : status.details_submitted ? (
                                    "Continue Onboarding"
                                ) : (
                                    "Connect with Stripe"
                                )}
                            </Button>

                        </Box>
                    )}

                    {isConnected && (
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2.5,
                                border: "1px solid",
                                borderColor: "rgba(46,125,50,0.25)",
                                backgroundColor: "rgba(46,125,50,0.06)",
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <CheckCircleIcon color="success" />
                                <Box>
                                    <Typography fontWeight={800}>
                                        Stripe is fully connected 🎉
                                    </Typography>
                                    <Typography variant="body2" color="var(--text-secondary)">
                                        You’re good to go — payouts will be processed automatically
                                        based on Stripe schedule.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
};

const RequirementRow = ({ title, ok, hint }) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.4,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Stack spacing={0.2}>
                <Typography fontWeight={800}>{title}</Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                    {hint}
                </Typography>
            </Stack>

            <Tooltip title={ok ? "Completed" : "Not completed"} arrow>
                <Chip
                    icon={ok ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={ok ? "Done" : "Missing"}
                    color={ok ? "success" : "error"}
                    variant={ok ? "filled" : "outlined"}
                    sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        minWidth: 110,
                        justifyContent: "center",
                    }}
                />
            </Tooltip>
        </Box>
    );
};

export default Payments;
